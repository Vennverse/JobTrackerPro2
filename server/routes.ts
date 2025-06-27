import type { Express } from "express";
import { createServer, type Server } from "http";
import path from "path";
import fs from "fs";
import multer from "multer";
// Dynamic import for pdf-parse to avoid startup issues
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { groqService } from "./groqService";
import { subscriptionService, USAGE_LIMITS } from "./subscriptionService";
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
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.claims.sub;
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

  // Profile routes
  app.get('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getUserProfile(userId);
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.post('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = insertUserProfileSchema.parse({ ...req.body, userId });
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
      const userId = req.user.claims.sub;
      const skills = await storage.getUserSkills(userId);
      res.json(skills);
    } catch (error) {
      console.error("Error fetching skills:", error);
      res.status(500).json({ message: "Failed to fetch skills" });
    }
  });

  app.post('/api/skills', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      const education = await storage.getUserEducation(userId);
      res.json(education);
    } catch (error) {
      console.error("Error fetching education:", error);
      res.status(500).json({ message: "Failed to fetch education" });
    }
  });

  // Job applications routes
  app.get('/api/applications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // For demo user, return empty array or sample data
      if (userId === 'demo-user-id') {
        return res.json([]);
      }
      
      const applications = await storage.getUserApplications(userId);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.post('/api/applications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  // Application statistics
  app.get('/api/applications/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // For demo user, return sample stats
      if (userId === 'demo-user-id') {
        return res.json({
          totalApplications: 0,
          interviews: 0,
          responseRate: 0,
          avgMatchScore: 0
        });
      }
      
      const stats = await storage.getApplicationStats(userId);
      res.json(stats);
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
      const userId = req.user.claims.sub;
      const recommendations = await storage.getUserRecommendations(userId);
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      res.status(500).json({ message: "Failed to fetch recommendations" });
    }
  });

  app.post('/api/recommendations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      
      if (!req.file) {
        return res.status(400).json({ message: "No resume file uploaded" });
      }

      let resumeText = '';
      
      // Extract text from PDF
      if (req.file.mimetype === 'application/pdf') {
        try {
          const pdfParseModule = await import('pdf-parse');
          const pdfData = await pdfParseModule.default(req.file.buffer);
          resumeText = pdfData.text;
        } catch (error) {
          console.error("Error parsing PDF:", error);
          return res.status(400).json({ message: "Failed to parse PDF file" });
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
      
      // Analyze resume with Groq AI
      const analysis = await groqService.analyzeResume(resumeText, profile);
      
      // Save resume data to profile
      const resumeFileName = `resume_${userId}_${Date.now()}.pdf`;
      await storage.upsertUserProfile({
        userId,
        resumeText,
        resumeFileName,
        atsScore: analysis.atsScore,
        atsAnalysis: analysis,
        atsRecommendations: analysis.recommendations,
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
      const userId = req.user.claims.sub;
      const profile = await storage.getUserProfile(userId);
      
      if (!profile?.atsAnalysis) {
        return res.status(404).json({ message: "No resume analysis found" });
      }

      res.json({
        atsScore: profile.atsScore,
        analysis: profile.atsAnalysis,
        recommendations: profile.atsRecommendations,
        lastAnalysis: profile.lastResumeAnalysis,
        hasResume: !!profile.resumeText
      });
    } catch (error) {
      console.error("Error fetching resume analysis:", error);
      res.status(500).json({ message: "Failed to fetch resume analysis" });
    }
  });

  // Enhanced Job Analysis Routes with Groq AI (with usage limit)
  app.post('/api/jobs/analyze', isAuthenticated, checkUsageLimit('jobAnalyses'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { jobUrl, jobTitle, company, jobDescription, requirements, qualifications, benefits } = req.body;

      if (!jobUrl || !jobTitle || !company || !jobDescription) {
        return res.status(400).json({ 
          message: "Job URL, title, company, and description are required" 
        });
      }

      // Check if we already have a recent analysis for this job
      const existingAnalysis = await storage.getJobAnalysisByUrl(userId, jobUrl);
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      if (existingAnalysis && existingAnalysis.createdAt && existingAnalysis.createdAt > oneHourAgo) {
        return res.json(existingAnalysis);
      }

      // Get comprehensive user profile for analysis
      const [profile, skills, workExperience, education] = await Promise.all([
        storage.getUserProfile(userId),
        storage.getUserSkills(userId),
        storage.getUserWorkExperience(userId),
        storage.getUserEducation(userId)
      ]);

      if (!profile) {
        return res.status(400).json({ 
          message: "Please complete your profile before analyzing jobs" 
        });
      }

      const userProfile = {
        skills: skills.map(skill => ({
          skillName: skill.skillName,
          proficiencyLevel: skill.proficiencyLevel || undefined,
          yearsExperience: skill.yearsExperience || undefined
        })),
        workExperience: workExperience.map(exp => ({
          position: exp.position,
          company: exp.company,
          description: exp.description || undefined
        })),
        education: education.map(edu => ({
          degree: edu.degree,
          fieldOfStudy: edu.fieldOfStudy || undefined,
          institution: edu.institution
        })),
        yearsExperience: profile.yearsExperience || undefined,
        professionalTitle: profile.professionalTitle || undefined,
        summary: profile.summary || undefined
      };

      const jobData = {
        title: jobTitle,
        company,
        description: jobDescription,
        requirements,
        qualifications,
        benefits
      };

      const startTime = Date.now();
      
      // Analyze job match with Groq AI
      const analysis = await groqService.analyzeJobMatch(jobData, userProfile);
      
      const processingTime = Date.now() - startTime;

      // Save analysis to database
      const jobAnalysis = await storage.addJobAnalysis({
        userId,
        jobUrl,
        jobTitle,
        company,
        jobDescription,
        requirements,
        qualifications,
        benefits,
        matchScore: analysis.matchScore,
        matchingSkills: analysis.matchingSkills,
        missingSkills: analysis.missingSkills,
        skillGaps: analysis.skillGaps,
        seniorityLevel: analysis.seniorityLevel,
        workMode: analysis.workMode,
        jobType: analysis.jobType,
        salaryRange: undefined, // Will be extracted separately
        location: undefined, // Will be extracted separately
        roleComplexity: analysis.roleComplexity,
        careerProgression: analysis.careerProgression,
        industryFit: analysis.industryFit,
        cultureFit: analysis.cultureFit,
        applicationRecommendation: analysis.applicationRecommendation,
        tailoringAdvice: analysis.tailoringAdvice,
        interviewPrepTips: analysis.interviewPrepTips,
        processingTime
      });

      // Track usage after successful analysis
      await trackUsage(req);

      res.json(jobAnalysis);
    } catch (error) {
      console.error("Error analyzing job:", error);
      res.status(500).json({ message: "Failed to analyze job" });
    }
  });

  app.get('/api/jobs/analyses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const hasEducation = education.length > 0;

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
      const onboardingCompleted = completedSteps === completionSteps.length;

      // Update profile completion status
      if (profile) {
        await storage.upsertUserProfile({
          userId,
          profileCompletion: profileCompleteness,
          onboardingCompleted
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
      const userId = req.user.claims.sub;
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

  // Subscription Management Routes (PayPal Integration for India support)
  app.get('/api/subscription/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      const { paypalOrderId, paypalSubscriptionId } = req.body;
      
      if (!paypalOrderId || !paypalSubscriptionId) {
        return res.status(400).json({ message: "PayPal order ID and subscription ID are required" });
      }

      // Update user subscription to premium
      await subscriptionService.updateUserSubscription(userId, {
        planType: 'premium',
        subscriptionStatus: 'active',
        paypalSubscriptionId,
        paypalOrderId,
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
      const userId = req.user.claims.sub;
      
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
      const userId = req.user.claims.sub;
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

  const httpServer = createServer(app);
  return httpServer;
}
