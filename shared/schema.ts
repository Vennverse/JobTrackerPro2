import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  paypalSubscriptionId: varchar("paypal_subscription_id"),
  paypalOrderId: varchar("paypal_order_id"),
  subscriptionStatus: varchar("subscription_status").default("free"), // free, active, canceled, past_due
  planType: varchar("plan_type").default("free"), // free, premium
  subscriptionStartDate: timestamp("subscription_start_date"),
  subscriptionEndDate: timestamp("subscription_end_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User profiles with comprehensive onboarding information
export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  
  // Basic Information
  fullName: varchar("full_name"),
  phone: varchar("phone"),
  professionalTitle: varchar("professional_title"),
  location: varchar("location"),
  linkedinUrl: varchar("linkedin_url"),
  githubUrl: varchar("github_url"),
  portfolioUrl: varchar("portfolio_url"),
  
  // Personal Details (commonly asked in forms)
  dateOfBirth: varchar("date_of_birth"),
  gender: varchar("gender"),
  nationality: varchar("nationality"),
  
  // Work Authorization
  workAuthorization: varchar("work_authorization"), // "citizen", "permanent_resident", "visa_required"
  visaStatus: varchar("visa_status"),
  requiresSponsorship: boolean("requires_sponsorship").default(false),
  
  // Location Preferences
  currentAddress: text("current_address"),
  city: varchar("city"),
  state: varchar("state"),
  zipCode: varchar("zip_code"),
  country: varchar("country").default("United States"),
  willingToRelocate: boolean("willing_to_relocate").default(false),
  
  // Work Preferences
  preferredWorkMode: varchar("preferred_work_mode"), // "remote", "hybrid", "onsite"
  desiredSalaryMin: integer("desired_salary_min"),
  desiredSalaryMax: integer("desired_salary_max"),
  salaryCurrency: varchar("salary_currency").default("USD"),
  noticePeriod: varchar("notice_period"), // "immediate", "2_weeks", "1_month", "2_months"
  
  // Education Summary (for quick form filling)  
  highestDegree: varchar("highest_degree"),
  majorFieldOfStudy: varchar("major_field_of_study"),
  graduationYear: integer("graduation_year"),
  
  // Resume and Professional Summary
  resumeUrl: varchar("resume_url"),
  resumeText: text("resume_text"),
  resumeFileName: varchar("resume_file_name"),
  summary: text("summary"),
  yearsExperience: integer("years_experience"),
  
  // ATS Analysis Results
  atsScore: integer("ats_score"),
  atsAnalysis: jsonb("ats_analysis"),
  atsRecommendations: text("ats_recommendations").array(),
  
  // Emergency Contact (sometimes required)
  emergencyContactName: varchar("emergency_contact_name"),
  emergencyContactPhone: varchar("emergency_contact_phone"),
  emergencyContactRelation: varchar("emergency_contact_relation"),
  
  // Military/Veteran Status (common question)
  veteranStatus: varchar("veteran_status"), // "not_veteran", "veteran", "disabled_veteran"
  
  // Diversity Questions (optional but commonly asked)
  ethnicity: varchar("ethnicity"),
  disabilityStatus: varchar("disability_status"),
  
  // Background Check Consent
  backgroundCheckConsent: boolean("background_check_consent").default(false),
  drugTestConsent: boolean("drug_test_consent").default(false),
  
  // Profile Status
  onboardingCompleted: boolean("onboarding_completed").default(false),
  profileCompletion: integer("profile_completion").default(0),
  lastResumeAnalysis: timestamp("last_resume_analysis"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User skills
export const userSkills = pgTable("user_skills", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  skillName: varchar("skill_name").notNull(),
  proficiencyLevel: varchar("proficiency_level"), // beginner, intermediate, advanced, expert
  yearsExperience: integer("years_experience"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Work experience
export const workExperience = pgTable("work_experience", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  company: varchar("company").notNull(),
  position: varchar("position").notNull(),
  location: varchar("location"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  isCurrent: boolean("is_current").default(false),
  description: text("description"),
  achievements: text("achievements").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Education
export const education = pgTable("education", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  institution: varchar("institution").notNull(),
  degree: varchar("degree").notNull(),
  fieldOfStudy: varchar("field_of_study"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  gpa: varchar("gpa"),
  achievements: text("achievements").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Resumes - stores multiple resumes per user
export const resumes = pgTable("resumes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: varchar("name").notNull(), // User-given name like "Software Engineer Resume"
  fileName: varchar("file_name").notNull(), // Original file name
  fileUrl: varchar("file_url"), // Storage URL (could be S3, etc.)
  fileData: text("file_data"), // Base64 encoded file content for demo
  resumeText: text("resume_text"), // Extracted text content for analysis
  isActive: boolean("is_active").default(false), // Which resume to use for applications
  
  // ATS Analysis
  atsScore: integer("ats_score"), // 0-100 ATS compatibility score
  analysisData: jsonb("analysis_data"), // Full Groq analysis results
  recommendations: text("recommendations").array(), // ATS improvement suggestions
  
  // Metadata
  fileSize: integer("file_size"), // File size in bytes
  mimeType: varchar("mime_type"), // application/pdf, etc.
  lastAnalyzed: timestamp("last_analyzed"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Job applications
export const jobApplications = pgTable("job_applications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  jobTitle: varchar("job_title").notNull(),
  company: varchar("company").notNull(),
  jobUrl: varchar("job_url"),
  applicationUrl: varchar("application_url"),
  location: varchar("location"),
  jobType: varchar("job_type"), // full-time, part-time, contract, internship
  workMode: varchar("work_mode"), // remote, hybrid, onsite
  salaryRange: varchar("salary_range"),
  status: varchar("status").notNull().default("applied"), // applied, under_review, interview, offer, rejected
  appliedDate: timestamp("applied_date").defaultNow(),
  lastUpdated: timestamp("last_updated").defaultNow(),
  jobDescription: text("job_description"),
  requiredSkills: text("required_skills").array(),
  matchScore: integer("match_score"), // 0-100
  notes: text("notes"),
  source: varchar("source"), // linkedin, indeed, company_website, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

// Job recommendations
export const jobRecommendations = pgTable("job_recommendations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  jobTitle: varchar("job_title").notNull(),
  company: varchar("company").notNull(),
  location: varchar("location"),
  jobUrl: varchar("job_url"),
  salary: varchar("salary"),
  jobType: varchar("job_type"),
  workMode: varchar("work_mode"),
  matchScore: integer("match_score"),
  matchingSkills: text("matching_skills").array(),
  missingSkills: text("missing_skills").array(),
  jobDescription: text("job_description"),
  requiredSkills: text("required_skills").array(),
  isBookmarked: boolean("is_bookmarked").default(false),
  isApplied: boolean("is_applied").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// AI Job Analysis - stores detailed AI analysis of job postings
export const aiJobAnalyses = pgTable("ai_job_analyses", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  jobUrl: varchar("job_url").notNull(),
  jobTitle: varchar("job_title").notNull(),
  company: varchar("company").notNull(),
  
  // Raw job data
  jobDescription: text("job_description"),
  requirements: text("requirements"),
  qualifications: text("qualifications"),
  benefits: text("benefits"),
  
  // AI Analysis Results
  matchScore: integer("match_score"), // 0-100
  matchingSkills: text("matching_skills").array(),
  missingSkills: text("missing_skills").array(),
  skillGaps: jsonb("skill_gaps"), // detailed analysis of missing skills
  
  // Job characteristics extracted by AI
  seniorityLevel: varchar("seniority_level"), // entry, mid, senior, lead, principal
  workMode: varchar("work_mode"), // remote, hybrid, onsite
  jobType: varchar("job_type"), // full-time, part-time, contract, internship
  salaryRange: varchar("salary_range"),
  location: varchar("location"),
  
  // AI-generated insights
  roleComplexity: varchar("role_complexity"), // low, medium, high
  careerProgression: varchar("career_progression"), // lateral, step-up, stretch
  industryFit: varchar("industry_fit"), // perfect, good, acceptable, poor
  cultureFit: varchar("culture_fit"), // strong, moderate, weak
  
  // Recommendations
  applicationRecommendation: varchar("application_recommendation"), // strongly_recommended, recommended, consider, not_recommended
  tailoringAdvice: text("tailoring_advice"), // AI advice on how to tailor application
  interviewPrepTips: text("interview_prep_tips"),
  
  // Metadata
  analysisVersion: varchar("analysis_version").default("1.0"),
  processingTime: integer("processing_time"), // milliseconds
  createdAt: timestamp("created_at").defaultNow(),
});

// Daily usage tracking table for premium limits
export const dailyUsage = pgTable("daily_usage", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: varchar("date").notNull(), // YYYY-MM-DD format
  jobAnalysesCount: integer("job_analyses_count").default(0),
  resumeAnalysesCount: integer("resume_analyses_count").default(0),
  applicationsCount: integer("applications_count").default(0),
  autoFillsCount: integer("auto_fills_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("daily_usage_user_date_idx").on(table.userId, table.date),
]);

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
  skills: many(userSkills),
  workExperience: many(workExperience),
  education: many(education),
  applications: many(jobApplications),
  recommendations: many(jobRecommendations),
  aiJobAnalyses: many(aiJobAnalyses),
  dailyUsage: many(dailyUsage),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

export const userSkillsRelations = relations(userSkills, ({ one }) => ({
  user: one(users, {
    fields: [userSkills.userId],
    references: [users.id],
  }),
}));

export const workExperienceRelations = relations(workExperience, ({ one }) => ({
  user: one(users, {
    fields: [workExperience.userId],
    references: [users.id],
  }),
}));

export const educationRelations = relations(education, ({ one }) => ({
  user: one(users, {
    fields: [education.userId],
    references: [users.id],
  }),
}));

export const jobApplicationsRelations = relations(jobApplications, ({ one }) => ({
  user: one(users, {
    fields: [jobApplications.userId],
    references: [users.id],
  }),
}));

export const jobRecommendationsRelations = relations(jobRecommendations, ({ one }) => ({
  user: one(users, {
    fields: [jobRecommendations.userId],
    references: [users.id],
  }),
}));

export const aiJobAnalysesRelations = relations(aiJobAnalyses, ({ one }) => ({
  user: one(users, {
    fields: [aiJobAnalyses.userId],
    references: [users.id],
  }),
}));

export const dailyUsageRelations = relations(dailyUsage, ({ one }) => ({
  user: one(users, {
    fields: [dailyUsage.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserSkillSchema = createInsertSchema(userSkills).omit({
  id: true,
  createdAt: true,
});

export const insertWorkExperienceSchema = createInsertSchema(workExperience).omit({
  id: true,
  createdAt: true,
});

export const insertEducationSchema = createInsertSchema(education).omit({
  id: true,
  createdAt: true,
});

export const insertJobApplicationSchema = createInsertSchema(jobApplications).omit({
  id: true,
  createdAt: true,
  appliedDate: true,
  lastUpdated: true,
});

export const insertJobRecommendationSchema = createInsertSchema(jobRecommendations).omit({
  id: true,
  createdAt: true,
});

export const insertAiJobAnalysisSchema = createInsertSchema(aiJobAnalyses).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserSkill = z.infer<typeof insertUserSkillSchema>;
export type UserSkill = typeof userSkills.$inferSelect;
export type InsertWorkExperience = z.infer<typeof insertWorkExperienceSchema>;
export type WorkExperience = typeof workExperience.$inferSelect;
export type InsertEducation = z.infer<typeof insertEducationSchema>;
export type Education = typeof education.$inferSelect;

export const insertResumeSchema = createInsertSchema(resumes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertResume = z.infer<typeof insertResumeSchema>;
export type Resume = typeof resumes.$inferSelect;
export type InsertJobApplication = z.infer<typeof insertJobApplicationSchema>;
export type JobApplication = typeof jobApplications.$inferSelect;
export type InsertJobRecommendation = z.infer<typeof insertJobRecommendationSchema>;
export type JobRecommendation = typeof jobRecommendations.$inferSelect;
export type InsertAiJobAnalysis = z.infer<typeof insertAiJobAnalysisSchema>;
export type AiJobAnalysis = typeof aiJobAnalyses.$inferSelect;

export const insertDailyUsageSchema = createInsertSchema(dailyUsage).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertDailyUsage = z.infer<typeof insertDailyUsageSchema>;
export type DailyUsage = typeof dailyUsage.$inferSelect;
