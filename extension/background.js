// Background script for AutoJobr Chrome Extension
// Handles extension lifecycle, storage, and communication between components

// Extension installation and update handling
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    console.log('AutoJobr extension installed');
    
    // Try to auto-detect the correct API URL
    let apiUrl = 'http://localhost:5000'; // Default fallback
    
    // Check for common AutoJobr deployment patterns
    const possibleUrls = [
      'https://60e68a76-86c4-4eef-b2f5-8a97de774d09-00-f9a0u7nh8k0p.kirk.replit.dev',
      'https://autojobr.replit.app',
      'http://localhost:5000'
    ];
    
    for (const url of possibleUrls) {
      if (url) {
        try {
          const response = await fetch(`${url}/api/auth/user`, { 
            method: 'HEAD',
            mode: 'no-cors'
          });
          apiUrl = url;
          break;
        } catch (e) {
          continue;
        }
      }
    }
    
    chrome.storage.sync.set({
      autofillEnabled: true,
      apiUrl: apiUrl,
      lastAnalysis: null,
      userProfile: null
    });
    
    console.log('AutoJobr configured with API URL:', apiUrl);
  }
});

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyzeJob') {
    handleJobAnalysis(request.data, sendResponse);
    return true; // Keep message channel open for async response
  }
  
  if (request.action === 'trackApplication') {
    handleApplicationTracking(request.data, sendResponse);
    return true;
  }
  
  if (request.action === 'getApplicationStats') {
    getApplicationStats(sendResponse);
    return true;
  }
  
  if (request.action === 'getUserProfile') {
    getUserProfile(sendResponse);
    return true;
  }
  
  if (request.action === 'getSettings') {
    getSettings(sendResponse);
    return true;
  }
  
  if (request.action === 'updateSettings') {
    updateSettings(request.data, sendResponse);
    return true;
  }
  
  if (request.action === 'generateCoverLetter') {
    generateCoverLetter(request.data, sendResponse);
    return true;
  }
  
  if (request.action === 'autoFillTracking') {
    handleAutoFillTracking(request.data, sendResponse);
    return true;
  }
});

// Get user profile from web app API
async function getUserProfile(sendResponse) {
  try {
    const { apiUrl } = await chrome.storage.sync.get(['apiUrl']);
    const finalApiUrl = apiUrl || 'http://localhost:5000';
    
    // Try extension-specific endpoint first
    const extensionResponse = await fetch(`${finalApiUrl}/api/extension/profile`, {
      method: 'GET',
      credentials: 'include',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (extensionResponse.ok) {
      const profileData = await extensionResponse.json();
      sendResponse({ success: true, data: profileData });
      return;
    }
    
    // Fallback: Check authentication
    const authResponse = await fetch(`${finalApiUrl}/api/auth/user`, {
      method: 'GET',
      credentials: 'include',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!authResponse.ok) {
      sendResponse({ success: false, error: 'Please log in to AutoJobr web app first' });
      return;
    }
    
    const user = await authResponse.json();
    
    // Get profile data
    let profile = null;
    let skills = [];
    
    try {
      const profileResponse = await fetch(`${apiUrl}/api/profile`, {
        method: 'GET',
        credentials: 'include',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (profileResponse.ok) {
        profile = await profileResponse.json();
      }
    } catch (e) {
      console.log('Profile not found, using basic user data');
    }
    
    try {
      const skillsResponse = await fetch(`${apiUrl}/api/skills`, {
        method: 'GET',
        credentials: 'include',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (skillsResponse.ok) {
        skills = await skillsResponse.json();
      }
    } catch (e) {
      console.log('Skills not found');
    }
    
    const userProfile = {
      user,
      profile,
      skills
    };
    
    // Cache profile data
    await chrome.storage.sync.set({ userProfile });
    
    sendResponse({ success: true, data: userProfile });
    
  } catch (error) {
    console.error('Error fetching user profile:', error);
    sendResponse({ success: false, error: 'Connection failed. Please ensure you are logged in to AutoJobr.' });
  }
}

// Handle enhanced AI job analysis with Groq
async function handleJobAnalysis(jobData, sendResponse) {
  try {
    const config = new ExtensionConfig();
    const apiUrl = await config.getApiUrl();
    
    if (!apiUrl) {
      sendResponse({ success: false, error: 'API URL not configured' });
      return;
    }

    // Check usage limits first for premium subscription model
    const usageCheck = await fetch(`${apiUrl}/api/subscription/status`, {
      method: 'GET',
      credentials: 'include'
    });
    
    if (usageCheck.ok) {
      const usageData = await usageCheck.json();
      const remainingAnalyses = usageData.limits ? 
        usageData.limits.jobAnalyses - usageData.usage.jobAnalyses : -1;
      
      if (usageData.limits && remainingAnalyses <= 0) {
        sendResponse({ 
          success: false, 
          error: 'Daily job analysis limit reached. Upgrade to premium for unlimited analyses.',
          upgradeRequired: true,
          remainingUsage: 0
        });
        return;
      }
    }

    // Send job data to backend for AI analysis
    const response = await fetch(`${apiUrl}/api/jobs/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        jobUrl: jobData.url || window.location.href,
        jobTitle: jobData.title,
        company: jobData.company,
        jobDescription: jobData.description,
        requirements: jobData.requirements,
        qualifications: jobData.qualifications,
        benefits: jobData.benefits
      })
    });

    if (!response.ok) {
      if (response.status === 429) {
        sendResponse({ 
          success: false, 
          error: 'Daily job analysis limit reached. Upgrade to premium for unlimited analyses.',
          upgradeRequired: true 
        });
        return;
      }
      throw new Error(`API request failed: ${response.status}`);
    }

    const analysisResult = await response.json();
    
    // Store enhanced analysis results
    await chrome.storage.sync.set({ 
      lastAnalysis: analysisResult,
      lastAnalysisTimestamp: Date.now()
    });
    
    sendResponse({ success: true, data: analysisResult });
  } catch (error) {
    console.error('Error analyzing job with AI:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Analyze job match against user profile
function analyzeJobMatch(jobData, userProfile) {
  const userSkills = userProfile.skills.map(skill => skill.skillName.toLowerCase());
  const jobSkills = jobData.requiredSkills || [];
  const jobText = (jobData.description || '').toLowerCase();
  
  // Calculate skill matches
  const matchingSkills = [];
  const missingSkills = [];
  
  jobSkills.forEach(skill => {
    const skillLower = skill.toLowerCase();
    if (userSkills.some(userSkill => userSkill.includes(skillLower) || skillLower.includes(userSkill))) {
      matchingSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });
  
  // Calculate match score
  const totalRequiredSkills = jobSkills.length;
  const matchScore = totalRequiredSkills > 0 
    ? Math.round((matchingSkills.length / totalRequiredSkills) * 100)
    : 0;
  
  // Detect seniority level
  const seniorityKeywords = {
    entry: ['entry', 'junior', 'associate', 'intern', 'graduate', 'trainee'],
    mid: ['mid', 'intermediate', 'experienced', '3-5 years', '2-4 years'],
    senior: ['senior', 'lead', 'principal', 'architect', '5+ years', 'expert']
  };
  
  let detectedSeniority = 'Not specified';
  for (const [level, keywords] of Object.entries(seniorityKeywords)) {
    if (keywords.some(keyword => jobText.includes(keyword))) {
      detectedSeniority = level.charAt(0).toUpperCase() + level.slice(1);
      break;
    }
  }
  
  // Detect work mode
  const remoteKeywords = ['remote', 'work from home', 'distributed', 'virtual'];
  const hybridKeywords = ['hybrid', 'flexible', 'mixed'];
  const onsiteKeywords = ['on-site', 'office', 'in-person', 'local'];
  
  let workMode = 'Not specified';
  if (remoteKeywords.some(keyword => jobText.includes(keyword))) {
    workMode = 'Remote';
  } else if (hybridKeywords.some(keyword => jobText.includes(keyword))) {
    workMode = 'Hybrid';
  } else if (onsiteKeywords.some(keyword => jobText.includes(keyword))) {
    workMode = 'On-site';
  }
  
  return {
    matchScore,
    matchingSkills,
    missingSkills,
    detectedSeniority,
    workMode,
    jobTitle: jobData.title,
    company: jobData.company,
    analyzedAt: new Date().toISOString()
  };
}

// Track job application
async function handleApplicationTracking(applicationData, sendResponse) {
  try {
    const { apiUrl } = await chrome.storage.sync.get(['apiUrl']);
    
    const finalApiUrl = apiUrl || 'http://localhost:5000';
    
    const response = await fetch(`${finalApiUrl}/api/extension/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        jobTitle: applicationData.jobTitle,
        company: applicationData.company,
        jobUrl: applicationData.jobUrl || window.location.href,
        location: applicationData.location,
        jobType: applicationData.jobType,
        workMode: applicationData.workMode,
        salaryRange: applicationData.salaryRange,
        status: applicationData.status || 'applied',
        notes: applicationData.notes || '',
        matchScore: applicationData.matchScore || 0,
        source: 'extension'
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      sendResponse({ success: true, data: result });
    } else {
      const errorData = await response.json();
      sendResponse({ success: false, error: errorData.message || 'Failed to track application' });
    }
  } catch (error) {
    console.error('Error tracking application:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Get extension settings
async function getSettings(sendResponse) {
  try {
    const settings = await chrome.storage.sync.get([
      'autofillEnabled',
      'apiUrl',
      'lastAnalysis'
    ]);
    sendResponse({ success: true, data: settings });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

// Update extension settings
async function updateSettings(settings, sendResponse) {
  try {
    await chrome.storage.sync.set(settings);
    sendResponse({ success: true });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

// Get application statistics
async function getApplicationStats(sendResponse) {
  try {
    const { apiUrl } = await chrome.storage.sync.get(['apiUrl']);
    const finalApiUrl = apiUrl || 'http://localhost:5000';
    
    const response = await fetch(`${finalApiUrl}/api/applications/stats`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (response.ok) {
      const stats = await response.json();
      sendResponse({ success: true, data: stats });
    } else {
      sendResponse({ success: false, error: 'Failed to get application stats' });
    }
  } catch (error) {
    console.error('Error getting application stats:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Generate cover letter using the website's API
async function generateCoverLetter(data, sendResponse) {
  try {
    const { apiUrl } = await chrome.storage.sync.get(['apiUrl']);
    const finalApiUrl = apiUrl || 'http://localhost:5000';
    
    const response = await fetch(`${finalApiUrl}/api/cover-letter/generate`, {
      method: 'POST',
      credentials: 'include',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        companyName: data.companyName,
        jobTitle: data.jobTitle,
        jobDescription: data.jobDescription || ''
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      sendResponse({ 
        success: true, 
        coverLetter: result.coverLetter 
      });
    } else {
      const errorData = await response.json();
      sendResponse({ 
        success: false, 
        error: errorData.message || 'Failed to generate cover letter' 
      });
    }
  } catch (error) {
    console.error('Error generating cover letter:', error);
    sendResponse({ 
      success: false, 
      error: 'Connection failed. Please ensure you are logged in to AutoJobr.' 
    });
  }
}

// Handle auto-fill usage tracking for premium subscription model
async function handleAutoFillTracking(fillData, sendResponse) {
  try {
    const config = new ExtensionConfig();
    const apiUrl = await config.getApiUrl();
    
    if (!apiUrl) {
      sendResponse({ success: false, error: 'API URL not configured' });
      return;
    }

    // Check usage limits first
    const usageCheck = await fetch(`${apiUrl}/api/subscription/status`, {
      method: 'GET',
      credentials: 'include'
    });
    
    if (usageCheck.ok) {
      const usageData = await usageCheck.json();
      const remainingAutoFills = usageData.limits ? 
        usageData.limits.autoFills - usageData.usage.autoFills : -1;
      
      if (usageData.limits && remainingAutoFills <= 0) {
        sendResponse({ 
          success: false, 
          error: 'Daily auto-fill limit reached. Upgrade to premium for unlimited auto-fills.',
          upgradeRequired: true,
          remainingUsage: 0
        });
        return;
      }
    }

    // Track the auto-fill usage
    const response = await fetch(`${apiUrl}/api/usage/autofill`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        site: fillData.site,
        fieldsCount: fillData.fieldsCount,
        timestamp: new Date().toISOString()
      })
    });

    if (response.ok) {
      sendResponse({ success: true, data: { tracked: true } });
    } else {
      sendResponse({ success: false, error: 'Failed to track auto-fill usage' });
    }
  } catch (error) {
    console.error('Error tracking auto-fill usage:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Handle tab updates to refresh analysis
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Check if it's a job site
    const jobSites = ['workday.com', 'greenhouse.io', 'lever.co', 'icims.com', 'linkedin.com'];
    const isJobSite = jobSites.some(site => tab.url.includes(site));
    
    if (isJobSite) {
      // Clear previous analysis when navigating to new job pages
      chrome.storage.sync.set({ lastAnalysis: null });
    }
  }
});