#!/usr/bin/env node
/**
 * Hobart User State Management
 * 
 * Manages user profiles, onboarding state, and preferences
 */

const fs = require('fs');
const path = require('path');

const MEMORY_DIR = path.join(__dirname, '..', 'memory', 'users');
const RESUME_DIR = path.join(__dirname, '..', 'memory', 'resumes');

// Ensure directories exist
[MEMORY_DIR, RESUME_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Default user preferences
const DEFAULT_USER = {
  name: null,
  phone: null,
  onboarded: false,
  onboardingStep: 0,
  onboardedAt: null,
  keywords: [],
  industries: [],
  salaryMin: null,
  salaryMax: null,
  location: null,
  remotePreference: 'any',
  experienceYears: null,
  resume: {
    lastUpdated: null,
    filePath: null,
    parsed: {
      skills: [],
      experience: [],
      education: []
    }
  },
  digest: {
    frequency: 'daily',
    time: '08:00',
    timezone: 'America/New_York',
    format: 'summary',
    maxListings: 5,
    includeCompanyProfiles: true,
    includeNewCompanies: true,
    paused: false
  },
  history: {
    searchesRun: 0,
    jobsViewed: [],
    jobsApplied: [],
    lastDigestSent: null
  }
};

/**
 * Get user profile by phone number
 */
function getUser(phone) {
  const sanitizedPhone = phone.replace(/\D/g, '');
  const filePath = path.join(MEMORY_DIR, `${sanitizedPhone}.json`);
  
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  }
  
  return { ...DEFAULT_USER, phone: sanitizedPhone };
}

/**
 * Save user profile
 */
function saveUser(user) {
  const sanitizedPhone = user.phone.replace(/\D/g, '');
  const filePath = path.join(MEMORY_DIR, `${sanitizedPhone}.json`);
  fs.writeFileSync(filePath, JSON.stringify(user, null, 2));
  return user;
}

/**
 * Update user preferences
 */
function updateUser(phone, updates) {
  const user = getUser(phone);
  const updated = deepMerge(user, updates);
  return saveUser(updated);
}

/**
 * Get onboarding step prompt
 */
function getOnboardingPrompt(step) {
  const prompts = {
    0: `Hey! 👋 I'm Hobart, your personal job search assistant.

I'll help you find great opportunities by sending you curated job listings every day based on exactly what you're looking for.

Let's get you set up! This will take about 2 minutes.

First up: What's your name?`,
    
    1: `Nice to meet you, {name}! 

What kind of roles are you looking for?
(e.g., "Product Manager", "Software Engineer", "Data Scientist")`,
    
    2: `Got it! Are there specific industries you're interested in?
(e.g., "biotech", "fintech", "healthcare", or "open to any")`,
    
    3: `What's your target salary range?
(e.g., "$120k-$150k" or "open to discuss")`,
    
    4: `Where are you looking to work?
(e.g., "New York, NY", "San Francisco Bay Area", "anywhere in US")`,
    
    5: `Work style preference?

1️⃣ Remote only
2️⃣ Hybrid  
3️⃣ On-site
4️⃣ Open to any

Just reply with the number!`,
    
    6: `Almost done! Please upload your resume (PDF or Word doc) and I'll analyze it to better match you with opportunities.

You can always send me an updated resume anytime.

Or reply "skip" if you'd like to add it later.`,
    
    7: 'COMPLETE'
  };
  
  return prompts[step] || prompts[0];
}

/**
 * Parse user input for onboarding step
 */
function parseOnboardingInput(step, input, user) {
  const updates = {};
  
  switch (step) {
    case 0: // Name
      updates.name = input.trim();
      break;
      
    case 1: // Keywords/roles
      updates.keywords = input.split(/[,;]/).map(k => k.trim().toLowerCase()).filter(Boolean);
      break;
      
    case 2: // Industries
      if (input.toLowerCase().includes('any') || input.toLowerCase().includes('open')) {
        updates.industries = ['any'];
      } else {
        updates.industries = input.split(/[,;]/).map(k => k.trim().toLowerCase()).filter(Boolean);
      }
      break;
      
    case 3: // Salary
      const salaryMatch = input.match(/(\d+)[k]?\s*[-–to]+\s*(\d+)[k]?/i);
      if (salaryMatch) {
        let min = parseInt(salaryMatch[1]);
        let max = parseInt(salaryMatch[2]);
        // Normalize to actual dollars if written as "120k"
        if (min < 1000) min *= 1000;
        if (max < 1000) max *= 1000;
        updates.salaryMin = min;
        updates.salaryMax = max;
      } else if (input.toLowerCase().includes('open') || input.toLowerCase().includes('discuss')) {
        updates.salaryMin = null;
        updates.salaryMax = null;
      }
      break;
      
    case 4: // Location
      updates.location = input.trim();
      break;
      
    case 5: // Remote preference
      const prefMap = {
        '1': 'remote',
        'remote': 'remote',
        '2': 'hybrid',
        'hybrid': 'hybrid',
        '3': 'onsite',
        'on-site': 'onsite',
        'onsite': 'onsite',
        '4': 'any',
        'any': 'any',
        'open': 'any'
      };
      updates.remotePreference = prefMap[input.toLowerCase().trim()] || 'any';
      break;
      
    case 6: // Resume (handled separately via file upload)
      if (input.toLowerCase() === 'skip') {
        // No resume for now
      }
      break;
  }
  
  return updates;
}

/**
 * Generate confirmation message after onboarding
 */
function getConfirmationMessage(user) {
  const salaryStr = user.salaryMin && user.salaryMax 
    ? `$${(user.salaryMin/1000).toFixed(0)}k - $${(user.salaryMax/1000).toFixed(0)}k`
    : 'Open to discuss';
  
  const remoteMap = {
    'remote': 'Remote only',
    'hybrid': 'Hybrid',
    'onsite': 'On-site',
    'any': 'Open to any'
  };
  
  const resumeStatus = user.resume?.filePath ? '✅ Uploaded' : '⏳ Not yet uploaded';
  
  return `Perfect! Here's what I've got:

📋 **Your Profile**
• Name: ${user.name}
• Roles: ${user.keywords.join(', ')}
• Industries: ${user.industries.join(', ')}
• Salary: ${salaryStr}
• Location: ${user.location}
• Work Style: ${remoteMap[user.remotePreference] || 'Any'}
• Resume: ${resumeStatus}

📬 **What to Expect**
Every morning at 8am, I'll send you:
• Up to ${user.digest.maxListings} job listings matching your criteria
• Quick company spotlights for new matches
• Tips to boost your applications

You can adjust anytime by saying:
• "Show me more listings" (increase to 10)
• "Give me detailed descriptions"  
• "Change my salary range to X"
• "Pause my digest"

Ready to start? Your first digest arrives tomorrow! 🚀`;
}

/**
 * Deep merge objects
 */
function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object && key in target) {
      result[key] = deepMerge(target[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

/**
 * List all users
 */
function listUsers() {
  if (!fs.existsSync(MEMORY_DIR)) return [];
  return fs.readdirSync(MEMORY_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      const data = fs.readFileSync(path.join(MEMORY_DIR, f), 'utf8');
      return JSON.parse(data);
    });
}

/**
 * Record a job as shown to user (for deduplication)
 */
function recordShownJob(phone, jobId) {
  const user = getUser(phone);
  if (!user.history) user.history = {};
  if (!user.history.shownJobs) user.history.shownJobs = [];
  
  if (!user.history.shownJobs.includes(jobId)) {
    user.history.shownJobs.push(jobId);
    // Keep only last 200 shown jobs to prevent unbounded growth
    if (user.history.shownJobs.length > 200) {
      user.history.shownJobs = user.history.shownJobs.slice(-200);
    }
    saveUser(user);
  }
}

/**
 * Record that user expressed interest in a job
 */
function recordJobInterest(phone, jobId, jobData) {
  const user = getUser(phone);
  if (!user.history) user.history = {};
  if (!user.history.interestedJobs) user.history.interestedJobs = [];
  
  user.history.interestedJobs.push({
    jobId,
    ...jobData,
    interestedAt: new Date().toISOString(),
  });
  saveUser(user);
}

/**
 * Get user's job search stats
 */
function getStats(phone) {
  const user = getUser(phone);
  const history = user.history || {};
  
  return {
    jobsDiscovered: history.shownJobs?.length || 0,
    jobsInterested: history.interestedJobs?.length || 0,
    jobsApplied: history.jobsApplied?.length || 0,
    searchesRun: history.searchesRun || 0,
    lastDigest: history.lastDigestSent,
    memberSince: user.onboardedAt,
  };
}

module.exports = {
  getUser,
  saveUser,
  updateUser,
  getOnboardingPrompt,
  parseOnboardingInput,
  getConfirmationMessage,
  listUsers,
  recordShownJob,
  recordJobInterest,
  getStats,
  DEFAULT_USER,
  MEMORY_DIR,
  RESUME_DIR
};

// CLI usage
if (require.main === module) {
  const [,, command, ...args] = process.argv;
  
  switch (command) {
    case 'get':
      console.log(JSON.stringify(getUser(args[0]), null, 2));
      break;
    case 'list':
      console.log(JSON.stringify(listUsers(), null, 2));
      break;
    case 'prompt':
      console.log(getOnboardingPrompt(parseInt(args[0]) || 0));
      break;
    default:
      console.log('Usage: user-state.js <get|list|prompt> [args]');
  }
}
