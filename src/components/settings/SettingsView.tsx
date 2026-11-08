import React, { useState, useEffect } from 'react';
import { 
  User, 
  MapPin, 
  Sliders, 
  Sparkles, 
  Bell, 
  Palette, 
  Database, 
  Info, 
  Save, 
  RotateCcw, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Cpu, 
  FileText, 
  Layers, 
  Moon, 
  Sun, 
  Monitor, 
  Phone, 
  Mail, 
  Building2, 
  Sprout, 
  RefreshCw,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { 
  AppSettings, 
  UserProfile, 
  FarmPreferences, 
  AiPreferences, 
  NotificationPreferences, 
  AppearancePreferences,
  CropRecord, 
  WasteRecord, 
  RecoveryRequest, 
  ActivityLog, 
  UserRole 
} from '../../types';
import { 
  exportCropsData, 
  exportWasteData, 
  exportRequestsData, 
  exportActivityData, 
  exportCompleteBackup 
} from '../../utils/exportUtils';
import { GatherGSymbol } from '../common/GatherGSymbol';

interface SettingsViewProps {
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
  crops: CropRecord[];
  wasteRecords: WasteRecord[];
  requests: RecoveryRequest[];
  activityLogs: ActivityLog[];
  onResetDemo: () => void;
  onTriggerTestToast?: (message: string) => void;
}

type SettingsSection = 
  | 'profile' 
  | 'farm' 
  | 'ai' 
  | 'notifications' 
  | 'appearance' 
  | 'data' 
  | 'about';

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  crops,
  wasteRecords,
  requests,
  activityLogs,
  onResetDemo,
  onTriggerTestToast,
}) => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');

  // Form State (cloned from props)
  const [profile, setProfile] = useState<UserProfile>(settings.profile);
  const [farm, setFarm] = useState<FarmPreferences>(settings.farm);
  const [ai, setAi] = useState<AiPreferences>(settings.ai);
  const [notifications, setNotifications] = useState<NotificationPreferences>(settings.notifications);
  const [appearance, setAppearance] = useState<AppearancePreferences>(settings.appearance);

  // Validation & Dirty Tracking
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Reset confirmation modal state
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // AI Health Check state
  const [aiHealth, setAiHealth] = useState<{
    status: 'checking' | 'connected' | 'error';
    model: string;
    message: string;
    latencyMs?: number;
  }>({
    status: 'checking',
    model: 'openai/gpt-oss-20b',
    message: 'Testing GroqCloud AI connection...',
  });

  // Keep state synced if props change from outside
  useEffect(() => {
    setProfile(settings.profile);
    setFarm(settings.farm);
    setAi(settings.ai);
    setNotifications(settings.notifications);
    setAppearance(settings.appearance);
    setIsDirty(false);
  }, [settings]);

  // Genuine live health check
  const performAiHealthCheck = async () => {
    setAiHealth({
      status: 'checking',
      model: 'openai/gpt-oss-20b',
      message: 'Querying /api/health...',
    });
    const startTime = performance.now();
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      const latencyMs = Math.round(performance.now() - startTime);

      if (res.ok && data.status === 'connected') {
        setAiHealth({
          status: 'connected',
          model: data.model || 'openai/gpt-oss-20b',
          message: data.message || 'GroqCloud engine active and responsive.',
          latencyMs,
        });
      } else {
        setAiHealth({
          status: 'error',
          model: data.model || 'openai/gpt-oss-20b',
          message: data.message || 'AI service returned non-connected status.',
          latencyMs,
        });
      }
    } catch (err: unknown) {
      const latencyMs = Math.round(performance.now() - startTime);
      setAiHealth({
        status: 'error',
        model: 'openai/gpt-oss-20b',
        message: 'Could not reach server AI health endpoint.',
        latencyMs,
      });
    }
  };

  useEffect(() => {
    performAiHealthCheck();
  }, []);

  // Validation
  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!profile.fullName.trim()) {
      errs.fullName = 'Full name is required.';
    } else if (profile.fullName.trim().length < 2) {
      errs.fullName = 'Name must be at least 2 characters.';
    }

    if (profile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim())) {
      errs.email = 'Please provide a valid email address.';
    }

    if (profile.phone && !/^\+?[0-9\s\-]{8,18}$/.test(profile.phone.trim())) {
      errs.phone = 'Please provide a valid phone number (e.g., +91 98220 55184).';
    }

    if (!farm.defaultLocation.trim()) {
      errs.defaultLocation = 'Default location is required.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      return;
    }

    const updatedSettings: AppSettings = {
      profile,
      farm,
      ai,
      notifications,
      appearance,
    };

    onSaveSettings(updatedSettings);
    setIsDirty(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleCancel = () => {
    setProfile(settings.profile);
    setFarm(settings.farm);
    setAi(settings.ai);
    setNotifications(settings.notifications);
    setAppearance(settings.appearance);
    setErrors({});
    setIsDirty(false);
  };

  const markDirty = () => {
    setIsDirty(true);
    setSaveSuccess(false);
  };

  // Sections navigation config
  const navSections = [
    { id: 'profile' as SettingsSection, label: 'Profile & Account', icon: User, desc: 'Contact & role info' },
    { id: 'farm' as SettingsSection, label: 'Farm & Operations', icon: Sprout, desc: 'Units, region & focus' },
    { id: 'ai' as SettingsSection, label: 'AI Preferences', icon: Sparkles, desc: 'Groq brain & suggestions' },
    { id: 'notifications' as SettingsSection, label: 'Notifications', icon: Bell, desc: 'In-app alert controls' },
    { id: 'appearance' as SettingsSection, label: 'Appearance', icon: Palette, desc: 'Theme, density & contrast' },
    { id: 'data' as SettingsSection, label: 'Data Management', icon: Database, desc: 'Exports & backup' },
    { id: 'about' as SettingsSection, label: 'About Gather AI', icon: Info, desc: 'Platform specs & build' },
  ];

  const quickLocations = [
    'Nashik APMC Mandi, Maharashtra',
    'Dindori Agricultural Belt, Nashik',
    'Niphad Onion Mandi, Maharashtra',
    'Pimpalgaon Baswant APMC, Nashik',
    'Pune Agricultural Market Yard, Maharashtra',
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner / Save Indicator */}
      <div className="bg-white rounded-3xl border border-[#E2E8DF] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-heading font-bold text-[#183E2E]">Settings & Workspace Preferences</h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#EAF1E7] text-[#245C43] border border-[#85B96F]/30">
              Personalized
            </span>
          </div>
          <p className="text-xs text-[#68766D] mt-1">
            Configure your personal profile, agronomic defaults, Groq AI behavior, and data exports.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          {saveSuccess && (
            <div className="flex items-center gap-1.5 text-xs text-[#2F8059] font-semibold bg-[#EAF1E7] px-3 py-1.5 rounded-xl border border-[#85B96F]/40 animate-fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>Settings Saved!</span>
            </div>
          )}

          {isDirty && (
            <button
              onClick={handleCancel}
              className="px-3.5 py-2 text-xs font-semibold text-[#68766D] hover:text-[#1D2922] bg-[#F8F8F2] hover:bg-[#E2E8DF] border border-[#E2E8DF] rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={!isDirty}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all shadow-xs ${
              isDirty
                ? 'bg-[#245C43] hover:bg-[#183E2E] text-white cursor-pointer hover:shadow-md'
                : 'bg-[#E2E8DF] text-[#68766D] cursor-not-allowed opacity-70'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Section Navigation + Active Section Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Navigation Sidebar */}
        <div className="bg-white rounded-3xl border border-[#E2E8DF] p-3 shadow-xs space-y-1 lg:sticky lg:top-24">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[#68766D]">
            Preference Categories
          </div>

          {navSections.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;

            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-left transition-all text-xs font-semibold group cursor-pointer ${
                  isActive
                    ? 'bg-[#EAF1E7] text-[#183E2E] border border-[#85B96F]/40 shadow-2xs'
                    : 'text-[#68766D] hover:bg-[#F8F8F2] hover:text-[#1D2922]'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isActive
                      ? 'bg-[#245C43] text-white'
                      : 'bg-[#F8F8F2] text-[#68766D] group-hover:bg-[#EAF1E7] group-hover:text-[#183E2E]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="truncate">{sec.label}</div>
                  <div className="text-[10px] text-[#68766D] font-normal truncate opacity-80">
                    {sec.desc}
                  </div>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#245C43] shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Right Content Panel */}
        <div className="lg:col-span-3 space-y-6">
          {/* ========================================================================= */}
          {/* SECTION A: PROFILE & ACCOUNT                                              */}
          {/* ========================================================================= */}
          {activeSection === 'profile' && (
            <div className="bg-white rounded-3xl border border-[#E2E8DF] p-6 shadow-xs space-y-6">
              <div className="border-b border-[#E2E8DF] pb-4">
                <h3 className="text-base font-heading font-bold text-[#183E2E]">Profile & Account Information</h3>
                <p className="text-xs text-[#68766D] mt-0.5">
                  Update your identity details, which automatically populate crop notes and recovery collection requests.
                </p>
              </div>

              {/* Profile Card Preview */}
              <div className="p-4 bg-[#FAFAF7] border border-[#E2E8DF] rounded-2xl flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#245C43] text-[#D7E8A3] text-lg font-bold flex items-center justify-center shadow-xs shrink-0">
                  {profile.fullName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2) || 'RP'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-[#183E2E] truncate">{profile.fullName || 'User Name'}</h4>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#D7E8A3] text-[#183E2E]">
                      {profile.role}
                    </span>
                  </div>
                  <p className="text-xs text-[#68766D] truncate mt-0.5">{profile.farmOrOrgName || 'Independent Producer'}</p>
                  <p className="text-[11px] text-[#68766D] truncate flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3 h-3 text-[#245C43]" />
                    <span>{profile.location || 'Location Not Specified'}</span>
                  </p>
                </div>
              </div>

              {/* Form Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="text-xs font-semibold text-[#183E2E] block mb-1.5">
                    Full Name <span className="text-[#B94C3D]">*</span>
                  </label>
                  <input
                    type="text"
                    value={profile.fullName}
                    onChange={(e) => {
                      setProfile({ ...profile, fullName: e.target.value });
                      markDirty();
                    }}
                    placeholder="e.g. Ramesh Patil"
                    className={`w-full text-xs px-3.5 py-2.5 rounded-xl border ${
                      errors.fullName ? 'border-[#B94C3D] bg-[#FFF5F5]' : 'border-[#E2E8DF] bg-white'
                    } focus:outline-none focus:ring-2 focus:ring-[#85B96F]/50`}
                  />
                  {errors.fullName && (
                    <p className="text-[11px] text-[#B94C3D] mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>{errors.fullName}</span>
                    </p>
                  )}
                </div>

                {/* Role */}
                <div>
                  <label className="text-xs font-semibold text-[#183E2E] block mb-1.5">
                    Primary Operational Role <span className="text-[#B94C3D]">*</span>
                  </label>
                  <select
                    value={profile.role}
                    onChange={(e) => {
                      setProfile({ ...profile, role: e.target.value as UserRole });
                      markDirty();
                    }}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E2E8DF] bg-white focus:outline-none focus:ring-2 focus:ring-[#85B96F]/50"
                  >
                    <option value="Grower & APMC Vendor">Grower & APMC Vendor</option>
                    <option value="Smallholder Farmer">Smallholder Farmer</option>
                    <option value="Food Business Operator">Food Business Operator</option>
                    <option value="Recovery Partner">Recovery Partner / Composter</option>
                    <option value="Agronomist">Agronomist & Field Specialist</option>
                  </select>
                </div>

                {/* Email */}
                <div>
                  <label className="text-xs font-semibold text-[#183E2E] block mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-[#68766D] absolute left-3 top-3" />
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => {
                        setProfile({ ...profile, email: e.target.value });
                        markDirty();
                      }}
                      placeholder="ramesh.patil@nashikgrowers.in"
                      className={`w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border ${
                        errors.email ? 'border-[#B94C3D] bg-[#FFF5F5]' : 'border-[#E2E8DF] bg-white'
                      } focus:outline-none focus:ring-2 focus:ring-[#85B96F]/50`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[11px] text-[#B94C3D] mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>{errors.email}</span>
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="text-xs font-semibold text-[#183E2E] block mb-1.5">
                    Phone / Contact Number
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-[#68766D] absolute left-3 top-3" />
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => {
                        setProfile({ ...profile, phone: e.target.value });
                        markDirty();
                      }}
                      placeholder="+91 98220 55184"
                      className={`w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border ${
                        errors.phone ? 'border-[#B94C3D] bg-[#FFF5F5]' : 'border-[#E2E8DF] bg-white'
                      } focus:outline-none focus:ring-2 focus:ring-[#85B96F]/50`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-[11px] text-[#B94C3D] mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>{errors.phone}</span>
                    </p>
                  )}
                </div>

                {/* Farm or Org Name */}
                <div>
                  <label className="text-xs font-semibold text-[#183E2E] block mb-1.5">
                    Farm, Mandi Stall, or Enterprise Name
                  </label>
                  <div className="relative">
                    <Building2 className="w-3.5 h-3.5 text-[#68766D] absolute left-3 top-3" />
                    <input
                      type="text"
                      value={profile.farmOrOrgName}
                      onChange={(e) => {
                        setProfile({ ...profile, farmOrOrgName: e.target.value });
                        markDirty();
                      }}
                      placeholder="e.g. Patil Fresh Produce & Mandi Stalls"
                      className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-[#E2E8DF] bg-white focus:outline-none focus:ring-2 focus:ring-[#85B96F]/50"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="text-xs font-semibold text-[#183E2E] block mb-1.5">
                    Base Operational Location
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-[#68766D] absolute left-3 top-3" />
                    <input
                      type="text"
                      value={profile.location}
                      onChange={(e) => {
                        setProfile({ ...profile, location: e.target.value });
                        markDirty();
                      }}
                      placeholder="e.g. Nashik APMC Mandi, Maharashtra"
                      className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-[#E2E8DF] bg-white focus:outline-none focus:ring-2 focus:ring-[#85B96F]/50"
                    />
                  </div>
                </div>
              </div>

              {/* Informational callout */}
              <div className="p-3.5 bg-[#FAFAF7] border border-[#E2E8DF] rounded-2xl flex items-start gap-2.5 text-xs text-[#68766D]">
                <ShieldCheck className="w-4 h-4 text-[#245C43] shrink-0 mt-0.5" />
                <span>
                  Profile updates are stored locally on your device session and automatically populate your sidebar profile card, greeting header, and collection coordination contact records.
                </span>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION B: FARM & OPERATIONAL PREFERENCES                                 */}
          {/* ========================================================================= */}
          {activeSection === 'farm' && (
            <div className="bg-white rounded-3xl border border-[#E2E8DF] p-6 shadow-xs space-y-6">
              <div className="border-b border-[#E2E8DF] pb-4">
                <h3 className="text-base font-heading font-bold text-[#183E2E]">Farm & Operational Preferences</h3>
                <p className="text-xs text-[#68766D] mt-0.5">
                  Set default regions, measurement units, and agronomic management focus applied to new crops and waste batches.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Default Location */}
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-[#183E2E] block mb-1.5">
                    Default Agricultural Location / Mandi Belt <span className="text-[#B94C3D]">*</span>
                  </label>
                  <input
                    type="text"
                    value={farm.defaultLocation}
                    onChange={(e) => {
                      setFarm({ ...farm, defaultLocation: e.target.value });
                      markDirty();
                    }}
                    placeholder="e.g. Nashik APMC Mandi, Maharashtra"
                    className={`w-full text-xs px-3.5 py-2.5 rounded-xl border ${
                      errors.defaultLocation ? 'border-[#B94C3D] bg-[#FFF5F5]' : 'border-[#E2E8DF] bg-white'
                    } focus:outline-none focus:ring-2 focus:ring-[#85B96F]/50`}
                  />
                  {errors.defaultLocation && (
                    <p className="text-[11px] text-[#B94C3D] mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>{errors.defaultLocation}</span>
                    </p>
                  )}

                  {/* Quick Select Chips */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="text-[10px] text-[#68766D] py-0.5">Quick select:</span>
                    {quickLocations.map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => {
                          setFarm({ ...farm, defaultLocation: loc });
                          markDirty();
                        }}
                        className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors cursor-pointer ${
                          farm.defaultLocation === loc
                            ? 'bg-[#EAF1E7] text-[#183E2E] border-[#85B96F]'
                            : 'bg-white text-[#68766D] border-[#E2E8DF] hover:bg-[#F8F8F2]'
                        }`}
                      >
                        {loc.split(',')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preferred Weight Unit */}
                <div>
                  <label className="text-xs font-semibold text-[#183E2E] block mb-1.5">
                    Preferred Agricultural Weight Unit
                  </label>
                  <select
                    value={farm.preferredWeightUnit}
                    onChange={(e) => {
                      setFarm({ ...farm, preferredWeightUnit: e.target.value as FarmPreferences['preferredWeightUnit'] });
                      markDirty();
                    }}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E2E8DF] bg-white focus:outline-none focus:ring-2 focus:ring-[#85B96F]/50"
                  >
                    <option value="kg">Kilograms (kg)</option>
                    <option value="quintals">Quintals (100 kg)</option>
                    <option value="tonnes">Metric Tonnes (1,000 kg)</option>
                  </select>
                  <p className="text-[11px] text-[#68766D] mt-1">
                    Used for primary dashboard crop yields and inventory displays.
                  </p>
                </div>

                {/* Default Waste Unit */}
                <div>
                  <label className="text-xs font-semibold text-[#183E2E] block mb-1.5">
                    Default Organic Waste Registration Unit
                  </label>
                  <select
                    value={farm.defaultWasteUnit}
                    onChange={(e) => {
                      setFarm({ ...farm, defaultWasteUnit: e.target.value as FarmPreferences['defaultWasteUnit'] });
                      markDirty();
                    }}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E2E8DF] bg-white focus:outline-none focus:ring-2 focus:ring-[#85B96F]/50"
                  >
                    <option value="kg">Kilograms (kg)</option>
                    <option value="crates">Crates (~20 kg each)</option>
                    <option value="quintals">Quintals (100 kg)</option>
                    <option value="tonnes">Tonnes (1,000 kg)</option>
                  </select>
                  <p className="text-[11px] text-[#68766D] mt-1">
                    Pre-selected unit when registering new organic discard batches.
                  </p>
                </div>

                {/* Agronomic Guidance Focus */}
                <div>
                  <label className="text-xs font-semibold text-[#183E2E] block mb-1.5">
                    Crop Advisory Management Focus
                  </label>
                  <select
                    value={farm.guidanceFocus}
                    onChange={(e) => {
                      setFarm({ ...farm, guidanceFocus: e.target.value as FarmPreferences['guidanceFocus'] });
                      markDirty();
                    }}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E2E8DF] bg-white focus:outline-none focus:ring-2 focus:ring-[#85B96F]/50"
                  >
                    <option value="Organic & Bio-inputs">Organic & Bio-inputs (Bio-fertilizers, neem)</option>
                    <option value="Balanced Integrated Pest Mgmt">Balanced Integrated Pest Management (IPM)</option>
                    <option value="Yield Maximization">Conventional Yield Maximization</option>
                  </select>
                  <p className="text-[11px] text-[#68766D] mt-1">
                    Weights AI agronomic recommendations toward bio-inputs and eco-safe methods.
                  </p>
                </div>

                {/* Default Pickup Window */}
                <div>
                  <label className="text-xs font-semibold text-[#183E2E] block mb-1.5">
                    Default Collection Request Window
                  </label>
                  <select
                    value={farm.defaultPickupWindow}
                    onChange={(e) => {
                      setFarm({ ...farm, defaultPickupWindow: e.target.value as FarmPreferences['defaultPickupWindow'] });
                      markDirty();
                    }}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E2E8DF] bg-white focus:outline-none focus:ring-2 focus:ring-[#85B96F]/50"
                  >
                    <option value="Within 24-48 hours">Within 24-48 hours (Standard)</option>
                    <option value="Tomorrow morning (08:00 – 12:00)">Tomorrow morning (08:00 – 12:00)</option>
                    <option value="Flexible / End of week">Flexible / End of week</option>
                  </select>
                  <p className="text-[11px] text-[#68766D] mt-1">
                    Pre-populated window in collection coordinator drafts.
                  </p>
                </div>

                {/* Shelf-Life Alert Days */}
                <div>
                  <label className="text-xs font-semibold text-[#183E2E] block mb-1.5">
                    Freshness Warning Threshold: <span className="text-[#245C43] font-bold">{farm.shelfLifeAlertDays} days</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="7"
                    step="1"
                    value={farm.shelfLifeAlertDays}
                    onChange={(e) => {
                      setFarm({ ...farm, shelfLifeAlertDays: Number(e.target.value) });
                      markDirty();
                    }}
                    className="w-full accent-[#245C43]"
                  />
                  <div className="flex justify-between text-[10px] text-[#68766D]">
                    <span>1 day (Immediate)</span>
                    <span>3 days (Recommended)</span>
                    <span>7 days (Extended)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION C: AI PREFERENCES & LIVE ENGINE STATUS                            */}
          {/* ========================================================================= */}
          {activeSection === 'ai' && (
            <div className="bg-white rounded-3xl border border-[#E2E8DF] p-6 shadow-xs space-y-6">
              <div className="border-b border-[#E2E8DF] pb-4">
                <h3 className="text-base font-heading font-bold text-[#183E2E]">Gather AI Brain & Intelligence Settings</h3>
                <p className="text-xs text-[#68766D] mt-0.5">
                  Configure the shared AI engine connecting Harvest Intelligence and Food Waste Recovery.
                </p>
              </div>

              {/* Live AI Status Card */}
              <div className="p-4 bg-gradient-to-r from-[#183E2E] to-[#245C43] rounded-2xl text-white shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-[#D7E8A3] border border-white/20 shrink-0">
                      <Cpu className="w-5 h-5 text-[#D7E8A3]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-bold text-sm text-white">AI Engine Status:</span>
                        {aiHealth.status === 'connected' ? (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-[#85B96F]/30 text-[#D7E8A3] border border-[#85B96F]/50 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#D7E8A3] animate-pulse" />
                            Connected (Live)
                          </span>
                        ) : aiHealth.status === 'checking' ? (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-full">
                            Verifying...
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-[#B94C3D] text-white px-2 py-0.5 rounded-full">
                            Offline / Unconfigured
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#F8F8F2]/80 mt-0.5 font-mono">
                        Model: {aiHealth.model} {aiHealth.latencyMs ? `• ${aiHealth.latencyMs}ms response` : ''}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={performAiHealthCheck}
                    className="px-3 py-1.5 text-xs font-semibold text-[#183E2E] bg-[#D7E8A3] hover:bg-white rounded-xl transition-colors shadow-2xs self-start sm:self-auto cursor-pointer"
                  >
                    Test AI Connection
                  </button>
                </div>

                <div className="mt-3 pt-3 border-t border-white/15 text-[11px] text-[#F8F8F2]/90 flex items-center justify-between">
                  <span>Provider: GroqCloud API (OpenAI-compatible inference)</span>
                  <span className="text-[#D7E8A3] font-medium">Server-side isolated • Key never exposed</span>
                </div>
              </div>

              {/* AI Behavior Toggles */}
              <div className="space-y-4">
                {/* 1. Enable AI Suggestions */}
                <div className="p-4 rounded-2xl border border-[#E2E8DF] bg-[#FAFAF7] flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-[#183E2E]">Enable Optional AI Suggestions</h4>
                    <p className="text-[11px] text-[#68766D] mt-0.5">
                      Displays contextual recommendations on the Overview circular cards and Harvest agronomic tab.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={ai.enableAiSuggestions}
                      onChange={(e) => {
                        setAi({ ...ai, enableAiSuggestions: e.target.checked });
                        markDirty();
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#E2E8DF] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#E2E8DF] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#245C43]"></div>
                  </label>
                </div>

                {/* 2. Explanation Detail */}
                <div className="p-4 rounded-2xl border border-[#E2E8DF] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-[#183E2E]">Recommendation Explanation Detail</h4>
                    <p className="text-[11px] text-[#68766D] mt-0.5">
                      Choose between concise, bullet-oriented guidance or detailed agronomic reasoning.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-[#F8F8F2] p-1 rounded-xl border border-[#E2E8DF] shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setAi({ ...ai, explanationDetail: 'concise' });
                        markDirty();
                      }}
                      className={`text-xs px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                        ai.explanationDetail === 'concise'
                          ? 'bg-[#245C43] text-white shadow-2xs'
                          : 'text-[#68766D] hover:text-[#183E2E]'
                      }`}
                    >
                      Concise
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAi({ ...ai, explanationDetail: 'detailed' });
                        markDirty();
                      }}
                      className={`text-xs px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                        ai.explanationDetail === 'detailed'
                          ? 'bg-[#245C43] text-white shadow-2xs'
                          : 'text-[#68766D] hover:text-[#183E2E]'
                      }`}
                    >
                      Detailed
                    </button>
                  </div>
                </div>

                {/* 3. Show Follow-Up Suggestions in Assistant */}
                <div className="p-4 rounded-2xl border border-[#E2E8DF] bg-[#FAFAF7] flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-[#183E2E]">Show Contextual Suggested Questions</h4>
                    <p className="text-[11px] text-[#68766D] mt-0.5">
                      Displays clickable prompt chips based on your active crop or waste batch in the &ldquo;Ask Gather AI&rdquo; modal.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={ai.showFollowUpSuggestions}
                      onChange={(e) => {
                        setAi({ ...ai, showFollowUpSuggestions: e.target.checked });
                        markDirty();
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#E2E8DF] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#E2E8DF] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#245C43]"></div>
                  </label>
                </div>

                {/* 4. Language Mode */}
                <div className="p-4 rounded-2xl border border-[#E2E8DF] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-[#183E2E]">Agricultural Terminology Style</h4>
                    <p className="text-[11px] text-[#68766D] mt-0.5">
                      Include familiar regional Mandi terms (Tamatar, Piaz, Kharif, Rabi) alongside English advice.
                    </p>
                  </div>
                  <select
                    value={ai.languageMode}
                    onChange={(e) => {
                      setAi({ ...ai, languageMode: e.target.value as AiPreferences['languageMode'] });
                      markDirty();
                    }}
                    className="text-xs px-3.5 py-2 rounded-xl border border-[#E2E8DF] bg-white focus:outline-none focus:ring-2 focus:ring-[#85B96F]/50 shrink-0"
                  >
                    <option value="English">Standard English</option>
                    <option value="Hinglish (Hindi + English)">Hinglish / Indian Mandi Terms</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION D: NOTIFICATIONS                                                  */}
          {/* ========================================================================= */}
          {activeSection === 'notifications' && (
            <div className="bg-white rounded-3xl border border-[#E2E8DF] p-6 shadow-xs space-y-6">
              <div className="border-b border-[#E2E8DF] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-heading font-bold text-[#183E2E]">In-App Notification Preferences</h3>
                  <p className="text-xs text-[#68766D] mt-0.5">
                    Control which operational alerts appear in your live session toast feed.
                  </p>
                </div>
                {onTriggerTestToast && (
                  <button
                    type="button"
                    onClick={() => onTriggerTestToast('Test Alert: Gather AI in-app notification system active!')}
                    className="px-3 py-1.5 text-xs font-semibold text-[#183E2E] bg-[#EAF1E7] border border-[#85B96F]/40 hover:bg-[#D7E8A3] rounded-xl transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    Trigger Test Toast
                  </button>
                )}
              </div>

              {/* Delivery method note */}
              <div className="p-3.5 bg-[#EAF1E7] border border-[#85B96F]/30 rounded-2xl text-xs text-[#183E2E] flex items-start gap-2.5">
                <Bell className="w-4 h-4 text-[#245C43] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Active Delivery: In-App Toasts & Audit Banners.</span>
                  <p className="text-[#68766D] text-[11px] mt-0.5">
                    SMS and WhatsApp notifications are in developer preview for enterprise deployments with SMS gateway integrations.
                  </p>
                </div>
              </div>

              {/* Master In-App Alerts */}
              <div className="p-4 rounded-2xl border border-[#85B96F]/50 bg-[#FAFAF7] flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-[#183E2E]">Master In-App Alerts Switch</h4>
                  <p className="text-[11px] text-[#68766D] mt-0.5">
                    Toggle all bottom-right toast notifications across the workspace.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={notifications.inAppAlerts}
                    onChange={(e) => {
                      setNotifications({ ...notifications, inAppAlerts: e.target.checked });
                      markDirty();
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#E2E8DF] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#E2E8DF] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#245C43]"></div>
                </label>
              </div>

              {/* Category Toggles */}
              <div className="space-y-3 pt-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#68766D]">
                  Alert Categories
                </div>

                {/* 1. Crop Guidance */}
                <div className="p-3.5 rounded-xl border border-[#E2E8DF] bg-white flex items-center justify-between gap-4">
                  <div>
                    <h5 className="text-xs font-semibold text-[#183E2E]">Crop Stage & Guidance Reminders</h5>
                    <p className="text-[11px] text-[#68766D]">Alerts when crops transition to new growing stages or require observations.</p>
                  </div>
                  <input
                    type="checkbox"
                    disabled={!notifications.inAppAlerts}
                    checked={notifications.cropGuidanceReminders}
                    onChange={(e) => {
                      setNotifications({ ...notifications, cropGuidanceReminders: e.target.checked });
                      markDirty();
                    }}
                    className="w-4 h-4 accent-[#245C43] cursor-pointer disabled:opacity-40"
                  />
                </div>

                {/* 2. Harvest Window */}
                <div className="p-3.5 rounded-xl border border-[#E2E8DF] bg-white flex items-center justify-between gap-4">
                  <div>
                    <h5 className="text-xs font-semibold text-[#183E2E]">Harvest Window Active Warnings</h5>
                    <p className="text-[11px] text-[#68766D]">Notifications when crops enter maturity and require picking or chilling.</p>
                  </div>
                  <input
                    type="checkbox"
                    disabled={!notifications.inAppAlerts}
                    checked={notifications.harvestWindowReminders}
                    onChange={(e) => {
                      setNotifications({ ...notifications, harvestWindowReminders: e.target.checked });
                      markDirty();
                    }}
                    className="w-4 h-4 accent-[#245C43] cursor-pointer disabled:opacity-40"
                  />
                </div>

                {/* 3. Surplus Recovery Updates */}
                <div className="p-3.5 rounded-xl border border-[#E2E8DF] bg-white flex items-center justify-between gap-4">
                  <div>
                    <h5 className="text-xs font-semibold text-[#183E2E]">Surplus Recovery & Partner Match Updates</h5>
                    <p className="text-[11px] text-[#68766D]">Notifications when newly registered biomass matches regional recovery facilities.</p>
                  </div>
                  <input
                    type="checkbox"
                    disabled={!notifications.inAppAlerts}
                    checked={notifications.surplusRecoveryUpdates}
                    onChange={(e) => {
                      setNotifications({ ...notifications, surplusRecoveryUpdates: e.target.checked });
                      markDirty();
                    }}
                    className="w-4 h-4 accent-[#245C43] cursor-pointer disabled:opacity-40"
                  />
                </div>

                {/* 4. Collection Status Updates */}
                <div className="p-3.5 rounded-xl border border-[#E2E8DF] bg-white flex items-center justify-between gap-4">
                  <div>
                    <h5 className="text-xs font-semibold text-[#183E2E]">Collection Request Status Changes</h5>
                    <p className="text-[11px] text-[#68766D]">Notifies when a partner accepts a request, schedules pickup, or confirms delivery.</p>
                  </div>
                  <input
                    type="checkbox"
                    disabled={!notifications.inAppAlerts}
                    checked={notifications.collectionStatusUpdates}
                    onChange={(e) => {
                      setNotifications({ ...notifications, collectionStatusUpdates: e.target.checked });
                      markDirty();
                    }}
                    className="w-4 h-4 accent-[#245C43] cursor-pointer disabled:opacity-40"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION E: APPEARANCE & INTERFACE                                         */}
          {/* ========================================================================= */}
          {activeSection === 'appearance' && (
            <div className="bg-white rounded-3xl border border-[#E2E8DF] p-6 shadow-xs space-y-6">
              <div className="border-b border-[#E2E8DF] pb-4">
                <h3 className="text-base font-heading font-bold text-[#183E2E]">Appearance & Display Settings</h3>
                <p className="text-xs text-[#68766D] mt-0.5">
                  Customize theme, density, and contrast. Changes apply immediately and persist across sessions.
                </p>
              </div>

              {/* Theme Selection */}
              <div>
                <label className="text-xs font-semibold text-[#183E2E] block mb-2">
                  Color Theme
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Light */}
                  <button
                    type="button"
                    onClick={() => {
                      setAppearance({ ...appearance, theme: 'light' });
                      markDirty();
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      appearance.theme === 'light'
                        ? 'border-[#245C43] bg-[#EAF1E7] ring-2 ring-[#85B96F]/50'
                        : 'border-[#E2E8DF] bg-white hover:bg-[#F8F8F2]'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-white border border-[#E2E8DF] flex items-center justify-center text-[#245C43] mb-2 shadow-2xs">
                      <Sun className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-bold text-[#183E2E]">Light Theme</div>
                    <div className="text-[10px] text-[#68766D] mt-0.5">Warm white background with forest green accents</div>
                  </button>

                  {/* Dark */}
                  <button
                    type="button"
                    onClick={() => {
                      setAppearance({ ...appearance, theme: 'dark' });
                      markDirty();
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      appearance.theme === 'dark'
                        ? 'border-[#85B96F] bg-[#183E2E] text-white ring-2 ring-[#85B96F]/50'
                        : 'border-[#E2E8DF] bg-white hover:bg-[#F8F8F2]'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#0E1F17] border border-[#274D3A] flex items-center justify-center text-[#D7E8A3] mb-2 shadow-2xs">
                      <Moon className="w-4 h-4" />
                    </div>
                    <div className={`text-xs font-bold ${appearance.theme === 'dark' ? 'text-white' : 'text-[#183E2E]'}`}>
                      Dark Theme
                    </div>
                    <div className={`text-[10px] ${appearance.theme === 'dark' ? 'text-[#D7E8A3]' : 'text-[#68766D]'} mt-0.5`}>
                      Deep forest night theme tailored for low-light environments
                    </div>
                  </button>

                  {/* System */}
                  <button
                    type="button"
                    onClick={() => {
                      setAppearance({ ...appearance, theme: 'system' });
                      markDirty();
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      appearance.theme === 'system'
                        ? 'border-[#245C43] bg-[#EAF1E7] ring-2 ring-[#85B96F]/50'
                        : 'border-[#E2E8DF] bg-white hover:bg-[#F8F8F2]'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-white border border-[#E2E8DF] flex items-center justify-center text-[#245C43] mb-2 shadow-2xs">
                      <Monitor className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-bold text-[#183E2E]">System Match</div>
                    <div className="text-[10px] text-[#68766D] mt-0.5">Automatically syncs with your device settings</div>
                  </button>
                </div>
              </div>

              {/* Layout Density */}
              <div className="pt-2">
                <label className="text-xs font-semibold text-[#183E2E] block mb-2">
                  Layout Density
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setAppearance({ ...appearance, density: 'comfortable' });
                      markDirty();
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      appearance.density === 'comfortable'
                        ? 'border-[#245C43] bg-[#EAF1E7] ring-1 ring-[#85B96F]'
                        : 'border-[#E2E8DF] bg-white hover:bg-[#F8F8F2]'
                    }`}
                  >
                    <div className="text-xs font-bold text-[#183E2E]">Comfortable Density</div>
                    <div className="text-[10px] text-[#68766D] mt-0.5">Spacious card padding and comfortable touch targets</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAppearance({ ...appearance, density: 'compact' });
                      markDirty();
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      appearance.density === 'compact'
                        ? 'border-[#245C43] bg-[#EAF1E7] ring-1 ring-[#85B96F]'
                        : 'border-[#E2E8DF] bg-white hover:bg-[#F8F8F2]'
                    }`}
                  >
                    <div className="text-xs font-bold text-[#183E2E]">Compact Density</div>
                    <div className="text-[10px] text-[#68766D] mt-0.5">Dense layout maximizing data visibility on screen</div>
                  </button>
                </div>
              </div>

              {/* High Contrast Mode */}
              <div className="p-4 rounded-2xl border border-[#E2E8DF] bg-[#FAFAF7] flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-[#183E2E]">High-Contrast Outdoor Field Mode</h4>
                  <p className="text-[11px] text-[#68766D] mt-0.5">
                    Reinforces border outlines and text contrast for enhanced visibility under direct sunlight in fields or Mandis.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={appearance.highContrast}
                    onChange={(e) => {
                      setAppearance({ ...appearance, highContrast: e.target.checked });
                      markDirty();
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#E2E8DF] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#E2E8DF] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#245C43]"></div>
                </label>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION F: DATA MANAGEMENT & EXPORTS                                      */}
          {/* ========================================================================= */}
          {activeSection === 'data' && (
            <div className="bg-white rounded-3xl border border-[#E2E8DF] p-6 shadow-xs space-y-6">
              <div className="border-b border-[#E2E8DF] pb-4">
                <h3 className="text-base font-heading font-bold text-[#183E2E]">Data Management, Exports & Backup</h3>
                <p className="text-xs text-[#68766D] mt-0.5">
                  Export verified agricultural records and manage demo scenario state.
                </p>
              </div>

              {/* Dataset Counts Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-[#FAFAF7] border border-[#E2E8DF] rounded-2xl text-center">
                  <div className="text-lg font-heading font-bold text-[#245C43]">{crops.length}</div>
                  <div className="text-[11px] text-[#68766D] font-medium">Registered Crops</div>
                </div>
                <div className="p-3.5 bg-[#FAFAF7] border border-[#E2E8DF] rounded-2xl text-center">
                  <div className="text-lg font-heading font-bold text-[#245C43]">{wasteRecords.length}</div>
                  <div className="text-[11px] text-[#68766D] font-medium">Waste Batches</div>
                </div>
                <div className="p-3.5 bg-[#FAFAF7] border border-[#E2E8DF] rounded-2xl text-center">
                  <div className="text-lg font-heading font-bold text-[#245C43]">{requests.length}</div>
                  <div className="text-[11px] text-[#68766D] font-medium">Recovery Requests</div>
                </div>
                <div className="p-3.5 bg-[#FAFAF7] border border-[#E2E8DF] rounded-2xl text-center">
                  <div className="text-lg font-heading font-bold text-[#245C43]">{activityLogs.length}</div>
                  <div className="text-[11px] text-[#68766D] font-medium">Audit Logs</div>
                </div>
              </div>

              {/* Export Actions Grid */}
              <div className="space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#68766D]">
                  Dataset Export Center
                </div>

                {/* 1. Crops Export */}
                <div className="p-3.5 rounded-2xl border border-[#E2E8DF] bg-white flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-[#183E2E]">Crop Records</h4>
                    <p className="text-[11px] text-[#68766D]">Planting dates, stages, locations, and flagged surplus.</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => exportCropsData(crops, 'csv')}
                      className="px-2.5 py-1.5 text-xs font-semibold text-[#183E2E] bg-[#FAFAF7] border border-[#E2E8DF] hover:bg-[#EAF1E7] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3 text-[#245C43]" />
                      <span>CSV</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => exportCropsData(crops, 'json')}
                      className="px-2.5 py-1.5 text-xs font-semibold text-[#183E2E] bg-[#FAFAF7] border border-[#E2E8DF] hover:bg-[#EAF1E7] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3 text-[#245C43]" />
                      <span>JSON</span>
                    </button>
                  </div>
                </div>

                {/* 2. Waste Export */}
                <div className="p-3.5 rounded-2xl border border-[#E2E8DF] bg-white flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-[#183E2E]">Organic Waste & Surplus Batches</h4>
                    <p className="text-[11px] text-[#68766D]">Material categories, quantities, conditions, and match statuses.</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => exportWasteData(wasteRecords, 'csv')}
                      className="px-2.5 py-1.5 text-xs font-semibold text-[#183E2E] bg-[#FAFAF7] border border-[#E2E8DF] hover:bg-[#EAF1E7] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3 text-[#245C43]" />
                      <span>CSV</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => exportWasteData(wasteRecords, 'json')}
                      className="px-2.5 py-1.5 text-xs font-semibold text-[#183E2E] bg-[#FAFAF7] border border-[#E2E8DF] hover:bg-[#EAF1E7] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3 text-[#245C43]" />
                      <span>JSON</span>
                    </button>
                  </div>
                </div>

                {/* 3. Requests Export */}
                <div className="p-3.5 rounded-2xl border border-[#E2E8DF] bg-white flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-[#183E2E]">Collection & Partner Requests</h4>
                    <p className="text-[11px] text-[#68766D]">Partner IDs, delivery statuses, and confirmed kilograms.</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => exportRequestsData(requests, 'csv')}
                      className="px-2.5 py-1.5 text-xs font-semibold text-[#183E2E] bg-[#FAFAF7] border border-[#E2E8DF] hover:bg-[#EAF1E7] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3 text-[#245C43]" />
                      <span>CSV</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => exportRequestsData(requests, 'json')}
                      className="px-2.5 py-1.5 text-xs font-semibold text-[#183E2E] bg-[#FAFAF7] border border-[#E2E8DF] hover:bg-[#EAF1E7] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3 text-[#245C43]" />
                      <span>JSON</span>
                    </button>
                  </div>
                </div>

                {/* 4. Activity Logs Export */}
                <div className="p-3.5 rounded-2xl border border-[#E2E8DF] bg-white flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-[#183E2E]">Activity & Audit History</h4>
                    <p className="text-[11px] text-[#68766D]">Complete timestamped operational log.</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => exportActivityData(activityLogs, 'csv')}
                      className="px-2.5 py-1.5 text-xs font-semibold text-[#183E2E] bg-[#FAFAF7] border border-[#E2E8DF] hover:bg-[#EAF1E7] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3 text-[#245C43]" />
                      <span>CSV</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => exportActivityData(activityLogs, 'json')}
                      className="px-2.5 py-1.5 text-xs font-semibold text-[#183E2E] bg-[#FAFAF7] border border-[#E2E8DF] hover:bg-[#EAF1E7] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3 h-3 text-[#245C43]" />
                      <span>JSON</span>
                    </button>
                  </div>
                </div>

                {/* 5. Complete Backup */}
                <div className="p-4 rounded-2xl border border-[#85B96F]/40 bg-[#EAF1E7]/60 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-[#183E2E]">Complete Workspace JSON Archive</h4>
                    <p className="text-[11px] text-[#68766D]">Full unified snapshot including crops, waste records, requests, logs, and settings.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => exportCompleteBackup(crops, wasteRecords, requests, activityLogs, settings)}
                    className="px-3 py-2 text-xs font-bold text-white bg-[#245C43] hover:bg-[#183E2E] rounded-xl transition-all shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[#D7E8A3]" />
                    <span>Download All</span>
                  </button>
                </div>
              </div>

              {/* Demo Reset Section */}
              <div className="pt-4 border-t border-[#E2E8DF]">
                <div className="p-4 rounded-2xl border border-[#B94C3D]/30 bg-[#FFF5F5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-[#B94C3D] flex items-center gap-1.5">
                      <RotateCcw className="w-4 h-4 text-[#B94C3D]" />
                      <span>Reset Simulated Hackathon Demo Data</span>
                    </h4>
                    <p className="text-[11px] text-[#68766D] mt-0.5">
                      Restores the verified 5-scene demo dataset (Tomato, Wheat stubble, Onion culls). Your personalized profile and settings will be preserved.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsResetConfirmOpen(true)}
                    className="px-3.5 py-2 text-xs font-semibold text-white bg-[#B94C3D] hover:bg-[#97392C] rounded-xl transition-colors shadow-2xs shrink-0 cursor-pointer"
                  >
                    Reset Demo
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION G: ABOUT GATHER AI                                                */}
          {/* ========================================================================= */}
          {activeSection === 'about' && (
            <div className="bg-white rounded-3xl border border-[#E2E8DF] p-6 shadow-xs space-y-6">
              <div className="border-b border-[#E2E8DF] pb-4">
                <h3 className="text-base font-heading font-bold text-[#183E2E]">About Gather AI</h3>
                <p className="text-xs text-[#68766D] mt-0.5">
                  Product specifications, architectural overview, and hackathon MVP release notes.
                </p>
              </div>

              {/* Brand Banner */}
              <div className="p-6 bg-[#FAFAF7] border border-[#E2E8DF] rounded-2xl flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                <div className="w-16 h-16 rounded-2xl bg-white border border-[#E2E8DF] flex items-center justify-center p-3 shadow-2xs shrink-0">
                  <GatherGSymbol className="w-full h-full" />
                </div>
                <div>
                  <h4 className="text-lg font-heading font-extrabold text-[#183E2E]">Gather AI</h4>
                  <p className="text-xs font-semibold text-[#245C43] mt-0.5">
                    Grow smarter. Waste less. Gather more.
                  </p>
                  <p className="text-xs text-[#68766D] mt-2 max-w-xl">
                    An AI-powered agricultural sustainability platform connecting crop growing decisions with practical organic-waste recovery pathways in India.
                  </p>
                </div>
              </div>

              {/* Specifications Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl border border-[#E2E8DF] bg-white space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#68766D]">Application Version</span>
                  <div className="font-semibold text-[#183E2E]">v1.2.0 (National Hackathon MVP)</div>
                  <p className="text-[11px] text-[#68766D]">Five-hour sprint build compliant with master PRD specifications.</p>
                </div>

                <div className="p-4 rounded-xl border border-[#E2E8DF] bg-white space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#68766D]">AI Inference Model</span>
                  <div className="font-semibold text-[#183E2E]">GroqCloud • openai/gpt-oss-20b</div>
                  <p className="text-[11px] text-[#68766D]">Ultra-fast server-side inference powering agronomy & circular recovery.</p>
                </div>

                <div className="p-4 rounded-xl border border-[#E2E8DF] bg-white space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#68766D]">Module 1: Harvest Intelligence</span>
                  <p className="text-[11px] text-[#68766D]">
                    Stage management, planting timelines, freshness risk alerts, and surplus yield detection.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-[#E2E8DF] bg-white space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#68766D]">Module 2: Food Waste Recovery</span>
                  <p className="text-[11px] text-[#68766D]">
                    Deterministic partner matching, 6 certified regional bio-facilities, and transparent request coordination.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#EAF1E7] border border-[#85B96F]/30 text-xs text-[#183E2E] flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#245C43] shrink-0 mt-0.5" />
                <span>
                  The deterministic matching engine remains 100% the source of truth for partner compatibility and facility suitability. AI operates as an intelligent advisor and drafting coordinator.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog for Demo Reset */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1D2922]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-[#E2E8DF] shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF5F5] border border-[#B94C3D]/30 flex items-center justify-center text-[#B94C3D]">
              <AlertTriangle className="w-6 h-6 text-[#B94C3D]" />
            </div>

            <div>
              <h3 className="font-heading font-bold text-base text-[#183E2E]">Reset Hackathon Demo Data?</h3>
              <p className="text-xs text-[#68766D] mt-1">
                This will reset all crop records, waste batches, collection requests, and activity logs back to the original 5-scene hackathon demonstration scenario.
              </p>
            </div>

            <div className="p-3 bg-[#FAFAF7] border border-[#E2E8DF] rounded-xl text-[11px] text-[#183E2E] space-y-1">
              <div className="font-semibold text-[#245C43]">What is preserved:</div>
              <ul className="list-disc list-inside text-[#68766D]">
                <li>Your personalized profile name, email & phone</li>
                <li>Your saved AI and notification preferences</li>
                <li>Your selected theme and layout density</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-[#68766D] hover:text-[#1D2922] bg-[#F8F8F2] hover:bg-[#E2E8DF] rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsResetConfirmOpen(false);
                  onResetDemo();
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#B94C3D] hover:bg-[#97392C] rounded-xl transition-colors shadow-2xs cursor-pointer"
              >
                Yes, Reset Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
