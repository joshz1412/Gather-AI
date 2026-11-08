import React from 'react';
import { GatherGSymbol } from './GatherGSymbol';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  useSymbolOnly?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  size = 'md',
  showTagline: _showTagline = false,
  useSymbolOnly = false,
}) => {
  // Collapsed mobile or icon-only view fallback (G1.svg)
  if (useSymbolOnly) {
    const symbolSizes = {
      sm: 'sm' as const,
      md: 'md' as const,
      lg: 'lg' as const,
    };
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <GatherGSymbol size={symbolSizes[size]} />
      </div>
    );
  }

  // Sizing presets for the full official "Gather AI" wordmark (new-gather-ai-logo.svg)
  // Aspect ratio is 4:1 (1200x300 viewBox), rendering sharp, uncompressed typography
  const sizeClasses = {
    sm: 'h-7 sm:h-7.5 max-w-[130px]',  // Modals & compact bars
    md: 'h-8 sm:h-8.5 max-w-[155px]',  // Standard Sidebar navigation
    lg: 'h-9 sm:h-10 max-w-[180px]',   // Prominent hero displays
  };

  const selectedSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div className={`flex items-center select-none ${className}`}>
      {/* Official Gather AI Full Wordmark Logo Asset */}
      <img
        src="/images/new-gather-ai-logo.svg"
        alt="Gather AI"
        className={`w-auto object-contain pointer-events-none select-none transition-opacity duration-200 ${selectedSize}`}
        loading="eager"
        decoding="async"
        onError={(e) => {
          // Fallback if SVG resolution issues occur
          const target = e.currentTarget as HTMLImageElement;
          if (target.src.endsWith('new-gather-ai-logo.svg')) {
            target.src = '/images/new-gather-ai-logo-original.svg';
          }
        }}
      />
    </div>
  );
};

export default Logo;
