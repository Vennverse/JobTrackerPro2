import {
  users,
  userProfiles,
  userSkills,
  workExperience,
  education,
  jobApplications,
  jobRecommendations,
  aiJobAnalyses,
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
import { eq, desc, and } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
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
}

export class DatabaseStorage implements IStorage {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
  async getUser(id: string): Promise<User | undefined> {
    return await handleDbOperation(async () => {
      const [user] = await db.select().from(users).where(eq(users.id, id));
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
}

export const storage = new DatabaseStorage();
