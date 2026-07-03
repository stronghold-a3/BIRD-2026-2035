// api/submit.js
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

// ============ CONFIGURATION ============
const GITHUB_OWNER = 'asilvainnovations';
const GITHUB_REPO = 'BIRD-2026-2035';
const GITHUB_BRANCH = 'main';
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://lydsisparsmvextskevw.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

// ============ VALIDATION ============
function validateSurveyData(data) {
  const errors = [];

  // Required demographics
  if (!data.demographics?.category) errors.push('Stakeholder category is required');
  if (!data.demographics?.province) errors.push('Province is required');
  if (!data.demographics?.expertise || data.demographics.expertise.length === 0) {
    errors.push('At least one expertise area is required');
  }

  // Required section responses (at least rating questions)
  if (!data.responses?.section1_beie?.understanding) errors.push('Section 1: Framework understanding is required');
  if (!data.responses?.section2_mg?.importance) errors.push('Section 2: Moral governance importance is required');
  if (!data.responses?.section3_foundations?.priorities || data.responses.section3_foundations.priorities.length === 0) {
    errors.push('Section 3: At least one priority is required');
  }
  if (!data.responses?.section4_transformers?.barrier) errors.push('Section 4: Barrier selection is required');
  if (!data.responses?.section5_enablers?.infra_rating) errors.push('Section 5: Infrastructure rating is required');
  if (!data.responses?.section6_connectors?.bimpeaga_importance) errors.push('Section 6: BIMP-EAGA importance is required');
  if (!data.responses?.section7_financiers?.criticality) errors.push('Section 7: Islamic finance criticality is required');
  if (!data.responses?.section8_options?.strategy) errors.push('Section 8: Strategy selection is required');

  // Optional: validate email format if provided
  if (data.demographics?.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.demographics.email)) {
    errors.push('Invalid email format');
  }

  // Consent required
  if (!data.consent) errors.push('Consent is required to submit');

  return errors;
}

// ============ SANITIZATION ============
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim()
    .substring(0, 2000);
}

function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(v => typeof v === 'string' ? sanitizeInput(v) : v);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

// ============ SCHEMA TRANSFORMATION ============
function transformToSchema(rawData, metadata) {
  const demographics = rawData.demographics || {};
  const responses = rawData.responses || {};

  return {
    responseId: uuidv4(),
    timestamp: new Date().toISOString(),
    metadata: {
      userAgent: metadata.userAgent,
      submissionDuration: metadata.duration,
      ipHash: metadata.ipHash,
      platform: metadata.platform,
      language: metadata.language,
    },
    demographics: {
      category: demographics.category || 'unknown',
      province: demographics.province || 'unknown',
      expertise: demographics.expertise || [],
      name: sanitizeInput(demographics.name || ''),
      email: sanitizeInput(demographics.email || ''),
      organization: sanitizeInput(demographics.organization || ''),
    },
    responses: {
      section1_BEIE: {
        understanding: responses.section1_beie?.understanding || null,
        relevance: responses.section1_beie?.relevance || null,
      },
      section2_MoralGovernance: {
        importance: responses.section2_mg?.importance || null,
        implementation: responses.section2_mg?.implementation || null,
        archetype: responses.section2_mg?.archetype || null,
        peace_milestones: responses.section2_mg?.peace_milestones || [],
      },
      section3_Foundations: {
        priorities: responses.section3_foundations?.priorities || [],
        feasibility: responses.section3_foundations?.feasibility || null,
        el_nino: {
          impact: responses.section3_foundations?.el_nino_impact || null,
          likelihood: responses.section3_foundations?.el_nino_likelihood || null,
        },
        pestalotiopsis: {
          impact: responses.section3_foundations?.pestalotiopsis_impact || null,
          likelihood: responses.section3_foundations?.pestalotiopsis_likelihood || null,
        },
        postharvest: {
          impact: responses.section3_foundations?.postharvest_impact || null,
          likelihood: responses.section3_foundations?.postharvest_likelihood || null,
        },
        limits_growth: responses.section3_foundations?.limits_growth || null,
      },
      section4_Transformers: {
        barrier: responses.section4_transformers?.barrier || null,
        halal_park: responses.section4_transformers?.halal_park || null,
        fixes_fail: responses.section4_transformers?.fixes_fail || null,
        commodity_impact: responses.section4_transformers?.commodity_impact || null,
        heds_ranking: responses.section4_transformers?.heds_ranking || [],
      },
      section5_Enablers: {
        infra_rating: responses.section5_enablers?.infra_rating || null,
        sectors: responses.section5_enablers?.sectors || [],
        broadband: responses.section5_enablers?.broadband || null,
        literacy: responses.section5_enablers?.literacy || null,
        stunting: responses.section5_enablers?.stunting || null,
        digital_divide: responses.section5_enablers?.digital_divide || null,
      },
      section6_Connectors: {
        bimpeaga_importance: responses.section6_connectors?.bimpeaga_importance || null,
        markets: responses.section6_connectors?.markets || [],
        export_target: responses.section6_connectors?.export_target || null,
        uae_feasibility: responses.section6_connectors?.uae_feasibility || null,
        perception: responses.section6_connectors?.perception || null,
      },
      section7_Financiers: {
        criticality: responses.section7_financiers?.criticality || null,
        instruments: responses.section7_financiers?.instruments || [],
        inclusion_target: responses.section7_financiers?.inclusion_target || null,
        asset_paradox: responses.section7_financiers?.asset_paradox || null,
        block_grant: responses.section7_financiers?.block_grant || null,
      },
      section8_StrategicOptions: {
        strategy: responses.section8_options?.strategy || null,
        sequencing: responses.section8_options?.sequencing || null,
        comments: sanitizeInput(responses.section8_options?.comments || ''),
      },
      section9_Budget: {
        realism: responses.section9_budget?.realism || null,
      },
      section10_Targets: {
        ambition: responses.section10_targets?.ambition || null,
        matrix: responses.section10_targets?.matrix || null,
      },
      section11_Equity: {
        affirmative: responses.section11_equity?.affirmative || null,
        mechanisms: responses.section11_equity?.mechanisms || [],
      },
      section12_Climate: {
        green_priority: responses.section12_climate?.green_priority || null,
        adaptation: responses.section12_climate?.adaptation || [],
      },
      section13_Policy: {
        legislation: responses.section13_policy?.legislation || [],
        bicc: responses.section13_policy?.bicc || null,
      },
      section16_CARE: {
        context: responses.section16_care?.context || null,
        action: responses.section16_care?.action || null,
        realtime: responses.section16_care?.realtime || null,
        evidence: responses.section16_care?.evidence || null,
        overall: responses.section16_care?.overall || null,
      },
    },
    consent: rawData.consent || false,
    computedMetrics: {
      resilienceIndex: null,
      riskScore: null,
      vulnerabilityIndex: null,
    },
    version: '3.0',
    source: 'BIRD Validation Survey v3 - 16 Section C.A.R.E. Framework',
  };
}

// ============ GITHUB STORAGE ============
async function storeToGitHub(data) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GitHub Token not configured');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const path = `data/responses/response_${data.responseId}_${timestamp}.json`;
  const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');

  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Add BIRD Survey Response: ${data.demographics.category} - ${data.demographics.province} (${data.responseId.substring(0, 8)})`,
        content,
        branch: GITHUB_BRANCH,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`GitHub API Error: ${error.message || 'Unknown error'}`);
  }

  return path;
}

// ============ SUPABASE FALLBACK ============
async function storeToSupabase(data) {
  if (!SUPABASE_KEY) {
    console.warn('Supabase key not configured, skipping fallback storage');
    return null;
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/survey_responses`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        response_id: data.responseId,
        timestamp: data.timestamp,
        category: data.demographics.category,
        province: data.demographics.province,
        organization: data.demographics.organization,
        data: data,
      }),
    });

    if (!response.ok) {
      throw new Error(`Supabase Error: ${response.status}`);
    }

    return 'supabase';
  } catch (error) {
    console.error('Supabase fallback failed:', error);
    return null;
  }
}

// ============ RATE LIMITING (Simple IP-based) ============
const submissionTracker = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const maxSubmissions = 5; // Max 5 per hour per IP

  if (!submissionTracker.has(ip)) {
    submissionTracker.set(ip, []);
  }

  const submissions = submissionTracker.get(ip);
  const recentSubmissions = submissions.filter(t => now - t < windowMs);

  if (recentSubmissions.length >= maxSubmissions) {
    return false;
  }

  recentSubmissions.push(now);
  submissionTracker.set(ip, recentSubmissions);
  return true;
}

// ============ MAIN HANDLER ============
export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // 1. Rate limiting
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const ipHash = crypto.createHash('sha256').update(clientIp).digest('hex').substring(0, 16);

    if (!checkRateLimit(ipHash)) {
      return res.status(429).json({
        message: 'Rate limit exceeded. Please try again later.'
      });
    }

    // 2. Extract and validate data
    const { surveyData, metadata = {} } = req.body;

    if (!surveyData) {
      return res.status(400).json({ message: 'No survey data provided' });
    }

    const validationErrors = validateSurveyData(surveyData);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // 3. Enrich metadata
    const enrichedMetadata = {
      ...metadata,
      userAgent: req.headers['user-agent'] || 'unknown',
      ipHash,
      platform: req.headers['sec-ch-ua-platform'] || 'unknown',
      language: req.headers['accept-language'] || 'unknown',
    };

    // 4. Transform to clean schema
    const structuredData = transformToSchema(surveyData, enrichedMetadata);

    // 5. Store to GitHub (primary)
    let storageResult;
    try {
      const githubPath = await storeToGitHub(structuredData);
      storageResult = { primary: 'github', path: githubPath };
    } catch (githubError) {
      console.error('GitHub storage failed, attempting Supabase fallback:', githubError);

      // 6. Fallback to Supabase
      const supabaseResult = await storeToSupabase(structuredData);
      if (supabaseResult) {
        storageResult = { primary: 'supabase', fallback: true };
      } else {
        throw new Error('Both GitHub and Supabase storage failed');
      }
    }

    // 7. Success response
    res.status(200).json({
      message: 'Survey response stored successfully',
      responseId: structuredData.responseId,
      storage: storageResult,
      timestamp: structuredData.timestamp,
    });

  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({
      message: 'Error processing submission',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
}
