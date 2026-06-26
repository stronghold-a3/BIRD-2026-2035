// ─────────────────────────────────────────────────────────────────────────────
// BIRD 2026–2035 · Branding Components
// Official logo and avatar components — consistent across all pages.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { cn } from '@/lib/utils';
import { BRAND_ASSETS } from '@/lib/supabase';

// ─── Asset URLs ───────────────────────────────────────────────────────────────
// Sourced from supabase.ts → BRAND_ASSETS (which reads VITE_ env vars with CDN fallbacks)
const LOGO_URL         = BRAND_ASSETS.LOGO_URL;
const AI_AVATAR_URL    = BRAND_ASSETS.AI_AVATAR_URL;

export const BIRD_BANNER_URL =
  'https://rgvteytgkugdqdodedxq.databasepad.com/storage/v1/object/public/bird-images/public/BIRD%20Banner.png';

// ─── Types ────────────────────────────────────────────────────────────────────
interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  withGlow?: boolean;
  alt?: string;
}

const sizeMap: Record<NonNullable<LogoProps['size']>, string> = {
  xs: 'w-6  h-6',
  sm: 'w-8  h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20',
};

// ─── Primary logo (MTIT / BIRD 2026–2035) ────────────────────────────────────
/** Circular BIRD 2026–2035 brand logo — use consistently across all pages */
export const StratLogo: React.FC<LogoProps> = ({
  size = 'md',
  className,
  withGlow = false,
  alt = 'BIRD 2026–2035 | BOI-MTIT, BARMM',
}) => (
  <div
    className={cn(
      'relative rounded-full overflow-hidden ring-2 ring-cyan-400/40 bg-slate-900 flex-shrink-0 shadow-lg',
      withGlow && 'shadow-cyan-500/40',
      sizeMap[size],
      className,
    )}
  >
    <img
      src={LOGO_URL}
      alt={alt}
      className="w-full h-full object-cover"
      loading="eager"
      decoding="async"
      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
    />
  </div>
);

// ─── AI Strategist Avatar ─────────────────────────────────────────────────────
/** Circular BIRD AI / ASilva Innovations avatar — used in FloatingAIAssistant */
export const AIStrategistAvatar: React.FC<LogoProps> = ({
  size = 'md',
  className,
  withGlow = true,
  alt = 'BIRD AI Strategy Consultant',
}) => (
  <div
    className={cn(
      'relative rounded-full overflow-hidden ring-2 ring-fuchsia-400/50 bg-slate-900 flex-shrink-0 shadow-lg',
      withGlow && 'shadow-fuchsia-500/40',
      sizeMap[size],
      className,
    )}
  >
    <img
      src={AI_AVATAR_URL}
      alt={alt}
      className="w-full h-full object-cover"
      loading="eager"
      decoding="async"
      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
    />
  </div>
);

// ─── Wordmark ─────────────────────────────────────────────────────────────────
/** BIRD 2026–2035 text wordmark — for headers and titles */
export const BIRDWordmark: React.FC<{ className?: string; size?: 'sm' | 'md' | 'lg' }> = ({
  className,
  size = 'md',
}) => {
  const classes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };
  return (
    <span className={cn('font-bold text-white tracking-tight', classes[size], className)}>
      BIRD <span className="text-cyan-400">2026–2035</span>
    </span>
  );
};

export default StratLogo;
