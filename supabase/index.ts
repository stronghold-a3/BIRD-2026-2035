// ─────────────────────────────────────────────────────────────────────────────
// BIRD 2026–2035 · crm-dispatcher Edge Function v1.1
// FIXES vs v1.0:
//   • PROJECT_ID and BUILDER_URL sourced from env vars (not hardcoded)
//   • Added CORS headers (missing in v1.0)
//   • Added request body size cap (10 KB)
//   • Added input sanitization on contact fields
//   • Graceful fallback when CRM env vars not configured
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'X-Content-Type-Options':       'nosniff',
};

const MAX_BODY_BYTES = 10 * 1024; // 10 KB — CRM payloads should be small

// ── CRM config (env-var backed) ───────────────────────────────────────────────
const BUILDER_URL  = Deno.env.get('CRM_BUILDER_URL')  ?? '';
const PROJECT_ID   = Deno.env.get('CRM_PROJECT_ID')   ?? '';
const CRM_API_KEY  = Deno.env.get('CRM_API_KEY')      ?? '';

// ── Supabase ──────────────────────────────────────────────────────────────────
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...CORS } });

// ── Input sanitizer ───────────────────────────────────────────────────────────
const sanitize = (v: unknown, maxLen = 500): string =>
  typeof v === 'string' ? v.trim().slice(0, maxLen) : '';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  if (req.method !== 'POST') return json({ success: false, error: 'Method not allowed' }, 405);

  try {
    // Auth check
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } },
    );
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session?.user) return json({ success: false, error: 'Unauthorized' }, 401);

    // Body size check
    const contentLen = Number(req.headers.get('content-length') ?? '0');
    if (contentLen > MAX_BODY_BYTES)
      return json({ success: false, error: 'Payload too large (max 10 KB)' }, 413);

    let body: Record<string, unknown>;
    try { body = await req.json(); } catch { return json({ success: false, error: 'Invalid JSON' }, 400); }

    const { action, contact } = body as {
      action: string;
      contact?: Record<string, unknown>;
    };

    if (!action)   return json({ success: false, error: 'Missing field: action' }, 400);
    if (!contact)  return json({ success: false, error: 'Missing field: contact' }, 400);

    // Validate contact fields
    const email     = sanitize(contact.email);
    const firstName = sanitize(contact.firstName ?? contact.first_name, 100);
    const lastName  = sanitize(contact.lastName  ?? contact.last_name,  100);
    const phone     = sanitize(contact.phone, 30);
    const org       = sanitize(contact.organization, 200);

    if (!email || !EMAIL_RE.test(email))
      return json({ success: false, error: 'Invalid or missing contact email' }, 400);

    // Graceful fallback if CRM not configured
    if (!BUILDER_URL || !PROJECT_ID) {
      console.warn('[crm-dispatcher] CRM_BUILDER_URL or CRM_PROJECT_ID not configured — logging to Supabase only');
      await supabase.from('crm_contacts').upsert({
        email,
        first_name: firstName,
        last_name:  lastName,
        phone,
        organization: org,
        source: 'BIRD-2026-2035',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' }).then(({ error }) => {
        if (error) console.error('[crm-dispatcher] Supabase fallback error:', error.message);
      });
      return json({ success: true, mode: 'supabase_only', note: 'CRM not configured' });
    }

    // Forward to CRM builder
    const payload: Record<string, unknown> = {
      projectId:    PROJECT_ID,
      action,
      contact: { email, firstName, lastName, phone, organization: org },
    };

    const crmRes = await fetch(BUILDER_URL, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': CRM_API_KEY ? `Bearer ${CRM_API_KEY}` : '',
      },
      body: JSON.stringify(payload),
    });

    if (!crmRes.ok) {
      const errText = await crmRes.text().catch(() => '');
      console.error('[crm-dispatcher] CRM error:', crmRes.status, errText.substring(0, 300));
      return json({ success: false, error: `CRM service error (${crmRes.status})` }, 502);
    }

    const crmData = await crmRes.json().catch(() => ({}));
    return json({ success: true, data: crmData });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[crm-dispatcher] Unhandled error:', msg);
    return json({ success: false, error: 'Internal error' }, 500);
  }
});
