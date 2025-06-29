import express from "express";
import session from "express-session";
import bcrypt from "bcryptjs";
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

  // Login route
  app.post('/api/auth/signin', async (req, res) => {
    const { provider, email, password } = req.body;

    if (provider === 'credentials' && authConfig.providers.email.enabled) {
      try {
        if (!email || !password) {
          return res.status(400).json({ message: "Email and password are required" });
        }

        const [user] = await db.select().from(users).where(eq(users.email, email));
        
        if (!user || !user.password) {
          return res.status(401).json({ message: "Invalid credentials" });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return res.status(401).json({ message: "Invalid credentials" });
        }

        // Set session
        (req as any).session.user = {
          id: user.id,
          email: user.email,
          name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        };

        res.json({ 
          message: "Login successful", 
          user: {
            id: user.id,
            email: user.email,
            name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          }
        });
      } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Login failed" });
      }
    } else {
      // For OAuth providers, redirect to their auth URLs
      if (provider === 'google' && authConfig.providers.google.enabled) {
        const authUrl = `https://accounts.google.com/oauth2/v2/auth?client_id=${authConfig.providers.google.clientId}&redirect_uri=${encodeURIComponent('http://localhost:5000/api/auth/callback/google')}&scope=openid%20email%20profile&response_type=code`;
        res.json({ redirectUrl: authUrl });
      } else {
        res.status(400).json({ message: "Provider not supported or not configured" });
      }
    }
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

      // For demo user, fetch complete user data from database
      if (sessionUser.id === 'demo-user-id') {
        try {
          const { storage } = await import("./storage");
          const fullUser = await storage.getUser(sessionUser.id);
          if (fullUser) {
            return res.json({
              id: fullUser.id,
              email: fullUser.email,
              name: sessionUser.name,
              firstName: fullUser.firstName,
              lastName: fullUser.lastName,
              userType: fullUser.userType,
              emailVerified: fullUser.emailVerified,
              companyName: fullUser.companyName,
              companyWebsite: fullUser.companyWebsite,
              onboardingCompleted,
            });
          }
        } catch (error) {
          console.error("Error fetching full demo user data:", error);
        }
        
        // Fallback to session data if database fetch fails
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

  // Email authentication routes
  app.post('/api/auth/email/signup', async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
      }

      // Check if user already exists
      const [existingUser] = await db.select().from(users).where(eq(users.email, email));
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newUser = await storage.upsertUser({
        id: userId,
        email,
        firstName,
        lastName,
        password: hashedPassword,
        userType: 'job_seeker',
        emailVerified: true, // For simplicity, we'll skip email verification
        profileImageUrl: null,
        companyName: null,
        companyWebsite: null
      });

      // Store session
      (req as any).session.user = {
        id: newUser.id,
        email: newUser.email,
        name: `${newUser.firstName} ${newUser.lastName}`,
      };

      res.status(201).json({ 
        message: 'Account created successfully', 
        user: {
          id: newUser.id,
          email: newUser.email,
          name: `${newUser.firstName} ${newUser.lastName}`,
        }
      });
    } catch (error) {
      console.error('Email signup error:', error);
      res.status(500).json({ message: 'Failed to create account' });
    }
  });

  app.post('/api/auth/email/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      // Find user by email
      const [user] = await db.select().from(users).where(eq(users.email, email));
      if (!user || !user.password) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Store session
      (req as any).session.user = {
        id: user.id,
        email: user.email,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      };

      res.json({ 
        message: 'Login successful', 
        user: {
          id: user.id,
          email: user.email,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        }
      });
    } catch (error) {
      console.error('Email login error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
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
    const sessionUser = req.session?.user;
    
    if (!sessionUser) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // For demo user, use session data directly
    if (sessionUser.id === 'demo-user-id') {
      req.user = {
        id: sessionUser.id,
        email: sessionUser.email,
        name: sessionUser.name,
        firstName: 'Demo',
        lastName: 'User',
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