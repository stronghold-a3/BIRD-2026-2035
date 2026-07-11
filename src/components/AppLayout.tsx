import React, { useState, useEffect, useRef, useMemo, useCallback, lazy, Suspense } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStrategicPlan } from '@/hooks/useStrategicPlan';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { StratLogo } from '@/components/branding/Logo';
import { Loader2 } from 'lucide-react';

// ─── CRITICAL PATH: Load HeroSection immediately (first screen) ─────────────
import HeroSection from './strategic/HeroSection';

// ─── LAZY LOADED COMPONENTS (Optimizes Initial Load Time) ───────────────────
const Sidebar              = lazy(() => import('./strategic/Sidebar'));
const Topbar               = lazy(() => import('./strategic/Topbar'));
const AuthModal            = lazy(() => import('./auth/AuthModal'));
const UserProfileModal     = lazy(() => import('./auth/UserProfileModal'));
const SettingsPage         = lazy(() => import('./settings/SettingsPage'));
const SurveyWizard         = lazy(() => import('./strategic/SurveyWizard')); // ✅ Survey Wizard
const MELDashboard         = lazy(() => import('./strategic/MELDashboard'));
const SWOTAnalysis         = lazy(() => import('./strategic/SWOTAnalysis'));
const SystemsThinking      = lazy(() => import('./strategic/SystemsThinking'));
const StrategyMatrix       = lazy(() => import('./strategic/StrategyMatrix'));
const BalancedScorecard    = lazy(() => import('./strategic/BalancedScorecard'));
const PAPsManagement       = lazy(() => import('./strategic/PAPsManagement'));
const PlanExport           = lazy(() => import('./strategic/PlanExport'));
const TeamCollaboration    = lazy(() => import('./strategic/TeamCollaboration'));
const TemplatesLibrary     = lazy(() => import('./strategic/TemplatesLibrary'));
const NavigationTutorial   = lazy(() => import('./strategic/NavigationTutorial'));
const FloatingAIAssistant  = lazy(() => import('./strategic/FloatingAIAssistant'));

// ─── LOADERS ──────────────────────────────────────────────────────────────────
const GlobalLoader = React.memo(({ message }: { message: string }) => (
  <div className="min-h-screen bg-[#022c22] flex flex-col items-center justify-center p-6 text-center">
    <div className="relative mb-6">
      <StratLogo size="xl" withGlow className="animate-pulse" />
      <Loader2 className="absolute -bottom-2 -right-2 w-8 h-8 text-[#C9A84C] animate-spin" />
    </div>
    <h2 className="text-[#ecfdf5] font-bold text-xl mb-2">{message}</h2>
    <p className="text-[#ecfdf5]/60 text-sm">Initializing strategic workspace…</p>
  </div>
));

const LazyFallback = React.memo(() => (
  <div className="flex items-center justify-center min-h-[400px]">
    <Loader2 className="w-6 h-6 text-[#C9A84C] animate-spin" />
  </div>
));

// ─── PATH / VIEW MAPS ───────────────────────────────────────────────────────
const VIEW_TO_PATH: Record<string, string> = {
  dashboard:  '/mel-dashboard',
  swot:       '/swot-analysis',
  systems:    '/systems-thinking',
  strategy:   '/strategy-matrix',
  scorecard:  '/balanced-scorecard',
  paps:       '/paps-management',
  templates:  '/templates-library',
  team:       '/team-collaboration',
  settings:   '/settings',
  export:     '/export-plan',
  validation: '/survey-wizard', // ✅ Maps to SurveyWizard
};

const PATH_TO_VIEW: Record<string, string> = Object.fromEntries(
  Object.entries(VIEW_TO_PATH).map(([v, p]) => [p, v])
);

// ─── MAIN LAYOUT ──────────────────────────────────────────────────────────────
const AppLayout: React.FC = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { user, profile, isAuthenticated, isAdmin, isLoading: authLoading, signUp, signIn, signOut, resetPassword, updatePassword, updateProfile, signInWithMagicLink } = useAuth();
  const { plans, currentPlan, activeView, isOnline, lastSynced, isLoading: plansLoading, setActiveView, setCurrentPlan, createPlan, addSWOTItem, updateSWOTItem, removeSWOTItem, bulkAddSWOTItems, addStrategicOption, updateStrategicOption, removeStrategicOption, bulkAddStrategicOptions, addObjective, updateObjective, removeObjective, addKPI, updateKPI, removeKPI, addPAP, updatePAP, removePAP } = useStrategicPlan();

  const [uiState, setUiState] = useState({
    showLanding: true, sidebarCollapsed: false, isMobileMenuOpen: false,
    showAuthModal: false, showProfileModal: false, showTutorial: false, activeShareLink: null as string | null,
  });

  const updateUiState = useCallback((updates: Partial<typeof uiState>) => setUiState(prev => ({ ...prev, ...updates })), []);

  // ─── URL SYNC (Prevents startup bugs by syncing state with URL) ───────────
  useEffect(() => {
    const view = PATH_TO_VIEW[location.pathname];
    if (view) setActiveView(view);
  }, [location.pathname, setActiveView]);

  // ─── USER INFO ────────────────────────────────────────────────────────────
  const userDisplayInfo = useMemo(() => {
    const email = user?.email || '';
    const name = profile?.full_name || email.split('@')[0] || 'User';
    const initials = profile?.full_name ? profile.full_name.split(' ').map((n: string) => n[0]?.toUpperCase()).filter(Boolean).join('').slice(0, 2) : (email.charAt(0).toUpperCase() || 'U');
    return { name, initials };
  }, [profile?.full_name, user?.email]);

  // ─── HANDLERS ─────────────────────────────────────────────────────────────
  const goToView = useCallback((view: string) => {
    setActiveView(view);
    navigate(VIEW_TO_PATH[view] || '/mel-dashboard');
  }, [setActiveView, navigate]);

  const handleStartPlanning = useCallback(() => {
    updateUiState({ showLanding: false });
    if (!currentPlan) {
      if (plans.length > 0) setCurrentPlan(plans[0].id);
      else createPlan({ name: 'New Strategic Plan', organization: profile?.organization || 'My Organization' });
    }
    navigate('/mel-dashboard');
  }, [currentPlan, plans, setCurrentPlan, createPlan, profile?.organization, navigate, updateUiState]);

  const handleSignOut = useCallback(async () => {
    await signOut();
    updateUiState({ showProfileModal: false, showLanding: true });
    navigate('/');
  }, [signOut, navigate, updateUiState]);

  const navigateToView = useCallback((viewId: string) => goToView(viewId), [goToView]);

  // ─── CONTENT RENDERER ─────────────────────────────────────────────────────
  const renderContent = useCallback(() => {
    const common = { plan: currentPlan, onNavigate: navigateToView };
    switch (activeView) {
      case 'validation': return <SurveyWizard />; // ✅ Renders Survey Wizard
      case 'swot': return <SWOTAnalysis {...common} onAddItem={addSWOTItem} onUpdateItem={updateSWOTItem} onRemoveItem={removeSWOTItem} onBulkAdd={bulkAddSWOTItems} />;
      case 'systems': return <SystemsThinking {...common} onUpdateItem={updateSWOTItem} />;
      case 'strategy': return <StrategyMatrix {...common} onUpdateOption={updateStrategicOption} onRemoveOption={removeStrategicOption} onBulkAdd={bulkAddStrategicOptions} />;
      case 'scorecard': return <BalancedScorecard {...common} onUpdateObjective={updateObjective} onAddKPI={addKPI} onUpdateKPI={updateKPI} onRemoveKPI={removeKPI} />;
      case 'paps': return <PAPsManagement {...common} onUpdatePAP={updatePAP} removePAP={removePAP} />;
      case 'templates': return <TemplatesLibrary currentPlan={currentPlan} onCreateFromTemplate={() => {}} userId={user?.id} userEmail={user?.email} userName={userDisplayInfo.name} userOrganization={profile?.organization || ''} isAuthenticated={isAuthenticated} />;
      case 'team': return <TeamCollaboration {...common} userId={user?.id} userEmail={user?.email} userName={userDisplayInfo.name} />;
      case 'settings': return <SettingsPage />;
      case 'export': return <PlanExport {...common} />;
      case 'dashboard': default: return <MELDashboard {...common} />;
    }
  }, [activeView, currentPlan, user, profile, isAuthenticated, userDisplayInfo.name, addSWOTItem, updateSWOTItem, removeSWOTItem, bulkAddSWOTItems, updateStrategicOption, removeStrategicOption, bulkAddStrategicOptions, updateObjective, addKPI, updateKPI, removeKPI, updatePAP, removePAP, navigateToView]);

  const isLoading = authLoading || (isAuthenticated && plansLoading);
  const bypassLanding = location.pathname === '/survey-wizard';

  // ─── LANDING PAGE (Hero Section) ──────────────────────────────────────────
  if (uiState.showLanding && !currentPlan && !bypassLanding) {
    return (
      <HeroSection
        onStartPlanning={handleStartPlanning}
        onViewDemo={() => updateUiState({ showLanding: false })}
        onSignIn={() => updateUiState({ showAuthModal: true })}
        onOpenValidationSurvey={() => { updateUiState({ showLanding: false }); goToView('validation'); }}
        isAuthenticated={isAuthenticated}
        userName={userDisplayInfo.name}
      />
    );
  }

  // ─── MAIN APP LAYOUT ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#022c22] text-[#ecfdf5] flex overflow-hidden transition-colors duration-300">
      <Suspense fallback={<div className="w-16 lg:w-64 bg-[#011a12] shrink-0" />}>
        <Sidebar
          activeView={activeView} onViewChange={goToView}
          isCollapsed={uiState.sidebarCollapsed} onToggleCollapse={() => updateUiState({ sidebarCollapsed: !uiState.sidebarCollapsed })}
          isOnline={isOnline} lastSynced={lastSynced} planName={currentPlan?.name}
          isMobileMenuOpen={uiState.isMobileMenuOpen} onCloseMobileMenu={() => updateUiState({ isMobileMenuOpen: false })}
          onShowTutorial={() => updateUiState({ showTutorial: true })} onShowProfile={() => updateUiState({ showProfileModal: true })}
        />
      </Suspense>

      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${uiState.sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <Suspense fallback={<div className="h-14 bg-[#011a12] border-b border-[#C9A84C]/20" />}>
          <Topbar
            plans={plans} currentPlan={currentPlan} onSelectPlan={(id) => setCurrentPlan(id)}
            onOpenMobileMenu={() => updateUiState({ isMobileMenuOpen: true })}
            isAuthenticated={isAuthenticated} isAdmin={isAdmin}
            userEmail={user?.email} userName={userDisplayInfo.name} userInitials={userDisplayInfo.initials}
            onSignIn={() => updateUiState({ showAuthModal: true })} onSignOut={handleSignOut}
            onOpenProfile={() => updateUiState({ showProfileModal: true })} onOpenSettings={() => goToView('settings')}
            onNavigateView={goToView}
          />
        </Suspense>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            <Suspense fallback={<LazyFallback />}>{renderContent()}</Suspense>
          </div>
        </main>
      </div>

      {/* MODALS */}
      {uiState.showAuthModal && (
        <Suspense fallback={null}>
          <AuthModal isOpen onClose={() => updateUiState({ showAuthModal: false })} onSuccess={() => updateUiState({ showAuthModal: false })} signUp={signUp} signIn={signIn} resetPassword={resetPassword} signInWithMagicLink={signInWithMagicLink} />
        </Suspense>
      )}
      {uiState.showProfileModal && (
        <Suspense fallback={null}>
          <UserProfileModal isOpen onClose={() => updateUiState({ showProfileModal: false })} profile={profile} userEmail={user?.email || ''} onUpdateProfile={updateProfile} onSignOut={handleSignOut} onUpdatePassword={updatePassword} />
        </Suspense>
      )}

      {isLoading && (
        <div className="fixed inset-0 bg-[#022c22]/90 backdrop-blur-sm z-50 flex items-center justify-center">
          <GlobalLoader message="Syncing your strategy…" />
        </div>
      )}

      <Suspense fallback={null}>
        <FloatingAIAssistant plan={currentPlan} activeView={activeView} />
      </Suspense>
    </div>
  );
};

export default React.memo(AppLayout);
