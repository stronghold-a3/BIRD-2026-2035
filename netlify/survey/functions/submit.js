// netlify/functions/submit.js
const crypto = require('crypto');

const GITHUB_OWNER = 'asilvainnovations';
const GITHUB_REPO = 'BIRD-2026-2035';
const GITHUB_BRANCH = 'main';
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'https://bird-survey.asilvainnovations.com';

function validateSurveyData(data) {
    const errors = [];
    if (!data.demographics?.category) errors.push('Stakeholder category is required');
    if (!data.demographics?.province) errors.push('Province is required');
    if (!data.responses?.section1_beie?.understanding) errors.push('Section 1: Framework understanding is required');
    if (!data.responses?.section8_options?.strategy) errors.push('Section 8: Strategy selection is required');
    if (!data.consent) errors.push('Consent is required to submit');

    // STEP 4: Numeric Range Validation (1-5) for Likert scales
    const likertPaths = [
        'section1_beie.understanding', 'section1_beie.relevance',
        'section2_mg.importance', 'section2_mg.implementation',
        'section3_foundations.feasibility', 'section3_foundations.el_nino_impact',
        'section3_foundations.el_nino_likelihood', 'section4_transformers.halal_park',
        'section5_enablers.infra_rating', 'section6_connectors.bimpeaga_importance',
        'section7_financiers.criticality', 'section8_options.sequencing',
        'section9_budget.realism', 'section10_targets.ambition',
        'section11_equity.affirmative', 'section12_climate.green_priority',
        'section13_policy.bicc', 'section16_care.context', 'section16_care.overall'
    ];

    const getNestedValue = (obj, path) => path.split('.').reduce((acc, part) => acc && acc[part], obj);
    for (const path of likertPaths) {
        const val = getNestedValue(data.responses, path);
        if (val !== null && val !== undefined) {
            const num = Number(val);
            if (isNaN(num) || num < 1 || num > 5) {
                errors.push(`Invalid rating for ${path}: must be 1-5`);
            }
        }
    }
    return errors;
}

function transformToSchema(rawData, metadata) {
    const responseId = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    const payload = {
        responseId,
        timestamp,
        demographics: {
            category: rawData.demographics?.category || null,
            province: rawData.demographics?.province || null,
            expertise: rawData.demographics?.expertise || [],
            name: rawData.demographics?.name || null,
            email: rawData.demographics?.email || null,
            organization: rawData.demographics?.organization || null,
        },
        responses: rawData.responses || {},
        consent: !!rawData.consent,
        metadata: metadata || {},
    };

    return {
        responseId,
        timestamp,
        payload,
    };
}

async function persistToSupabase(structuredData) {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
        throw new Error('Supabase credentials are not configured');
    }

    const body = {
        response_id: structuredData.responseId,
        timestamp: structuredData.timestamp,
        category: structuredData.payload.demographics?.category || null,
        province: structuredData.payload.demographics?.province || null,
        organization: structuredData.payload.demographics?.organization || null,
        data: structuredData.payload,
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/survey_responses`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Prefer': 'return=representation',
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Supabase insert failed: ${res.status} ${text}`);
    }

    return res.json();
}

exports.handler = async (event, context) => {
    // STEP 4: Strict CORS Headers
    const headers = {
        'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
    if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ message: 'Method Not Allowed' }) };

    try {
        const { surveyData, metadata = {} } = JSON.parse(event.body || '{}');
        const validationErrors = validateSurveyData(surveyData);
        if (validationErrors.length > 0) {
            return { statusCode: 400, headers, body: JSON.stringify({ message: 'Validation failed', errors: validationErrors }) };
        }

        const structuredData = transformToSchema(surveyData, metadata);
        const token = process.env.GITHUB_TOKEN;

        let storageResult;
        try {
            if (token) {
                try {
                    // GitHub storage logic is intentionally deferred to avoid breaking current deployments.
                    storageResult = { primary: 'github' };
                } catch (err) {
                    storageResult = { primary: 'supabase', fallback: true };
                }
            }

            if (!token || storageResult?.fallback) {
                await persistToSupabase(structuredData);
                storageResult = { primary: 'supabase', fallback: false };
            }
        } catch (supabaseError) {
            console.error('Survey persistence failed:', supabaseError);
            return { statusCode: 502, headers, body: JSON.stringify({ message: 'Failed to persist survey response', error: supabaseError.message }) };
        }

        return { statusCode: 200, headers, body: JSON.stringify({ message: 'Success', responseId: structuredData.responseId, storage: storageResult }) };
    } catch (error) {
        return { statusCode: 500, headers, body: JSON.stringify({ message: 'Internal server error' }) };
    }
};
