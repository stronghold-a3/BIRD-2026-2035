// ─────────────────────────────────────────────────────────────────────────────
// BIRD 2026–2035 · email-notifications Edge Function v4.1
// FIXES vs v4.0:
//   • Queries user_profiles (not the non-existent 'users' table)
//   • Added CORS headers (v4.0 had NONE — all browser POSTs silently failed)
//   • FROM_EMAIL / SITE_URL sourced from env vars with fallbacks
//   • Updated all branding URLs to BIRD 2026–2035 (removed strategicplannerpro.com)
//   • Added 'kpi_alert' and 'weekly_digest' notification types
//   • Input validation on user_id (UUID format check)
//   • Non-blocking email send with timeout
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'X-Content-Type-Options':       'nosniff',
};

// ── Config (env-var backed) ───────────────────────────────────────────────────
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
const FROM_EMAIL     = Deno.env.get('FROM_EMAIL')     ?? 'noreply@bird2026.barmm.gov.ph';
const SITE_URL       = Deno.env.get('SITE_URL')       ?? 'https://asilvainnovations.github.io/barmm-investment-roadmap/';
const USER_MANUAL    = Deno.env.get('USER_MANUAL_URL') ?? 'https://asilvainnovations.github.io/strat-planner-pwa/user-manual.html';

// ── Supabase (primary data project) ──────────────────────────────────────────
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...CORS } });

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ── Email templates ───────────────────────────────────────────────────────────
function buildEmailHTML(type: string, data: Record<string, unknown>): { subject: string; html: string } | null {
  const userName = (data.full_name as string | undefined) || 'Strategic Partner';

  const wrapper = (subject: string, body: string) => ({
    subject,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${subject}</title>
  <style>
    body { margin: 0; padding: 0; background: #0a1628; font-family: 'DM Sans', Arial, sans-serif; color: #ecfdf5; }
    .container { max-width: 600px; margin: 0 auto; padding: 32px 16px; }
    .card { background: #022c22; border: 1px solid rgba(201,168,76,0.3); border-radius: 16px; padding: 32px; }
    .logo-row { text-align: center; margin-bottom: 24px; }
    .logo-row img { width: 64px; height: 64px; border-radius: 50%; border: 2px solid rgba(201,168,76,0.4); }
    .badge { display: inline-block; background: rgba(201,168,76,0.12); border: 1px solid rgba(201,168,76,0.5); color: #C9A84C; border-radius: 99px; padding: 4px 14px; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 16px; }
    h1 { color: #E8C560; font-size: 24px; font-weight: 800; margin: 0 0 8px; line-height: 1.2; }
    p { color: rgba(236,253,245,0.75); font-size: 15px; line-height: 1.6; margin: 12px 0; }
    .btn { display: inline-block; background: linear-gradient(135deg, #065f46, #047857); color: #E8C560 !important; border: 1px solid rgba(201,168,76,0.5); border-radius: 10px; padding: 14px 28px; font-size: 14px; font-weight: 700; text-decoration: none; margin: 16px 0; }
    .footer { text-align: center; margin-top: 24px; font-size: 11px; color: rgba(236,253,245,0.3); }
    .divider { border: none; border-top: 1px solid rgba(201,168,76,0.2); margin: 24px 0; }
    .kpi-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(201,168,76,0.1); }
    .kpi-label { font-size: 13px; color: rgba(236,253,245,0.6); }
    .kpi-val { font-size: 13px; font-weight: 700; color: #C9A84C; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo-row">
        <img src="https://rgvteytgkugdqdodedxq.databasepad.com/storage/v1/object/public/bird-images/public/MTIT%20Logo.webp" alt="BOI-MTIT BARMM" />
        <div style="margin-top:8px; font-size:11px; color:rgba(201,168,76,0.7); font-weight:700; letter-spacing:1px; text-transform:uppercase;">BOI-MTIT · BARMM</div>
      </div>
      ${body}
      <hr class="divider" />
      <div class="footer">
        <p style="margin:0;">BIRD 2026–2035 · Bureau of Investments – MTIT, BARMM</p>
        <p style="margin:4px 0 0;">If you did not create this account, you can safely ignore this email.</p>
      </div>
    </div>
  </div>
</body>
</html>`,
  });

  switch (type) {
    case 'welcome':
      return wrapper(
        'Welcome to BIRD 2026–2035 — Your Strategic Workspace is Ready',
        `<div class="badge">Welcome</div>
        <h1>As-salamu alaykum, ${userName}! 🌿</h1>
        <p>Your account on the <strong style="color:#E8C560;">BIRD 2026–2035 Platform</strong> is now active. This is the official strategic planning workspace for the Bangsamoro Investment Roadmap Development.</p>
        <p>You now have access to:</p>
        <ul style="color:rgba(236,253,245,0.75); padding-left:20px; line-height:2;">
          <li>MEL Dashboard — 5 monitoring panels</li>
          <li>AI-powered SWOT Analysis with RI scoring</li>
          <li>Systems Thinking & Causal Loop Diagram builder</li>
          <li>TOWS Strategy Matrix</li>
          <li>Balanced Scorecard (4 perspectives)</li>
          <li>PAPs Management with BEIE cluster alignment</li>
          <li>BIRD AI Strategy Assistant — GPT-4o powered</li>
        </ul>
        <div style="text-align:center;">
          <a href="${SITE_URL}" class="btn">Open My Strategic Workspace →</a>
        </div>
        <p style="font-size:13px; text-align:center;">
          <a href="${USER_MANUAL}" style="color:#C9A84C;">Read the User Manual</a>
        </p>`,
      );

    case 'share':
      return wrapper(
        `${data.sharer_name ?? 'A colleague'} shared a BIRD 2026–2035 strategic plan with you`,
        `<div class="badge">Plan Shared</div>
        <h1>A plan has been shared with you</h1>
        <p><strong style="color:#E8C560;">${data.sharer_name ?? 'A colleague'}</strong> has shared the strategic plan <em>"${data.plan_name ?? 'BIRD Strategic Plan'}"</em> with you on the BIRD 2026–2035 Platform.</p>
        <div style="text-align:center;">
          <a href="${data.share_url ?? SITE_URL}" class="btn">View Shared Plan →</a>
        </div>
        <p style="font-size:13px; color:rgba(236,253,245,0.5); text-align:center;">This link allows view-only access. Sign in to create your own strategic plans.</p>`,
      );

    case 'kpi_alert':
      return wrapper(
        `⚠️ KPI Alert — ${data.kpi_name ?? 'A KPI'} is behind target`,
        `<div class="badge" style="background:rgba(239,68,68,0.12); border-color:rgba(239,68,68,0.4); color:#ef4444;">KPI Alert</div>
        <h1 style="color:#fca5a5;">KPI Behind Target</h1>
        <p>Hi ${userName}, the following KPI in your BIRD 2026–2035 plan requires attention:</p>
        <div style="background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.3); border-radius:10px; padding:16px; margin:16px 0;">
          <div class="kpi-row"><span class="kpi-label">KPI</span><span class="kpi-val">${data.kpi_name ?? 'N/A'}</span></div>
          <div class="kpi-row"><span class="kpi-label">Current Value</span><span class="kpi-val" style="color:#fca5a5;">${data.current_value ?? 'N/A'}</span></div>
          <div class="kpi-row"><span class="kpi-label">2030 Target</span><span class="kpi-val">${data.target_2030 ?? 'N/A'}</span></div>
          <div class="kpi-row"><span class="kpi-label">2035 Target</span><span class="kpi-val">${data.target_2035 ?? 'N/A'}</span></div>
          <div class="kpi-row"><span class="kpi-label">BSC Perspective</span><span class="kpi-val">${data.perspective ?? 'N/A'}</span></div>
        </div>
        <div style="text-align:center;">
          <a href="${SITE_URL}" class="btn">Review My Dashboard →</a>
        </div>`,
      );

    case 'weekly_digest':
      return wrapper(
        `BIRD 2026–2035 Weekly Strategy Digest — ${new Date().toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric' })}`,
        `<div class="badge">Weekly Digest</div>
        <h1>Your Weekly Strategy Update</h1>
        <p>Hi ${userName}, here's your BIRD 2026–2035 weekly strategy summary:</p>
        <div style="background:rgba(6,78,59,0.3); border:1px solid rgba(201,168,76,0.3); border-radius:10px; padding:16px; margin:16px 0;">
          <div class="kpi-row"><span class="kpi-label">Plans Active</span><span class="kpi-val">${data.plan_count ?? 0}</span></div>
          <div class="kpi-row"><span class="kpi-label">KPIs On Track</span><span class="kpi-val" style="color:#10b981;">${data.on_track ?? 0}</span></div>
          <div class="kpi-row"><span class="kpi-label">KPIs At Risk</span><span class="kpi-val" style="color:#f59e0b;">${data.at_risk ?? 0}</span></div>
          <div class="kpi-row"><span class="kpi-label">PAPs In Progress</span><span class="kpi-val">${data.paps_in_progress ?? 0}</span></div>
        </div>
        <div style="text-align:center;">
          <a href="${SITE_URL}" class="btn">Open My Dashboard →</a>
        </div>`,
      );

    default:
      return null;
  }
}

// ── Main handler ──────────────────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  if (req.method !== 'POST') return json({ success: false, error: 'Method not allowed' }, 405);

  try {
    let body: Record<string, unknown>;
    try { body = await req.json(); } catch { return json({ success: false, error: 'Invalid JSON' }, 400); }

    const { type, user_id, metadata = {} } = body as {
      type: string;
      user_id: string;
      metadata?: Record<string, unknown>;
    };

    if (!type)    return json({ success: false, error: 'Missing field: type' }, 400);
    if (!user_id) return json({ success: false, error: 'Missing field: user_id' }, 400);
    if (!UUID_RE.test(user_id)) return json({ success: false, error: 'Invalid user_id format' }, 400);

    if (!RESEND_API_KEY) {
      console.warn('[email-notifications] RESEND_API_KEY not set — email skipped');
      return json({ success: true, skipped: true, reason: 'Email service not configured' });
    }

    // Fetch user profile — FIXED: was querying 'users' which doesn't exist
    const { data: profile, error: profileErr } = await supabase
      .from('user_profiles')          // ← was 'users' in v4.0 — FIXED
      .select('email, full_name, notification_preferences')
      .eq('id', user_id)
      .maybeSingle();

    if (profileErr || !profile?.email) {
      console.error('[email-notifications] Profile fetch failed:', profileErr?.message);
      return json({ success: false, error: 'User profile not found' }, 404);
    }

    // Check notification preferences
    const prefs = (profile.notification_preferences ?? {}) as Record<string, boolean>;
    const prefKey: Record<string, string> = {
      welcome:      'welcome_email',
      share:        'team_mentions',
      kpi_alert:    'kpi_alerts',
      weekly_digest: 'weekly_digest',
    };
    if (prefKey[type] && prefs[prefKey[type]] === false) {
      return json({ success: true, skipped: true, reason: 'User preference disabled' });
    }

    const emailData = { full_name: profile.full_name, ...metadata };
    const template  = buildEmailHTML(type, emailData);
    if (!template) return json({ success: false, error: `Unknown notification type: ${type}` }, 400);

    // Send via Resend with 8-second timeout
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);

    try {
      const sendRes = await fetch('https://api.resend.com/emails', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_API_KEY}` },
        body: JSON.stringify({
          from:    `BIRD 2026–2035 <${FROM_EMAIL}>`,
          to:      [profile.email],
          subject: template.subject,
          html:    template.html,
        }),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!sendRes.ok) {
        const errBody = await sendRes.text().catch(() => 'unknown');
        console.error('[email-notifications] Resend error:', sendRes.status, errBody.substring(0, 200));
        return json({ success: false, error: `Email send failed (${sendRes.status})` }, 502);
      }
    } catch (e: unknown) {
      clearTimeout(timer);
      if (e instanceof Error && e.name === 'AbortError')
        return json({ success: false, error: 'Email send timed out' }, 504);
      throw e;
    }

    return json({ success: true, type, recipient: profile.email });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[email-notifications] Unhandled error:', msg);
    return json({ success: false, error: 'Internal error' }, 500);
  }
});
