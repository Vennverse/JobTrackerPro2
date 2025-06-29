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

      // For real users, fetch from database
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
        console.error("Error fetching full user data:", error);
      }

      // Fallback to session data if database fetch fails
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

      // Create new user (not verified yet)
      const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newUser = await storage.upsertUser({
        id: userId,
        email,
        firstName,
        lastName,
        password: hashedPassword,
        userType: 'job_seeker',
        emailVerified: false, // User needs to verify email
        profileImageUrl: null,
        companyName: null,
        companyWebsite: null
      });

      // Generate verification token
      const verificationToken = Math.random().toString(36).substr(2, 32);
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry

      // Store verification token
      await storage.createEmailVerificationToken({
        token: verificationToken,
        email,
        userId,
        expiresAt,
        verified: false
      });

      // Send verification email
      try {
        const { sendEmail, generateVerificationEmail } = await import('./emailService');
        const emailHtml = generateVerificationEmail(verificationToken, 'AutoJobr');
        
        await sendEmail({
          to: email,
          subject: 'Verify your AutoJobr account',
          html: emailHtml,
        });

        res.status(201).json({ 
          message: 'Account created successfully. Please check your email to verify your account.',
          requiresVerification: true,
          email: email
        });
      } catch (emailError) {
        console.error('Email sending error:', emailError);
        // If email fails, still create account but notify user
        res.status(201).json({ 
          message: 'Account created but verification email could not be sent. Please contact support.',
          requiresVerification: true,
          email: email
        });
      }
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

      // Check if email is verified (only for email signup users)
      if (!user.emailVerified) {
        return res.status(403).json({ 
          message: 'Please verify your email address before logging in. Check your inbox for the verification email.',
          requiresVerification: true,
          email: user.email
        });
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

  // Email verification endpoint
  app.get('/api/auth/verify-email', async (req, res) => {
    try {
      const { token } = req.query;

      if (!token) {
        return res.status(400).json({ message: 'Verification token is required' });
      }

      // Get token from database
      const tokenRecord = await storage.getEmailVerificationToken(token as string);
      
      if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
        return res.status(400).json({ message: 'Invalid or expired verification token' });
      }

      // Update user's email verification status
      const user = await storage.getUser(tokenRecord.userId);
      if (user) {
        await storage.upsertUser({
          ...user,
          emailVerified: true,
        });

        // Delete used token
        await storage.deleteEmailVerificationToken(token as string);

        // Auto-login the user
        (req as any).session.user = {
          id: user.id,
          email: user.email,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        };

        // Redirect to app
        res.redirect('/?verified=true');
      } else {
        return res.status(400).json({ message: 'User not found' });
      }
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({ message: 'Email verification failed' });
    }
  });

  // Resend verification email
  app.post('/api/auth/resend-verification', async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }

      // Find user by email
      const [user] = await db.select().from(users).where(eq(users.email, email));
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (user.emailVerified) {
        return res.status(400).json({ message: 'Email is already verified' });
      }

      // Generate new verification token
      const verificationToken = Math.random().toString(36).substr(2, 32);
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry

      // Delete old tokens for this user
      try {
        await storage.deleteEmailVerificationTokensByUserId(user.id);
      } catch (error) {
        console.log('No old tokens to delete');
      }

      // Store new verification token
      await storage.createEmailVerificationToken({
        token: verificationToken,
        email,
        userId: user.id,
        expiresAt,
        verified: false
      });

      // Send verification email
      try {
        const { sendEmail, generateVerificationEmail } = await import('./emailService');
        const emailHtml = generateVerificationEmail(verificationToken, 'AutoJobr');
        
        await sendEmail({
          to: email,
          subject: 'Verify your AutoJobr account',
          html: emailHtml,
        });

        res.json({ 
          message: 'Verification email sent successfully. Please check your inbox.'
        });
      } catch (emailError) {
        console.error('Email sending error:', emailError);
        res.status(500).json({ 
          message: 'Failed to send verification email. Please try again later.'
        });
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      res.status(500).json({ message: 'Failed to resend verification email' });
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