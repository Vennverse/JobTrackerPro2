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
- **UI/UX Focus**: User prefers "BEST OF BEST" modern, beautiful UI/UX implementations
- **Feature Simplification**: Requested removal of AI recommendations tab for cleaner job browsing experience
- **Visual Quality**: Emphasis on premium, professional visual design and user experience

## Current Status
The application is fully migrated and operational on Replit with all core features working correctly.

### January 2025 - Migration from Replit Agent Complete
- ✅ **Migration Complete**: Successfully migrated project from Replit Agent to Replit environment
- ✅ **Dependencies**: Installed tsx for TypeScript execution and all required packages
- ✅ **API Configuration**: Configured all required API keys (GROQ, RESEND, STRIPE, NEXTAUTH, DATABASE_URL)
- ✅ **Application Launch**: Server running successfully on port 5000 with full functionality
- ✅ **Bug Fixes**: Fixed Career AI Assistant JSON parsing error with proper response cleaning
- ✅ **Security**: Proper client-server separation maintained with secure environment variables

### January 2025 - Migration from Replit Agent Complete
- ✅ **Environment Setup**: Successfully configured all required API keys (GROQ, RESEND, STRIPE, NEXTAUTH, DATABASE_URL)
- ✅ **Database Connection**: Neon PostgreSQL connection established and working properly
- ✅ **Dependencies**: All Node.js packages installed and working correctly
- ✅ **Server Launch**: Application running successfully on port 5000
- ✅ **API Fixes**: Updated deprecated Groq API models to current versions (llama-3.3-70b-versatile)
- ✅ **Frontend Fixes**: Resolved JavaScript error with recommendedJobsQuery undefined reference
- ✅ **Error Handling**: Enhanced profile update error handling with specific error messages
- ✅ **JSON Parsing**: Improved Groq API response parsing with better error handling
- ✅ **Migration Complete**: All checklist items verified and application fully operational

### Complete Deployment System (January 2025)
- ✅ **Docker Deployment**: Complete containerization with multi-stage builds, health checks, and production-ready configuration
- ✅ **Docker Compose**: Full orchestration with PostgreSQL, Redis, Nginx, and monitoring stack (Prometheus + Grafana)
- ✅ **Cloud Deployment**: Comprehensive guides for AWS, GCP, and Azure with cost breakdowns and resource requirements
- ✅ **VM Deployment**: Complete setup scripts for Ubuntu/CentOS with PM2 process management
- ✅ **Automated Deploy Script**: One-click deployment with SSL setup and environment validation
- ✅ **Resource Requirements**: Detailed specifications for small (20-40$/month), medium (80-150$/month), and large scale (200-500$/month)
- ✅ **Monitoring Stack**: Production-ready monitoring with Grafana dashboards, Prometheus metrics, and health checks
- ✅ **Security Configuration**: SSL/TLS setup, rate limiting, security headers, and proper user permissions

### January 2025 - Personal Career AI Assistant Implementation
- ✅ **Career AI Assistant Page**: Comprehensive AI-powered career guidance using Groq API with user profile integration
- ✅ **Career Path Planning**: AI-generated step-by-step career progression with realistic timelines and salary estimates
- ✅ **Skill Gap Analysis**: Intelligent identification of missing skills with learning resources and acquisition timelines
- ✅ **Market Timing Insights**: AI analysis of optimal timing for career moves based on market conditions
- ✅ **Networking Opportunities**: Personalized networking strategies and relationship building recommendations
- ✅ **Behavioral Analytics Engine**: Pattern analysis from user's application history and job search behavior
- ✅ **Navbar Integration**: Added Career AI Assistant to navigation for easy access by job seekers
- ✅ **Backend API Endpoint**: New `/api/career-ai/analyze` endpoint for comprehensive career analysis using Groq AI
- ✅ **Data Integration**: Full integration with user profile, skills, applications, and job analysis history for personalized insights

### January 2025 - Chrome Extension Comprehensive Enhancement
- ✅ **Enhanced User Data Access**: Extension now properly accesses complete user profile including skills, applications, and work experience
- ✅ **Advanced Workday Support**: Comprehensive Workday compatibility with specialized data-automation-id selectors and React component handling
- ✅ **Automatic Cover Letter Generation**: AI-powered cover letter generation using website's API with automatic field detection and filling
- ✅ **Multi-Platform Job Board Support**: Enhanced compatibility for LinkedIn, Greenhouse, Lever, iCIMS, BambooHR, Jobvite, SmartRecruiters, and AshbyHQ
- ✅ **Intelligent Form Detection**: Advanced field mapping with confidence scoring and site-specific optimizations
- ✅ **Extension Dashboard API**: New backend endpoint `/api/extension/dashboard` providing comprehensive statistics and recent activity
- ✅ **Real-time Event Handling**: Improved form filling with React/Angular compatibility and proper event triggering
- ✅ **Background Script Enhancement**: Added cover letter generation, enhanced user profile fetching, and improved error handling
- ✅ **Auto-Fill Tracking**: Enhanced usage tracking for premium subscription model with daily limits and upgrade notifications

### January 2025 - Migration to Replit Complete
- ✅ **Migration Fixed Issues**: Successfully resolved API routing problems and UI display issues during migration
- ✅ **Application Cards Enhanced**: Fixed candidate application cards to display candidate names and job titles
- ✅ **Review Dialog Fixed**: Resolved dialog structure issues preventing application status updates
- ✅ **Full Migration Complete**: All core functionality verified and working properly
- ✅ **Replit Agent Migration**: Successfully migrated from Replit Agent to Replit environment with all dependencies and API keys configured
- ✅ **Groq API Updates**: Updated deprecated models to current versions (llama-3.3-70b-versatile) and improved JSON parsing
- ✅ **Error Handling**: Enhanced profile update error handling with specific validation messages
- ✅ **External Job Search Removed**: Removed custom Google Jobs scraper implementation and external job search page per user request
- ✅ **Dynamic ATS Scoring**: Fixed static 42% ATS score issue with intelligent content-based scoring system
- ✅ **Modern Dashboard**: Created contemporary UI with gradient cards, animations, and improved user experience
- ✅ **GROQ API Integration**: Updated to new API key (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) for AI-powered resume analysis
- ✅ **Job Search Validation Fix**: Fixed duplicate job search endpoints causing validation errors, reduced minimum query length from 3 to 2 characters, and resolved frontend/backend parameter mismatch (position vs q parameter)
- ✅ **AI-Powered Job Recommendations**: Implemented real AI job recommendations using GROQ API with user profile analysis, monthly refresh caching, and personalized job matching based on skills, experience, and preferences

### January 2025 - Migration to Replit Complete
- ✅ **API Configuration**: All required API keys configured (GROQ, RESEND, STRIPE, NEXTAUTH, DATABASE)
- ✅ **Database Connection**: Neon PostgreSQL connection established and working
- ✅ **Question Bank Initialization**: Question bank initialized with 14 sample questions
- ✅ **UI Bug Fixes**: Fixed SelectItem empty value errors that were causing React crashes
- ✅ **Question Bank Filters**: Fixed filter logic to properly handle "all" values for search functionality
- ✅ **Application Launch**: Server successfully running on port 5000 with full functionality
- ✅ **Career AI Assistant Fix**: Fixed JSON parsing error in AI analysis by handling markdown code blocks

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