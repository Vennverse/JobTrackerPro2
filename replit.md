# AutoJobr - AI-Powered Job Application Platform

## Overview

AutoJobr is a comprehensive job application automation platform consisting of a full-stack web application and Chrome extension. The platform automates job applications, tracks application progress, provides AI-powered job recommendations, and offers real-time form filling across major job boards. The system helps job seekers streamline their entire application process through intelligent matching, automated application tracking, comprehensive profile management, and seamless browser integration.

## System Architecture

The application follows a modern full-stack architecture with clear separation between client and server:

- **Frontend**: React-based SPA using Vite as the build tool
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth integration with OpenID Connect
- **Hosting**: Replit deployment with autoscale configuration

## Key Components

### Web Application Architecture
- **Frontend**: React 18 with TypeScript, TanStack Query state management
- **Backend**: Node.js Express server with TypeScript and RESTful APIs
- **Database**: PostgreSQL with Drizzle ORM for type-safe operations
- **Authentication**: Replit Auth with OpenID Connect and session management
- **UI Framework**: Radix UI primitives with shadcn/ui and Tailwind CSS
- **Build System**: Vite for fast development and optimized production builds

### Chrome Extension Architecture
- **Manifest V3**: Modern Chrome extension with service worker background script
- **Content Scripts**: Intelligent form detection and auto-filling across major ATS platforms
- **Job Analysis**: In-browser NLP processing using lightweight compromise.js library
- **Real-time Sync**: Seamless integration with web app backend for profile data and application tracking
- **Cross-Platform Support**: Works on Workday, Greenhouse, Lever, iCIMS, LinkedIn, and 10+ other job boards

### Database Schema
The application uses a comprehensive schema supporting:
- **User Management**: Users table with profile information
- **User Profiles**: Extended profile data including professional details, skills, work experience, and education
- **Job Applications**: Application tracking with status, match scores, and metadata
- **Job Recommendations**: AI-powered job suggestions with matching algorithms
- **Session Storage**: Secure session management for authentication

## Data Flow

1. **Authentication Flow**: Users authenticate via Replit Auth using OpenID Connect
2. **Profile Management**: Users create and update comprehensive professional profiles
3. **Job Discovery**: System provides AI-powered job recommendations based on user profiles
4. **Application Tracking**: Users can apply to jobs and track application status
5. **Analytics**: Dashboard provides insights into application success rates and metrics

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL serverless driver
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Accessible UI component primitives
- **passport**: Authentication middleware
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store

### Development Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Type safety across the entire stack
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Fast JavaScript bundler for production builds

## Deployment Strategy

The application is deployed on Replit with the following configuration:

- **Environment**: Node.js 20 with PostgreSQL 16
- **Build Process**: Vite builds the client, ESBuild bundles the server
- **Development**: `npm run dev` runs the development server with hot reload
- **Production**: `npm run build` creates optimized builds, `npm run start` runs the production server
- **Port Configuration**: Server runs on port 5000, externally accessible on port 80
- **Database**: Managed PostgreSQL instance with connection pooling
- **Scaling**: Autoscale deployment target for handling traffic variations

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

Recent updates to the AutoJobr platform:
- June 29, 2025: **Comprehensive SEO Optimization Complete** - Implemented advanced SEO strategies to rank top in search engines and AI chatbots, added extensive meta tags with job-specific keywords, structured data markup with Schema.org for better search understanding, dynamic sitemap generation with job postings, comprehensive robots.txt with AI bot permissions, RSS feed for job updates, performance optimizations with critical CSS and font loading improvements, added server-side SEO routes for dynamic meta tag generation and structured data APIs
- June 29, 2025: **Chat System & WebSocket Fixes Complete** - Fixed WebSocket connection issues that were causing multiple connection attempts and errors, implemented comprehensive chat interface with conversation management and real-time messaging capabilities, added working message functionality without real-time updates (WebSocket temporarily disabled for stability), integrated chat navigation and full messaging workflow between recruiters and job seekers
- June 29, 2025: **Enhanced Security & Payment Requirements** - Removed demo login functionality to enforce proper authentication, enhanced subscription upgrade system to require actual PayPal/Stripe/Razorpay payment verification instead of direct upgrades, added daily upgrade prompts to encourage premium subscriptions, improved payment integration messaging for $10/month premium plan, created comprehensive file storage service with compression for secure resume handling, improved ATS calculation logic in Groq service for more accurate scoring, updated .env.production with Razorpay credentials and payment configuration
- June 29, 2025: **Unified Application Tracking System Complete** - Implemented combined application view showing both web app applications (recruiter-posted jobs) and Chrome extension applications (external job sites) in unified dashboard and applications page, added source indicators to distinguish internal platform vs extension applications, enhanced applications table with source badges and comprehensive data display, thoroughly tested and enhanced Chrome extension components for optimal performance
- June 29, 2025: **Resume Management & Deployment Complete** - Fixed resume download functionality with proper file data storage, enhanced job application integration with resume sharing to recruiters, ensured job recommendations and job pages only show recruiter-posted jobs instead of external APIs, added comprehensive deployment guide for VM/cloud hosting, created production environment configuration templates
- June 29, 2025: **Complete Job Posting & Application Workflow** - Fixed post job page display, enhanced recruiter dashboard with working view/edit buttons, added job postings section to job seeker dashboard, implemented one-click job applications, and verified complete recruiter-to-job-seeker workflow with application tracking
- June 29, 2025: **Simplified Authentication Flow Complete** - Removed user-type selection step, added "Post Job" to sidebar navigation, fixed email verification redirect from broken /user-type to proper /post-job flow
- June 29, 2025: **Complete Recruiter Platform Implementation** - Added full recruiter functionality with user type selection, email verification, job posting management, application tracking, and chat system
- June 29, 2025: **Recruiter Dashboard & Job Management** - Built comprehensive recruiter dashboard with job posting CRUD, application review, and candidate communication features
- June 29, 2025: **User Type System** - Implemented dual user types (job_seeker/recruiter) with separate authentication flows and corporate email verification for recruiters
- June 29, 2025: **Job Posting Platform** - Created job posting form with skills, compensation, requirements, and complete job lifecycle management
- June 29, 2025: **Chat System Integration** - Added real-time messaging between recruiters and job seekers with application context
- June 29, 2025: **Updated Job Discovery** - Modified job seeker dashboard to show recruiter-posted jobs instead of external Adzuna API jobs
- June 27, 2025: **Major Platform Enhancement** - Completely redesigned dashboard with comprehensive resume analysis, AI-powered job recommendations, and advanced analytics
- June 27, 2025: **Resume Management System** - Implemented 2-resume limit for free users, unlimited for premium, with Groq AI-powered ATS analysis and optimization
- June 27, 2025: **Enhanced Applications Page** - Added comprehensive analytics, application pipeline tracking, AI insights, and performance metrics
- June 27, 2025: **Chrome Extension AI Upgrade** - Enhanced with advanced job analysis using Groq AI, intelligent auto-fill, and real-time match scoring
- June 27, 2025: **Job Recommendations Engine** - Built AI-powered job matching with detailed compatibility scores and personalized suggestions
- June 27, 2025: **Groq AI Integration** - Implemented advanced AI analysis for resumes, job matching, and cover letter generation using llama3-70b-8192
- June 27, 2025: **Critical Bug Fixes Complete** - Fixed authentication middleware error, resume upload failures, and onboarding completion redirect
- June 27, 2025: **Groq AI Model Updated** - Migrated from decommissioned `llama-3.1-70b-versatile` to `llama3-70b-8192` for resume analysis
- June 27, 2025: **Robust Resume Processing** - Added fallback mechanisms for PDF parsing and AI analysis to prevent upload failures
- June 27, 2025: **Onboarding Flow Fixed** - Improved completion detection and redirect logic to properly navigate to dashboard after completion
- June 27, 2025: **Extension API Fixed** - Added `/api/extension/profile` endpoint for Chrome extension form auto-filling
- June 27, 2025: **Database Foreign Key Issue Resolved** - Demo user now properly created in database during login
- June 28, 2025: **Major Platform Enhancement Complete** - Implemented functional Quick Actions with AI dialogs, external job search via Adzuna API, fixed second resume upload display, Groq AI integration verification, and enhanced Chrome extension connectivity
- June 27, 2025: **Complete Database Integration** - All profile, onboarding, and user data APIs working with PostgreSQL
- June 27, 2025: **Database Configuration Fixed** - Switched from Neon to Replit database for development, external PostgreSQL for production
- June 27, 2025: **Landing Page & Logout Flow** - Fixed routing so landing page is proper entry point and logout destination
- June 27, 2025: **Authentication Flow Complete** - All auth routes working: landing → auth → onboarding → dashboard → logout → landing
- June 27, 2025: **Major Feature Update** - Implemented comprehensive onboarding system with first-time user flow
- June 27, 2025: **Resume Management** - Added multi-resume support (2 for free, unlimited for premium) with ATS scoring
- June 27, 2025: **Smart Job Analysis** - Enhanced Chrome extension to analyze jobs using real page content with Groq AI
- June 27, 2025: **Cover Letter Generation** - Automated cover letter creation using job description and user profile  
- June 27, 2025: **Resume Match Scoring** - Added Simplify-style compatibility scoring with visual indicators
- June 27, 2025: **Chrome Extension Enhancement** - Improved form filling with resume selection and cover letter integration
- June 27, 2025: Fixed all authentication issues and implemented proper routing flow (landing → onboarding → dashboard)
- June 27, 2025: Added payment system configuration for Stripe and PayPal subscriptions
- June 27, 2025: Replaced Replit Auth with flexible authentication system supporting Google, GitHub, LinkedIn, and demo login