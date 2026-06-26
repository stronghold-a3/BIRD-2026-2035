import React, { useState, useRef, useEffect } from 'react';
import {
  X, Mail, Lock, User, Eye, EyeOff, Loader2, ArrowLeft,
  CheckCircle2, AlertCircle, Sparkles, Shield, Globe2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────
interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  signUp: (email: string, password: string, fullName: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  resetPassword: (email: string) => Promise<void>;
  signInWithMagicLink?: (email: string) => Promise<any>;
}

type AuthView = 'login' | 'signup' | 'forgot-password' | 'check-email';

// ─── Constants ────────────────────────────────────────────────────────────────
const OFFICIAL_LOGO_URL =
  'https://rgvteytgkugdqdodedxq.databasepad.com/storage/v1/object/public/bird-images/public/MTIT%20Logo.webp';
const EMAIL_NOTIFICATIONS_URL =
  'https://rgvteytgkugdqdodedxq.databasepad.com/functions/v1/email-notifications';

const PLATFORM_HIGHLIGHTS = [
  { icon: Sparkles, text: 'AI-powered strategy assistant' },
  { icon: Globe2,   text: 'BARMM investment roadmap tools' },
  { icon: Shield,   text: 'Secure, role-based access' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
interface FieldProps {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  icon: React.ElementType;
  autoComplete?: string;
  required?: boolean;
  suffix?: React.ReactNode;
  disabled?: boolean;
}

const Field: React.FC<FieldProps> = ({
  label, id, type = 'text', value, onChange, placeholder,
  icon: Icon, autoComplete, required, suffix, disabled,
}) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="block text-sm font-medium text-slate-200">
      {label} {required && <span className="text-rose-400" aria-hidden>*</span>}
    </label>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        disabled={disabled}
        className={cn(
          'w-full rounded-xl border bg-slate-800/60 py-2.5 pl-10 text-sm text-white',
          'placeholder:text-slate-500 transition-all duration-150',
          'border-slate-700 hover:border-slate-600',
          'focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          suffix ? 'pr-10' : 'pr-4',
        )}
      />
      {suffix && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</div>
      )}
    </div>
  </div>
);

interface PasswordFieldProps {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  placeholder?: string;
  disabled?: boolean;
}

const PasswordField: React.FC<PasswordFieldProps> = (props) => {
  const [show, setShow] = useState(false);
  return (
    <Field
      {...props}
      icon={Lock}
      type={show ? 'text' : 'password'}
      suffix={
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? 'Hide password' : 'Show password'}
          className="text-slate-400 hover:text-slate-200 transition-colors focus-visible:outline-none"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      }
    />
  );
};

interface AlertBannerProps {
  type: 'error' | 'success';
  message: string;
}

const AlertBanner: React.FC<AlertBannerProps> = ({ type, message }) => (
  <div
    role="alert"
    className={cn(
      'flex items-start gap-2.5 rounded-xl border p-3 text-sm',
      type === 'error'
        ? 'border-rose-500/30 bg-rose-500/10 text-rose-300'
        : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    )}
  >
    {type === 'error'
      ? <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
      : <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />}
    <span>{message}</span>
  </div>
);

interface SubmitButtonProps {
  loading: boolean;
  label: string;
  loadingLabel: string;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ loading, label, loadingLabel }) => (
  <button
    type="submit"
    disabled={loading}
    className={cn(
      'w-full rounded-xl py-3 text-sm font-semibold text-white transition-all duration-200',
      'bg-gradient-to-r from-cyan-500 to-blue-600',
      'hover:from-cyan-400 hover:to-blue-500 hover:shadow-lg hover:shadow-cyan-500/25',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900',
      'disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-none',
      'active:scale-[0.98]',
    )}
  >
    {loading ? (
      <span className="flex items-center justify-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        {loadingLabel}
      </span>
    ) : label}
  </button>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const AuthModal: React.FC<AuthModalProps> = ({
  isOpen, onClose, onSuccess, signUp, signIn, resetPassword, signInWithMagicLink,
}) => {
  const [view, setView]                     = useState<AuthView>('login');
  const [email, setEmail]                   = useState('');
  const [password, setPassword]             = useState('');
  const [confirmPassword, setConfirmPass]   = useState('');
  const [fullName, setFullName]             = useState('');
  const [isLoading, setIsLoading]           = useState(false);
  const [error, setError]                   = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const firstFieldRef = useRef<HTMLInputElement>(null);

  // Trap focus and auto-focus on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => firstFieldRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Keyboard close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail(''); setPassword(''); setConfirmPass('');
    setFullName(''); setError(null); setSuccessMessage(null);
  };

  const changeView = (v: AuthView) => { resetForm(); setView(v); };

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await signIn(email, password);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        err?.message ||
        err?.error_description ||
        'Failed to sign in. Please check your credentials.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setIsLoading(true);
    try {
      const response = await signUp(email, password, fullName);
      if (response?.error) throw response.error;
      const userId = response?.data?.user?.id || response?.user?.id;
      if (userId) {
        fetch(EMAIL_NOTIFICATIONS_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'welcome', user_id: userId }),
        }).catch(() => {});
      }
      setSuccessMessage(
        'Account created! A verification email has been sent. Please check your inbox (and spam folder) to activate your account.',
      );
      setView('check-email');
    } catch (err: any) {
      setError(
        err?.message ||
        err?.error_description ||
        'Could not create account. The email may already be registered.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await resetPassword(email);
      setSuccessMessage('Password reset instructions sent to your email.');
      setView('check-email');
    } catch (err: any) {
      setError(err?.message || 'Could not send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) { setError('Enter your email address first.'); return; }
    if (!signInWithMagicLink) return;
    setError(null);
    setIsLoading(true);
    try {
      await signInWithMagicLink(email);
      setSuccessMessage('Magic link sent! Check your email to sign in instantly.');
      setView('check-email');
    } catch (err: any) {
      setError(err?.message || 'Could not send magic link.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Layout ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Sign in to BIRD 2026–2035"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal card */}
      <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        <div className="rounded-2xl border border-slate-700/60 bg-slate-900 shadow-2xl shadow-black/60 overflow-hidden">

          {/* ── Brand Header ────────────────────────────────────────────── */}
          <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 pt-8 pb-6 text-center border-b border-slate-800">
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-cyan-500/40 shadow-lg shadow-cyan-500/20 bg-slate-800">
                <img
                  src={OFFICIAL_LOGO_URL}
                  alt="BOI-MTIT BARMM"
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>
              <div className="text-left">
                <h1 className="text-xl font-bold text-white tracking-tight">
                  BIRD <span className="text-cyan-400">2026–2035</span>
                </h1>
                <p className="text-xs text-slate-400">BOI-MTIT · BARMM</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 flex-wrap">
              {PLATFORM_HIGHLIGHTS.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5 text-slate-400">
                  <Icon className="w-3.5 h-3.5 text-cyan-500" />
                  <span className="text-[11px]">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Form area ───────────────────────────────────────────────── */}
          <div className="p-6 space-y-5">

            {/* ── LOGIN ─────────────────────────────────────────────────── */}
            {view === 'login' && (
              <>
                <div className="text-center">
                  <h2 className="text-lg font-bold text-white">Welcome back</h2>
                  <p className="text-sm text-slate-400 mt-0.5">Sign in to access your strategic plans</p>
                </div>

                {error && <AlertBanner type="error" message={error} />}

                <form onSubmit={handleLogin} className="space-y-4" noValidate>
                  <Field
                    label="Email address"
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="you@barmm.gov.ph"
                    icon={Mail}
                    autoComplete="email"
                    required
                    disabled={isLoading}
                  />
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label htmlFor="login-password" className="text-sm font-medium text-slate-200">
                        Password <span className="text-rose-400" aria-hidden>*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => changeView('forgot-password')}
                        className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors focus-visible:outline-none focus-visible:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <PasswordField
                      label=""
                      id="login-password"
                      value={password}
                      onChange={setPassword}
                      autoComplete="current-password"
                      placeholder="Your password"
                      disabled={isLoading}
                    />
                  </div>

                  <SubmitButton loading={isLoading} label="Sign In" loadingLabel="Signing in…" />
                </form>

                {signInWithMagicLink && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-slate-800" />
                      <span className="text-xs text-slate-500">or</span>
                      <div className="flex-1 h-px bg-slate-800" />
                    </div>
                    <button
                      type="button"
                      onClick={handleMagicLink}
                      disabled={isLoading}
                      className={cn(
                        'w-full rounded-xl border border-slate-700 bg-slate-800/40 py-2.5 text-sm',
                        'text-slate-300 hover:text-white hover:border-slate-600 hover:bg-slate-800',
                        'transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                      )}
                    >
                      ✨ Send magic link to my email
                    </button>
                  </div>
                )}

                <p className="text-center text-sm text-slate-400">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => changeView('signup')}
                    className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors focus-visible:outline-none focus-visible:underline"
                  >
                    Sign up
                  </button>
                </p>
              </>
            )}

            {/* ── SIGN UP ───────────────────────────────────────────────── */}
            {view === 'signup' && (
              <>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => changeView('login')}
                    aria-label="Back to sign in"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <h2 className="text-lg font-bold text-white">Create your account</h2>
                    <p className="text-sm text-slate-400">Join the BIRD 2026–2035 platform</p>
                  </div>
                </div>

                {error && <AlertBanner type="error" message={error} />}

                <form onSubmit={handleSignup} className="space-y-4" noValidate>
                  <Field
                    label="Full name"
                    id="signup-name"
                    value={fullName}
                    onChange={setFullName}
                    placeholder="Juan dela Cruz"
                    icon={User}
                    autoComplete="name"
                    required
                    disabled={isLoading}
                  />
                  <Field
                    label="Email address"
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="you@barmm.gov.ph"
                    icon={Mail}
                    autoComplete="email"
                    required
                    disabled={isLoading}
                  />
                  <PasswordField
                    label="Password (min. 8 characters)"
                    id="signup-password"
                    value={password}
                    onChange={setPassword}
                    autoComplete="new-password"
                    placeholder="Create a strong password"
                    disabled={isLoading}
                  />
                  <PasswordField
                    label="Confirm password"
                    id="signup-confirm"
                    value={confirmPassword}
                    onChange={setConfirmPass}
                    autoComplete="new-password"
                    placeholder="Repeat your password"
                    disabled={isLoading}
                  />

                  <SubmitButton loading={isLoading} label="Create Account" loadingLabel="Creating account…" />
                </form>

                <p className="text-center text-xs text-slate-500">
                  By signing up you agree to the platform's terms of use.
                </p>

                <p className="text-center text-sm text-slate-400">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => changeView('login')}
                    className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors focus-visible:outline-none focus-visible:underline"
                  >
                    Sign in
                  </button>
                </p>
              </>
            )}

            {/* ── FORGOT PASSWORD ───────────────────────────────────────── */}
            {view === 'forgot-password' && (
              <>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => changeView('login')}
                    aria-label="Back to sign in"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <h2 className="text-lg font-bold text-white">Reset your password</h2>
                    <p className="text-sm text-slate-400">We'll send a reset link to your email</p>
                  </div>
                </div>

                {error && <AlertBanner type="error" message={error} />}

                <form onSubmit={handleForgotPassword} className="space-y-4" noValidate>
                  <Field
                    label="Email address"
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="you@barmm.gov.ph"
                    icon={Mail}
                    autoComplete="email"
                    required
                    disabled={isLoading}
                  />
                  <SubmitButton loading={isLoading} label="Send Reset Link" loadingLabel="Sending…" />
                </form>
              </>
            )}

            {/* ── CHECK EMAIL (success state) ───────────────────────────── */}
            {view === 'check-email' && (
              <div className="text-center space-y-5 py-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Check your inbox</h2>
                  <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                    {successMessage || 'We sent an email to'}{' '}
                    {email && (
                      <span className="font-semibold text-cyan-400">{email}</span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500 mt-3">
                    Don't see it? Check your spam or junk folder.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => changeView('login')}
                  className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors focus-visible:outline-none focus-visible:underline"
                >
                  ← Back to sign in
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Accessibility note */}
        <p className="text-center text-[10px] text-slate-600 mt-3">
          BIRD 2026–2035 · Bureau of Investments · BARMM, Philippines
        </p>
      </div>
    </div>
  );
};

export default AuthModal;
