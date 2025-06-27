import express from "express";
import session from "express-session";
import bcrypt from "bcryptjs";
import { db } from "./db";
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
  app.get('/api/user', (req: any, res) => {
    try {
      const sessionUser = req.session?.user;
      
      if (!sessionUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // For demo user, return session data directly
      if (sessionUser.id === 'demo-user-id') {
        return res.json({
          id: sessionUser.id,
          email: sessionUser.email,
          name: sessionUser.name,
          firstName: 'Demo',
          lastName: 'User',
        });
      }

      // For real users, try database (with fallback)
      res.json({
        id: sessionUser.id,
        email: sessionUser.email,
        name: sessionUser.name,
        firstName: 'User',
        lastName: 'Name',
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
      res.json({ message: "Logged out successfully" });
    });
  });

  // Demo login for testing (without database dependency)
  app.post('/api/auth/demo', async (req, res) => {
    try {
      // Create demo user in session without database
      const demoUser = {
        id: 'demo-user-id',
        email: 'demo@autojobr.com',
        name: 'Demo User',
        firstName: 'Demo',
        lastName: 'User',
      };

      // Set session
      (req as any).session.user = {
        id: demoUser.id,
        email: demoUser.email,
        name: demoUser.name,
      };

      res.json({ 
        message: "Demo login successful", 
        user: {
          id: demoUser.id,
          email: demoUser.email,
          name: demoUser.name,
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
    const userId = req.session?.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Get user from database
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ message: "Authentication failed" });
  }
};