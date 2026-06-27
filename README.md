# BIRD 2026–2035 — Bangsamoro Investment Roadmap Platform

> **Emerging Bangsamoro: A Hub for Resilient and Ethical Growth**

Official strategic planning platform for the **Bangsamoro Investment Roadmap Development (BIRD) 2026–2035**, developed by **ASilva Innovations** for the **Bureau of Investments – Ministry of Trade, Investments and Tourism (BOI-MTIT), BARMM**.

---

## 🌐 Live Platform
- **Web App:** https://asilvainnovations.github.io/barmm-investment-roadmap/
- **User Manual:** https://asilvainnovations.github.io/strat-planner-pwa/user-manual.html
- **Developer Docs:** https://asilvainnovations.github.io/strat-planner-pwa/developer-doc.html

---

## 📋 About BIRD 2026–2035

The **Bangsamoro Investment Roadmap Development (BIRD) 2026–2035** is a 10-year blueprint for accelerating investment-led growth in the Bangsamoro Autonomous Region in Muslim Mindanao (BARMM). It is organized around the **Bangsamoro Economic and Investment Ecosystem (BEIE) Framework** — five interconnected investment clusters anchored by Moral Governance.

| Indicator | Baseline | 2030 Target | 2035 Target |
|-----------|----------|-------------|-------------|
| GRDP | ₱299.5B (2024) | ₱400B | ₱550B+ |
| Investment Approvals | ₱5.1B (Q1 2026) | ₱8B p.a. | ₱15B p.a. |
| Poverty Incidence | 34.8% (1H 2023) | <25% | <20% |
| Halal-Certified MSMEs | ~500 | 2,000+ | 5,000+ |
| Electrification | ~75% | 90% | 100% |
| Total BIRD Budget | — | Phase 1–2: ₱85–110B | ₱120–160B |

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + shadcn/ui |
| State | Zustand + React Query |
| Backend | Supabase (Auth, PostgreSQL, Realtime) |
| Edge Functions | Supabase Edge Runtime (Deno) |
| AI | OpenAI GPT-4o via ai-strategy-assistant edge function |
| Routing | React Router v6 |
| Charts | Recharts |
| Export | jsPDF + docx |

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18
- npm or yarn
- Supabase account (two projects configured — see Environment Variables)

### Installation

```bash
# Clone repository
git clone <repository-url>
cd bird-2026-2035

# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env
# → Fill in all VITE_ variables (see Environment Variables below)

# Start development server
npm run dev
```

Open `http://localhost:5173` in your browser.

### Build for Production

```bash
npm run build
npm run preview   # preview production build locally
```

---

## 🔑 Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# ── Supabase (primary data project: lydsisparsmvextskevw) ────────────────────
VITE_SUPABASE_URL=https://lydsisparsmvextskevw.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>

# ── Branding assets (public CDN) ─────────────────────────────────────────────
VITE_BRAND_LOGO_URL=https://rgvteytgkugdqdodedxq.databasepad.com/storage/v1/object/public/bird-images/public/MTIT%20Logo.webp
VITE_AI_STRATEGIST_AVATAR_URL=https://paibpwwszlfpsyytdnal.databasepad.com/...
VITE_BANNER_INVESTMENT_URL=https://paibpwwszlfpsyytdnal.databasepad.com/...

# ── External URLs ─────────────────────────────────────────────────────────────
VITE_PWA_EXTERNAL_URL=https://asilvainnovations.github.io/barmm-investment-roadmap/
VITE_USER_MANUAL_URL=https://asilvainnovations.github.io/strat-planner-pwa/user-manual.html
VITE_DEVELOPER_DOCS_URL=https://asilvainnovations.github.io/strat-planner-pwa/developer-doc.html

# ── Feature Flags ─────────────────────────────────────────────────────────────
VITE_ENABLE_DEBUG_MODE=false
VITE_ENABLE_ANALYTICS=true
VITE_LOG_LEVEL=info
```

> **⚠️ Supabase Secrets (Edge Functions):** The `OPENAI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` must be configured in the Supabase Secrets dashboard for the **rgvteytgkugdqdodedxq** project (the edge function host). Supabase secret names **cannot contain hyphens** — use `OPENAI_API_KEY` (not `OPEN_AI_BIRD_2026-2035_PROJECT_API_KEY`).

---

## 📁 Project Structure

```
bird-2026-2035/
├── src/
│   ├── components/
│   │   ├── auth/                    # Sign In, Sign Up, Profile modals
│   │   ├── branding/                # Logo, Avatar components
│   │   ├── settings/                # Settings page
│   │   ├── strategic/               # Core feature components
│   │   │   ├── FloatingAIAssistant.tsx  # ← AI assistant (all pages)
│   │   │   ├── MELDashboard.tsx         # MEL monitoring dashboard
│   │   │   ├── SWOTAnalysis.tsx         # SWOT with RI scoring
│   │   │   ├── SystemsThinking.tsx      # CLD builder + archetypes
│   │   │   ├── StrategyMatrix.tsx       # TOWS matrix
│   │   │   ├── BalancedScorecard.tsx    # BSC (4 perspectives)
│   │   │   ├── PAPsManagement.tsx       # Programs, Activities, Projects
│   │   │   ├── TemplatesLibrary.tsx     # Pre-built plan templates
│   │   │   ├── TeamCollaboration.tsx    # Multi-user collaboration
│   │   │   ├── PlanExport.tsx           # PDF/Word/Excel export
│   │   │   ├── NavigationTutorial.tsx   # Onboarding tutorial
│   │   │   ├── HeroSection.tsx          # Landing page
│   │   │   ├── Sidebar.tsx              # Navigation sidebar
│   │   │   └── Topbar.tsx               # Top navigation bar
│   │   └── ui/                      # shadcn/ui primitives
│   ├── data/
│   │   └── bird/                    # Official BIRD 2026–2035 data
│   │       ├── kpis.ts              # KPIs & BSC leverage points
│   │       ├── actions.ts           # 2026 Priority Action Plan
│   │       ├── clds.ts              # Causal loops & archetypes
│   │       └── phases.ts            # Implementation phases
│   ├── hooks/
│   │   ├── useAuth.ts               # Authentication state
│   │   ├── useBIRDData.ts           # BIRD data access hook
│   │   └── useStrategicPlan.ts      # Plan CRUD + sync
│   ├── lib/
│   │   ├── supabase.ts              # Supabase client + edge function URLs
│   │   ├── strategicPlanStore.ts    # Plan data schema & local storage
│   │   ├── formulas.ts              # RI, risk, KPI computation formulas
│   │   └── utils.ts                 # Utility functions
│   ├── pages/
│   │   ├── Index.tsx                # Root page (AppLayout wrapper)
│   │   ├── AdminDashboard.tsx       # Admin analytics
│   │   ├── SharedPlanView.tsx       # Public share view
│   │   └── NotFound.tsx             # 404 page
│   └── contexts/
│       └── AppContext.tsx           # Global app state
├── supabase/
│   └── functions/
│       └── ai-strategy-assistant/   # Edge function (Deno)
│           └── index.ts
├── public/                          # Static assets
├── .env                             # Environment variables (not committed)
├── .env.example                     # Environment template
├── package.json
├── tailwind.config.ts
├── vite.config.ts
└── README.md
```

---

## 🧠 Features

### 1. MEL Dashboard
Real-time monitoring of BIRD 2026–2035 KPIs across all 4 BSC perspectives. Displays Phase Progress Tracker, Pareto Vital Few KPIs, Priority Action Plan status, and Feedback Loop Health Monitor.

### 2. SWOT Analysis
Structured SWOT with the BIRD Resilience Index (RI) scoring methodology:
- **Strengths RI** = (Impact × Likelihood) / 5
- **Opportunities RI** = √(Impact × Likelihood)
AI-assisted SWOT generation via BIRD AI.

### 3. Systems Thinking
Interactive Causal Loop Diagram (CLD) builder with:
- Drag-and-drop node/link editor
- Automatic loop detection (Reinforcing R / Balancing B)
- 7 BARMM-specific Systems Archetypes library
- Meadows Leverage Point analysis (L1–L12)

### 4. Strategy Matrix (TOWS)
Auto-derive SO, ST, WO, WT strategic options from SWOT data. Each option links to a specific leverage point, BEIE cluster, and BIRD phase.

### 5. Balanced Scorecard
Full BSC implementation with 4 perspectives (Financial, Stakeholder, Internal Process, Learning & Growth), KPI tracking, and causal strategy maps.

### 6. PAPs Management
Track Programs, Activities, and Projects with:
- Budget tracking (₱PHP values)
- BEIE cluster and BSC perspective linkage
- BIRD phase assignment
- Status tracking with Kanban-style view

### 7. BIRD AI Strategy Assistant
Floating AI consultant available on every page. Powered by GPT-4o with deep BARMM investment context:
- Context-aware suggestions per active workspace
- Conversational strategy advice
- AI-generated SWOT, strategies, KPIs, PAPs, and insights
- BIMP-EAGA, halal industry, Islamic finance expertise

### 8. Plan Export
Generate professional exports:
- PDF (print-ready reports)
- Word Document (.docx)
- Excel Spreadsheet (.xlsx)

### 9. Team Collaboration
Multi-user plans with:
- Real-time presence indicators
- Role-based access (Owner, Admin, Editor, Viewer)
- Comments and activity log
- Shareable links

---

## 🗄️ Database Schema (Supabase)

Key tables on `lydsisparsmvextskevw.supabase.co`:

```sql
-- User profiles
user_profiles (id, email, full_name, organization, job_title, phone, avatar_url, notification_preferences)

-- Strategic plans (primary data store)
strategic_plans (id, user_id, organization_id, name, data jsonb, version, is_public, created_at, updated_at)

-- Shared plan links
share_links (share_id, plan_id, owner_id, plan_data jsonb, public_access, revoked, created_at)

-- Admin users
admins (email, created_at)

-- Visit analytics
visit_logs (id, user_id, email, page, device, location, created_at)

-- AI interaction audit trail
ai_interaction_logs (id, plan_id, action, input_data jsonb, output_data jsonb, created_at)
```

---

## 🔧 Troubleshooting

### AI Assistant not responding
1. Check that `OPENAI_API_KEY` is set in Supabase Secrets for project `rgvteytgkugdqdodedxq`
2. Verify the edge function is deployed: `supabase functions deploy ai-strategy-assistant`
3. Check browser console for CORS errors — the edge function must return `Access-Control-Allow-Origin: *`

### Plans not syncing
1. Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`
2. Check Supabase Row Level Security (RLS) policies on `strategic_plans` table
3. Inspect Network tab for 401/403 responses from the sync edge function

### Authentication issues
1. Verify Supabase Auth is enabled for the project
2. Check email confirmation settings (may need to disable for development)
3. Magic link redirects require the site URL to be whitelisted in Supabase Auth settings

### Build errors
```bash
npm run type-check    # Check TypeScript errors
npm run lint          # Check ESLint issues
```

---

## 🔐 Security Notes

- Never commit `.env` to version control — it contains API keys
- The `SUPABASE_SERVICE_ROLE_KEY` is server-side only — never expose to the browser
- RLS policies must be enabled on all Supabase tables
- The OpenAI API key should be rotated periodically

---

## 📞 Support & Contact

**Bureau of Investments — Ministry of Trade, Investments and Tourism (BOI-MTIT), BARMM**
- Telephone: (064) 557 2819
- Mobile: 0917.834.333
- Email: boi@bangsamoro.gov.ph

**Developer: ASilva Innovations**
- Platform: https://asilvainnovations.github.io/website/

---

## 📄 License

© 2026 Bureau of Investments – Ministry of Trade, Industry and Tourism (BOI-MTIT), BARMM.  
Licensed under [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International](https://creativecommons.org/licenses/by-nc-sa/4.0/).
