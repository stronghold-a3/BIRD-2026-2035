import React, { useState } from 'react';
import {
  LayoutDashboard,
  Target,
  Network,
  Sparkles,
  BarChart3,
  FolderKanban,
  FileText,
  ChevronLeft,
  ChevronRight,
  Cloud,
  Settings,
  Users,
  Layers,
  X,
  Bell,
  User,
  HelpCircle,
  ClipboardCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { StratLogo } from '@/components/branding/Logo';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isOnline: boolean;
  lastSynced: string | null;
  planName?: string;
  isMobileMenuOpen: boolean;
  onCloseMobileMenu: () => void;
  onShowTutorial: () => void;
  onShowProfile: () => void;
}

const mainMenuItems = [
  { id: 'dashboard', label: 'MEL Dashboard', icon: LayoutDashboard, description: 'Monitor, Evaluate, Learn' },
  { id: 'swot', label: 'SWOT Analysis', icon: Target, description: 'Structured Diagnostics' },
  { id: 'systems', label: 'Systems Thinking', icon: Network, description: 'Visualize Relationships' },
  { id: 'strategy', label: 'Strategy Matrix', icon: Sparkles, description: 'SO/ST/WO/WT Options' },
  { id: 'scorecard', label: 'Balanced Scorecard', icon: BarChart3, description: 'Objectives & KPIs' },
  { id: 'paps', label: 'PAPs Management', icon: FolderKanban, description: 'Programs & Projects' },
  { id: 'templates', label: 'Templates Library', icon: Layers, description: 'Reusable Plan Templates' },
  { id: 'team', label: 'Team Collaboration', icon: Users, description: 'Share & Collaborate' },
  { id: 'export', label: 'Plan Generator', icon: FileText, description: 'Export Reports' },
];

// ✅ Special item for Validation Survey (highlighted)
const specialItems = [
  {
    id: 'validation',
    label: 'Validation Survey',
    icon: ClipboardCheck,
    description: 'BIRD 2026-2035 Feedback',
    badge: 'NEW',
    highlight: true,
  },
];

const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onViewChange,
  isCollapsed,
  onToggleCollapse,
  isOnline,
  lastSynced,
  planName,
  isMobileMenuOpen,
  onCloseMobileMenu,
  onShowTutorial,
  onShowProfile,
}) => {
  const NavItem = ({ item, isSubItem = false }: { item: any, isSubItem?: boolean }) => {
    const Icon = item.icon;
    const isActive = activeView === item.id;
    const isHighlighted = item.highlight;

    return (
      <button
        // ✅ Added Unique ID for Navigation Tutorial Spotlight
        id={`nav-item-${item.id}`} 
        onClick={() => {
          onViewChange(item.id);
          if (window.innerWidth < 1024) onCloseMobileMenu();
        }}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
          isActive 
            ? isHighlighted
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/20"
              : "bg-cyan-600 text-white shadow-lg shadow-cyan-900/20"
            : isHighlighted
              ? "text-emerald-400 hover:bg-emerald-900/20 hover:text-emerald-300 border border-emerald-500/20"
              : "text-slate-400 hover:bg-slate-800 hover:text-slate-100",
          isSubItem && !isCollapsed ? "pl-9 py-2" : ""
        )}
        aria-current={isActive ? 'page' : undefined}
      >
        <Icon className={cn(
          "w-5 h-5 flex-shrink-0 transition-colors",
          isActive 
            ? "text-white" 
            : isHighlighted
              ? "group-hover:text-emerald-300"
              : "group-hover:text-cyan-400"
        )} />
        {(!isCollapsed || isMobileMenuOpen) && (
          <div className="text-left overflow-hidden flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold truncate leading-none mb-1">{item.label}</p>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-500 text-white rounded-full uppercase tracking-wider">
                  {item.badge}
                </span>
              )}
            </div>
            {!isSubItem && (
              <p className={cn(
                "text-[10px] truncate", 
                isActive 
                  ? isHighlighted ? "text-emerald-100" : "text-cyan-100"
                  : isHighlighted ? "text-emerald-500/70" : "text-slate-500"
              )}>
                {item.description}
              </p>
            )}
          </div>
        )}
        {/* Tooltip for collapsed state */}
        {isCollapsed && !isMobileMenuOpen && (
          <div className="absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-slate-700 shadow-xl">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm">{item.label}</p>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-500 text-white rounded-full uppercase tracking-wider">
                  {item.badge}
                </span>
              )}
            </div>
            <p className="text-slate-400 text-[10px] mt-0.5">{item.description}</p>
          </div>
        )}
      </button>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobileMenu}
        />
      )}
      
      {/* ✅ Added Unique ID for Main Aside Container */}
      <aside 
        id="app-sidebar" 
        className={cn(
           "fixed left-0 top-0 h-full bg-slate-900 text-white transition-all duration-300 z-50 flex flex-col border-r border-slate-800",
           isCollapsed ? "w-16" : "w-64",
           isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
         )}
      >
        {/* Header/Logo */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onViewChange('dashboard')}>
            <StratLogo size="md" className="w-8 h-8 ring-2 ring-cyan-400/40" />
            {(!isCollapsed || isMobileMenuOpen) && (
              <h1 className="font-bold text-sm tracking-tight text-white whitespace-nowrap">
                BIRD <span className="text-cyan-400">2026-2035</span>
              </h1>
            )}
          </div>
          {isMobileMenuOpen && (
            <button onClick={onCloseMobileMenu} className="p-1 hover:bg-slate-800 rounded-md lg:hidden">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          )}
        </div>

        {/* Plan Context */}
        {(!isCollapsed || isMobileMenuOpen) && (
          <div className="px-4 py-4 bg-slate-800/30">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Current Focus</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
              <p className="text-sm font-medium text-slate-200 truncate">{planName || 'Select a Plan'}</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto custom-scrollbar px-3 space-y-1">
          {/* Main Menu Items */}
          {mainMenuItems.map((item) => (
            <NavItem key={item.id} item={item} />
          ))}

          {/* ✅ Special Items Section (Validation Survey) */}
          <div className="my-4 border-t border-slate-800/50 pt-4">
            <p className={cn(
              "text-[10px] uppercase tracking-widest font-bold mb-2 px-3",
              !isCollapsed || isMobileMenuOpen ? "text-emerald-400" : "sr-only"
            )}>
              Special
            </p>
            {specialItems.map((item) => (
              <NavItem key={item.id} item={item} />
            ))}
          </div>

          {/* Settings & Tutorial */}
          <div className="my-4 border-t border-slate-800/50 pt-4">
             {/* Tutorial Button Integration */}
             <button 
               onClick={onShowTutorial}
               id="sidebar-btn-tutorial"
               className="w-full flex items-center gap-3 px-3 py-2.5 mt-1 rounded-xl text-slate-400 hover:bg-cyan-900/20 hover:text-cyan-400 transition-all"
             >
               <HelpCircle className="w-5 h-5 flex-shrink-0" />
               {(!isCollapsed || isMobileMenuOpen) && (
                 <span className="text-sm font-semibold">Guided Tour</span>
               )}
             </button>
          </div>
        </nav>

        {/* Footer */}
        <div className="mt-auto border-t border-slate-800 bg-slate-900/80 p-3">
          <div className={cn("flex flex-col gap-2", isCollapsed && !isMobileMenuOpen ? "items-center" : "")}>
            <div className="flex items-center gap-3 px-1">
              <Cloud className={cn("w-4 h-4", isOnline ? "text-emerald-400" : "text-amber-400")} />
              {(!isCollapsed || isMobileMenuOpen) && (
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-300 leading-none">
                    {isOnline ? 'CLOUD CONNECTED' : 'OFFLINE MODE'}
                  </span>
                  <span className="text-[9px] text-slate-500 mt-1">{lastSynced}</span>
                </div>
              )}
            </div>
            <button 
              onClick={onToggleCollapse}
              className="hidden lg:flex w-full items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white transition-colors"
            >
              {isCollapsed ? <ChevronRight className="w-5 h-5 mx-auto" /> : (
                <>
                  <ChevronLeft className="w-5 h-5" />
                  <span className="text-xs font-bold">COLLAPSE</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default React.memo(Sidebar);
