// src/components/branding/Logo.tsx
// BIRD 2026–2035 · Bangsamoro Strategic Logo & Branding

import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'icon' | 'text';
  className?: string;
}

export const StratLogo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'full',
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  const textSizeMap = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg',
  };

  if (variant === 'icon') {
    return (
      <div className={`${sizeMap[size]} ${className} flex items-center justify-center`}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Golden shield with teal accent */}
          <rect x="15" y="20" width="70" height="60" rx="8" fill="#C9A84C" />
          <circle cx="50" cy="50" r="28" fill="#022c22" />
          <path d="M50 30 L60 50 L50 70 L40 50 Z" fill="#C9A84C" opacity="0.8" />
        </svg>
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={`${textSizeMap[size]} ${className} font-serif font-bold tracking-wide`}>
        <span className="text-[#C9A84C]">BIRD</span>
        <span className="text-[#022c22] ml-1">2026–2035</span>
      </div>
    );
  }

  // Full variant: icon + text
  return (
    <div className={`${className} flex items-center gap-3`}>
      <div className={`${sizeMap[size]} flex-shrink-0`}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="15" y="20" width="70" height="60" rx="8" fill="#C9A84C" />
          <circle cx="50" cy="50" r="28" fill="#022c22" />
          <path d="M50 30 L60 50 L50 70 L40 50 Z" fill="#C9A84C" opacity="0.8" />
        </svg>
      </div>
      <div className={`${textSizeMap[size]} font-serif font-bold tracking-wide`}>
        <div className="text-[#C9A84C]">BIRD 2026–2035</div>
        <div className="text-[#022c22]/70 text-xs leading-tight">
          Bangsamoro Investment Roadmap
        </div>
      </div>
    </div>
  );
};

// Alternative: MTIT/BOI branding
export const MTITLogo: React.FC<LogoProps> = ({
  size = 'md',
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  return (
    <div className={`${sizeMap[size]} ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Simplified MTIT seal */}
        <circle cx="50" cy="50" r="45" fill="none" stroke="#C9A84C" strokeWidth="2" />
        <circle cx="50" cy="50" r="40" fill="#022c22" />
        <text
          x="50"
          y="55"
          textAnchor="middle"
          fontSize="16"
          fontWeight="bold"
          fill="#C9A84C"
          fontFamily="serif"
        >
          MTIT
        </text>
      </svg>
    </div>
  );
};

// BIRD AI Strategist Avatar — used in FloatingAIAssistant
export const AIStrategistAvatar: React.FC<LogoProps> = ({
  size = 'md',
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  return (
    <div className={`${sizeMap[size]} ${className} rounded-full bg-gradient-to-br from-fuchsia-600 via-violet-600 to-cyan-500 flex items-center justify-center`}>
      <svg
        viewBox="0 0 100 100"
        className="w-3/5 h-3/5"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* AI Bot face */}
        <rect x="20" y="25" width="60" height="45" rx="12" fill="white" />
        {/* Eyes */}
        <circle cx="38" cy="47" r="6" fill="#7c3aed" />
        <circle cx="62" cy="47" r="6" fill="#7c3aed" />
        {/* Eye highlights */}
        <circle cx="40" cy="45" r="2" fill="white" />
        <circle cx="64" cy="45" r="2" fill="white" />
        {/* Mouth */}
        <path d="M40 60 Q50 68 60 60" stroke="#7c3aed" strokeWidth="3" fill="none" strokeLinecap="round" />
        {/* Antenna */}
        <line x1="50" y1="25" x2="50" y2="12" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <circle cx="50" cy="10" r="4" fill="#06b6d4" />
      </svg>
    </div>
  );
};

export default StratLogo;
