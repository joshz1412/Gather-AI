import React from 'react';

interface GatherGSymbolProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  width?: number | string;
  height?: number | string;
  priority?: boolean;
}

/**
 * Dedicated, reusable brand symbol component for Gather AI.
 * Displays exclusively the custom capital 'G' (G1.svg) from the official Gather AI identity.
 * Asset path: /images/G1.svg
 */
export const GatherGSymbol: React.FC<GatherGSymbolProps> = ({
  className = '',
  size = 'md',
  width,
  height,
}) => {
  // Size presets optimized for G1.svg (1254x1254 canvas with centered G)
  const sizeClasses = {
    sm: 'w-10 h-10',                               // ~16px visible G
    md: 'w-16 h-16',                               // ~25px visible G
    lg: 'w-28 h-28',                               // ~45px visible G
    xl: 'w-44 h-44 sm:w-52 sm:h-52 md:w-60 md:h-60', // ~70px-90px visible G (Splash Screen hero)
    custom: '',
  };

  const selectedSizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <div
      className={`inline-flex items-center justify-center select-none ${selectedSizeClass} ${className}`}
      style={width || height ? { width, height } : undefined}
    >
      <img
        src="/images/G1.svg"
        alt="Gather AI Brand Symbol G"
        className="w-full h-full object-contain pointer-events-none select-none"
        loading="eager"
        decoding="async"
        onError={(e) => {
          const target = e.currentTarget as HTMLImageElement;
          if (target.src.endsWith('/images/G1.svg')) {
            target.src = '/images/gather-g.svg';
          }
        }}
      />
    </div>
  );
};

export default GatherGSymbol;
