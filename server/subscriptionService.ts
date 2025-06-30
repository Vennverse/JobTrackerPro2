import { db } from "./db";
import { users, dailyUsage } from "@shared/schema";
import { eq, and } from "drizzle-orm";

// Daily usage limits for free vs pro users
export const USAGE_LIMITS = {
  free: {
    jobAnalyses: 5,
    resumeAnalyses: 2,
    applications: 10,
    autoFills: 15,
  },
  premium: {
    jobAnalyses: -1, // unlimited
    resumeAnalyses: -1, // unlimited
    applications: -1, // unlimited
    autoFills: -1, // unlimited
  },
};

export class SubscriptionService {
  private getTodayDate(): string {
    return new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  }

  async getUserSubscription(userId: string) {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    return {
      planType: user?.planType || 'free',
      subscriptionStatus: user?.subscriptionStatus || 'free',
      isPremiumUser: user?.planType === 'premium' && user?.subscriptionStatus === 'active',
    };
  }

  async getDailyUsage(userId: string, date?: string) {
    const targetDate = date || this.getTodayDate();
    
    const [usage] = await db
      .select()
      .from(dailyUsage)
      .where(and(
        eq(dailyUsage.userId, userId),
        eq(dailyUsage.date, targetDate)
      ));

    return usage || {
      jobAnalysesCount: 0,
      resumeAnalysesCount: 0,
      applicationsCount: 0,
      autoFillUsageCount: 0,
    };
  }

  async canUseFeature(userId: string, feature: keyof typeof USAGE_LIMITS.free): Promise<{
    canUse: boolean;
    remainingUsage: number;
    upgradeRequired: boolean;
    resetTime: string;
  }> {
    const subscription = await this.getUserSubscription(userId);
    const usage = await this.getDailyUsage(userId);
    
    // Premium users have unlimited access
    if (subscription.planType === 'premium') {
      return {
        canUse: true,
        remainingUsage: -1, // unlimited
        upgradeRequired: false,
        resetTime: '',
      };
    }

    const limit = USAGE_LIMITS.free[feature];
    const usageKey = feature === 'autoFills' ? 'autoFillsCount' : `${feature}Count`;
    const currentUsage = usage[usageKey as keyof typeof usage] as number || 0;
    const remaining = Math.max(0, limit - currentUsage);
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    return {
      canUse: remaining > 0,
      remainingUsage: remaining,
      upgradeRequired: remaining === 0,
      resetTime: tomorrow.toISOString(),
    };
  }

  async incrementUsage(userId: string, feature: keyof typeof USAGE_LIMITS.free) {
    const today = this.getTodayDate();
    
    // Get or create today's usage record
    const [existingUsage] = await db
      .select()
      .from(dailyUsage)
      .where(and(
        eq(dailyUsage.userId, userId),
        eq(dailyUsage.date, today)
      ));

    const featureColumn = `${feature}Count` as keyof typeof USAGE_LIMITS.free;
    
    if (existingUsage) {
      // Update existing record
      const updateData = {
        [featureColumn]: (existingUsage[featureColumn as keyof typeof existingUsage] as number || 0) + 1,
        updatedAt: new Date(),
      };
      
      await db
        .update(dailyUsage)
        .set(updateData)
        .where(eq(dailyUsage.id, existingUsage.id));
    } else {
      // Create new record
      const insertData = {
        userId,
        date: today,
        jobAnalysesCount: feature === 'jobAnalyses' ? 1 : 0,
        resumeAnalysesCount: feature === 'resumeAnalyses' ? 1 : 0,
        applicationsCount: feature === 'applications' ? 1 : 0,
        autoFillsCount: feature === 'autoFills' ? 1 : 0,
      };
      
      await db.insert(dailyUsage).values(insertData);
    }
  }

  async updateUserSubscription(userId: string, subscriptionData: {
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    paypalSubscriptionId?: string;
    paypalOrderId?: string;
    razorpayPaymentId?: string;
    razorpayOrderId?: string;
    paymentProvider?: string;
    subscriptionStatus?: string;
    planType?: string;
    subscriptionStartDate?: Date;
    subscriptionEndDate?: Date;
  }) {
    await db
      .update(users)
      .set({
        ...subscriptionData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async getUsageStats(userId: string) {
    const subscription = await this.getUserSubscription(userId);
    const usage = await this.getDailyUsage(userId);
    
    const limits = subscription.isPremiumUser ? USAGE_LIMITS.premium : USAGE_LIMITS.free;
    
    return {
      subscription: {
        planType: subscription.planType,
        subscriptionStatus: subscription.subscriptionStatus,
        subscriptionEndDate: null, // Add if we track end dates
      },
      usage: {
        jobAnalyses: usage.jobAnalysesCount || 0,
        resumeAnalyses: usage.resumeAnalysesCount || 0,
        applications: usage.applicationsCount || 0,
        autoFills: usage.autoFillsCount || 0,
      },
      limits: subscription.isPremiumUser ? null : {
        jobAnalyses: limits.jobAnalyses,
        resumeAnalyses: limits.resumeAnalyses,
        applications: limits.applications,
        autoFills: limits.autoFills,
      },
      resetTime: new Date(new Date().setHours(24, 0, 0, 0)).toISOString(),
    };
  }
}

export const subscriptionService = new SubscriptionService();