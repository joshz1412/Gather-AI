import React, { useState } from 'react';
import { 
  X, 
  Sprout, 
  Calendar, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Info, 
  ChevronRight,
  ShieldAlert,
  Clock,
  Sparkles,
  Loader2,
  Send,
  HelpCircle,
  ShieldCheck,
  Bot
} from 'lucide-react';
import { CropRecord } from '../../types';
import { Badge } from '../common/Badge';
import { formatReadableDate } from '../../utils/harvestCalculator';
import { fetchCropAdvice, CropAdviceOutput } from '../../services/aiService';

interface CropDetailModalProps {
  crop: CropRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onInitiateHandoff: (crop: CropRecord) => void;
  onUpdateCrop: (crop: CropRecord) => void;
  onOpenFreshnessCalculator: (cropName: string) => void;
}

export const CropDetailModal: React.FC<CropDetailModalProps> = ({
  crop,
  isOpen,
  onClose,
  onInitiateHandoff,
  onUpdateCrop,
  onOpenFreshnessCalculator,
}) => {
  const [showSurplusForm, setShowSurplusForm] = useState(false);
  const [surplusQty, setSurplusQty] = useState(crop?.surplusDetails?.estimatedQuantity || 25);
  const [surplusUnit, setSurplusUnit] = useState<NonNullable<CropRecord['surplusDetails']>['unit']>(
    crop?.surplusDetails?.unit || 'crates'
  );
  const [surplusCondition, setSurplusCondition] = useState<NonNullable<CropRecord['surplusDetails']>['condition']>(
    crop?.surplusDetails?.condition || 'Grade B / Blemished'
  );
  const [surplusNotes, setSurplusNotes] = useState(crop?.surplusDetails?.notes || '');

  // Real AI Harvest Guidance state (GroqCloud openai/gpt-oss-20b)
  const [aiQuestion, setAiQuestion] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<CropAdviceOutput | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleRequestAiGuidance = async (customQuestion?: string) => {
    if (!crop) return;
    const q = customQuestion !== undefined ? customQuestion : aiQuestion;
    setIsAiLoading(true);
    setAiError(null);

    try {
      const result = await fetchCropAdvice({
        cropName: crop.cropName,
        variety: crop.variety,
        location: crop.location,
        plantingDate: crop.plantingDate,
        currentStage: crop.currentStage,
        growingMethod: crop.growingMethod,
        soilType: crop.soilType,
        question: q || `Provide actionable stage management guidance and critical observations for ${crop.cropName} at the ${crop.currentStage} stage.`,
      });
      setAiAdvice(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve AI crop guidance.';
      setAiError(msg);
    } finally {
      setIsAiLoading(false);
    }
  };

  if (!isOpen || !crop) return null;

  const handleSaveSurplus = () => {
    const updated: CropRecord = {
      ...crop,
      hasSurplusFlagged: true,
      surplusDetails: {
        estimatedQuantity: Number(surplusQty),
        unit: surplusUnit,
        condition: surplusCondition,
        harvestDate: new Date().toISOString().split('T')[0],
        notes: surplusNotes,
      },
      updatedAt: new Date().toISOString().split('T')[0],
    };

    onUpdateCrop(updated);
    setShowSurplusForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1D2922]/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-[#E2E8DF] shadow-xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8DF] flex items-center justify-between bg-[#FAFAF7]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EAF1E7] text-[#245C43] flex items-center justify-center font-bold border border-[#85B96F]/30">
              {crop.cropName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-bold text-lg text-[#183E2E]">{crop.cropName}</h3>
                <Badge status={crop.currentStage} />
              </div>
              <p className="text-xs text-[#68766D] mt-0.5">
                {crop.variety ? `Variety: ${crop.variety} • ` : ''}
                {crop.location}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#68766D] hover:text-[#183E2E] rounded-lg hover:bg-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Progress & Harvest Window Bar */}
          <div className="bg-[#FAFAF7] border border-[#E2E8DF] rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-[#183E2E]">
              <span>Growth Cycle Progress</span>
              <span className="text-[#245C43]">
                Day {crop.daysSincePlanting} of ~{crop.totalDurationDays} ({crop.progressPercent}%)
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full h-3 bg-[#E2E8DF] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#85B96F] to-[#245C43] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, crop.progressPercent)}%` }}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div>
                <span className="text-[#68766D] block">Planting Date</span>
                <strong className="text-[#183E2E]">{formatReadableDate(crop.plantingDate)}</strong>
              </div>
              <div>
                <span className="text-[#68766D] block">Estimated Harvest Window</span>
                <strong className="text-[#245C43]">
                  {formatReadableDate(crop.estimatedHarvestStart)} – {formatReadableDate(crop.estimatedHarvestEnd)}
                </strong>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-[#68766D] block">Cultivation Method</span>
                <strong className="text-[#183E2E]">{crop.growingMethod} ({crop.soilType})</strong>
              </div>
            </div>
          </div>

          {/* Live AI Harvest Intelligence Assistant (Powered by GroqCloud openai/gpt-oss-20b) */}
          <div className="bg-gradient-to-br from-[#FAFAF7] via-white to-[#EAF1E7]/50 border-2 border-[#85B96F]/50 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8DF] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#245C43] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-heading font-bold text-sm text-[#183E2E]">
                      Live AI Agronomic Advisory
                    </h4>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#D7E8A3] text-[#183E2E] px-2 py-0.5 rounded-md">
                      GroqCloud Live
                    </span>
                  </div>
                  <p className="text-[11px] text-[#68766D]">
                    Grounded crop guidance powered by <span className="font-mono text-[#245C43] font-medium">openai/gpt-oss-20b</span>
                  </p>
                </div>
              </div>

              {!aiAdvice && !isAiLoading && (
                <button
                  onClick={() => handleRequestAiGuidance()}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-[#245C43] hover:bg-[#183E2E] rounded-xl transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#D7E8A3]" />
                  <span>Generate AI Advisory</span>
                </button>
              )}
            </div>

            {/* User Question / Observation Input */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-[#183E2E] block">
                Ask a specific field question or describe observed crop symptoms:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  placeholder={`e.g., Noticing leaf yellowing or afternoon flower drop on ${crop.cropName}...`}
                  className="flex-1 px-3.5 py-2 text-xs border border-[#E2E8DF] rounded-xl focus:outline-none focus:border-[#245C43] bg-white text-[#1D2922]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleRequestAiGuidance();
                    }
                  }}
                />
                <button
                  onClick={() => handleRequestAiGuidance()}
                  disabled={isAiLoading}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#245C43] hover:bg-[#183E2E] disabled:bg-[#68766D] rounded-xl transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  {isAiLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Consulting AI...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Ask AI</span>
                    </>
                  )}
                </button>
              </div>

              {/* Quick suggestion chips */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[10px] text-[#68766D] font-medium">Quick prompts:</span>
                {[
                  'Afternoon heat & flower drop',
                  'Irrigation adjustment this week',
                  'Foliar nutrition & fruit set',
                  'Expected harvest window indicators'
                ].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => {
                      setAiQuestion(chip);
                      handleRequestAiGuidance(chip);
                    }}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-[#E2E8DF] hover:border-[#85B96F] text-[#68766D] hover:text-[#183E2E] transition-colors cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Error state */}
            {aiError && (
              <div className="p-3 bg-[#FDF2F2] border border-[#F8B4B4] rounded-xl text-xs text-[#9B1C1C] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-[#E02424] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold">Unable to fetch AI guidance</div>
                  <div className="text-[11px] mt-0.5">{aiError}</div>
                </div>
                <button
                  onClick={() => handleRequestAiGuidance()}
                  className="text-[11px] underline font-semibold text-[#9B1C1C] hover:text-[#771D1D] cursor-pointer"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Loading state skeleton */}
            {isAiLoading && (
              <div className="p-5 bg-white border border-[#85B96F]/30 rounded-xl space-y-3 animate-pulse">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#245C43]">
                  <Loader2 className="w-4 h-4 animate-spin text-[#245C43]" />
                  <span>Gathering agricultural intelligence via GroqCloud (openai/gpt-oss-20b)...</span>
                </div>
                <div className="h-3 bg-[#EAF1E7] rounded w-3/4" />
                <div className="h-3 bg-[#EAF1E7] rounded w-5/6" />
                <div className="h-3 bg-[#EAF1E7] rounded w-2/3" />
              </div>
            )}

            {/* AI Guidance Results */}
            {aiAdvice && !isAiLoading && (
              <div className="space-y-3.5 pt-1">
                {/* Stage Assessment & Summary */}
                <div className="p-3.5 bg-[#EAF1E7] border border-[#85B96F]/30 rounded-xl text-xs text-[#183E2E] leading-relaxed">
                  <div className="flex items-center justify-between mb-1.5">
                    <strong className="text-[11px] uppercase tracking-wider text-[#245C43]">
                      AI Stage Assessment
                    </strong>
                    {aiAdvice.likely_stage && (
                      <span className="text-[10px] font-semibold bg-[#245C43] text-white px-2 py-0.5 rounded-full">
                        {aiAdvice.likely_stage}
                      </span>
                    )}
                  </div>
                  <p>{aiAdvice.summary}</p>
                </div>

                {/* Prioritized Recommendations (Section 11) */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#183E2E] block">
                    Prioritized Stage Recommendations ({aiAdvice.recommendations.length}):
                  </span>
                  <div className="space-y-2">
                    {aiAdvice.recommendations.map((rec, i) => (
                      <div key={i} className="p-3 bg-white rounded-xl border border-[#E2E8DF] shadow-2xs space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-bold text-xs text-[#183E2E]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#2F8059]" />
                            <span>{rec.title}</span>
                          </div>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            rec.priority === 'high'
                              ? 'bg-[#FEE2E2] text-[#991B1B] border border-[#FCA5A5]'
                              : rec.priority === 'medium'
                              ? 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]'
                              : 'bg-[#F3F4F6] text-[#374151]'
                          }`}>
                            {rec.priority} Priority
                          </span>
                        </div>
                        <p className="text-xs text-[#1D2922] font-medium leading-relaxed pl-5">
                          {rec.action}
                        </p>
                        <div className="pl-5 text-[11px] text-[#68766D] flex items-start gap-1">
                          <span className="font-semibold text-[#245C43]">Why it matters:</span>
                          <span>{rec.reason}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Harvest Readiness Estimate (Section 11) */}
                <div className="p-3.5 bg-white rounded-xl border border-[#E2E8DF] space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#245C43]">
                      Harvest Readiness Estimate:
                    </span>
                    {aiAdvice.harvest_estimate ? (
                      <span className="text-[10px] font-semibold text-[#2F8059] bg-[#EAF1E7] px-2 py-0.5 rounded-full">
                        Calculated Window
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-[#854D0E] bg-[#FEF9C3] px-2 py-0.5 rounded-full">
                        Context Needed
                      </span>
                    )}
                  </div>
                  {aiAdvice.harvest_estimate ? (
                    <div className="space-y-1 text-xs">
                      <div className="font-bold text-[#183E2E]">
                        Target Window: {aiAdvice.harvest_estimate.earliest_date || 'Projected'} to {aiAdvice.harvest_estimate.latest_date || 'Projected'}
                      </div>
                      <p className="text-[11px] text-[#68766D]">
                        <strong>Duration Basis:</strong> {aiAdvice.harvest_estimate.basis}
                      </p>
                      <p className="text-[11px] text-[#68766D]">
                        <strong>Field Verification:</strong> {aiAdvice.harvest_estimate.confidence_note}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-[#68766D]">
                      Harvest timing cannot be estimated without an exact planting date or visual indicators. Please provide planting date to calculate harvest duration.
                    </p>
                  )}
                </div>

                {/* Cautions and Missing Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {aiAdvice.cautions?.length > 0 && (
                    <div className="bg-white p-3 rounded-xl border border-[#E2E8DF] space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#D99A36] flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-[#D99A36]" />
                        <span>Risks & Cautions:</span>
                      </span>
                      <ul className="text-[11px] text-[#68766D] space-y-0.5 list-disc list-inside">
                        {aiAdvice.cautions.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {aiAdvice.missing_information?.length > 0 && (
                    <div className="bg-white p-3 rounded-xl border border-[#E2E8DF] space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#68766D] flex items-center gap-1">
                        <Info className="w-3.5 h-3.5 text-[#68766D]" />
                        <span>Missing Information:</span>
                      </span>
                      <ul className="text-[11px] text-[#68766D] space-y-0.5 list-disc list-inside">
                        {aiAdvice.missing_information.map((m, i) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Advisory Disclaimer */}
                <div className="bg-[#F8F8F2] p-3 rounded-xl border border-[#E2E8DF] text-[10px] text-[#68766D] flex items-start gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#245C43] shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Agricultural Advisory Note:</strong> {aiAdvice.disclaimer}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Actionable Guidance Card */}
          <div className="bg-white border border-[#85B96F]/50 rounded-2xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#245C43]" />
              <h4 className="font-heading font-bold text-sm text-[#183E2E]">
                Agronomic Stage Recommendation
              </h4>
            </div>

            <div className="p-3.5 bg-[#EAF1E7] rounded-xl text-xs text-[#183E2E] leading-relaxed font-medium">
              {crop.guidance.recommendedAction}
            </div>

            <p className="text-xs text-[#68766D] leading-relaxed">
              {crop.guidance.summary}
            </p>

            {/* Key Milestones & Risks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#183E2E] block">
                  Critical Observations to Make:
                </span>
                <ul className="space-y-1 text-xs text-[#68766D]">
                  {crop.guidance.keyMilestones.map((m, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2F8059] shrink-0 mt-0.5" />
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#B94C3D] block">
                  Watch for Environmental Risks:
                </span>
                <ul className="space-y-1 text-xs text-[#68766D]">
                  {crop.guidance.environmentalRisks.map((r, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#D99A36] shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Source & Caveats (PRD rule 1.6 & 9.5) */}
            <div className="bg-[#FAFAF7] p-3 rounded-xl border border-[#E2E8DF] text-[11px] text-[#68766D] space-y-1">
              <div>
                <strong>Reference Source:</strong> {crop.sourceInformation}
              </div>
              <div>
                <strong>Uncertainty Note:</strong> {crop.guidance.uncertaintyNotes}
              </div>
            </div>
          </div>

          {/* Produce Freshness Assessment Tool Trigger */}
          <div className="bg-white border border-[#E2E8DF] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div>
              <h5 className="text-xs font-bold text-[#183E2E] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#245C43]" />
                <span>Evaluate Harvested Produce Shelf-Life</span>
              </h5>
              <p className="text-[11px] text-[#68766D] mt-0.5">
                Check post-harvest stability under current ambient vs cold storage conditions.
              </p>
            </div>
            <button
              onClick={() => onOpenFreshnessCalculator(crop.cropName)}
              className="px-3.5 py-2 text-xs font-semibold text-[#183E2E] bg-[#EAF1E7] border border-[#85B96F]/40 hover:bg-[#D7E8A3] rounded-xl transition-colors shrink-0"
            >
              Freshness Assessment →
            </button>
          </div>

          {/* HARVEST-TO-RECOVERY INTEGRATION (PRD 5.8 & Scene 2) */}
          <div className="bg-gradient-to-r from-[#EAF1E7] to-[#F8F8F2] border border-[#85B96F]/60 rounded-2xl p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#245C43] text-white flex items-center justify-center shrink-0">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-sm text-[#183E2E]">
                    Harvest-to-Recovery Bridge
                  </h4>
                  <p className="text-xs text-[#68766D]">
                    Seamlessly connect surplus crops or market culls with nearby recovery partners.
                  </p>
                </div>
              </div>

              {crop.hasSurplusFlagged && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#FEF08A] text-[#854D0E] px-2 py-0.5 rounded-full border border-[#FCD34D]">
                  Surplus Flagged
                </span>
              )}
            </div>

            {crop.hasSurplusFlagged && crop.surplusDetails ? (
              <div className="bg-white rounded-xl p-4 border border-[#E2E8DF] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="text-[#68766D] block text-[11px]">Flagged Surplus Volume:</span>
                    <strong className="text-base text-[#183E2E] font-heading font-bold">
                      {crop.surplusDetails.estimatedQuantity} {crop.surplusDetails.unit}
                    </strong>
                    <span className="text-[#68766D] text-[11px] ml-2">
                      ({crop.surplusDetails.condition})
                    </span>
                  </div>

                  <button
                    onClick={() => onInitiateHandoff(crop)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#245C43] hover:bg-[#183E2E] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Find a Recovery Option</span>
                  </button>
                </div>

                {crop.surplusDetails.notes && (
                  <p className="text-xs text-[#68766D] border-t border-[#E2E8DF] pt-2">
                    {crop.surplusDetails.notes}
                  </p>
                )}
              </div>
            ) : (
              <div>
                {!showSurplusForm ? (
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-[#68766D]">
                      Have surplus, Grade B culls, or unsold harvest batches from this crop?
                    </p>
                    <button
                      onClick={() => setShowSurplusForm(true)}
                      className="px-3.5 py-2 text-xs font-bold text-[#183E2E] bg-white border border-[#85B96F] hover:bg-[#EAF1E7] rounded-xl transition-colors shrink-0"
                    >
                      + Flag Surplus Batch
                    </button>
                  </div>
                ) : (
                  <div className="bg-white p-4 rounded-xl border border-[#E2E8DF] space-y-3 text-xs">
                    <h5 className="font-semibold text-[#183E2E]">Record Surplus Harvest Batch</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[#68766D] mb-1">Estimated Quantity</label>
                        <input
                          type="number"
                          value={surplusQty}
                          onChange={(e) => setSurplusQty(Number(e.target.value))}
                          className="w-full px-3 py-1.5 border border-[#E2E8DF] rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[#68766D] mb-1">Unit</label>
                        <select
                          value={surplusUnit}
                          onChange={(e) => setSurplusUnit(e.target.value as any)}
                          className="w-full px-3 py-1.5 border border-[#E2E8DF] rounded-lg text-sm"
                        >
                          <option value="crates">Crates (~25kg)</option>
                          <option value="kg">Kilograms (kg)</option>
                          <option value="quintals">Quintals (100kg)</option>
                          <option value="tonnes">Tonnes (1000kg)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[#68766D] mb-1">Condition</label>
                        <select
                          value={surplusCondition}
                          onChange={(e) => setSurplusCondition(e.target.value as any)}
                          className="w-full px-3 py-1.5 border border-[#E2E8DF] rounded-lg text-sm"
                        >
                          <option value="Grade B / Blemished">Grade B / Blemished</option>
                          <option value="Fresh Surplus">Fresh Surplus (Edible)</option>
                          <option value="Overripe">Overripe / Soft</option>
                          <option value="Residues / Stalks">Residues / Stalks</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[#68766D] mb-1">Notes / Mandi Status</label>
                      <input
                        type="text"
                        placeholder="e.g. Unsold at APMC auction; sound pulp with skin spots."
                        value={surplusNotes}
                        onChange={(e) => setSurplusNotes(e.target.value)}
                        className="w-full px-3 py-1.5 border border-[#E2E8DF] rounded-lg text-sm"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => setShowSurplusForm(false)}
                        className="px-3 py-1.5 text-[#68766D] hover:bg-[#F8F8F2] rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveSurplus}
                        className="px-4 py-1.5 bg-[#245C43] text-white font-semibold rounded-lg hover:bg-[#183E2E]"
                      >
                        Save & Flag Surplus
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#E2E8DF] bg-[#FAFAF7] flex items-center justify-between text-xs text-[#68766D]">
          <span>Record ID: {crop.id}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-[#E2E8DF] hover:bg-[#EAF1E7] text-[#183E2E] font-medium rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
