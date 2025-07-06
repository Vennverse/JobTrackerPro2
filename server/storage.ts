import {
  users,
  userProfiles,
  userSkills,
  workExperience,
  education,
  jobApplications,
  jobRecommendations,
  aiJobAnalyses,
  resumes,
  jobPostings,
  jobPostingApplications,
  chatConversations,
  chatMessages,
  emailVerificationTokens,
  passwordResetTokens,
  type User,
  type UpsertUser,
  type UserProfile,
  type InsertUserProfile,
  type UserSkill,
  type InsertUserSkill,
  type WorkExperience,
  type InsertWorkExperience,
  type Education,
  type InsertEducation,
  type JobApplication,
  type InsertJobApplication,
  type JobRecommendation,
  type InsertJobRecommendation,
  type AiJobAnalysis,
  type InsertAiJobAnalysis,
  type Resume,
  type InsertResume,
  type JobPosting,
  type InsertJobPosting,
  type JobPostingApplication,
  type InsertJobPostingApplication,
  type ChatConversation,
  type InsertChatConversation,
  type ChatMessage,
  type InsertChatMessage,
  type EmailVerificationToken,
  type InsertEmailVerificationToken,
  type PasswordResetToken,
  type InsertPasswordResetToken,
} from "@shared/schema";
import { db } from "./db";

// Helper function to handle database errors gracefully
async function handleDbOperation<T>(operation: () => Promise<T>, fallback?: T): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    if (error.message?.includes('endpoint is disabled') || error.message?.includes('Control plane request failed')) {
      console.warn('Database operation failed due to Replit DB issues, using fallback');
      if (fallback !== undefined) {
        return fallback;
      }
      throw new Error('Database temporarily unavailable');
    }
    throw error;
  }
}
import { eq, desc, and, or, ne, sql, lt } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserRole(userId: string, role: string): Promise<User>;
  
  // Resume operations
  getUserResumes(userId: string): Promise<any[]>;
  
  // Profile operations
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  upsertUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  
  // Skills operations
  getUserSkills(userId: string): Promise<UserSkill[]>;
  addUserSkill(skill: InsertUserSkill): Promise<UserSkill>;
  deleteUserSkill(id: number): Promise<void>;
  
  // Work experience operations
  getUserWorkExperience(userId: string): Promise<WorkExperience[]>;
  addWorkExperience(experience: InsertWorkExperience): Promise<WorkExperience>;
  updateWorkExperience(id: number, experience: Partial<InsertWorkExperience>): Promise<WorkExperience>;
  deleteWorkExperience(id: number): Promise<void>;
  
  // Education operations
  getUserEducation(userId: string): Promise<Education[]>;
  addEducation(education: InsertEducation): Promise<Education>;
  updateEducation(id: number, education: Partial<InsertEducation>): Promise<Education>;
  deleteEducation(id: number): Promise<void>;
  
  // Job applications operations
  getUserApplications(userId: string): Promise<JobApplication[]>;
  addJobApplication(application: InsertJobApplication): Promise<JobApplication>;
  updateJobApplication(id: number, application: Partial<InsertJobApplication>): Promise<JobApplication>;
  deleteJobApplication(id: number): Promise<void>;
  getApplicationStats(userId: string): Promise<{
    totalApplications: number;
    interviews: number;
    responseRate: number;
    avgMatchScore: number;
  }>;
  
  // Job recommendations operations
  getUserRecommendations(userId: string): Promise<JobRecommendation[]>;
  addJobRecommendation(recommendation: InsertJobRecommendation): Promise<JobRecommendation>;
  updateJobRecommendation(id: number, recommendation: Partial<InsertJobRecommendation>): Promise<JobRecommendation>;
  toggleBookmark(id: number): Promise<JobRecommendation>;
  
  // AI Job Analysis operations
  getUserJobAnalyses(userId: string): Promise<AiJobAnalysis[]>;
  addJobAnalysis(analysis: InsertAiJobAnalysis): Promise<AiJobAnalysis>;
  getJobAnalysisByUrl(userId: string, jobUrl: string): Promise<AiJobAnalysis | undefined>;
  updateJobAnalysis(id: number, analysis: Partial<InsertAiJobAnalysis>): Promise<AiJobAnalysis>;
  
  // Subscription operations
  updateUserSubscription(userId: string, subscriptionData: {
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    paypalSubscriptionId?: string;
    paypalOrderId?: string;
    subscriptionStatus?: string;
    planType?: string;
    subscriptionStartDate?: Date;
    subscriptionEndDate?: Date;
  }): Promise<User>;
  getUserByPaypalSubscription(paypalSubscriptionId: string): Promise<User | undefined>;

  // Recruiter operations
  // Job postings
  getJobPostings(recruiterId?: string): Promise<JobPosting[]>;
  getJobPosting(id: number): Promise<JobPosting | undefined>;
  createJobPosting(jobPosting: InsertJobPosting): Promise<JobPosting>;
  updateJobPosting(id: number, jobPosting: Partial<InsertJobPosting>): Promise<JobPosting>;
  deleteJobPosting(id: number): Promise<void>;
  incrementJobPostingViews(id: number): Promise<void>;
  
  // Job posting applications
  getJobPostingApplications(jobPostingId: number): Promise<JobPostingApplication[]>;
  getJobPostingApplication(id: number): Promise<JobPostingApplication | undefined>;
  getApplicationsForRecruiter(recruiterId: string): Promise<JobPostingApplication[]>;
  getApplicationsForJobSeeker(jobSeekerId: string): Promise<JobPostingApplication[]>;
  createJobPostingApplication(application: InsertJobPostingApplication): Promise<JobPostingApplication>;
  updateJobPostingApplication(id: number, application: Partial<InsertJobPostingApplication>): Promise<JobPostingApplication>;
  deleteJobPostingApplication(id: number): Promise<void>;
  
  // Chat system
  getChatConversations(userId: string): Promise<ChatConversation[]>;
  getChatConversation(id: number): Promise<ChatConversation | undefined>;
  createChatConversation(conversation: InsertChatConversation): Promise<ChatConversation>;
  getChatMessages(conversationId: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  markMessagesAsRead(conversationId: number, userId: string): Promise<void>;
  
  // Email verification
  createEmailVerificationToken(token: InsertEmailVerificationToken): Promise<EmailVerificationToken>;
  getEmailVerificationToken(token: string): Promise<EmailVerificationToken | undefined>;
  deleteEmailVerificationToken(token: string): Promise<void>;
  deleteEmailVerificationTokensByUserId(userId: string): Promise<void>;
  updateUserEmailVerification(userId: string, verified: boolean): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
  async getUser(id: string): Promise<User | undefined> {
    return await handleDbOperation(async () => {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    }, undefined);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return await handleDbOperation(async () => {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      return user;
    }, undefined);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    return await handleDbOperation(async () => {
      const [user] = await db
        .insert(users)
        .values(userData)
        .onConflictDoUpdate({
          target: users.id,
          set: {
            ...userData,
            updatedAt: new Date(),
          },
        })
        .returning();
      return user;
    }, userData as User);
  }

  async updateUserRole(userId: string, role: string): Promise<User> {
    return await handleDbOperation(async () => {
      const [user] = await db
        .update(users)
        .set({ 
          currentRole: role,
          userType: role,
          updatedAt: new Date() 
        })
        .where(eq(users.id, userId))
        .returning();
      return user;
    });
  }

  // Profile operations
  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId));
    return profile;
  }

  async upsertUserProfile(profileData: InsertUserProfile): Promise<UserProfile> {
    const existing = await this.getUserProfile(profileData.userId);
    
    if (existing) {
      const [profile] = await db
        .update(userProfiles)
        .set({ ...profileData, updatedAt: new Date() })
        .where(eq(userProfiles.userId, profileData.userId))
        .returning();
      return profile;
    } else {
      const [profile] = await db
        .insert(userProfiles)
        .values(profileData)
        .returning();
      return profile;
    }
  }

  // Skills operations
  async getUserSkills(userId: string): Promise<UserSkill[]> {
    return await db
      .select()
      .from(userSkills)
      .where(eq(userSkills.userId, userId));
  }

  async addUserSkill(skill: InsertUserSkill): Promise<UserSkill> {
    const [newSkill] = await db
      .insert(userSkills)
      .values(skill)
      .returning();
    return newSkill;
  }

  async deleteUserSkill(id: number): Promise<void> {
    await db.delete(userSkills).where(eq(userSkills.id, id));
  }

  // Work experience operations
  async getUserWorkExperience(userId: string): Promise<WorkExperience[]> {
    return await db
      .select()
      .from(workExperience)
      .where(eq(workExperience.userId, userId))
      .orderBy(desc(workExperience.startDate));
  }

  async addWorkExperience(experience: InsertWorkExperience): Promise<WorkExperience> {
    const [newExperience] = await db
      .insert(workExperience)
      .values(experience)
      .returning();
    return newExperience;
  }

  async updateWorkExperience(id: number, experienceData: Partial<InsertWorkExperience>): Promise<WorkExperience> {
    const [updatedExperience] = await db
      .update(workExperience)
      .set(experienceData)
      .where(eq(workExperience.id, id))
      .returning();
    return updatedExperience;
  }

  async deleteWorkExperience(id: number): Promise<void> {
    await db.delete(workExperience).where(eq(workExperience.id, id));
  }

  // Education operations
  async getUserEducation(userId: string): Promise<Education[]> {
    return await db
      .select()
      .from(education)
      .where(eq(education.userId, userId))
      .orderBy(desc(education.startDate));
  }

  async addEducation(educationData: InsertEducation): Promise<Education> {
    const [newEducation] = await db
      .insert(education)
      .values(educationData)
      .returning();
    return newEducation;
  }

  async updateEducation(id: number, educationData: Partial<InsertEducation>): Promise<Education> {
    const [updatedEducation] = await db
      .update(education)
      .set(educationData)
      .where(eq(education.id, id))
      .returning();
    return updatedEducation;
  }

  async deleteEducation(id: number): Promise<void> {
    await db.delete(education).where(eq(education.id, id));
  }

  // Job applications operations
  async getUserApplications(userId: string): Promise<JobApplication[]> {
    return await db
      .select()
      .from(jobApplications)
      .where(eq(jobApplications.userId, userId))
      .orderBy(desc(jobApplications.appliedDate));
  }

  async addJobApplication(application: InsertJobApplication): Promise<JobApplication> {
    const [newApplication] = await db
      .insert(jobApplications)
      .values(application)
      .returning();
    return newApplication;
  }

  async updateJobApplication(id: number, applicationData: Partial<InsertJobApplication>): Promise<JobApplication> {
    const [updatedApplication] = await db
      .update(jobApplications)
      .set({ ...applicationData, lastUpdated: new Date() })
      .where(eq(jobApplications.id, id))
      .returning();
    return updatedApplication;
  }

  async deleteJobApplication(id: number): Promise<void> {
    await db.delete(jobApplications).where(eq(jobApplications.id, id));
  }

  async getApplicationStats(userId: string): Promise<{
    totalApplications: number;
    interviews: number;
    responseRate: number;
    avgMatchScore: number;
  }> {
    const applications = await this.getUserApplications(userId);
    
    const totalApplications = applications.length;
    const interviews = applications.filter(app => app.status === 'interview' || app.status === 'offer').length;
    const responseRate = totalApplications > 0 ? Math.round((interviews / totalApplications) * 100) : 0;
    const avgMatchScore = applications.length > 0 
      ? Math.round(applications.reduce((sum, app) => sum + (app.matchScore || 0), 0) / applications.length)
      : 0;

    return {
      totalApplications,
      interviews,
      responseRate,
      avgMatchScore,
    };
  }

  // Job recommendations operations
  async getUserRecommendations(userId: string): Promise<JobRecommendation[]> {
    return await db
      .select()
      .from(jobRecommendations)
      .where(eq(jobRecommendations.userId, userId))
      .orderBy(desc(jobRecommendations.matchScore));
  }

  async addJobRecommendation(recommendation: InsertJobRecommendation): Promise<JobRecommendation> {
    const [newRecommendation] = await db
      .insert(jobRecommendations)
      .values(recommendation)
      .returning();
    return newRecommendation;
  }

  async updateJobRecommendation(id: number, recommendationData: Partial<InsertJobRecommendation>): Promise<JobRecommendation> {
    const [updatedRecommendation] = await db
      .update(jobRecommendations)
      .set(recommendationData)
      .where(eq(jobRecommendations.id, id))
      .returning();
    return updatedRecommendation;
  }

  async toggleBookmark(id: number): Promise<JobRecommendation> {
    const [recommendation] = await db
      .select()
      .from(jobRecommendations)
      .where(eq(jobRecommendations.id, id));
    
    const [updated] = await db
      .update(jobRecommendations)
      .set({ isBookmarked: !recommendation.isBookmarked })
      .where(eq(jobRecommendations.id, id))
      .returning();
    
    return updated;
  }

  // AI Job Analysis operations
  async getUserJobAnalyses(userId: string): Promise<AiJobAnalysis[]> {
    return await db
      .select()
      .from(aiJobAnalyses)
      .where(eq(aiJobAnalyses.userId, userId))
      .orderBy(desc(aiJobAnalyses.createdAt));
  }

  async addJobAnalysis(analysis: InsertAiJobAnalysis): Promise<AiJobAnalysis> {
    const [newAnalysis] = await db
      .insert(aiJobAnalyses)
      .values(analysis)
      .returning();
    return newAnalysis;
  }

  async getJobAnalysisByUrl(userId: string, jobUrl: string): Promise<AiJobAnalysis | undefined> {
    const [analysis] = await db
      .select()
      .from(aiJobAnalyses)
      .where(and(eq(aiJobAnalyses.userId, userId), eq(aiJobAnalyses.jobUrl, jobUrl)))
      .orderBy(desc(aiJobAnalyses.createdAt));
    return analysis;
  }

  async updateJobAnalysis(id: number, analysisData: Partial<InsertAiJobAnalysis>): Promise<AiJobAnalysis> {
    const [updatedAnalysis] = await db
      .update(aiJobAnalyses)
      .set(analysisData)
      .where(eq(aiJobAnalyses.id, id))
      .returning();
    return updatedAnalysis;
  }

  async updateUserSubscription(userId: string, subscriptionData: {
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    paypalSubscriptionId?: string;
    paypalOrderId?: string;
    subscriptionStatus?: string;
    planType?: string;
    subscriptionStartDate?: Date;
    subscriptionEndDate?: Date;
  }): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...subscriptionData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getUserByPaypalSubscription(paypalSubscriptionId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.paypalSubscriptionId, paypalSubscriptionId));
    return user;
  }

  // Resume operations for demo user
  async getUserResumes(userId: string): Promise<any[]> {
    // For demo user, manage state in memory
    if (userId === 'demo-user-id') {
      // Initialize with demo resume if no uploads exist
      if (!(global as any).demoUserResumes) {
        (global as any).demoUserResumes = [
          {
            id: 1,
            name: "Demo Resume",
            fileName: "demo_resume.pdf",
            isActive: true,
            atsScore: 85,
            uploadedAt: new Date('2024-01-15'),
            fileSize: 245000,
            fileType: 'application/pdf',
            analysis: {
              atsScore: 85,
              recommendations: ["Add more technical keywords", "Improve formatting"],
              keywordOptimization: {
                missingKeywords: ["React", "TypeScript"],
                overusedKeywords: [],
                suggestions: ["Include specific technologies"]
              },
              formatting: {
                score: 80,
                issues: ["Inconsistent spacing"],
                improvements: ["Use consistent bullet points"]
              },
              content: {
                strengthsFound: ["Strong technical background"],
                weaknesses: ["Could add more quantified achievements"],
                suggestions: ["Include metrics and numbers"]
              }
            }
          }
        ];
      }
      
      return (global as any).demoUserResumes;
    }
    
    // For real users, query the database
    try {
      console.log(`[DEBUG] Fetching resumes for user: ${userId}`);
      const userResumes = await db.select().from(resumes).where(eq(resumes.userId, userId));
      console.log(`[DEBUG] Found ${userResumes.length} resumes for user ${userId}`);
      const formattedResumes = userResumes.map(resume => ({
        id: resume.id,
        filename: resume.fileName,
        text: resume.resumeText,
        atsScore: resume.atsScore,
        uploadedAt: resume.createdAt,
        userId: resume.userId,
        fileSize: resume.fileSize,
        fileType: resume.mimeType,
        analysis: resume.analysisData || null
      }));
      console.log(`[DEBUG] Returning ${formattedResumes.length} formatted resumes for user ${userId}`);
      return formattedResumes;
    } catch (error) {
      console.error(`[ERROR] Failed to fetch resumes for user ${userId}:`, error);
      return [];
    }
  }

  // Recruiter operations - Job postings
  async getJobPostings(recruiterId?: string): Promise<JobPosting[]> {
    return await handleDbOperation(async () => {
      if (recruiterId) {
        return await db.select().from(jobPostings).where(eq(jobPostings.recruiterId, recruiterId)).orderBy(desc(jobPostings.createdAt));
      }
      return await db.select().from(jobPostings).where(eq(jobPostings.isActive, true)).orderBy(desc(jobPostings.createdAt));
    }, []);
  }

  async getJobPosting(id: number): Promise<JobPosting | undefined> {
    return await handleDbOperation(async () => {
      const [jobPosting] = await db.select().from(jobPostings).where(eq(jobPostings.id, id));
      return jobPosting;
    });
  }

  async createJobPosting(jobPostingData: InsertJobPosting): Promise<JobPosting> {
    return await handleDbOperation(async () => {
      const [jobPosting] = await db.insert(jobPostings).values(jobPostingData).returning();
      return jobPosting;
    });
  }

  async updateJobPosting(id: number, jobPostingData: Partial<InsertJobPosting>): Promise<JobPosting> {
    return await handleDbOperation(async () => {
      const [jobPosting] = await db
        .update(jobPostings)
        .set({ ...jobPostingData, updatedAt: new Date() })
        .where(eq(jobPostings.id, id))
        .returning();
      return jobPosting;
    });
  }

  async deleteJobPosting(id: number): Promise<void> {
    await handleDbOperation(async () => {
      await db.delete(jobPostings).where(eq(jobPostings.id, id));
    });
  }

  async incrementJobPostingViews(id: number): Promise<void> {
    await handleDbOperation(async () => {
      await db
        .update(jobPostings)
        .set({ viewsCount: sql`${jobPostings.viewsCount} + 1` })
        .where(eq(jobPostings.id, id));
    });
  }

  // Job posting applications
  async getJobPostingApplications(jobPostingId: number): Promise<JobPostingApplication[]> {
    return await handleDbOperation(async () => {
      return await db.select().from(jobPostingApplications).where(eq(jobPostingApplications.jobPostingId, jobPostingId)).orderBy(desc(jobPostingApplications.appliedAt));
    }, []);
  }

  async getJobPostingApplication(id: number): Promise<JobPostingApplication | undefined> {
    return await handleDbOperation(async () => {
      const [application] = await db.select().from(jobPostingApplications).where(eq(jobPostingApplications.id, id));
      return application;
    });
  }

  async getApplicationsForRecruiter(recruiterId: string): Promise<JobPostingApplication[]> {
    return await handleDbOperation(async () => {
      return await db
        .select({
          id: jobPostingApplications.id,
          jobPostingId: jobPostingApplications.jobPostingId,
          applicantId: jobPostingApplications.applicantId,
          resumeId: jobPostingApplications.resumeId,
          coverLetter: jobPostingApplications.coverLetter,
          status: jobPostingApplications.status,
          matchScore: jobPostingApplications.matchScore,
          recruiterNotes: jobPostingApplications.recruiterNotes,
          appliedAt: jobPostingApplications.appliedAt,
          reviewedAt: jobPostingApplications.reviewedAt,
          updatedAt: jobPostingApplications.updatedAt,
        })
        .from(jobPostingApplications)
        .innerJoin(jobPostings, eq(jobPostingApplications.jobPostingId, jobPostings.id))
        .where(eq(jobPostings.recruiterId, recruiterId))
        .orderBy(desc(jobPostingApplications.appliedAt));
    }, []);
  }

  async getApplicationsForJobSeeker(jobSeekerId: string): Promise<JobPostingApplication[]> {
    return await handleDbOperation(async () => {
      return await db.select().from(jobPostingApplications).where(eq(jobPostingApplications.applicantId, jobSeekerId)).orderBy(desc(jobPostingApplications.appliedAt));
    }, []);
  }

  async createJobPostingApplication(applicationData: InsertJobPostingApplication): Promise<JobPostingApplication> {
    return await handleDbOperation(async () => {
      const [application] = await db.insert(jobPostingApplications).values(applicationData).returning();
      
      // Increment applications count
      await db
        .update(jobPostings)
        .set({ applicationsCount: sql`${jobPostings.applicationsCount} + 1` })
        .where(eq(jobPostings.id, applicationData.jobPostingId));
      
      return application;
    });
  }

  async updateJobPostingApplication(id: number, applicationData: Partial<InsertJobPostingApplication>): Promise<JobPostingApplication> {
    return await handleDbOperation(async () => {
      const [application] = await db
        .update(jobPostingApplications)
        .set({ ...applicationData, updatedAt: new Date() })
        .where(eq(jobPostingApplications.id, id))
        .returning();
      return application;
    });
  }

  async deleteJobPostingApplication(id: number): Promise<void> {
    await handleDbOperation(async () => {
      await db.delete(jobPostingApplications).where(eq(jobPostingApplications.id, id));
    });
  }

  // Chat system
  async getChatConversations(userId: string): Promise<ChatConversation[]> {
    return await handleDbOperation(async () => {
      return await db
        .select()
        .from(chatConversations)
        .where(
          or(
            eq(chatConversations.recruiterId, userId),
            eq(chatConversations.jobSeekerId, userId)
          )
        )
        .orderBy(desc(chatConversations.lastMessageAt));
    }, []);
  }

  async getChatConversation(id: number): Promise<ChatConversation | undefined> {
    return await handleDbOperation(async () => {
      const [conversation] = await db.select().from(chatConversations).where(eq(chatConversations.id, id));
      return conversation;
    });
  }

  async createChatConversation(conversationData: InsertChatConversation): Promise<ChatConversation> {
    return await handleDbOperation(async () => {
      const [conversation] = await db.insert(chatConversations).values(conversationData).returning();
      return conversation;
    });
  }

  async getChatMessages(conversationId: number): Promise<ChatMessage[]> {
    return await handleDbOperation(async () => {
      return await db.select().from(chatMessages).where(eq(chatMessages.conversationId, conversationId)).orderBy(chatMessages.createdAt);
    }, []);
  }

  async createChatMessage(messageData: InsertChatMessage): Promise<ChatMessage> {
    return await handleDbOperation(async () => {
      const [message] = await db.insert(chatMessages).values(messageData).returning();
      
      // Update conversation's last message timestamp
      await db
        .update(chatConversations)
        .set({ lastMessageAt: new Date() })
        .where(eq(chatConversations.id, messageData.conversationId));
      
      return message;
    });
  }

  async markMessagesAsRead(conversationId: number, userId: string): Promise<void> {
    return await handleDbOperation(async () => {
      await db
        .update(chatMessages)
        .set({ isRead: true })
        .where(
          and(
            eq(chatMessages.conversationId, conversationId),
            ne(chatMessages.senderId, userId)
          )
        );
    });
  }

  // Email verification
  async createEmailVerificationToken(tokenData: InsertEmailVerificationToken): Promise<EmailVerificationToken> {
    return await handleDbOperation(async () => {
      const [token] = await db.insert(emailVerificationTokens).values(tokenData).returning();
      return token;
    });
  }

  async getEmailVerificationToken(token: string): Promise<EmailVerificationToken | undefined> {
    return await handleDbOperation(async () => {
      const [tokenRecord] = await db.select().from(emailVerificationTokens).where(eq(emailVerificationTokens.token, token));
      return tokenRecord;
    });
  }

  async deleteEmailVerificationToken(token: string): Promise<void> {
    return await handleDbOperation(async () => {
      await db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.token, token));
    });
  }

  async deleteEmailVerificationTokensByUserId(userId: string): Promise<void> {
    return await handleDbOperation(async () => {
      await db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.userId, userId));
    });
  }

  async updateUserEmailVerification(userId: string, verified: boolean): Promise<void> {
    return await handleDbOperation(async () => {
      await db.update(users).set({ emailVerified: verified }).where(eq(users.id, userId));
    });
  }

  async createPasswordResetToken(tokenData: any): Promise<any> {
    return await handleDbOperation(async () => {
      const [token] = await db.insert(emailVerificationTokens).values(tokenData).returning();
      return token;
    });
  }

  async getPasswordResetToken(token: string): Promise<any> {
    return await handleDbOperation(async () => {
      const [tokenRecord] = await db.select().from(emailVerificationTokens).where(eq(emailVerificationTokens.token, token));
      return tokenRecord;
    });
  }

  async updateUserPassword(userId: string, hashedPassword: string): Promise<void> {
    return await handleDbOperation(async () => {
      await db.update(users).set({ password: hashedPassword }).where(eq(users.id, userId));
    });
  }

  async markPasswordResetTokenAsUsed(token: string): Promise<void> {
    return await handleDbOperation(async () => {
      await db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.token, token));
    });
  }

  async deleteExpiredPasswordResetTokens(): Promise<void> {
    return await handleDbOperation(async () => {
      await db.delete(emailVerificationTokens).where(lt(emailVerificationTokens.expiresAt, new Date()));
    });
  }

  async updateUserEmailVerification(userId: string, verified: boolean): Promise<User> {
    return await handleDbOperation(async () => {
      const [user] = await db
        .update(users)
        .set({ emailVerified: verified, updatedAt: new Date() })
        .where(eq(users.id, userId))
        .returning();
      return user;
    });
  }

  // Password Reset Token methods
  async createPasswordResetToken(tokenData: InsertPasswordResetToken): Promise<PasswordResetToken> {
    return await handleDbOperation(async () => {
      const [token] = await db.insert(passwordResetTokens).values(tokenData).returning();
      return token;
    });
  }

  async getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    return await handleDbOperation(async () => {
      const [tokenRecord] = await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.token, token));
      return tokenRecord;
    });
  }

  async deletePasswordResetToken(token: string): Promise<void> {
    await handleDbOperation(async () => {
      await db.delete(passwordResetTokens).where(eq(passwordResetTokens.token, token));
    });
  }

  async markPasswordResetTokenAsUsed(token: string): Promise<void> {
    await handleDbOperation(async () => {
      await db
        .update(passwordResetTokens)
        .set({ used: true })
        .where(eq(passwordResetTokens.token, token));
    });
  }

  async deleteExpiredPasswordResetTokens(): Promise<void> {
    await handleDbOperation(async () => {
      await db
        .delete(passwordResetTokens)
        .where(lt(passwordResetTokens.expiresAt, new Date()));
    });
  }

  async updateUserPassword(userId: string, hashedPassword: string): Promise<User> {
    return await handleDbOperation(async () => {
      const [user] = await db
        .update(users)
        .set({ password: hashedPassword, updatedAt: new Date() })
        .where(eq(users.id, userId))
        .returning();
      return user;
    });
  }
}

export const storage = new DatabaseStorage();
