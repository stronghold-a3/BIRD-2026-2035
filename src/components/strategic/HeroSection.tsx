// src/components/strategic/HeroSection.tsx
// BIRD 2026–2035 · Landing Page with Rich Media Context
// Embedded videos, images, and external site links as interactive reference points

import React, { useState } from 'react';
import {
  LayoutDashboard, Target, Sparkles, Network, ChartBar as BarChart3,
  FolderKanban, FileText, Wifi, ArrowRight, Play, LogIn, User,
  ClipboardCheck, Star, Video, Image as ImageIcon, ExternalLink,
  BookOpen, ChevronRight
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { BIRD_VIDEOS, BIRD_IMAGES, BIRD_SITES } from "@/lib/bird-urls";

interface HeroSectionProps {
  onStartPlanning: () => void;
  onViewDemo: () => void;
  onSignIn?: () => void;
  onOpenValidationSurvey?: () => void;
  isAuthenticated?: boolean;
  userName?: string;
}

const features = [
  { icon: LayoutDashboard, title: 'MEL Dashboard', description: 'Monitor, evaluate, and learn in one place with live status and insights.', color: 'from-cyan-500 to-blue-600' },
  { icon: Target, title: 'SWOT Analysis', description: 'Guided forms ensure complete, consistent environmental diagnostics.', color: 'from-emerald-500 to-teal-600' },
  { icon: Network, title: 'Systems Thinking', description: 'Visualize non-linear relationships across SWOT elements to surface leverage points.', color: 'from-pink-500 to-rose-600' },
  { icon: Sparkles, title: 'Strategy Matrix', description: 'Auto-derive SO, ST, WO, and WT strategic options aligned to your context.', color: 'from-amber-500 to-orange-600' },
  { icon: BarChart3, title: 'Balanced Scorecard', description: 'Smart categorization into four perspectives with automated KPI tracking.', color: 'from-blue-500 to-indigo-600' },
  { icon: FolderKanban, title: 'PAPs Management', description: 'Track Programs, Activities, and Projects with automated budget totaling.', color: 'from-teal-500 to-cyan-600' },
  { icon: FileText, title: 'Plan Generator', description: 'Produce print-ready, professional reports for official documentation.', color: 'from-slate-500 to-slate-700' },
  { icon: Wifi, title: 'Offline-First', description: 'Progressive Web App (PWA) capabilities allow you to plan anywhere, anytime.', color: 'from-purple-500 to-violet-600' },
];

/** Video card with embedded player dialog */
const VideoCard: React.FC<{ video: typeof BIRD_VIDEOS[keyof typeof BIRD_VIDEOS] }> = ({ video }) => {
  const [isOpen, setIsOpen] = useState(false);
  const videoId = video.url.split("/").pop()?.split("?")[0];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="group relative rounded-xl overflow-hidden border border-[#C9A84C]/20 hover:border-[#C9A84C]/50 transition-all bg-[#011a12] text-left w-full">
          <div className="aspect-video bg-gradient-to-br from-[#022c22] to-[#064e3b] flex items-center justify-center relative">
            <div className="w-16 h-16 rounded-full bg-[#C9A84C]/20 border-2 border-[#C9A84C]/40 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play className="w-7 h-7 text-[#C9A84C] fill-current ml-1" />
            </div>
            <Badge className="absolute top-3 right-3 bg-black/50 text-[#C9A84C] border-[#C9A84C]/30 text-[10px]">
              {video.duration}
            </Badge>
          </div>
          <div className="p-4">
            <p className="text-sm font-semibold text-[#E8C560] line-clamp-2 group-hover:text-[#C9A84C]">{video.title}</p>
            <p className="text-[10px] text-[#ecfdf5]/40 mt-1">{video.description}</p>
          </div>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl bg-[#022c22] border-[#C9A84C]/30">
        <DialogHeader>
          <DialogTitle className="text-[#C9A84C] font-serif">{video.title}</DialogTitle>
        </DialogHeader>
        <div className="aspect-video rounded-lg overflow-hidden border border-[#C9A84C]/20">
          <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${videoId}`}
            title={video.title} frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen className="w-full h-full" />
        </div>
        <p className="text-sm text-[#ecfdf5]/70">{video.description}</p>
      </DialogContent>
    </Dialog>
  );
};

/** Image reference card with lightbox */
const ImageRefCard: React.FC<{ image: typeof BIRD_IMAGES[keyof typeof BIRD_IMAGES] }> = ({ image }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="group relative rounded-xl overflow-hidden border border-[#C9A84C]/20 hover:border-[#C9A84C]/50 transition-all bg-[#011a12] text-left w-full">
          <div className="aspect-[4/3] bg-[#022c22] relative">
            <img src={image.url} alt={image.alt}
              className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
              loading="lazy"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#011a12] via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3">
              <Badge variant="outline" className="text-[9px] border-[#C9A84C]/30 text-[#C9A84C]/80 bg-black/30">
                {image.category}
              </Badge>
            </div>
          </div>
          <div className="p-3">
            <p className="text-xs font-semibold text-[#E8C560] line-clamp-1">{image.title}</p>
          </div>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl bg-[#022c22] border-[#C9A84C]/30">
        <DialogHeader>
          <DialogTitle className="text-[#C9A84C] font-serif">{image.title}</DialogTitle>
        </DialogHeader>
        <img src={image.url} alt={image.alt} className="w-full rounded-lg border border-[#C9A84C]/20" />
        <p className="text-sm text-[#ecfdf5]/70">{image.alt}</p>
      </DialogContent>
    </Dialog>
  );
};

const HeroSection: React.FC<HeroSectionProps> = ({
  onStartPlanning, onViewDemo, onSignIn, onOpenValidationSurvey, isAuthenticated, userName
}) => {
  const allVideos = Object.values(BIRD_VIDEOS);
  const frameworkImages = Object.values(BIRD_IMAGES).filter(img => img.category === 'framework' || img.category === 'cluster');
  const siteLinks = Object.values(BIRD_SITES);

  return (
    <div className="min-h-screen bg-slate-900 selection:bg-cyan-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10">
        {/* Navigation Bar */}
        <nav className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-cyan-400/50 shadow-lg shadow-cyan-500/20 bg-slate-900">
                <img src="https://rgvteytgkugdqdodedxq.databasepad.com/storage/v1/object/public/bird-images/public/MTIT%20Logo.webp"
                  alt="BIRD 2026-2035" className="w-full h-full object-cover" />
              </div>
              <div className="hidden sm:block">
                <h1 className="font-bold text-sm tracking-tight text-white">BIRD<span className="text-cyan-400 font-black"> 2026-2035</span></h1>
                <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Strategic Plan</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-800/50 rounded-full border border-slate-700">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Live</span>
              </div>
              {isAuthenticated ? (
                <button onClick={onStartPlanning}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-semibold transition-all border border-slate-700">
                  <User className="w-4 h-4 text-cyan-400" /> {userName || 'Dashboard'}
                </button>
              ) : (
                <button onClick={onSignIn}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-slate-900 hover:bg-cyan-50 rounded-lg text-sm font-bold transition-all">
                  <LogIn className="w-4 h-4" /> Sign In
                </button>
              )}
            </div>
          </div>
        </nav>

        {/* Hero Body */}
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-8">
            <Sparkles className="w-3.5 h-3.5" /> Official BIRD 2026–2035 Strategic Planning Platform
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight leading-[1.1]">
            Emerging Bangsamoro: <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400">
              A Hub for Resilient and Ethical Growth.
            </span>
          </h1>
          <p className="text-lg text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            The official AI-powered platform for the Bangsamoro Investment Roadmap Development 2026–2035.
            Diagnose, strategize, monitor, and learn — all in one place, grounded in the BEIE framework
            and five strategic leverage points.
          </p>

          {/* Primary Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <button onClick={onStartPlanning}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-cyan-500/40 transition-all hover:-translate-y-1 flex items-center justify-center gap-2">
              Open My Strategic Workspace <ArrowRight className="w-5 h-5" />
            </button>
            <button onClick={onViewDemo}
              className="w-full sm:w-auto px-8 py-4 bg-slate-800 text-white rounded-xl font-bold text-lg border border-slate-700 hover:bg-slate-700 transition-all flex items-center justify-center gap-2">
              <Play className="w-5 h-5 text-cyan-400" /> Load BIRD Sample Plan
            </button>
          </div>

          {/* Golden Validation Survey CTA */}
          <div className="mb-20">
            <button onClick={onOpenValidationSurvey || onStartPlanning}
              className="inline-flex w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-[#C9A84C] to-[#B8943F] hover:from-[#E8C560] hover:to-[#C9A84C] text-[#022c22] rounded-xl font-bold text-lg transition-all hover:-translate-y-1 items-center justify-center gap-3 shadow-lg shadow-[#C9A84C]/20 hover:shadow-[#C9A84C]/40 ring-2 ring-[#C9A84C]/50">
              <Star className="w-6 h-6 fill-current" /> Take BIRD Validation Survey <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-sm text-[#C9A84C]/80 mt-3 font-medium">Help shape the future of BARMM investment planning</p>
          </div>

          {/* BIRD Banner */}
          <div className="relative max-w-6xl mx-auto mb-16 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl shadow-cyan-900/30">
            <img src="https://rgvteytgkugdqdodedxq.databasepad.com/storage/v1/object/public/bird-images/public/BIRD%20Banner.png"
              alt="BIRD 2026-2035 Strategic Plan" className="w-full h-auto object-cover" loading="eager"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════
            CONTEXT & REFERENCE SECTION — Videos, Images, Sites
        ═══════════════════════════════════════════════════════════════════════ */}
        <div className="max-w-7xl mx-auto px-6 py-16 border-t border-slate-800">
          <div className="text-center mb-12">
            <Badge variant="outline" className="border-[#C9A84C]/30 text-[#C9A84C] px-4 py-1.5 text-xs font-serif tracking-wide mb-4">
              <BookOpen className="w-3.5 h-3.5 mr-1.5 inline" /> Context & References
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Learn the <span className="text-[#C9A84C]">Framework</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Explore the videos, visualizations, and reference materials that ground the BIRD 2026–2035 methodology.
            </p>
          </div>

          {/* Videos Grid */}
          <div className="mb-16">
            <div className="flex items-center gap-2 mb-6">
              <Video className="w-5 h-5 text-[#C9A84C]" />
              <h3 className="text-xl font-bold text-white">Educational Videos</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {allVideos.map((video, idx) => (
                <VideoCard key={idx} video={video} />
              ))}
            </div>
          </div>

          {/* Framework Images Grid */}
          <div className="mb-16">
            <div className="flex items-center gap-2 mb-6">
              <ImageIcon className="w-5 h-5 text-[#C9A84C]" />
              <h3 className="text-xl font-bold text-white">Framework Visualizations</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {frameworkImages.map((image, idx) => (
                <ImageRefCard key={idx} image={image} />
              ))}
            </div>
          </div>

          {/* External Site Links */}
          <div className="mb-16">
            <div className="flex items-center gap-2 mb-6">
              <ExternalLink className="w-5 h-5 text-[#C9A84C]" />
              <h3 className="text-xl font-bold text-white">BIRD Ecosystem</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {siteLinks.map((site, idx) => (
                <a key={idx} href={site.url} target="_blank" rel="noopener noreferrer"
                  className="group flex items-center gap-3 p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-[#C9A84C]/50 hover:bg-[#C9A84C]/5 transition-all">
                  <div className="w-10 h-10 rounded-lg bg-[#C9A84C]/10 flex items-center justify-center group-hover:bg-[#C9A84C]/20">
                    <ExternalLink className="w-5 h-5 text-[#C9A84C]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white group-hover:text-[#E8C560] transition-colors">{site.title}</p>
                    <p className="text-[10px] text-slate-500 truncate">{site.description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-[#C9A84C]" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-7xl mx-auto px-6 py-24 border-t border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="group p-6 rounded-2xl hover:bg-slate-800/50 transition-all duration-300 border border-transparent hover:border-slate-700">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3 tracking-tight">{feature.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* C.A.R.E. Framework */}
        <div className="max-w-7xl mx-auto px-6 py-24 border-t border-slate-800">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">
              <span>Our Guiding Philosophy</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              The <span className="text-emerald-400">C.A.R.E.</span> Framework & <span className="text-amber-400">Khalifa</span> Stewardship
            </h2>
            <p className="text-slate-400 max-w-3xl mx-auto text-lg">
              Transforming the Bangsamoro requires more than capital; it requires a paradigm rooted in stewardship.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { letter: "C", title: "Context-Specific", desc: "Grounded in BARMM realities, requiring explicit local partnership and faith-sensitive design.", color: "from-emerald-500 to-teal-600" },
              { letter: "A", title: "Action-Oriented", desc: "Focused on identified leverage points, binding constraints, and executable interventions.", color: "from-blue-500 to-indigo-600" },
              { letter: "R", title: "Real-time & Non-linear", desc: "Embracing systems thinking, adaptive management, and dynamic feedback loops.", color: "from-purple-500 to-pink-600" },
              { letter: "E", title: "Evidence-Based", desc: "Driven by quantitative indicators, PSA data, and international benchmarks (OIC/SMIIC).", color: "from-amber-500 to-orange-600" }
            ].map((item) => (
              <div key={item.letter} className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition-all">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 text-2xl font-black text-white`}>
                  {item.letter}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="max-w-3xl mx-auto px-6 pb-32 text-center">
          <div className="p-12 rounded-3xl bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 shadow-3xl">
            <h2 className="text-3xl font-black text-white mb-4">Ready to Drive the Bangsamoro Investment Boom?</h2>
            <p className="text-slate-400 mb-10">
              Join BOI-MTIT BARMM's BIRD 2026–2035 platform and transform the Bangsamoro investment vision into structured, measurable, and executable reality.
            </p>
            <button onClick={onStartPlanning}
              className="px-10 py-5 bg-white text-slate-900 rounded-2xl font-black text-xl hover:bg-cyan-400 transition-all hover:scale-105 active:scale-95">
              Start Planning Now →
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-800 py-12 bg-slate-950/50">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col items-center md:items-start gap-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-cyan-500 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M12 2L2 19h20L12 2z" />
                  </svg>
                </div>
                <span className="font-bold text-white tracking-tight">BIRD 2026-2035</span>
              </div>
              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">BOI-MTIT, BARMM © 2026 · Built by ASilva Innovations</p>
            </div>
            <div className="flex gap-8 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <a href="https://bird-resources.asilvainnovations.com" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">Documentation</a>
              <a href="#" className="hover:text-cyan-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-cyan-400 transition-colors">System Status</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default HeroSection;
