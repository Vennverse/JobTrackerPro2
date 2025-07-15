import { Router } from 'express';
import { mockInterviewService } from './mockInterviewService';
import { storage } from './storage';
import { isAuthenticated } from './replitAuth';
import { paymentService } from './paymentService';
import { z } from 'zod';

const router = Router();

// Validation schemas
const startInterviewSchema = z.object({
  role: z.string().min(1),
  company: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  interviewType: z.enum(['technical', 'behavioral', 'system_design']),
  language: z.string().default('javascript'),
  totalQuestions: z.number().min(1).max(10).default(3)
});

const submitAnswerSchema = z.object({
  questionId: z.number(),
  answer: z.string(),
  code: z.string().optional(),
  timeSpent: z.number().optional()
});

// Get user's interview stats
router.get('/stats', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const stats = await storage.getUserInterviewStats(userId);
    const freeInterviewsRemaining = await mockInterviewService.checkFreeInterviewsRemaining(userId);
    
    res.json({
      ...stats,
      freeInterviewsRemaining
    });
  } catch (error) {
    console.error('Error fetching interview stats:', error);
    res.status(500).json({ error: 'Failed to fetch interview stats' });
  }
});

// Get user's interview history
router.get('/history', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const interviews = await storage.getMockInterviews(userId);
    res.json(interviews);
  } catch (error) {
    console.error('Error fetching interview history:', error);
    res.status(500).json({ error: 'Failed to fetch interview history' });
  }
});

// Start a new interview
router.post('/start', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const config = startInterviewSchema.parse(req.body);
    
    // Check if user has free interviews remaining
    const freeInterviewsRemaining = await mockInterviewService.checkFreeInterviewsRemaining(userId);
    
    if (freeInterviewsRemaining === 0) {
      return res.status(402).json({ 
        error: 'No free interviews remaining',
        requiresPayment: true,
        message: 'You have used your free interview. Please purchase additional interviews to continue.'
      });
    }
    
    const interview = await mockInterviewService.startInterview(userId, config);
    res.json(interview);
  } catch (error) {
    console.error('Error starting interview:', error);
    res.status(500).json({ error: 'Failed to start interview' });
  }
});

// Get interview session with questions
router.get('/session/:sessionId', isAuthenticated, async (req: any, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.claims.sub;
    
    const interviewData = await mockInterviewService.getInterviewWithQuestions(sessionId);
    
    if (!interviewData) {
      return res.status(404).json({ error: 'Interview session not found' });
    }
    
    // Verify user owns this interview
    if (interviewData.interview.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized access to interview' });
    }
    
    res.json(interviewData);
  } catch (error) {
    console.error('Error fetching interview session:', error);
    res.status(500).json({ error: 'Failed to fetch interview session' });
  }
});

// Submit answer to a question
router.post('/answer', isAuthenticated, async (req: any, res) => {
  try {
    const { questionId, answer, code, timeSpent } = submitAnswerSchema.parse(req.body);
    
    // Verify user owns this question's interview
    const question = await storage.getMockInterviewQuestion(questionId);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    const interview = await storage.getMockInterview(question.interviewId);
    if (!interview || interview.userId !== req.user.claims.sub) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }
    
    await mockInterviewService.submitAnswer(questionId, answer, code);
    
    // Update time spent if provided
    if (timeSpent) {
      await storage.updateMockInterviewQuestion(questionId, { timeSpent });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({ error: 'Failed to submit answer' });
  }
});

// Complete an interview
router.post('/complete/:sessionId', isAuthenticated, async (req: any, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.claims.sub;
    
    // Verify user owns this interview
    const interviewData = await mockInterviewService.getInterviewWithQuestions(sessionId);
    if (!interviewData || interviewData.interview.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }
    
    const completedInterview = await mockInterviewService.completeInterview(sessionId);
    res.json(completedInterview);
  } catch (error) {
    console.error('Error completing interview:', error);
    res.status(500).json({ error: 'Failed to complete interview' });
  }
});

// Get interview results
router.get('/results/:sessionId', isAuthenticated, async (req: any, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.claims.sub;
    
    const interviewData = await mockInterviewService.getInterviewWithQuestions(sessionId);
    
    if (!interviewData || interviewData.interview.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }
    
    if (interviewData.interview.status !== 'completed') {
      return res.status(400).json({ error: 'Interview not completed yet' });
    }
    
    res.json({
      interview: interviewData.interview,
      questions: interviewData.questions,
      overallScore: interviewData.interview.score,
      feedback: interviewData.interview.feedback
    });
  } catch (error) {
    console.error('Error fetching interview results:', error);
    res.status(500).json({ error: 'Failed to fetch interview results' });
  }
});

// Payment routes for mock interviews
router.post('/payment', isAuthenticated, async (req: any, res) => {
  try {
    const { amount, currency, method, item } = req.body;
    const userId = req.user.claims.sub;
    
    // Validate payment amount for mock interviews
    if (amount !== 2.00) {
      return res.status(400).json({ error: 'Invalid payment amount' });
    }
    
    if (method === 'stripe') {
      // Create Stripe payment intent
      const paymentIntent = await paymentService.createStripePaymentIntent({
        amount: amount * 100, // Convert to cents
        currency: currency || 'usd',
        metadata: {
          userId,
          type: 'mock_interview',
          item
        }
      });
      
      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    } else if (method === 'razorpay') {
      // Create Razorpay order
      const order = await paymentService.createRazorpayOrder({
        amount: amount * 100, // Convert to paise
        currency: currency || 'USD',
        receipt: `mock_interview_${Date.now()}`,
        notes: {
          userId,
          type: 'mock_interview',
          item
        }
      });
      
      res.json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        email: req.user.claims.email || '',
        phone: req.user.claims.phone || ''
      });
    } else if (method === 'paypal') {
      // Create PayPal order
      const order = await paymentService.createPaypalOrder({
        amount: amount.toString(),
        currency: currency || 'USD',
        description: 'Mock Interview Practice',
        metadata: {
          userId,
          type: 'mock_interview',
          item
        }
      });
      
      res.json({
        orderId: order.id,
        approvalUrl: order.links.find((link: any) => link.rel === 'approve')?.href
      });
    } else {
      return res.status(400).json({ error: 'Unsupported payment method' });
    }
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

// Handle payment success
router.post('/payment/success', isAuthenticated, async (req: any, res) => {
  try {
    const { paymentId, method } = req.body;
    const userId = req.user.claims.sub;
    
    // Verify payment based on method
    let isPaymentValid = false;
    
    if (method === 'stripe') {
      isPaymentValid = await paymentService.verifyStripePayment(paymentId);
    } else if (method === 'razorpay') {
      isPaymentValid = await paymentService.verifyRazorpayPayment(paymentId);
    } else if (method === 'paypal') {
      isPaymentValid = await paymentService.verifyPaypalPayment(paymentId);
    }
    
    if (isPaymentValid) {
      // Grant additional interview credits
      await mockInterviewService.addInterviewCredits(userId, 1);
      
      res.json({ 
        success: true, 
        message: 'Payment successful! You can now start your mock interview.' 
      });
    } else {
      res.status(400).json({ error: 'Payment verification failed' });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

export { router as mockInterviewRoutes };