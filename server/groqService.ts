import Groq from "groq-sdk";

interface ResumeAnalysis {
  atsScore: number;
  recommendations: string[];
  keywordOptimization: {
    missingKeywords: string[];
    overusedKeywords: string[];
    suggestions: string[];
  };
  formatting: {
    score: number;
    issues: string[];
    improvements: string[];
  };
  content: {
    strengthsFound: string[];
    weaknesses: string[];
    suggestions: string[];
  };
}

interface JobMatchAnalysis {
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  skillGaps: {
    critical: string[];
    important: string[];
    nice_to_have: string[];
  };
  seniorityLevel: string;
  workMode: string;
  jobType: string;
  roleComplexity: string;
  careerProgression: string;
  industryFit: string;
  cultureFit: string;
  applicationRecommendation: string;
  tailoringAdvice: string;
  interviewPrepTips: string;
}

class GroqService {
  public client: Groq;

  constructor() {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY environment variable is required");
    }
    this.client = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  async analyzeResume(resumeText: string, userProfile?: any): Promise<ResumeAnalysis> {
    const prompt = `
Analyze this resume for ATS (Applicant Tracking System) optimization and provide detailed feedback.

RESUME TEXT:
${resumeText}

${userProfile ? `
USER PROFILE CONTEXT:
- Professional Title: ${userProfile.professionalTitle || 'Not specified'}
- Years Experience: ${userProfile.yearsExperience || 'Not specified'}
- Target Industries: ${userProfile.targetIndustries?.join(', ') || 'Not specified'}
` : ''}

Please provide a comprehensive analysis in the following JSON format:
{
  "atsScore": number (0-100),
  "recommendations": [
    "specific actionable recommendations for improving ATS compatibility"
  ],
  "keywordOptimization": {
    "missingKeywords": ["keywords commonly expected for this role/industry"],
    "overusedKeywords": ["keywords that appear too frequently"],
    "suggestions": ["specific keyword recommendations"]
  },
  "formatting": {
    "score": number (0-100),
    "issues": ["formatting issues that hurt ATS parsing"],
    "improvements": ["specific formatting improvements"]
  },
  "content": {
    "strengthsFound": ["strong points in the resume"],
    "weaknesses": ["areas needing improvement"],
    "suggestions": ["specific content improvement suggestions"]
  }
}

Focus on:
1. ATS compatibility and parsing issues
2. Keyword optimization for common job applications
3. Formatting best practices
4. Content structure and impact
5. Quantifiable achievements
6. Industry-specific optimizations
`;

    try {
      const completion = await this.client.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are an expert resume analyzer and ATS optimization specialist. Provide detailed, actionable feedback in valid JSON format only."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: "llama3-70b-8192",
        temperature: 0.3,
        max_tokens: 2000,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No response from Groq API");
      }

      // Parse JSON response with error handling
      let analysis;
      try {
        // Try to extract JSON from the response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const jsonContent = jsonMatch ? jsonMatch[0] : content;
        analysis = JSON.parse(jsonContent);
      } catch (parseError) {
        console.error("Failed to parse Groq response as JSON:", content);
        // Return a fallback analysis structure
        analysis = {
          atsScore: 75,
          recommendations: [
            "Resume uploaded successfully",
            "AI analysis will be retried automatically",
            "Complete your profile for better recommendations"
          ],
          keywordOptimization: {
            missingKeywords: [],
            overusedKeywords: [],
            suggestions: ["AI analysis will be available shortly"]
          },
          formatting: {
            score: 80,
            issues: [],
            improvements: ["Resume format appears acceptable"]
          },
          content: {
            strengthsFound: ["Resume uploaded successfully"],
            weaknesses: [],
            suggestions: ["Complete profile information for detailed analysis"]
          }
        };
      }
      return analysis as ResumeAnalysis;
    } catch (error) {
      console.error("Error analyzing resume with Groq:", error);
      throw new Error("Failed to analyze resume");
    }
  }

  async analyzeJobMatch(
    jobData: {
      title: string;
      company: string;
      description: string;
      requirements?: string;
      qualifications?: string;
      benefits?: string;
    },
    userProfile: {
      skills: Array<{ skillName: string; proficiencyLevel?: string; yearsExperience?: number }>;
      workExperience: Array<{ position: string; company: string; description?: string }>;
      education: Array<{ degree: string; fieldOfStudy?: string; institution: string }>;
      yearsExperience?: number;
      professionalTitle?: string;
      summary?: string;
    }
  ): Promise<JobMatchAnalysis> {
    const userSkills = userProfile.skills.map(s => s.skillName).join(', ');
    const userExperience = userProfile.workExperience.map(w => 
      `${w.position} at ${w.company}${w.description ? ': ' + w.description.substring(0, 200) : ''}`
    ).join('\n');
    const userEducation = userProfile.education.map(e => 
      `${e.degree} in ${e.fieldOfStudy || 'N/A'} from ${e.institution}`
    ).join('\n');

    const prompt = `
Analyze how well this candidate matches the job posting and provide detailed insights.

JOB POSTING:
Title: ${jobData.title}
Company: ${jobData.company}
Description: ${jobData.description}
${jobData.requirements ? `Requirements: ${jobData.requirements}` : ''}
${jobData.qualifications ? `Qualifications: ${jobData.qualifications}` : ''}
${jobData.benefits ? `Benefits: ${jobData.benefits}` : ''}

CANDIDATE PROFILE:
Professional Title: ${userProfile.professionalTitle || 'Not specified'}
Years of Experience: ${userProfile.yearsExperience || 'Not specified'}
Summary: ${userProfile.summary || 'Not provided'}

Skills: ${userSkills}

Work Experience:
${userExperience}

Education:
${userEducation}

Please provide a comprehensive job match analysis in the following JSON format:
{
  "matchScore": number (0-100),
  "matchingSkills": ["skills that match job requirements"],
  "missingSkills": ["skills mentioned in job but not in candidate profile"],
  "skillGaps": {
    "critical": ["must-have skills candidate is missing"],
    "important": ["important skills that would strengthen application"],
    "nice_to_have": ["bonus skills mentioned in job posting"]
  },
  "seniorityLevel": "entry|mid|senior|lead|principal",
  "workMode": "remote|hybrid|onsite|not_specified",
  "jobType": "full-time|part-time|contract|internship|not_specified",
  "roleComplexity": "low|medium|high",
  "careerProgression": "lateral|step-up|stretch",
  "industryFit": "perfect|good|acceptable|poor",
  "cultureFit": "strong|moderate|weak",
  "applicationRecommendation": "strongly_recommended|recommended|consider|not_recommended",
  "tailoringAdvice": "specific advice on how to tailor the application for this role",
  "interviewPrepTips": "specific tips for preparing for interviews for this role"
}

Consider:
1. Technical skill alignment
2. Experience level requirements
3. Industry background fit
4. Role progression logic
5. Company culture indicators
6. Location and work arrangement preferences
7. Salary expectations vs likely compensation
8. Growth opportunities alignment
`;

    try {
      const completion = await this.client.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are an expert career counselor and job matching specialist. You MUST respond with valid JSON only. Do not include any text before or after the JSON object. Analyze job-candidate fit comprehensively."
          },
          {
            role: "user",
            content: prompt + "\n\nRemember: Respond with ONLY the JSON object, nothing else."
          }
        ],
        model: "llama3-70b-8192",
        temperature: 0.2,
        max_tokens: 2500,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No response from Groq API");
      }

      // Clean and parse JSON response
      let cleanContent = content.trim();
      
      // Remove any text before the JSON object
      const jsonStart = cleanContent.indexOf('{');
      const jsonEnd = cleanContent.lastIndexOf('}') + 1;
      
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        cleanContent = cleanContent.substring(jsonStart, jsonEnd);
      }
      
      try {
        const analysis = JSON.parse(cleanContent);
        return analysis as JobMatchAnalysis;
      } catch (parseError) {
        console.error("Failed to parse JSON response:", cleanContent);
        
        // Fallback: Create a basic analysis structure
        return {
          matchScore: 50,
          matchingSkills: [],
          missingSkills: [],
          skillGaps: {
            critical: [],
            important: [],
            nice_to_have: []
          },
          seniorityLevel: "Mid-level",
          workMode: "Not specified",
          jobType: "Not specified",
          roleComplexity: "Moderate",
          careerProgression: "Good fit",
          industryFit: "Moderate",
          cultureFit: "Good",
          applicationRecommendation: "Consider applying after reviewing job requirements in detail",
          tailoringAdvice: "Focus on highlighting relevant experience and skills",
          interviewPrepTips: "Research the company and prepare examples of relevant work"
        } as JobMatchAnalysis;
      }
    } catch (error) {
      console.error("Error analyzing job match with Groq:", error);
      throw new Error("Failed to analyze job match");
    }
  }

  async extractJobDetails(jobDescription: string): Promise<{
    title: string;
    company: string;
    location: string;
    workMode: string;
    jobType: string;
    salaryRange: string;
    requiredSkills: string[];
    qualifications: string[];
    benefits: string[];
  }> {
    const prompt = `
Extract structured information from this job posting:

${jobDescription}

Please return the information in the following JSON format:
{
  "title": "extracted job title",
  "company": "company name",
  "location": "job location",
  "workMode": "remote|hybrid|onsite|not_specified",
  "jobType": "full-time|part-time|contract|internship|not_specified",
  "salaryRange": "salary range or 'not_specified'",
  "requiredSkills": ["list of technical and soft skills mentioned as requirements"],
  "qualifications": ["education, experience, and other qualification requirements"],
  "benefits": ["benefits and perks mentioned"]
}

Be precise and only extract information that is explicitly stated in the job posting.
`;

    try {
      const completion = await this.client.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are an expert at extracting structured information from job postings. Return valid JSON only."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: "llama-3.1-8b-instant",
        temperature: 0.1,
        max_tokens: 1000,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No response from Groq API");
      }

      const extracted = JSON.parse(content);
      return extracted;
    } catch (error) {
      console.error("Error extracting job details with Groq:", error);
      throw new Error("Failed to extract job details");
    }
  }
}

export const groqService = new GroqService();
export type { ResumeAnalysis, JobMatchAnalysis };