import React from 'react';

interface ReOxyLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'dark' | 'light';
  showText?: boolean;
}

export const ReOxyLogo: React.FC<ReOxyLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'dark',
  showText = true
}) => {
  const isDark = variant === 'dark'; // dark variant = dark text for white paper
  
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12'
  };
  const wordSize = size === 'lg' ? 'text-[22px]' : 'text-lg';
  const tagSize = size === 'lg' ? 'text-[11px] tracking-[0.18em]' : 'text-[9px] tracking-[0.16em]';

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Precision Vector ReOxy Droplet with Plus and Leaf */}
      <svg
        viewBox="0 0 120 130"
        className={`${iconSizes[size]} shrink-0`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Blue Droplet */}
        <path
          d="M60 4C60 4 12 62 12 88C12 112 33.5 128 60 128C86.5 128 108 112 108 88C108 62 60 4 60 4Z"
          fill="#0284c7"
        />

        {/* Top Medical Green Plus */}
        <g fill="#22c55e">
          <rect x="74" y="44" width="10" height="28" rx="2" />
          <rect x="65" y="53" width="28" height="10" rx="2" />
        </g>

        {/* Bottom Curved Eco Leaf in Green */}
        <path
          d="M32 92C30 76 44 60 62 56C60 72 48 94 32 92Z"
          fill="#22c55e"
        />
        <path
          d="M36 94C38 72 58 56 68 56C72 74 58 96 36 94Z"
          fill="#16a34a"
        />
        {/* Leaf inner vein highlight */}
        <path
          d="M40 88C48 78 56 66 64 60"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>

      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-baseline tracking-tight">
            <span className={`font-bold ${wordSize} font-sans ${isDark ? 'text-[#0f172a]' : 'text-white'}`}>Re</span>
            <span className={`font-bold text-[#0284c7] ${wordSize} font-sans`}>Oxy</span>
          </div>
          <span className={`${tagSize} uppercase font-sans font-medium mt-0.5 ${
            isDark ? 'text-[#475569]' : 'text-[#94a3b8]'
          }`}>
            Technologies
          </span>
        </div>
      )}
    </div>
  );
};
