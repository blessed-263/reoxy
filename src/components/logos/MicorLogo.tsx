import React from 'react';

interface MicorLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'dark' | 'light';
  showText?: boolean;
}

export const MicorLogo: React.FC<MicorLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'dark',
  showText = true
}) => {
  const isDark = variant === 'dark';
  
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Modern Geometric Origami Fold Icon */}
      <svg
        viewBox="0 0 100 100"
        className={`${iconSizes[size]} shrink-0`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Left diagonal capsule */}
        <path
          d="M20 54L48 26C52 22 58 22 62 26L68 32C72 36 72 42 68 46L40 74C36 78 30 78 26 74L20 68C16 64 16 58 20 54Z"
          fill={isDark ? '#0f172a' : '#ffffff'}
          fillOpacity={isDark ? 0.95 : 1}
        />
        {/* Overlapping folded companion facet */}
        <path
          d="M42 64L64 42C67 39 72 39 75 42L82 49C85 52 85 57 82 60L60 82C57 85 52 85 49 82L42 75C39 72 39 67 42 64Z"
          fill={isDark ? '#475569' : '#cbd5e1'}
        />
      </svg>

      {showText && (
        <span
          className={`font-sans font-bold tracking-tight lowercase text-2xl ${
            isDark ? 'text-[#0f172a]' : 'text-white'
          }`}
          style={{ letterSpacing: '-0.03em' }}
        >
          micor
        </span>
      )}
    </div>
  );
};
