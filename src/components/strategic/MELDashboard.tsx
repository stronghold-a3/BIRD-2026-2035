import React, { useMemo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from '@/lib/motion-shim';
import {
  TrendingUp, AlertTriangle, CheckCircle2, Clock, Target,
  DollarSign, Users, Cog, GraduationCap, ArrowUpRight,
  FolderKanban, Info, X, Send, Sparkles, Globe, ChevronDown,
  Loader2, ExternalLink, BookOpen, GitBranch, BrainCircuit, Layers,
  ArrowRight, Play, Zap, Shield, Leaf,
} from 'lucide-react';
import { StrategicPlan } from '@/lib/strategicPlanStore';

// ─── BIRD 2026-2035 Data ──────────────────────────────────────────────────────
import { PARETO_KPIS }                                     from '@/data/bird/kpis';
import { BSC_LEVERAGE_POINTS as BSC_POINTS }               from '@/data/bird/kpis';
import { ACTION_PLAN_2026 as PRIORITY_ACTIONS }            from '@/data/bird/actions';
import { CAUSAL_LOOPS as FEEDBACK_LOOPS }                  from '@/data/bird/clds';
import { PHASES, TOTAL_BUDGET }                            from '@/data/bird/phases';
import { EDGE_FUNCTIONS, BRAND_ASSETS }                    from '@/lib/supabase';

// ─── Import HeroSection from external file ────────────────────────────────────
import HeroSection from './HeroSection';

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
 
