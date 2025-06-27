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