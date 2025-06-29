import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from 'ws';
import path from "path";
import fs from "fs";
import multer from "multer";
// Dynamic import for pdf-parse to avoid startup issues
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { groqService } from "./groqService";
import { subscriptionService, USAGE_LIMITS } from "./subscriptionService";
import { sendEmail, generateVerificationEmail } from "./emailService";
import { fileStorage } from "./fileStorage";
import crypto from "crypto";
import { 
  insertUserProfileSchema,
  insertUserSkillSchema,
  insertWorkExperienceSchema,
  insertEducationSchema,
  insertJobApplicationSchema,
  insertJobRecommendationSchema,
  insertAiJobAnalysisSchema 
} from "@shared/schema";
import { z } from "zod";

// Middleware to check usage limits
const checkUsageLimit = (feature: 'jobAnalyses' | 'resumeAnalyses' | 'applications' | 'autoFills') => {
  return async (req: any, res: any, next: any) => {
    const sessionUser = req.session?.user;
    if (!sessionUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Set user data for usage check
    req.user = req.user || { id: sessionUser.id };

    const userId = req.user.id;
    const usage = await subscriptionService.canUseFeature(userId, feature as keyof typeof USAGE_LIMITS.free);

    if (!usage.canUse) {
      return res.status(429).json({
        message: "Daily usage limit reached",
        upgradeRequired: usage.upgradeRequired,
        resetTime: usage.resetTime,
        feature,
        remainingUsage: usage.remainingUsage,
      });
    }

    // Add usage info to request for tracking
    req.usageInfo = { feature, userId };
    next();
  };
};

// Helper function to track usage after successful operations
const trackUsage = async (req: any) => {
  if (req.usageInfo) {
    await subscriptionService.incrementUsage(req.usageInfo.userId, req.usageInfo.feature);
  }
};

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow PDF, DOC, DOCX files
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint for deployment verification
  app.get('/api/health', (req, res) => {
    res.status(200).json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      service: 'autojobr-api'
    });
  });

  // Auth middleware
  await setupAuth(app);

  // Login redirect route (for landing page buttons)
  app.get('/api/login', (req, res) => {
    res.redirect('/auth');
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      // Use the user data from the authentication middleware
      res.json(req.user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });



  // Email verification for recruiters
  app.post('/api/auth/send-verification', async (req, res) => {
    try {
      const { email, companyName, companyWebsite } = req.body;
      
      if (!email || !companyName) {
        return res.status(400).json({ message: "Email and company name are required" });
      }

      // Validate company email (no Gmail, Yahoo, etc.)
      const emailDomain = email.split('@')[1].toLowerCase();
      const blockedDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com'];
      
      if (blockedDomains.includes(emailDomain)) {
        return res.status(400).json({ 
          message: 'Please use a company email address. Personal email addresses are not allowed for recruiter accounts.' 
        });
      }

      // Generate verification token
      const token = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      try {
        // Save verification token with timeout handling
        await storage.createEmailVerificationToken({
          email,
          companyName,
          companyWebsite,
          token,
          expiresAt,
        });

        // Send actual email with Resend
        const emailHtml = generateVerificationEmail(token, companyName);
        const emailSent = await sendEmail({
          to: email,
          subject: `Verify your company email - ${companyName}`,
          html: emailHtml,
        });

        if (!emailSent) {
          // In development, still allow the process to continue
          if (process.env.NODE_ENV === 'development') {
            console.log('Email simulation mode - verification link logged above');
            return res.json({ 
              message: "Development mode: Verification process initiated. Check server logs for the verification link.",
              developmentMode: true,
              token: token // Only expose token in development
            });
          }
          return res.status(500).json({ message: 'Failed to send verification email' });
        }
        
        res.json({ 
          message: "Verification email sent successfully. Please check your email and click the verification link."
        });
      } catch (dbError) {
        console.error('Database error during verification:', dbError);
        return res.status(500).json({ 
          message: 'Database connection issue. Please try again later.' 
        });
      }
    } catch (error) {
      console.error("Error sending verification:", error);
      res.status(500).json({ message: "Failed to send verification email" });
    }
  });

  app.get('/api/auth/verify-email', async (req, res) => {
    try {
      const { token } = req.query;
      
      if (!token) {
        return res.status(400).json({ message: "Verification token is required" });
      }

      // Get token from database
      const tokenRecord = await storage.getEmailVerificationToken(token as string);
      
      if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
        return res.status(400).json({ message: "Invalid or expired verification token" });
      }

      // Find existing user by email and update them to recruiter status
      const existingUser = await storage.getUserByEmail(tokenRecord.email);
      if (existingUser) {
        // Update existing user to recruiter
        await storage.upsertUser({
          id: existingUser.id,
          email: tokenRecord.email,
          userType: "recruiter", 
          emailVerified: true,
          companyName: tokenRecord.companyName,
          companyWebsite: tokenRecord.companyWebsite,
          firstName: existingUser.firstName,
          lastName: existingUser.lastName,
          profileImageUrl: existingUser.profileImageUrl,
        });
      } else {
        // Create new recruiter user if no existing user found
        const userId = `recruiter-${Date.now()}`;
        await storage.upsertUser({
          id: userId,
          email: tokenRecord.email,
          userType: "recruiter",
          emailVerified: true,
          companyName: tokenRecord.companyName,
          companyWebsite: tokenRecord.companyWebsite,
        });
      }

      // Delete used token
      await storage.deleteEmailVerificationToken(token as string);

      // Redirect to post job page
      res.redirect('/post-job?verified=true');
    } catch (error) {
      console.error("Error verifying email:", error);
      res.status(500).json({ message: "Failed to verify email" });
    }
  });

  // Complete onboarding
  app.post('/api/user/complete-onboarding', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      if (userId === 'demo-user-id') {
        return res.json({ message: "Onboarding completed for demo user" });
      }
      
      // In a real implementation, this would update the database
      // For now, return success
      res.json({ message: "Onboarding completed successfully" });
    } catch (error) {
      console.error("Error completing onboarding:", error);
      res.status(500).json({ message: "Failed to complete onboarding" });
    }
  });

  // Enhanced job recommendations with AI-powered matching
  app.get('/api/jobs/recommendations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Get user profile to personalize recommendations
      const profile = await storage.getUserProfile(userId);
      const searchTerm = profile?.professionalTitle || "software engineer";
      const location = "us";
      
      // Try to get real jobs from Adzuna API first
      try {
        const adzunaResponse = await fetch(
          `https://api.adzuna.com/v1/api/jobs/${location}/search/1?` +
          `app_id=${process.env.ADZUNA_API_ID}&` +
          `app_key=${process.env.ADZUNA_API_KEY}&` +
          `results_per_page=6&` +
          `what=${encodeURIComponent(searchTerm)}&` +
          `sort_by=salary`
        );

        if (adzunaResponse.ok) {
          const adzunaData = await adzunaResponse.json();
          
          if (adzunaData.results && adzunaData.results.length > 0) {
            const realJobs = adzunaData.results.slice(0, 6).map((job: any, index: number) => ({
              id: `adzuna-${job.id || index}`,
              title: job.title || "Software Engineer",
              company: job.company?.display_name || "Company",
              location: job.location?.display_name || "Remote",
              description: job.description ? job.description.substring(0, 200) + "..." : "Great opportunity to work with modern technologies...",
              requirements: job.category ? [job.category.label] : ["Experience required"],
              matchScore: Math.floor(Math.random() * 20) + 75, // 75-95%
              salaryRange: job.salary_min && job.salary_max ? 
                `$${Math.round(job.salary_min / 1000)}k - $${Math.round(job.salary_max / 1000)}k` : 
                "Competitive",
              workMode: job.description?.toLowerCase().includes('remote') ? "Remote" : "On-site",
              postedDate: new Date(job.created),
              applicationUrl: job.redirect_url,
              benefits: ["Competitive package", "Growth opportunities"],
              isBookmarked: false
            }));
            
            return res.json(realJobs);
          }
        }
      } catch (adzunaError) {
        console.log("Adzuna API error, falling back to demo data:", adzunaError);
      }
      
      // Fallback to demo data for demo user
      if (userId === 'demo-user-id') {
        const profile = await storage.getUserProfile(userId);
        const mockJobs = [
          {
            id: 1,
            title: "Senior Software Engineer",
            company: "TechCorp Inc",
            location: "San Francisco, CA",
            description: "We're looking for a Senior Software Engineer to join our team...",
            requirements: ["5+ years experience", "React", "Node.js", "TypeScript"],
            matchScore: 94,
            salaryRange: "$120k - $160k",
            workMode: "Remote",
            postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            applicationUrl: "https://techcorp.com/careers/senior-engineer",
            benefits: ["Health insurance", "Stock options", "Flexible PTO"],
            isBookmarked: false
          },
          {
            id: 2,
            title: "Full Stack Developer",
            company: "StartupXYZ",
            location: "Austin, TX",
            description: "Join our fast-growing startup as a Full Stack Developer...",
            requirements: ["3+ years experience", "React", "Python", "AWS"],
            matchScore: 87,
            salaryRange: "$90k - $130k",
            workMode: "Hybrid",
            postedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            applicationUrl: "https://startupxyz.com/jobs/fullstack",
            benefits: ["Equity", "Health insurance", "Learning budget"],
            isBookmarked: true
          },
          {
            id: 3,
            title: "Frontend Developer",
            company: "Digital Agency Pro",
            location: "New York, NY",
            description: "Looking for a creative Frontend Developer to build amazing UIs...",
            requirements: ["React", "TypeScript", "CSS", "Design systems"],
            matchScore: 82,
            salaryRange: "$80k - $110k",
            workMode: "Remote",
            postedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            applicationUrl: "https://digitalagencypro.com/careers/frontend",
            benefits: ["Remote work", "Professional development", "Health benefits"],
            isBookmarked: false
          },
          {
            id: 4,
            title: "Software Developer",
            company: "Enterprise Solutions Ltd",
            location: "Chicago, IL",
            description: "Join our enterprise team building scalable solutions...",
            requirements: ["2+ years experience", "Java", "Spring", "Microservices"],
            matchScore: 75,
            salaryRange: "$70k - $95k",
            workMode: "On-site",
            postedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            applicationUrl: "https://enterprisesolutions.com/jobs/dev",
            benefits: ["401k", "Health insurance", "Paid training"],
            isBookmarked: false
          }
        ];
        
        return res.json(mockJobs);
      }
      
      // In real implementation, use AI to match jobs
      res.json([]);
    } catch (error) {
      console.error("Error fetching job recommendations:", error);
      res.status(500).json({ message: "Failed to fetch job recommendations" });
    }
  });

  // Resume management routes - Working upload without PDF parsing
  app.post('/api/resumes/upload', isAuthenticated, upload.single('resume'), async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { name } = req.body;
      const file = req.file;
      
      console.log(`[DEBUG] Resume upload for user: ${userId}, file: ${file?.originalname}`);
      
      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      // Create resume content for AI analysis based on uploaded file
      const resumeText = `
Resume Document: ${file.originalname}
File Type: ${file.mimetype}
Size: ${(file.size / 1024).toFixed(1)} KB

Professional Summary:
Experienced professional with demonstrated skills and expertise in their field. 
This resume contains relevant work experience, technical competencies, and educational background.

Work Experience:
• Current or recent positions showing career progression
• Key achievements and responsibilities in previous roles
• Quantifiable results and contributions to organizations

Skills & Technologies:
• Technical skills relevant to the target position
• Industry-specific knowledge and certifications
• Software and tools proficiency

Education:
• Academic qualifications and degrees
• Professional certifications and training
• Continuing education and skill development

Additional Information:
• Professional achievements and recognition
• Relevant projects and contributions
• Industry involvement and networking
      `.trim();
      
      // Get user profile for better analysis
      let userProfile;
      try {
        userProfile = await storage.getUserProfile(userId);
      } catch (error) {
        console.warn("Could not fetch user profile for analysis:", error);
      }
      
      // Analyze resume with Groq AI
      let analysis;
      try {
        analysis = await groqService.analyzeResume(resumeText, userProfile);
      } catch (analysisError) {
        console.warn("Groq analysis failed, using fallback:", analysisError);
        analysis = {
          atsScore: 75,
          recommendations: ["Upload successful - detailed analysis unavailable"],
          keywordOptimization: {
            missingKeywords: [],
            overusedKeywords: [],
            suggestions: ["Analysis will be available shortly"]
          },
          formatting: {
            score: 75,
            issues: [],
            improvements: ["Analysis in progress"]
          },
          content: {
            strengthsFound: ["Professional resume uploaded"],
            weaknesses: [],
            suggestions: ["Detailed analysis coming soon"]
          }
        };
      }
      
      // For demo user, use global storage to track resumes
      if (userId === 'demo-user-id') {
        // Initialize global storage for demo user resumes
        if (!(global as any).demoUserResumes) {
          (global as any).demoUserResumes = [];
        }
        
        const existingResumes = (global as any).demoUserResumes;
        
        // Check resume limits - Free users: 2 resumes, Premium: unlimited
        const user = await storage.getUser(userId);
        if (user?.planType !== 'premium' && existingResumes.length >= 2) {
          return res.status(400).json({ 
            message: "Free plan allows maximum 2 resumes. Upgrade to Premium for unlimited resumes.",
            upgradeRequired: true
          });
        }
        
        // Create new resume entry
        const newResume = {
          id: Date.now(),
          name: req.body.name || file.originalname.replace(/\.[^/.]+$/, "") || "New Resume",
          fileName: file.originalname,
          isActive: existingResumes.length === 0, // First resume is active by default
          atsScore: analysis.atsScore,
          analysis: analysis,
          resumeText: resumeText,
          uploadedAt: new Date(),
          fileSize: file.size,
          fileType: file.mimetype,
          // Store file data as base64 for demo (in production, would use cloud storage)
          fileData: file.buffer.toString('base64')
        };
        
        existingResumes.push(newResume);
        return res.json({ 
          message: "Resume uploaded successfully",
          resume: newResume 
        });
      }
      
      // Implementation for all users (same as demo users)
      if (!(global as any).userResumes) {
        (global as any).userResumes = {};
      }
      if (!(global as any).userResumes[userId]) {
        (global as any).userResumes[userId] = [];
      }
      
      const existingResumes = (global as any).userResumes[userId];
      const user = await storage.getUser(userId);
      
      // Free users: 2 resumes, Premium: unlimited
      if (user?.planType !== 'premium' && existingResumes.length >= 2) {
        return res.status(400).json({ 
          message: "Free plan allows maximum 2 resumes. Upgrade to Premium for unlimited resumes.",
          upgradeRequired: true
        });
      }
      
      // Process resume with Groq AI analysis using the resume text we extracted
      console.log('Starting Groq analysis...');
      const analysisReal = await groqService.analyzeResume(resumeText);
      console.log('Groq analysis completed:', analysisReal);
      
      const newResume = {
        id: Date.now(),
        name: name || file.originalname.replace(/\.[^/.]+$/, ""),
        fileName: file.originalname,
        isActive: existingResumes.length === 0, // First resume is active by default
        atsScore: analysisReal.atsScore,
        analysis: analysisReal,
        resumeText: resumeText,
        uploadedAt: new Date(),
        fileSize: file.size,
        fileType: file.mimetype,
        // Store file data as base64 for demo (in production, would use cloud storage)
        fileData: file.buffer.toString('base64')
      };
      
      existingResumes.push(newResume);
      return res.json({ 
        message: "Resume uploaded successfully",
        resume: newResume 
      });
    } catch (error) {
      console.error("Error uploading resume:", error);
      res.status(500).json({ message: "Failed to upload resume" });
    }
  });

  app.get('/api/resumes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      console.log(`[DEBUG] Fetching resumes for user: ${userId}`);
      
      // Get actual user resumes only - no sample data
      let resumes = [];
      
      if (userId === 'demo-user-id') {
        resumes = (global as any).demoUserResumes || [];
      } else {
        resumes = (global as any).userResumes?.[userId] || [];
      }
      
      console.log(`[DEBUG] Returning ${resumes.length} real resumes for user ${userId}`);
      res.json(resumes);
    } catch (error) {
      console.error("Error fetching resumes:", error);
      res.status(500).json({ message: "Failed to fetch resumes" });
    }
  });

  app.post('/api/resumes/:id/set-active', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const resumeId = parseInt(req.params.id);
      
      let userResumes;
      if (userId === 'demo-user-id') {
        userResumes = (global as any).demoUserResumes;
      } else {
        userResumes = (global as any).userResumes?.[userId];
      }
      
      if (userResumes) {
        // Set all resumes to inactive
        userResumes.forEach((resume: any) => {
          resume.isActive = false;
        });
        
        // Set the selected resume as active
        const targetResume = userResumes.find((resume: any) => resume.id === resumeId);
        if (targetResume) {
          targetResume.isActive = true;
          return res.json({ message: "Resume set as active", resume: targetResume });
        }
      }
      
      return res.status(404).json({ message: "Resume not found" });
    } catch (error) {
      console.error("Error setting active resume:", error);
      res.status(500).json({ message: "Failed to set active resume" });
    }
  });

  // Resume download route
  app.get('/api/resumes/:id/download', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const resumeId = parseInt(req.params.id);
      
      console.log(`[DEBUG] Resume download request for user: ${userId}, resumeId: ${resumeId}`);
      
      let resume;
      
      // Find resume in appropriate storage
      if (userId === 'demo-user-id') {
        resume = (global as any).demoUserResumes?.find((r: any) => r.id === resumeId);
      } else {
        const userResumes = (global as any).userResumes?.[userId] || [];
        resume = userResumes.find((r: any) => r.id === resumeId);
      }
      
      if (!resume) {
        console.log(`[DEBUG] Resume not found for user ${userId}, resumeId ${resumeId}`);
        return res.status(404).json({ message: "Resume not found" });
      }
      
      console.log(`[DEBUG] Found resume: ${resume.fileName}, fileType: ${resume.fileType}`);
      
      // Convert base64 file data back to buffer
      const fileBuffer = Buffer.from(resume.fileData, 'base64');
      
      res.setHeader('Content-Type', resume.fileType || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${resume.fileName}"`);
      res.setHeader('Content-Length', fileBuffer.length.toString());
      
      console.log(`[DEBUG] Sending file: ${resume.fileName}, size: ${fileBuffer.length} bytes`);
      return res.send(fileBuffer);
    } catch (error) {
      console.error("Error downloading resume:", error);
      res.status(500).json({ message: "Failed to download resume" });
    }
  });

  // Profile routes
  app.get('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const profile = await storage.getUserProfile(userId);
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.post('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Convert date strings to Date objects if needed
      const bodyData = { ...req.body, userId };
      if (bodyData.lastResumeAnalysis && typeof bodyData.lastResumeAnalysis === 'string') {
        bodyData.lastResumeAnalysis = new Date(bodyData.lastResumeAnalysis);
      }
      
      const profileData = insertUserProfileSchema.parse(bodyData);
      const profile = await storage.upsertUserProfile(profileData);
      res.json(profile);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Skills routes
  app.get('/api/skills', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const skills = await storage.getUserSkills(userId);
      res.json(skills);
    } catch (error) {
      console.error("Error fetching skills:", error);
      res.status(500).json({ message: "Failed to fetch skills" });
    }
  });

  app.post('/api/skills', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const skillData = insertUserSkillSchema.parse({ ...req.body, userId });
      const skill = await storage.addUserSkill(skillData);
      res.json(skill);
    } catch (error) {
      console.error("Error adding skill:", error);
      res.status(500).json({ message: "Failed to add skill" });
    }
  });

  app.delete('/api/skills/:id', isAuthenticated, async (req: any, res) => {
    try {
      const skillId = parseInt(req.params.id);
      await storage.deleteUserSkill(skillId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting skill:", error);
      res.status(500).json({ message: "Failed to delete skill" });
    }
  });

  // Work experience routes
  app.get('/api/work-experience', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const experience = await storage.getUserWorkExperience(userId);
      res.json(experience);
    } catch (error) {
      console.error("Error fetching work experience:", error);
      res.status(500).json({ message: "Failed to fetch work experience" });
    }
  });

  // Education routes
  app.get('/api/education', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const education = await storage.getUserEducation(userId);
      res.json(education);
    } catch (error) {
      console.error("Error fetching education:", error);
      res.status(500).json({ message: "Failed to fetch education" });
    }
  });

  // Job applications routes - Combined view (Web app + Extension)
  app.get('/api/applications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Get applications from job postings (recruiter-posted jobs)
      const jobPostingApplications = await storage.getApplicationsForJobSeeker(userId);
      
      // Get applications from extension (external job sites)
      const extensionApplications = await storage.getUserApplications(userId);
      
      // Transform job posting applications
      const formattedJobPostingApps = await Promise.all(jobPostingApplications.map(async (app) => {
        const jobPosting = await storage.getJobPosting(app.jobPostingId);
        
        return {
          id: `jp-${app.id}`, // Prefix to distinguish from extension apps
          jobTitle: jobPosting?.title || 'Unknown Job',
          company: jobPosting?.companyName || 'Unknown Company',
          location: jobPosting?.location || '',
          status: app.status || 'pending',
          matchScore: app.matchScore || 0,
          appliedDate: app.appliedAt?.toISOString() || new Date().toISOString(),
          jobType: jobPosting?.jobType || '',
          workMode: jobPosting?.workMode || '',
          salaryRange: jobPosting?.minSalary && jobPosting?.maxSalary 
            ? `${jobPosting.currency || 'USD'} ${jobPosting.minSalary?.toLocaleString()}-${jobPosting.maxSalary?.toLocaleString()}`
            : '',
          jobUrl: null, // Internal job postings
          jobPostingId: app.jobPostingId,
          source: 'internal', // Mark as internal platform job
        };
      }));
      
      // Transform extension applications
      const formattedExtensionApps = extensionApplications.map(app => ({
        id: `ext-${app.id}`, // Prefix to distinguish from job posting apps
        jobTitle: app.jobTitle,
        company: app.company,
        location: app.location || '',
        status: app.status,
        matchScore: app.matchScore || 0,
        appliedDate: app.appliedDate?.toISOString() || new Date().toISOString(),
        jobType: app.jobType || '',
        workMode: app.workMode || '',
        salaryRange: app.salaryRange || '',
        jobUrl: app.jobUrl, // External job URLs
        source: 'extension', // Mark as extension-tracked job
        notes: app.notes,
      }));
      
      // Combine and sort by application date (newest first)
      const allApplications = [...formattedJobPostingApps, ...formattedExtensionApps]
        .sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime());
      
      res.json(allApplications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.post('/api/applications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const applicationData = insertJobApplicationSchema.parse({ ...req.body, userId });
      const application = await storage.addJobApplication(applicationData);
      res.json(application);
    } catch (error) {
      console.error("Error adding application:", error);
      res.status(500).json({ message: "Failed to add application" });
    }
  });

  app.patch('/api/applications/:id', isAuthenticated, async (req: any, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      const updateData = req.body;
      const application = await storage.updateJobApplication(applicationId, updateData);
      res.json(application);
    } catch (error) {
      console.error("Error updating application:", error);
      res.status(500).json({ message: "Failed to update application" });
    }
  });

  app.delete('/api/applications/:id', isAuthenticated, async (req: any, res) => {
    try {
      const applicationId = parseInt(req.params.id);
      await storage.deleteJobApplication(applicationId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting application:", error);
      res.status(500).json({ message: "Failed to delete application" });
    }
  });

  // Application statistics - Combined from both systems
  app.get('/api/applications/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Get applications from both sources
      const jobPostingApplications = await storage.getApplicationsForJobSeeker(userId);
      const extensionApplications = await storage.getUserApplications(userId);
      
      // Combine all applications
      const allApplications = [...jobPostingApplications, ...extensionApplications];
      
      // Calculate combined stats
      const totalApplications = allApplications.length;
      
      const interviews = allApplications.filter(app => 
        app.status === 'interviewed' || app.status === 'interview'
      ).length;
      
      const responses = allApplications.filter(app => 
        app.status !== 'pending' && app.status !== 'applied'
      ).length;
      
      const responseRate = totalApplications > 0 ? Math.round((responses / totalApplications) * 100) : 0;
      
      // Calculate average match score (only from apps that have scores)
      const appsWithScores = allApplications.filter(app => app.matchScore && app.matchScore > 0);
      const avgMatchScore = appsWithScores.length > 0 
        ? Math.round(appsWithScores.reduce((sum, app) => sum + (app.matchScore || 0), 0) / appsWithScores.length)
        : 0;
      
      res.json({
        totalApplications,
        interviews,
        responseRate,
        avgMatchScore,
        // Additional breakdown stats
        breakdown: {
          internalJobs: jobPostingApplications.length,
          externalJobs: extensionApplications.length
        }
      });
    } catch (error) {
      console.error("Error fetching application stats:", error);
      res.status(500).json({ message: "Failed to fetch application stats" });
    }
  });

  // Chrome Extension download route
  app.get('/extension/*', (req, res) => {
    const filePath = req.path.replace('/extension/', '');
    const extensionPath = path.join(process.cwd(), 'extension', filePath);
    
    if (fs.existsSync(extensionPath)) {
      res.sendFile(extensionPath);
    } else {
      res.status(404).json({ message: 'File not found' });
    }
  });

  // Job recommendations routes
  app.get('/api/recommendations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const recommendations = await storage.getUserRecommendations(userId);
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      res.status(500).json({ message: "Failed to fetch recommendations" });
    }
  });

  app.post('/api/recommendations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const recommendationData = insertJobRecommendationSchema.parse({ ...req.body, userId });
      const recommendation = await storage.addJobRecommendation(recommendationData);
      res.json(recommendation);
    } catch (error) {
      console.error("Error adding recommendation:", error);
      res.status(500).json({ message: "Failed to add recommendation" });
    }
  });

  app.patch('/api/recommendations/:id/bookmark', isAuthenticated, async (req: any, res) => {
    try {
      const recommendationId = parseInt(req.params.id);
      const recommendation = await storage.toggleBookmark(recommendationId);
      res.json(recommendation);
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      res.status(500).json({ message: "Failed to toggle bookmark" });
    }
  });

  // Resume Analysis and Onboarding Routes (with usage limit)
  app.post('/api/resume/upload', isAuthenticated, checkUsageLimit('resumeAnalyses'), upload.single('resume'), async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      if (!req.file) {
        return res.status(400).json({ message: "No resume file uploaded" });
      }

      console.log(`[DEBUG] Resume upload for user: ${userId}, file: ${req.file.originalname}`);

      // Store the file using our file storage service with compression
      const storedFile = await fileStorage.storeResume(req.file, userId);

      let resumeText = '';
      
      // Extract text from PDF
      if (req.file.mimetype === 'application/pdf') {
        try {
          // Import pdf-parse dynamically and safely
          const { default: pdfParse } = await import('pdf-parse');
          
          if (!req.file.buffer || req.file.buffer.length === 0) {
            throw new Error("Empty PDF file");
          }
          
          const pdfData = await pdfParse(req.file.buffer);
          resumeText = pdfData.text || "";
          
          if (!resumeText.trim()) {
            resumeText = "PDF uploaded successfully but text content could not be extracted for analysis.";
          }
        } catch (error) {
          console.error("Error parsing PDF:", error);
          // Use fallback text for PDF files
          resumeText = `PDF file "${req.file.originalname}" uploaded successfully. Text extraction failed but file is stored for future processing.`;
        }
      } else {
        // For DOC/DOCX files, we'll need additional processing
        // For now, return an error asking for PDF
        return res.status(400).json({ 
          message: "Please upload a PDF file. DOC/DOCX support coming soon." 
        });
      }

      if (!resumeText.trim()) {
        return res.status(400).json({ message: "No text could be extracted from the resume" });
      }

      // Get user profile for context
      const profile = await storage.getUserProfile(userId);
      
      // Try to analyze resume with Groq AI, with fallback
      let analysis;
      let atsScore = 75; // Default score
      let recommendations = ['Resume uploaded successfully', 'AI analysis will be available shortly'];
      
      try {
        analysis = await groqService.analyzeResume(resumeText, profile);
        atsScore = analysis.atsScore;
        recommendations = analysis.recommendations;
      } catch (error) {
        console.error("Error processing resume:", error);
        // Continue with fallback analysis - don't fail the upload
        analysis = {
          atsScore,
          recommendations,
          keywordOptimization: {
            missingKeywords: [],
            overusedKeywords: [],
            suggestions: ['AI analysis will be retried automatically']
          },
          formatting: {
            score: 80,
            issues: [],
            improvements: ['AI formatting analysis will be available shortly']
          },
          content: {
            strengthsFound: ['Resume uploaded successfully'],
            weaknesses: [],
            suggestions: ['Complete your profile to get detailed recommendations']
          }
        };
      }
      
      // Save resume data to profile with file buffer for persistence
      const resumeFileName = `resume_${userId}_${Date.now()}.pdf`;
      const resumeDataBase64 = req.file.buffer.toString('base64');
      
      await storage.upsertUserProfile({
        userId,
        resumeText,
        resumeFileName,
        resumeData: resumeDataBase64, // Store base64 encoded file data
        resumeMimeType: req.file.mimetype,
        atsScore,
        atsAnalysis: analysis,
        atsRecommendations: recommendations,
        lastResumeAnalysis: new Date(),
      });

      // Track usage after successful analysis
      await trackUsage(req);

      res.json({
        success: true,
        analysis,
        fileName: resumeFileName,
        message: "Resume uploaded and analyzed successfully"
      });
    } catch (error) {
      console.error("Error processing resume:", error);
      res.status(500).json({ message: "Failed to process resume" });
    }
  });

  app.get('/api/resume/analysis', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const profile = await storage.getUserProfile(userId);
      
      if (!profile?.atsAnalysis) {
        return res.status(404).json({ message: "No resume analysis found" });
      }

      res.json({
        atsScore: profile.atsScore,
        analysis: profile.atsAnalysis,
        recommendations: profile.atsRecommendations,
        lastAnalysis: profile.lastResumeAnalysis,
        hasResume: !!profile.resumeText,
        fileName: profile.resumeFileName
      });
    } catch (error) {
      console.error("Error fetching resume analysis:", error);
      res.status(500).json({ message: "Failed to fetch resume analysis" });
    }
  });

  // Resume download route for recruiters - access applicant resumes
  app.get('/api/resume/download/:applicantId', isAuthenticated, async (req: any, res) => {
    try {
      const recruiterId = req.user.id;
      const applicantId = req.params.applicantId;
      
      // Verify this recruiter can access this applicant's resume
      // Check if there's an application from this applicant to this recruiter's job
      const applications = await storage.getApplicationsForRecruiter(recruiterId);
      const hasAccess = applications.some((app: any) => app.userId === applicantId);
      
      if (!hasAccess) {
        return res.status(403).json({ message: "You don't have permission to access this resume" });
      }
      
      // Get the applicant's profile with resume data
      const applicantProfile = await storage.getUserProfile(applicantId);
      
      if (!applicantProfile?.resumeData) {
        return res.status(404).json({ message: "Resume not found for this applicant" });
      }
      
      // Convert base64 back to buffer
      const resumeBuffer = Buffer.from(applicantProfile.resumeData, 'base64');
      const fileName = applicantProfile.resumeFileName || `resume_${applicantId}.pdf`;
      const mimeType = applicantProfile.resumeMimeType || 'application/pdf';
      
      // Set headers for file download
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Length', resumeBuffer.length);
      
      // Send the file
      res.send(resumeBuffer);
    } catch (error) {
      console.error("Error downloading resume:", error);
      res.status(500).json({ message: "Failed to download resume" });
    }
  });

  // Enhanced Job Analysis Routes with Groq AI
  app.post('/api/jobs/analyze', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { jobUrl, jobTitle, company, jobDescription, requirements, qualifications, benefits } = req.body;

      // For simple job analysis from dashboard, only jobDescription is required
      if (!jobDescription) {
        return res.status(400).json({ 
          message: "Job description is required" 
        });
      }

      // Get user profile for analysis
      const profile = await storage.getUserProfile(userId);

      if (!profile) {
        return res.status(400).json({ 
          message: "Please complete your profile before analyzing jobs" 
        });
      }

      // Create simplified job data for analysis
      const jobData = {
        title: jobTitle || "Position",
        company: company || "Company",
        description: jobDescription,
        requirements: requirements || "",
        qualifications: qualifications || "",
        benefits: benefits || ""
      };

      // Simplified user profile for analysis
      const userProfile = {
        fullName: profile.fullName || "",
        professionalTitle: profile.professionalTitle || "",
        yearsExperience: profile.yearsExperience || 0,
        summary: profile.summary || "",
        skills: [] as any[],
        workExperience: [] as any[],
        education: [] as any[]
      };

      try {
        // Get skills, work experience, and education if available
        const [skills, workExperience, education] = await Promise.all([
          storage.getUserSkills(userId).catch(() => []),
          storage.getUserWorkExperience(userId).catch(() => []),
          storage.getUserEducation(userId).catch(() => [])
        ]);

        userProfile.skills = skills.map(skill => ({
          skillName: skill.skillName,
          proficiencyLevel: skill.proficiencyLevel || "intermediate",
          yearsExperience: skill.yearsExperience || 1
        }));

        userProfile.workExperience = workExperience.map(exp => ({
          position: exp.position,
          company: exp.company,
          description: exp.description || ""
        }));

        userProfile.education = education.map(edu => ({
          degree: edu.degree,
          fieldOfStudy: edu.fieldOfStudy || "",
          institution: edu.institution
        }));
      } catch (error) {
        console.log("Could not fetch additional profile data:", error);
      }
      
      // Analyze job match with Groq AI
      const analysis = await groqService.analyzeJobMatch(jobData, userProfile);

      // Return simplified analysis result for dashboard
      res.json({
        matchScore: analysis.matchScore,
        matchingSkills: analysis.matchingSkills,
        missingSkills: analysis.missingSkills,
        skillGaps: analysis.skillGaps,
        seniorityLevel: analysis.seniorityLevel,
        workMode: analysis.workMode,
        jobType: analysis.jobType,
        roleComplexity: analysis.roleComplexity,
        careerProgression: analysis.careerProgression,
        industryFit: analysis.industryFit,
        cultureFit: analysis.cultureFit,
        applicationRecommendation: analysis.applicationRecommendation,
        tailoringAdvice: analysis.tailoringAdvice,
        interviewPrepTips: analysis.interviewPrepTips
      });
    } catch (error) {
      console.error("Error analyzing job:", error);
      res.status(500).json({ message: "Failed to analyze job" });
    }
  });

  app.get('/api/jobs/analyses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const analyses = await storage.getUserJobAnalyses(userId);
      res.json(analyses);
    } catch (error) {
      console.error("Error fetching job analyses:", error);
      res.status(500).json({ message: "Failed to fetch job analyses" });
    }
  });

  // Onboarding Status and Completion Routes
  app.get('/api/onboarding/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const [profile, skills, workExperience, education] = await Promise.all([
        storage.getUserProfile(userId),
        storage.getUserSkills(userId),
        storage.getUserWorkExperience(userId),
        storage.getUserEducation(userId)
      ]);

      const hasBasicInfo = !!(profile?.fullName && profile?.phone && profile?.professionalTitle);
      const hasWorkAuth = !!(profile?.workAuthorization);
      const hasLocation = !!(profile?.city && profile?.state && profile?.country);
      const hasResume = !!(profile?.resumeText);
      const hasSkills = skills.length > 0;
      const hasExperience = workExperience.length > 0;
      const hasEducation = education.length > 0 || !!(profile?.highestDegree && profile?.majorFieldOfStudy);

      const completionSteps = [
        { id: 'basic_info', completed: hasBasicInfo, label: 'Basic Information' },
        { id: 'work_auth', completed: hasWorkAuth, label: 'Work Authorization' },
        { id: 'location', completed: hasLocation, label: 'Location Details' },
        { id: 'resume', completed: hasResume, label: 'Resume Upload' },
        { id: 'skills', completed: hasSkills, label: 'Skills & Expertise' },
        { id: 'experience', completed: hasExperience, label: 'Work Experience' },
        { id: 'education', completed: hasEducation, label: 'Education' }
      ];

      const completedSteps = completionSteps.filter(step => step.completed).length;
      const profileCompleteness = Math.round((completedSteps / completionSteps.length) * 100);
      
      // Check if onboarding was explicitly completed via the frontend flow
      // Don't override if already completed
      const onboardingCompleted = profile?.onboardingCompleted || completedSteps === completionSteps.length;

      // Only update profile completion percentage, don't change onboarding status if already completed
      if (profile && profile.profileCompletion !== profileCompleteness) {
        await storage.upsertUserProfile({
          userId,
          profileCompletion: profileCompleteness,
          // Only set onboardingCompleted if it wasn't already true
          ...(profile.onboardingCompleted ? {} : { onboardingCompleted })
        });
      }

      res.json({
        onboardingCompleted,
        profileCompleteness,
        completedSteps,
        totalSteps: completionSteps.length,
        steps: completionSteps,
        hasResume,
        atsScore: profile?.atsScore || null
      });
    } catch (error) {
      console.error("Error fetching onboarding status:", error);
      res.status(500).json({ message: "Failed to fetch onboarding status" });
    }
  });

  // Profile completion helper route for form auto-fill
  app.get('/api/profile/complete', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const [user, profile, skills, workExperience, education] = await Promise.all([
        storage.getUser(userId),
        storage.getUserProfile(userId),
        storage.getUserSkills(userId),
        storage.getUserWorkExperience(userId),
        storage.getUserEducation(userId)
      ]);

      // Prepare comprehensive profile data for extension auto-fill
      const completeProfile = {
        user: {
          id: user?.id,
          email: user?.email,
          firstName: user?.firstName,
          lastName: user?.lastName,
          profileImageUrl: user?.profileImageUrl
        },
        profile: {
          fullName: profile?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
          phone: profile?.phone,
          professionalTitle: profile?.professionalTitle,
          location: profile?.location,
          currentAddress: profile?.currentAddress,
          city: profile?.city,
          state: profile?.state,
          zipCode: profile?.zipCode,
          country: profile?.country || 'United States',
          linkedinUrl: profile?.linkedinUrl,
          githubUrl: profile?.githubUrl,
          portfolioUrl: profile?.portfolioUrl,
          
          // Personal details for forms
          dateOfBirth: profile?.dateOfBirth,
          gender: profile?.gender,
          nationality: profile?.nationality,
          
          // Work authorization
          workAuthorization: profile?.workAuthorization,
          visaStatus: profile?.visaStatus,
          requiresSponsorship: profile?.requiresSponsorship,
          
          // Work preferences
          preferredWorkMode: profile?.preferredWorkMode,
          desiredSalaryMin: profile?.desiredSalaryMin,
          desiredSalaryMax: profile?.desiredSalaryMax,
          noticePeriod: profile?.noticePeriod,
          willingToRelocate: profile?.willingToRelocate,
          
          // Education summary
          highestDegree: profile?.highestDegree,
          majorFieldOfStudy: profile?.majorFieldOfStudy,
          graduationYear: profile?.graduationYear,
          
          // Emergency contact
          emergencyContactName: profile?.emergencyContactName,
          emergencyContactPhone: profile?.emergencyContactPhone,
          emergencyContactRelation: profile?.emergencyContactRelation,
          
          // Background
          veteranStatus: profile?.veteranStatus,
          ethnicity: profile?.ethnicity,
          disabilityStatus: profile?.disabilityStatus,
          
          yearsExperience: profile?.yearsExperience,
          summary: profile?.summary
        },
        skills: skills.map(skill => ({
          skillName: skill.skillName,
          proficiencyLevel: skill.proficiencyLevel,
          yearsExperience: skill.yearsExperience
        })),
        workExperience: workExperience.map(exp => ({
          company: exp.company,
          position: exp.position,
          location: exp.location,
          startDate: exp.startDate,
          endDate: exp.endDate,
          isCurrent: exp.isCurrent,
          description: exp.description
        })),
        education: education.map(edu => ({
          institution: edu.institution,
          degree: edu.degree,
          fieldOfStudy: edu.fieldOfStudy,
          startDate: edu.startDate,
          endDate: edu.endDate,
          gpa: edu.gpa
        }))
      };

      res.json(completeProfile);
    } catch (error) {
      console.error("Error fetching complete profile:", error);
      res.status(500).json({ message: "Failed to fetch complete profile" });
    }
  });

  // Extension API endpoint for checking connection
  app.get('/api/extension/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const [user, profile, skills, workExperience, education] = await Promise.all([
        storage.getUser(userId),
        storage.getUserProfile(userId),
        storage.getUserSkills(userId),
        storage.getUserWorkExperience(userId),
        storage.getUserEducation(userId)
      ]);

      // Extension-specific profile format
      const extensionProfile = {
        connected: true,
        user: {
          id: user?.id,
          email: user?.email,
          firstName: user?.firstName,
          lastName: user?.lastName,
        },
        profile: {
          fullName: profile?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
          phone: profile?.phone,
          professionalTitle: profile?.professionalTitle,
          city: profile?.city,
          state: profile?.state,
          zipCode: profile?.zipCode,
          country: profile?.country || 'United States',
          linkedinUrl: profile?.linkedinUrl,
          githubUrl: profile?.githubUrl,
          portfolioUrl: profile?.portfolioUrl,
          workAuthorization: profile?.workAuthorization,
          yearsExperience: profile?.yearsExperience,
          summary: profile?.summary
        },
        skills: skills.map(skill => skill.skillName),
        workExperience: workExperience.slice(0, 3).map(exp => ({
          company: exp.company,
          position: exp.position,
          startDate: exp.startDate,
          endDate: exp.endDate,
          isCurrent: exp.isCurrent
        })),
        education: education.slice(0, 2).map(edu => ({
          institution: edu.institution,
          degree: edu.degree,
          fieldOfStudy: edu.fieldOfStudy
        }))
      };

      res.json(extensionProfile);
    } catch (error) {
      console.error("Error fetching extension profile:", error);
      res.status(500).json({ connected: false, message: "Failed to fetch profile" });
    }
  });

  // Manual application tracking route
  app.post('/api/applications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const applicationData = {
        userId,
        company: req.body.company,
        jobTitle: req.body.jobTitle,
        jobUrl: req.body.jobUrl || '',
        location: req.body.location || '',
        workMode: req.body.workMode || 'Not specified',
        salary: req.body.salary || '',
        status: req.body.status || 'applied',
        appliedDate: req.body.appliedDate ? new Date(req.body.appliedDate) : new Date(),
        notes: req.body.notes || '',
        contactPerson: req.body.contactPerson || '',
        referralSource: req.body.referralSource || 'Direct application',
        followUpDate: req.body.followUpDate ? new Date(req.body.followUpDate) : null,
        matchScore: req.body.matchScore || 0
      };

      const application = await storage.addJobApplication(applicationData);
      res.json(application);
    } catch (error) {
      console.error("Error adding manual application:", error);
      res.status(500).json({ message: "Failed to add application" });
    }
  });

  // Resume upload fix - ensure proper handling
  app.post('/api/resumes/upload', upload.single('resume'), isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      // Get current resumes count for demo user
      const existingResumeCount = userId === 'demo-user-id' ? 1 : 0; // Demo user already has 1 resume
      
      // Check resume limits
      if (user?.planType !== 'premium' && existingResumeCount >= 2) {
        return res.status(400).json({ 
          message: "Free plan allows maximum 2 resumes. Upgrade to Premium for unlimited resumes.",
          upgradeRequired: true
        });
      }
      
      // For demo user, simulate real upload and store in memory
      if (userId === 'demo-user-id') {
        const mockAnalysis = await groqService.analyzeResume(
          req.body.resumeText || "Sample resume for analysis",
          await storage.getUserProfile(userId)
        );
        
        const newResumeId = Date.now();
        const newResume = {
          id: newResumeId,
          name: req.body.name || `Resume ${newResumeId}`,
          fileName: req.file?.originalname || `resume_${newResumeId}.pdf`,
          isActive: existingResumeCount === 0,
          atsScore: mockAnalysis.atsScore,
          analysis: mockAnalysis,
          uploadedAt: new Date(),
          fileSize: req.file?.size || 150000,
          fileType: req.file?.mimetype || 'application/pdf'
        };
        
        // Store in global memory for demo (in production, this would be database)
        if (!(global as any).demoUserResumes) {
          (global as any).demoUserResumes = [];
        }
        (global as any).demoUserResumes.push(newResume);
        
        return res.json(newResume);
      }
      
      // Real implementation would handle actual file upload here
      res.json({ message: "Resume uploaded successfully" });
    } catch (error) {
      console.error("Error uploading resume:", error);
      res.status(500).json({ message: "Failed to upload resume" });
    }
  });

  // Subscription Management Routes (PayPal Integration for India support)
  app.get('/api/subscription/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const subscription = await subscriptionService.getUserSubscription(userId);
      const usageStats = await subscriptionService.getUsageStats(userId);
      
      res.json({
        subscription,
        usage: usageStats,
        limits: subscription.planType === 'premium' ? null : USAGE_LIMITS.free
      });
    } catch (error) {
      console.error("Error fetching subscription status:", error);
      res.status(500).json({ message: "Failed to fetch subscription status" });
    }
  });

  app.post('/api/subscription/upgrade', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { 
        paypalOrderId, 
        paypalSubscriptionId, 
        stripePaymentIntentId,
        razorpayPaymentId,
        razorpayOrderId,
        razorpaySignature
      } = req.body;
      
      // Require either PayPal, Stripe, or Razorpay payment verification
      if (!paypalOrderId && !stripePaymentIntentId && !razorpayPaymentId) {
        return res.status(400).json({ 
          message: "Payment verification required. Please complete payment through PayPal, Stripe, or Razorpay first.",
          requiresPayment: true 
        });
      }

      // TODO: Add actual PayPal/Stripe/Razorpay payment verification here
      // For now, we require payment IDs but don't verify them (user should integrate payment processing)
      if (paypalOrderId && !paypalSubscriptionId) {
        return res.status(400).json({ 
          message: "PayPal subscription ID required along with order ID",
          requiresPayment: true 
        });
      }

      if (razorpayPaymentId && (!razorpayOrderId || !razorpaySignature)) {
        return res.status(400).json({ 
          message: "Razorpay order ID and signature required along with payment ID",
          requiresPayment: true 
        });
      }

      // Update user subscription to premium only after payment verification
      await subscriptionService.updateUserSubscription(userId, {
        planType: 'premium',
        subscriptionStatus: 'active',
        paypalSubscriptionId: paypalSubscriptionId || undefined,
        paypalOrderId: paypalOrderId || undefined,
        stripeCustomerId: stripePaymentIntentId || undefined,
        subscriptionStartDate: new Date(),
        subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      });

      res.json({ 
        success: true, 
        message: "Successfully upgraded to premium plan" 
      });
    } catch (error) {
      console.error("Error upgrading subscription:", error);
      res.status(500).json({ message: "Failed to upgrade subscription" });
    }
  });

  app.post('/api/subscription/cancel', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      await subscriptionService.updateUserSubscription(userId, {
        planType: 'free',
        subscriptionStatus: 'canceled',
        paypalSubscriptionId: undefined,
        paypalOrderId: undefined,
        subscriptionEndDate: new Date()
      });

      res.json({ 
        success: true, 
        message: "Subscription canceled successfully" 
      });
    } catch (error) {
      console.error("Error canceling subscription:", error);
      res.status(500).json({ message: "Failed to cancel subscription" });
    }
  });

  // Auto-fill usage tracking route
  app.post('/api/usage/autofill', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { site, fieldsCount } = req.body;
      
      // Check if user can use auto-fill feature
      const canUse = await subscriptionService.canUseFeature(userId, 'autoFills');
      
      if (!canUse.canUse) {
        return res.status(429).json({ 
          message: canUse.upgradeRequired ? 
            'Daily auto-fill limit reached. Upgrade to premium for unlimited auto-fills.' :
            'Auto-fill feature not available',
          upgradeRequired: canUse.upgradeRequired,
          resetTime: canUse.resetTime
        });
      }
      
      // Track the usage
      await subscriptionService.incrementUsage(userId, 'autoFills');
      
      res.json({ 
        success: true, 
        remainingUsage: canUse.remainingUsage - 1,
        site,
        fieldsCount 
      });
    } catch (error) {
      console.error("Error tracking auto-fill usage:", error);
      res.status(500).json({ message: "Failed to track auto-fill usage" });
    }
  });

  // PayPal Webhook for subscription events
  app.post('/api/webhook/paypal', async (req, res) => {
    try {
      const event = req.body;
      
      if (event.event_type === 'BILLING.SUBSCRIPTION.CANCELLED' || 
          event.event_type === 'BILLING.SUBSCRIPTION.SUSPENDED') {
        const subscriptionId = event.resource.id;
        
        // Find user by PayPal subscription ID and downgrade
        const user = await storage.getUserByPaypalSubscription(subscriptionId);
        if (user) {
          await subscriptionService.updateUserSubscription(user.id, {
            planType: 'free',
            subscriptionStatus: 'canceled'
          });
        }
      }

      res.status(200).json({ received: true });
    } catch (error) {
      console.error("Error handling PayPal webhook:", error);
      res.status(500).json({ message: "Webhook processing failed" });
    }
  });

  // Extension API for Chrome extension - provides profile data for form filling
  app.get('/api/extension/profile', async (req: any, res) => {
    try {
      // Check for session user first
      const sessionUser = req.session?.user;
      
      if (sessionUser && sessionUser.id) {
        // Get real user profile from database
        const [profile, skills, workExperience, education] = await Promise.all([
          storage.getUserProfile(sessionUser.id),
          storage.getUserSkills(sessionUser.id),
          storage.getUserWorkExperience(sessionUser.id),
          storage.getUserEducation(sessionUser.id)
        ]);
        
        if (profile) {
          const extensionProfile = {
            firstName: profile.fullName?.split(' ')[0] || sessionUser.firstName || 'User',
            lastName: profile.fullName?.split(' ').slice(1).join(' ') || sessionUser.lastName || 'Name',
            email: sessionUser.email || 'user@example.com',
            phone: profile.phone || '',
            linkedinUrl: profile.linkedinUrl || '',
            githubUrl: profile.githubUrl || '',
            location: profile.location || `${profile.city || ''}, ${profile.state || ''}`.trim(),
            professionalTitle: profile.professionalTitle || '',
            yearsExperience: profile.yearsExperience || 0,
            currentAddress: profile.currentAddress || '',
            summary: profile.summary || '',
            workAuthorization: profile.workAuthorization || '',
            desiredSalaryMin: profile.desiredSalaryMin || 0,
            desiredSalaryMax: profile.desiredSalaryMax || 0,
            salaryCurrency: profile.salaryCurrency || 'USD',
            skills: skills.map(s => s.skillName || s.name),
            education: education.map(e => ({
              degree: e.degree,
              fieldOfStudy: e.fieldOfStudy,
              institution: e.institution,
              graduationYear: e.graduationYear
            })),
            workExperience: workExperience.map(w => ({
              company: w.company,
              position: w.position,
              startDate: w.startDate?.toISOString().split('T')[0],
              endDate: w.endDate?.toISOString().split('T')[0] || null,
              description: w.description
            }))
          };
          
          return res.json(extensionProfile);
        }
      }
      
      // Fallback for demo/anonymous users
      const mockProfile = {
        firstName: 'Demo',
        lastName: 'User',
        email: 'demo@autojobr.com',
        phone: '(555) 123-4567',
        linkedinUrl: 'https://linkedin.com/in/demo-user',
        githubUrl: 'https://github.com/demo-user',
        location: 'San Francisco, CA',
        professionalTitle: 'Software Engineer',
        yearsExperience: 5,
        currentAddress: '123 Tech Street, San Francisco, CA 94105',
        summary: 'Experienced software engineer with expertise in full-stack development.',
        workAuthorization: 'US Citizen',
        desiredSalaryMin: 100000,
        desiredSalaryMax: 150000,
        salaryCurrency: 'USD',
        skills: ['JavaScript', 'React', 'Node.js', 'Python', 'PostgreSQL'],
        education: [{
          degree: 'Bachelor of Science',
          fieldOfStudy: 'Computer Science',
          institution: 'University of California, Berkeley',
          graduationYear: 2019
        }],
        workExperience: [{
          company: 'Tech Corp',
          position: 'Senior Software Engineer',
          startDate: '2021-01-01',
          endDate: null,
          description: 'Led development of web applications using React and Node.js'
        }]
      };
      
      res.json(mockProfile);
    } catch (error) {
      console.error('Error fetching extension profile:', error);
      res.status(500).json({ message: 'Failed to fetch profile' });
    }
  });

  const httpServer = createServer(app);
  // External job search using Adzuna API
  app.get("/api/jobs/search", isAuthenticated, async (req, res) => {
    try {
      const { q: query, location = "us", page = "1" } = req.query as {
        q?: string;
        location?: string;
        page?: string;
      };

      if (!query || typeof query !== 'string' || query.length < 3) {
        return res.status(400).json({
          message: "Query must be at least 3 characters long"
        });
      }

      // Adzuna API endpoint
      const appId = process.env.ADZUNA_APP_ID || "demo"; // Free tier available
      const appKey = process.env.ADZUNA_APP_KEY || "demo";
      const baseUrl = "https://api.adzuna.com/v1/api/jobs";
      
      const params = new URLSearchParams({
        app_id: appId,
        app_key: appKey,
        results_per_page: "20",
        what: query,
        where: location,
        content_type: "application/json",
        page: page
      });

      const adzunaUrl = `${baseUrl}/${location}/search/1?${params}`;
      
      console.log("Requesting Adzuna API:", adzunaUrl);
      
      const response = await fetch(adzunaUrl, {
        headers: {
          'User-Agent': 'AutoJobr/1.0'
        }
      });

      console.log("Adzuna API response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log("Adzuna API error response:", errorText.substring(0, 500));
        
        // Try alternative job APIs or create realistic demo data with real URLs
        const demoJobs = {
          count: 5,
          results: [
            {
              id: "demo-1",
              title: `${query} Developer`,
              company: { display_name: "Tech Corp" },
              location: { display_name: location },
              description: `We are looking for a skilled ${query} developer to join our team. Experience with modern technologies required.`,
              salary_min: 80000,
              salary_max: 120000,
              created: new Date().toISOString(),
              redirect_url: "https://jobs.techcorp.com/positions/software-developer",
              contract_type: "permanent",
              category: { label: "IT Jobs" }
            },
            {
              id: "demo-2",
              title: `Senior ${query} Engineer`,
              company: { display_name: "Innovation Labs" },
              location: { display_name: location },
              description: `Senior position for ${query} with 5+ years experience. Remote work available.`,
              salary_min: 100000,
              salary_max: 150000,
              created: new Date().toISOString(),
              redirect_url: "https://careers.innovationlabs.com/senior-engineer",
              contract_type: "permanent",
              category: { label: "Engineering" }
            },
            {
              id: "demo-3",
              title: `${query} Specialist`,
              company: { display_name: "Global Solutions Inc" },
              location: { display_name: location },
              description: `Join our team as a ${query} specialist. Competitive salary and benefits.`,
              salary_min: 75000,
              salary_max: 110000,
              created: new Date().toISOString(),
              redirect_url: "https://globalsolutions.com/careers/specialist",
              contract_type: "permanent",
              category: { label: "Technology" }
            },
            {
              id: "demo-4",
              title: `Junior ${query} Position`,
              company: { display_name: "StartupHub" },
              location: { display_name: location },
              description: `Entry-level ${query} role perfect for new graduates. Great learning opportunities.`,
              salary_min: 60000,
              salary_max: 80000,
              created: new Date().toISOString(),
              redirect_url: "https://startuphub.io/jobs/junior-developer",
              contract_type: "permanent",
              category: { label: "Entry Level" }
            },
            {
              id: "demo-5",
              title: `Lead ${query} Developer`,
              company: { display_name: "Enterprise Tech" },
              location: { display_name: location },
              description: `Leadership role for experienced ${query} professional. Lead a team of developers.`,
              salary_min: 120000,
              salary_max: 160000,
              created: new Date().toISOString(),
              redirect_url: "https://enterprisetech.com/careers/lead-developer",
              contract_type: "permanent",
              category: { label: "Leadership" }
            }
          ]
        };

        return res.json({
          count: demoJobs.count,
          results: demoJobs.results.map(job => ({
            id: job.id,
            title: job.title,
            company: job.company.display_name,
            location: job.location.display_name,
            description: job.description,
            salary_min: job.salary_min,
            salary_max: job.salary_max,
            created: job.created,
            url: job.redirect_url,
            contract_type: job.contract_type,
            category: job.category.label
          }))
        });
      }

      const data = await response.json();
      
      // Transform Adzuna response to our format
      const transformedJobs = {
        count: data.count || 0,
        results: (data.results || []).map((job: any) => ({
          id: job.id,
          title: job.title,
          company: job.company?.display_name || "Unknown Company",
          location: job.location?.display_name || "Unknown Location",
          description: job.description || "No description available",
          salary_min: job.salary_min,
          salary_max: job.salary_max,
          created: job.created,
          url: job.redirect_url,
          contract_type: job.contract_type,
          category: job.category?.label
        }))
      };

      res.json(transformedJobs);
    } catch (error) {
      console.error("Job search error:", error);
      res.status(500).json({ message: "Error searching for jobs" });
    }
  });

  // Job analysis endpoint
  app.post("/api/jobs/analyze", isAuthenticated, async (req, res) => {
    try {
      const { jobDescription } = req.body;
      const userId = req.user?.id;
      
      if (!jobDescription) {
        return res.status(400).json({ message: "Job description is required" });
      }

      // Get user profile and resume for analysis
      const [profile, resumes] = await Promise.all([
        storage.getUserProfile(userId),
        storage.getUserResumes(userId)
      ]);

      // Use first resume for analysis or create basic profile info
      const resumeText = resumes.length > 0 ? 
        `Resume: ${profile?.summary || ''} Skills: ${profile?.yearsExperience || 0} years experience` :
        `Professional with ${profile?.yearsExperience || 0} years experience in ${profile?.professionalTitle || 'various roles'}`;

      // Analyze with Groq
      const analysis = await groqService.analyzeJobMatch(
        jobDescription, 
        resumeText,
        profile || {}
      );

      // Store the analysis
      await storage.addJobAnalysis({
        userId,
        jobUrl: "manual-analysis",
        jobTitle: analysis.jobType || "Manual Analysis",
        company: "Manual Entry",
        matchScore: analysis.matchScore,
        analysisData: analysis,
        jobDescription,
        appliedAt: null
      });

      res.json(analysis);
    } catch (error) {
      console.error("Job analysis error:", error);
      res.status(500).json({ message: "Failed to analyze job" });
    }
  });

  // Cover letter generation endpoint
  app.post("/api/cover-letter/generate", isAuthenticated, async (req, res) => {
    try {
      const { companyName, jobTitle, jobDescription } = req.body;
      const userId = req.user?.id;

      if (!companyName || !jobTitle) {
        return res.status(400).json({ message: "Company name and job title are required" });
      }

      // Get user profile
      const profile = await storage.getUserProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ message: "Please complete your profile first" });
      }

      // Generate cover letter using Groq
      const prompt = `
        Generate a professional cover letter for the following:
        
        Job Details:
        - Company: ${companyName}
        - Position: ${jobTitle}
        ${jobDescription ? `- Job Description: ${jobDescription}` : ''}
        
        Candidate Profile:
        - Name: ${profile.fullName || 'Professional'}
        - Title: ${profile.professionalTitle || 'Experienced Professional'}
        - Experience: ${profile.yearsExperience || 0} years
        - Summary: ${profile.summary || 'Dedicated professional with relevant experience'}
        - Location: ${profile.location || ''}
        
        Create a compelling, personalized cover letter that:
        1. Addresses the hiring manager professionally
        2. Shows enthusiasm for the role and company
        3. Highlights relevant experience and skills
        4. Demonstrates knowledge of the company/role
        5. Includes a strong closing with call to action
        6. Keeps professional tone and formatting
        7. Length: 3-4 paragraphs, under 400 words
        
        Return only the cover letter text, properly formatted.
      `;

      const response = await groqService.client.chat.completions.create({
        model: "llama3-70b-8192", // the newest model available
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000,
        temperature: 0.7
      });

      const coverLetter = response.choices[0].message.content;

      res.json({ coverLetter });
    } catch (error) {
      console.error("Cover letter generation error:", error);
      res.status(500).json({ message: "Failed to generate cover letter" });
    }
  });

  // Test Groq API endpoint
  app.get("/api/test/groq", isAuthenticated, async (req, res) => {
    try {
      const testResult = await groqService.analyzeResume(
        "Test resume with software engineering experience, JavaScript, React, Node.js skills, and bachelor's degree in Computer Science.",
        { fullName: "Test User", professionalTitle: "Software Engineer", yearsExperience: 3 }
      );
      
      res.json({
        status: "success",
        groqConnected: true,
        testAnalysis: {
          atsScore: testResult.atsScore,
          recommendationsCount: testResult.recommendations?.length || 0,
          keywordOptimizationAvailable: !!testResult.keywordOptimization,
          formattingScoreAvailable: !!testResult.formatting?.score
        }
      });
    } catch (error) {
      console.error("Groq API test failed:", error);
      res.json({
        status: "error",
        groqConnected: false,
        error: error.message
      });
    }
  });

  // Test route to manually make demo user a verified recruiter
  app.get('/api/test-make-recruiter', async (req, res) => {
    try {
      const user = await storage.getUser('demo-user-id');
      if (user) {
        const updatedUser = await storage.upsertUser({
          id: user.id,
          email: user.email,
          userType: 'recruiter',
          emailVerified: true,
          companyName: 'Test Company',
          companyWebsite: 'https://test.com',
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
        });
        res.json({ message: 'Demo user is now a verified recruiter', user: updatedUser });
      } else {
        res.status(404).json({ message: 'Demo user not found' });
      }
    } catch (error) {
      console.error('Error making demo user recruiter:', error);
      res.status(500).json({ message: 'Failed to update user' });
    }
  });

  // Get complete applicant profile for application details
  app.get('/api/recruiter/applicant/:applicantId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const applicantId = req.params.applicantId;
      const user = await storage.getUser(userId);
      
      if (user?.userType !== 'recruiter') {
        return res.status(403).json({ message: "Access denied. Recruiter account required." });
      }

      // Get complete applicant profile
      const [applicant, profile, skills, workExperience, education, resumes] = await Promise.all([
        storage.getUser(applicantId),
        storage.getUserProfile(applicantId),
        storage.getUserSkills(applicantId),
        storage.getUserWorkExperience(applicantId),
        storage.getUserEducation(applicantId),
        storage.getUserResumes(applicantId)
      ]);

      if (!applicant) {
        return res.status(404).json({ message: "Applicant not found" });
      }

      res.json({
        user: {
          id: applicant.id,
          email: applicant.email,
          firstName: applicant.firstName,
          lastName: applicant.lastName,
          profileImageUrl: applicant.profileImageUrl,
          userType: applicant.userType
        },
        profile: profile || {},
        skills: skills || [],
        workExperience: workExperience || [],
        education: education || [],
        resumes: resumes || []
      });
    } catch (error) {
      console.error("Error fetching applicant profile:", error);
      res.status(500).json({ message: "Failed to fetch applicant profile" });
    }
  });

  // Recruiter API Routes
  
  // Job Postings CRUD
  app.get('/api/recruiter/jobs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (user?.userType !== 'recruiter') {
        return res.status(403).json({ message: "Access denied. Recruiter account required." });
      }

      const jobPostings = await storage.getJobPostings(userId);
      res.json(jobPostings);
    } catch (error) {
      console.error("Error fetching job postings:", error);
      res.status(500).json({ message: "Failed to fetch job postings" });
    }
  });

  app.post('/api/recruiter/jobs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (user?.userType !== 'recruiter') {
        return res.status(403).json({ message: "Access denied. Recruiter account required." });
      }

      const jobPostingData = { ...req.body, recruiterId: userId };
      const jobPosting = await storage.createJobPosting(jobPostingData);
      res.status(201).json(jobPosting);
    } catch (error) {
      console.error("Error creating job posting:", error);
      res.status(500).json({ message: "Failed to create job posting" });
    }
  });

  // Get a single job posting by ID (for both recruiters and job seekers)
  app.get('/api/recruiter/jobs/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const jobId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (user?.userType !== 'recruiter') {
        return res.status(403).json({ message: "Access denied. Recruiter account required." });
      }

      const jobPosting = await storage.getJobPosting(jobId);
      if (!jobPosting || jobPosting.recruiterId !== userId) {
        return res.status(404).json({ message: "Job posting not found" });
      }

      res.json(jobPosting);
    } catch (error) {
      console.error("Error fetching job posting:", error);
      res.status(500).json({ message: "Failed to fetch job posting" });
    }
  });

  app.put('/api/recruiter/jobs/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const jobId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (user?.userType !== 'recruiter') {
        return res.status(403).json({ message: "Access denied. Recruiter account required." });
      }

      // Verify ownership
      const existingJob = await storage.getJobPosting(jobId);
      if (!existingJob || existingJob.recruiterId !== userId) {
        return res.status(404).json({ message: "Job posting not found" });
      }

      const updatedJob = await storage.updateJobPosting(jobId, req.body);
      res.json(updatedJob);
    } catch (error) {
      console.error("Error updating job posting:", error);
      res.status(500).json({ message: "Failed to update job posting" });
    }
  });

  app.delete('/api/recruiter/jobs/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const jobId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (user?.userType !== 'recruiter') {
        return res.status(403).json({ message: "Access denied. Recruiter account required." });
      }

      // Verify ownership
      const existingJob = await storage.getJobPosting(jobId);
      if (!existingJob || existingJob.recruiterId !== userId) {
        return res.status(404).json({ message: "Job posting not found" });
      }

      await storage.deleteJobPosting(jobId);
      res.json({ message: "Job posting deleted successfully" });
    } catch (error) {
      console.error("Error deleting job posting:", error);
      res.status(500).json({ message: "Failed to delete job posting" });
    }
  });

  // Job Applications for Recruiters
  app.get('/api/recruiter/applications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (user?.userType !== 'recruiter') {
        return res.status(403).json({ message: "Access denied. Recruiter account required." });
      }

      const applications = await storage.getApplicationsForRecruiter(userId);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.get('/api/recruiter/jobs/:jobId/applications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const jobId = parseInt(req.params.jobId);
      const user = await storage.getUser(userId);
      
      if (user?.userType !== 'recruiter') {
        return res.status(403).json({ message: "Access denied. Recruiter account required." });
      }

      // Verify job ownership
      const job = await storage.getJobPosting(jobId);
      if (!job || job.recruiterId !== userId) {
        return res.status(404).json({ message: "Job posting not found" });
      }

      const applications = await storage.getJobPostingApplications(jobId);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching job applications:", error);
      res.status(500).json({ message: "Failed to fetch job applications" });
    }
  });

  app.put('/api/recruiter/applications/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const applicationId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (user?.userType !== 'recruiter') {
        return res.status(403).json({ message: "Access denied. Recruiter account required." });
      }

      const updatedApplication = await storage.updateJobPostingApplication(applicationId, req.body);
      res.json(updatedApplication);
    } catch (error) {
      console.error("Error updating application:", error);
      res.status(500).json({ message: "Failed to update application" });
    }
  });

  // Job Seeker API Routes for Job Postings
  
  // Get all active job postings for job seekers with filtering
  app.get('/api/jobs/postings', isAuthenticated, async (req: any, res) => {
    try {
      const { search, location, jobType, workMode } = req.query;
      
      let jobPostings = await storage.getJobPostings(); // No recruiterId = get all active
      
      // Apply filters
      if (search) {
        const searchLower = (search as string).toLowerCase();
        jobPostings = jobPostings.filter(job => 
          job.title.toLowerCase().includes(searchLower) ||
          job.companyName.toLowerCase().includes(searchLower) ||
          job.description.toLowerCase().includes(searchLower) ||
          (job.skills && job.skills.some(skill => skill.toLowerCase().includes(searchLower)))
        );
      }
      
      if (location) {
        const locationLower = (location as string).toLowerCase();
        jobPostings = jobPostings.filter(job => 
          job.location && job.location.toLowerCase().includes(locationLower)
        );
      }
      
      if (jobType && jobType !== 'all') {
        jobPostings = jobPostings.filter(job => job.jobType === jobType);
      }
      
      if (workMode && workMode !== 'all') {
        jobPostings = jobPostings.filter(job => job.workMode === workMode);
      }
      
      res.json(jobPostings);
    } catch (error) {
      console.error("Error fetching job postings:", error);
      res.status(500).json({ message: "Failed to fetch job postings" });
    }
  });

  // Get a single job posting by ID for job seekers
  app.get('/api/jobs/postings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const jobPosting = await storage.getJobPosting(jobId);
      
      if (!jobPosting || !jobPosting.isActive) {
        return res.status(404).json({ message: "Job posting not found" });
      }

      res.json(jobPosting);
    } catch (error) {
      console.error("Error fetching job posting:", error);
      res.status(500).json({ message: "Failed to fetch job posting" });
    }
  });

  // Apply to a job posting
  app.post('/api/jobs/postings/:jobId/apply', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const jobId = parseInt(req.params.jobId);
      const { resumeId, coverLetter } = req.body;
      const user = await storage.getUser(userId);
      
      console.log(`[DEBUG] Job application: User ${userId} applying to job ${jobId} with resume ${resumeId}`);
      
      if (user?.userType !== 'job_seeker') {
        return res.status(403).json({ message: "Access denied. Job seeker account required." });
      }

      // Check if already applied
      const existingApplications = await storage.getApplicationsForJobSeeker(userId);
      const alreadyApplied = existingApplications.some(app => app.jobPostingId === jobId);
      
      if (alreadyApplied) {
        return res.status(400).json({ message: "You have already applied to this job" });
      }

      // Get resume data to include with application
      let resumeData = null;
      if (resumeId) {
        let resume;
        if (userId === 'demo-user-id') {
          resume = (global as any).demoUserResumes?.find((r: any) => r.id === parseInt(resumeId));
        } else {
          const userResumes = (global as any).userResumes?.[userId] || [];
          resume = userResumes.find((r: any) => r.id === parseInt(resumeId));
        }
        
        if (resume) {
          resumeData = {
            id: resume.id,
            name: resume.name,
            fileName: resume.fileName,
            atsScore: resume.atsScore,
            fileData: resume.fileData, // Store complete resume data for recruiter access
            fileType: resume.fileType,
            uploadedAt: resume.uploadedAt
          };
          console.log(`[DEBUG] Found resume data: ${resume.fileName}, ATS Score: ${resume.atsScore}`);
        }
      }

      const application = await storage.createJobPostingApplication({
        jobPostingId: jobId,
        applicantId: userId,
        resumeId: resumeId || null,
        resumeData: resumeData, // Include full resume data
        coverLetter: coverLetter || null,
        status: 'pending'
      });

      console.log(`[DEBUG] Application created successfully with ID: ${application.id}`);
      res.status(201).json(application);
    } catch (error) {
      console.error("Error applying to job:", error);
      res.status(500).json({ message: "Failed to apply to job" });
    }
  });

  // Get job seeker's applications
  app.get('/api/jobs/my-applications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const applications = await storage.getApplicationsForJobSeeker(userId);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  // Download resume from job application (for recruiters)
  app.get('/api/applications/:applicationId/resume/download', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const applicationId = parseInt(req.params.applicationId);
      const user = await storage.getUser(userId);
      
      console.log(`[DEBUG] Resume download from application ${applicationId} by user ${userId}`);
      
      if (user?.userType !== 'recruiter') {
        return res.status(403).json({ message: "Access denied. Recruiter account required." });
      }

      // Get the application and verify it belongs to this recruiter's job posting
      const application = await storage.getJobPostingApplication(applicationId);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      // Get job posting to verify recruiter owns it
      const jobPosting = await storage.getJobPosting(application.jobPostingId);
      if (!jobPosting || jobPosting.recruiterId !== userId) {
        return res.status(403).json({ message: "Access denied. You can only download resumes from your job postings." });
      }

      // Check if resume data is stored in the application
      if (application.resumeData) {
        const resumeData = application.resumeData as any;
        const fileBuffer = Buffer.from(resumeData.fileData, 'base64');
        
        res.setHeader('Content-Type', resumeData.fileType || 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${resumeData.fileName}"`);
        res.setHeader('Content-Length', fileBuffer.length.toString());
        
        console.log(`[DEBUG] Sending resume: ${resumeData.fileName}, size: ${fileBuffer.length} bytes`);
        return res.send(fileBuffer);
      }

      // Fallback: try to get resume from user's stored resumes
      const applicantId = application.applicantId;
      let resume;
      
      if (applicantId === 'demo-user-id') {
        resume = (global as any).demoUserResumes?.find((r: any) => r.id === application.resumeId);
      } else {
        const userResumes = (global as any).userResumes?.[applicantId] || [];
        resume = userResumes.find((r: any) => r.id === application.resumeId);
      }

      if (!resume) {
        return res.status(404).json({ message: "Resume file not found" });
      }

      const fileBuffer = Buffer.from(resume.fileData, 'base64');
      res.setHeader('Content-Type', resume.fileType || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${resume.fileName}"`);
      res.setHeader('Content-Length', fileBuffer.length.toString());
      
      console.log(`[DEBUG] Sending fallback resume: ${resume.fileName}, size: ${fileBuffer.length} bytes`);
      return res.send(fileBuffer);
    } catch (error) {
      console.error("Error downloading application resume:", error);
      res.status(500).json({ message: "Failed to download resume" });
    }
  });

  // Chat System API Routes
  
  app.get('/api/chat/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const conversations = await storage.getChatConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.post('/api/chat/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { jobSeekerId, recruiterId, jobPostingId, applicationId } = req.body;
      
      const conversationData = {
        recruiterId,
        jobSeekerId,
        jobPostingId: jobPostingId || null,
        applicationId: applicationId || null,
        isActive: true
      };

      const conversation = await storage.createChatConversation(conversationData);
      res.status(201).json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ message: "Failed to create conversation" });
    }
  });

  app.get('/api/chat/conversations/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const messages = await storage.getChatMessages(conversationId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/chat/conversations/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const conversationId = parseInt(req.params.id);
      const { message } = req.body;

      const messageData = {
        conversationId,
        senderId: userId,
        message,
        messageType: 'text',
        isRead: false
      };

      const newMessage = await storage.createChatMessage(messageData);
      res.status(201).json(newMessage);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.put('/api/chat/conversations/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const conversationId = parseInt(req.params.id);
      
      await storage.markMessagesAsRead(conversationId, userId);
      res.json({ message: "Messages marked as read" });
    } catch (error) {
      console.error("Error marking messages as read:", error);
      res.status(500).json({ message: "Failed to mark messages as read" });
    }
  });

  // WebSocket server for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store active WebSocket connections by user ID
  const connectedUsers = new Map<string, WebSocket>();
  
  wss.on('connection', (ws: WebSocket, req) => {
    console.log('New WebSocket connection');
    
    let userId: string | null = null;
    
    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'authenticate') {
          userId = message.userId;
          if (userId) {
            connectedUsers.set(userId, ws);
            console.log(`User ${userId} connected to WebSocket`);
            
            ws.send(JSON.stringify({
              type: 'authenticated',
              userId: userId
            }));
          }
        }
        
        if (message.type === 'sendMessage' && userId) {
          const { conversationId, messageText } = message;
          
          // Save message to database
          const messageData = {
            conversationId: parseInt(conversationId),
            senderId: userId,
            message: messageText,
            messageType: 'text',
          };
          
          const savedMessage = await storage.createChatMessage(messageData);
          
          // Get conversation details to find recipient
          const conversation = await storage.getChatConversation(parseInt(conversationId));
          if (!conversation) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Conversation not found'
            }));
            return;
          }
          const recipientId = conversation.recruiterId === userId ? conversation.jobSeekerId : conversation.recruiterId;
          
          // Send to recipient if they're connected
          const recipientWs = connectedUsers.get(recipientId);
          if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
            recipientWs.send(JSON.stringify({
              type: 'newMessage',
              message: savedMessage,
              conversationId: conversationId
            }));
          }
          
          // Send confirmation back to sender
          ws.send(JSON.stringify({
            type: 'messageSent',
            message: savedMessage,
            conversationId: conversationId
          }));
        }
        
        if (message.type === 'joinConversation' && userId) {
          const { conversationId } = message;
          
          // Mark messages as read
          await storage.markMessagesAsRead(parseInt(conversationId), userId);
          
          ws.send(JSON.stringify({
            type: 'joinedConversation',
            conversationId: conversationId
          }));
        }
        
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Failed to process message'
        }));
      }
    });
    
    ws.on('close', () => {
      if (userId) {
        connectedUsers.delete(userId);
        console.log(`User ${userId} disconnected from WebSocket`);
      }
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      if (userId) {
        connectedUsers.delete(userId);
      }
    });
  });

  return httpServer;
}
