#!/usr/bin/env node
/**
 * Hobart Job Enricher — Crawl4AI Integration
 * 
 * Runs AFTER job-scout.js finds candidates.
 * Enriches each job with:
 *   1. Live verification (is the link still active?)
 *   2. Full job description extraction (better matching)
 *   3. Company research (Glassdoor rating, news, salary)
 *   4. Interview prep package on demand
 * 
 * Usage (from OpenClaw/Hobart agent):
 *   const { enrichJobs, companyBrief, interviewPrep } = require('./crawl-enricher');
 */

const { execFile } = require('child_process');
const path = require('path');

const PYTHON = '/opt/homebrew/bin/python3.11';
const SCRIPTS_DIR = path.dirname(__filename);

// ── Helper: run a python script and parse JSON output ─────────────────────────

function runPython(script, args = []) {
  return new Promise((resolve, reject) => {
    execFile(PYTHON, [path.join(SCRIPTS_DIR, script), ...args], 
      { timeout: 30000 },
      (error, stdout, stderr) => {
        if (error && !stdout) return reject(new Error(stderr || error.message));
        
        // Extract JSON from output (between ---*_JSON--- markers)
        const jsonMatch = stdout.match(/---\w+_JSON---\n([\s\S]+)/);
        if (jsonMatch) {
          try {
            return resolve(JSON.parse(jsonMatch[1]));
          } catch (e) {
            return reject(new Error('Failed to parse JSON from python output'));
          }
        }
        
        // Try parsing entire stdout as JSON
        try {
          resolve(JSON.parse(stdout));
        } catch {
          resolve({ raw: stdout }); // Return raw if can't parse
        }
      }
    );
  });
}

// ── 1. Verify + Enrich Job Listings ───────────────────────────────────────────

/**
 * Verify job links are live + extract full descriptions
 * @param {Array} jobs - Job objects with .url field
 * @returns {Array} - Enriched jobs with verification status + descriptions
 */
async function enrichJobs(jobs) {
  if (!jobs || jobs.length === 0) return jobs;

  console.log(`🔍 Verifying ${jobs.length} job links with Crawl4AI...`);
  
  const results = await Promise.allSettled(
    jobs.map(job => verifyJobLink(job))
  );

  return results.map((result, i) => {
    if (result.status === 'fulfilled') return result.value;
    // Keep original job if verification fails
    return { ...jobs[i], verified: false, verificationError: result.reason?.message };
  });
}

async function verifyJobLink(job) {
  try {
    const verification = await runPython('crawl-verify.py', ['--url', job.url]);
    
    return {
      ...job,
      verified: true,
      active: verification.active !== false, // default true if uncertain
      verificationStatus: verification.status,
      // Enhance with extracted data
      salary: job.salary || verification.salary || null,
      location: job.location || verification.location || null,
      fullDescription: verification.description || null,
    };
  } catch (err) {
    // Don't kill the job if verification fails — just mark unverified
    return { ...job, verified: false, active: true };
  }
}

// ── 2. Company Brief (for daily digest) ───────────────────────────────────────

/**
 * Get a quick company brief for job digest
 * @param {string} company - Company name
 * @returns {Object} - Brief with rating, news headline, culture notes
 */
async function companyBrief(company) {
  try {
    const research = await runPython('crawl-company.py', [
      '--company', company,
      '--mode', 'research'
    ]);

    return {
      company,
      glassdoorRating: extractRating(research.glassdoor),
      recentNews: research.news?.news?.[0] || null,
      salaryData: research.salary?.salary?.dataPoints?.[0] || null,
    };
  } catch (err) {
    return { company, error: err.message };
  }
}

function extractRating(glassdoor) {
  if (!glassdoor?.glassdoor?.rawContent) return null;
  const match = glassdoor.glassdoor.rawContent.match(/(\d\.\d)\s*(?:out of 5|\/5|\s*stars)/i);
  return match ? parseFloat(match[1]) : null;
}

// ── 3. Interview Prep Package ─────────────────────────────────────────────────

/**
 * Full research package for interview prep
 * @param {string} company - Company name
 * @param {string} role - Job title
 * @param {string} careersUrl - Direct URL if known
 * @returns {Object} - Full research package
 */
async function interviewPrep(company, role = '', careersUrl = null) {
  console.log(`📚 Generating interview prep for ${role} at ${company}...`);

  const args = ['--company', company, '--mode', 'full'];
  if (careersUrl) args.push('--url', careersUrl);

  const research = await runPython('crawl-company.py', args);

  // Format into a WhatsApp-friendly prep message
  const sections = [];

  sections.push(`📚 *Interview Prep: ${company}*`);
  sections.push(`_Role: ${role || 'General'}_\n`);

  // Glassdoor rating
  const rating = extractRating(research.glassdoor);
  if (rating) {
    const stars = '⭐'.repeat(Math.round(rating));
    sections.push(`*Glassdoor Rating:* ${stars} ${rating}/5`);
  }

  // Recent news
  if (research.news?.news?.length > 0) {
    sections.push(`\n*Recent News:*`);
    research.news.news.slice(0, 3).forEach(n => sections.push(`• ${n}`));
  }

  // Salary data
  if (research.salary?.salary?.dataPoints?.length > 0) {
    sections.push(`\n*Compensation (Levels.fyi):*`);
    research.salary.salary.dataPoints.slice(0, 3).forEach(d => sections.push(`• ${d}`));
  }

  // Open roles
  if (research.careers?.jobs?.length > 0) {
    sections.push(`\n*Other Open Roles:*`);
    research.careers.jobs.slice(0, 5).forEach(j => sections.push(`• ${j}`));
  }

  sections.push(`\n*Interview Tips:*`);
  sections.push(`• Research their recent product launches/news above`);
  sections.push(`• Check Glassdoor reviews for culture insights`);
  sections.push(`• Prepare STAR stories for: leadership, conflict, failure`);
  sections.push(`• Have questions ready about their tech stack & roadmap`);

  return {
    company,
    role,
    message: sections.join('\n'),
    raw: research,
  };
}

// ── 4. Direct Career Page Scraper ─────────────────────────────────────────────

/**
 * Scrape a company's careers page for jobs matching user keywords
 * @param {string} company - Company name
 * @param {string[]} keywords - User's job keywords
 * @param {string} careersUrl - Optional direct URL
 */
async function scrapeCareerPage(company, keywords = [], careersUrl = null) {
  const args = ['--company', company, '--mode', 'careers'];
  if (careersUrl) args.push('--url', careersUrl);

  const result = await runPython('crawl-company.py', args);
  
  const matchingJobs = (result.jobs || []).filter(title =>
    keywords.some(kw => title.toLowerCase().includes(kw.toLowerCase()))
  );

  return {
    company,
    careersUrl: result.careersUrl,
    allJobs: result.jobs || [],
    matchingJobs,
    matchCount: matchingJobs.length,
  };
}

module.exports = {
  enrichJobs,
  companyBrief,
  interviewPrep,
  scrapeCareerPage,
};
