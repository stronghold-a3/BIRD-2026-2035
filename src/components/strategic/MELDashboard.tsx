import React, { useMemo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from '@/lib/motion-shim';
import {
  TrendingUp, AlertTriangle, CheckCircle2, Clock, Target,
  DollarSign, Users, Cog, GraduationCap, ArrowUpRight,
  FolderKanban, Info, X, Send, Sparkles, Globe, ChevronDown,
  Loader2, ExternalLink, BookOpen, GitBranch, BrainCircuit, Layers,
} from 'lucide-react';
import { StrategicPlan } from '@/lib/strategicPlanStore';

// ─── BIRD 2026-2035 Data ──────────────────────────────────────────────────────
import { PARETO_KPIS }                                     from '@/data/bird/kpis';
import { BSC_LEVERAGE_POINTS as BSC_POINTS }               from '@/data/bird/kpis';
import { ACTION_PLAN_2026 as PRIORITY_ACTIONS }            from '@/data/bird/actions';
import { CAUSAL_LOOPS as FEEDBACK_LOOPS }                  from '@/data/bird/clds';
import { PHASES, TOTAL_BUDGET }                            from '@/data/bird/phases';
import { EDGE_FUNCTIONS, BRAND_ASSETS }                    from '@/lib/supabase';

// ─── Asset constants (env-var backed) ────────────────────────────────────────
const BIRD_BANNER_URL =
  'https://rgvteytgkugdqdodedxq.databasepad.com/storage/v1/object/public/bird-images/public/BIRD%20Banner.png';
const AI_AVATAR_URL = BRAND_ASSETS.AI_AVATAR_URL;
const AI_ENDPOINT   = EDGE_FUNCTIONS.AI_STRATEGY_ASSISTANT;

// ─── Types ────────────────────────────────────────────────────────────────────
interface MELDashboardProps {
  plan?: StrategicPlan;
  onNavigate?: (view: string) => void;
}
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────
const Tooltip: React.FC<{ children: React.ReactNode; content: string }> = ({ children, content }) => {
  const [vis, setVis] = useState(false);
  return (
    <div className="relative inline-flex">
      <div onMouseEnter={() => setVis(true)} onMouseLeave={() => setVis(false)} className="cursor-help">
        {children}
      </div>
      <AnimatePresence>
        {vis && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }} transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-max max-w-xs px-3 py-2 bg-slate-900 text-white text-xs rounded-lg shadow-xl pointer-events-none"
            role="tooltip"
          >
            {content}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Circular KPI Progress Ring ───────────────────────────────────────────────
const CircularProgress: React.FC<{ progress: number; color: string }> = ({ progress, color }) => {
  const radius = 31;
  const circ   = 2 * Math.PI * radius;
  const offset = circ - (circ * Math.min(progress, 100)) / 100;
  const stroke = color === 'gold' ? '#C9A84C' : color === 'teal' ? '#0d9488' : color === 'blue' ? '#3b82f6' : '#10b981';
  return (
    <div className="relative w-[76px] h-[76px] mx-auto mb-3" aria-hidden="true">
      <svg className="transform -rotate-90" width="76" height="76" viewBox="0 0 76 76">
        <circle cx="38" cy="38" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
        <motion.circle
          cx="38" cy="38" r={radius} fill="none" stroke={stroke} strokeWidth="5" strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          whileInView={{ strokeDashoffset: offset }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: [0.4, 0, 0.2, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[#C9A84C] font-bold text-sm" style={{ fontFamily: "'Cinzel', serif" }}>{progress}%</span>
        <span className="text-[0.6rem] text-[rgba(167,243,208,0.6)]">of target</span>
      </div>
    </div>
  );
};

// ─── Priority Badge ───────────────────────────────────────────────────────────
const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => {
  const map: Record<string, string> = {
    critical: 'bg-[rgba(239,68,68,0.12)] text-[#ef4444] border-[rgba(239,68,68,0.3)]',
    high:     'bg-[rgba(245,158,11,0.12)] text-[#f59e0b] border-[rgba(245,158,11,0.3)]',
    medium:   'bg-[rgba(59,130,246,0.12)] text-[#93c5fd] border-[rgba(59,130,246,0.3)]',
  };
  const dot = priority === 'critical' ? '🔴' : priority === 'high' ? '🟡' : '🔵';
  return (
    <span className={`inline-flex items-center gap-1 text-[0.68rem] font-bold px-2 py-0.5 rounded border ${map[priority] || map.medium}`}>
      {dot} {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const activeStatuses = ['In Progress','Drafting','Development','Pre-Dev','Scoping','On Track'];
  const isActive = activeStatuses.includes(status);
  return (
    <span className={`inline-flex items-center gap-1.5 text-[0.68rem] font-semibold px-2 py-0.5 rounded border ${
      isActive
        ? 'bg-[rgba(59,130,246,0.12)] text-[#93c5fd] border-[rgba(59,130,246,0.3)]'
        : 'bg-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.5)] border-[rgba(255,255,255,0.1)]'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full bg-current ${isActive ? 'animate-pulse' : ''}`} aria-hidden="true" />
      {status}
    </span>
  );
};

// ─── AI Avatar ────────────────────────────────────────────────────────────────
const AIAvatar: React.FC<{ size?: number }> = ({ size = 36 }) => (
  <div
    className="relative inline-flex items-center justify-center rounded-full overflow-hidden shadow-lg ring-2 ring-[#C9A84C]/40 flex-shrink-0"
    style={{ width: size, height: size }}
    aria-hidden="true"
  >
    <img src={AI_AVATAR_URL} alt="" className="w-full h-full object-cover" />
  </div>
);

// ─── Inline markdown renderer ─────────────────────────────────────────────────
const renderMarkdown = (content: string) =>
  content.split('\n').map((line, i) => {
    if (line.startsWith('• ') || line.startsWith('- '))
      return <li key={i} className="ml-4 list-disc text-sm leading-relaxed">{line.slice(2)}</li>;
    if (/^\*\*(.+)\*\*$/.test(line))
      return <p key={i} className="font-bold text-sm mt-2">{line.replace(/\*\*/g, '')}</p>;
    if (line === '') return <div key={i} className="h-1.5" />;
    return <p key={i} className="text-sm leading-relaxed">{line.replace(/\*\*/g, '')}</p>;
  });

// ─── AI Strategist Sidebar Chat ───────────────────────────────────────────────
const AIStrategistChat: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: '0', role: 'assistant', timestamp: new Date(),
    content: `As-salamu alaykum! I'm BIRD AI — your embedded strategy consultant for the Bangsamoro Investment Roadmap 2026–2035.\n\nI bring expertise in:\n\n**Systems Thinking & Causal Analysis**\n• Feedback loop detection (R1/R2/B1-B4)\n• Meadows Leverage Points (LP1–LP5)\n• 7 BARMM Systems Archetypes\n\n**Investment & Strategy**\n• Panel A: 6 Pareto KPIs · Panel B: BSC Leverage Points\n• Panel C: Priority Action Board 2026\n• Panel E: Phase Progress (₱120–160B Roadmap)\n\n**Current Phase:** Foundation Building (2026–2028)\n**Active Focus:** BHB Operationalisation & Forestry Code\n\nWhat would you like to explore?`,
  }]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 80); }, []);

  const SUGGESTIONS = [
    'Analyze the B1 Growth-Resource Constraints feedback loop',
    'Explain how LP1 Halal Certification addresses "Fixes that Fail"',
    'What is the Phase 1 ₱35–45B budget allocation breakdown?',
    'How does the R2 Governance–Investor Confidence loop work?',
    'What are the most critical Q2 2026 actions for BHB?',
  ];

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || loading) return;

    const history = messages.slice(-14).map(({ role, content }) => ({ role, content }));
    setMessages(p => [...p, { id: Date.now().toString(), role: 'user', content: q, timestamp: new Date() }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(AI_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          data: {
            message: q,
            activeView: 'dashboard',
            messages: history,
            birdContext: { phase: 'Phase 1: Foundation Building (2026-2028)' },
          },
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const reply = data?.data?.reply || data?.data?.markdown || 'I received your question but had trouble generating a response. Please try again.';

      setMessages(p => [...p, { id: (Date.now()+1).toString(), role: 'assistant', content: reply, timestamp: new Date() }]);
    } catch {
      setMessages(p => [...p, {
        id: (Date.now()+1).toString(), role: 'assistant', timestamp: new Date(),
        content: 'I encountered a connection issue. Please check your internet connection and try again. The AI service requires the Supabase edge function to be deployed and the OPENAI_API_KEY secret to be configured.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 80, scale: 0.97 }} animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.97 }} transition={{ type: 'spring', damping: 24, stiffness: 260 }}
      className="fixed right-0 top-0 h-full w-full max-w-md z-50 flex flex-col shadow-2xl bg-[#022c22] border-l border-[rgba(201,168,76,0.32)]"
      role="dialog" aria-modal="true" aria-label="BIRD AI Strategy Assistant"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[rgba(201,168,76,0.32)] bg-[rgba(6,78,59,0.5)] flex-shrink-0">
        <AIAvatar size={36} />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[#ecfdf5] text-sm" style={{ fontFamily: "'Cinzel', serif" }}>BIRD AI Strategist</p>
          <p className="text-xs text-[#C9A84C] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" aria-hidden="true" />
            BIRD 2026–2035 · MEL Dashboard
          </p>
        </div>
        <button
          onClick={onClose} aria-label="Close AI assistant"
          className="p-1.5 rounded-lg hover:bg-white/10 text-[#ecfdf5]/60 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-[rgba(2,44,34,0.5)]"
        role="log" aria-live="polite" aria-label="Chat messages"
        style={{ scrollbarWidth: 'thin' }}
      >
        {messages.map(msg => (
          <motion.div
            key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && <AIAvatar size={28} />}
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
              msg.role === 'user'
                ? 'bg-gradient-to-br from-[#C9A84C] to-[#8B6C28] text-[#022c22] rounded-br-sm ml-2'
                : 'bg-[rgba(6,78,59,0.6)] text-[#ecfdf5] border border-[rgba(201,168,76,0.32)] rounded-bl-sm ml-2'
            }`}>
              {msg.role === 'assistant'
                ? <div className="space-y-0.5">{renderMarkdown(msg.content)}</div>
                : <p>{msg.content}</p>
              }
              <p className={`text-[10px] mt-2 opacity-50`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </motion.div>
        ))}

        {loading && (
          <div className="flex items-center gap-2">
            <AIAvatar size={28} />
            <div className="bg-[rgba(6,78,59,0.6)] border border-[rgba(201,168,76,0.32)] rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 text-[#C9A84C] animate-spin" />
              <span className="text-xs text-[#ecfdf5]/60">Analyzing BIRD data…</span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Suggestions (first message only) */}
      {messages.length === 1 && (
        <div className="px-4 pb-3 bg-[rgba(2,44,34,0.5)] flex-shrink-0">
          <p className="text-[10px] text-[#C9A84C] mb-2 font-semibold uppercase tracking-wider">Suggested questions</p>
          <div className="flex flex-col gap-1.5">
            {SUGGESTIONS.map((s, i) => (
              <button
                key={i} onClick={() => send(s)}
                className="text-left text-xs px-3 py-2 rounded-xl bg-[rgba(6,78,59,0.6)] border border-[rgba(201,168,76,0.32)] text-[#ecfdf5]/80 hover:bg-[rgba(201,168,76,0.15)] hover:text-[#C9A84C] transition"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-[rgba(201,168,76,0.32)] bg-[#022c22] flex-shrink-0">
        <div className="flex gap-2 items-end bg-[rgba(6,78,59,0.4)] border border-[rgba(201,168,76,0.32)] rounded-2xl px-4 py-3 focus-within:border-[#C9A84C] transition">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder="Ask about systems thinking, BARMM investment…"
            rows={1}
            aria-label="Message BIRD AI"
            className="flex-1 bg-transparent text-sm text-[#ecfdf5] placeholder-[#ecfdf5]/40 resize-none focus:outline-none leading-relaxed"
            style={{ maxHeight: 100 }}
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || loading}
            aria-label="Send message"
            className="p-1.5 rounded-xl bg-gradient-to-br from-[#C9A84C] to-[#8B6C28] text-[#022c22] disabled:opacity-40 hover:shadow-lg hover:shadow-[#C9A84C]/30 transition flex-shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-center text-[10px] text-[#ecfdf5]/20 mt-2">BIRD AI · BOI-MTIT, BARMM · Powered by GPT-4o</p>
      </div>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MEL DASHBOARD (Main Component)
// ═══════════════════════════════════════════════════════════════════════════════
const MELDashboard: React.FC<MELDashboardProps> = ({ onNavigate }) => {
  const [showAIChat,    setShowAIChat]    = useState(false);
  const [actionFilter,  setActionFilter]  = useState('all');
  const [bannerLoaded,  setBannerLoaded]  = useState(false);
  const [bannerError,   setBannerError]   = useState(false);

  const filteredActions = useMemo(() => PRIORITY_ACTIONS.filter(a => {
    if (actionFilter === 'all')      return true;
    if (actionFilter === 'q2')       return a.due.includes('Q2');
    if (actionFilter === 'q3')       return a.due.includes('Q3');
    if (actionFilter === 'q4')       return a.due.includes('Q4');
    return a.priority === actionFilter;
  }), [actionFilter]);

  const counts = useMemo(() => ({
    critical: PRIORITY_ACTIONS.filter(a => a.priority === 'critical').length,
    high:     PRIORITY_ACTIONS.filter(a => a.priority === 'high').length,
    q2:       PRIORITY_ACTIONS.filter(a => a.due.includes('Q2')).length,
    inProg:   PRIORITY_ACTIONS.filter(a => a.status === 'In Progress').length,
  }), []);

  const reinforcing = FEEDBACK_LOOPS.filter(l => l.type === 'reinforcing').length;
  const balancing   = FEEDBACK_LOOPS.filter(l => l.type === 'balancing').length;

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#011a12] via-[#022c22] to-[#0a1628] text-[#ecfdf5]"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >

      {/* ════════════════════════════════════════════════════════════════════════
          BIRD BANNER — Full-width hero image
          ════════════════════════════════════════════════════════════════════════ */}
      <div className="relative w-full overflow-hidden" style={{ maxHeight: 340 }}>
        {/* Gold accent line above banner */}
        <div className="absolute top-0 left-0 right-0 h-1 z-10 bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />

        {/* The banner image */}
        {!bannerError ? (
          <img
            src={BIRD_BANNER_URL}
            alt="BIRD 2026–2035 — Bangsamoro Investment Roadmap Development"
            className={`w-full object-cover object-center transition-opacity duration-700 ${bannerLoaded ? 'opacity-100' : 'opacity-0'}`}
            style={{ maxHeight: 340, minHeight: 180 }}
            onLoad={() => setBannerLoaded(true)}
            onError={() => setBannerError(true)}
            loading="eager"
            decoding="async"
          />
        ) : (
          /* Fallback gradient if image fails */
          <div className="w-full flex items-center justify-center bg-gradient-to-r from-[#022c22] via-[#064e3b] to-[#0a1628]" style={{ height: 220 }}>
            <div className="text-center">
              <p className="text-[#C9A84C] font-bold text-2xl" style={{ fontFamily: "'Cinzel', serif" }}>BIRD 2026–2035</p>
              <p className="text-[#ecfdf5]/60 text-sm mt-1">Bangsamoro Investment Roadmap Development</p>
            </div>
          </div>
        )}

        {!bannerLoaded && !bannerError && (
          <div className="absolute inset-0 bg-gradient-to-r from-[#022c22] via-[#064e3b] to-[#0a1628] animate-pulse" style={{ minHeight: 180 }} />
        )}

        {/* Gradient overlay — ensures text below reads cleanly */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#011a12]/10 to-[#011a12]" />

        {/* Overlay chips */}
        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2 z-10">
          <span className="bg-[#022c22]/80 backdrop-blur-sm border border-[rgba(201,168,76,0.5)] text-[#C9A84C] text-[0.65rem] font-bold px-3 py-1 rounded-full">
            Phase 1: Foundation Building 2026–2028
          </span>
          <span className="bg-[#022c22]/80 backdrop-blur-sm border border-[rgba(16,185,129,0.4)] text-[#6ee7b7] text-[0.65rem] font-bold px-3 py-1 rounded-full">
            Total Roadmap: {TOTAL_BUDGET.label}
          </span>
          <span className="bg-[#022c22]/80 backdrop-blur-sm border border-[rgba(255,255,255,0.15)] text-[#ecfdf5]/70 text-[0.65rem] px-3 py-1 rounded-full">
            BOI-MTIT, BARMM
          </span>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          DASHBOARD HEADER
          ════════════════════════════════════════════════════════════════════════ */}
      <header className="max-w-[1400px] mx-auto px-4 pt-8 pb-6 relative">
        <div className="inline-block bg-[rgba(201,168,76,0.10)] border border-[rgba(201,168,76,0.55)] text-[#C9A84C] px-4 py-1 rounded-full text-[0.68rem] font-bold tracking-widest uppercase mb-4">
          Strategic MEL Dashboard · Phase 1: Foundation Building
        </div>
        <h1
          className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#7a5c1e] via-[#E8C560] to-[#7a5c1e] bg-clip-text text-transparent leading-tight mb-2"
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          The Emerging Bangsamoro
        </h1>
        <p className="text-[#ecfdf5]/60 max-w-2xl leading-relaxed text-sm md:text-base">
          Monitoring, Evaluation &amp; Learning — 2026 Priority Actions &amp; 2035 Investment Targets.
          Applying the <strong className="text-[#C9A84C]">Pareto Principle</strong> to surface the vital few metrics
          that drive 80% of strategic impact, aligned with the BIRD 2026–2035 Roadmap.
        </p>

        <div className="flex flex-wrap items-center gap-4 mt-6">
          <div className="text-xs text-[#ecfdf5]/45 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
            <time dateTime={new Date().toISOString().split('T')[0]}>
              Live MEL · {new Date().toLocaleDateString('en-PH', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
            </time>
          </div>
          <div className="text-xs bg-[rgba(201,168,76,0.08)] border border-[rgba(201,168,76,0.32)] rounded px-3 py-1.5 text-[#C9A84C] flex items-center gap-1.5">
            <Target className="w-3 h-3" aria-hidden="true" />
            Pareto Focus: 6 Critical KPIs · 10 Priority Actions · {TOTAL_BUDGET.label} Total Roadmap Budget
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 pb-24 flex flex-col gap-10">

        {/* MEL Legend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="flex flex-wrap gap-4 p-4 bg-[rgba(2,44,34,0.4)] border border-[rgba(201,168,76,0.32)] rounded-lg"
          role="note" aria-label="MEL status legend"
        >
          {[
            { color: '#10b981', label: 'On Track' },
            { color: '#C9A84C', label: 'Building / In Progress' },
            { color: '#3b82f6', label: 'Watch / Early Stage' },
            { color: '#f59e0b', label: 'At Risk' },
            { color: '#ef4444', label: 'Critical / Behind' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2 text-xs text-[#d1fae5]/70">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} aria-hidden="true" />
              {label}
            </div>
          ))}
          <div className="ml-auto text-[0.7rem] text-[#ecfdf5]/35">
            Baselines: 2024 PSA / BBOI / MTIT. Targets: BIRD 2026-2035.
          </div>
        </motion.div>

        {/* ── PANEL A: Pareto Vital Few KPIs ─────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="bg-[rgba(6,78,59,0.15)] border border-[rgba(201,168,76,0.32)] rounded-2xl p-6 md:p-8 relative overflow-hidden"
          aria-labelledby="panel-a-title"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#7a5c1e] via-[#E8C560] to-[#7a5c1e]" aria-hidden="true" />
          <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
            <div>
              <span className="text-[0.68rem] font-bold tracking-widest uppercase text-[#C9A84C] block mb-1">Panel A · Pareto Vital Few</span>
              <h2 id="panel-a-title" className="text-xl md:text-2xl font-bold text-white" style={{ fontFamily: "'Cinzel', serif" }}>
                Key Investment Targets — 2035 Vision
              </h2>
              <div className="w-10 h-1 bg-gradient-to-r from-[#7a5c1e] via-[#E8C560] to-[#7a5c1e] rounded-full mt-2" aria-hidden="true" />
            </div>
            <span className="text-xs text-[#a7f3d0]/70 bg-[rgba(6,78,59,0.4)] border border-[rgba(201,168,76,0.32)] rounded-full px-3 py-1">
              6 headline KPIs · Phase 1 progress
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {PARETO_KPIS.map((kpi, i) => (
              <motion.article
                key={kpi.id}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="bg-[rgba(2,44,34,0.6)] border border-[rgba(201,168,76,0.32)] rounded-xl p-5 text-center hover:-translate-y-1 hover:border-[rgba(201,168,76,0.55)] transition-all duration-300 relative overflow-hidden"
                aria-label={`${kpi.label}: ${kpi.current}, target ${kpi.target}`}
              >
                <div className={`absolute top-0 left-0 right-0 h-0.5 ${kpi.status === 'on-track' ? 'bg-gradient-to-r from-[#10b981] to-[#6ee7b7]' : 'bg-gradient-to-r from-[#3b82f6] to-[#93c5fd]'}`} aria-hidden="true" />
                <CircularProgress progress={kpi.progress} color={kpi.ringColor} />
                <div className="text-xs font-bold text-white mb-1 leading-tight" style={{ fontFamily: "'Cinzel', serif" }}>{kpi.label}</div>
                <div className="text-xs text-[#6ee7b7] font-semibold mb-0.5">
                  {kpi.current} <span className="text-[0.65rem] opacity-60">{kpi.currentSub}</span>
                </div>
                <div className="text-[0.68rem] text-[#ecfdf5]/40 leading-tight">Target: {kpi.target}</div>
                <span className={`inline-flex items-center gap-1 text-[0.65rem] font-bold px-2 py-0.5 rounded-full mt-2 ${kpi.delta.includes('▲') ? 'bg-[rgba(16,185,129,0.15)] text-[#10b981]' : 'bg-[rgba(245,158,11,0.15)] text-[#f59e0b]'}`}>
                  {kpi.delta}
                </span>
                <div className="text-[0.6rem] text-[#ecfdf5]/28 mt-2">{kpi.source}</div>
              </motion.article>
            ))}
          </div>
        </motion.section>

        {/* ── PANEL B: BSC Leverage Points ────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="bg-[rgba(6,78,59,0.15)] border border-[rgba(201,168,76,0.32)] rounded-2xl p-6 md:p-8 relative overflow-hidden"
          aria-labelledby="panel-b-title"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#7a5c1e] via-[#E8C560] to-[#7a5c1e]" aria-hidden="true" />
          <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
            <div>
              <span className="text-[0.68rem] font-bold tracking-widest uppercase text-[#C9A84C] block mb-1">Panel B · Balanced Scorecard</span>
              <h2 id="panel-b-title" className="text-xl md:text-2xl font-bold text-white" style={{ fontFamily: "'Cinzel', serif" }}>
                Critical Leverage Points — 4 BSC Perspectives
              </h2>
              <div className="w-10 h-1 bg-gradient-to-r from-[#7a5c1e] via-[#E8C560] to-[#7a5c1e] rounded-full mt-2" aria-hidden="true" />
            </div>
            <span className="text-xs text-[#a7f3d0]/70 bg-[rgba(6,78,59,0.4)] border border-[rgba(201,168,76,0.32)] rounded-full px-3 py-1">
              LP1–LP5 · Financial · Stakeholder · Internal Process · L&amp;G
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {BSC_POINTS.slice(0, 8).map((pt, i) => (
              <motion.article
                key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="bg-[rgba(2,44,34,0.55)] border border-[rgba(201,168,76,0.32)] rounded-xl p-5 relative overflow-hidden flex flex-col gap-3 hover:-translate-y-1 hover:border-[rgba(201,168,76,0.55)] transition-all"
              >
                <div className={`absolute top-0 bottom-0 left-0 w-1 ${
                  pt.color === 'gold'  ? 'bg-gradient-to-b from-[#C9A84C] to-[#7a5c1e]'   :
                  pt.color === 'blue'  ? 'bg-gradient-to-b from-[#3b82f6] to-[#1e3a8a]'   :
                  pt.color === 'teal'  ? 'bg-gradient-to-b from-[#0d9488] to-[#134e4a]'   :
                                         'bg-gradient-to-b from-[#10b981] to-[#065f46]'
                }`} aria-hidden="true" />
                <span className="bg-gradient-to-r from-[#7a5c1e] via-[#c9a84c] to-[#7a5c1e] text-[#022c22] text-[0.62rem] font-black tracking-wider uppercase px-2 py-0.5 rounded-full w-fit">
                  {pt.lp}
                </span>
                <span className="text-[0.66rem] font-bold uppercase tracking-wider text-[#ecfdf5]/40">{pt.perspective}</span>
                <div className="text-sm font-bold text-white leading-tight flex-1" style={{ fontFamily: "'Cinzel', serif" }}>{pt.action}</div>
                <div className="text-xs text-[#6ee7b7] italic leading-tight">{pt.kpi}</div>
                <div className="mt-auto">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[0.7rem] text-[#ecfdf5]/55">{pt.current}</span>
                    <span className="text-[0.7rem] font-bold text-[#C9A84C]">{pt.target}</span>
                  </div>
                  <div className="h-1 bg-[rgba(255,255,255,0.08)] rounded-sm overflow-hidden" role="progressbar" aria-valuenow={pt.progress} aria-valuemin={0} aria-valuemax={100} aria-label={`${pt.kpi}: ${pt.progress}%`}>
                    <motion.div
                      className={`h-full rounded-sm ${
                        pt.color === 'gold'  ? 'bg-gradient-to-r from-[#C9A84C] to-[#E8C560]'  :
                        pt.color === 'blue'  ? 'bg-gradient-to-r from-[#3b82f6] to-[#93c5fd]'  :
                        pt.color === 'teal'  ? 'bg-gradient-to-r from-[#0d9488] to-[#6ee7b7]'  :
                                               'bg-gradient-to-r from-[#10b981] to-[#6ee7b7]'
                      }`}
                      initial={{ width: 0 }} whileInView={{ width: `${pt.progress}%` }} viewport={{ once: true }}
                      transition={{ duration: 1.6, ease: [0.4, 0, 0.2, 1] }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-1.5">
                    <StatusBadge status={pt.status} />
                    {pt.statusSub && <span className="text-[0.68rem] text-[#ecfdf5]/35 truncate ml-2">{pt.statusSub}</span>}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </motion.section>

        {/* ── PANEL C: Priority Action Board ──────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="bg-[rgba(6,78,59,0.15)] border border-[rgba(201,168,76,0.32)] rounded-2xl p-6 md:p-8 relative overflow-hidden"
          aria-labelledby="panel-c-title"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#7a5c1e] via-[#E8C560] to-[#7a5c1e]" aria-hidden="true" />
          <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
            <div>
              <span className="text-[0.68rem] font-bold tracking-widest uppercase text-[#C9A84C] block mb-1">Panel C · Priority Action Plan 2026</span>
              <h2 id="panel-c-title" className="text-xl md:text-2xl font-bold text-white" style={{ fontFamily: "'Cinzel', serif" }}>
                Urgent &amp; Priority Actions — Foundation Phase
              </h2>
              <div className="w-10 h-1 bg-gradient-to-r from-[#7a5c1e] via-[#E8C560] to-[#7a5c1e] rounded-full mt-2" aria-hidden="true" />
            </div>
            <span className="text-xs text-[#a7f3d0]/70 bg-[rgba(6,78,59,0.4)] border border-[rgba(201,168,76,0.32)] rounded-full px-3 py-1">
              {counts.critical} Critical · {counts.high} High · 10 total actions
            </span>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { color: '#ef4444', val: counts.critical, lbl: 'Critical Actions' },
              { color: '#f59e0b', val: counts.high,     lbl: 'High Priority'    },
              { color: '#10b981', val: counts.q2,       lbl: 'Due Q2 2026'     },
              { color: '#C9A84C', val: counts.inProg,   lbl: 'In Progress'     },
            ].map(({ color, val, lbl }) => (
              <div key={lbl} className="bg-[rgba(2,44,34,0.5)] border border-[rgba(201,168,76,0.32)] rounded-lg p-4 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: color }} aria-hidden="true" />
                <div className="text-2xl font-bold" style={{ color, fontFamily: "'Cinzel', serif" }}>{val}</div>
                <div className="text-[0.7rem] text-[#a7f3d0]/70 uppercase tracking-wider">{lbl}</div>
              </div>
            ))}
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap gap-2 mb-5" role="group" aria-label="Filter actions">
            {[
              { key: 'all',      label: 'All Actions' },
              { key: 'critical', label: '🔴 Critical'  },
              { key: 'high',     label: '🟡 High'      },
              { key: 'q2',       label: '📅 Due Q2'    },
              { key: 'q3',       label: '📅 Due Q3'    },
              { key: 'q4',       label: '📅 Due Q4'    },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActionFilter(key)}
                aria-pressed={actionFilter === key}
                className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                  actionFilter === key
                    ? 'bg-gradient-to-r from-[#7a5c1e] via-[#c9a84c] to-[#7a5c1e] text-[#022c22] border-[#C9A84C] font-bold'
                    : 'bg-[rgba(2,44,34,0.6)] border-[rgba(201,168,76,0.32)] text-[#a7f3d0]/80 hover:border-[rgba(201,168,76,0.55)] hover:text-[#C9A84C]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-[rgba(201,168,76,0.32)]">
            <table className="w-full text-sm min-w-[800px]" aria-label="Priority Action Plan 2026">
              <thead>
                <tr className="bg-[rgba(201,168,76,0.1)] border-b-2 border-[rgba(201,168,76,0.32)]">
                  {['Strategic Objective','Programme / Action','Priority','Due','MEL Status','Budget','Lead Unit'].map(h => (
                    <th key={h} className="p-3 text-left text-[#C9A84C] font-bold text-xs tracking-wider" style={{ fontFamily: "'Cinzel', serif" }} scope="col">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredActions.map(action => (
                    <motion.tr
                      key={action.id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="border-b border-[rgba(201,168,76,0.08)] hover:bg-[rgba(201,168,76,0.05)] transition-colors"
                    >
                      <td className="p-4 align-top">
                        <span className="inline-block bg-[rgba(201,168,76,0.12)] border border-[rgba(201,168,76,0.32)] rounded px-1.5 py-0.5 text-[0.65rem] text-[#C9A84C] font-bold">{action.lp}</span>
                        <div className="font-semibold text-white mt-1">{action.objective}</div>
                        <div className="text-xs text-[#d1fae5]/65 mt-1 max-w-xs">{action.desc}</div>
                      </td>
                      <td className="p-4 align-top max-w-xs">
                        <div className="font-bold text-white">{action.action}</div>
                        <div className="text-xs text-[#d1fae5]/65 mt-1 line-clamp-3">{action.actionDesc}</div>
                      </td>
                      <td className="p-4 align-top text-center"><PriorityBadge priority={action.priority} /></td>
                      <td className="p-4 align-top text-center text-xs text-[#6ee7b7] font-semibold whitespace-nowrap">{action.due}</td>
                      <td className="p-4 align-top"><StatusBadge status={action.status} /></td>
                      <td className="p-4 align-top text-right font-bold text-[#C9A84C] whitespace-nowrap" style={{ fontFamily: "'Cinzel', serif" }}>{action.budget}</td>
                      <td className="p-4 align-top">
                        <div className="text-xs font-bold text-white">{action.lead}</div>
                        <div className="text-xs text-[#a7f3d0]/80">{action.support}</div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {filteredActions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-[#ecfdf5]/40 text-sm">No actions match this filter.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.section>

        {/* ── PANEL D: Feedback Loop Health Monitor ───────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="bg-[rgba(6,78,59,0.15)] border border-[rgba(201,168,76,0.32)] rounded-2xl p-6 md:p-8 relative overflow-hidden"
          aria-labelledby="panel-d-title"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#7a5c1e] via-[#E8C560] to-[#7a5c1e]" aria-hidden="true" />
          <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
            <div>
              <span className="text-[0.68rem] font-bold tracking-widest uppercase text-[#C9A84C] block mb-1">Panel D · Systems Thinking MEL</span>
              <h2 id="panel-d-title" className="text-xl md:text-2xl font-bold text-white" style={{ fontFamily: "'Cinzel', serif" }}>
                Feedback Loop Health Monitor
              </h2>
              <div className="w-10 h-1 bg-gradient-to-r from-[#7a5c1e] via-[#E8C560] to-[#7a5c1e] rounded-full mt-2" aria-hidden="true" />
            </div>
            <span className="text-xs text-[#a7f3d0]/70 bg-[rgba(6,78,59,0.4)] border border-[rgba(201,168,76,0.32)] rounded-full px-3 py-1">
              {reinforcing} reinforcing · {balancing} balancing
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEEDBACK_LOOPS.map((loop, i) => (
              <motion.article
                key={loop.id}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="bg-[rgba(2,44,34,0.55)] border border-[rgba(201,168,76,0.32)] rounded-xl p-5 relative overflow-hidden hover:-translate-y-1 transition-all"
              >
                <div
                  className={`text-3xl font-black leading-none mb-1 ${loop.type === 'reinforcing' ? 'text-[#10b981]' : 'text-[#C9A84C]'}`}
                  style={{ fontFamily: "'Cinzel', serif" }}
                  aria-label={`Loop ${loop.id}: ${loop.type}`}
                >
                  {loop.id}
                </div>
                <span className={`text-[0.6rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded inline-block mb-2 ${
                  loop.type === 'reinforcing'
                    ? 'bg-[rgba(16,185,129,0.15)] text-[#10b981] border border-[rgba(16,185,129,0.3)]'
                    : 'bg-[rgba(201,168,76,0.15)] text-[#C9A84C] border border-[rgba(201,168,76,0.32)]'
                }`}>{loop.type}</span>
                <div className="text-xs font-bold text-white mb-2 leading-tight">{loop.name}</div>
                <div
                  className="h-1 bg-[rgba(255,255,255,0.06)] rounded-sm overflow-hidden my-2"
                  role="progressbar" aria-valuenow={loop.progress} aria-valuemin={0} aria-valuemax={100}
                  aria-label={`${loop.name}: ${loop.progress}% activation`}
                >
                  <motion.div
                    className={`h-full rounded-sm ${
                      loop.color === 'green' ? 'bg-gradient-to-r from-[#10b981] to-[#6ee7b7]' :
                      loop.color === 'gold'  ? 'bg-gradient-to-r from-[#7a5c1e] via-[#c9a84c] to-[#7a5c1e]' :
                      'bg-gradient-to-r from-[#3b82f6] to-[#93c5fd]'
                    }`}
                    initial={{ width: 0 }} whileInView={{ width: `${loop.progress}%` }} viewport={{ once: true }}
                    transition={{ duration: 1.6, ease: [0.4, 0, 0.2, 1] }}
                  />
                </div>
                <div className="text-xs text-[#d1fae5]/60 leading-relaxed mt-2">{loop.desc}</div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-[#ecfdf5]/55">{loop.activation}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                    loop.status === 'active'
                      ? 'bg-[rgba(16,185,129,0.12)] text-[#10b981] border-[rgba(16,185,129,0.25)]'
                      : loop.status === 'building'
                      ? 'bg-[rgba(245,158,11,0.12)] text-[#f59e0b] border-[rgba(245,158,11,0.25)]'
                      : 'bg-[rgba(59,130,246,0.12)] text-[#93c5fd] border-[rgba(59,130,246,0.25)]'
                  }`}>{loop.health}</span>
                </div>
              </motion.article>
            ))}
          </div>
        </motion.section>

        {/* ── PANEL E: Phase Progress Tracker ─────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="bg-[rgba(6,78,59,0.15)] border border-[rgba(201,168,76,0.32)] rounded-2xl p-6 md:p-8 relative overflow-hidden"
          aria-labelledby="panel-e-title"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#7a5c1e] via-[#E8C560] to-[#7a5c1e]" aria-hidden="true" />
          <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
            <div>
              <span className="text-[0.68rem] font-bold tracking-widest uppercase text-[#C9A84C] block mb-1">Panel E · Implementation Roadmap</span>
              <h2 id="panel-e-title" className="text-xl md:text-2xl font-bold text-white" style={{ fontFamily: "'Cinzel', serif" }}>
                Phase Progress Tracker — 2026–2035
              </h2>
              <div className="w-10 h-1 bg-gradient-to-r from-[#7a5c1e] via-[#E8C560] to-[#7a5c1e] rounded-full mt-2" aria-hidden="true" />
            </div>
            <span className="text-xs text-[#a7f3d0]/70 bg-[rgba(6,78,59,0.4)] border border-[rgba(201,168,76,0.32)] rounded-full px-3 py-1">
              {TOTAL_BUDGET.label} total · 3 phases
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PHASES.map((phase, i) => (
              <motion.article
                key={phase.num}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                className="bg-[rgba(2,44,34,0.55)] border border-[rgba(201,168,76,0.32)] rounded-xl p-5 relative overflow-hidden"
              >
                <div
                  className="text-4xl font-black text-[#C9A84C] opacity-20 absolute top-4 right-5 select-none"
                  style={{ fontFamily: "'Cinzel', serif" }} aria-hidden="true"
                >
                  {phase.num}
                </div>
                <div className="text-sm font-bold text-white mb-0.5" style={{ fontFamily: "'Cinzel', serif" }}>{phase.title}</div>
                <div className="text-xs text-[#6ee7b7] font-medium mb-3">{phase.years}</div>
                <div className="text-lg font-bold text-[#C9A84C] mb-1" style={{ fontFamily: "'Cinzel', serif" }}>{phase.budget}</div>
                <div className="text-[0.65rem] text-[#ecfdf5]/35 mb-3">{phase.focus}</div>
                <StatusBadge status={phase.statusClass === 'in-progress' ? 'In Progress' : phase.statusClass === 'upcoming' ? 'Planned' : 'Pre-Dev'} />

                <div
                  className="h-1.5 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden my-3"
                  role="progressbar" aria-valuenow={phase.progress} aria-valuemin={0} aria-valuemax={100}
                  aria-label={`Phase ${phase.num} progress: ${phase.progress}%`}
                >
                  <motion.div
                    className={`h-full rounded-full ${
                      phase.num === '01' ? 'bg-gradient-to-r from-[#10b981] to-[#6ee7b7]'  :
                      phase.num === '02' ? 'bg-gradient-to-r from-[#3b82f6] to-[#93c5fd]'  :
                                           'bg-gradient-to-r from-[#8b5cf6] to-[#c4b5fd]'
                    }`}
                    initial={{ width: 0 }} whileInView={{ width: `${phase.progress}%` }} viewport={{ once: true }}
                    transition={{ duration: 1.6, ease: [0.4, 0, 0.2, 1] }}
                  />
                </div>
                <div className="text-xs text-[#ecfdf5]/40 text-right mb-4">{phase.progress}% complete</div>

                <ul className="flex flex-col gap-1.5">
                  {phase.milestones.map((m, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-[#d1fae5]/75">
                      <span
                        className={`w-2 h-2 rounded-full flex-shrink-0 mt-0.5 ${
                          m.status === 'active' ? 'bg-[#C9A84C] animate-pulse' :
                          m.status === 'done'   ? 'bg-[#10b981]' : 'bg-[#ecfdf5]/20'
                        }`}
                        aria-hidden="true"
                      />
                      <span className={m.status === 'done' ? 'text-[#d1fae5]/40 line-through' : ''}>
                        {m.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.article>
            ))}
          </div>
        </motion.section>

      </main>

      {/* Footer */}
      <footer className="text-center py-8 border-t border-[rgba(201,168,76,0.32)] mt-8">
        <p className="text-xs text-[#ecfdf5]/30">
          © 2026 BARMM · Ministry of Trade, Investments and Tourism ·{' '}
          <span className="text-[#C9A84C]">The Emerging Bangsamoro</span> · Investment Roadmap 2026–2035
        </p>
        <p className="text-[0.68rem] text-[#ecfdf5]/20 mt-1">
          Data sources: PSA, BBOI, BEZA, MTIT, MENRE (2024 baselines). Targets per BIRD 2026–2035 &amp; BDP 2023–2028.
        </p>
      </footer>

      {/* AI Chat slide-in */}
      <AnimatePresence>
        {showAIChat && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setShowAIChat(false)}
              aria-hidden="true"
            />
            <AIStrategistChat onClose={() => setShowAIChat(false)} />
          </>
        )}
      </AnimatePresence>

      {/* AI FAB */}
      <AnimatePresence>
        {!showAIChat && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
            onClick={() => setShowAIChat(true)}
            aria-label="Open BIRD AI Strategy Assistant"
            className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#022c22]/90 backdrop-blur shadow-xl shadow-[#C9A84C]/40 flex items-center justify-center border-2 border-[#C9A84C]/50 hover:border-[#C9A84C] transition"
          >
            <AIAvatar size={48} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MELDashboard;
