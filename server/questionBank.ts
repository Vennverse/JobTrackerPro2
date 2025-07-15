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
  },

  // CODING QUESTIONS - TECHNICAL DOMAIN
  
  // Basic Algorithm - Easy
  {
    id: 'code_basic_001',
    type: 'coding',
    category: 'domain_specific',
    domain: 'technical',
    subCategory: 'algorithms',
    difficulty: 'easy',
    question: 'Write a function that returns the sum of two numbers.',
    correctAnswer: JSON.stringify({
      javascript: 'function add(a, b) { return a + b; }',
      python: 'def add(a, b):\n    return a + b'
    }),
    explanation: 'Simple addition function that takes two parameters and returns their sum.',
    points: 5,
    timeLimit: 10,
    tags: ['javascript', 'python', 'basic', 'math'],
    keywords: ['function', 'sum', 'addition', 'parameters'],
    testCases: JSON.stringify([
      { input: [2, 3], expected: 5, description: 'Adding positive numbers' },
      { input: [-1, 1], expected: 0, description: 'Adding negative and positive' },
      { input: [0, 0], expected: 0, description: 'Adding zeros' }
    ]),
    boilerplate: JSON.stringify({
      javascript: 'function add(a, b) {\n    // Your code here\n}',
      python: 'def add(a, b):\n    # Your code here\n    pass'
    }),
    language: 'javascript,python'
  },

  // String Manipulation - Medium
  {
    id: 'code_string_001',
    type: 'coding',
    category: 'domain_specific',
    domain: 'technical',
    subCategory: 'algorithms',
    difficulty: 'medium',
    question: 'Write a function that reverses a string without using built-in reverse methods.',
    correctAnswer: JSON.stringify({
      javascript: 'function reverseString(str) {\n    let result = "";\n    for (let i = str.length - 1; i >= 0; i--) {\n        result += str[i];\n    }\n    return result;\n}',
      python: 'def reverse_string(s):\n    result = ""\n    for i in range(len(s) - 1, -1, -1):\n        result += s[i]\n    return result'
    }),
    explanation: 'Manual string reversal using loop iteration from end to beginning.',
    points: 10,
    timeLimit: 15,
    tags: ['javascript', 'python', 'strings', 'loops'],
    keywords: ['reverse', 'string', 'iteration', 'loop'],
    testCases: JSON.stringify([
      { input: ['hello'], expected: 'olleh', description: 'Reverse simple string' },
      { input: [''], expected: '', description: 'Reverse empty string' },
      { input: ['a'], expected: 'a', description: 'Reverse single character' }
    ]),
    boilerplate: JSON.stringify({
      javascript: 'function reverseString(str) {\n    // Your code here\n}',
      python: 'def reverse_string(s):\n    # Your code here\n    pass'
    }),
    language: 'javascript,python'
  },

  // Array Operations - Medium
  {
    id: 'code_array_001',
    type: 'coding',
    category: 'domain_specific',
    domain: 'technical',
    subCategory: 'algorithms',
    difficulty: 'medium',
    question: 'Write a function that finds the largest number in an array.',
    correctAnswer: JSON.stringify({
      javascript: 'function findMax(arr) {\n    if (arr.length === 0) return undefined;\n    let max = arr[0];\n    for (let i = 1; i < arr.length; i++) {\n        if (arr[i] > max) {\n            max = arr[i];\n        }\n    }\n    return max;\n}',
      python: 'def find_max(arr):\n    if not arr:\n        return None\n    max_val = arr[0]\n    for num in arr[1:]:\n        if num > max_val:\n            max_val = num\n    return max_val'
    }),
    explanation: 'Find maximum value in array by iterating through all elements.',
    points: 10,
    timeLimit: 15,
    tags: ['javascript', 'python', 'arrays', 'comparison'],
    keywords: ['maximum', 'array', 'loop', 'comparison'],
    testCases: JSON.stringify([
      { input: [[1, 5, 3, 9, 2]], expected: 9, description: 'Find max in positive numbers' },
      { input: [[-1, -5, -3]], expected: -1, description: 'Find max in negative numbers' },
      { input: [[42]], expected: 42, description: 'Single element array' }
    ]),
    boilerplate: JSON.stringify({
      javascript: 'function findMax(arr) {\n    // Your code here\n}',
      python: 'def find_max(arr):\n    # Your code here\n    pass'
    }),
    language: 'javascript,python'
  },

  // Palindrome Check - Hard
  {
    id: 'code_palindrome_001',
    type: 'coding',
    category: 'domain_specific',
    domain: 'technical',
    subCategory: 'algorithms',
    difficulty: 'hard',
    question: 'Write a function that checks if a string is a palindrome (reads the same forwards and backwards).',
    correctAnswer: JSON.stringify({
      javascript: 'function isPalindrome(str) {\n    const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, "");\n    let left = 0;\n    let right = cleaned.length - 1;\n    while (left < right) {\n        if (cleaned[left] !== cleaned[right]) {\n            return false;\n        }\n        left++;\n        right--;\n    }\n    return true;\n}',
      python: 'def is_palindrome(s):\n    cleaned = "".join(c.lower() for c in s if c.isalnum())\n    left, right = 0, len(cleaned) - 1\n    while left < right:\n        if cleaned[left] != cleaned[right]:\n            return False\n        left += 1\n        right -= 1\n    return True'
    }),
    explanation: 'Check if string is palindrome by comparing characters from both ends, ignoring case and non-alphanumeric characters.',
    points: 15,
    timeLimit: 25,
    tags: ['javascript', 'python', 'strings', 'algorithms'],
    keywords: ['palindrome', 'string', 'comparison', 'two-pointer'],
    testCases: JSON.stringify([
      { input: ['racecar'], expected: true, description: 'Simple palindrome' },
      { input: ['A man, a plan, a canal: Panama'], expected: true, description: 'Palindrome with spaces and punctuation' },
      { input: ['race a car'], expected: false, description: 'Not a palindrome' }
    ]),
    boilerplate: JSON.stringify({
      javascript: 'function isPalindrome(str) {\n    // Your code here\n}',
      python: 'def is_palindrome(s):\n    # Your code here\n    pass'
    }),
    language: 'javascript,python'
  },

  // Fibonacci Sequence - Hard
  {
    id: 'code_fibonacci_001',
    type: 'coding',
    category: 'domain_specific',
    domain: 'technical',
    subCategory: 'algorithms',
    difficulty: 'hard',
    question: 'Write a function that implements the Fibonacci sequence (returns the nth Fibonacci number).',
    correctAnswer: JSON.stringify({
      javascript: 'function fibonacci(n) {\n    if (n <= 1) return n;\n    let a = 0, b = 1;\n    for (let i = 2; i <= n; i++) {\n        let temp = a + b;\n        a = b;\n        b = temp;\n    }\n    return b;\n}',
      python: 'def fibonacci(n):\n    if n <= 1:\n        return n\n    a, b = 0, 1\n    for _ in range(2, n + 1):\n        a, b = b, a + b\n    return b'
    }),
    explanation: 'Calculate nth Fibonacci number using iterative approach for efficiency.',
    points: 20,
    timeLimit: 30,
    tags: ['javascript', 'python', 'fibonacci', 'math'],
    keywords: ['fibonacci', 'sequence', 'iteration', 'math'],
    testCases: JSON.stringify([
      { input: [0], expected: 0, description: 'Fibonacci of 0' },
      { input: [1], expected: 1, description: 'Fibonacci of 1' },
      { input: [6], expected: 8, description: 'Fibonacci of 6' }
    ]),
    boilerplate: JSON.stringify({
      javascript: 'function fibonacci(n) {\n    // Your code here\n}',
      python: 'def fibonacci(n):\n    # Your code here\n    pass'
    }),
    language: 'javascript,python'
  },

  // Two Sum Problem - Extreme
  {
    id: 'code_twosum_001',
    type: 'coding',
    category: 'domain_specific',
    domain: 'technical',
    subCategory: 'data-structures',
    difficulty: 'extreme',
    question: 'Write a function that finds the two numbers in an array that add up to a target sum.',
    correctAnswer: JSON.stringify({
      javascript: 'function twoSum(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const complement = target - nums[i];\n        if (map.has(complement)) {\n            return [map.get(complement), i];\n        }\n        map.set(nums[i], i);\n    }\n    return [];\n}',
      python: 'def two_sum(nums, target):\n    num_map = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in num_map:\n            return [num_map[complement], i]\n        num_map[num] = i\n    return []'
    }),
    explanation: 'Find two numbers that sum to target using hash map for O(n) time complexity.',
    points: 25,
    timeLimit: 35,
    tags: ['javascript', 'python', 'hash-map', 'algorithms'],
    keywords: ['two-sum', 'hash-map', 'target', 'complement'],
    testCases: JSON.stringify([
      { input: [[2, 7, 11, 15], 9], expected: [0, 1], description: 'Two sum found at beginning' },
      { input: [[3, 2, 4], 6], expected: [1, 2], description: 'Two sum found at middle/end' },
      { input: [[3, 3], 6], expected: [0, 1], description: 'Two sum with duplicates' }
    ]),
    boilerplate: JSON.stringify({
      javascript: 'function twoSum(nums, target) {\n    // Your code here\n}',
      python: 'def two_sum(nums, target):\n    # Your code here\n    pass'
    }),
    language: 'javascript,python'
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
    .filter(q => {
      if (tags.length === 0) return true;
      const questionTags = Array.isArray(q.tags) ? q.tags : (q.tags ? [q.tags] : []);
      return Array.isArray(tags) && tags.some(tag => questionTags.includes(tag));
    })
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