import express from "express";
import session from "express-session";
import bcrypt from "bcryptjs";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Strategy as LinkedInStrategy } from "passport-linkedin-oauth2";
import { db } from "./db";
import { storage } from "./storage";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import type { Express, RequestHandler } from "express";

// Simple auth configuration
const authConfig = {
  session: {
    secret: process.env.NEXTAUTH_SECRET || 'default-secret-key',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
  },
  providers: {
    google: {
      enabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    github: {
      enabled: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    },
    linkedin: {
      enabled: !!(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET),
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    },
    email: {
      enabled: process.env.ENABLE_EMAIL_LOGIN === 'true',
    }
  }
};

export async function setupAuth(app: Express) {
  // Setup session middleware
  app.use(session({
    secret: authConfig.session.secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: authConfig.session.maxAge,
    },
  }));

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Passport serialization
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      done(null, user || false);
    } catch (error) {
      done(error, false);
    }
  });

  // Google OAuth Strategy
  if (authConfig.providers.google.enabled) {
    passport.use(new GoogleStrategy({
      clientID: authConfig.providers.google.clientId!,
      clientSecret: authConfig.providers.google.clientSecret!,
      callbackURL: "/api/auth/google/callback"
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await storage.getUserByEmail(profile.emails?.[0]?.value || '');
        
        if (!user) {
          // Create new user
          user = await storage.upsertUser({
            id: profile.id,
            email: profile.emails?.[0]?.value || '',
            firstName: profile.name?.givenName || '',
            lastName: profile.name?.familyName || '',
            profileImageUrl: profile.photos?.[0]?.value || '',
            userType: 'job_seeker', // Default to job seeker, can be changed later
            emailVerified: true
          });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }));
  }

  // GitHub OAuth Strategy
  if (authConfig.providers.github.enabled) {
    passport.use(new GitHubStrategy({
      clientID: authConfig.providers.github.clientId!,
      clientSecret: authConfig.providers.github.clientSecret!,
      callbackURL: "/api/auth/github/callback"
    }, async (accessToken: any, refreshToken: any, profile: any, done: any) => {
      try {
        let user = await storage.getUserByEmail(profile.emails?.[0]?.value || '');
        
        if (!user) {
          user = await storage.upsertUser({
            id: profile.id,
            email: profile.emails?.[0]?.value || '',
            firstName: profile.displayName?.split(' ')[0] || '',
            lastName: profile.displayName?.split(' ').slice(1).join(' ') || '',
            profileImageUrl: profile.photos?.[0]?.value || '',
            userType: null, // Let users choose their type
            emailVerified: true
          });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }));
  }

  // LinkedIn OAuth Strategy
  if (authConfig.providers.linkedin.enabled) {
    passport.use(new LinkedInStrategy({
      clientID: authConfig.providers.linkedin.clientId!,
      clientSecret: authConfig.providers.linkedin.clientSecret!,
      callbackURL: "/api/auth/linkedin/callback",
      scope: ['r_emailaddress', 'r_liteprofile']
    }, async (accessToken: any, refreshToken: any, profile: any, done: any) => {
      try {
        let user = await storage.getUserByEmail(profile.emails?.[0]?.value || '');
        
        if (!user) {
          user = await storage.upsertUser({
            id: profile.id,
            email: profile.emails?.[0]?.value || '',
            firstName: profile.name?.givenName || '',
            lastName: profile.name?.familyName || '',
            profileImageUrl: profile.photos?.[0]?.value || '',
            userType: null, // Let users choose their type
            emailVerified: true
          });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }));
  }

  // Auth status endpoint
  app.get('/api/auth/providers', (req, res) => {
    res.json({
      providers: {
        google: authConfig.providers.google.enabled,
        github: authConfig.providers.github.enabled,
        linkedin: authConfig.providers.linkedin.enabled,
        email: authConfig.providers.email.enabled,
      },
    });
  });

  // OAuth initiation routes
  app.get('/api/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
  app.get('/api/auth/github', passport.authenticate('github', { scope: ['user:email'] }));
  app.get('/api/auth/linkedin', passport.authenticate('linkedin', { scope: ['r_emailaddress', 'r_liteprofile'] }));

  // OAuth callback routes
  app.get('/api/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/auth?error=google_failed' }),
    (req, res) => {
      // Successful authentication, redirect to user type selection or dashboard
      res.redirect('/user-type');
    }
  );

  app.get('/api/auth/github/callback', 
    passport.authenticate('github', { failureRedirect: '/auth?error=github_failed' }),
    (req, res) => {
      res.redirect('/user-type');
    }
  );

  app.get('/api/auth/linkedin/callback', 
    passport.authenticate('linkedin', { failureRedirect: '/auth?error=linkedin_failed' }),
    (req, res) => {
      res.redirect('/user-type');
    }
  );

  // Handle OAuth provider signin (called from frontend)
  app.post('/api/auth/signin', async (req, res) => {
    const { provider } = req.body;
    
    // Redirect to appropriate OAuth provider
    if (provider === 'google' && authConfig.providers.google.enabled) {
      res.json({ redirectUrl: '/api/auth/google' });
    } else if (provider === 'github' && authConfig.providers.github.enabled) {
      res.json({ redirectUrl: '/api/auth/github' });
    } else if (provider === 'linkedin' && authConfig.providers.linkedin.enabled) {
      res.json({ redirectUrl: '/api/auth/linkedin' });
    } else {
      res.status(400).json({ message: "Provider not supported or not configured" });
    }
  });

  // Logout route
  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: "Session cleanup failed" });
        }
        res.json({ message: "Logged out successfully" });
      });
    });
  });

  // User info endpoint
  app.get('/api/user', async (req: any, res) => {
    try {
      const sessionUser = req.session?.user;
      
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Fetch onboarding status from database
      let onboardingCompleted = false;
      try {
        const { storage } = await import("./storage");
        const profile = await storage.getUserProfile(sessionUser.id);
        onboardingCompleted = profile?.onboardingCompleted || false;
      } catch (error) {
        console.error("Error fetching profile for onboarding status:", error);
      }

      // For demo user, return session data directly
      if (sessionUser.id === 'demo-user-id') {
        return res.json({
          id: sessionUser.id,
          email: sessionUser.email,
          name: sessionUser.name,
          firstName: 'Demo',
          lastName: 'User',
          onboardingCompleted,
        });
      }

      // For real users, try database (with fallback)
      res.json({
        id: sessionUser.id,
        email: sessionUser.email,
        name: sessionUser.name,
        firstName: 'User',
        lastName: 'Name',
        onboardingCompleted,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Logout
  app.post('/api/auth/signout', (req: any, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ 
        message: "Logged out successfully",
        redirectTo: "/" 
      });
    });
  });

  // Demo login for testing
  app.post('/api/auth/demo', async (req, res) => {
    try {
      const demoUserData = {
        id: 'demo-user-id',
        email: 'demo@autojobr.com',
        firstName: 'Demo',
        lastName: 'User',
        profileImageUrl: null
      };

      // Ensure demo user exists in database
      const demoUser = await storage.upsertUser(demoUserData);

      // Set session
      (req as any).session.user = {
        id: demoUser.id,
        email: demoUser.email,
        name: `${demoUser.firstName} ${demoUser.lastName}`,
      };

      res.json({ 
        message: "Demo login successful", 
        user: {
          id: demoUser.id,
          email: demoUser.email,
          name: `${demoUser.firstName} ${demoUser.lastName}`,
        }
      });
    } catch (error) {
      console.error("Demo login error:", error);
      res.status(500).json({ message: "Demo login failed" });
    }
  });
}

// Middleware to check authentication
export const isAuthenticated: RequestHandler = async (req: any, res, next) => {
  try {
    // Check if user is authenticated via Passport.js
    if (req.isAuthenticated && req.isAuthenticated()) {
      return next();
    }

    // Check for demo user session (backwards compatibility)
    const sessionUser = req.session?.user;
    if (sessionUser && sessionUser.id === 'demo-user-id') {
      req.user = {
        id: sessionUser.id,
        email: sessionUser.email,
        name: sessionUser.name,
        firstName: 'Demo',
        lastName: 'User',
        userType: 'job_seeker',
        onboardingCompleted: true
      };
      return next();
    }

    // For real users, also use session data (avoid database calls for now)
    req.user = {
      id: sessionUser.id,
      email: sessionUser.email,
      name: sessionUser.name,
      firstName: 'User',
      lastName: 'Name',
    };
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ message: "Authentication failed" });
  }
};