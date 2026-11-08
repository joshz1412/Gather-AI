import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Send, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Info, 
  ShieldCheck, 
  Sprout, 
  RefreshCw, 
  HelpCircle,
  CornerDownRight
} from 'lucide-react';
import { CropRecord, WasteRecord, RecoveryPartner, NavigationTab } from '../../types';
import { askGatherAssistant, GatherAssistantOutput } from '../../services/aiService';

interface GatherAiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Context awareness
  activeTab: NavigationTab;
  currentCrop?: CropRecord | null;
  currentWaste?: WasteRecord | null;
  currentPartner?: RecoveryPartner | null;
  totalCropsCount: number;
  totalWasteCount: number;
  pendingRequestsCount: number;
  activeHarvestCrops: string[];
  flaggedSurplusCrops: string[];
  initialQuestion?: string;
  showFollowUpSuggestions?: boolean;
  // Navigation callbacks
  onNavigate: (tab: NavigationTab) => void;
  onOpenAddCrop: () => void;
  onOpenRegisterWaste: () => void;
}

export const GatherAiAssistantModal: React.FC<GatherAiAssistantModalProps> = ({
  isOpen,
  onClose,
  activeTab,
  currentCrop,
  currentWaste,
  currentPartner,
  totalCropsCount,
  totalWasteCount,
  pendingRequestsCount,
  activeHarvestCrops,
  flaggedSurplusCrops,
  initialQuestion,
  showFollowUpSuggestions = true,
  onNavigate,
  onOpenAddCrop,
  onOpenRegisterWaste,
}) => {
  const [question, setQuestion] = useState(initialQuestion || '');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<GatherAssistantOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialQuestion) {
      setQuestion(initialQuestion);
    }
  }, [initialQuestion]);

  // Suggested prompts contextualized by current context
  const getContextualPrompts = (): string[] => {
    if (currentCrop) {
      return [
        `What should I focus on for my ${currentCrop.cropName} at the ${currentCrop.currentStage} stage?`,
        `How can I tell when ${currentCrop.cropName} is ready for harvest?`,
        `What are the most common pests or heat risks for ${currentCrop.cropName} in ${currentCrop.location}?`,
        `If I harvest a surplus of ${currentCrop.cropName}, what recovery routes exist?`,
      ];
    }
    if (currentWaste) {
      return [
        `What is the best recovery destination for ${currentWaste.quantity} ${currentWaste.unit} of ${currentWaste.materialType}?`,
        `How should I store this ${currentWaste.materialType} before collection?`,
        `What contamination checks are critical for this batch?`,
        `Help me prepare a collection request for this batch.`,
      ];
    }
    return [
      'What should I focus on at my current crop stage?',
      'How can I tell whether my crop may be ready for harvest?',
      'I have surplus produce. What are my options?',
      'Find a suitable recovery route for this material.',
      'Help me prepare a collection request.',
    ];
  };

  const handleAsk = async (promptText?: string) => {
    const q = promptText !== undefined ? promptText : question;
    if (!q.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await askGatherAssistant({
        question: q.trim(),
        context: {
          activeTab,
          cropRecord: currentCrop ? {
            cropName: currentCrop.cropName,
            variety: currentCrop.variety,
            location: currentCrop.location,
            plantingDate: currentCrop.plantingDate,
            currentStage: currentCrop.currentStage,
            hasSurplusFlagged: currentCrop.hasSurplusFlagged,
          } : undefined,
          wasteRecord: currentWaste ? {
            materialType: currentWaste.materialType,
            quantity: currentWaste.quantity,
            unit: currentWaste.unit,
            condition: currentWaste.condition,
            status: currentWaste.status,
            pickupLocation: currentWaste.pickupLocation,
          } : undefined,
          partner: currentPartner ? {
            name: currentPartner.name,
            processingType: currentPartner.processingType,
            location: currentPartner.location,
          } : undefined,
          appStateSummary: {
            cropCount: totalCropsCount,
            wasteCount: totalWasteCount,
            pendingRequestsCount,
            activeHarvestCrops,
            flaggedSurplusCrops,
          },
        },
      });

      setResponse(res);
      setQuestion('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to query the Gather AI Brain.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-[#1D2922]/50 backdrop-blur-xs flex items-end sm:items-end justify-center sm:justify-end p-0 sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-white rounded-t-3xl sm:rounded-3xl max-w-full sm:max-w-xl md:max-w-2xl w-full border border-[#E2E8DF] shadow-2xl overflow-hidden flex flex-col h-[90vh] sm:h-[84vh] max-h-[92vh] animate-in slide-in-from-bottom-4 sm:slide-in-from-right-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8DF] bg-gradient-to-r from-[#183E2E] to-[#245C43] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 text-[#D7E8A3] flex items-center justify-center font-bold border border-white/20">
              <Sparkles className="w-5 h-5 text-[#D7E8A3]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-bold text-lg text-white">Ask Gather AI</h3>
                <span className="text-[10px] font-semibold bg-[#85B96F]/30 text-[#D7E8A3] border border-[#85B96F]/40 px-2 py-0.5 rounded-full">
                  Groq Brain
                </span>
              </div>
              <p className="text-xs text-[#F8F8F2]/80 mt-0.5">
                Shared intelligence connecting crop decisions with organic-waste recovery.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Active Context Banner */}
          <div className="bg-[#F8F8F2] border border-[#E2E8DF] rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-[#183E2E] font-medium min-w-0">
              <div className="w-2 h-2 rounded-full bg-[#2F8059] shrink-0" />
              <span className="text-[#68766D] shrink-0">Context:</span>
              <span className="font-semibold truncate">
                {currentCrop
                  ? `Crop: ${currentCrop.cropName} (${currentCrop.location}) • ${currentCrop.currentStage}`
                  : currentWaste
                  ? `Waste: ${currentWaste.materialType} (${currentWaste.quantity} ${currentWaste.unit})`
                  : `Platform Overview • ${totalCropsCount} Crops • ${totalWasteCount} Waste Batches`}
              </span>
            </div>
            <span className="text-[10px] text-[#68766D] shrink-0 bg-white px-2 py-0.5 rounded-md border border-[#E2E8DF]">
              Auto-grounded
            </span>
          </div>

          {/* Suggested Prompts */}
          {showFollowUpSuggestions && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#68766D] block">
                Suggested Questions:
              </span>
              <div className="flex flex-wrap gap-2">
                {getContextualPrompts().map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAsk(p)}
                    disabled={isLoading}
                    className="text-left text-xs bg-white hover:bg-[#EAF1E7] text-[#183E2E] border border-[#E2E8DF] hover:border-[#85B96F] px-3 py-1.5 rounded-xl transition-all shadow-2xs hover:shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* User Input Box */}
          <div className="space-y-2">
            <div className="relative">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAsk();
                  }
                }}
                rows={3}
                placeholder="Ask about crop stages, harvest timing, surplus options, or recovery partner logistics..."
                className="w-full p-3.5 text-xs sm:text-sm bg-white border border-[#E2E8DF] focus:border-[#245C43] rounded-2xl focus:outline-none resize-none pr-12 text-[#1D2922]"
              />
              <button
                onClick={() => handleAsk()}
                disabled={isLoading || !question.trim()}
                className="absolute right-3 bottom-3.5 p-2 bg-[#245C43] hover:bg-[#183E2E] text-white rounded-xl disabled:opacity-40 transition-colors"
                title="Send to Gather AI"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
            <span className="text-[10px] text-[#68766D] block">
              Press Enter to send. Powered by GroqCloud with real application data verification.
            </span>
          </div>

          {/* Loading Indicator */}
          {isLoading && (
            <div className="p-6 bg-[#EAF1E7]/50 border border-[#85B96F]/40 rounded-2xl flex flex-col items-center justify-center gap-3 text-center animate-pulse">
              <Loader2 className="w-6 h-6 text-[#245C43] animate-spin" />
              <p className="text-xs text-[#183E2E] font-semibold">
                Gather AI Brain is resolving agronomic rules and circular partner parameters...
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-[#FEF2F2] border border-[#FCA5A5] rounded-2xl flex items-start justify-between gap-3 text-xs text-[#991B1B]">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#DC2626]" />
                <div className="flex-1">
                  <span className="font-semibold block mb-0.5">AI Service Notice</span>
                  <p>{error}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleAsk()}
                disabled={isLoading}
                className="shrink-0 text-xs font-semibold px-3 py-1.5 bg-white border border-[#FCA5A5] rounded-lg text-[#991B1B] hover:bg-[#FEE2E2] cursor-pointer transition-colors shadow-2xs"
              >
                Retry
              </button>
            </div>
          )}

          {/* Response Display */}
          {response && !isLoading && (
            <div className="bg-[#F8F8F2] border border-[#85B96F]/60 rounded-2xl p-5 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-[#E2E8DF] pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#245C43]" />
                  <h4 className="font-heading font-bold text-sm text-[#183E2E]">
                    Gather AI Brain Recommendation
                  </h4>
                </div>
                <span className="text-[10px] text-[#68766D] bg-white px-2 py-0.5 rounded border border-[#E2E8DF]">
                  Model: {response.model_used}
                </span>
              </div>

              {/* Main Answer */}
              <div className="text-xs sm:text-sm text-[#1D2922] leading-relaxed whitespace-pre-line space-y-2 font-normal">
                {response.answer}
              </div>

              {/* Key Points */}
              {response.key_points && response.key_points.length > 0 && (
                <div className="bg-white p-3.5 rounded-xl border border-[#E2E8DF] space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#183E2E] block">
                    Key Takeaways:
                  </span>
                  <ul className="space-y-1.5 text-xs text-[#1D2922]">
                    {response.key_points.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#2F8059] shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggested Actions (Interactive) */}
              {response.suggested_actions && response.suggested_actions.length > 0 && (
                <div className="bg-[#EAF1E7] p-3.5 rounded-xl border border-[#85B96F]/40 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#183E2E] block">
                    Recommended Next Actions:
                  </span>
                  <div className="space-y-1.5">
                    {response.suggested_actions.map((act, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-[#183E2E] font-medium">
                        <CornerDownRight className="w-3.5 h-3.5 text-[#245C43] shrink-0 mt-0.5" />
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Information / Cautions */}
              {(response.missing_information?.length > 0 || response.cautions?.length > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {response.missing_information && response.missing_information.length > 0 && (
                    <div className="p-3 bg-white rounded-xl border border-[#E2E8DF] space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#68766D] flex items-center gap-1">
                        <Info className="w-3 h-3 text-[#68766D]" />
                        <span>Missing Information to Clarify:</span>
                      </span>
                      <ul className="text-[11px] text-[#68766D] list-disc list-inside space-y-0.5">
                        {response.missing_information.map((m, i) => (
                          <li key={i}>{m}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {response.cautions && response.cautions.length > 0 && (
                    <div className="p-3 bg-white rounded-xl border border-[#E2E8DF] space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#D99A36] flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-[#D99A36]" />
                        <span>Cautions & Risks:</span>
                      </span>
                      <ul className="text-[11px] text-[#68766D] list-disc list-inside space-y-0.5">
                        {response.cautions.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Advisory Disclaimer */}
              <div className="text-[10px] text-[#68766D] bg-white p-2.5 rounded-lg border border-[#E2E8DF] flex items-start gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#245C43] shrink-0 mt-0.5" />
                <span>
                  Gather AI provides general agricultural and circular recovery guidance. Field decisions should be cross-verified with local KVK agricultural extension services or facility coordinators.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#E2E8DF] bg-[#FAFAF7] flex items-center justify-between text-xs text-[#68766D] shrink-0">
          <span className="font-medium">Gather AI Brain • Live Groq Engine</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white hover:bg-[#EAF1E7] border border-[#E2E8DF] rounded-xl text-[#183E2E] font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
