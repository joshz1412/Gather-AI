import React, { useState, useEffect } from 'react';
import { GatherGSymbol } from '../common/GatherGSymbol';

interface SplashScreenProps {
  /**
   * Callback fired once the splash entrance and initial hold animation complete,
   * transitioning smoothly into the main application.
   */
  onComplete?: () => void;

  /**
   * Whether the splash screen automatically transitions into the app.
   * Default: true
   */
  autoDismiss?: boolean;

  /**
   * Total duration in milliseconds before beginning the smooth exit transition.
   * Default: 2100ms
   */
  durationMs?: number;

  /**
   * Optional manual override to control visibility from parent.
   */
  forceVisible?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  autoDismiss = true,
  durationMs = 2100,
  forceVisible = false,
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const [progressWidth, setProgressWidth] = useState(0);

  useEffect(() => {
    // Smooth progress bar fill
    const interval = setInterval(() => {
      setProgressWidth((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, durationMs / 22);

    return () => clearInterval(interval);
  }, [durationMs]);

  useEffect(() => {
    if (!autoDismiss && !forceVisible) return;

    const timer = setTimeout(() => {
      // Trigger smooth fade-out exit
      setIsExiting(true);
      const exitTimer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 500); // Wait for 500ms CSS fade-out transition

      return () => clearTimeout(exitTimer);
    }, durationMs);

    return () => clearTimeout(timer);
  }, [autoDismiss, durationMs, forceVisible, onComplete]);

  // Handle immediate click or keypress to skip if desired
  const handleImmediateDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 350);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        handleImmediateDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <aside
      aria-label="Gather AI Initializing"
      aria-live="polite"
      onClick={handleImmediateDismiss}
      className={`fixed inset-0 z-[100] bg-[#FFFFFF] flex flex-col items-center justify-between select-none cursor-pointer overflow-hidden transition-opacity duration-500 ease-out ${
        isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top spacer to guarantee true vertical & horizontal centering */}
      <div className="w-full pt-8 sm:pt-12 px-6 flex justify-end">
        <span className="text-[11px] font-medium text-[#68766D]/60 hover:text-[#183E2E] transition-colors">
          Press any key to enter
        </span>
      </div>

      {/* Main Centered Content: Custom G Logo (G1.svg) + Restrained Loading Indicator */}
      <div className="flex-1 flex flex-col items-center justify-center -mt-8 sm:-mt-12 px-6">
        {/* Custom G Symbol exclusively with smooth 700ms entrance animation */}
        <div className="animate-splash-logo flex items-center justify-center">
          <GatherGSymbol
            size="xl"
            priority={true}
          />
        </div>

        {/* Minimalist Loading Indicator (Restrained spacing) */}
        <div className="mt-8 sm:mt-10 flex flex-col items-center animate-splash-fade-in w-full max-w-[200px]">
          {/* Subtle Progress Bar */}
          <div className="w-28 sm:w-36 h-[2.5px] bg-[#E2E8DF] rounded-full overflow-hidden relative shadow-2xs">
            <div
              className="h-full bg-gradient-to-r from-[#245C43] to-[#85B96F] rounded-full transition-all duration-150 ease-out"
              style={{ width: `${Math.min(100, Math.max(12, progressWidth))}%` }}
            />
          </div>

          {/* Micro status text */}
          <span className="text-[11px] font-medium tracking-widest uppercase text-[#68766D] mt-3.5 opacity-90">
            Initializing Platform
          </span>
        </div>
      </div>

      {/* Bottom Area: Subtle Tagline */}
      <div className="pb-10 sm:pb-12 text-center px-6 animate-splash-tagline">
        <p className="text-xs sm:text-sm text-[#68766D] font-medium tracking-wide">
          Grow smarter. Waste less. Gather more.
        </p>
      </div>
    </aside>
  );
};

export default SplashScreen;
