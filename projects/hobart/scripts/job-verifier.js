#!/usr/bin/env node
/**
 * Hobart Job Verification Engine 🦞
 * 
 * The hard work that makes Hobart valuable:
 * - Search for jobs
 * - Visit each link
 * - Verify it's real and open
 * - Extract actual job details
 * - Match against user criteria
 * - Return only verified, quality matches
 */

const fs = require('fs');
const path = require('path');

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
  // Max raw results to process per search
  maxRawResults: 30,
  
  // Max verified jobs to return
  maxVerifiedJobs: 5,
  
  // Min relevance score to include
  minRelevanceScore: 40,
  
  // Stale job threshold (days)
  staleThresholdDays: 30,
  
  // Request delays (ms) - be nice to servers
  fetchDelayMs: 1000,
};

// ============================================
// RED FLAGS - Immediate disqualification
// ============================================

const RED_FLAGS = {
  // Job posting red flags
  jobPosting: [
    'position filled',
    'position has been filled',
    'no longer accepting',
    'this job has expired',
    'job is no longer available',
    'posting has been removed',
    'we are no longer hiring',
    'this position is closed',
  ],
  
  // Company red flags (in recent news/reviews)
  company: [
    'layoffs',
    'laid off',
    'downsizing',
    'bankruptcy',
    'fraud investigation',
    'toxic culture',
    'mass exodus',
  ],
  
  // Spam/scam indicators
  spam: [
    'work from home $5000/week',
    'no experience needed make $',
    'be your own boss',
    'unlimited earning potential',
    'mlm',
    'network marketing',
    'commission only',
  ],
};

// ============================================
// TITLE MISMATCHES - "PM" doesn't always mean Product Manager
// ============================================

const TITLE_CLARIFICATIONS = {
  'pm': {
    wanted: ['product manager', 'program manager', 'project manager'],
    notWanted: ['property manager', 'property management', 'pm shift', 'evening shift'],
  },
  'product manager': {
    wanted: ['product manager', 'product lead', 'product owner'],
    notWanted: ['production manager', 'produce manager'],
  },
  'engineer': {
    wanted: ['software engineer', 'engineer'],
    notWanted: ['train engineer', 'building engineer', 'maintenance engineer', 'custodial'],
  },
};

// ============================================
// JOB SCHEMA - What we extract from each posting
// ============================================

/**
 * @typedef {Object} VerifiedJob
 * @property {string} id - Unique job ID (hash of URL)
 * @property {string} title - Job title
 * @property {string} company - Company name
 * @property {string} location - Location (city, state)
 * @property {string} remotePolicy - 'remote' | 'hybrid' | 'onsite' | 'unknown'
 * @property {Object} salary - { min: number, max: number, raw: string }
 * @property {string} url - Direct link to job posting
 * @property {string} source - 'linkedin' | 'indeed' | 'glassdoor' | etc.
 * @property {string} postedDate - When job was posted (if available)
 * @property {string[]} requirements - Key requirements extracted
 * @property {string[]} keywords - Matched user keywords
 * @property {number} relevanceScore - 0-100 fit score
 * @property {string[]} redFlags - Any concerns found
 * @property {Object} companyInfo - Brief company intel
 * @property {Date} verifiedAt - When we verified this job
 */

// ============================================
// SEARCH QUERY BUILDER
// ============================================

/**
 * Build optimized search queries for a user
 * Returns multiple queries to maximize coverage
 * 
 * KEY INSIGHT: Use /view paths to get INDIVIDUAL jobs, not search pages
 * - linkedin.com/jobs/view/... = individual job
 * - linkedin.com/jobs/... = search results (bad!)
 * - indeed.com/viewjob?jk=... = individual job
 */
function buildSearchQueries(user) {
  const queries = [];
  
  // Primary query: keywords + location
  const primaryKeywords = user.keywords.slice(0, 3).map(k => `"${k}"`).join(' OR ');
  const location = user.location !== 'remote' && user.location !== 'anywhere' 
    ? `"${user.location}"` 
    : '';
  const remote = user.remotePreference === 'remote' ? 'remote' : '';
  
  // LinkedIn-specific query - USE /jobs/view/ for individual postings!
  queries.push({
    query: `${primaryKeywords} hiring ${location} ${remote} site:linkedin.com/jobs/view`,
    source: 'linkedin',
    priority: 1,
  });
  
  // Indeed query - viewjob path for individual jobs
  queries.push({
    query: `${primaryKeywords} ${location} ${remote} site:indeed.com/viewjob`,
    source: 'indeed',
    priority: 2,
  });
  
  // Glassdoor query
  queries.push({
    query: `${primaryKeywords} ${location} ${remote} site:glassdoor.com/job-listing`,
    source: 'glassdoor',
    priority: 3,
  });
  
  // Lever (many startups use this)
  queries.push({
    query: `${primaryKeywords} ${location} site:jobs.lever.co`,
    source: 'lever',
    priority: 4,
  });
  
  // Greenhouse (enterprise companies)
  queries.push({
    query: `${primaryKeywords} ${location} site:boards.greenhouse.io`,
    source: 'greenhouse',
    priority: 5,
  });
  
  // Direct company career pages (if user has dream companies)
  if (user.dreamCompanies && user.dreamCompanies.length > 0) {
    user.dreamCompanies.forEach(company => {
      const companySlug = company.toLowerCase().replace(/\s+/g, '');
      queries.push({
        query: `${primaryKeywords} site:${companySlug}.com/careers OR site:${companySlug}.com/jobs`,
        source: 'direct',
        priority: 0, // Highest priority
        company: company,
      });
    });
  }
  
  return queries.sort((a, b) => a.priority - b.priority);
}

// ============================================
// JOB DETAIL EXTRACTOR
// ============================================

/**
 * Extract structured job details from page content
 */
function extractJobDetails(content, url) {
  const details = {
    title: null,
    company: null,
    location: null,
    remotePolicy: 'unknown',
    salary: null,
    requirements: [],
    postedDate: null,
  };
  
  const contentLower = content.toLowerCase();
  
  // Extract title (various patterns)
  const titlePatterns = [
    /<h1[^>]*>([^<]+)</i,
    /<title>([^|<]+)/i,
    /job[- ]?title[:\s]*([^\n<]+)/i,
  ];
  for (const pattern of titlePatterns) {
    const match = content.match(pattern);
    if (match) {
      details.title = match[1].trim().replace(/\s+/g, ' ').slice(0, 100);
      break;
    }
  }
  
  // Extract company
  const companyPatterns = [
    /company[:\s]*([^\n<,]+)/i,
    /employer[:\s]*([^\n<,]+)/i,
    /at\s+([A-Z][a-zA-Z0-9\s&]+?)(?:\s+in|\s+-|\s+\||$)/,
  ];
  for (const pattern of companyPatterns) {
    const match = content.match(pattern);
    if (match) {
      details.company = match[1].trim().slice(0, 50);
      break;
    }
  }
  
  // Extract location
  const locationPatterns = [
    /location[:\s]*([^<\n]+)/i,
    /(?:in|at)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s*[A-Z]{2})/,
    /([A-Z][a-z]+,\s*[A-Z]{2}\s*\d{5})/,
  ];
  for (const pattern of locationPatterns) {
    const match = content.match(pattern);
    if (match) {
      details.location = match[1].trim().slice(0, 50);
      break;
    }
  }
  
  // Detect remote policy
  if (contentLower.includes('fully remote') || contentLower.includes('100% remote')) {
    details.remotePolicy = 'remote';
  } else if (contentLower.includes('hybrid') || contentLower.includes('flexible')) {
    details.remotePolicy = 'hybrid';
  } else if (contentLower.includes('on-site') || contentLower.includes('onsite') || contentLower.includes('in-office')) {
    details.remotePolicy = 'onsite';
  }
  
  // Extract salary
  const salaryPatterns = [
    /\$(\d{2,3}),?(\d{3})(?:\s*[-–to]+\s*\$?(\d{2,3}),?(\d{3}))?/,
    /(\d{2,3})k\s*[-–to]+\s*(\d{2,3})k/i,
    /salary[:\s]*\$?(\d+)/i,
  ];
  for (const pattern of salaryPatterns) {
    const match = content.match(pattern);
    if (match) {
      // Parse the salary
      let min, max;
      if (match[0].includes('k')) {
        min = parseInt(match[1]) * 1000;
        max = match[2] ? parseInt(match[2]) * 1000 : min;
      } else {
        min = parseInt(match[1] + (match[2] || ''));
        max = match[3] ? parseInt(match[3] + (match[4] || '')) : min;
      }
      details.salary = { min, max, raw: match[0] };
      break;
    }
  }
  
  // Extract requirements (look for bullet points or "requirements" section)
  const reqSection = content.match(/requirements?[:\s]*([^]*?)(?=responsibilities|benefits|about|apply|$)/i);
  if (reqSection) {
    const bullets = reqSection[1].match(/[•\-\*]\s*([^\n•\-\*]+)/g);
    if (bullets) {
      details.requirements = bullets
        .map(b => b.replace(/^[•\-\*]\s*/, '').trim())
        .filter(b => b.length > 10 && b.length < 200)
        .slice(0, 5);
    }
  }
  
  // Extract posted date
  const datePatterns = [
    /posted[:\s]*(\d+\s*(?:day|week|hour)s?\s*ago)/i,
    /(\d{1,2}\/\d{1,2}\/\d{2,4})/,
    /(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}/i,
  ];
  for (const pattern of datePatterns) {
    const match = content.match(pattern);
    if (match) {
      details.postedDate = match[1];
      break;
    }
  }
  
  return details;
}

// ============================================
// RED FLAG DETECTOR
// ============================================

/**
 * Check for red flags in job content and company
 */
function detectRedFlags(content, companyName) {
  const flags = [];
  const contentLower = content.toLowerCase();
  
  // Check job posting red flags
  for (const flag of RED_FLAGS.jobPosting) {
    if (contentLower.includes(flag)) {
      flags.push(`Job may be closed: "${flag}"`);
    }
  }
  
  // Check spam indicators
  for (const flag of RED_FLAGS.spam) {
    if (contentLower.includes(flag)) {
      flags.push(`Potential spam: "${flag}"`);
    }
  }
  
  return flags;
}

// ============================================
// RELEVANCE SCORER
// ============================================

/**
 * Score how well a job matches user preferences (0-100)
 */
function scoreRelevance(job, user) {
  let score = 50; // Base score
  const matchedKeywords = [];
  
  const jobText = `${job.title} ${job.company} ${job.requirements?.join(' ') || ''}`.toLowerCase();
  
  // Keyword matches (+10 each, max +30)
  for (const keyword of user.keywords) {
    if (jobText.includes(keyword.toLowerCase())) {
      score += 10;
      matchedKeywords.push(keyword);
    }
  }
  score = Math.min(score, 80); // Cap keyword bonus
  
  // Location match
  if (user.location && user.location !== 'anywhere') {
    if (job.location?.toLowerCase().includes(user.location.toLowerCase())) {
      score += 10;
    } else if (job.remotePolicy === 'remote' && user.remotePreference === 'remote') {
      score += 10; // Remote matches remote preference
    } else {
      score -= 10; // Location mismatch
    }
  }
  
  // Remote preference match
  if (user.remotePreference === 'remote' && job.remotePolicy === 'remote') {
    score += 10;
  } else if (user.remotePreference === 'hybrid' && job.remotePolicy === 'hybrid') {
    score += 5;
  } else if (user.remotePreference === 'remote' && job.remotePolicy === 'onsite') {
    score -= 15; // Strong mismatch
  }
  
  // Salary match
  if (job.salary && user.salaryMin) {
    if (job.salary.max >= user.salaryMin) {
      score += 10;
    } else {
      score -= 10; // Below salary expectations
    }
  }
  
  // Industry match
  if (user.industries && user.industries.length > 0) {
    for (const industry of user.industries) {
      if (jobText.includes(industry.toLowerCase())) {
        score += 5;
        break;
      }
    }
  }
  
  // Penalize for red flags
  if (job.redFlags && job.redFlags.length > 0) {
    score -= job.redFlags.length * 10;
  }
  
  // Dream company bonus
  if (user.dreamCompanies) {
    for (const dream of user.dreamCompanies) {
      if (job.company?.toLowerCase().includes(dream.toLowerCase())) {
        score += 20;
        break;
      }
    }
  }
  
  return {
    score: Math.max(0, Math.min(100, score)),
    matchedKeywords,
  };
}

// ============================================
// TITLE VERIFICATION
// ============================================

/**
 * Verify the job title actually matches what user wants
 * Catches "PM = Property Manager" type mismatches
 */
function verifyTitle(jobTitle, userKeywords) {
  const titleLower = jobTitle.toLowerCase();
  
  for (const keyword of userKeywords) {
    const keywordLower = keyword.toLowerCase();
    const clarification = TITLE_CLARIFICATIONS[keywordLower];
    
    if (clarification) {
      // Check for unwanted matches
      for (const notWanted of clarification.notWanted) {
        if (titleLower.includes(notWanted)) {
          return {
            valid: false,
            reason: `Title "${jobTitle}" appears to be "${notWanted}", not "${keyword}"`,
          };
        }
      }
    }
  }
  
  return { valid: true };
}

// ============================================
// DEDUPLICATION
// ============================================

/**
 * Generate unique ID for a job (for deduplication)
 */
function generateJobId(job) {
  const str = `${job.company}-${job.title}-${job.location}`.toLowerCase().replace(/\s+/g, '-');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

/**
 * Check if job was already shown to user
 */
function wasAlreadyShown(jobId, userHistory) {
  return userHistory && userHistory.shownJobs && userHistory.shownJobs.includes(jobId);
}

// ============================================
// MAIN VERIFICATION PIPELINE
// ============================================

/**
 * Full verification pipeline for a single job URL
 * Returns null if job fails verification
 */
async function verifyJob(rawResult, user, fetchFn) {
  const url = rawResult.url;
  
  // Skip problematic domains
  const problematicDomains = ['workday.com', 'taleo.net', 'icims.com'];
  if (problematicDomains.some(d => url.includes(d))) {
    return { verified: false, reason: 'Problematic domain (requires login)' };
  }
  
  // Fetch the actual job page
  let content;
  try {
    content = await fetchFn(url);
    if (!content || content.length < 500) {
      return { verified: false, reason: 'Empty or minimal page content' };
    }
  } catch (err) {
    return { verified: false, reason: `Fetch failed: ${err.message}` };
  }
  
  // Check for closed/expired indicators
  const contentLower = content.toLowerCase();
  for (const flag of RED_FLAGS.jobPosting) {
    if (contentLower.includes(flag)) {
      return { verified: false, reason: `Job appears closed: "${flag}"` };
    }
  }
  
  // Extract job details
  const details = extractJobDetails(content, url);
  
  // Must have at least title
  if (!details.title) {
    return { verified: false, reason: 'Could not extract job title' };
  }
  
  // Verify title matches intent
  const titleCheck = verifyTitle(details.title, user.keywords);
  if (!titleCheck.valid) {
    return { verified: false, reason: titleCheck.reason };
  }
  
  // Detect red flags
  const redFlags = detectRedFlags(content, details.company);
  
  // Build verified job object
  const job = {
    id: generateJobId(details),
    title: details.title,
    company: details.company || rawResult.company || 'Unknown Company',
    location: details.location || rawResult.location || 'Location not specified',
    remotePolicy: details.remotePolicy,
    salary: details.salary,
    url: url,
    source: detectSource(url),
    postedDate: details.postedDate,
    requirements: details.requirements,
    redFlags: redFlags,
    verifiedAt: new Date().toISOString(),
    snippet: rawResult.snippet || content.slice(0, 300),
  };
  
  // Score relevance
  const { score, matchedKeywords } = scoreRelevance(job, user);
  job.relevanceScore = score;
  job.matchedKeywords = matchedKeywords;
  
  // Filter by minimum score
  if (score < CONFIG.minRelevanceScore) {
    return { verified: false, reason: `Low relevance score: ${score}` };
  }
  
  return { verified: true, job };
}

/**
 * Detect source from URL
 */
function detectSource(url) {
  if (url.includes('linkedin.com')) return 'linkedin';
  if (url.includes('indeed.com')) return 'indeed';
  if (url.includes('glassdoor.com')) return 'glassdoor';
  if (url.includes('lever.co')) return 'lever';
  if (url.includes('greenhouse.io')) return 'greenhouse';
  if (url.includes('builtin.com')) return 'builtin';
  return 'other';
}

// ============================================
// EXPORT
// ============================================

module.exports = {
  CONFIG,
  buildSearchQueries,
  extractJobDetails,
  detectRedFlags,
  scoreRelevance,
  verifyTitle,
  generateJobId,
  wasAlreadyShown,
  verifyJob,
  detectSource,
  RED_FLAGS,
  TITLE_CLARIFICATIONS,
};

// ============================================
// CLI TESTING
// ============================================

if (require.main === module) {
  // Test with sample data
  const testUser = {
    keywords: ['product manager', 'pm'],
    location: 'New York',
    remotePreference: 'hybrid',
    salaryMin: 150000,
    salaryMax: 200000,
    industries: ['fintech', 'healthcare'],
    dreamCompanies: ['Stripe', 'Plaid'],
  };
  
  console.log('=== Search Queries ===');
  const queries = buildSearchQueries(testUser);
  queries.forEach(q => console.log(`[${q.source}] ${q.query}`));
  
  console.log('\n=== Title Verification ===');
  console.log(verifyTitle('Senior Product Manager', testUser.keywords));
  console.log(verifyTitle('Property Manager', testUser.keywords));
  console.log(verifyTitle('PM - Night Shift', testUser.keywords));
  
  console.log('\n=== Relevance Scoring ===');
  const testJob = {
    title: 'Senior Product Manager',
    company: 'Stripe',
    location: 'New York, NY',
    remotePolicy: 'hybrid',
    salary: { min: 170000, max: 200000 },
    requirements: ['5+ years PM experience', 'fintech background'],
  };
  console.log(scoreRelevance(testJob, testUser));
}
