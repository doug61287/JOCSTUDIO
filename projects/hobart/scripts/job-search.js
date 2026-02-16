#!/usr/bin/env node
/**
 * Hobart Job Search Module v2
 * 
 * Two-tier search strategy:
 * 1. PRIORITY: Direct employer sites (Greenhouse, Lever, Ashby, company careers)
 * 2. FALLBACK: Aggregators with company lookup for direct link
 * 
 * Uses Brave Search API via OpenClaw's web_search tool
 */

const { getUser } = require('./user-state');

// =============================================================================
// CONFIGURATION
// =============================================================================

// Direct employer ATS platforms (PRIORITY - these are the gold standard)
const DIRECT_EMPLOYER_SITES = [
  'greenhouse.io',
  'lever.co', 
  'jobs.ashbyhq.com',
  'myworkdayjobs.com',
  'smartrecruiters.com',
  'jobvite.com',
  'icims.com',
  'ultipro.com',
  'bamboohr.com',
  'recruitee.com',
  'workable.com',
  'breezy.hr',
  'jazz.co',
  'hire.trakstar.com'
];

// Company careers page patterns
const CAREERS_PAGE_PATTERNS = [
  '/careers',
  '/jobs',
  '/work-with-us',
  '/join-us',
  '/opportunities'
];

// Aggregators (FALLBACK - use only if no direct link found)
const AGGREGATOR_SITES = [
  'linkedin.com/jobs',
  'indeed.com',
  'glassdoor.com',
  'ziprecruiter.com',
  'monster.com',
  'careerbuilder.com'
];

// Sites with known issues - avoid entirely
const PROBLEMATIC_SITES = [
  'jobs.jhu.edu',      // Session-gated, links expire
  'workday.com/login', // Login required
  'taleo.net',         // Often broken links
];

// Default exclusion patterns
const DEFAULT_EXCLUSIONS = [
  'construction project management',
  'facilities management', 
  'it infrastructure',
  'it project management',
  'devops',
  'building systems',
  'mechanical systems',
  'electrical systems',
  'janitorial',
  'custodial',
  'security guard'
];

// =============================================================================
// URL CLASSIFICATION
// =============================================================================

/**
 * Classify a URL by source type
 */
function classifyUrl(url) {
  if (!url) return { type: 'unknown', priority: 99 };
  
  const urlLower = url.toLowerCase();
  
  // Check if it's a direct employer ATS
  for (const site of DIRECT_EMPLOYER_SITES) {
    if (urlLower.includes(site)) {
      return { type: 'direct-ats', site, priority: 1 };
    }
  }
  
  // Check if it's a company careers page
  for (const pattern of CAREERS_PAGE_PATTERNS) {
    if (urlLower.includes(pattern)) {
      // Make sure it's not an aggregator
      const isAggregator = AGGREGATOR_SITES.some(agg => urlLower.includes(agg));
      if (!isAggregator) {
        return { type: 'direct-careers', priority: 2 };
      }
    }
  }
  
  // Check if it's an aggregator
  for (const site of AGGREGATOR_SITES) {
    if (urlLower.includes(site)) {
      return { type: 'aggregator', site, priority: 3 };
    }
  }
  
  // Check for problematic sites
  for (const site of PROBLEMATIC_SITES) {
    if (urlLower.includes(site)) {
      return { type: 'problematic', site, priority: 99 };
    }
  }
  
  return { type: 'other', priority: 4 };
}

/**
 * Extract company domain from URL
 */
function extractCompanyDomain(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    
    // Remove common prefixes
    const cleaned = hostname
      .replace(/^www\./, '')
      .replace(/^jobs\./, '')
      .replace(/^careers\./, '');
    
    // For ATS platforms, extract company from path
    if (url.includes('greenhouse.io')) {
      const match = url.match(/greenhouse\.io\/([^\/]+)/);
      return match ? match[1] : null;
    }
    if (url.includes('lever.co')) {
      const match = url.match(/lever\.co\/([^\/]+)/);
      return match ? match[1] : null;
    }
    if (url.includes('jobs.ashbyhq.com')) {
      const match = url.match(/jobs\.ashbyhq\.com\/([^\/]+)/);
      return match ? match[1] : null;
    }
    
    return cleaned;
  } catch {
    return null;
  }
}

// =============================================================================
// SEARCH QUERY BUILDERS
// =============================================================================

/**
 * Build search query for DIRECT employer sites (Tier 1)
 */
function buildDirectSearchQuery(user, options = {}) {
  const parts = [];
  
  // Keywords
  if (user.keywords?.length > 0) {
    const keywordStr = user.keywords.map(k => `"${k}"`).join(' OR ');
    parts.push(`(${keywordStr})`);
  }
  
  // Location
  if (user.location && user.location.toLowerCase() !== 'anywhere') {
    parts.push(`"${user.location}"`);
  }
  
  // Remote
  if (user.remotePreference === 'remote') {
    parts.push('remote');
  }
  
  // Site restrictions - DIRECT sources only
  const siteRestrictions = DIRECT_EMPLOYER_SITES
    .slice(0, 5) // Top 5 to avoid query being too long
    .map(s => `site:${s}`)
    .join(' OR ');
  parts.push(`(${siteRestrictions})`);
  
  return parts.join(' ');
}

/**
 * Build search query for AGGREGATOR fallback (Tier 2)
 */
function buildAggregatorSearchQuery(user, options = {}) {
  const parts = [];
  
  // Keywords
  if (user.keywords?.length > 0) {
    const keywordStr = user.keywords.map(k => `"${k}"`).join(' OR ');
    parts.push(`(${keywordStr})`);
  }
  
  parts.push('jobs OR hiring OR careers');
  
  // Location
  if (user.location && user.location.toLowerCase() !== 'anywhere') {
    parts.push(`"${user.location}"`);
  }
  
  // Remote
  if (user.remotePreference === 'remote') {
    parts.push('remote');
  }
  
  // Industries
  if (user.industries?.length > 0 && !user.industries.includes('any')) {
    const industryStr = user.industries.map(i => `"${i}"`).join(' OR ');
    parts.push(`(${industryStr})`);
  }
  
  return parts.join(' ');
}

/**
 * Build query to find company's direct careers page
 */
function buildCompanyLookupQuery(companyName) {
  return `"${companyName}" careers jobs site:${companyName.toLowerCase().replace(/\s+/g, '')}.com OR site:${companyName.toLowerCase().replace(/\s+/g, '-')}.com`;
}

// =============================================================================
// JOB PARSING
// =============================================================================

/**
 * Parse job listing from search result
 */
function parseJobListing(result) {
  const listing = {
    title: cleanText(result.title) || 'Untitled',
    company: null,
    location: null,
    salary: null,
    remote: null,
    url: result.url,
    snippet: cleanText(result.description) || '',
    source: null,
    sourceType: null,
    priority: 99,
    directUrl: null,
    verified: false,
    postedDate: result.published || null
  };
  
  // Classify the URL
  const classification = classifyUrl(result.url);
  listing.sourceType = classification.type;
  listing.priority = classification.priority;
  listing.source = detectSourceName(result.url);
  
  // If it's a direct source, the URL is already direct
  if (classification.type === 'direct-ats' || classification.type === 'direct-careers') {
    listing.directUrl = result.url;
  }
  
  // Extract company name from title
  const atMatch = listing.title.match(/(.+?)\s+at\s+(.+)/i);
  if (atMatch) {
    listing.title = atMatch[1].trim();
    listing.company = atMatch[2].trim();
  }
  
  const dashMatch = listing.title.match(/(.+?)\s*[-–|]\s*(.+)/);
  if (dashMatch && !listing.company) {
    listing.title = dashMatch[1].trim();
    listing.company = dashMatch[2].trim();
  }
  
  // Try to extract company from URL for ATS platforms
  if (!listing.company) {
    const companyFromUrl = extractCompanyDomain(result.url);
    if (companyFromUrl && !DIRECT_EMPLOYER_SITES.some(s => companyFromUrl.includes(s))) {
      listing.company = formatCompanyName(companyFromUrl);
    }
  }
  
  // Extract salary
  const salaryMatch = listing.snippet.match(/\$[\d,]+[kK]?\s*[-–to]+\s*\$[\d,]+[kK]?/);
  if (salaryMatch) {
    listing.salary = salaryMatch[0];
  }
  
  // Detect remote/hybrid
  const textToCheck = (listing.title + ' ' + listing.snippet).toLowerCase();
  if (['remote', 'work from home', 'wfh', 'fully remote'].some(k => textToCheck.includes(k))) {
    listing.remote = 'remote';
  } else if (['hybrid', 'flexible'].some(k => textToCheck.includes(k))) {
    listing.remote = 'hybrid';
  }
  
  // Extract location
  const locationMatch = listing.snippet.match(/(?:in|at|located in|based in)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,?\s*[A-Z]{2})/);
  if (locationMatch) {
    listing.location = locationMatch[1];
  }
  
  return listing;
}

/**
 * Clean text from search results (remove HTML, extra whitespace)
 */
function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Format company name from URL slug
 */
function formatCompanyName(slug) {
  return slug
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Detect human-readable source name from URL
 */
function detectSourceName(url) {
  if (!url) return 'Unknown';
  
  const sources = {
    'linkedin.com': 'LinkedIn',
    'indeed.com': 'Indeed', 
    'glassdoor.com': 'Glassdoor',
    'greenhouse.io': 'Greenhouse',
    'lever.co': 'Lever',
    'ashbyhq.com': 'Ashby',
    'workday': 'Workday',
    'smartrecruiters.com': 'SmartRecruiters',
    'builtin.com': 'BuiltIn',
    'wellfound.com': 'Wellfound',
    'ziprecruiter.com': 'ZipRecruiter'
  };
  
  for (const [domain, name] of Object.entries(sources)) {
    if (url.includes(domain)) return name;
  }
  
  return 'Direct';
}

// =============================================================================
// FILTERING & SCORING
// =============================================================================

/**
 * Check if listing should be excluded
 */
function shouldExclude(listing, userExclusions = []) {
  const text = `${listing.title} ${listing.snippet} ${listing.company || ''}`.toLowerCase();
  const allExclusions = [...DEFAULT_EXCLUSIONS, ...userExclusions.map(e => e.toLowerCase())];
  
  return allExclusions.some(exclusion => text.includes(exclusion));
}

/**
 * Check if URL is problematic
 */
function isProblematicUrl(url) {
  return PROBLEMATIC_SITES.some(site => url?.includes(site));
}

/**
 * Score listing relevance
 */
function scoreRelevance(listing, user) {
  let score = 0;
  const text = `${listing.title} ${listing.snippet} ${listing.company || ''}`.toLowerCase();
  
  // Keyword matches (most important)
  user.keywords?.forEach(keyword => {
    if (text.includes(keyword.toLowerCase())) score += 15;
  });
  
  // Industry matches
  if (user.industries && !user.industries.includes('any')) {
    user.industries.forEach(industry => {
      if (text.includes(industry.toLowerCase())) score += 8;
    });
  }
  
  // Remote preference
  if (user.remotePreference === 'remote' && listing.remote === 'remote') score += 10;
  if (user.remotePreference === 'hybrid' && listing.remote === 'hybrid') score += 6;
  
  // Salary match
  if (listing.salary && user.salaryMin) {
    const salaryNum = parseInt(listing.salary.replace(/\D/g, ''));
    if (salaryNum >= user.salaryMin * 0.9 && salaryNum <= user.salaryMax * 1.1) {
      score += 12;
    }
  }
  
  // BONUS: Direct employer links get priority
  if (listing.sourceType === 'direct-ats') score += 20;
  if (listing.sourceType === 'direct-careers') score += 15;
  if (listing.directUrl) score += 10;
  
  // PENALTY: Aggregators without direct link
  if (listing.sourceType === 'aggregator' && !listing.directUrl) score -= 5;
  
  return score;
}

/**
 * Filter and sort listings
 */
function filterAndSortListings(listings, user) {
  const userExclusions = user.exclude || [];
  
  return listings
    .filter(listing => !shouldExclude(listing, userExclusions))
    .filter(listing => !isProblematicUrl(listing.url))
    .filter((listing, index, self) => 
      index === self.findIndex(l => l.url === listing.url)
    )
    .map(listing => ({ 
      ...listing, 
      score: scoreRelevance(listing, user) 
    }))
    .sort((a, b) => {
      // Primary: direct sources first
      if (a.priority !== b.priority) return a.priority - b.priority;
      // Secondary: relevance score
      return b.score - a.score;
    });
}

// =============================================================================
// FORMATTING
// =============================================================================

/**
 * Format listing for WhatsApp (summary mode)
 */
function formatListingSummary(listing, index) {
  const emoji = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'][index] || `${index + 1}.`;
  
  let output = `${emoji} *${listing.title}*`;
  if (listing.company) output += ` @ ${listing.company}`;
  output += '\n';
  
  // Details line
  const details = [];
  if (listing.location) details.push(`📍 ${listing.location}`);
  if (listing.remote) details.push(listing.remote === 'remote' ? '🏠 Remote' : '🔄 Hybrid');
  if (listing.salary) details.push(`💰 ${listing.salary}`);
  
  if (details.length > 0) {
    output += `   ${details.join(' | ')}\n`;
  }
  
  // Snippet (truncated)
  if (listing.snippet) {
    const truncated = listing.snippet.length > 120 
      ? listing.snippet.substring(0, 120) + '...'
      : listing.snippet;
    output += `   _${truncated}_\n`;
  }
  
  // Link - prefer direct, show source type
  const linkUrl = listing.directUrl || listing.url;
  const linkLabel = listing.directUrl 
    ? `✅ Apply Direct` 
    : `🔗 ${listing.source}`;
  output += `   ${linkLabel}: ${linkUrl}`;
  
  return output;
}

/**
 * Format listing for WhatsApp (detailed mode)
 */
function formatListingDetailed(listing, index) {
  const separator = '─'.repeat(25);
  
  let output = `\n${separator}\n\n`;
  output += `*${index + 1}. ${listing.title}*\n`;
  if (listing.company) output += `🏢 ${listing.company}\n`;
  
  const details = [];
  if (listing.location) details.push(`📍 ${listing.location}`);
  if (listing.remote) details.push(listing.remote === 'remote' ? '🏠 Remote' : '🔄 Hybrid');
  if (listing.salary) details.push(`💰 ${listing.salary}`);
  
  if (details.length > 0) {
    output += details.join(' | ') + '\n';
  }
  
  output += `\n${listing.snippet}\n\n`;
  
  // Links
  if (listing.directUrl) {
    output += `✅ *Apply Direct*: ${listing.directUrl}\n`;
    if (listing.directUrl !== listing.url) {
      output += `📋 Also on: ${listing.source}\n`;
    }
  } else {
    output += `🔗 *Apply on ${listing.source}*: ${listing.url}\n`;
  }
  
  return output;
}

/**
 * Format full digest
 */
function formatDigest(user, listings, format = 'summary') {
  const greeting = getTimeBasedGreeting();
  
  let message = `${greeting}, ${user.name}! 👋\n\n`;
  
  if (listings.length === 0) {
    message += `No new matches today, but I'm keeping an eye out! 👀\n\n`;
    message += `💡 *Tip:* Try broadening your search keywords or location.`;
    return message;
  }
  
  // Count direct vs aggregator
  const directCount = listings.filter(l => l.directUrl).length;
  
  message += `Found *${listings.length} matches* (${directCount} with direct apply links):\n`;
  
  if (format === 'detailed') {
    listings.forEach((listing, i) => {
      message += formatListingDetailed(listing, i);
    });
  } else {
    message += '\n';
    listings.forEach((listing, i) => {
      message += formatListingSummary(listing, i) + '\n\n';
    });
  }
  
  message += '─'.repeat(25) + '\n';
  message += getTipOfTheDay();
  message += '\n\n_Reply "details #" for full description_';
  
  return message;
}

/**
 * Get time-based greeting
 */
function getTimeBasedGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return '🌅 Good morning';
  if (hour < 17) return '☀️ Good afternoon';
  return '🌙 Good evening';
}

/**
 * Random tip
 */
function getTipOfTheDay() {
  const tips = [
    '💡 *Tip:* Direct apply links often get faster responses than aggregator applications.',
    '💡 *Tip:* Tailor your resume keywords to match each job description.',
    '💡 *Tip:* Follow up on applications after 1 week if you haven\'t heard back.',
    '💡 *Tip:* Connect with the hiring manager on LinkedIn before applying.',
    '💡 *Tip:* Research the company\'s recent news before interviews.',
    '💡 *Tip:* Prepare 2-3 STAR stories for behavioral interview questions.',
    '💡 *Tip:* Most offers have 10-20% salary negotiation room.',
  ];
  return tips[Math.floor(Math.random() * tips.length)];
}

// =============================================================================
// MAIN SEARCH ORCHESTRATION
// =============================================================================

/**
 * Two-tier search results processor
 * 
 * This is designed to be called by the OpenClaw agent, which handles
 * the actual web_search calls. This processes the combined results.
 * 
 * @param {Array} tier1Results - Results from direct employer site search
 * @param {Array} tier2Results - Results from general/aggregator search
 * @param {Object} user - User preferences
 * @param {number} maxListings - Max results to return
 */
function processTwoTierResults(tier1Results, tier2Results, user, maxListings = 5) {
  // Parse all results
  const tier1Listings = (tier1Results || []).map(parseJobListing);
  const tier2Listings = (tier2Results || []).map(parseJobListing);
  
  // Combine, filter, and sort
  const allListings = [...tier1Listings, ...tier2Listings];
  const filtered = filterAndSortListings(allListings, user);
  
  // Take top N
  return filtered.slice(0, maxListings);
}

/**
 * Generate search queries for the agent to execute
 */
function generateSearchQueries(user) {
  return {
    tier1: {
      query: buildDirectSearchQuery(user),
      description: 'Direct employer sites (Greenhouse, Lever, etc.)',
      count: 10,
      freshness: 'pm' // past month
    },
    tier2: {
      query: buildAggregatorSearchQuery(user),
      description: 'General job search (all sources)',
      count: 10,
      freshness: 'pw' // past week
    }
  };
}

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
  // Query builders
  buildDirectSearchQuery,
  buildAggregatorSearchQuery,
  buildCompanyLookupQuery,
  generateSearchQueries,
  
  // Parsing
  parseJobListing,
  classifyUrl,
  extractCompanyDomain,
  
  // Processing
  processTwoTierResults,
  filterAndSortListings,
  shouldExclude,
  isProblematicUrl,
  scoreRelevance,
  
  // Formatting
  formatListingSummary,
  formatListingDetailed,
  formatDigest,
  
  // Config (for external use)
  DIRECT_EMPLOYER_SITES,
  AGGREGATOR_SITES,
  PROBLEMATIC_SITES,
  DEFAULT_EXCLUSIONS
};

// =============================================================================
// JOBSPY INTEGRATION
// =============================================================================

const { execSync, spawn } = require('child_process');
const path = require('path');

// Python 3.11 path (required for python-jobspy)
const PYTHON_PATH = '/opt/homebrew/bin/python3.11';

/**
 * Check if python-jobspy is available
 */
function isJobSpyAvailable() {
  try {
    execSync(`${PYTHON_PATH} -c "from jobspy import scrape_jobs"`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Search using JobSpy (Python)
 * Returns structured job data from Indeed, Glassdoor, etc.
 * 
 * @param {Object} user - User preferences
 * @param {Object} options - Search options
 * @returns {Promise<Object>} - JobSpy results
 */
async function searchWithJobSpy(user, options = {}) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, 'jobspy-search.py');
    
    // Build search term from keywords
    const searchTerm = user.keywords?.join(' OR ') || 'software engineer';
    
    // Build arguments
    const args = [
      scriptPath,
      '--search', searchTerm,
      '--location', user.location || 'United States',
      '--sites', options.sites || 'indeed,glassdoor',  // Skip LinkedIn (fragile)
      '--results', String(options.results || 10),
      '--hours', String(options.hoursOld || 72),
      '--format', 'json'
    ];
    
    if (user.remotePreference === 'remote') {
      args.push('--remote');
    }
    
    // Run Python script
    const proc = spawn(PYTHON_PATH, args);
    
    let stdout = '';
    let stderr = '';
    
    proc.stdout.on('data', (data) => { stdout += data; });
    proc.stderr.on('data', (data) => { stderr += data; });
    
    proc.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(stdout);
          resolve(result);
        } catch (e) {
          reject(new Error(`Failed to parse JobSpy output: ${e.message}`));
        }
      } else {
        reject(new Error(`JobSpy failed: ${stderr || 'Unknown error'}`));
      }
    });
    
    proc.on('error', (err) => {
      reject(new Error(`Failed to spawn JobSpy: ${err.message}`));
    });
    
    // Timeout after 60 seconds
    setTimeout(() => {
      proc.kill();
      reject(new Error('JobSpy search timed out'));
    }, 60000);
  });
}

/**
 * Convert JobSpy result to our standard listing format
 */
function jobSpyToListing(job) {
  const listing = {
    title: job.title || 'Untitled',
    company: job.company || null,
    location: null,
    salary: null,
    remote: job.isRemote ? 'remote' : null,
    url: job.url,
    snippet: job.description || '',
    source: job.site ? job.site.charAt(0).toUpperCase() + job.site.slice(1) : 'JobSpy',
    sourceType: 'jobspy',
    priority: 1,  // JobSpy = high priority (structured data)
    directUrl: job.directUrl || job.url,
    verified: true,  // JobSpy scrapes directly
    postedDate: job.postedDate || null,
    score: 0
  };
  
  // Format location
  if (job.location) {
    const parts = [job.location.city, job.location.state].filter(Boolean);
    if (parts.length > 0) {
      listing.location = parts.join(', ');
    }
  }
  
  // Format salary
  if (job.salary && (job.salary.min || job.salary.max)) {
    const min = job.salary.min;
    const max = job.salary.max;
    if (min && max) {
      listing.salary = `$${Math.floor(min/1000)}k-$${Math.floor(max/1000)}k`;
    } else if (max) {
      listing.salary = `Up to $${Math.floor(max/1000)}k`;
    } else if (min) {
      listing.salary = `$${Math.floor(min/1000)}k+`;
    }
  }
  
  return listing;
}

/**
 * Hybrid search: JobSpy (structured) + Brave (discovery)
 * 
 * Strategy:
 * 1. JobSpy for Indeed/Glassdoor (reliable structured data)
 * 2. Brave for direct employer sites (Greenhouse, Lever, etc.)
 * 3. Merge, dedupe, and rank
 */
async function hybridSearch(user, braveResults = [], options = {}) {
  const results = {
    jobspy: [],
    brave: [],
    merged: [],
    stats: {
      jobspyCount: 0,
      braveCount: 0,
      directCount: 0
    }
  };
  
  // Try JobSpy if available
  if (isJobSpyAvailable()) {
    try {
      const jobspyResult = await searchWithJobSpy(user, options);
      if (jobspyResult.success && jobspyResult.jobs) {
        results.jobspy = jobspyResult.jobs.map(jobSpyToListing);
        results.stats.jobspyCount = results.jobspy.length;
      }
    } catch (err) {
      console.error('JobSpy error (falling back to Brave):', err.message);
    }
  }
  
  // Process Brave results
  if (braveResults.length > 0) {
    results.brave = braveResults.map(parseJobListing);
    results.stats.braveCount = results.brave.length;
  }
  
  // Merge and dedupe
  const allListings = [...results.jobspy, ...results.brave];
  const seen = new Set();
  
  results.merged = allListings.filter(listing => {
    // Dedupe by URL
    if (seen.has(listing.url)) return false;
    seen.add(listing.url);
    
    // Also check by title+company (catch cross-site dupes)
    const key = `${listing.title?.toLowerCase()}-${listing.company?.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    
    return true;
  });
  
  // Score and sort
  results.merged = filterAndSortListings(results.merged, user);
  results.stats.directCount = results.merged.filter(l => l.directUrl).length;
  
  return results;
}

// =============================================================================
// EXPORTS (updated)
// =============================================================================

module.exports = {
  // Query builders
  buildDirectSearchQuery,
  buildAggregatorSearchQuery,
  buildCompanyLookupQuery,
  generateSearchQueries,
  
  // Parsing
  parseJobListing,
  classifyUrl,
  extractCompanyDomain,
  
  // Processing
  processTwoTierResults,
  filterAndSortListings,
  shouldExclude,
  isProblematicUrl,
  scoreRelevance,
  
  // Formatting
  formatListingSummary,
  formatListingDetailed,
  formatDigest,
  
  // JobSpy integration
  isJobSpyAvailable,
  searchWithJobSpy,
  jobSpyToListing,
  hybridSearch,
  
  // Config (for external use)
  DIRECT_EMPLOYER_SITES,
  AGGREGATOR_SITES,
  PROBLEMATIC_SITES,
  DEFAULT_EXCLUSIONS
};

// =============================================================================
// CLI
// =============================================================================

if (require.main === module) {
  const [,, command, ...args] = process.argv;
  
  if (command === 'queries') {
    // Generate queries for a test user
    const testUser = {
      keywords: ['product manager', 'PM'],
      location: 'New York',
      remotePreference: 'hybrid',
      industries: ['biotech', 'healthcare']
    };
    
    const queries = generateSearchQueries(testUser);
    console.log('=== TIER 1: Direct Employer Sites ===');
    console.log(queries.tier1.query);
    console.log('\n=== TIER 2: General Search ===');
    console.log(queries.tier2.query);
  } else if (command === 'jobspy') {
    // Test JobSpy integration
    console.log('JobSpy available:', isJobSpyAvailable());
    
    if (isJobSpyAvailable()) {
      const testUser = {
        keywords: ['software engineer'],
        location: 'San Francisco',
        remotePreference: 'remote'
      };
      
      console.log('Testing JobSpy search...');
      searchWithJobSpy(testUser, { results: 5 })
        .then(result => {
          console.log('Success:', result.success);
          console.log('Jobs found:', result.count);
          if (result.jobs) {
            result.jobs.slice(0, 3).forEach((job, i) => {
              console.log(`\n${i+1}. ${job.title} @ ${job.company}`);
              console.log(`   ${job.url}`);
            });
          }
        })
        .catch(err => console.error('Error:', err.message));
    }
  } else {
    console.log('Hobart Job Search v2 (with JobSpy)');
    console.log('Usage:');
    console.log('  node job-search.js queries  - Generate search queries');
    console.log('  node job-search.js jobspy   - Test JobSpy integration');
  }
}
