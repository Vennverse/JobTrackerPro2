# AutoJobr - Job Application Platform

## Overview
AutoJobr is a comprehensive job application platform that connects job seekers with recruiters. It features AI-powered resume analysis, job matching, and a complete recruitment management system.

## Project Architecture

### Backend
- **Framework**: Express.js with TypeScript
- **Database**: Neon PostgreSQL (cloud-hosted)
- **Authentication**: Session-based with Passport.js
- **AI Integration**: Groq SDK for resume analysis and job matching
- **Payment Processing**: Stripe integration
- **Email Service**: Resend for notifications

### Frontend
- **Framework**: React with TypeScript
- **Routing**: Wouter
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Query for server state
- **Build Tool**: Vite

### Key Features
- Resume upload and AI-powered ATS scoring
- Job posting and application management
- Real-time messaging between recruiters and candidates
- Payment processing for premium features
- Responsive design for all devices

## Recent Changes

### Migration from Replit Agent (January 2025)
- ✅ Configured API keys (GROQ_API_KEY, RESEND_API_KEY, STRIPE_SECRET_KEY, NEXTAUTH_SECRET)
- ✅ Established Neon database connection with provided credentials
- ✅ Successfully deployed database schema with all tables created
- ✅ Application running on port 5000 with full functionality
- ✅ Fixed database configuration for Neon serverless compatibility
- ✅ Completed migration to Replit environment
- ✅ **Test System Migration Complete**: Fixed critical database schema issues, created missing test tables, verified all components working

### New Competitive Features (January 2025)
- ✅ **Spotify-like Job Discovery**: Curated job playlists for browsing opportunities
- ✅ **Job Scraping System**: Aggregates jobs from multiple sources into searchable playlists
- ✅ **Premium Targeting**: B2B revenue model for targeted candidate matching
- ✅ **Enhanced Database Schema**: Added 7 new tables for advanced job management
- ✅ **Job Bookmarking**: Users can save and organize favorite job opportunities
- ✅ **Multi-source Integration**: LinkedIn, Indeed, Glassdoor job aggregation

### Architecture Improvements
- Enhanced error handling for database operations
- Improved caching strategy for React Query
- Fixed client-server communication issues
- Optimized resume data fetching and display

## Environment Configuration
- **Database**: Neon PostgreSQL with pooled connections
- **Server**: Binds to 0.0.0.0:5000 for Replit compatibility
- **Security**: Client/server separation with proper authentication middleware

## User Preferences
*No specific user preferences recorded yet*

## Current Status
The application is fully migrated and operational on Replit with all core features working correctly.

### Migration to Replit Complete (January 2025)
- ✅ **Environment Setup**: Successfully configured all required API keys and database connection
- ✅ **Dependencies**: All packages installed and working properly
- ✅ **Application Launch**: Server running on port 5000 with full functionality
- ✅ **Test System Fix**: Resolved critical test submission errors during migration
- ✅ **Security**: Proper client-server separation maintained
- ✅ **Database**: Neon PostgreSQL connection established and working

### January 2025 - Test Assignment System Fix
- ✅ **Fixed Test Assignment Bug**: Resolved form submission issues preventing test assignments
- ✅ **Enhanced Error Handling**: Added comprehensive validation and user-friendly error messages
- ✅ **Improved Debugging**: Added detailed console logging for troubleshooting
- ✅ **Form Validation**: Enhanced form submission with proper error capture and display

### Migration Completion (January 2025)
- ✅ **Database Schema Fixed**: Resolved missing column issues in test_templates table
- ✅ **Test System Operational**: Custom template creation and platform templates working
- ✅ **API Integration Complete**: All external services (GROQ, RESEND, STRIPE) configured
- ✅ **Replit Environment**: Full compatibility with secure client/server separation
- ✅ **Question Bank Initialized**: Successfully populated with 14 comprehensive test questions
- ✅ **Select Component Fixes**: Resolved React SelectItem empty value prop errors

### January 2025 - Replit Migration Complete
- ✅ **Migration from Replit Agent**: Successfully migrated project to Replit environment
- ✅ **Package Installation**: Added tsx and all required dependencies
- ✅ **API Configuration**: Configured all required API keys (GROQ, RESEND, STRIPE, NEXTAUTH, DATABASE_URL)
- ✅ **Database Schema Fixes**: Fixed missing test template columns and database connectivity issues
- ✅ **Test System Restoration**: Restored complete test system functionality with proper database schema
- ✅ **Demo Data Setup**: Created demo recruiter account and initialized question bank
- ✅ **Application Verified**: Confirmed all core features working including test templates, user authentication, and job management
- ✅ **Critical Bug Fixes**: Fixed test submission failures and enhanced anti-cheating system with proper violation tracking and automatic submission after 5 violations

### Recent UI Improvements (January 2025)
- ✅ **Separated Payment Pages**: Created distinct subscription pages for job seekers and recruiters
- ✅ **Job Seeker Subscription**: Clean, focused payment page with resume analysis and application tracking
- ✅ **Recruiter Subscription**: Dedicated page with job posting, premium targeting, and candidate management features
- ✅ **UI Separation**: Removed premium targeting elements from job seeker interface
- ✅ **Route Management**: Proper routing for user-type-specific subscription pages
- ✅ **Mobile Responsiveness**: Fixed black screen issues and improved mobile navigation layout
- ✅ **Dynamic Payment Pricing**: Updated recruiter payments to handle $49/month + premium targeting costs
- ✅ **Enhanced Navigation**: Added "For Recruiters" link in navbar for non-authenticated users
- ✅ **Two-Sided Platform Showcase**: Enhanced landing page to clearly present both job seeker and recruiter features
- ✅ **Recruiter Features Visibility**: Better showcasing of comprehensive recruiter toolset including premium targeting, testing system, and anti-cheating protection

### Premium B2B Targeting Feature (January 2025)
- ✅ **Premium Targeting System**: Complete B2B revenue model allowing companies to target specific candidate groups
- ✅ **Advanced Filtering**: Education (schools, degrees, GPA), experience, skills, clubs, certifications
- ✅ **Dynamic Pricing**: $99-$300+ based on targeting precision and candidate pool size
- ✅ **Real-time Estimation**: Live candidate reach calculation and match quality scoring
- ✅ **Navigation Integration**: Premium Targeting accessible to recruiters/companies only
- ✅ **Database Schema**: Full targeting criteria storage with premium features tracking

### Comprehensive Test System Enhancement (January 2025)
- ✅ **Automatic Scoring Engine**: AI-powered scoring for all question types (multiple choice, coding, essays, scenarios)
- ✅ **Multi-Domain Support**: Technical, finance, marketing, sales, HR, and general assessment categories
- ✅ **Advanced Question Types**: Support for coding challenges, case studies, and scenario-based questions
- ✅ **Robust Candidate Selection**: Checkbox-based multi-candidate assignment with "Select All" functionality
- ✅ **Job Posting Integration**: Filter candidates by specific job postings for targeted test assignments
- ✅ **Test Template Management**: Platform templates + custom recruiter templates with full CRUD operations
- ✅ **Email Notifications**: Automated test assignment emails with due dates and test URLs
- ✅ **Payment Integration**: $5 retake fee system with Stripe/PayPal/Razorpay support
- ✅ **Question Builder**: Comprehensive question creation interface with multiple question types and domains
- ✅ **Anti-Cheating System**: Copy-paste prevention, tab monitoring, fullscreen mode, and violation warnings
- ✅ **Real-Time Monitoring**: Live test progress tracking with time alerts and automatic submission
- ✅ **Enhanced Landing Pages**: Updated main landing page and new recruiter features page with all offerings
- ✅ **Coding Question System**: Secure code execution engine with JavaScript/Python support, automated testing, and AI evaluation
- ✅ **Interactive Code Editor**: Real-time coding interface with syntax highlighting, test case visibility, and immediate feedback
- ✅ **AI-Powered Code Review**: Groq integration for code quality assessment, scoring, and improvement suggestions