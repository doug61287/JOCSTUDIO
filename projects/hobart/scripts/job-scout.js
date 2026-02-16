#!/usr/bin/env node
/**
 * Hobart Job Scout 🦞
 * 
 * The main orchestrator:
 * 1. Load user profile
 * 2. Build search queries
 * 3. Search via Brave API
 * 4. Fetch & verify each job
 * 5. Return best matches
 * 
 * This is designed to be called from OpenClaw tools.
 */

const fs = require('fs');
const path = require('path');
const {
  buildSearchQueries,
  verifyJob,
  generateJobId,
  wasAlreadyShown,
  CONFIG,
} = require('./job-verifier');
const { getUser, updateUser, recordShownJob } = require('./user-state');

// ============================================
// SCOUT RESULTS SCHEMA
// ============================================

/**
 * @typedef {Object} ScoutResults
 * @property {boolean} success
 * @property {string} userId
 * @property {number} rawResultsCount - How many raw results we got
 * @property {number} verifiedCount - How many passed verification
 * @property {Object[]} jobs - Verified jobs, sorted by relevance
 * @property {Object} stats - Search stats
 * @property {string[]} errors - Any errors encountered
 */

// ============================================
// DELAY HELPER
// ============================================

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================
// FORMAT RESULTS FOR DISPLAY
// ============================================

/**
 * Format verified jobs for WhatsApp message
 */
function formatJobsForWhatsApp(jobs, user) {
  if (jobs.length === 0) {
    return `🔍 No new matches this week that meet your bar.

I checked ${CONFIG.maxRawResults}+ listings but none passed verification:
• Some were already closed
• Some didn't actually match "${user.keywords.join(', ')}"
• Some had red flags

I'll keep looking! Want to adjust your criteria?`;
  }
  
  let msg = `🦞 Found ${jobs.length} verified ${jobs.length === 1 ? 'match' : 'matches'}!\n\n`;
  msg += `Each one is real, open, and fits your criteria.\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n\n`;
  
  jobs.forEach((job, i) => {
    const emoji = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'][i] || `${i + 1}.`;
    
    msg += `${emoji} **${job.title}**\n`;
    msg += `🏢 ${job.company}\n`;
    
    const details = [];
    if (job.location) details.push(`📍 ${job.location}`);
    if (job.remotePolicy && job.remotePolicy !== 'unknown') {
      const remoteEmoji = job.remotePolicy === 'remote' ? '🏠' : job.remotePolicy === 'hybrid' ? '🔄' : '🏢';
      details.push(`${remoteEmoji} ${job.remotePolicy}`);
    }
    if (job.salary) {
      details.push(`💰 ${job.salary.raw || `$${job.salary.min/1000}k-$${job.salary.max/1000}k`}`);
    }
    
    if (details.length > 0) {
      msg += details.join(' | ') + '\n';
    }
    
    // Why it matches
    if (job.matchedKeywords && job.matchedKeywords.length > 0) {
      msg += `✓ Matches: ${job.matchedKeywords.join(', ')}\n`;
    }
    
    // Any concerns
    if (job.redFlags && job.redFlags.length > 0) {
      msg += `⚠️ Note: ${job.redFlags[0]}\n`;
    }
    
    // Score
    msg += `📊 Fit: ${job.relevanceScore}%\n`;
    
    msg += `\n🔗 ${job.url}\n`;
    msg += `\n`;
  });
  
  msg += `━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `Reply:\n`;
  msg += `• "more" for additional listings\n`;
  msg += `• "pass on 2" to skip a job\n`;
  msg += `• "prep for 1" for interview prep\n`;
  
  return msg;
}

/**
 * Format scout summary (for logs/debugging)
 */
function formatScoutSummary(results) {
  return `
Scout Results for ${results.userId}:
━━━━━━━━━━━━━━━━━━━━
Queries run: ${results.stats.queriesRun}
Raw results: ${results.rawResultsCount}
After dedup: ${results.stats.afterDedup}
Verified: ${results.verifiedCount}
Rejected: ${results.stats.rejected}

Rejection reasons:
${Object.entries(results.stats.rejectionReasons)
  .sort((a, b) => b[1] - a[1])
  .map(([reason, count]) => `  • ${reason}: ${count}`)
  .join('\n')}

Top matches:
${results.jobs.slice(0, 3).map(j => `  • ${j.title} @ ${j.company} (${j.relevanceScore}%)`).join('\n')}
`;
}

// ============================================
// MAIN SCOUT FUNCTION
// ============================================

/**
 * Run job scout for a user
 * 
 * @param {string} userId - User ID (phone number)
 * @param {Function} searchFn - Function to search (web_search tool)
 * @param {Function} fetchFn - Function to fetch URLs (web_fetch tool)
 * @returns {ScoutResults}
 */
async function scout(userId, searchFn, fetchFn) {
  const results = {
    success: false,
    userId,
    rawResultsCount: 0,
    verifiedCount: 0,
    jobs: [],
    stats: {
      queriesRun: 0,
      afterDedup: 0,
      rejected: 0,
      rejectionReasons: {},
    },
    errors: [],
  };
  
  // Load user
  const user = getUser(userId);
  if (!user) {
    results.errors.push(`User ${userId} not found`);
    return results;
  }
  
  // Build queries
  const queries = buildSearchQueries(user);
  
  // Collect raw results from all queries
  const allRawResults = [];
  
  for (const queryInfo of queries) {
    results.stats.queriesRun++;
    
    try {
      const searchResults = await searchFn(queryInfo.query);
      
      if (searchResults && searchResults.length > 0) {
        searchResults.forEach(r => {
          allRawResults.push({
            ...r,
            sourceQuery: queryInfo.source,
          });
        });
      }
    } catch (err) {
      results.errors.push(`Search failed for ${queryInfo.source}: ${err.message}`);
    }
    
    // Rate limiting between searches
    await delay(500);
  }
  
  results.rawResultsCount = allRawResults.length;
  
  // Deduplicate by URL
  const seenUrls = new Set();
  const uniqueResults = allRawResults.filter(r => {
    if (seenUrls.has(r.url)) return false;
    seenUrls.add(r.url);
    return true;
  });
  
  results.stats.afterDedup = uniqueResults.length;
  
  // Load user history for dedup against previously shown
  const userHistory = user.history || { shownJobs: [] };
  
  // Verify each job
  const verifiedJobs = [];
  
  for (const rawResult of uniqueResults.slice(0, CONFIG.maxRawResults)) {
    // Skip if already shown
    const jobId = generateJobId({ 
      title: rawResult.title || '', 
      company: '', 
      location: '' 
    });
    if (wasAlreadyShown(jobId, userHistory)) {
      results.stats.rejected++;
      results.stats.rejectionReasons['Already shown'] = 
        (results.stats.rejectionReasons['Already shown'] || 0) + 1;
      continue;
    }
    
    // Verify the job
    const verification = await verifyJob(rawResult, user, fetchFn);
    
    if (verification.verified) {
      verifiedJobs.push(verification.job);
    } else {
      results.stats.rejected++;
      const reason = verification.reason.split(':')[0]; // Short reason
      results.stats.rejectionReasons[reason] = 
        (results.stats.rejectionReasons[reason] || 0) + 1;
    }
    
    // Rate limiting between fetches
    await delay(CONFIG.fetchDelayMs);
    
    // Stop early if we have enough
    if (verifiedJobs.length >= CONFIG.maxVerifiedJobs * 2) {
      break;
    }
  }
  
  // Sort by relevance and take top N
  verifiedJobs.sort((a, b) => b.relevanceScore - a.relevanceScore);
  results.jobs = verifiedJobs.slice(0, CONFIG.maxVerifiedJobs);
  results.verifiedCount = results.jobs.length;
  
  // Record shown jobs in user history
  results.jobs.forEach(job => {
    recordShownJob(userId, job.id);
  });
  
  results.success = true;
  return results;
}

// ============================================
// QUICK SEARCH (no verification, for testing)
// ============================================

/**
 * Quick search without full verification
 * Useful for testing query building
 */
async function quickSearch(userId, searchFn) {
  const user = getUser(userId);
  if (!user) return { error: 'User not found' };
  
  const queries = buildSearchQueries(user);
  const results = [];
  
  for (const queryInfo of queries.slice(0, 2)) { // Just first 2 queries
    try {
      const searchResults = await searchFn(queryInfo.query);
      results.push({
        source: queryInfo.source,
        query: queryInfo.query,
        count: searchResults?.length || 0,
        sample: searchResults?.slice(0, 3) || [],
      });
    } catch (err) {
      results.push({
        source: queryInfo.source,
        error: err.message,
      });
    }
  }
  
  return results;
}

// ============================================
// EXPORT
// ============================================

module.exports = {
  scout,
  quickSearch,
  formatJobsForWhatsApp,
  formatScoutSummary,
};

// ============================================
// CLI
// ============================================

if (require.main === module) {
  const [,, command, userId] = process.argv;
  
  if (command === 'test-format') {
    // Test formatting with mock data
    const mockJobs = [
      {
        title: 'Senior Product Manager',
        company: 'Stripe',
        location: 'New York, NY',
        remotePolicy: 'hybrid',
        salary: { min: 180000, max: 220000, raw: '$180k-$220k' },
        url: 'https://linkedin.com/jobs/view/123',
        matchedKeywords: ['product manager', 'fintech'],
        relevanceScore: 95,
        redFlags: [],
      },
      {
        title: 'Product Lead',
        company: 'Plaid',
        location: 'San Francisco, CA',
        remotePolicy: 'remote',
        salary: { min: 170000, max: 200000, raw: '$170k-$200k' },
        url: 'https://linkedin.com/jobs/view/456',
        matchedKeywords: ['product manager'],
        relevanceScore: 88,
        redFlags: ['Recent layoffs reported'],
      },
    ];
    
    const mockUser = { keywords: ['product manager', 'pm'] };
    console.log(formatJobsForWhatsApp(mockJobs, mockUser));
  } else {
    console.log(`
Hobart Job Scout 🦞

Usage:
  node job-scout.js test-format    Test message formatting
  
Note: Full scout requires OpenClaw tools (web_search, web_fetch)
`);
  }
}
