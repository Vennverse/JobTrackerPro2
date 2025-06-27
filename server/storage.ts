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

// Temporarily use MemStorage while database connection is being fixed
// export const storage = new DatabaseStorage();

// In-memory storage implementation
class MemStorage implements IStorage {
  private users = new Map<string, User>();
  private profiles = new Map<string, UserProfile>();
  private skills = new Map<string, UserSkill[]>();
  private workExperience = new Map<string, WorkExperience[]>();
  private education = new Map<string, Education[]>();
  private applications = new Map<string, JobApplication[]>();
  private recommendations = new Map<string, JobRecommendation[]>();
  private analyses = new Map<string, AiJobAnalysis[]>();

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const user: User = {
      id: userData.id,
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      stripeCustomerId: userData.stripeCustomerId || null,
      stripeSubscriptionId: userData.stripeSubscriptionId || null,
      paypalSubscriptionId: userData.paypalSubscriptionId || null,
      paypalOrderId: userData.paypalOrderId || null,
      subscriptionStatus: userData.subscriptionStatus || null,
      planType: userData.planType || 'free',
      subscriptionStartDate: userData.subscriptionStartDate || null,
      subscriptionEndDate: userData.subscriptionEndDate || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  // Profile operations
  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    return this.profiles.get(userId);
  }

  async upsertUserProfile(profileData: InsertUserProfile): Promise<UserProfile> {
    const profile: UserProfile = {
      id: Date.now(),
      userId: profileData.userId,
      fullName: profileData.fullName || null,
      email: profileData.email || null,
      phone: profileData.phone || null,
      location: profileData.location || null,
      summary: profileData.summary || null,
      targetRole: profileData.targetRole || null,
      workAuthorization: profileData.workAuthorization || null,
      preferredWorkMode: profileData.preferredWorkMode || null,
      desiredSalary: profileData.desiredSalary || null,
      noticePeriod: profileData.noticePeriod || null,
      portfolioUrl: profileData.portfolioUrl || null,
      linkedinUrl: profileData.linkedinUrl || null,
      githubUrl: profileData.githubUrl || null,
      onboardingCompleted: profileData.onboardingCompleted || false,
      onboardingAnswers: profileData.onboardingAnswers || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.profiles.set(profile.userId, profile);
    return profile;
  }

  // Skills operations
  async getUserSkills(userId: string): Promise<UserSkill[]> {
    return this.skills.get(userId) || [];
  }

  async addUserSkill(skill: InsertUserSkill): Promise<UserSkill> {
    const newSkill: UserSkill = {
      id: Date.now(),
      userId: skill.userId,
      name: skill.name,
      level: skill.level || null,
      yearsOfExperience: skill.yearsOfExperience || null,
      createdAt: new Date(),
    };
    const userSkills = this.skills.get(skill.userId) || [];
    userSkills.push(newSkill);
    this.skills.set(skill.userId, userSkills);
    return newSkill;
  }

  async deleteUserSkill(id: number): Promise<void> {
    for (const [userId, skills] of this.skills.entries()) {
      const index = skills.findIndex(skill => skill.id === id);
      if (index !== -1) {
        skills.splice(index, 1);
        this.skills.set(userId, skills);
        break;
      }
    }
  }

  // Work experience operations
  async getUserWorkExperience(userId: string): Promise<WorkExperience[]> {
    return this.workExperience.get(userId) || [];
  }

  async addWorkExperience(experience: InsertWorkExperience): Promise<WorkExperience> {
    const newExperience: WorkExperience = {
      id: Date.now(),
      userId: experience.userId,
      company: experience.company,
      position: experience.position,
      startDate: experience.startDate,
      endDate: experience.endDate || null,
      isCurrent: experience.isCurrent || false,
      description: experience.description || null,
      achievements: experience.achievements || null,
      technologies: experience.technologies || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const userExperience = this.workExperience.get(experience.userId) || [];
    userExperience.push(newExperience);
    this.workExperience.set(experience.userId, userExperience);
    return newExperience;
  }

  async updateWorkExperience(id: number, experienceData: Partial<InsertWorkExperience>): Promise<WorkExperience> {
    for (const [userId, experiences] of this.workExperience.entries()) {
      const experience = experiences.find(exp => exp.id === id);
      if (experience) {
        Object.assign(experience, experienceData, { updatedAt: new Date() });
        return experience;
      }
    }
    throw new Error('Work experience not found');
  }

  async deleteWorkExperience(id: number): Promise<void> {
    for (const [userId, experiences] of this.workExperience.entries()) {
      const index = experiences.findIndex(exp => exp.id === id);
      if (index !== -1) {
        experiences.splice(index, 1);
        this.workExperience.set(userId, experiences);
        break;
      }
    }
  }

  // Education operations
  async getUserEducation(userId: string): Promise<Education[]> {
    return this.education.get(userId) || [];
  }

  async addEducation(educationData: InsertEducation): Promise<Education> {
    const newEducation: Education = {
      id: Date.now(),
      userId: educationData.userId,
      institution: educationData.institution,
      degree: educationData.degree,
      fieldOfStudy: educationData.fieldOfStudy || null,
      startDate: educationData.startDate,
      endDate: educationData.endDate || null,
      isCurrent: educationData.isCurrent || false,
      gpa: educationData.gpa || null,
      achievements: educationData.achievements || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const userEducation = this.education.get(educationData.userId) || [];
    userEducation.push(newEducation);
    this.education.set(educationData.userId, userEducation);
    return newEducation;
  }

  async updateEducation(id: number, educationData: Partial<InsertEducation>): Promise<Education> {
    for (const [userId, educations] of this.education.entries()) {
      const education = educations.find(edu => edu.id === id);
      if (education) {
        Object.assign(education, educationData, { updatedAt: new Date() });
        return education;
      }
    }
    throw new Error('Education not found');
  }

  async deleteEducation(id: number): Promise<void> {
    for (const [userId, educations] of this.education.entries()) {
      const index = educations.findIndex(edu => edu.id === id);
      if (index !== -1) {
        educations.splice(index, 1);
        this.education.set(userId, educations);
        break;
      }
    }
  }

  // Job applications operations
  async getUserApplications(userId: string): Promise<JobApplication[]> {
    return this.applications.get(userId) || [];
  }

  async addJobApplication(application: InsertJobApplication): Promise<JobApplication> {
    const newApplication: JobApplication = {
      id: Date.now(),
      userId: application.userId,
      jobTitle: application.jobTitle,
      company: application.company,
      location: application.location || null,
      jobUrl: application.jobUrl || null,
      applicationStatus: application.applicationStatus || 'applied',
      matchScore: application.matchScore || null,
      appliedDate: application.appliedDate || new Date(),
      lastUpdated: new Date(),
      notes: application.notes || null,
      jobDescription: application.jobDescription || null,
      requirements: application.requirements || null,
      salaryRange: application.salaryRange || null,
      workMode: application.workMode || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const userApplications = this.applications.get(application.userId) || [];
    userApplications.push(newApplication);
    this.applications.set(application.userId, userApplications);
    return newApplication;
  }

  async updateJobApplication(id: number, applicationData: Partial<InsertJobApplication>): Promise<JobApplication> {
    for (const [userId, applications] of this.applications.entries()) {
      const application = applications.find(app => app.id === id);
      if (application) {
        Object.assign(application, applicationData, { updatedAt: new Date() });
        return application;
      }
    }
    throw new Error('Job application not found');
  }

  async deleteJobApplication(id: number): Promise<void> {
    for (const [userId, applications] of this.applications.entries()) {
      const index = applications.findIndex(app => app.id === id);
      if (index !== -1) {
        applications.splice(index, 1);
        this.applications.set(userId, applications);
        break;
      }
    }
  }

  async getApplicationStats(userId: string): Promise<{
    totalApplications: number;
    interviews: number;
    responseRate: number;
    avgMatchScore: number;
  }> {
    const applications = this.applications.get(userId) || [];
    const totalApplications = applications.length;
    const interviews = applications.filter(app => 
      ['phone_screen', 'interview_scheduled', 'on_site', 'final_round'].includes(app.applicationStatus)
    ).length;
    const responses = applications.filter(app => 
      app.applicationStatus !== 'applied' && app.applicationStatus !== 'rejected'
    ).length;
    const responseRate = totalApplications > 0 ? (responses / totalApplications) * 100 : 0;
    const scoresWithValues = applications.filter(app => app.matchScore !== null);
    const avgMatchScore = scoresWithValues.length > 0 
      ? scoresWithValues.reduce((sum, app) => sum + (app.matchScore || 0), 0) / scoresWithValues.length
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
    return this.recommendations.get(userId) || [];
  }

  async addJobRecommendation(recommendation: InsertJobRecommendation): Promise<JobRecommendation> {
    const newRecommendation: JobRecommendation = {
      id: Date.now(),
      userId: recommendation.userId,
      jobTitle: recommendation.jobTitle,
      company: recommendation.company,
      location: recommendation.location || null,
      salaryRange: recommendation.salaryRange || null,
      matchScore: recommendation.matchScore,
      jobUrl: recommendation.jobUrl || null,
      jobDescription: recommendation.jobDescription || null,
      requirements: recommendation.requirements || null,
      benefits: recommendation.benefits || null,
      workMode: recommendation.workMode || null,
      postedDate: recommendation.postedDate || null,
      isBookmarked: recommendation.isBookmarked || false,
      applicationDeadline: recommendation.applicationDeadline || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const userRecommendations = this.recommendations.get(recommendation.userId) || [];
    userRecommendations.push(newRecommendation);
    this.recommendations.set(recommendation.userId, userRecommendations);
    return newRecommendation;
  }

  async updateJobRecommendation(id: number, recommendationData: Partial<InsertJobRecommendation>): Promise<JobRecommendation> {
    for (const [userId, recommendations] of this.recommendations.entries()) {
      const recommendation = recommendations.find(rec => rec.id === id);
      if (recommendation) {
        Object.assign(recommendation, recommendationData, { updatedAt: new Date() });
        return recommendation;
      }
    }
    throw new Error('Job recommendation not found');
  }

  async toggleBookmark(id: number): Promise<JobRecommendation> {
    for (const [userId, recommendations] of this.recommendations.entries()) {
      const recommendation = recommendations.find(rec => rec.id === id);
      if (recommendation) {
        recommendation.isBookmarked = !recommendation.isBookmarked;
        recommendation.updatedAt = new Date();
        return recommendation;
      }
    }
    throw new Error('Job recommendation not found');
  }

  // AI Job Analysis operations
  async getUserJobAnalyses(userId: string): Promise<AiJobAnalysis[]> {
    return this.analyses.get(userId) || [];
  }

  async addJobAnalysis(analysis: InsertAiJobAnalysis): Promise<AiJobAnalysis> {
    const newAnalysis: AiJobAnalysis = {
      id: Date.now(),
      userId: analysis.userId,
      jobTitle: analysis.jobTitle,
      company: analysis.company,
      jobUrl: analysis.jobUrl || null,
      jobDescription: analysis.jobDescription,
      analysisResult: analysis.analysisResult,
      matchScore: analysis.matchScore,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const userAnalyses = this.analyses.get(analysis.userId) || [];
    userAnalyses.push(newAnalysis);
    this.analyses.set(analysis.userId, userAnalyses);
    return newAnalysis;
  }

  async getJobAnalysisByUrl(userId: string, jobUrl: string): Promise<AiJobAnalysis | undefined> {
    const analyses = this.analyses.get(userId) || [];
    return analyses.find(analysis => analysis.jobUrl === jobUrl);
  }

  async updateJobAnalysis(id: number, analysisData: Partial<InsertAiJobAnalysis>): Promise<AiJobAnalysis> {
    for (const [userId, analyses] of this.analyses.entries()) {
      const analysis = analyses.find(ana => ana.id === id);
      if (analysis) {
        Object.assign(analysis, analysisData, { updatedAt: new Date() });
        return analysis;
      }
    }
    throw new Error('Job analysis not found');
  }

  // Subscription operations
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
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }
    Object.assign(user, subscriptionData, { updatedAt: new Date() });
    this.users.set(userId, user);
    return user;
  }

  async getUserByPaypalSubscription(paypalSubscriptionId: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.paypalSubscriptionId === paypalSubscriptionId) {
        return user;
      }
    }
    return undefined;
  }
}

export const storage = new MemStorage();
