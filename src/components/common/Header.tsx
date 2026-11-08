import React from 'react';
import { 
  Menu, 
  RotateCcw, 
  Plus, 
  HelpCircle, 
  Sparkles,
  Sprout,
  RefreshCw,
  ShieldAlert
} from 'lucide-react';
import { NavigationTab, UserProfile } from '../../types';

interface HeaderProps {
  activeTab: NavigationTab;
  onOpenMobileMenu: () => void;
  onOpenAddCrop: () => void;
  onOpenRegisterWaste: () => void;
  onResetDemo: () => void;
  onOpenHelpModal: () => void;
  onOpenSplash?: () => void;
  onOpenAssistant?: () => void;
  userProfile?: UserProfile;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenMobileMenu,
  onOpenAddCrop,
  onOpenRegisterWaste,
  onResetDemo,
  onOpenHelpModal,
  onOpenSplash,
  onOpenAssistant,
  userProfile,
}) => {
  const firstName = userProfile?.fullName ? userProfile.fullName.split(' ')[0] : 'Ramesh';

  const titles: Record<NavigationTab, { title: string; subtitle: string }> = {
    overview: {
      title: `Good morning, ${firstName}. Let's make today's decisions count.`,
      subtitle: 'Explore your crop guidance and find better destinations for organic resources.',
    },
    harvest: {
      title: 'Know what your crops need next.',
      subtitle: 'Get crop guidance, understand growing stages, and plan your next harvest decisions.',
    },
    waste: {
      title: 'Give organic waste a useful next destination.',
      subtitle: 'Register surplus or organic material, find compatible recovery partners, and prepare a collection request.',
    },
    partners: {
      title: 'Recovery Partner Directory & Direct Marketplace',
      subtitle: 'Buy fertilizers directly, sell agricultural produce without brokers, or connect with certified organic waste facilities.',
    },
    impact: {
      title: 'Verified Resource Recovery Impact',
      subtitle: 'Measured outcomes strictly distinguishing registered, matched, accepted, and confirmed quantities.',
    },
    activity: {
      title: 'Activity & Audit Log',
      subtitle: 'Traceable history of crop observations, waste registrations, partner matches, and collection confirmations.',
    },
    settings: {
      title: 'Settings & Workspace Preferences',
      subtitle: 'Manage your profile, farm operations, AI engine parameters, and data exports.',
    },
  };

  const current = titles[activeTab] || titles.overview;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E2E8DF] px-4 sm:px-6 lg:px-8 py-3.5">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Hamburger for mobile + Page Titles */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenMobileMenu}
            className="p-2 -ml-2 text-[#183E2E] hover:bg-[#F8F8F2] rounded-lg lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-heading font-bold text-[#183E2E] truncate leading-tight">
              {current.title}
            </h1>
            <p className="text-xs sm:text-sm text-[#68766D] hidden md:block truncate mt-0.5">
              {current.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Splash Preview Button */}
          {onOpenSplash && (
            <button
              onClick={onOpenSplash}
              title="Preview Splash Screen"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-[#183E2E] bg-[#FAFAF7] border border-[#E2E8DF] hover:bg-[#EAF1E7] hover:border-[#85B96F]/50 rounded-lg transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#245C43]" />
              <span className="hidden sm:inline">Splash</span>
            </button>
          )}

          {/* Quick Demo Reset / Scenario Loader */}
          <button
            onClick={onResetDemo}
            title="Reset to 5-scene Hackathon Demo Data"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#68766D] bg-[#F8F8F2] border border-[#E2E8DF] hover:bg-[#EAF1E7] hover:text-[#183E2E] rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Demo</span>
          </button>

          {/* PRD Principles Pill */}
          <button
            onClick={onOpenHelpModal}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#245C43] bg-[#EAF1E7] border border-[#85B96F]/40 hover:bg-[#D7E8A3]/50 rounded-lg transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>PRD Guide</span>
          </button>

          {/* Ask AI Trigger */}
          {onOpenAssistant && (
            <button
              onClick={onOpenAssistant}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-[#245C43] to-[#183E2E] hover:from-[#183E2E] hover:to-[#245C43] border border-[#85B96F]/40 rounded-lg transition-all shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D7E8A3]" />
              <span>Ask AI</span>
            </button>
          )}

          {/* Quick Add Crop */}
          <button
            onClick={onOpenAddCrop}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#183E2E] bg-[#EAF1E7] border border-[#85B96F]/50 hover:bg-[#D7E8A3] rounded-lg transition-all shadow-2xs"
          >
            <Sprout className="w-4 h-4 text-[#245C43]" />
            <span className="hidden sm:inline">Add Crop</span>
            <span className="sm:hidden">Crop</span>
          </button>

          {/* Primary Action: Register Waste */}
          <button
            onClick={onOpenRegisterWaste}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#245C43] hover:bg-[#183E2E] rounded-lg transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Register Waste</span>
            <span className="sm:hidden">Waste</span>
          </button>
        </div>
      </div>
    </header>
  );
};
