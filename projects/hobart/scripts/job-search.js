#!/usr/bin/env node
/**
 * Hobart Job Search Module
 * 
 * Uses Brave Search API to find job listings
 * Handles anti-bot considerations by using API-based search
 */

const { getUser } = require('./user-state');

/**
 * Build search query from user preferences
 */
function buildSearchQuery(user, options = {}) {
  const parts = [];
  
  // Keywords (job titles)
  if (user.keywords && user.keywords.length > 0) {
    const keywordStr = user.keywords.map(k => `"${k}"`).join(' OR ');
    parts.push(`(${keywordStr})`);
  }
  
  // Add "jobs" or "careers" 
  parts.push('jobs OR careers OR hiring');
  
  // Location
  if (user.location && user.location.toLowerCase() !== 'anywhere') {
    parts.push(`"${user.location}"`);
  }
  
  // Remote preference
  if (user.remotePreference === 'remote') {
    parts.push('remote');
  } else if (user.remotePreference === 'hybrid') {
    parts.push('(hybrid OR "flexible work")');
  }
  
  // Industries
  if (user.industries && user.industries.length > 0 && !user.industries.includes('any')) {
    const industryStr = user.industries.map(i => `"${i}"`).join(' OR ');
    parts.push(`(${industryStr})`);
  }
  
  // Salary (if specified, search for it)
  if (user.salaryMin && user.salaryMin >= 100000) {
    parts.push(`("$${Math.floor(user.salaryMin/1000)}k" OR "$${Math.floor(user.salaryMax/1000)}k" OR "competitive salary")`);
  }
  
  // Site restrictions for better results
  if (options.site) {
    parts.push(`site:${options.site}`);
  } else {
    // Search across job sites
    parts.push('(site:linkedin.com/jobs OR site:indeed.com OR site:glassdoor.com OR site:builtin.com OR site:wellfound.com)');
  }
  
  return parts.join(' ');
}

/**
 * Parse job listing from search result
 */
function parseJobListing(result) {
  const listing = {
    title: result.title || 'Untitled',
    company: null,
    location: null,
    salary: null,
    remote: null,
    url: result.url,
    snippet: result.description || '',
    source: detectSource(result.url),
    postedDate: null
  };
  
  // Try to extract company from title (common format: "Job Title at Company")
  const atMatch = listing.title.match(/(.+?)\s+at\s+(.+)/i);
  if (atMatch) {
    listing.title = atMatch[1].trim();
    listing.company = atMatch[2].trim();
  }
  
  // Try to extract company from title (format: "Job Title - Company")
  const dashMatch = listing.title.match(/(.+?)\s*[-–|]\s*(.+)/);
  if (dashMatch && !listing.company) {
    listing.title = dashMatch[1].trim();
    listing.company = dashMatch[2].trim();
  }
  
  // Extract salary from snippet
  const salaryMatch = listing.snippet.match(/\$[\d,]+[kK]?\s*[-–to]+\s*\$[\d,]+[kK]?/);
  if (salaryMatch) {
    listing.salary = salaryMatch[0];
  }
  
  // Detect remote
  const remoteKeywords = ['remote', 'work from home', 'wfh', 'fully remote'];
  const hybridKeywords = ['hybrid', 'flexible'];
  
  const textToCheck = (listing.title + ' ' + listing.snippet).toLowerCase();
  if (remoteKeywords.some(k => textToCheck.includes(k))) {
    listing.remote = 'remote';
  } else if (hybridKeywords.some(k => textToCheck.includes(k))) {
    listing.remote = 'hybrid';
  }
  
  // Extract location from snippet
  const locationMatch = listing.snippet.match(/(?:in|at|located in|based in)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,?\s*[A-Z]{2})/);
  if (locationMatch) {
    listing.location = locationMatch[1];
  }
  
  return listing;
}

/**
 * Detect source from URL
 */
function detectSource(url) {
  if (!url) return 'unknown';
  if (url.includes('linkedin.com')) return 'LinkedIn';
  if (url.includes('indeed.com')) return 'Indeed';
  if (url.includes('glassdoor.com')) return 'Glassdoor';
  if (url.includes('builtin.com')) return 'BuiltIn';
  if (url.includes('wellfound.com')) return 'Wellfound';
  if (url.includes('lever.co')) return 'Lever';
  if (url.includes('greenhouse.io')) return 'Greenhouse';
  return 'Other';
}

/**
 * Format job listing for display (summary mode)
 */
function formatListingSummary(listing, index) {
  const emoji = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'][index] || `${index + 1}.`;
  
  let line = `${emoji} **${listing.title}**`;
  if (listing.company) line += ` @ ${listing.company}`;
  line += '\n';
  
  const details = [];
  if (listing.location) details.push(`📍 ${listing.location}`);
  if (listing.remote) details.push(listing.remote === 'remote' ? '🏠 Remote' : '🔄 Hybrid');
  if (listing.salary) details.push(`💰 ${listing.salary}`);
  
  if (details.length > 0) {
    line += `   ${details.join(' | ')}\n`;
  }
  
  line += `   🔗 [Apply on ${listing.source}](${listing.url})`;
  
  return line;
}

/**
 * Format job listing for display (detailed mode)
 */
function formatListingDetailed(listing, index) {
  const separator = '━'.repeat(30);
  
  let output = `\n${separator}\n\n`;
  output += `**${index + 1}. ${listing.title}**\n`;
  if (listing.company) output += `🏢 ${listing.company}\n`;
  
  const details = [];
  if (listing.location) details.push(`📍 ${listing.location}`);
  if (listing.remote) details.push(listing.remote === 'remote' ? '🏠 Remote' : '🔄 Hybrid');
  if (listing.salary) details.push(`💰 ${listing.salary}`);
  
  if (details.length > 0) {
    output += details.join(' | ') + '\n';
  }
  
  output += `\n**About this role:**\n${listing.snippet}\n\n`;
  output += `🔗 [Apply on ${listing.source}](${listing.url})\n`;
  
  return output;
}

/**
 * Format full digest message
 */
function formatDigest(user, listings, format = 'summary') {
  const greeting = getTimeBasedGreeting();
  
  let message = `${greeting}, ${user.name}! 👋\n\n`;
  
  if (listings.length === 0) {
    message += `No new matches today, but I'm keeping an eye out! 👀\n\n`;
    message += `💡 **Tip:** Try broadening your search keywords or location for more results.`;
    return message;
  }
  
  message += `Here are today's top ${listings.length} matches:\n`;
  
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
  
  // Add tips
  message += '\n---\n';
  message += getTipOfTheDay();
  message += '\n\n';
  message += '_Reply "details #" for full description, or "more" for additional listings_';
  
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
 * Get random tip of the day
 */
function getTipOfTheDay() {
  const tips = [
    '💡 **Tip:** Tailor your resume keywords to match job descriptions for better ATS results.',
    '💡 **Tip:** Follow up on applications after 1 week if you haven\'t heard back.',
    '💡 **Tip:** Connect with hiring managers on LinkedIn before applying.',
    '💡 **Tip:** Prepare 2-3 stories using the STAR method for behavioral interviews.',
    '💡 **Tip:** Research the company\'s recent news before interviews.',
    '💡 **Tip:** Ask thoughtful questions at the end of interviews - it shows genuine interest.',
    '💡 **Tip:** Negotiate! Most offers have 10-20% flexibility.',
    '💡 **Tip:** Update your LinkedIn "Open to Work" settings for recruiter visibility.',
  ];
  
  return tips[Math.floor(Math.random() * tips.length)];
}

/**
 * Deduplicate listings by URL
 */
function deduplicateListings(listings) {
  const seen = new Set();
  return listings.filter(l => {
    if (seen.has(l.url)) return false;
    seen.add(l.url);
    return true;
  });
}

/**
 * Score listing relevance to user preferences
 */
function scoreRelevance(listing, user) {
  let score = 0;
  const text = (listing.title + ' ' + listing.snippet + ' ' + (listing.company || '')).toLowerCase();
  
  // Keyword matches
  user.keywords.forEach(keyword => {
    if (text.includes(keyword.toLowerCase())) score += 10;
  });
  
  // Industry matches
  if (user.industries && !user.industries.includes('any')) {
    user.industries.forEach(industry => {
      if (text.includes(industry.toLowerCase())) score += 5;
    });
  }
  
  // Remote preference match
  if (user.remotePreference === 'remote' && listing.remote === 'remote') score += 8;
  if (user.remotePreference === 'hybrid' && listing.remote === 'hybrid') score += 5;
  
  // Salary match (if both specified)
  if (listing.salary && user.salaryMin) {
    const salaryNum = parseInt(listing.salary.replace(/\D/g, ''));
    if (salaryNum >= user.salaryMin && salaryNum <= user.salaryMax) {
      score += 10;
    }
  }
  
  return score;
}

module.exports = {
  buildSearchQuery,
  parseJobListing,
  formatListingSummary,
  formatListingDetailed,
  formatDigest,
  deduplicateListings,
  scoreRelevance,
  detectSource
};

// CLI usage
if (require.main === module) {
  const [,, command, phone] = process.argv;
  
  if (command === 'query' && phone) {
    const user = getUser(phone);
    console.log('Search query:');
    console.log(buildSearchQuery(user));
  } else {
    console.log('Usage: job-search.js query <phone>');
  }
}
