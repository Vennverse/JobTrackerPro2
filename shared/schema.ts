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
  password: varchar("password"), // For email authentication
  profileImageUrl: varchar("profile_image_url"),
  userType: varchar("user_type").default("job_seeker"), // job_seeker, recruiter
  availableRoles: text("available_roles").default("job_seeker"), // comma-separated: job_seeker,recruiter
  currentRole: varchar("current_role").default("job_seeker"), // active role for current session
  emailVerified: boolean("email_verified").default(false),
  companyName: varchar("company_name"), // For recruiters
  companyWebsite: varchar("company_website"), // For recruiters
  companyLogoUrl: varchar("company_logo_url"), // For recruiters
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  paypalSubscriptionId: varchar("paypal_subscription_id"),
  paypalOrderId: varchar("paypal_order_id"),
  razorpayPaymentId: varchar("razorpay_payment_id"),
  razorpayOrderId: varchar("razorpay_order_id"),
  paymentProvider: varchar("payment_provider"), // stripe, paypal, razorpay
  subscriptionStatus: varchar("subscription_status").default("free"), // free, active, canceled, past_due
  planType: varchar("plan_type").default("free"), // free, premium
  subscriptionStartDate: timestamp("subscription_start_date"),
  subscriptionEndDate: timestamp("subscription_end_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Password reset tokens table
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  token: varchar("token").unique().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
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
  resumeData: text("resume_data"), // Base64 encoded file data for persistence
  resumeMimeType: varchar("resume_mime_type"), // MIME type of uploaded file
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

// Job postings created by recruiters
export const jobPostings = pgTable("job_postings", {
  id: serial("id").primaryKey(),
  recruiterId: varchar("recruiter_id").references(() => users.id).notNull(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  companyName: varchar("company_name").notNull(),
  companyLogo: varchar("company_logo"), // URL to company logo
  location: varchar("location"),
  workMode: varchar("work_mode"), // remote, hybrid, onsite
  jobType: varchar("job_type"), // full-time, part-time, contract, internship
  experienceLevel: varchar("experience_level"), // entry, mid, senior, lead
  skills: text("skills").array(), // Required skills
  minSalary: integer("min_salary"),
  maxSalary: integer("max_salary"),
  currency: varchar("currency").default("USD"),
  benefits: text("benefits"),
  requirements: text("requirements"),
  responsibilities: text("responsibilities"),
  
  // Promotion and sharing features
  isPromoted: boolean("is_promoted").default(false),
  promotedUntil: timestamp("promoted_until"),
  shareableLink: varchar("shareable_link"),
  
  isActive: boolean("is_active").default(true),
  applicationsCount: integer("applications_count").default(0),
  viewsCount: integer("views_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Applications to job postings from job seekers
export const jobPostingApplications = pgTable("job_posting_applications", {
  id: serial("id").primaryKey(),
  jobPostingId: integer("job_posting_id").references(() => jobPostings.id).notNull(),
  applicantId: varchar("applicant_id").references(() => users.id).notNull(),
  resumeId: integer("resume_id").references(() => resumes.id), // Which resume was used
  resumeData: jsonb("resume_data"), // Complete resume data for recruiter access
  coverLetter: text("cover_letter"), // Custom cover letter for this application
  status: varchar("status").default("pending"), // pending, reviewed, shortlisted, interviewed, hired, rejected
  matchScore: integer("match_score"), // AI-calculated compatibility score
  recruiterNotes: text("recruiter_notes"), // Private notes from recruiter
  appliedAt: timestamp("applied_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("job_posting_applications_job_idx").on(table.jobPostingId),
  index("job_posting_applications_applicant_idx").on(table.applicantId),
]);

// Chat system between recruiters and job seekers
export const chatConversations = pgTable("chat_conversations", {
  id: serial("id").primaryKey(),
  recruiterId: varchar("recruiter_id").references(() => users.id).notNull(),
  jobSeekerId: varchar("job_seeker_id").references(() => users.id).notNull(),
  jobPostingId: integer("job_posting_id").references(() => jobPostings.id), // Context of the conversation
  applicationId: integer("application_id").references(() => jobPostingApplications.id), // Related application
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("chat_conversations_recruiter_idx").on(table.recruiterId),
  index("chat_conversations_job_seeker_idx").on(table.jobSeekerId),
]);

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => chatConversations.id).notNull(),
  senderId: varchar("sender_id").references(() => users.id).notNull(),
  message: text("message").notNull(),
  messageType: varchar("message_type").default("text"), // text, file, system
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("chat_messages_conversation_idx").on(table.conversationId),
  index("chat_messages_sender_idx").on(table.senderId),
]);

// Email verification tokens for users
export const emailVerificationTokens = pgTable("email_verification_tokens", {
  id: serial("id").primaryKey(),
  token: varchar("token").notNull().unique(),
  email: varchar("email").notNull(),
  userId: varchar("user_id").notNull(),
  userType: varchar("user_type").default("job_seeker"), // 'job_seeker' or 'recruiter'
  companyName: varchar("company_name"), // Optional: for recruiter verification
  companyWebsite: varchar("company_website"), // Optional: for recruiter verification
  verified: boolean("verified").default(false),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("email_verification_tokens_token_idx").on(table.token),
  index("email_verification_tokens_email_idx").on(table.email),
  index("email_verification_tokens_user_id_idx").on(table.userId),
]);

// Company email verification tracking
export const companyEmailVerifications = pgTable("company_email_verifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  email: varchar("email").notNull(),
  companyName: varchar("company_name").notNull(),
  companyWebsite: varchar("company_website"),
  verificationToken: varchar("verification_token").notNull().unique(),
  isVerified: boolean("is_verified").default(false),
  verifiedAt: timestamp("verified_at"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("company_email_verifications_user_idx").on(table.userId),
  index("company_email_verifications_email_idx").on(table.email),
  index("company_email_verifications_token_idx").on(table.verificationToken),
]);

// Advanced recruiter features - Job templates for faster posting
export const jobTemplates = pgTable("job_templates", {
  id: serial("id").primaryKey(),
  recruiterId: varchar("recruiter_id").references(() => users.id).notNull(),
  templateName: varchar("template_name").notNull(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements"),
  responsibilities: text("responsibilities"),
  benefits: text("benefits"),
  skills: text("skills").array(),
  experienceLevel: varchar("experience_level"),
  workMode: varchar("work_mode"),
  jobType: varchar("job_type"),
  isActive: boolean("is_active").default(true),
  usageCount: integer("usage_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Smart candidate matching and AI insights
export const candidateMatches = pgTable("candidate_matches", {
  id: serial("id").primaryKey(),
  jobPostingId: integer("job_posting_id").references(() => jobPostings.id).notNull(),
  candidateId: varchar("candidate_id").references(() => users.id).notNull(),
  matchScore: integer("match_score").notNull(), // 0-100
  skillMatchScore: integer("skill_match_score").notNull(),
  experienceMatchScore: integer("experience_match_score").notNull(),
  locationMatchScore: integer("location_match_score").notNull(),
  salaryMatchScore: integer("salary_match_score").notNull(),
  
  // AI insights
  joinProbability: integer("join_probability"), // 0-100
  engagementScore: integer("engagement_score"), // 0-100
  flightRisk: varchar("flight_risk"), // low, medium, high
  
  // Matching details
  matchingSkills: text("matching_skills").array(),
  missingSkills: text("missing_skills").array(),
  skillGaps: jsonb("skill_gaps"),
  
  // Recommendations
  approachRecommendation: text("approach_recommendation"),
  personalizedMessage: text("personalized_message"),
  salaryBenchmark: jsonb("salary_benchmark"),
  
  // Status
  isViewed: boolean("is_viewed").default(false),
  isContacted: boolean("is_contacted").default(false),
  recruiterRating: integer("recruiter_rating"), // 1-5 stars
  recruiterNotes: text("recruiter_notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("candidate_matches_job_idx").on(table.jobPostingId),
  index("candidate_matches_candidate_idx").on(table.candidateId),
  index("candidate_matches_score_idx").on(table.matchScore),
]);

// Interview scheduling and management
export const interviews = pgTable("interviews", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").references(() => jobPostingApplications.id).notNull(),
  recruiterId: varchar("recruiter_id").references(() => users.id).notNull(),
  candidateId: varchar("candidate_id").references(() => users.id).notNull(),
  interviewType: varchar("interview_type").notNull(), // phone, video, onsite, technical
  scheduledDate: timestamp("scheduled_date").notNull(),
  duration: integer("duration").default(60), // minutes
  meetingLink: varchar("meeting_link"),
  location: varchar("location"),
  
  // Interview details
  interviewerName: varchar("interviewer_name"),
  interviewerEmail: varchar("interviewer_email"),
  instructions: text("instructions"),
  questionsTemplate: text("questions_template"),
  
  // Status and results
  status: varchar("status").default("scheduled"), // scheduled, confirmed, completed, cancelled, no_show
  candidateConfirmed: boolean("candidate_confirmed").default(false),
  recruiterNotes: text("recruiter_notes"),
  candidateFeedback: text("candidate_feedback"),
  score: integer("score"), // 1-10
  recommendation: varchar("recommendation"), // hire, maybe, no_hire
  
  // Notifications
  reminderSent: boolean("reminder_sent").default(false),
  confirmationSent: boolean("confirmation_sent").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("interviews_application_idx").on(table.applicationId),
  index("interviews_recruiter_idx").on(table.recruiterId),
  index("interviews_candidate_idx").on(table.candidateId),
  index("interviews_date_idx").on(table.scheduledDate),
]);

// Team collaboration and permissions
export const recruiterTeams = pgTable("recruiter_teams", {
  id: serial("id").primaryKey(),
  companyId: varchar("company_id").notNull(), // Company identifier
  teamName: varchar("team_name").notNull(),
  teamLead: varchar("team_lead").references(() => users.id).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("recruiter_teams_company_idx").on(table.companyId),
  index("recruiter_teams_lead_idx").on(table.teamLead),
]);

export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").references(() => recruiterTeams.id).notNull(),
  recruiterId: varchar("recruiter_id").references(() => users.id).notNull(),
  role: varchar("role").notNull(), // admin, recruiter, viewer
  permissions: text("permissions").array(), // view_jobs, edit_jobs, view_applications, edit_applications, etc.
  addedBy: varchar("added_by").references(() => users.id).notNull(),
  joinedAt: timestamp("joined_at").defaultNow(),
  isActive: boolean("is_active").default(true),
}, (table) => [
  index("team_members_team_idx").on(table.teamId),
  index("team_members_recruiter_idx").on(table.recruiterId),
]);

// Shared notes and collaboration
export const sharedNotes = pgTable("shared_notes", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").references(() => jobPostingApplications.id).notNull(),
  authorId: varchar("author_id").references(() => users.id).notNull(),
  note: text("note").notNull(),
  noteType: varchar("note_type").default("general"), // general, interview, technical, cultural
  isPrivate: boolean("is_private").default(false),
  taggedUsers: text("tagged_users").array(), // user IDs who should be notified
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("shared_notes_application_idx").on(table.applicationId),
  index("shared_notes_author_idx").on(table.authorId),
]);

// ATS/CRM integrations
export const atsIntegrations = pgTable("ats_integrations", {
  id: serial("id").primaryKey(),
  recruiterId: varchar("recruiter_id").references(() => users.id).notNull(),
  platformName: varchar("platform_name").notNull(), // greenhouse, workday, lever, etc.
  apiKey: varchar("api_key"),
  apiSecret: varchar("api_secret"),
  webhookUrl: varchar("webhook_url"),
  isActive: boolean("is_active").default(true),
  lastSync: timestamp("last_sync"),
  syncStatus: varchar("sync_status"), // success, failed, pending
  syncErrors: text("sync_errors"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("ats_integrations_recruiter_idx").on(table.recruiterId),
  index("ats_integrations_platform_idx").on(table.platformName),
]);

// Employer branding and career pages
export const careerPages = pgTable("career_pages", {
  id: serial("id").primaryKey(),
  recruiterId: varchar("recruiter_id").references(() => users.id).notNull(),
  companyName: varchar("company_name").notNull(),
  pageName: varchar("page_name").notNull(),
  customUrl: varchar("custom_url").unique(),
  
  // Branding
  logo: varchar("logo"),
  coverImage: varchar("cover_image"),
  brandColors: jsonb("brand_colors"),
  companyDescription: text("company_description"),
  mission: text("mission"),
  values: text("values").array(),
  
  // Content
  videoIntro: varchar("video_intro"),
  teamPhotos: text("team_photos").array(),
  officePhotos: text("office_photos").array(),
  testimonials: jsonb("testimonials"),
  perks: text("perks").array(),
  
  // Settings
  isPublic: boolean("is_public").default(true),
  allowApplications: boolean("allow_applications").default(true),
  customDomain: varchar("custom_domain"),
  
  // Analytics
  viewsCount: integer("views_count").default(0),
  applicationsCount: integer("applications_count").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("career_pages_recruiter_idx").on(table.recruiterId),
  index("career_pages_url_idx").on(table.customUrl),
]);

// Candidate feedback and surveys
export const candidateFeedback = pgTable("candidate_feedback", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").references(() => jobPostingApplications.id).notNull(),
  candidateId: varchar("candidate_id").references(() => users.id).notNull(),
  recruiterId: varchar("recruiter_id").references(() => users.id).notNull(),
  
  // Feedback scores (1-5)
  applicationProcessRating: integer("application_process_rating"),
  communicationRating: integer("communication_rating"),
  interviewExperienceRating: integer("interview_experience_rating"),
  overallExperienceRating: integer("overall_experience_rating"),
  
  // Feedback details
  whatWorkedWell: text("what_worked_well"),
  whatCouldImprove: text("what_could_improve"),
  wouldRecommend: boolean("would_recommend"),
  additionalComments: text("additional_comments"),
  
  // Status
  surveyCompleted: boolean("survey_completed").default(false),
  feedbackPublic: boolean("feedback_public").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("candidate_feedback_application_idx").on(table.applicationId),
  index("candidate_feedback_candidate_idx").on(table.candidateId),
  index("candidate_feedback_recruiter_idx").on(table.recruiterId),
]);

// Security and verification
export const securityVerifications = pgTable("security_verifications", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").references(() => jobPostingApplications.id).notNull(),
  candidateId: varchar("candidate_id").references(() => users.id).notNull(),
  verificationType: varchar("verification_type").notNull(), // identity, employment, education, background
  
  // Verification details
  documentType: varchar("document_type"),
  documentUrl: varchar("document_url"),
  verificationStatus: varchar("verification_status").default("pending"), // pending, verified, failed, expired
  verificationProvider: varchar("verification_provider"),
  verificationId: varchar("verification_id"),
  
  // Results
  verificationScore: integer("verification_score"), // 0-100
  riskLevel: varchar("risk_level"), // low, medium, high
  flaggedReasons: text("flagged_reasons").array(),
  verificationReport: jsonb("verification_report"),
  
  // Metadata
  requestedBy: varchar("requested_by").references(() => users.id).notNull(),
  verifiedAt: timestamp("verified_at"),
  expiresAt: timestamp("expires_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("security_verifications_application_idx").on(table.applicationId),
  index("security_verifications_candidate_idx").on(table.candidateId),
  index("security_verifications_type_idx").on(table.verificationType),
]);

// Performance metrics and analytics
export const recruiterAnalytics = pgTable("recruiter_analytics", {
  id: serial("id").primaryKey(),
  recruiterId: varchar("recruiter_id").references(() => users.id).notNull(),
  date: date("date").notNull(),
  
  // Job posting metrics
  jobsPosted: integer("jobs_posted").default(0),
  jobsActive: integer("jobs_active").default(0),
  jobViews: integer("job_views").default(0),
  jobApplications: integer("job_applications").default(0),
  
  // Application metrics
  applicationsReviewed: integer("applications_reviewed").default(0),
  applicationsShortlisted: integer("applications_shortlisted").default(0),
  interviewsScheduled: integer("interviews_scheduled").default(0),
  interviewsCompleted: integer("interviews_completed").default(0),
  offersExtended: integer("offers_extended").default(0),
  hires: integer("hires").default(0),
  
  // Performance metrics
  averageTimeToReview: integer("average_time_to_review"), // hours
  averageTimeToInterview: integer("average_time_to_interview"), // hours  
  averageTimeToHire: integer("average_time_to_hire"), // hours
  conversionRate: integer("conversion_rate"), // percentage
  
  // Candidate experience
  averageCandidateRating: integer("average_candidate_rating"), // 1-5
  responseRate: integer("response_rate"), // percentage
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("recruiter_analytics_recruiter_idx").on(table.recruiterId),
  index("recruiter_analytics_date_idx").on(table.date),
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
  // Recruiter relations
  jobPostings: many(jobPostings),
  jobPostingApplications: many(jobPostingApplications),
  recruiterConversations: many(chatConversations, { relationName: "recruiterChats" }),
  jobSeekerConversations: many(chatConversations, { relationName: "jobSeekerChats" }),
  sentMessages: many(chatMessages),
  emailVerificationTokens: many(emailVerificationTokens),
}));

export const jobPostingsRelations = relations(jobPostings, ({ one, many }) => ({
  recruiter: one(users, {
    fields: [jobPostings.recruiterId],
    references: [users.id],
  }),
  applications: many(jobPostingApplications),
  conversations: many(chatConversations),
}));

export const jobPostingApplicationsRelations = relations(jobPostingApplications, ({ one }) => ({
  jobPosting: one(jobPostings, {
    fields: [jobPostingApplications.jobPostingId],
    references: [jobPostings.id],
  }),
  applicant: one(users, {
    fields: [jobPostingApplications.applicantId],
    references: [users.id],
  }),
  resume: one(resumes, {
    fields: [jobPostingApplications.resumeId],
    references: [resumes.id],
  }),
}));

export const chatConversationsRelations = relations(chatConversations, ({ one, many }) => ({
  recruiter: one(users, {
    fields: [chatConversations.recruiterId],
    references: [users.id],
    relationName: "recruiterChats",
  }),
  jobSeeker: one(users, {
    fields: [chatConversations.jobSeekerId],
    references: [users.id],
    relationName: "jobSeekerChats",
  }),
  jobPosting: one(jobPostings, {
    fields: [chatConversations.jobPostingId],
    references: [jobPostings.id],
  }),
  application: one(jobPostingApplications, {
    fields: [chatConversations.applicationId],
    references: [jobPostingApplications.id],
  }),
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  conversation: one(chatConversations, {
    fields: [chatMessages.conversationId],
    references: [chatConversations.id],
  }),
  sender: one(users, {
    fields: [chatMessages.senderId],
    references: [users.id],
  }),
}));

// No relations needed for email verification tokens as they are temporary

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

// New insert schemas for recruiter functionality
export const insertJobPostingSchema = createInsertSchema(jobPostings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  applicationsCount: true,
  viewsCount: true,
});

export const insertJobPostingApplicationSchema = createInsertSchema(jobPostingApplications).omit({
  id: true,
  appliedAt: true,
  updatedAt: true,
});

export const insertChatConversationSchema = createInsertSchema(chatConversations).omit({
  id: true,
  createdAt: true,
  lastMessageAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertEmailVerificationTokenSchema = createInsertSchema(emailVerificationTokens).omit({
  id: true,
  createdAt: true,
});

export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertDailyUsage = z.infer<typeof insertDailyUsageSchema>;
export type DailyUsage = typeof dailyUsage.$inferSelect;
export type InsertJobPosting = z.infer<typeof insertJobPostingSchema>;
export type JobPosting = typeof jobPostings.$inferSelect;
export type InsertJobPostingApplication = z.infer<typeof insertJobPostingApplicationSchema>;
export type JobPostingApplication = typeof jobPostingApplications.$inferSelect;
export type InsertChatConversation = z.infer<typeof insertChatConversationSchema>;
export type ChatConversation = typeof chatConversations.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertEmailVerificationToken = z.infer<typeof insertEmailVerificationTokenSchema>;
export type EmailVerificationToken = typeof emailVerificationTokens.$inferSelect;
export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
