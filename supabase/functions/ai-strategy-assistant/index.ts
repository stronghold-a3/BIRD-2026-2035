// ─── BIRD 2026-2035 — AI STRATEGY ASSISTANT EDGE FUNCTION v2.1 ───────────────
// Domain-expert AI for the Bangsamoro Investment Roadmap Development (BIRD)
// 2026-2035 — investment, strategic thinking, systems thinking, BARMM context.
// Deployed on: rgvteytgkugdqdodedxq.databasepad.com (Supabase Edge Runtime)
// Data target: lydsisparsmvextskevw.supabase.co

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ─── CORS ─────────────────────────────────────────────────────────────────────
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// ─── SUPABASE (primary data project) ─────────────────────────────────────────
// NOTE: This edge function is hosted on project rgvteytgkugdqdodedxq but writes
// data to the primary project lydsisparsmvextskevw via explicit URL overrides.
const SUPABASE_DATA_URL = 'https://lydsisparsmvextskevw.supabase.co';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(SUPABASE_DATA_URL, supabaseServiceKey);

// ─── OpenAI Configuration ─────────────────────────────────────────────────────
// Env var name in Supabase secrets dashboard: OPENAI_API_KEY
// (Supabase env var names cannot contain hyphens — use underscore form)
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_MODEL  = 'gpt-4o';

// ─── Platform Constants ───────────────────────────────────────────────────────
const PLATFORM_NAME = 'BIRD 2026-2035';
const PLATFORM_LOGO = 'https://rgvteytgkugdqdodedxq.databasepad.com/storage/v1/object/public/bird-images/public/MTIT%20Logo.webp';

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function fetchPlanFromDB(planId: string) {
  if (!planId) return null;
  const { data, error } = await supabase
    .from('strategic_plans')
    .select('*')
    .eq('id', planId)
    .single();
  if (error) { console.error('Supabase fetch error:', error.message); return null; }
  return data;
}

async function logAIInteraction(
  planId: string | null,
  action: string,
  input: unknown,
  output: unknown,
) {
  if (!planId) return;
  await supabase
    .from('ai_interaction_logs')
    .insert({
      plan_id: planId,
      action,
      input_data: input,
      output_data: output,
      created_at: new Date().toISOString(),
    })
    .then(({ error }) => { if (error) console.warn('AI log error (non-fatal):', error.message); });
}

const jsonResponse = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
const errorResponse = (error: string, status = 400) =>
  jsonResponse({ success: false, error }, status);

const sStr = (v: unknown, n = 5000) =>
  typeof v === 'string' ? v.substring(0, n).trim() : '';
const sArr = <T>(a: unknown, n = 50): T[] =>
  Array.isArray(a) ? (a as T[]).slice(0, n) : [];

// ─── BIRD 2026-2035 Expert Context ────────────────────────────────────────────
const BIRD_CONTEXT = `
══════════════════════════════════════════════════════════════════════════════
BIRD 2026-2035 — BANGSAMORO INVESTMENT ROADMAP (OFFICIAL KNOWLEDGE BASE)
Published by: Bureau of Investments – Ministry of Trade, Investments and Tourism
              (BOI-MTIT), Bangsamoro Autonomous Region in Muslim Mindanao (BARMM)
══════════════════════════════════════════════════════════════════════════════

▌REGIONAL PROFILE (Verified Data)
• Population: 5.69M (PSA, 2025)
• GRDP: ₱299.5B (2024); Growth: 2.7% (2024) vs 4.0% (2022-2023)
• Sectoral shares: Services 42.0% | AFF 32.4% | Industry 25.6% (MFBM, 2025)
• Poverty incidence: 34.8% (1H 2023), down from 55.9% in 2018 — a 21.1pp improvement
• Investment approvals: ₱5.1B (Q1 2026) — structural improvement, BBOI 2026
• Provinces: Lanao del Sur, Maguindanao del Norte, Maguindanao del Sur, Basilan,
  Sulu, Tawi-Tawi, Special Geographic Area (SGA)

▌PROVINCIAL ECONOMIC SNAPSHOT
• Maguindanao del Norte: Fastest growing (4.1%, 2024); GDP ₱81.91B; Services 53%
• Lanao del Sur: 4.0% (2024); Agus hydro cascade; DoleFil ₱306M pineapple facility
• Basilan: ASG-free since June 2024 (PIA, 2025) — investment normalization underway
• Tawi-Tawi: 1.1% growth; seaweed, fisheries, BIMP-EAGA proximity advantages
• Sulu: 1.13% growth; underinvestment despite strategic location
• → Island provinces exhibit "Success to the Successful" archetype vs mainland

▌BEIE FRAMEWORK (Bangsamoro Economic and Investment Ecosystem)
Organizes BARMM into 5 interconnected investment clusters:
1. FOUNDATIONS: Agriculture, Fisheries, Forestry, Energy, Environment
   - Key: ZBIP (₱6.67B), Agus hydro, rubber, coconut, seaweed, aquaculture
   - Problem: AFF contracted 4.2% (2024); post-harvest losses 20-40%
2. TRANSFORMERS: Industry, Manufacturing, Logistics, Halal Processing
   - Key: Bangsamoro Halal Park (Matanog), BHB → OIC/SMIIC accreditation
   - Market: Global halal market = USD 2.3 trillion
3. ENABLERS: Infrastructure, Social Services & Protection, Health
   - Key: BEGMP (1-day digital registration), ZBIP, TESDA alignment
   - Gap: 25-30% no electricity; <30% broadband; 59.3% functional literacy
4. CONNECTORS: Tourism, Digital Connectivity, Trade, BIMP-EAGA
   - Key: UAE/GCC halal corridor; BIMP-EAGA EGL Sub-Committee Plan 2025-2028
5. FINANCIERS: Islamic Banking, Waqf, Takaful, Microfinance
   - Key: Al-Amanah expansion; RA 11439 (Islamic Banking Law)
   - Gap: Islamic banking assets <₱2B (target ₱20B+ by 2035)
Cross-Cutting OS: Moral Governance, Resilience, Peace & Security, Human Capital,
                  Environmental Stewardship (Khalifa principle)

▌5 STRATEGIC LEVERAGE POINTS (Adapted Meadows 1999)
LP1 — Halal Certification Integrity [Critical]: OIC/SMIIC accreditation, BHB capacity,
      21-day processing target, global halal market access gateway
LP2 — Infrastructure & Human Capital [Critical]: ZBIP, BSEMP, BEGMP, TVET-industry
      alignment, raise B1 Growth-Resource Constraint ceiling
LP3 — Governance & Investor Confidence [High]: BICC activation, moral governance,
      BBOI aftercare, R2 feedback loop (governance→confidence→investment)
LP4 — Islamic Finance Mobilization [High]: Al-Amanah, Takaful, Waqf, Islamic fintech
LP5 — Green Economy Activation [High]: JMC 2026-01 (Carbon Credits + PES),
      Bangsamoro Forestry Code, REDD+ program, eco-tourism fees

▌BALANCED SCORECARD (Chapter 6, BIRD 2026-2035)
Financial Perspective:
  F1: Investment approvals ₱5.1B → ₱8B (2030) → ₱15B p.a. (2035)
  F2: GRDP ₱299.5B → ₱400B (2030) → ₱550B+ (2035)
  F3: Export value <₱10B → ₱20B (2030) → ₱40B+ (2035)
  F4: Green revenue ₱0 → ₱100M p.a. (2030) → ₱500M p.a. (2035)
  F5: Islamic banking assets <₱2B → ₱8B (2030) → ₱20B+ (2035)
Stakeholder Perspective:
  S1: Poverty incidence 34.8% → <25% (2030) → <20% (2035)
  S2: Investor satisfaction → 7.0/10 (2030) → 8.0+/10 (2035)
  S3: Jobs created → 10,000+ (2030) → 20,000+ cumulative (2035)
Internal Process Perspective:
  IP1: Halal-certified MSMEs ~500 → 2,000 (2030) → 5,000+ (2035)
  IP2: BHB accreditation status → OIC/SMIIC aligned (2030) → MRA signed (2035)
  IP3: Halal certification time 45-60 days → 30 days → ≤21 days (2035)
  IP4: Business registration → 2 days → 1 day digital (2035)
  IP5: Electrification ~75% → 90% → 100% (2035)
  IP6: Broadband <30% → 60% → 85% (2035)
Learning & Growth Perspective:
  LG1: Literacy 59.3% → 72% → 75%+ (2035)
  LG2: BHB halal officers minimal → 50 (2026) → 100+ (2035)
  LG3: Renewable energy 75.86% → 82% → 85%+ (2035)
  LG4: MSME share of GRDP ~36% → 38% → 40% (2035)

▌IMPLEMENTATION PHASES (Total: ₱120-160B)
Phase 1 — Foundation Building (2026-2028): ₱35-45B
  • BHB operationalisation (OIC/SMIIC alignment)
  • Bangsamoro Forestry Code enactment + JMC 2026-01 signing
  • 1-day digital business registration (BEGMP)
  • Bangsamoro Halal Park groundbreaking, Matanog
  • ZBIP construction commenced; BICC established
Phase 2 — Acceleration (2029-2032): ₱50-65B
  • Halal Park Phase 1 operational; OIC full recognition
  • REDD+ registered; PES payments activated
  • Islamic banking in all 7 provincial capitals
  • Cold chain/logistics hubs deployed; 70% literacy
Phase 3 — Consolidation & Global Integration (2033-2035): ₱35-50B
  • SMIIC Mutual Recognition Arrangement (MRA) secured
  • ₱500M+ annual green revenue (carbon + PES)
  • Full BIMP-EAGA integration; ZBIP fully operational
  • GRDP ₱550B+; poverty <20%; 100% electrification

▌SYSTEMS ARCHETYPES IN BARMM CONTEXT (Chapter 3)
A1. Fixes that Fail: Subsidies suppress market signals; performance-linked replacements needed
A2. Shifting the Burden: Donor dependency undermines autonomous revenue (JMC 2026-01 corrective)
A3. Success to the Successful: Mainland vs island province disparity (affirmative investment policies)
A4. Growth & Underinvestment: Approval surge outpaces energy/skills/digital capacity
A5. Escalation: Rido/clan dynamics vs inter-provincial competition
A6. Big Man: Patronage politics undermines governance (merit-based civil service corrective)
A7. Tragedy of the Commons: Fragmented watershed/fishery governance (Forestry Code corrective)

▌KEY REGULATORY ANCHORS
• Bangsamoro Organic Law (RA 11054, 2018) — autonomous governance foundation
• CREATE MORE Act (RA 12066) — national tax incentive framework
• RA 11439 — Islamic Banking Law (Shariah-compliant finance expansion)
• 2nd Bangsamoro Development Plan (BDP) 2023-2028 — medium-term priorities
• BHIDP 2025-2030 — Halal industry development (MTIT-BARMM)
• BSEMP — Renewable energy targets (75.86% → 85%+ by 2035)
• BEGMP 2025-2030 — e-Governance master plan (MICT)
• BIMP-EAGA EGL Sub-Committee Strategic Plan 2025-2028

STYLE RULES: Evidence-based; cite specific KPIs, LPs, archetypes, phases; 
Islamic values respected (khalifa stewardship, moral governance, halal integrity); 
never invent data; professional and collegial tone.
`;

function planContext(plan: Record<string, unknown> | null | undefined): string {
  if (!plan) return 'No active plan loaded — using general BIRD 2026-2035 knowledge.';
  const swot = Array.isArray(plan.swotItems) ? plan.swotItems : [];
  const c = (k: string) => (swot as Array<{category: string}>).filter((i) => i.category === k).length;
  return [
    `ACTIVE PLAN: "${sStr(plan.name) || 'Untitled'}"`,
    `Organization: ${sStr(plan.organization) || 'BOI-MTIT/BARMM'}`,
    `Period: ${plan.planningPeriodStart || '2026'}–${plan.planningPeriodEnd || '2035'}`,
    `SWOT: ${c('strength')}S / ${c('weakness')}W / ${c('opportunity')}O / ${c('threat')}T`,
    `Objectives: ${(Array.isArray(plan.objectives) ? plan.objectives : []).length}`,
    `PAPs: ${(Array.isArray(plan.paps) ? plan.paps : []).length}`,
  ].join(' | ');
}

// ─── Action → Prompt Builder ──────────────────────────────────────────────────
function buildConfig(
  action: string,
  data: Record<string, unknown>,
  plan: Record<string, unknown> | null | undefined,
) {
  data = data ?? {};
  const ctx = `${BIRD_CONTEXT}\n\n${planContext(plan)}`;

  switch (action) {
    // ── Conversational chat ────────────────────────────────────────────────
    case 'chat': {
      const history = sArr<{role: string; content: string}>(data.messages, 20)
        .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
        .map((m) => ({ role: m.role, content: sStr(m.content, 4000) }));
      const latest  = sStr(data.message, 4000);
      const view    = sStr(data.activeView, 80);
      // Allow client-injected system context override for richer prompts
      const clientCtx = sStr((data as any).systemContext ?? '', 3000);

      const sysContent = [
        `You are "BIRD AI", the embedded strategy consultant inside the BIRD 2026-2035 Strat Planner platform.`,
        clientCtx || ctx,
        view ? `The user is currently on the "${view}" workspace — tailor examples to that context.` : '',
        `RESPONSE RULES:`,
        `• Be concise: short paragraphs + tight bullets; max ~250 words unless the user asks for depth.`,
        `• Be concrete: connect advice to a specific KPI, leverage point (LP1-LP5), archetype, or phase.`,
        `• Be actionable: if asked to draft SWOT/strategies/objectives/KPIs/PAPs, give ready-to-use phrasing.`,
        `• If you lack a specific figure, say so — never invent data.`,
        `• Plain text only — no markdown headers, no code blocks in conversational mode.`,
        `• Islamic values: respect moral governance, khalifa stewardship, and halal integrity.`,
      ].filter(Boolean).join('\n');

      const messages = [{ role: 'system', content: sysContent }, ...history];
      if (latest) messages.push({ role: 'user', content: latest });
      return { messages, temperature: 0.65, maxTokens: 1600, expectJson: false };
    }

    // ── SWOT Generation ────────────────────────────────────────────────────
    case 'generate_swot':
      return {
        messages: [
          {
            role: 'system',
            content: `${ctx}\n\nGenerate a BIRD-relevant SWOT using the BEIE framework. Apply the BIRD scoring methodology:\n- Strengths RI = (Impact × Likelihood) / 5\n- Opportunities RI = √(Impact × Likelihood)\n\nReturn ONLY valid JSON:\n{"strengths":[{"id":"str-1","description":string,"impactScore":1-5,"likelihoodScore":1-5,"aiGenerated":true,"leveragePoint":"LP1-LP5","beiecluster":string}],"weaknesses":[...],"opportunities":[...],"threats":[...]}\n4-6 items per quadrant. BARMM/halal/investment specific. Integer scores 1-5. No markdown.`,
          },
          {
            role: 'user',
            content: `Organization: ${sStr(data.organization, 300) || 'BOI-MTIT, BARMM'}\nSector: ${sStr(data.industry, 300) || 'Trade, Investments & Tourism'}\nStrategic Intent: ${sStr(data.strategicIntent, 1200)}\nContext: ${sStr(data.context, 2000)}`,
          },
        ],
        temperature: 0.6, maxTokens: 5000, expectJson: true,
      };

    // ── TOWS Strategy Matrix ────────────────────────────────────────────────
    case 'generate_strategies': {
      const fmt = (items: unknown[]) =>
        sArr<{description?: unknown}>(items, 20)
          .map((it, i) => `[${i + 1}] ${typeof it.description === 'string' ? it.description : JSON.stringify(it)}`)
          .join('\n');
      return {
        messages: [
          {
            role: 'system',
            content: `${ctx}\n\nProduce a TOWS matrix (SO/ST/WO/WT). For each strategy:\n- Cite the SWOT pair(s) it addresses\n- Reference the Meadows leverage level (L1-L12) and BEIE cluster linkage\n- Link to a specific BIRD phase or initiative\n\nReturn ONLY valid JSON:\n{"SO":[{"id":"SO-1","title":string,"description":string,"priority_score":1-5,"feasibility_score":1-5,"resource_requirement":"low|medium|high","leverage_level":1-12,"swot_pairs":string,"beie_cluster":string,"bird_phase":"1|2|3"}],"ST":[...],"WO":[...],"WT":[...]}\nExactly 3 per quadrant. No markdown.`,
          },
          {
            role: 'user',
            content: `Strategic Intent: ${sStr(data.strategicIntent, 1200)}\nSTRENGTHS:\n${fmt(sArr(data.strengths))}\nWEAKNESSES:\n${fmt(sArr(data.weaknesses))}\nOPPORTUNITIES:\n${fmt(sArr(data.opportunities))}\nTHREATS:\n${fmt(sArr(data.threats))}`,
          },
        ],
        temperature: 0.6, maxTokens: 6000, expectJson: true,
      };
    }

    // ── KPI Design ─────────────────────────────────────────────────────────
    case 'generate_kpis':
      return {
        messages: [
          {
            role: 'system',
            content: `${ctx}\n\nDesign SMART KPIs aligned with the BIRD Balanced Scorecard. Each KPI should have baseline and 2030 + 2035 targets calibrated against OIC/SMIIC, ESG, PDP 2023-2028, and BARMM-specific benchmarks.\n\nReturn ONLY valid JSON:\n{"kpis":[{"name":string,"description":string,"unit":string,"baseline_value":number,"target_2030":number,"target_2035":number,"frequency":"monthly|quarterly|annually","perspective":"financial|stakeholder|internal_process|learning_growth","leverage_point":"LP1|LP2|LP3|LP4|LP5","benchmark_source":string}]}\n3-5 KPIs. PHP units where monetary. No markdown.`,
          },
          {
            role: 'user',
            content: `BSC Perspective: ${sStr(data.perspective, 100)}\nObjective: ${sStr(data.objective, 600)}\nContext: ${sStr(data.context, 600)}`,
          },
        ],
        temperature: 0.6, maxTokens: 4000, expectJson: true,
      };

    // ── BSC Objectives ────────────────────────────────────────────────────
    case 'generate_objectives':
      return {
        messages: [
          {
            role: 'system',
            content: `${ctx}\n\nGenerate Balanced Scorecard objectives aligned with BIRD 2026-2035 IEDS strategy.\n\nReturn ONLY valid JSON:\n{"objectives":[{"id":string,"objective":string,"description":string,"perspective":"financial|stakeholder|internal_process|learning_growth","weight":1.0-2.0,"leverage_point":"LP1-LP5","beie_cluster":string,"bird_phase":"1|2|3"}]}\n2-3 per requested perspective. No markdown.`,
          },
          {
            role: 'user',
            content: `Target Perspective: ${sStr(data.perspective, 100) || 'All'}\nStrategic Intent: ${sStr(data.planStrategicIntent ?? (data.goal as string), 1200)}\nSWOT Summary: ${JSON.stringify(data.swotSummary ?? 'None')}\nSelected Strategies: ${JSON.stringify(data.selectedStrategies ?? 'None')}`,
          },
        ],
        temperature: 0.6, maxTokens: 4500, expectJson: true,
      };

    // ── PAPs Architecture ─────────────────────────────────────────────────
    case 'generate_paps':
      return {
        messages: [
          {
            role: 'system',
            content: `${ctx}\n\nArchitect Programs, Activities, and Projects (PAPs) for BARMM investment strategy execution.\n\nReturn ONLY valid JSON array:\n[{"id":string,"name":string,"type":"program|activity|project","linked_objective_id":string,"description":string,"budget_estimate_php":number,"duration_months":number,"status":"planned|in-progress|completed|delayed","priority_score":1-5,"beie_cluster":"foundations|transformers|enablers|connectors|financiers","bird_phase":"1|2|3","lead_agency":string,"support_agencies":[string],"sdg_alignment":string}]\n3-6 items. PHP budgets (realistic BARMM figures). No markdown.`,
          },
          {
            role: 'user',
            content: `Objectives:\n${JSON.stringify(sArr(data.objectives, 6))}\nHorizon: ${sStr(data.timeHorizon, 100) || '2026-2035'}`,
          },
        ],
        temperature: 0.6, maxTokens: 5000, expectJson: true,
      };

    // ── MEL Insights ──────────────────────────────────────────────────────
    case 'generate_insights':
      return {
        messages: [
          {
            role: 'system',
            content: `${ctx}\n\nYou are the BIRD 2026-2035 MEL (Monitoring, Evaluation, and Learning) Advisor. Analyze performance data and generate adaptive management recommendations.\n\nReturn ONLY valid JSON:\n{"observations":[string],"risks":[string],"recommendations":[string],"learnings":[string],"leverage_points_triggered":[string]}\n2-5 items each. Reference BIRD phases, KPIs, archetypes, and LPs. No markdown.`,
          },
          {
            role: 'user',
            content: `Performance Data:\n${JSON.stringify(data.performanceData ?? {})}`,
          },
        ],
        temperature: 0.6, maxTokens: 4500, expectJson: true,
      };

    // ── Investment Trend Analysis ─────────────────────────────────────────
    case 'analyze_trends':
      return {
        messages: [
          {
            role: 'system',
            content: `${ctx}\n\nProvide a concise (<700 words) investment and market analysis with: sector opportunity assessment, competitive benchmarks (Malaysia, Indonesia halal hubs; BIMP-EAGA peers), risk indicators, BARMM positioning strategy, and timeline forecast aligned with BIRD phases.`,
          },
          {
            role: 'user',
            content: `Sector: ${sStr(data.sector, 300) || 'Halal & Agribusiness'}\nRegion: ${sStr(data.region, 300) || 'BARMM / BIMP-EAGA'}\nTimeframe: ${sStr(data.timeframe, 200) || '2026-2035'}`,
          },
        ],
        temperature: 0.7, maxTokens: 4500, expectJson: false,
      };

    // ── Systems Archetype Detection ───────────────────────────────────────
    case 'suggest_archetypes':
      return {
        messages: [
          {
            role: 'system',
            content: `${ctx}\n\nApply Meadows (1999) systems thinking to identify the dominant systems archetype(s) in the given context. The 7 BIRD-relevant archetypes are: Fixes that Fail, Shifting the Burden, Success to the Successful, Growth & Underinvestment, Escalation, Big Man, Tragedy of the Commons.\n\nReturn ONLY valid JSON:\n{"identified_archetype":string,"secondary_archetypes":[string],"confidence_score":1-5,"diagnostic_indicators":[string],"leverage_points":[{"level":1-12,"meadows_name":string,"intervention":string}],"intervention_recommendations":[string],"causal_loops":[string],"beie_clusters_affected":[string]}\nReference Meadows L1-L12. No markdown.`,
          },
          {
            role: 'user',
            content: `Current Situation Metrics:\n${JSON.stringify(data.currentStatus ?? {})}`,
          },
        ],
        temperature: 0.6, maxTokens: 4500, expectJson: true,
      };

    // ── Causal Loop Diagram Builder ───────────────────────────────────────
    case 'build_ccd':
      return {
        messages: [
          {
            role: 'system',
            content: `${ctx}\n\nBuild a Causal Loop Diagram (CLD) for BARMM investment strategy. Identify reinforcing (R) and balancing (B) loops, map causal relationships with polarity (+ / -), and identify dominant systems archetypes.\n\nReturn ONLY valid JSON:\n{"causal_relationships":[{"source_variable":string,"target_variable":string,"relationship_type":"enables|threatens|mitigates|exacerbates","direction":"+|-","strength":"strong|moderate|weak","confidence_score":1-5,"description":string}],"feedback_loops":[{"loop_id":string,"type":"R|B","variables":[string],"name":string,"description":string}],"primary_drivers":[string],"critical_dependencies":[string],"dominant_archetype":string}\nNo markdown.`,
          },
          {
            role: 'user',
            content: `SWOT:\n${JSON.stringify(data.swot ?? {})}\nObjectives:\n${JSON.stringify(data.objectives ?? [])}`,
          },
        ],
        temperature: 0.6, maxTokens: 5000, expectJson: true,
      };

    // ── Action Recommendations ────────────────────────────────────────────
    case 'recommend_actions':
      return {
        messages: [
          {
            role: 'system',
            content: `${ctx}\n\nGenerate prioritized action recommendations for BARMM investment facilitation, organized by BIRD implementation horizon.\n\nReturn ONLY valid JSON:\n{"immediate_actions":[{"title":string,"description":string,"owner_role":string,"estimated_impact":"high|medium|low","urgency_score":1-5,"budget_estimate_php":number,"leverage_point":"LP1-LP5","implementation_steps":[string]}],"short_term_initiatives":[{"title":string,"description":string,"expected_outcome":string,"required_resources":[string],"bird_phase":"1|2"}],"long_term_transformations":[{"vision":string,"milestone_targets":[string],"timeline_years":number,"bird_phase":"2|3"}]}\nNo markdown.`,
          },
          {
            role: 'user',
            content: `Insights:\n${JSON.stringify(data.insights ?? {})}\nPriority Focus: ${sStr(data.priorityFocus, 400)}`,
          },
        ],
        temperature: 0.6, maxTokens: 5000, expectJson: true,
      };

    // ── CLD Loop Analysis ────────────────────────────────────────────────
    case 'analyze_loops': {
      const nodes = sArr<{id: string; label: string}>(data.nodes, 80).filter((n) => n.id && n.label);
      const links = sArr<{from: string; to: string}>(data.links, 150).filter((l) => l.from && l.to);
      if (nodes.length < 2) return { _error: 'Need at least 2 CLD nodes to analyze.' };
      return {
        messages: [
          {
            role: 'system',
            content: `${ctx}\n\nAnalyze this Causal Loop Diagram. Detect loops (R=reinforcing/even-number of negative links; B=balancing/odd-number). Match BIRD archetypes. Rank Meadows leverage points for intervention. Link to TOWS quadrants.\n\nReturn ONLY valid JSON:\n{"detected_loops":[{"nodeIds":[string],"type":"R|B","name":string,"strength":1-5,"description":string,"archetype":string}],"dominant_archetypes":[{"archetypeName":string,"confidence":0.0-1.0,"explanation":string,"beie_cluster":string}],"ranked_leverage_points":[{"leverageLevel":1-12,"meadowsName":string,"intervention":string,"expectedImpact":"high|medium|low","timeHorizon":"short|medium|long","suggestedTOWSQuadrant":"SO|ST|WO|WT","bird_lp":"LP1|LP2|LP3|LP4|LP5"}],"recommendations":[string]}\nNo markdown.`,
          },
          {
            role: 'user',
            content: `NODES:\n${JSON.stringify(nodes)}\nLINKS:\n${JSON.stringify(links)}`,
          },
        ],
        temperature: 0.55, maxTokens: 5000, expectJson: true,
      };
    }

    default:
      return { _error: `Unsupported action: ${action}` };
  }
}

// ─── Post-processing ──────────────────────────────────────────────────────────
function postProcessSwot(parsed: Record<string, unknown>) {
  const quads = ['strengths', 'weaknesses', 'opportunities', 'threats'];
  const out: Record<string, unknown[]> = {};
  for (const q of quads) {
    const items = parsed[q];
    out[q] = Array.isArray(items)
      ? items.map((it: any, i: number) => ({
          id: typeof it.id === 'string' && it.id ? it.id : `swot-${q}-${Date.now()}-${i}`,
          description: typeof it.description === 'string' ? it.description.trim() : `${q} item ${i + 1}`,
          impactScore: Math.round(Math.max(1, Math.min(5, Number(it.impactScore ?? it.impact_score ?? 3)))),
          likelihoodScore: Math.round(Math.max(1, Math.min(5, Number(it.likelihoodScore ?? it.likelihood_score ?? 3)))),
          aiGenerated: true,
          leveragePoint: it.leveragePoint ?? it.leverage_point ?? null,
          beieCluster: it.beiecluster ?? it.beieCluster ?? it.beie_cluster ?? null,
        }))
      : [];
  }
  return out;
}

function parseAI(content: string, expectJson: boolean) {
  if (!expectJson) return { markdown: content, reply: content };
  try { return JSON.parse(content); } catch { /* fall through */ }
  const m = content.match(/```(?:json)?\s*([\s\S]*?)```/) ??
            content.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (m) { try { return JSON.parse(m[1] ?? m[0]); } catch { /* fall through */ } }
  throw new Error('AI returned malformed JSON — please retry');
}

// ─── Valid actions ────────────────────────────────────────────────────────────
const VALID_ACTIONS = new Set([
  'chat', 'generate_swot', 'generate_strategies', 'generate_kpis',
  'generate_objectives', 'generate_paps', 'generate_insights', 'analyze_trends',
  'suggest_archetypes', 'build_ccd', 'recommend_actions', 'analyze_loops',
  'get_platform_info',
]);

// ─── Main Handler ─────────────────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return errorResponse('Method not allowed. Use POST.', 405);

  try {
    const body: Record<string, unknown> = await req.json().catch(() => ({}));
    const action = typeof body.action === 'string' ? body.action : '';
    const planId  = typeof body.planId === 'string' ? body.planId : null;

    if (!action) return errorResponse('Missing required field: action', 400);
    if (!VALID_ACTIONS.has(action)) return errorResponse(`Invalid action: "${action}"`, 400);

    // ── Platform info (no AI call needed) ──────────────────────────────────
    if (action === 'get_platform_info') {
      return jsonResponse({
        success: true,
        data: {
          platform_name: PLATFORM_NAME,
          version: '2026-2035',
          creator: 'ASilva Innovations',
          owner: 'Bureau of Investments — Ministry of Trade, Investments & Tourism (BOI-MTIT), BARMM',
          logo_url: PLATFORM_LOGO,
          features: {
            strategic_planning: ['SWOT Analysis', 'TOWS Strategy Matrix', 'Balanced Scorecard', 'PAPs Management', 'MEL Dashboard'],
            systems_thinking: ['Causal Loop Diagram Builder', 'Meadows Leverage Points (LP1-LP5)', 'System Archetypes Library (7 archetypes)', 'TOWS × Systems Integration'],
            ai_assistant: 'BIRD AI — BARMM investment, strategy & systems-thinking consultant (GPT-4o)',
            export_options: ['PDF', 'Word Document', 'Excel Spreadsheet'],
            implementation: 'Three-phase: Foundation (2026-28), Acceleration (2029-32), Consolidation (2033-35)',
          },
          key_metrics: {
            total_budget: '₱120-160B',
            grdp_target: '₱550B+ by 2035',
            poverty_target: '<20% by 2035',
            halal_firms_target: '5,000+ certified MSMEs by 2035',
          },
        },
      });
    }

    // ── Resolve plan (from body or Supabase) ───────────────────────────────
    let plan = (body.plan as Record<string, unknown> | null | undefined);
    if (planId && !plan) plan = await fetchPlanFromDB(planId);

    // ── Build prompt config ────────────────────────────────────────────────
    const config = buildConfig(action, (body.data as Record<string, unknown>) ?? {}, plan);
    if ('_error' in config) return errorResponse(config._error as string, 400);

    // ── Resolve API key ────────────────────────────────────────────────────
    // In Supabase Secrets dashboard, set the key as: OPENAI_API_KEY
    // (hyphens not supported in Supabase secret names)
    const openAiApiKey = Deno.env.get('OPENAI_API_KEY') ??
                         Deno.env.get('OPEN_AI_API_KEY') ??
                         Deno.env.get('OPEN_AI_BIRD_2026_2035_PROJECT_API_KEY');
    if (!openAiApiKey) {
      console.error('BIRD AI: OpenAI API key not configured. Set OPENAI_API_KEY in Supabase Secrets.');
      return errorResponse('AI service not configured. Contact the platform administrator.', 503);
    }

    // ── Call OpenAI ────────────────────────────────────────────────────────
    const payload: Record<string, unknown> = {
      model: DEFAULT_MODEL,
      messages: (config as any).messages,
      temperature: (config as any).temperature,
      max_tokens: (config as any).maxTokens,
    };
    if ((config as any).expectJson) payload.response_format = { type: 'json_object' };

    const aiRes = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAiApiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text().catch(() => 'unknown');
      console.error(`OpenAI API error ${aiRes.status}:`, errText.substring(0, 400));
      const userMsg = aiRes.status === 429
        ? 'AI rate limit reached. Please wait a moment and try again.'
        : `AI service error (HTTP ${aiRes.status}). Please try again.`;
      return errorResponse(userMsg, 502);
    }

    const result = await aiRes.json();
    const content = (result?.choices?.[0]?.message?.content) as string | undefined;
    if (!content) return errorResponse('Empty response from AI service.', 502);

    let parsed = parseAI(content, (config as any).expectJson);
    if (action === 'generate_swot') parsed = postProcessSwot(parsed);

    // ── Log interaction (non-blocking) ─────────────────────────────────────
    logAIInteraction(planId, action, body.data, parsed).catch(() => {});

    return jsonResponse({ success: true, data: parsed });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('BIRD AI unhandled error:', msg);
    return errorResponse(msg || 'Internal server error.', 500);
  }
});
