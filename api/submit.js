// api/submit.js
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

// ============ CONFIGURATION ============
const GITHUB_OWNER = 'asilvainnovations';
const GITHUB_REPO = 'BIRD-2026-2035';
const GITHUB_BRANCH = 'main'; // Change to 'master' if needed
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://lydsisparsmvextskevw.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

// ============ VALIDATION ============
function validateSurveyData(data) {
  const errors = [];
  
  // Required demographics
  if (!data.name?.trim()) errors.push('Name is required');
  if (!data.email?.trim()) errors.push('Email is required');
  if (!data.organization?.trim()) errors.push('Organization is required');
  if (!data.sector) errors.push('Sector is required');
  if (!data.province) errors.push('Province is required');
  
  // Required survey responses (at least one from each section)
  const requiredQuestions = [
    'q1_1', 'q1_2',  // Section 1
    'q2_1', 'q2_2',  // Section 2
    'q3_1',          // Section 3
    'q4_1',          // Section 4
    'q5_1',          // Section 5
    'q6_1',          // Section 6
    'q7_1',          // Section 7
    'q8_1',          // Section 8
  ];
  
  requiredQuestions.forEach(q => {
    if (data[q] === undefined || data[q] === null) {
      errors.push(`Question ${q} is required`);
    }
  });
  
  // Email format
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Invalid email format');
  }
  
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
    .substring(0, 2000); // Limit length
}

// ============ SCHEMA TRANSFORMATION ============
function transformToSchema(rawData, metadata) {
  // Extract checkbox arrays (e.g., q3_2, q4_2, etc.)
  const extractCheckboxArray = (prefix) => {
    const values = [];
    Object.keys(rawData).forEach(key => {
      if (key.startsWith(`${prefix}_`) && rawData[key]) {
        values.push(rawData[key]);
      }
    });
    return values;
  };
  
  return {
    responseId: uuidv4(),
    timestamp: new Date().toISOString(),
    metadata: {
      userAgent: metadata.userAgent,
      submissionDuration: metadata.duration,
      ipHash: metadata.ipHash,
      platform: metadata.platform,
    },
    demographics: {
      name: sanitizeInput(rawData.name),
      email: sanitizeInput(rawData.email),
      organization: sanitizeInput(rawData.organization),
      position: sanitizeInput(rawData.position),
      sector: rawData.sector,
      province: rawData.province,
    },
    responses: {
      section1_BEIE: {
        frameworkUnderstanding: parseInt(rawData.q1_1),
        frameworkRelevance: parseInt(rawData.q1_2),
      },
      section2_MoralGovernance: {
        importance: parseInt(rawData.q2_1),
        feasibility: parseInt(rawData.q2_2),
      },
      section3_Foundations: {
        currentState: parseInt(rawData.q3_1),
        priorities: extractCheckboxArray('q3_2'),
      },
      section4_Transformers: {
        halalImportance: parseInt(rawData.q4_1),
        manufacturingPriorities: extractCheckboxArray('q4_2'),
      },
      section5_Enablers: {
        infrastructureRating: parseInt(rawData.q5_1),
        investmentNeeds: extractCheckboxArray('q5_2'),
      },
      section6_Connectors: {
        bimpEagaImportance: parseInt(rawData.q6_1),
        exportMarkets: extractCheckboxArray('q6_2'),
      },
      section7_Financiers: {
        islamicFinanceImportance: parseInt(rawData.q7_1),
        financialServices: extractCheckboxArray('q7_2'),
      },
      section8_StrategicOptions: {
        preferredStrategy: rawData.q8_1,
        sequencingRating: parseInt(rawData.q8_2) || null,
        comments: sanitizeInput(rawData.q8_3),
      },
    },
    computedMetrics: {
      // Reserved for future SWOT/CLD calculations
      resilienceIndex: null,
      riskScore: null,
      vulnerabilityIndex: null,
    },
    version: '2.1',
    source: 'BIRD Validation Survey v2',
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
        message: `Add BIRD Survey Response: ${data.demographics.sector} - ${data.demographics.province} (${data.responseId.substring(0, 8)})`,
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
        sector: data.demographics.sector,
        province: data.demographics.province,
        organization: data.demographics.organization,
        data: data, // Full JSONB storage
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
  const maxSubmissions = 3; // Max 3 per hour per IP
  
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
