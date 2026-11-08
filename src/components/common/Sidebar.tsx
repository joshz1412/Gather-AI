import React from 'react';
import { 
  LayoutDashboard, 
  Sprout, 
  RefreshCw, 
  Building2, 
  BarChart3, 
  History, 
  HelpCircle,
  Sparkles,
  ChevronRight,
  Settings,
  X
} from 'lucide-react';
import { NavigationTab, UserProfile } from '../../types';
import { Logo } from './Logo';

interface SidebarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  cropCount: number;
  wasteCount: number;
  pendingRequestsCount: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenHelpModal: () => void;
  userProfile?: UserProfile;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  cropCount,
  wasteCount,
  pendingRequestsCount,
  isOpenMobile,
  onCloseMobile,
  onOpenHelpModal,
  userProfile,
}) => {
  const navItems = [
    {
      id: 'overview' as NavigationTab,
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null,
      desc: 'Platform summary',
    },
    {
      id: 'harvest' as NavigationTab,
      label: 'Harvest Intelligence',
      icon: Sprout,
      badge: cropCount > 0 ? `${cropCount} crops` : null,
      desc: 'Crops & harvest timing',
    },
    {
      id: 'waste' as NavigationTab,
      label: 'Food Waste Recovery',
      icon: RefreshCw,
      badge: wasteCount > 0 ? `${wasteCount} active` : null,
      desc: 'Surplus to recovery',
    },
    {
      id: 'partners' as NavigationTab,
      label: 'Recovery Partner Directory',
      icon: Building2,
      badge: 'Marketplace',
      desc: 'Buy, sell & recover facilities',
    },
    {
      id: 'impact' as NavigationTab,
      label: 'Impact Metrics',
      icon: BarChart3,
      badge: null,
      desc: 'Measured outcomes',
    },
    {
      id: 'activity' as NavigationTab,
      label: 'Activity History',
      icon: History,
      badge: pendingRequestsCount > 0 ? `${pendingRequestsCount} pending` : null,
      desc: 'Timeline & events',
    },
    {
      id: 'settings' as NavigationTab,
      label: 'Settings & Workspace',
      icon: Settings,
      badge: null,
      desc: 'Preferences & profile',
    },
  ];

  const displayName = userProfile?.fullName || 'Ramesh Patil';
  const displayRole = userProfile?.role || 'Grower & APMC Vendor';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'RP';

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 bg-[#1D2922]/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Persistent sidebar on desktop (240px-260px) / Slide-over on mobile */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-[#E2E8DF] flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="p-5 border-b border-[#E2E8DF] flex items-center justify-between">
          <Logo size="md" />
          <button 
            onClick={onCloseMobile}
            className="p-1.5 text-[#68766D] hover:text-[#1D2922] lg:hidden rounded-md cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Mode Pill & AI Engine Status */}
        <div className="mx-4 mt-3 px-3 py-2 bg-[#EAF1E7] border border-[#85B96F]/30 rounded-xl flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-[#2F8059] animate-pulse shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-[#183E2E] truncate">Demo Workspace</div>
            <div className="text-[10px] text-[#245C43] font-medium truncate flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-[#245C43]" />
              <span>Groq openai/gpt-oss-20b</span>
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-[#D7E8A3] text-[#183E2E] px-1.5 py-0.5 rounded shrink-0">
            Live AI
          </span>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-[#68766D]">
            Navigation
          </div>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors text-sm font-medium relative group cursor-pointer ${
                  isActive
                    ? 'bg-[#EAF1E7] text-[#183E2E] font-semibold border border-[#85B96F]/40'
                    : 'text-[#68766D] hover:bg-[#F8F8F2] hover:text-[#1D2922]'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isActive
                      ? 'bg-[#245C43] text-white shadow-xs'
                      : 'bg-[#F8F8F2] text-[#68766D] group-hover:text-[#183E2E] group-hover:bg-[#EAF1E7]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="truncate leading-tight">{item.label}</div>
                  <div className="text-[11px] text-[#68766D] truncate font-normal opacity-80">
                    {item.desc}
                  </div>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                      isActive
                        ? 'bg-[#D7E8A3] text-[#183E2E]'
                        : 'bg-[#F8F8F2] text-[#68766D] border border-[#E2E8DF]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {isActive && (
                  <div className="w-1.5 h-6 bg-[#245C43] rounded-full absolute right-1.5" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions & User Context */}
        <div className="p-3 border-t border-[#E2E8DF] space-y-2 bg-[#FAFAF7]">
          {/* PRD Principles modal trigger */}
          <button
            onClick={onOpenHelpModal}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#183E2E] bg-white border border-[#E2E8DF] hover:bg-[#EAF1E7] hover:border-[#85B96F]/50 transition-colors shadow-2xs cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#245C43] shrink-0" />
            <span className="flex-1 text-left">PRD Principles & Guidelines</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#68766D]" />
          </button>

          {/* User profile card (Interactive shortcut to Settings) */}
          <button
            onClick={() => {
              onSelectTab('settings');
              onCloseMobile();
            }}
            title="Open Settings & Workspace Profile"
            className="w-full p-2.5 rounded-xl bg-white border border-[#E2E8DF] hover:border-[#85B96F]/50 hover:bg-[#EAF1E7]/50 transition-all flex items-center gap-2.5 text-left cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-[#245C43] group-hover:bg-[#183E2E] text-[#D7E8A3] font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-[#183E2E] truncate">{displayName}</div>
              <div className="text-[11px] text-[#68766D] truncate">{displayRole}</div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-[#68766D] group-hover:text-[#245C43] shrink-0" />
          </button>
        </div>
      </aside>
    </>
  );
};
