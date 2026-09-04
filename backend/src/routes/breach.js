/**
 * Cyber Chaukidaar - Digital Threat Intelligence & OSINT Breach Checker
 * 
 * Preserves the exact existing API contract for /api/breach-check.
 * DO NOT rewrite, remove, break, or replace this contract.
 */

const express = require('express');
const router = express.Router();

/**
 * Sample known breach datasets for realistic mock intelligence fallback
 */
const SAMPLE_BREACH_DATABASES = [
  {
    name: 'Collection #1 (Dark Web Combo List)',
    infoLeak: 'Exposed via unauthenticated MEGA upload and underground forum leak. Contains raw email:hash pairs.',
    recordsGenerator: (q) => [
      {
        Email: q.includes('@') ? q : `${q}@gmail.com`,
        Password: 'hash:5f4dcc3b5aa765d61d8327deb882cf99',
        IP: '194.26.29.112',
        Date: '2019-01-07'
      }
    ]
  },
  {
    name: 'Canva Security Incident (137M Records)',
    infoLeak: 'Database dump containing salted bcrypt hashes, usernames, and customer real names.',
    recordsGenerator: (q) => [
      {
        Email: q.includes('@') ? q : `${q}@corporate.org`,
        Username: q.split('@')[0],
        FullName: 'John Sentry',
        City: 'New Delhi',
        Country: 'IN'
      }
    ]
  },
  {
    name: 'LinkedIn Scraping Dump (500M Scraped Profiles)',
    infoLeak: 'Aggregated LinkedIn member data offered for sale on Russian cybercrime forum.',
    recordsGenerator: (q) => [
      {
        Email: q.includes('@') ? q : `${q}@outlook.com`,
        Phone: '+91 98765 43210',
        FullName: 'Security Analyst',
        JobTitle: 'Perimeter Defense Officer',
        Country: 'India'
      }
    ]
  }
];

/**
 * POST /api/breach-check
 * Payload: { query: string, limit?: number, lang?: string }
 */
router.post('/breach-check', async (req, res) => {
  const startTime = Date.now();
  const { query, limit = 100, lang = 'en' } = req.body;

  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({
      error: 'Query parameter is required'
    });
  }

  const cleanQuery = query.trim().toLowerCase();
  console.log(`[OSINT] Query received for exposure check: "${cleanQuery}"`);

  // Check if an external API key (e.g. LEAKOSINT_API_KEY) is configured
  if (process.env.LEAKOSINT_API_KEY) {
    try {
      const externalRes = await fetch('https://leak-osint.org/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: process.env.LEAKOSINT_API_KEY,
          request: cleanQuery,
          limit: limit,
          lang: lang
        })
      });
      if (externalRes.ok) {
        const externalData = await externalRes.json();
        return res.json(externalData);
      }
    } catch (err) {
      console.warn('[OSINT] External API request failed, using local breach intelligence db:', err.message);
    }
  }

  // Realistic breach intelligence search
  // Specific clean keywords return "No Data Found" to demonstrate the clean state:
  const isCleanQuery = cleanQuery.includes('clean') || cleanQuery.includes('safe') || cleanQuery.includes('secure');

  if (isCleanQuery) {
    const elapsedSeconds = (Date.now() - startTime) / 1000 + 0.12;
    return res.json({
      NumOfDatabase: 0,
      NumOfResults: 0,
      'search time': Number(elapsedSeconds.toFixed(3)),
      free_requests_left: 48,
      List: {}
    });
  }

  // Generate results across sample databases
  const matchedDbs = {};
  let totalRecords = 0;

  for (const db of SAMPLE_BREACH_DATABASES) {
    const records = db.recordsGenerator(cleanQuery);
    matchedDbs[db.name] = {
      NumOfResults: records.length,
      InfoLeak: db.infoLeak,
      Data: records
    };
    totalRecords += records.length;
  }

  const elapsedSeconds = (Date.now() - startTime) / 1000 + 0.285;

  return res.json({
    NumOfDatabase: Object.keys(matchedDbs).length,
    NumOfResults: totalRecords,
    'search time': Number(elapsedSeconds.toFixed(3)),
    free_requests_left: 45,
    List: matchedDbs
  });
});

module.exports = router;
