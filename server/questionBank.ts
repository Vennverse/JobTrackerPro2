// Comprehensive Question Bank for AutoJobr
// This file contains pre-built questions organized by category and difficulty

interface QuestionBankItem {
  id: string;
  type: 'multiple_choice' | 'multiple_select' | 'true_false' | 'short_answer' | 'long_answer' | 'coding' | 'scenario' | 'case_study';
  category: 'general_aptitude' | 'english' | 'domain_specific';
  domain: 'general' | 'technical' | 'finance' | 'marketing' | 'accounting' | 'hr' | 'sales';
  subCategory: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  question: string;
  options?: string[];
  correctAnswer?: string | number | number[];
  explanation?: string;
  points: number;
  timeLimit: number; // in minutes
  tags: string[];
  keywords: string[];
  testCases?: string; // For coding questions
  boilerplate?: string; // For coding questions
  language?: string; // For coding questions
}

export const questionBank: QuestionBankItem[] = [
  // GENERAL APTITUDE QUESTIONS (50%)
  
  // Mathematics - Easy to Medium
  {
    id: 'apt_math_001',
    type: 'multiple_choice',
    category: 'general_aptitude',
    domain: 'general',
    subCategory: 'Mathematics',
    difficulty: 'medium',
    question: 'If a train travels 360 km in 4 hours, what is its average speed in km/h?',
    options: ['80', '90', '100', '110'],
    correctAnswer: 1,
    explanation: 'Speed = Distance / Time = 360 / 4 = 90 km/h',
    points: 5,
    timeLimit: 2,
    tags: ['aptitude', 'math', 'speed'],
    keywords: ['speed', 'distance', 'time']
  },
  
  {
    id: 'apt_math_002',
    type: 'multiple_choice',
    category: 'general_aptitude',
    domain: 'general',
    subCategory: 'Mathematics',
    difficulty: 'hard',
    question: 'A container has a mixture of milk and water in the ratio 4:1. If 10 liters of the mixture is removed and replaced with 10 liters of water, the new ratio becomes 2:3. What was the original volume of the container?',
    options: ['25 liters', '30 liters', '40 liters', '50 liters'],
    correctAnswer: 3,
    explanation: 'Let original volume be V. Initial milk = 4V/5, water = V/5. After replacement: milk = 4V/5 - 8 = 2(V+10)/5, solving gives V = 50.',
    points: 10,
    timeLimit: 5,
    tags: ['aptitude', 'math', 'mixture', 'ratio'],
    keywords: ['mixture', 'ratio', 'proportion']
  },

  // Logical Reasoning - Extreme Difficulty
  {
    id: 'apt_logic_001',
    type: 'multiple_choice',
    category: 'general_aptitude',
    domain: 'general',
    subCategory: 'Logical Reasoning',
    difficulty: 'extreme',
    question: 'In a room of 100 people, 70 speak English, 80 speak Spanish, and 60 speak French. What is the minimum number of people who speak all three languages?',
    options: ['10', '20', '30', '40'],
    correctAnswer: 0,
    explanation: 'Using inclusion-exclusion principle: |E∩S∩F| ≥ |E| + |S| + |F| - 2|Total| = 70 + 80 + 60 - 2(100) = 10',
    points: 15,
    timeLimit: 8,
    tags: ['aptitude', 'logic', 'sets', 'extreme'],
    keywords: ['sets', 'inclusion-exclusion', 'logic']
  },

  // Data Interpretation
  {
    id: 'apt_data_001',
    type: 'multiple_choice',
    category: 'general_aptitude',
    domain: 'general',
    subCategory: 'Data Interpretation',
    difficulty: 'medium',
    question: 'A company\'s revenue grew from $100,000 in Year 1 to $150,000 in Year 2. What was the percentage increase?',
    options: ['40%', '50%', '60%', '66.67%'],
    correctAnswer: 1,
    explanation: 'Percentage increase = ((150,000 - 100,000) / 100,000) × 100 = 50%',
    points: 5,
    timeLimit: 3,
    tags: ['aptitude', 'data', 'percentage'],
    keywords: ['percentage', 'growth', 'data']
  },

  // ENGLISH QUESTIONS (20%)
  
  // Grammar
  {
    id: 'eng_gram_001',
    type: 'multiple_choice',
    category: 'english',
    domain: 'general',
    subCategory: 'Grammar',
    difficulty: 'medium',
    question: 'Choose the correct sentence:',
    options: [
      'Neither the manager nor the employees was present.',
      'Neither the manager nor the employees were present.',
      'Neither the manager or the employees were present.',
      'Neither the manager and the employees were present.'
    ],
    correctAnswer: 1,
    explanation: 'With "neither...nor", the verb agrees with the subject closer to it. "employees" is plural, so "were" is correct.',
    points: 5,
    timeLimit: 2,
    tags: ['english', 'grammar', 'subject-verb'],
    keywords: ['grammar', 'subject-verb agreement', 'neither-nor']
  },

  // Vocabulary - Hard
  {
    id: 'eng_vocab_001',
    type: 'multiple_choice',
    category: 'english',
    domain: 'general',
    subCategory: 'Vocabulary',
    difficulty: 'hard',
    question: 'What does "perspicacious" mean?',
    options: ['Stubborn', 'Having keen insight', 'Talkative', 'Mysterious'],
    correctAnswer: 1,
    explanation: 'Perspicacious means having a ready insight into and understanding of things.',
    points: 8,
    timeLimit: 2,
    tags: ['english', 'vocabulary', 'advanced'],
    keywords: ['vocabulary', 'insight', 'understanding']
  },

  // Reading Comprehension
  {
    id: 'eng_comp_001',
    type: 'multiple_choice',
    category: 'english',
    domain: 'general',
    subCategory: 'Reading Comprehension',
    difficulty: 'medium',
    question: 'Passage: "The rapid advancement of artificial intelligence has transformed industries worldwide. However, this technological revolution brings both opportunities and challenges. While AI can automate routine tasks and improve efficiency, it also raises concerns about job displacement and ethical implications."\n\nWhat is the main theme of this passage?',
    options: [
      'AI is only beneficial for industries',
      'AI advancement has both positive and negative impacts',
      'AI will replace all human jobs',
      'AI development should be stopped'
    ],
    correctAnswer: 1,
    explanation: 'The passage discusses both opportunities (automation, efficiency) and challenges (job displacement, ethical concerns) of AI.',
    points: 6,
    timeLimit: 4,
    tags: ['english', 'comprehension', 'analysis'],
    keywords: ['comprehension', 'analysis', 'artificial intelligence']
  },

  // DOMAIN-SPECIFIC QUESTIONS (30%)
  
  // TECHNICAL/DEVELOPER QUESTIONS
  
  // DSA - Leetcode Style - Hard
  {
    id: 'tech_dsa_001',
    type: 'coding',
    category: 'domain_specific',
    domain: 'technical',
    subCategory: 'Data Structures & Algorithms',
    difficulty: 'hard',
    question: `Given an array of integers, find the maximum sum of a subarray with the constraint that no two elements in the subarray are adjacent.

Example:
Input: [2, 4, 6, 2, 5]
Output: 13 (2 + 6 + 5)

Write a function that returns the maximum sum.`,
    testCases: JSON.stringify([
      {
        input: [2, 4, 6, 2, 5],
        expected: 13,
        description: "Basic case with mixed numbers"
      },
      {
        input: [1, 2, 3],
        expected: 4,
        description: "Small array"
      },
      {
        input: [5, 1, 3, 9],
        expected: 14,
        description: "Another test case"
      }
    ]),
    boilerplate: `function solution(nums) {
  // Your code here
  // Return the maximum sum
}`,
    language: 'javascript',
    points: 20,
    timeLimit: 30,
    tags: ['developer', 'dsa', 'dynamic-programming'],
    keywords: ['array', 'dynamic programming', 'maximum sum']
  },

  // System Design MCQ - Extreme
  {
    id: 'tech_sys_001',
    type: 'multiple_choice',
    category: 'domain_specific',
    domain: 'technical',
    subCategory: 'System Design',
    difficulty: 'extreme',
    question: 'You are designing a distributed system that needs to handle 1 million concurrent users with strict consistency requirements. Which combination of technologies would be most appropriate?',
    options: [
      'MongoDB with eventual consistency + Redis caching',
      'PostgreSQL with read replicas + Redis Cluster + Load balancer',
      'Cassandra with strong consistency + Memcached',
      'DynamoDB with global secondary indexes + ElastiCache'
    ],
    correctAnswer: 1,
    explanation: 'PostgreSQL with read replicas provides ACID guarantees for strict consistency, Redis Cluster offers distributed caching, and load balancers distribute the high concurrent load effectively.',
    points: 25,
    timeLimit: 10,
    tags: ['developer', 'system-design', 'scalability'],
    keywords: ['system design', 'scalability', 'consistency', 'distributed']
  },

  // Debugging - Hard
  {
    id: 'tech_debug_001',
    type: 'multiple_choice',
    category: 'domain_specific',
    domain: 'technical',
    subCategory: 'Debugging',
    difficulty: 'hard',
    question: `What is the output of the following JavaScript code?

\`\`\`javascript
function test() {
  var a = 1;
  if (true) {
    var a = 2;
    console.log(a);
  }
  console.log(a);
}
test();
\`\`\``,
    options: ['1, 1', '2, 2', '1, 2', '2, 1'],
    correctAnswer: 1,
    explanation: 'Due to var hoisting and function scope (not block scope), both console.log statements refer to the same variable "a" which is set to 2.',
    points: 15,
    timeLimit: 5,
    tags: ['developer', 'debugging', 'javascript'],
    keywords: ['javascript', 'hoisting', 'scope', 'debugging']
  },

  // FINANCE QUESTIONS
  
  // Financial Ratios - Hard
  {
    id: 'fin_ratio_001',
    type: 'multiple_choice',
    category: 'domain_specific',
    domain: 'finance',
    subCategory: 'Financial Ratios',
    difficulty: 'hard',
    question: 'A company has Current Assets of $500,000, Inventory of $200,000, Prepaid Expenses of $50,000, and Current Liabilities of $300,000. What is the Quick Ratio?',
    options: ['0.83', '1.00', '1.17', '1.67'],
    correctAnswer: 0,
    explanation: 'Quick Ratio = (Current Assets - Inventory - Prepaid Expenses) / Current Liabilities = (500,000 - 200,000 - 50,000) / 300,000 = 0.83',
    points: 15,
    timeLimit: 5,
    tags: ['finance', 'ratios', 'liquidity'],
    keywords: ['quick ratio', 'liquidity', 'financial analysis']
  },

  // Valuation - Extreme
  {
    id: 'fin_val_001',
    type: 'multiple_choice',
    category: 'domain_specific',
    domain: 'finance',
    subCategory: 'Valuation',
    difficulty: 'extreme',
    question: 'A company expects FCF of $10M next year, growing at 25% for 3 years, then 5% forever. WACC is 12%. What is the enterprise value?',
    options: ['$180.2M', '$195.8M', '$210.4M', '$225.6M'],
    correctAnswer: 1,
    explanation: 'DCF calculation: PV of high-growth FCFs + PV of terminal value. FCF Years 1-3: $10M, $12.5M, $15.625M. Terminal value = 15.625×1.05/(0.12-0.05) = $234.375M. Total EV ≈ $195.8M',
    points: 30,
    timeLimit: 15,
    tags: ['finance', 'valuation', 'dcf'],
    keywords: ['DCF', 'valuation', 'terminal value', 'WACC']
  },

  // MARKETING QUESTIONS
  
  // Digital Marketing - Hard
  {
    id: 'mkt_dig_001',
    type: 'multiple_choice',
    category: 'domain_specific',
    domain: 'marketing',
    subCategory: 'Digital Marketing',
    difficulty: 'hard',
    question: 'Your Google Ads campaign has a CTR of 3.2%, CPC of $1.50, and conversion rate of 8%. If you want to achieve a target CPA of $15, what should be your maximum CPC bid?',
    options: ['$1.20', '$1.35', '$1.50', '$1.65'],
    correctAnswer: 0,
    explanation: 'CPA = CPC / Conversion Rate. Target CPA = $15, Conversion Rate = 8%. Max CPC = $15 × 0.08 = $1.20',
    points: 15,
    timeLimit: 8,
    tags: ['marketing', 'digital', 'google-ads'],
    keywords: ['CPC', 'CPA', 'conversion rate', 'google ads']
  },

  // SEO - Medium
  {
    id: 'mkt_seo_001',
    type: 'multiple_choice',
    category: 'domain_specific',
    domain: 'marketing',
    subCategory: 'SEO',
    difficulty: 'medium',
    question: 'Which of the following is most important for local SEO?',
    options: [
      'High domain authority',
      'Google My Business optimization',
      'International backlinks',
      'Mobile-first indexing'
    ],
    correctAnswer: 1,
    explanation: 'Google My Business optimization is crucial for local SEO as it directly impacts local search rankings and visibility.',
    points: 10,
    timeLimit: 3,
    tags: ['marketing', 'seo', 'local'],
    keywords: ['local SEO', 'google my business', 'local search']
  },

  // ACCOUNTING QUESTIONS
  
  // Balance Sheet - Hard
  {
    id: 'acc_bal_001',
    type: 'multiple_choice',
    category: 'domain_specific',
    domain: 'accounting',
    subCategory: 'Balance Sheet',
    difficulty: 'hard',
    question: 'A company purchased equipment for $100,000 with a 10-year life and $10,000 salvage value. Using straight-line depreciation, what is the book value after 3 years?',
    options: ['$70,000', '$73,000', '$77,000', '$80,000'],
    correctAnswer: 1,
    explanation: 'Annual depreciation = ($100,000 - $10,000) / 10 = $9,000. After 3 years: $100,000 - (3 × $9,000) = $73,000',
    points: 12,
    timeLimit: 5,
    tags: ['accounting', 'depreciation', 'balance-sheet'],
    keywords: ['depreciation', 'book value', 'straight-line']
  },

  // Auditing - Extreme
  {
    id: 'acc_aud_001',
    type: 'multiple_choice',
    category: 'domain_specific',
    domain: 'accounting',
    subCategory: 'Auditing',
    difficulty: 'extreme',
    question: 'An auditor discovers that a client has been capitalizing routine maintenance costs as fixed assets. This represents which type of misstatement?',
    options: [
      'Factual misstatement',
      'Judgmental misstatement',
      'Projected misstatement',
      'Tolerable misstatement'
    ],
    correctAnswer: 0,
    explanation: 'This is a factual misstatement because there is no doubt about the error - routine maintenance should be expensed, not capitalized.',
    points: 20,
    timeLimit: 6,
    tags: ['accounting', 'auditing', 'misstatement'],
    keywords: ['auditing', 'misstatement', 'capitalization']
  }
];

// Helper function to get questions by category and tags
export function getQuestionsByCategory(
  category: 'general_aptitude' | 'english' | 'domain_specific',
  tags: string[] = [],
  difficulty: ('easy' | 'medium' | 'hard' | 'extreme')[] = ['easy', 'medium', 'hard', 'extreme'],
  limit: number = 10
): QuestionBankItem[] {
  return questionBank
    .filter(q => q.category === category)
    .filter(q => tags.length === 0 || tags.some(tag => q.tags.includes(tag)))
    .filter(q => difficulty.includes(q.difficulty))
    .sort(() => Math.random() - 0.5) // Shuffle
    .slice(0, limit);
}

// Function to generate a balanced test based on job profile
export function generateTestQuestions(
  jobProfileTags: string[],
  totalQuestions: number = 30,
  includeExtreme: boolean = true
): QuestionBankItem[] {
  const questions: QuestionBankItem[] = [];
  
  // Calculate distribution
  const aptitudeCount = Math.floor(totalQuestions * 0.5); // 50%
  const englishCount = Math.floor(totalQuestions * 0.2); // 20%
  const domainCount = totalQuestions - aptitudeCount - englishCount; // 30%
  
  // Get aptitude questions (mix of difficulties)
  const aptitudeQuestions = getQuestionsByCategory(
    'general_aptitude',
    [],
    includeExtreme ? ['easy', 'medium', 'hard', 'extreme'] : ['easy', 'medium', 'hard'],
    aptitudeCount
  );
  
  // Get English questions
  const englishQuestions = getQuestionsByCategory(
    'english',
    [],
    includeExtreme ? ['easy', 'medium', 'hard', 'extreme'] : ['easy', 'medium', 'hard'],
    englishCount
  );
  
  // Get domain-specific questions based on job profile
  const domainQuestions = getQuestionsByCategory(
    'domain_specific',
    jobProfileTags,
    includeExtreme ? ['medium', 'hard', 'extreme'] : ['medium', 'hard'],
    domainCount
  );
  
  questions.push(...aptitudeQuestions, ...englishQuestions, ...domainQuestions);
  
  // Shuffle final questions
  return questions.sort(() => Math.random() - 0.5);
}

// Function to get all available tags
export function getAvailableTags(): string[] {
  const tags = new Set<string>();
  questionBank.forEach(q => q.tags.forEach(tag => tags.add(tag)));
  return Array.from(tags).sort();
}

// Function to get questions by specific domains
export function getQuestionsByDomain(domain: string, limit: number = 10): QuestionBankItem[] {
  return questionBank
    .filter(q => q.domain === domain || q.tags.includes(domain))
    .sort(() => Math.random() - 0.5)
    .slice(0, limit);
}