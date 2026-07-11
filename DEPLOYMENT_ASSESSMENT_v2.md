# 🔍 BIRD 2026–2035 — Comprehensive Deployment Assessment v2

**Date:** 2026-07-11
**Scope:** Complete codebase review of src/, supabase/, and public/ directories
**Fork:** `stronghold-a3/BIRD-2026-2035`

---

## EXECUTIVE SUMMARY

This assessment covers **155+ source files**, **5 supabase files**, and **30 public HTML files**. The project is a **React + Vite SPA** with Supabase backend, Edge Functions, and standalone HTML landing pages. **The repository is NOT currently deployable** without addressing critical build-breaking errors.

---

## 1. ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + Vite)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  src/pages/  │  │src/components│  │     src/hooks/       │  │
│  │  (4 pages)   │  │ (40+ comp.)  │  │   (5 hooks)          │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   src/lib/   │  │  src/data/   │  │   src/contexts/      │  │
│  │  (9 modules) │  │  (4 datasets)│  │   (AppContext)       │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴──────────┐
                    ▼                    ▼
┌──────────────────────────┐  ┌──────────────────────────────┐
│    SUPABASE PROJECT A    │  │    SUPABASE PROJECT B        │
│ rgvteytgkugdqdodedxq     │  │ lydsisparsmvextskevw         │
│ (Edge Functions Host)    │  │ (Primary Data + Auth)        │
│ ┌─────────────────────┐  │  │ ┌─────────────────────────┐  │
│ │ ai-strategy-asst    │  │  │ │ auth.users              │  │
│ │ crm-dispatcher      │  │  │ │ users / user_profiles   │  │
│ │ email-notifications │  │  │ │ strategic_plans         │  │
│ │ strategic-planner-sy│  │  │ │ swot_items / objectives │  │
│ └─────────────────────┘  │  │ │ paps / kpi_snapshots    │  │
└──────────────────────────┘  │ │ visit_logs / ai_logs    │  │
                              │ └─────────────────────────┘  │
                              └──────────────────────────────┘
```

---

## 2. 🔴 CRITICAL ISSUES (Build-Breaking)

### CRIT-1: Missing Export — `AIStrategistAvatar` in `Logo.tsx`
**File:** `src/components/strategic/FloatingAIAssistant.tsx:3`
```tsx
import { AIStrategistAvatar } from '@/components/branding/Logo';
```
**File:** `src/components/branding/Logo.tsx` — only exports `StratLogo` and `MTITLogo`.
**Problem:** `AIStrategistAvatar` is imported but **never exported** from `Logo.tsx`. Will cause a build error.

**Fix:** Add export to `Logo.tsx`:
```tsx
export const AIStrategistAvatar: React.FC<LogoProps> = ({ size = 'md', className = '' }) => {
  return <div className={cn(sizeMap[size], "rounded-full bg-gradient-to-br from-cyan-500 to-blue-600", className)}>
    <Bot className="w-1/2 h-1/2 text-white" />
  </div>;
};
```

---

### CRIT-2: Missing Export — `KPI` type in `strategicPlanStore.ts`
**Files affected:**
- `src/hooks/useStrategicPlan.ts:7` — imports `KPI` from store
- `src/components/strategic/BalancedScorecard.tsx:27` — imports `KPI` from store

**File:** `src/lib/strategicPlanStore.ts` — only exports `PlanKPI`, not `KPI`.

**Problem:** Both files import `KPI` from `@/lib/strategicPlanStore`, but only `PlanKPI` is exported. The `KPI` type in `src/data/bird/kpis.ts` is a **different type** (MEL dashboard KPI).

**Fix:** Add type alias to `strategicPlanStore.ts`:
```tsx
export type KPI = PlanKPI;
```

---

### CRIT-3: ThemeProviderProps Import Path Fragility
**File:** `src/components/theme-provider.tsx:5`
```tsx
import { ThemeProviderProps } from "next-themes/dist/types"
```
**Problem:** This imports from `next-themes/dist/types` which is an internal path. May break with version updates.

**Fix:** Use local interface:
```tsx
interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: "dark" | "light" | "system";
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
  [key: string]: any;
}
```

---

### CRIT-4: SurveyWizard — Missing Type Imports
**File:** `src/components/strategic/SurveyWizard.tsx:158`
```tsx
function convertSurveyToPlan(data: SurveySchemaType, userInfo: UserInfo): StrategicPlan {
```
**Problem:** `UserInfo` and `StrategicPlan` (from local path, not store), `createEmptyPlan`, `buildSwotItemsFromSurvey`, `buildStrategicOptionsFromSurvey`, `buildObjectivesFromSurvey`, `buildPAPsFromSurvey` are referenced but **never imported or defined**.

**Fix:** Either:
1. Remove the `convertSurveyToPlan` function (if not used)
2. Or import `UserInfo` from appropriate module and define helper functions

---

### CRIT-5: `NodeJS.Timeout` Type in Browser Code
**File:** `src/hooks/useStrategicPlan.ts:77`
```tsx
const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
```
**Problem:** `NodeJS.Timeout` is a Node.js type. In browser environments, this doesn't exist. Will cause TypeScript errors.

**Fix:**
```tsx
const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
```

---

## 3. 🟠 HIGH SEVERITY ISSUES

### HIGH-1: Duplicate HeroSection Declaration
**File:** `src/components/strategic/MELDashboard.tsx:8`
```tsx
import HeroSection from './HeroSection';
```
**File:** `src/components/strategic/MELDashboard.tsx:38`
```tsx
const HeroSection: React.FC<{ onNavigate?: (view: string) => void }> = ({ onNavigate }) => {
```
**Problem:** `HeroSection` is **both imported AND locally declared** in the same file. This will cause a duplicate identifier error.

**Fix:** Rename the local component:
```tsx
// Change to:
const DashboardHeroSection: React.FC<{ onNavigate?: (view: string) => void }> = ...
// And use <DashboardHeroSection /> instead of <HeroSection />
```

---

### HIGH-2: Development-Only Error Component in Production
**File:** `src/components/ErrorButton.tsx`
```tsx
export const ErrorButton: React.FC = () => {
  const handleClick = () => {
    throw new Error('This is your first error!');
  };
```
**Problem:** This component intentionally throws errors for Sentry testing. If accidentally rendered in production, it crashes the app.

**Fix:**
```tsx
export const ErrorButton: React.FC = () => {
  if (import.meta.env.PROD) return null;
  // ... rest
};
```

---

### HIGH-3: `recharts` v3 Breaking Changes
**File:** `package.json:63`
```json
"recharts": "^3.0.0"
```
**Problem:** Recharts v3 has significant breaking changes from v2. Components using recharts may fail at runtime.

**Fix:** Downgrade to `recharts@^2.12.0`

---

### HIGH-4: `date-fns` v3 + `react-day-picker` v8 Incompatibility
**File:** `package.json`
```json
"date-fns": "^3.6.0",
"react-day-picker": "^8.10.1"
```
**Problem:** `react-day-picker` v8 was built for `date-fns` v2. In v3, function signatures changed.

**Fix:** Downgrade `date-fns` to `^2.30.0`

---

### HIGH-5: Mixed API Directory Structures (Deployment Conflict)
**Files:**
- `api/submit.js` — Netlify function format
- `app/api/cron/+server.js` — SvelteKit format
- `app/api/cron/route.js` — Next.js App Router format
- `pages/api/cron.js` — Next.js Pages Router format

**Problem:** Four different framework patterns in one repo. Deployment platforms will be confused about which framework to use.

**Fix:** Consolidate to a single API pattern. For a Vite SPA:
- Keep `api/` for Netlify functions
- Remove `app/` and `pages/` API routes (they're for different frameworks)
- Or add `vercel.json` with explicit configuration

---

### HIGH-6: Hardcoded Supabase Credentials
**File:** `src/lib/supabase.ts:11-13`
```tsx
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lydsisparsmvextskevw.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIs...';
```
**Problem:** Supabase anon key is hardcoded as fallback. Makes credential rotation impossible.

**Fix:**
```tsx
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.warn('[Supabase] Missing environment variables');
}
```

---

### HIGH-7: Unused Import — `PlanTemplate` in `AppLayout.tsx`
**File:** `src/components/AppLayout.tsx:8`
```tsx
import { PlanTemplate } from '@/lib/templateData';
```
**Problem:** `PlanTemplate` is imported but never used in the component.

**Fix:** Remove the unused import.

---

### HIGH-8: Edge Function URLs Hardcoded Throughout Components
**Files:** Multiple components have hardcoded Supabase Edge Function URLs:
- `BalancedScorecard.tsx:33-35`
- `PAPsManagement.tsx:25-27`
- `StrategyMatrix.tsx:11-12`
- `AuthModal.tsx:25`
- `MELDashboard.tsx`

**Problem:** URLs are duplicated across 6+ files. If the Supabase project URL changes, all need updating.

**Fix:** Centralize in `src/lib/supabase.ts` (already has `EDGE_FUNCTIONS` constant but many components don't use it):
```tsx
// Already defined in supabase.ts:
export const EDGE_FUNCTIONS = {
  AI_STRATEGY_ASSISTANT: `${baseUrl}/functions/v1/ai-strategy-assistant`,
  STRATEGIC_PLANNER_SYNC: `${baseUrl}/functions/v1/strategic-planner-sync`,
  EMAIL_NOTIFICATIONS: `${baseUrl}/functions/v1/email-notifications`,
} as const;
```

---

## 4. 🟡 MEDIUM SEVERITY ISSUES

### MED-1: No Deployment Configuration Files
**Problem:** No `vercel.json`, `netlify.toml`, or deployment configs for any platform.

**Fix for Vercel:**
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "max-age=31536000, immutable" }]
    }
  ]
}
```

### MED-2: Duplicate `app/` and `pages/` at Root Level
**Problem:** Having `app/` and `pages/` at root may cause Vercel to auto-detect as Next.js.

### MED-3: Conflicting `tsconfig.json` Files
**Files:**
- `tsconfig.json` — `"noEmit": false`, `"strict": true`
- `tsconfig.app.json` — `"noEmit": true`, `"strict": false`

### MED-4: `useStrategicPlan.ts` — `any` Type Usage
**File:** `src/hooks/useStrategicPlan.ts:96`
```tsx
const normalizeRow = useCallback(<T extends Record<string, any>>(row: any): T => {
```

### MED-5: Unused shadcn/ui Components
**Problem:** ~20 shadcn/ui components in `src/components/ui/` are never imported anywhere.

### MED-6: Two Manifest Files
**Files:** `manifest.webmanifest.json` (root) and `public/manifest.json`

---

## 5. 🟢 LOW SEVERITY / BEST PRACTICES

### LOW-1: No `.env.example` File
Required environment variables not documented:
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SENTRY_DSN`

### LOW-2: Missing Service Worker for PWA
PWA manifest exists but no service worker registered.

### LOW-3: Survey Submission Points to `/api/submit`
**File:** `src/lib/api.ts:116`
```tsx
const response = await fetch("/api/submit", {
```
This expects a Netlify function at `api/submit.js` which references `../src/lib/survey-schema` — won't resolve at runtime.

### LOW-4: Sentry v10 Missing Browser Tracing Integration
**File:** `src/main.tsx`
```tsx
Sentry.init({
  dsn: sentryDsn,
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1,
});
```
Missing `Sentry.browserTracingIntegration()`.

---

## 6. SUPABASE EDGE FUNCTIONS ASSESSMENT

### ai-strategy-assistant/index.ts
- ✅ Uses CORS headers correctly
- ✅ OpenAI integration with GPT-4o
- ✅ BIRD 2026-2035 expert context embedded
- ⚠️ Hardcoded `SUPABASE_DATA_URL` to secondary project
- ⚠️ No input validation on `action` parameter

### crm-dispatcher/index.ts
- ✅ Input sanitization with max length limits
- ✅ Body size cap (10 KB)
- ✅ Email validation regex
- ✅ Graceful fallback when CRM env vars not configured
- ✅ CORS headers

### email-notifications/index.ts
- ✅ Resend API integration
- ✅ HTML email templates with BIRD branding
- ✅ Multiple notification types (welcome, kpi_alert, weekly_digest)
- ✅ UUID validation on user_id
- ✅ CORS headers (v4.1 fix)

### strategic-planner-sync/index.ts
- ✅ ETag caching for GET requests
- ✅ SHA-256 checksum for state integrity
- ✅ Body size cap (10 MB)
- ✅ Rate limiting headers
- ✅ Standardized error envelope

### complete_schema.sql
- ✅ Comprehensive schema (users, profiles, plans, SWOT, KPIs, PAPs)
- ✅ RLS policies on all tables
- ✅ BIRD-specific enhancements (leverage points, BEIE clusters)
- ✅ GIN indexes for JSONB queries
- ✅ Helper views for analytics
- ⚠️ `users` table may conflict with `auth.users` — naming confusion

---

## 7. PUBLIC HTML FILES ASSESSMENT

### validation-survey.html
- ✅ Self-contained Alpine.js + Tailwind CSS application
- ✅ PWA capable (manifest, service worker ready)
- ✅ Offline-first (localStorage fallback)
- ✅ ECharts for IEDS Matrix visualization
- ✅ Provincial context awareness
- ✅ Kill-switch validation
- ⚠️ References `manifest.webmanifest` which may not exist at root

### home.html
- ✅ Google Analytics (G-2CNG7D15Q7)
- ✅ Accessibility features (skip links, reduced motion)
- ✅ Mobile-first responsive design
- ✅ BIRD branding consistent with React app

### dashboard.html
- ✅ MEL Dashboard with real-time KPI tracking
- ✅ Status color coding
- ⚠️ Hardcoded KPI data (not connected to live API)

### user-manual.html
- ✅ Liquid glass design system
- ✅ Print functionality
- ⚠️ Uses different design system than main app

---

## 8. FIX PRIORITY MATRIX

| Priority | Issue | Effort | Files |
|----------|-------|--------|-------|
| **P0** | CRIT-1: Add `AIStrategistAvatar` export | 5 min | `Logo.tsx` |
| **P0** | CRIT-2: Add `KPI` type alias | 5 min | `strategicPlanStore.ts` |
| **P0** | CRIT-3: Fix `ThemeProviderProps` import | 10 min | `theme-provider.tsx` |
| **P0** | CRIT-4: Fix SurveyWizard missing imports | 15 min | `SurveyWizard.tsx` |
| **P0** | CRIT-5: Fix `NodeJS.Timeout` type | 5 min | `useStrategicPlan.ts` |
| **P1** | HIGH-1: Fix duplicate HeroSection | 10 min | `MELDashboard.tsx` |
| **P1** | HIGH-3: Downgrade `recharts` to v2 | 5 min | `package.json` |
| **P1** | HIGH-4: Fix `date-fns` version | 5 min | `package.json` |
| **P1** | HIGH-5: Consolidate API routes | 30 min | Root directory |
| **P1** | HIGH-8: Centralize Edge Function URLs | 20 min | Multiple files |
| **P2** | MED-1: Add `vercel.json` | 10 min | Root directory |
| **P2** | HIGH-2: Guard ErrorButton for prod | 5 min | `ErrorButton.tsx` |
| **P2** | HIGH-6: Remove hardcoded credentials | 10 min | `supabase.ts` |
| **P2** | HIGH-7: Remove unused import | 2 min | `AppLayout.tsx` |
| **P3** | All remaining low/medium issues | Variable | Various |

---

## 9. DEPLOYMENT READINESS CHECKLIST

| Platform | Status | Blockers |
|----------|--------|----------|
| **Vercel** | ❌ Not Ready | CRIT-1,2,3,4,5 + HIGH-1,3,4,5 |
| **Netlify** | ❌ Not Ready | CRIT-1,2,3,4,5 + HIGH-1,3,4 |
| **Bolt** | ❌ Not Ready | CRIT-1,2,3,4,5 + HIGH-1,3,4 |

**Estimated time to deployable:** 2-3 hours of focused fixes.

---

*Assessment performed on commit `HEAD` of `main` branch, 2026-07-11.*
