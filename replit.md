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
- ✅ Configured API keys (GROQ_API_KEY, RESEND_API_KEY, OPENAI_API_KEY, STRIPE keys, NEXTAUTH_SECRET)
- ✅ Established Neon database connection
- ✅ Fixed resume display issue in recruiter dashboard
- ✅ Implemented proper database queries for user resumes
- ✅ Resolved React Query infinite loop issues
- ✅ Updated applicant profile API to return complete resume data

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