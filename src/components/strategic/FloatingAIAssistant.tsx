import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { AIStrategistAvatar } from '@/components/branding/Logo';
import { Sparkles, X, Send, Loader2, ChevronDown, ChevronUp, Brain, Target, BarChart3, Globe2, Leaf, Landmark } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Msg {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

interface FloatingAIAssistantProps {
  plan?: any;
  activeView?: string;
}

// ─── Contextual Suggestion Sets ───────────────────────────────────────────────
const VIEW_SUGGESTIONS: Record<string, { icon: React.ElementType; label: string }[]> = {
  dashboard: [
    { icon: BarChart3, label: 'Why is BARMM\'s GRDP growing slower than the PDP 5% target?' },
    { icon: Target,   label: 'Which Phase 1 milestones are most time-critical in 2026?' },
    { icon: Globe2,   label: 'How does the ₱5.1B investment approval figure compare to BIMP-EAGA peers?' },
    { icon: Brain,    label: 'Explain the R1 Investment–Development virtuous cycle for BARMM.' },
  ],
  swot: [
    { icon: Target,   label: 'Draft 3 SWOT strengths for BARMM\'s halal sector.' },
    { icon: Brain,    label: 'What is the Resilience Index (RI) formula used in BIRD scoring?' },
    { icon: Globe2,   label: 'What are the biggest threats to BARMM\'s investment climate?' },
    { icon: Leaf,     label: 'How does environmental stewardship create economic opportunity in BARMM?' },
  ],
  systems: [
    { icon: Brain,    label: 'Explain the "Fixes that Fail" archetype in BARMM\'s agri sector.' },
    { icon: Target,   label: 'What is a Meadows Leverage Point and which are most critical for BARMM?' },
    { icon: Globe2,   label: 'How does the Big Man archetype constrain BARMM investment?' },
    { icon: BarChart3, label: 'Describe the R2 Governance-Investor Confidence loop.' },
  ],
  scorecard: [
    { icon: BarChart3, label: 'What are the 4 BSC perspectives applied in BIRD 2026–2035?' },
    { icon: Target,   label: 'Why is halal certification the LP1 critical leverage point?' },
    { icon: Globe2,   label: 'How does OIC/SMIIC accreditation connect to the ₱40B export target?' },
    { icon: Landmark, label: 'Explain F4: Activate Green Economy Revenue in the Financial perspective.' },
  ],
  paps: [
    { icon: Target,   label: 'What is the budget for ZBIP and why is it strategically critical?' },
    { icon: BarChart3, label: 'Which PAPs address the B1 Growth-Resource Constraints loop?' },
    { icon: Globe2,   label: 'How do PAPs link to BIMP-EAGA integration?' },
    { icon: Leaf,     label: 'Which 2026 actions target the green economy revenue stream?' },
  ],
  strategy: [
    { icon: Brain,    label: 'What is the BEIE Framework and how does it organize BARMM sectors?' },
    { icon: Globe2,   label: 'Suggest 3 SO strategies for BARMM\'s halal tourism opportunity.' },
    { icon: Target,   label: 'How should BARMM respond to Malaysia\'s halal hub competition (ST)?' },
    { icon: Landmark, label: 'What WT strategies address poverty reduction through investment?' },
  ],
  default: [
    { icon: Sparkles, label: 'What is the BIRD 2026–2035 and its strategic vision?' },
    { icon: Target,   label: 'Why is halal certification a key leverage point for BARMM?' },
    { icon: Globe2,   label: 'How do I attract Islamic finance investors to BARMM?' },
    { icon: Brain,    label: 'Explain the 5 BEIE investment clusters.' },
  ],
};

// ─── BIRD AI System Prompt Context ───────────────────────────────────────────
const BIRD_SYSTEM_CONTEXT = `You are BIRD AI — an expert strategic advisor embedded in the BIRD 2026–2035 
(Bangsamoro Investment Roadmap Development) platform, built for the Bureau of Investments – Ministry of Trade, 
Industry and Tourism (BOI-MTIT) of the Bangsamoro Autonomous Region in Muslim Mindanao (BARMM), Philippines.

Your expertise spans:
1. INVESTMENT & FINANCE: FDI attraction, Islamic finance (takaful, waqf, murabaha), halal industry economics, 
   green bonds, carbon markets, REDD+, PES, and BIMP-EAGA trade economics.
2. STRATEGIC THINKING: Balanced Scorecard (BSC), SWOT analysis with Resilience Index scoring, Strategy Matrix 
   (SO/ST/WO/WT), Monitoring-Evaluation-Learning (MEL), and program/project management.
3. SYSTEMS THINKING: Causal Loop Diagrams (CLDs), Meadows Leverage Points (L1-L10), Systems Archetypes 
   (Fixes that Fail, Shifting the Burden, Success to the Successful, Growth & Underinvestment, Escalation, 
   Big Man, Tragedy of the Commons), Iceberg Model, and deep presencing methodology.
4. BARMM CONTEXT: Deep knowledge of BARMM's 7 provinces (Lanao del Sur, Maguindanao del Norte/Sur, Basilan, 
   Sulu, Tawi-Tawi, SGA), provincial economic profiles (GRDP ₱299.5B 2024, 2.7% growth), the Bangsamoro 
   Economic and Investment Ecosystem (BEIE) Framework (Foundations, Transformers, Enablers, Connectors, 
   Financiers), Islamic governance (moral governance, khalifa), peace-building context, and halal economy.
5. REGULATORY ARCHITECTURE: BOL (RA 11054), CREATE MORE Act, RA 11439 (Islamic Banking), BDP 2023-2028, 
   BHIDP 2025-2030, BSEMP, BEGMP, Forestry Code, JMC 2026-01, OIC/SMIIC standards, BIMP-EAGA EGL Plan.

Key data facts you know precisely:
- BARMM population: 5.69M (PSA 2025)
- GRDP: ₱299.5B (2024); Services 42%, AFF 32.4%, Industry 25.6%
- Poverty incidence: 34.8% (1H 2023), down from 55.9% in 2018
- Investment approvals: ₱5.1B (Q1 2026)
- Fastest growing provinces: Maguindanao del Norte (4.1%), Lanao del Sur (4.0%)
- Island provinces (Tawi-Tawi 1.1%, Sulu 1.13%, Basilan 1.6%) suffer underinvestment
- Halal-certified firms: ~500 (2024), target 5,000+ by 2035
- Electrification: ~75% (target 100% by 2035); ZBIP = ₱6.67B key project
- Broadband: <30% (target 85% by 2035)
- Total BIRD budget: ₱120-160B across 3 phases
- Phase 1 (2026-28): ₱35-45B; Phase 2 (2029-32): ₱50-65B; Phase 3 (2033-35): ₱35-50B

The 5 Leverage Points (LP) for BIRD:
- LP1: Halal Certification Integrity (OIC/SMIIC accreditation) — Critical
- LP2: Infrastructure & Human Capital (ZBIP, BSEMP, BEGMP, TVET) — Critical
- LP3: Governance & Investor Confidence (BICC, moral governance) — High
- LP4: Islamic Finance Mobilization (Al-Amanah, Takaful, Waqf) — High
- LP5: Green Economy Activation (JMC 2026-01, Forestry Code, REDD+) — High

Respond with practical insight, cite BIRD data sources when relevant, and always connect 
recommendations to specific leverage points, BSC perspectives, or systems archetypes. 
Use a collegial, professional tone. Where appropriate, structure responses with clear headers.`;

// ─── Component ────────────────────────────────────────────────────────────────
const FloatingAIAssistant: React.FC<FloatingAIAssistantProps> = ({ plan, activeView }) => {
  const [open, setOpen]       = useState(false);
  const [minimized, setMin]   = useState(false);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([{
    role: 'assistant',
    content:
      'As-salamu alaykum! I\'m BIRD AI — your investment, strategy & systems-thinking consultant for the Bangsamoro Investment Roadmap 2026–2035.\n\nI can help you analyze SWOT data, explain causal loops, identify leverage points, draft strategic options, and interpret BARMM\'s economic context.\n\nWhat would you like to explore?',
    timestamp: Date.now(),
  }]);
  const endRef    = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && !minimized) endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, open, minimized]);

  useEffect(() => {
    if (open && !minimized) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open, minimized]);

  const suggestions = useMemo(
    () => VIEW_SUGGESTIONS[activeView || 'default'] || VIEW_SUGGESTIONS.default,
    [activeView],
  );

  const send = useCallback(async (text: string) => {
    const q = text.trim();
    if (!q || loading) return;

    const history = messages.slice(-12).map(({ role, content }) => ({ role, content }));
    setMessages((p) => [...p, { role: 'user', content: q, timestamp: Date.now() }]);
    setInput('');
    setLoading(true);

    try {
      // Build enriched plan context for AI
      const planContext = plan
        ? {
            name: plan.name,
            organization: plan.organization,
            vision: plan.vision,
            planningPeriod: `${plan.planningPeriodStart}–${plan.planningPeriodEnd}`,
            swotItemCount: plan.swotItems?.length || 0,
            objectiveCount: plan.objectives?.length || 0,
            papCount: plan.paps?.length || 0,
          }
        : undefined;

      // Direct fetch to the AI edge function on the correct Supabase project
      const AI_ASSISTANT_URL = 'https://rgvteytgkugdqdodedxq.databasepad.com/functions/v1/ai-strategy-assistant';
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(AI_ASSISTANT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({
          action: 'chat',
          systemContext: BIRD_SYSTEM_CONTEXT,
          data: {
            message: q,
            activeView: activeView || 'general',
            messages: history,
            birdContext: {
              phase: 'Phase 1: Foundation Building (2026-2028)',
              currentYear: new Date().getFullYear(),
            },
          },
          plan: planContext,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI service error: ${response.status}`);
      }

      const data = await response.json();

      const reply =
        data?.data?.reply ||
        data?.data?.markdown ||
        data?.error ||
        'Sorry, I could not generate a response right now. Please try again.';

      setMessages((p) => [...p, { role: 'assistant', content: reply, timestamp: Date.now() }]);
    } catch {
      setMessages((p) => [
        ...p,
        {
          role: 'assistant',
          content:
            'I had trouble reaching the Moonshot AI service. Please check your connection and try again. If the issue persists, the AI edge function may need to be redeployed.',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [messages, loading, activeView, plan]);

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  const showSuggestions = messages.length <= 1 && !loading;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── FAB Button ─────────────────────────────────────────────────── */}
      {!open && (
        <button
          onClick={() => { setOpen(true); setMin(false); }}
          aria-label="Open AI Strategy Assistant"
          className={cn(
            'fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-full px-5 py-3',
            'bg-gradient-to-r from-fuchsia-600 via-violet-600 to-cyan-500 text-white',
            'shadow-xl shadow-fuchsia-900/40 hover:scale-105 hover:shadow-fuchsia-500/30',
            'transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400',
          )}
        >
          <Sparkles className="w-5 h-5 flex-shrink-0" />
          <span className="hidden sm:inline font-semibold text-sm tracking-wide">BIRD AI</span>
        </button>
      )}

      {/* ── Chat Window ─────────────────────────────────────────────────── */}
      {open && (
        <div
          className={cn(
            'fixed bottom-5 right-5 z-50 flex flex-col rounded-2xl border border-border bg-card',
            'shadow-2xl shadow-black/40 overflow-hidden transition-all duration-300',
            'w-[calc(100vw-2.5rem)] sm:w-[420px]',
            minimized ? 'h-14' : 'h-[72vh] max-h-[600px]',
          )}
          role="dialog"
          aria-label="BIRD AI Strategy Assistant"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2 px-4 py-3 bg-gradient-to-r from-fuchsia-700 via-violet-700 to-cyan-600 text-white flex-shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <AIStrategistAvatar size="sm" />
              <div className="min-w-0">
                <p className="font-bold text-sm leading-tight">BIRD AI</p>
                <p className="text-[10px] text-white/70 truncate">BARMM Investment & Strategy Expert</p>
              </div>
              {loading && (
                <div className="flex items-center gap-1 bg-white/10 rounded-full px-2 py-0.5">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span className="text-[10px]">Thinking…</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMin((m) => !m)}
                aria-label={minimized ? 'Expand' : 'Minimize'}
                className="p-1.5 rounded-md hover:bg-white/20 transition-colors"
              >
                {minimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              <button
                onClick={() => { setOpen(false); setMin(false); }}
                aria-label="Close"
                className="p-1.5 rounded-md hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body — hidden when minimized */}
          {!minimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-background/60 backdrop-blur-sm">
                {messages.map((m, i) => (
                  <div key={i} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                    {m.role === 'assistant' && (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-fuchsia-600 to-cyan-500 flex-shrink-0 mr-2 mt-1 flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <div
                      className={cn(
                        'max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-wrap leading-relaxed',
                        m.role === 'user'
                          ? 'bg-gradient-to-br from-cyan-600 to-blue-600 text-white rounded-br-sm'
                          : 'bg-muted text-foreground rounded-bl-sm border border-border/40',
                      )}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}

                {/* Loading indicator */}
                {loading && (
                  <div className="flex justify-start">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-fuchsia-600 to-cyan-500 flex-shrink-0 mr-2 mt-1 flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                    <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-2.5 border border-border/40 flex items-center gap-2">
                      <span className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <span
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce"
                            style={{ animationDelay: `${i * 0.15}s` }}
                          />
                        ))}
                      </span>
                      <span className="text-xs text-muted-foreground">Analyzing BIRD data…</span>
                    </div>
                  </div>
                )}

                {/* Quick suggestions */}
                {showSuggestions && (
                  <div className="space-y-2 pt-1">
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider px-1">
                      Suggested for {activeView || 'you'}
                    </p>
                    <div className="grid grid-cols-1 gap-1.5">
                      {suggestions.map(({ icon: Icon, label }) => (
                        <button
                          key={label}
                          onClick={() => send(label)}
                          className={cn(
                            'flex items-start gap-2.5 text-left rounded-xl border border-border/60 bg-card/80',
                            'px-3 py-2 text-xs leading-snug transition-all duration-150',
                            'hover:border-fuchsia-500/60 hover:bg-fuchsia-500/5 hover:text-fuchsia-600',
                            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-fuchsia-500',
                          )}
                        >
                          <Icon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-muted-foreground" />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div ref={endRef} />
              </div>

              {/* Input */}
              <div className="flex items-center gap-2 border-t border-border/60 p-2.5 bg-card flex-shrink-0">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Ask about BIRD strategy, BARMM context…"
                  disabled={loading}
                  aria-label="Message BIRD AI"
                  className={cn(
                    'flex-1 rounded-full bg-muted border border-border/40 px-4 py-2 text-sm',
                    'outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500/30',
                    'placeholder:text-muted-foreground/50 disabled:opacity-50',
                    'transition-all duration-150',
                  )}
                />
                <button
                  onClick={() => send(input)}
                  disabled={loading || !input.trim()}
                  aria-label="Send message"
                  className={cn(
                    'flex-shrink-0 rounded-full p-2.5 text-white transition-all duration-150',
                    'bg-gradient-to-br from-fuchsia-600 to-cyan-500',
                    'hover:from-fuchsia-500 hover:to-cyan-400 hover:scale-105',
                    'disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500',
                  )}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              {/* Footer note */}
              <div className="px-4 py-1.5 bg-card border-t border-border/30 flex-shrink-0">
                <p className="text-[10px] text-muted-foreground/50 text-center">
                  BIRD AI · BOI-MTIT, BARMM · Powered by Moonshot AI
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default React.memo(FloatingAIAssistant);
