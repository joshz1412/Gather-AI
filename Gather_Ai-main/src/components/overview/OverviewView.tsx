import React from 'react';
import { 
  Sprout, 
  RefreshCw, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  Building2, 
  Clock, 
  ShieldCheck, 
  TrendingUp, 
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { 
  CropRecord, 
  WasteRecord, 
  RecoveryRequest, 
  ActivityLog, 
  ImpactSummary, 
  NavigationTab 
} from '../../types';
import { Badge } from '../common/Badge';
import { DemoNotice } from '../common/DemoNotice';
import { formatQuantityKg } from '../../utils/matchingEngine';

interface OverviewViewProps {
  crops: CropRecord[];
  wasteRecords: WasteRecord[];
  requests: RecoveryRequest[];
  activityLogs: ActivityLog[];
  impactSummary: ImpactSummary;
  onNavigate: (tab: NavigationTab) => void;
  onOpenAddCrop: () => void;
  onOpenRegisterWaste: () => void;
  onSelectCrop: (crop: CropRecord) => void;
  onSelectWaste: (waste: WasteRecord) => void;
  onInitiateHandoff: (crop: CropRecord) => void;
  onOpenHelpModal: () => void;
  onOpenAssistant?: (prompt?: string) => void;
  onOpenSurplusAdvisor?: () => void;
  enableAiSuggestions?: boolean;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  crops,
  wasteRecords,
  requests,
  activityLogs,
  impactSummary,
  onNavigate,
  onOpenAddCrop,
  onOpenRegisterWaste,
  onSelectCrop,
  onSelectWaste,
  onInitiateHandoff,
  onOpenHelpModal,
  onOpenAssistant,
  onOpenSurplusAdvisor,
  enableAiSuggestions = true,
}) => {
  // Identify crops or batches that require attention
  const cropsNeedingAttention = crops.filter(
    (c) => c.guidance.produceAttentionNeeded || c.hasSurplusFlagged
  );

  const surplusCrops = crops.filter((c) => c.hasSurplusFlagged && c.surplusDetails);
  const activeHarvestCrops = crops.filter((c) => c.currentStage === 'Harvest Window Active');
  const openWasteBatches = wasteRecords.filter(
    (w) => w.status === 'Registered' || w.status === 'Matching Available'
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Demo Mode Notice */}
      <DemoNotice onLearnMore={onOpenHelpModal} />

      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#183E2E] via-[#245C43] to-[#183E2E] rounded-3xl p-6 sm:p-8 text-white shadow-md">
        {/* Subtle decorative background organic rings */}
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-80 h-80 rounded-full border border-white/10 pointer-events-none" />
        <div className="absolute right-12 bottom-0 -mb-16 w-60 h-60 rounded-full border border-white/5 pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-[#D7E8A3] text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Circular Agricultural Platform</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight text-white mb-2 leading-snug">
            Grow smarter. Waste less. Gather more.
          </h2>
          <p className="text-sm sm:text-base text-[#F8F8F2]/90 leading-relaxed font-normal mb-6">
            Gather AI connects your day-to-day growing decisions with practical organic-waste recovery — helping keep valuable agricultural produce in productive circulation.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('harvest')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D7E8A3] hover:bg-[#c9dd8f] text-[#183E2E] font-bold text-xs sm:text-sm transition-all shadow-xs"
            >
              <Sprout className="w-4 h-4 text-[#183E2E]" />
              <span>Explore Crop Intelligence</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('waste')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 font-semibold text-xs sm:text-sm transition-all"
            >
              <RefreshCw className="w-4 h-4 text-[#D7E8A3]" />
              <span>Coordinate Organic Recovery</span>
            </button>
          </div>
        </div>
      </div>

      {/* FEATURE 6: CROSS-MODULE CIRCULAR INTELLIGENCE (PRD & Master Prompt) */}
      <div className="bg-white border-2 border-[#85B96F]/40 rounded-3xl p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[#E2E8DF]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EAF1E7] text-[#245C43] flex items-center justify-center font-bold border border-[#85B96F]/30">
              <Sparkles className="w-5 h-5 text-[#245C43]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-bold text-base text-[#183E2E]">
                  Gather AI Circular Brain Recommendations
                </h3>
                <span className="text-[10px] font-bold bg-[#EAF1E7] text-[#245C43] px-2.5 py-0.5 rounded-full border border-[#85B96F]/40">
                  Cross-Module Link
                </span>
              </div>
              <p className="text-xs text-[#68766D] mt-0.5">
                Proactive intelligence connecting your active field crops with organic resource recovery opportunities.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenSurplusAdvisor && (
              <button
                onClick={onOpenSurplusAdvisor}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F8F8F2] hover:bg-[#EAF1E7] text-[#183E2E] border border-[#E2E8DF] rounded-xl text-xs font-semibold transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#245C43]" />
                <span>AI Surplus Advisor</span>
              </button>
            )}
            {onOpenAssistant && (
              <button
                onClick={() => onOpenAssistant()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#245C43] hover:bg-[#183E2E] text-white rounded-xl text-xs font-bold transition-all shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#D7E8A3]" />
                <span>Ask Gather AI</span>
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Scenario Insight Cards */}
        {!enableAiSuggestions ? (
          <div className="p-4 bg-[#FAFAF7] border border-[#E2E8DF] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#68766D]">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-[#85B96F] shrink-0" />
              <span>Optional automated AI recommendations are paused according to your AI preferences.</span>
            </div>
            <button
              onClick={() => onNavigate('settings')}
              className="text-xs font-semibold text-[#245C43] hover:underline self-start sm:self-auto cursor-pointer"
            >
              Configure in Settings →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* Scenario A: Surplus Flagged on Active Crop */}
          {surplusCrops.length > 0 && surplusCrops.slice(0, 1).map((c) => (
            <div key={`surplus-${c.id}`} className="bg-[#FEF9C3]/40 border border-[#FEF08A] rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-2xs">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#854D0E] bg-[#FEF08A] px-2 py-0.5 rounded-md">
                    Scenario A: Flagged Surplus
                  </span>
                  <span className="text-[11px] font-bold text-[#854D0E]">
                    {c.surplusDetails?.estimatedQuantity} {c.surplusDetails?.unit}
                  </span>
                </div>
                <h4 className="font-heading font-bold text-sm text-[#183E2E]">
                  Unrouted Harvest Surplus: {c.cropName}
                </h4>
                <p className="text-xs text-[#92400E] leading-relaxed">
                  Surplus registered at {c.location}. Initiate hand-off to Food Waste Recovery to match with local composting and bio-CNG facilities before perishability sets in.
                </p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[#FEF08A]">
                {onOpenAssistant && (
                  <button
                    onClick={() => onOpenAssistant(`I have ${c.surplusDetails?.estimatedQuantity} ${c.surplusDetails?.unit} of ${c.cropName} in ${c.location}. What are my recovery options?`)}
                    className="text-[11px] text-[#854D0E] font-semibold hover:underline"
                  >
                    Ask AI Brain →
                  </button>
                )}
                <button
                  onClick={() => onInitiateHandoff(c)}
                  className="px-3 py-1.5 bg-[#245C43] hover:bg-[#183E2E] text-white text-xs font-bold rounded-xl transition-colors shadow-2xs"
                >
                  Find Recovery Route
                </button>
              </div>
            </div>
          ))}

          {/* Scenario B: Active Harvest Planning */}
          {activeHarvestCrops.length > 0 && activeHarvestCrops.slice(0, 1).map((c) => (
            <div key={`harvest-${c.id}`} className="bg-[#EAF1E7]/50 border border-[#85B96F]/40 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-2xs">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#245C43] bg-[#EAF1E7] px-2 py-0.5 rounded-md border border-[#85B96F]/30">
                    Scenario B: Harvest Window
                  </span>
                  <Badge status={c.currentStage} size="sm" />
                </div>
                <h4 className="font-heading font-bold text-sm text-[#183E2E]">
                  Active Harvest Planning: {c.cropName}
                </h4>
                <p className="text-xs text-[#68766D] leading-relaxed">
                  Crop reached harvest maturity in {c.location}. Pre-aligning recovery facilities provides an immediate outlet for sorting losses and culls during peak harvest.
                </p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[#85B96F]/20">
                {onOpenAssistant && (
                  <button
                    onClick={() => onOpenAssistant(`How can I plan organic waste recovery for my ${c.cropName} harvest in ${c.location}?`)}
                    className="text-[11px] text-[#245C43] font-semibold hover:underline"
                  >
                    Harvest Advice →
                  </button>
                )}
                <button
                  onClick={() => onNavigate('partners')}
                  className="px-3 py-1.5 bg-white hover:bg-[#EAF1E7] text-[#183E2E] border border-[#85B96F]/50 text-xs font-bold rounded-xl transition-colors"
                >
                  Pre-Screen Facilities
                </button>
              </div>
            </div>
          ))}

          {/* Scenario C: Uncoordinated Recovery Batches */}
          {openWasteBatches.length > 0 && openWasteBatches.slice(0, 1).map((w) => (
            <div key={`waste-${w.id}`} className="bg-[#F8F8F2] border border-[#E2E8DF] rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-2xs">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#68766D] bg-white px-2 py-0.5 rounded-md border border-[#E2E8DF]">
                    Scenario C: Next Action
                  </span>
                  <span className="text-[11px] font-bold text-[#183E2E]">
                    {w.quantity} {w.unit}
                  </span>
                </div>
                <h4 className="font-heading font-bold text-sm text-[#183E2E]">
                  Pending Request: {w.materialType}
                </h4>
                <p className="text-xs text-[#68766D] leading-relaxed">
                  Batch registered at {w.pickupLocation} is awaiting facility selection. Review compatible recovery partners and prepare an AI-assisted collection request.
                </p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[#E2E8DF]">
                {onOpenAssistant && (
                  <button
                    onClick={() => onOpenAssistant(`What partner is best for ${w.quantity} ${w.unit} of ${w.materialType}?`)}
                    className="text-[11px] text-[#245C43] font-semibold hover:underline"
                  >
                    Match Insights →
                  </button>
                )}
                <button
                  onClick={() => onSelectWaste(w)}
                  className="px-3 py-1.5 bg-[#245C43] hover:bg-[#183E2E] text-white text-xs font-bold rounded-xl transition-colors shadow-2xs"
                >
                  Match Partners
                </button>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>

      {/* Two Core Module Cards (Equal Weight) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Module 1: Harvest Intelligence */}
        <div className="bg-white border border-[#E2E8DF] hover:border-[#85B96F]/60 rounded-2xl p-6 transition-all shadow-2xs hover:shadow-xs flex flex-col justify-between group">
          <div>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#EAF1E7] text-[#245C43] flex items-center justify-center shrink-0 border border-[#85B96F]/30 group-hover:scale-105 transition-transform">
                <Sprout className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#EAF1E7] text-[#183E2E]">
                Module 01
              </span>
            </div>

            <h3 className="text-xl font-heading font-bold text-[#183E2E] mb-2 flex items-center gap-2">
              Harvest Intelligence
            </h3>
            <p className="text-sm text-[#68766D] leading-relaxed mb-4">
              Plan crop stages, understand local weather factors, estimate harvest windows, and diagnose post-harvest produce freshness.
            </p>

            <div className="bg-[#F8F8F2] rounded-xl p-3.5 border border-[#E2E8DF] mb-5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#68766D]">Monitored crops</span>
                <span className="font-bold text-[#183E2E]">{crops.length} registered</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#68766D]">Harvest active window</span>
                <span className="font-semibold text-[#245C43]">
                  {crops.filter((c) => c.currentStage === 'Harvest Window Active').length} crop(s) ready
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-[#E2E8DF]">
            <button
              onClick={() => onNavigate('harvest')}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#245C43] hover:bg-[#183E2E] text-white text-xs sm:text-sm font-semibold transition-colors"
            >
              <span>Open Harvest</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenAddCrop}
              className="px-3.5 py-2.5 rounded-xl bg-[#F8F8F2] hover:bg-[#EAF1E7] text-[#183E2E] border border-[#E2E8DF] text-xs font-semibold transition-colors"
            >
              + Add Crop
            </button>
          </div>
        </div>

        {/* Module 2: Food Waste Recovery */}
        <div className="bg-white border border-[#E2E8DF] hover:border-[#85B96F]/60 rounded-2xl p-6 transition-all shadow-2xs hover:shadow-xs flex flex-col justify-between group">
          <div>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#EAF1E7] text-[#245C43] flex items-center justify-center shrink-0 border border-[#85B96F]/30 group-hover:scale-105 transition-transform">
                <RefreshCw className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#EAF1E7] text-[#183E2E]">
                Module 02
              </span>
            </div>

            <h3 className="text-xl font-heading font-bold text-[#183E2E] mb-2 flex items-center gap-2">
              Food Waste Recovery
            </h3>
            <p className="text-sm text-[#68766D] leading-relaxed mb-4">
              Register surplus produce or organic residues, evaluate material compatibility, and coordinate collections with nearby composting & biogas hubs.
            </p>

            <div className="bg-[#F8F8F2] rounded-xl p-3.5 border border-[#E2E8DF] mb-5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#68766D]">Open recovery batches</span>
                <span className="font-bold text-[#183E2E]">{wasteRecords.length} active</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#68766D]">Confirmed collected</span>
                <span className="font-semibold text-[#2F8059]">
                  {formatQuantityKg(impactSummary.confirmedCollectedKg)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-[#E2E8DF]">
            <button
              onClick={() => onNavigate('waste')}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#245C43] hover:bg-[#183E2E] text-white text-xs sm:text-sm font-semibold transition-colors"
            >
              <span>Find a Recovery Option</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenRegisterWaste}
              className="px-3.5 py-2.5 rounded-xl bg-[#F8F8F2] hover:bg-[#EAF1E7] text-[#183E2E] border border-[#E2E8DF] text-xs font-semibold transition-colors"
            >
              + Register
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row (Strictly Distinguishing Stages) */}
      <div className="bg-white border border-[#E2E8DF] rounded-2xl p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#245C43]" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#68766D]">
              Platform Flow & Resource Ledger
            </h4>
          </div>
          <span className="text-[11px] font-semibold text-[#68766D] bg-[#F8F8F2] px-2.5 py-1 rounded-md border border-[#E2E8DF]">
            Sample Data Labelled
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 divide-y lg:divide-y-0 lg:divide-x divide-[#E2E8DF]">
          {/* Metric 1: Active Crops */}
          <div className="pt-2 lg:pt-0 lg:px-3 first:pl-0">
            <span className="text-xs font-medium text-[#68766D] block mb-1">
              Active Crops
            </span>
            <div className="text-2xl sm:text-3xl font-heading font-extrabold text-[#183E2E]">
              {crops.length}
            </div>
            <span className="text-[11px] text-[#245C43] font-medium flex items-center gap-1 mt-1">
              <Sprout className="w-3 h-3" />
              <span>Across 3 Indian agro-zones</span>
            </span>
          </div>

          {/* Metric 2: Registered Waste */}
          <div className="pt-2 lg:pt-0 lg:px-4">
            <span className="text-xs font-medium text-[#68766D] block mb-1">
              Registered Organic Biomass
            </span>
            <div className="text-2xl sm:text-3xl font-heading font-extrabold text-[#183E2E]">
              {formatQuantityKg(impactSummary.registeredQuantityKg)}
            </div>
            <span className="text-[11px] text-[#68766D] font-medium flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3 text-[#D99A36]" />
              <span>Total volume registered</span>
            </span>
          </div>

          {/* Metric 3: Matched to Partners */}
          <div className="pt-2 lg:pt-0 lg:px-4">
            <span className="text-xs font-medium text-[#68766D] block mb-1">
              Matched to Recovery Partners
            </span>
            <div className="text-2xl sm:text-3xl font-heading font-extrabold text-[#245C43]">
              {formatQuantityKg(impactSummary.matchedQuantityKg)}
            </div>
            <span className="text-[11px] text-[#245C43] font-medium flex items-center gap-1 mt-1">
              <Building2 className="w-3 h-3" />
              <span>Compatible facilities identified</span>
            </span>
          </div>

          {/* Metric 4: Confirmed Recovered */}
          <div className="pt-2 lg:pt-0 lg:px-4 last:pr-0">
            <span className="text-xs font-medium text-[#68766D] block mb-1">
              Confirmed Collected & Recovered
            </span>
            <div className="text-2xl sm:text-3xl font-heading font-extrabold text-[#2F8059]">
              {formatQuantityKg(impactSummary.confirmedCollectedKg)}
            </div>
            <span className="text-[11px] text-[#2F8059] font-medium flex items-center gap-1 mt-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Verified at weighbridge</span>
            </span>
          </div>
        </div>
      </div>

      {/* Two-Column Section: Crops Requiring Attention & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Crops Requiring Attention / Active Harvests */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#D99A36]" />
              <h4 className="text-sm font-heading font-bold text-[#183E2E]">
                Crops Requiring Attention ({cropsNeedingAttention.length})
              </h4>
            </div>
            <button
              onClick={() => onNavigate('harvest')}
              className="text-xs font-semibold text-[#245C43] hover:underline flex items-center gap-1"
            >
              <span>View all crops</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {cropsNeedingAttention.length === 0 ? (
              <div className="p-6 bg-white border border-[#E2E8DF] rounded-2xl text-center text-sm text-[#68766D]">
                All registered crops are currently within standard vegetative growth envelopes.
              </div>
            ) : (
              cropsNeedingAttention.map((crop) => (
                <div
                  key={crop.id}
                  className="bg-white border border-[#E2E8DF] hover:border-[#85B96F]/50 rounded-2xl p-4 sm:p-5 transition-all shadow-2xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#EAF1E7] text-[#245C43] flex items-center justify-center font-bold text-sm shrink-0">
                        {crop.cropName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h5 className="font-heading font-bold text-[#183E2E] text-base leading-tight">
                          {crop.cropName}
                        </h5>
                        <p className="text-xs text-[#68766D] mt-0.5">
                          {crop.variety ? `${crop.variety} • ` : ''}{crop.location}
                        </p>
                      </div>
                    </div>
                    <Badge status={crop.currentStage} />
                  </div>

                  {/* Recommendation pill */}
                  <div className="bg-[#FAFAF7] rounded-xl p-3 border border-[#E2E8DF] text-xs text-[#1D2922] mb-3">
                    <div className="font-semibold text-[#183E2E] mb-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#245C43]" />
                      <span>Recommended Action:</span>
                    </div>
                    <p className="text-[#68766D] leading-relaxed">
                      {crop.guidance.recommendedAction}
                    </p>
                  </div>

                  {/* Surplus integration callout if surplus flagged */}
                  {crop.hasSurplusFlagged && crop.surplusDetails && (
                    <div className="bg-[#FEF9C3]/50 border border-[#FEF08A] rounded-xl p-3 mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-[#D99A36] shrink-0" />
                        <div>
                          <strong className="text-[#854D0E] font-semibold">Surplus Batch Flagged: </strong>
                          <span className="text-[#92400E]">
                            {crop.surplusDetails.estimatedQuantity} {crop.surplusDetails.unit} ({crop.surplusDetails.condition})
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => onInitiateHandoff(crop)}
                        className="self-end sm:self-auto px-3 py-1.5 rounded-lg bg-[#245C43] hover:bg-[#183E2E] text-white font-semibold text-xs transition-colors shrink-0 flex items-center gap-1.5 shadow-2xs"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Find Recovery Option</span>
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-[#68766D] pt-2 border-t border-[#E2E8DF]">
                    <span>Day {crop.daysSincePlanting} of ~{crop.totalDurationDays}</span>
                    <button
                      onClick={() => onSelectCrop(crop)}
                      className="font-semibold text-[#245C43] hover:underline"
                    >
                      View Crop Details →
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column (1 span): Recent Activity Timeline */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#245C43]" />
              <h4 className="text-sm font-heading font-bold text-[#183E2E]">
                Recent Activity
              </h4>
            </div>
            <button
              onClick={() => onNavigate('activity')}
              className="text-xs font-semibold text-[#245C43] hover:underline"
            >
              Full log
            </button>
          </div>

          <div className="bg-white border border-[#E2E8DF] rounded-2xl p-4 shadow-2xs divide-y divide-[#E2E8DF]">
            {activityLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-xs font-semibold text-[#183E2E] leading-snug">
                    {log.title}
                  </span>
                  <span className="text-[10px] text-[#68766D] shrink-0 font-medium">
                    {log.timestamp}
                  </span>
                </div>
                <p className="text-xs text-[#68766D] line-clamp-2 leading-relaxed">
                  {log.description}
                </p>
                {log.statusBadge && (
                  <div className="mt-2">
                    <Badge status={log.statusBadge} size="sm" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick Help Box */}
          <div className="bg-[#EAF1E7] border border-[#85B96F]/40 rounded-2xl p-4 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-[#183E2E]">
              <Info className="w-4 h-4 text-[#245C43]" />
              <span>Circular Economy Hand-off</span>
            </div>
            <p className="text-[#68766D] leading-relaxed">
              When harvest surplus or market discards are identified, Gather AI pre-fills material specs, volume, and storage conditions directly into recovery partner coordination.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
