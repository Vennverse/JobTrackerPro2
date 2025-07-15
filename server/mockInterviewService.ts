import { storage } from "./storage";
import { groqService } from "./groqService";
import { MockInterview, MockInterviewQuestion, InsertMockInterview, InsertMockInterviewQuestion } from "@shared/schema";

interface InterviewQuestion {
  question: string;
  type: 'coding' | 'behavioral' | 'system_design';
  difficulty: 'easy' | 'medium' | 'hard';
  hints: string[];
  testCases?: Array<{
    input: any;
    expected: any;
    description: string;
  }>;
  sampleAnswer?: string;
}

interface InterviewConfiguration {
  role: string;
  company?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  interviewType: 'technical' | 'behavioral' | 'system_design';
  language: string;
  totalQuestions: number;
}

export class MockInterviewService {
  private readonly technicalQuestions = {
    easy: [
      {
        question: "Write a function to find the maximum number in an array",
        type: 'coding' as const,
        difficulty: 'easy' as const,
        hints: ["Consider using a loop", "Initialize with the first element", "Compare each element"],
        testCases: [
          { input: [1, 5, 3, 9, 2], expected: 9, description: "Basic array" },
          { input: [-1, -5, -3], expected: -1, description: "All negative numbers" },
          { input: [42], expected: 42, description: "Single element" }
        ],
        sampleAnswer: "function findMax(arr) { return Math.max(...arr); }"
      },
      {
        question: "Implement a function to reverse a string",
        type: 'coding' as const,
        difficulty: 'easy' as const,
        hints: ["Use built-in methods", "Consider split, reverse, join", "Loop from end to start"],
        testCases: [
          { input: "hello", expected: "olleh", description: "Basic string" },
          { input: "a", expected: "a", description: "Single character" },
          { input: "", expected: "", description: "Empty string" }
        ],
        sampleAnswer: "function reverseString(str) { return str.split('').reverse().join(''); }"
      }
    ],
    medium: [
      {
        question: "Implement a function to check if a string is a palindrome",
        type: 'coding' as const,
        difficulty: 'medium' as const,
        hints: ["Compare characters from both ends", "Consider case sensitivity", "Handle spaces and punctuation"],
        testCases: [
          { input: "racecar", expected: true, description: "Simple palindrome" },
          { input: "hello", expected: false, description: "Not a palindrome" },
          { input: "A man a plan a canal Panama", expected: true, description: "Palindrome with spaces" }
        ],
        sampleAnswer: "function isPalindrome(str) { const cleaned = str.replace(/[^A-Za-z0-9]/g, '').toLowerCase(); return cleaned === cleaned.split('').reverse().join(''); }"
      },
      {
        question: "Find the two numbers in an array that sum to a target value",
        type: 'coding' as const,
        difficulty: 'medium' as const,
        hints: ["Use a hash map for O(n) solution", "Store complement values", "Check if complement exists"],
        testCases: [
          { input: { arr: [2, 7, 11, 15], target: 9 }, expected: [0, 1], description: "Basic two sum" },
          { input: { arr: [3, 2, 4], target: 6 }, expected: [1, 2], description: "Different indices" },
          { input: { arr: [3, 3], target: 6 }, expected: [0, 1], description: "Same numbers" }
        ],
        sampleAnswer: "function twoSum(nums, target) { const map = new Map(); for (let i = 0; i < nums.length; i++) { const complement = target - nums[i]; if (map.has(complement)) return [map.get(complement), i]; map.set(nums[i], i); } return []; }"
      }
    ],
    hard: [
      {
        question: "Implement a function to find the longest substring without repeating characters",
        type: 'coding' as const,
        difficulty: 'hard' as const,
        hints: ["Use sliding window technique", "Keep track of character positions", "Update window when duplicate found"],
        testCases: [
          { input: "abcabcbb", expected: 3, description: "abc" },
          { input: "bbbbb", expected: 1, description: "Single character" },
          { input: "pwwkew", expected: 3, description: "wke" }
        ],
        sampleAnswer: "function lengthOfLongestSubstring(s) { let maxLength = 0; let start = 0; const charIndex = new Map(); for (let end = 0; end < s.length; end++) { if (charIndex.has(s[end])) { start = Math.max(charIndex.get(s[end]) + 1, start); } charIndex.set(s[end], end); maxLength = Math.max(maxLength, end - start + 1); } return maxLength; }"
      }
    ]
  };

  private readonly behavioralQuestions = [
    {
      question: "Tell me about a time when you had to work with a difficult team member. How did you handle it?",
      type: 'behavioral' as const,
      difficulty: 'medium' as const,
      hints: ["Use the STAR method", "Focus on your actions", "Show growth and learning"],
      sampleAnswer: "I once worked with a colleague who was consistently missing deadlines. I approached them privately to understand their challenges, offered to help with workload distribution, and we established regular check-ins. This improved our team's delivery by 40%."
    },
    {
      question: "Describe a situation where you had to learn a new technology quickly. What was your approach?",
      type: 'behavioral' as const,
      difficulty: 'medium' as const,
      hints: ["Show learning methodology", "Mention resources used", "Quantify the outcome"],
      sampleAnswer: "When our team needed to migrate to React, I dedicated 2 weeks to intensive learning through documentation, tutorials, and building a small project. I then led the migration of our main application, reducing load time by 30%."
    }
  ];

  private readonly systemDesignQuestions = [
    {
      question: "Design a URL shortener like bit.ly. What are the key components and how would you scale it?",
      type: 'system_design' as const,
      difficulty: 'hard' as const,
      hints: ["Consider database design", "Think about caching", "Plan for high traffic", "URL encoding strategies"],
      sampleAnswer: "Key components: Load balancer, Web servers, Database (URLs mapping), Cache (Redis), Analytics service. Use base62 encoding for short URLs, implement rate limiting, and use CDN for global distribution."
    },
    {
      question: "How would you design a chat application like WhatsApp? Focus on real-time messaging.",
      type: 'system_design' as const,
      difficulty: 'hard' as const,
      hints: ["WebSocket connections", "Message queuing", "Database schema", "Push notifications"],
      sampleAnswer: "Use WebSocket for real-time communication, message queues (Kafka/RabbitMQ), NoSQL for message storage, implement message status tracking, and use push notification services for offline users."
    }
  ];

  async generateInterviewQuestions(config: InterviewConfiguration): Promise<InterviewQuestion[]> {
    const questions: InterviewQuestion[] = [];
    
    if (config.interviewType === 'technical') {
      // Select questions based on difficulty
      const questionPool = this.technicalQuestions[config.difficulty] || this.technicalQuestions.medium;
      
      // Add some variety by including questions from adjacent difficulty levels
      const allQuestions = [
        ...questionPool,
        ...(config.difficulty !== 'easy' ? this.technicalQuestions.easy.slice(0, 1) : []),
        ...(config.difficulty !== 'hard' ? this.technicalQuestions.hard.slice(0, 1) : [])
      ];
      
      // Randomly select questions
      const shuffled = allQuestions.sort(() => 0.5 - Math.random());
      questions.push(...shuffled.slice(0, config.totalQuestions));
      
    } else if (config.interviewType === 'behavioral') {
      const shuffled = this.behavioralQuestions.sort(() => 0.5 - Math.random());
      questions.push(...shuffled.slice(0, config.totalQuestions));
      
    } else if (config.interviewType === 'system_design') {
      const shuffled = this.systemDesignQuestions.sort(() => 0.5 - Math.random());
      questions.push(...shuffled.slice(0, config.totalQuestions));
    }

    // If we need more questions, generate them with AI
    if (questions.length < config.totalQuestions) {
      const aiQuestions = await this.generateAIQuestions(config, config.totalQuestions - questions.length);
      questions.push(...aiQuestions);
    }

    return questions;
  }

  private async generateAIQuestions(config: InterviewConfiguration, count: number): Promise<InterviewQuestion[]> {
    const prompt = `Generate ${count} ${config.interviewType} interview questions for a ${config.role} position at ${config.company || 'a tech company'}. 
    Difficulty level: ${config.difficulty}
    Programming language: ${config.language}
    
    For each question, provide:
    1. The question text
    2. 3 helpful hints
    3. For coding questions: 3 test cases with input/output
    4. A sample answer
    
    Return JSON format with array of questions.`;

    try {
      const response = await groqService.client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) return [];

      const aiQuestions = JSON.parse(content);
      return aiQuestions.map((q: any) => ({
        question: q.question,
        type: config.interviewType === 'technical' ? 'coding' : config.interviewType,
        difficulty: config.difficulty,
        hints: q.hints || [],
        testCases: q.testCases || [],
        sampleAnswer: q.sampleAnswer || ''
      }));
    } catch (error) {
      console.error('Error generating AI questions:', error);
      return [];
    }
  }

  async startInterview(userId: string, config: InterviewConfiguration): Promise<MockInterview> {
    const sessionId = `interview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const interviewData: InsertMockInterview = {
      userId,
      sessionId,
      interviewType: config.interviewType,
      difficulty: config.difficulty,
      role: config.role,
      company: config.company,
      language: config.language,
      totalQuestions: config.totalQuestions,
      timeRemaining: 3600, // 1 hour
      isPaid: false // First interview is free
    };

    const interview = await storage.createMockInterview(interviewData);
    
    // Generate and store questions
    const questions = await this.generateInterviewQuestions(config);
    
    for (let i = 0; i < questions.length; i++) {
      const questionData: InsertMockInterviewQuestion = {
        interviewId: interview.id,
        questionNumber: i + 1,
        question: questions[i].question,
        questionType: questions[i].type,
        difficulty: questions[i].difficulty,
        hints: JSON.stringify(questions[i].hints),
        testCases: JSON.stringify(questions[i].testCases || []),
        sampleAnswer: questions[i].sampleAnswer
      };
      
      await storage.createMockInterviewQuestion(questionData);
    }

    return interview;
  }

  async getInterviewWithQuestions(sessionId: string): Promise<{ interview: MockInterview; questions: MockInterviewQuestion[] } | null> {
    const interview = await storage.getMockInterviewBySessionId(sessionId);
    if (!interview) return null;

    const questions = await storage.getMockInterviewQuestions(interview.id);
    return { interview, questions };
  }

  async submitAnswer(questionId: number, answer: string, code?: string): Promise<void> {
    const question = await storage.getMockInterviewQuestion(questionId);
    if (!question) throw new Error('Question not found');

    // Update question with user's answer
    await storage.updateMockInterviewQuestion(questionId, {
      userAnswer: answer,
      userCode: code,
      timeSpent: 0 // Will be calculated on frontend
    });

    // Generate AI feedback for the answer
    const feedback = await this.generateFeedback(question, answer, code);
    const score = await this.calculateScore(question, answer, code);

    await storage.updateMockInterviewQuestion(questionId, {
      feedback,
      score
    });
  }

  private async generateFeedback(question: MockInterviewQuestion, answer: string, code?: string): Promise<string> {
    const prompt = `Provide constructive feedback for this interview answer:
    
    Question: ${question.question}
    Question Type: ${question.questionType}
    User Answer: ${answer}
    ${code ? `Code: ${code}` : ''}
    
    Provide specific, actionable feedback focusing on:
    1. Correctness and completeness
    2. Code quality and best practices (if applicable)
    3. Communication and explanation
    4. Suggestions for improvement
    
    Keep feedback constructive and encouraging.`;

    try {
      const response = await groqService.client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        max_tokens: 500,
      });

      return response.choices[0]?.message?.content || 'No feedback available';
    } catch (error) {
      console.error('Error generating feedback:', error);
      return 'Feedback generation failed';
    }
  }

  private async calculateScore(question: MockInterviewQuestion, answer: string, code?: string): Promise<number> {
    if (question.questionType === 'coding' && code) {
      // For coding questions, test the code against test cases
      try {
        const testCases = JSON.parse(question.testCases || '[]');
        let passedTests = 0;
        
        // Simple code evaluation (in a real system, use a secure sandbox)
        for (const testCase of testCases) {
          try {
            // This is a simplified evaluation - in production, use a secure code execution environment
            const result = eval(`(${code})(${JSON.stringify(testCase.input)})`);
            if (JSON.stringify(result) === JSON.stringify(testCase.expected)) {
              passedTests++;
            }
          } catch (error) {
            // Code execution failed for this test case
          }
        }
        
        return Math.round((passedTests / testCases.length) * 100);
      } catch (error) {
        return 30; // Base score for attempt
      }
    } else {
      // For behavioral and system design questions, use AI to score
      const prompt = `Rate this interview answer on a scale of 0-100:
      
      Question: ${question.question}
      Answer: ${answer}
      
      Consider:
      - Completeness and relevance
      - Structure and clarity
      - Specific examples and details
      - Overall quality
      
      Return only the numeric score.`;

      try {
        const response = await groqService.client.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 10,
        });

        const score = parseInt(response.choices[0]?.message?.content || '50');
        return Math.max(0, Math.min(100, score));
      } catch (error) {
        return 50; // Default score
      }
    }
  }

  async completeInterview(sessionId: string): Promise<MockInterview> {
    const interview = await storage.getMockInterviewBySessionId(sessionId);
    if (!interview) throw new Error('Interview not found');

    const questions = await storage.getMockInterviewQuestions(interview.id);
    const totalScore = questions.reduce((sum, q) => sum + (q.score || 0), 0);
    const averageScore = Math.round(totalScore / questions.length);

    const overallFeedback = await this.generateOverallFeedback(interview, questions);

    const updatedInterview = await storage.updateMockInterview(interview.id, {
      status: 'completed',
      endTime: new Date(),
      score: averageScore,
      feedback: overallFeedback
    });

    // Update user interview stats
    await this.updateUserStats(interview.userId, averageScore);

    return updatedInterview;
  }

  private async generateOverallFeedback(interview: MockInterview, questions: MockInterviewQuestion[]): Promise<string> {
    const prompt = `Generate overall interview feedback based on these responses:
    
    Interview Type: ${interview.interviewType}
    Role: ${interview.role}
    Difficulty: ${interview.difficulty}
    
    Questions and Scores:
    ${questions.map(q => `Q: ${q.question}\nScore: ${q.score || 0}/100`).join('\n\n')}
    
    Provide:
    1. Overall performance summary
    2. Strengths identified
    3. Areas for improvement
    4. Specific recommendations for next steps
    
    Keep it encouraging and actionable.`;

    try {
      const response = await groqService.client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.6,
        max_tokens: 800,
      });

      return response.choices[0]?.message?.content || 'Great job completing the interview! Keep practicing to improve your skills.';
    } catch (error) {
      return 'Great job completing the interview! Keep practicing to improve your skills.';
    }
  }

  private async updateUserStats(userId: string, score: number): Promise<void> {
    const existingStats = await storage.getUserInterviewStats(userId);
    
    if (existingStats) {
      const totalInterviews = existingStats.totalInterviews + 1;
      const newAverage = Math.round(((existingStats.averageScore * existingStats.totalInterviews) + score) / totalInterviews);
      
      await storage.upsertUserInterviewStats({
        userId,
        totalInterviews,
        freeInterviewsUsed: existingStats.freeInterviewsUsed + 1,
        averageScore: newAverage,
        bestScore: Math.max(existingStats.bestScore, score),
        lastInterviewDate: new Date()
      });
    } else {
      await storage.upsertUserInterviewStats({
        userId,
        totalInterviews: 1,
        freeInterviewsUsed: 1,
        averageScore: score,
        bestScore: score,
        lastInterviewDate: new Date()
      });
    }
  }

  async checkFreeInterviewsRemaining(userId: string): Promise<number> {
    const stats = await storage.getUserInterviewStats(userId);
    const freeInterviewsUsed = stats?.freeInterviewsUsed || 0;
    return Math.max(0, 1 - freeInterviewsUsed); // 1 free interview
  }

  async addInterviewCredits(userId: string, credits: number): Promise<void> {
    const stats = await storage.getUserInterviewStats(userId);
    
    if (stats) {
      // Reset free interviews used to allow more interviews
      await storage.upsertUserInterviewStats({
        userId,
        totalInterviews: stats.totalInterviews,
        freeInterviewsUsed: Math.max(0, stats.freeInterviewsUsed - credits),
        averageScore: stats.averageScore,
        bestScore: stats.bestScore,
        lastInterviewDate: stats.lastInterviewDate
      });
    } else {
      // Create new stats with credits
      await storage.upsertUserInterviewStats({
        userId,
        totalInterviews: 0,
        freeInterviewsUsed: -credits, // Negative means additional credits
        averageScore: 0,
        bestScore: 0,
        lastInterviewDate: new Date()
      });
    }
  }
}

export const mockInterviewService = new MockInterviewService();