import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import LinkedInProvider from "next-auth/providers/linkedin";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { users, accounts, sessionsAuth, verificationTokens } from "@shared/schema";
import { eq } from "drizzle-orm";
import type { Express, RequestHandler } from "express";

// NextAuth configuration
export const authOptions = {
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessionsAuth,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
    }),
    // Email/Password login (disabled by default)
    ...(process.env.ENABLE_EMAIL_LOGIN === 'true' ? [
      CredentialsProvider({
        name: "credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" }
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, credentials.email));

          if (!user || !user.password) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        }
      })
    ] : []),
  ],
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.uid = user.id;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.uid as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
};

const handler = NextAuth(authOptions);

export async function setupAuth(app: Express) {
  // NextAuth.js API routes
  app.all('/api/auth/*', (req, res) => {
    return handler(req, res);
  });

  // Custom auth routes
  app.get('/api/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        email: user.email,
        name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        image: user.image || user.profileImageUrl,
        firstName: user.firstName,
        lastName: user.lastName,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Register route (for email/password - optional)
  app.post('/api/register', async (req, res) => {
    if (process.env.ENABLE_EMAIL_LOGIN !== 'true') {
      return res.status(403).json({ message: "Email registration is disabled" });
    }

    try {
      const { email, password, name } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Check if user already exists
      const [existingUser] = await db.select().from(users).where(eq(users.email, email));
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const [user] = await db.insert(users).values({
        id: crypto.randomUUID(),
        email,
        name,
        password: hashedPassword,
      }).returning();

      res.status(201).json({ message: "User created successfully", userId: user.id });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });
}

// Middleware to check authentication
export const isAuthenticated: RequestHandler = async (req: any, res, next) => {
  try {
    // Get token from session or authorization header
    const token = req.headers.authorization?.replace('Bearer ', '') || 
                 req.session?.token;

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // For development, we'll use a simple token validation
    // In production, this should validate JWT tokens properly
    const userId = req.session?.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: "Invalid token" });
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