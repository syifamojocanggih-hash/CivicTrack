import React from 'react';
import iconMonoNavy from '../assets/civictrack-icon-mono-navy.png';
import iconMonoWhite from '../assets/civictrack-icon-mono-white.png';

interface CivicTrackLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  theme?: 'light' | 'dark';
  subtitle?: string;
}

export const CivicTrackLogo: React.FC<CivicTrackLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  theme = 'light',
  subtitle,
}) => {
  const sizeMap = {
    xs: { icon: 'h-6 w-auto', text: 'text-sm', sub: 'text-[9px]' },
    sm: { icon: 'h-7 w-auto', text: 'text-base', sub: 'text-[10px]' },
    md: { icon: 'h-9 w-auto', text: 'text-lg', sub: 'text-[11px]' },
    lg: { icon: 'h-11 w-auto', text: 'text-xl', sub: 'text-xs' },
    xl: { icon: 'h-14 w-auto', text: 'text-2xl', sub: 'text-sm' },
  };

  const currentSize = sizeMap[size];
  const iconSrc = theme === 'dark' ? iconMonoWhite : iconMonoNavy;
  const textColor = theme === 'dark' ? 'text-white' : 'text-[#184C78]';
  const subColor = theme === 'dark' ? 'text-white/60' : 'text-slate-500';

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* 1-Color Graphic Icon Mark */}
      <img
        src={iconSrc}
        alt="CivicTrack Monochrome Logo"
        className={`${currentSize.icon} object-contain transition-transform group-hover:scale-105 shrink-0`}
        loading="eager"
      />

      {/* 1-Color Typography */}
      {showText && (
        <div className="flex flex-col leading-none">
          <div className={`font-['DM_Sans'] font-black tracking-tight ${textColor} ${currentSize.text}`}>
            CivicTrack
          </div>
          {subtitle && (
            <span className={`font-medium tracking-normal mt-0.5 ${subColor} ${currentSize.sub}`}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default CivicTrackLogo;
