import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  MapPin, 
  Phone, 
  Mail, 
  ChevronRight, 
  Sparkles,
  Info,
  ShieldCheck,
  Truck,
  Loader2,
  ChevronDown,
  Bot
} from 'lucide-react';
import { WasteRecord, RecoveryPartner, MatchScoreResult } from '../../types';
import { RECOVERY_PARTNERS_DATABASE } from '../../data/partnersDatabase';
import { matchRecoveryPartners, formatQuantityKg, convertToKg } from '../../utils/matchingEngine';
import { fetchRecoveryExplanation, RecoveryExplanationResult } from '../../services/aiService';

interface PartnerMatchesModalProps {
  wasteRecord: WasteRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectPartnerForRequest: (partner: RecoveryPartner, wasteRecord: WasteRecord) => void;
}

export const PartnerMatchesModal: React.FC<PartnerMatchesModalProps> = ({
  wasteRecord,
  isOpen,
  onClose,
  onSelectPartnerForRequest,
}) => {
  const [filterType, setFilterType] = useState<string>('all');

  // AI Explanation State (GroqCloud openai/gpt-oss-20b)
  const [expandedAiPartnerId, setExpandedAiPartnerId] = useState<string | null>(null);
  const [aiExplanations, setAiExplanations] = useState<Record<string, RecoveryExplanationResult>>({});
  const [loadingAiPartnerId, setLoadingAiPartnerId] = useState<string | null>(null);
  const [aiErrors, setAiErrors] = useState<Record<string, string>>({});

  const handleToggleAiExplanation = async (match: MatchScoreResult) => {
    if (!wasteRecord) return;
    const partnerId = match.partner.id;
    if (expandedAiPartnerId === partnerId) {
      setExpandedAiPartnerId(null);
      return;
    }

    setExpandedAiPartnerId(partnerId);

    // If already fetched, don't re-fetch
    if (aiExplanations[partnerId]) {
      return;
    }

    setLoadingAiPartnerId(partnerId);
    setAiErrors((prev) => ({ ...prev, [partnerId]: '' }));

    try {
      const explanation = await fetchRecoveryExplanation({
        wasteRecord: {
          materialType: wasteRecord.materialType,
          materialCategory: wasteRecord.materialCategory,
          quantity: wasteRecord.quantity,
          unit: wasteRecord.unit,
          condition: wasteRecord.condition,
          contaminationStatus: wasteRecord.contaminationStatus,
          pickupLocation: wasteRecord.pickupLocation,
          storageDetails: wasteRecord.storageDetails,
        },
        partnerMatch: {
          partnerName: match.partner.name,
          processingType: match.partner.processingType,
          isCompatible: match.isCompatible,
          score: match.score,
          matchReasons: match.matchReasons,
          limitations: match.limitations,
          minimumQuantityKg: match.partner.minimumQuantityKg,
          maximumQuantityKg: match.partner.maximumQuantityKg,
          serviceArea: match.partner.serviceArea,
          facilityLocation: match.partner.location,
        },
      });

      setAiExplanations((prev) => ({ ...prev, [partnerId]: explanation }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to load AI explanation.';
      setAiErrors((prev) => ({ ...prev, [partnerId]: msg }));
    } finally {
      setLoadingAiPartnerId(null);
    }
  };

  if (!isOpen || !wasteRecord) return null;

  const matchData = matchRecoveryPartners(wasteRecord, RECOVERY_PARTNERS_DATABASE);
  const qtyKg = convertToKg(wasteRecord.quantity, wasteRecord.unit);

  const displayedMatches = matchData.matches.filter((m) => {
    if (filterType === 'compatible-only') return m.isCompatible;
    if (filterType === 'all') return true;
    return m.partner.processingType === filterType;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1D2922]/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-[#E2E8DF] shadow-xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8DF] bg-[#FAFAF7] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EAF1E7] text-[#245C43] flex items-center justify-center font-bold border border-[#85B96F]/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-bold text-lg text-[#183E2E]">
                  Compatible Recovery Partners
                </h3>
                <span className="text-[11px] font-semibold bg-[#245C43] text-white px-2 py-0.5 rounded-full">
                  {matchData.matches.filter((m) => m.isCompatible).length} Compatible
                </span>
              </div>
              <p className="text-xs text-[#68766D] mt-0.5">
                Batch: {wasteRecord.materialType} • {formatQuantityKg(qtyKg)} • {wasteRecord.pickupLocation}
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
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Transparent Matching Rules Alert */}
          <div className="p-4 rounded-2xl bg-[#EAF1E7] border border-[#85B96F]/40 text-xs text-[#183E2E] flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#245C43] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Deterministic Ranking Engine:</strong> Compatibility is verified against physical intake streams, minimum threshold vs volume ({formatQuantityKg(qtyKg)}), and verified regional transport perimeter.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-xl border transition-colors whitespace-nowrap font-medium ${
                filterType === 'all'
                  ? 'bg-[#245C43] text-white border-[#245C43]'
                  : 'bg-[#F8F8F2] text-[#68766D] border-[#E2E8DF] hover:bg-[#EAF1E7]'
              }`}
            >
              All Facilities ({matchData.matches.length})
            </button>
            <button
              onClick={() => setFilterType('compatible-only')}
              className={`px-3 py-1.5 rounded-xl border transition-colors whitespace-nowrap font-medium ${
                filterType === 'compatible-only'
                  ? 'bg-[#245C43] text-white border-[#245C43]'
                  : 'bg-[#F8F8F2] text-[#68766D] border-[#E2E8DF] hover:bg-[#EAF1E7]'
              }`}
            >
              Strict Matches ({matchData.matches.filter((m) => m.isCompatible).length})
            </button>
          </div>

          {/* No match state handling if no matches exist */}
          {!matchData.hasMatches ? (
            <div className="bg-[#FEF9C3]/50 border border-[#FEF08A] rounded-2xl p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#FEF08A] text-[#854D0E] flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 className="font-heading font-bold text-base text-[#854D0E]">
                No Direct Partner Matches for this Specific Batch
              </h4>
              <p className="text-xs text-[#92400E] max-w-lg mx-auto leading-relaxed">
                None of the simulated regional facilities currently satisfy the strict combination of accepted material, minimum volume threshold, and service radius.
              </p>
              <div className="bg-white p-4 rounded-xl border border-[#FCD34D] text-left text-xs max-w-md mx-auto space-y-1.5">
                <strong className="block text-[#854D0E]">What must be changed to find a match:</strong>
                <ul className="space-y-1 text-[#92400E]">
                  {matchData.noMatchReasons.map((r, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span>•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            /* Ranked Match List */
            <div className="space-y-4">
              {displayedMatches.map(({ partner, isCompatible, score, matchReasons, limitations }) => (
                <div
                  key={partner.id}
                  className={`rounded-2xl border p-5 transition-all shadow-2xs ${
                    isCompatible
                      ? 'bg-white border-[#85B96F]/60 hover:border-[#245C43]'
                      : 'bg-[#FAFAF7] border-[#E2E8DF] opacity-80'
                  }`}
                >
                  {/* Partner Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-heading font-bold text-base text-[#183E2E]">
                          {partner.name}
                        </h4>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F8F8F2] text-[#68766D] border border-[#E2E8DF]">
                          {partner.verificationStatus}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#68766D] mt-1">
                        <span className="font-medium text-[#245C43]">{partner.processingType}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#68766D]" />
                          {partner.location}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:self-start">
                      <div className="text-right">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                          isCompatible
                            ? 'bg-[#EAF1E7] text-[#245C43] border-[#85B96F]/40'
                            : 'bg-[#F8F8F2] text-[#68766D] border-[#E2E8DF]'
                        }`}>
                          {score}% Compatibility
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-[#68766D] leading-relaxed mb-3">
                    {partner.description}
                  </p>

                  {/* Reasons & Constraints */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#FAFAF7] p-3 rounded-xl border border-[#E2E8DF] text-xs mb-4">
                    {/* Match Reasons */}
                    <div className="space-y-1">
                      <span className="font-bold text-[11px] uppercase tracking-wider text-[#245C43] block">
                        Match Reasons:
                      </span>
                      {matchReasons.map((r, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-[#183E2E]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#2F8059] shrink-0 mt-0.5" />
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>

                    {/* Operational Limitations */}
                    <div className="space-y-1">
                      <span className="font-bold text-[11px] uppercase tracking-wider text-[#D99A36] block">
                        Operational Boundaries:
                      </span>
                      {limitations.length === 0 ? (
                        <span className="text-[#68766D] text-[11px]">No restrictive barriers noted.</span>
                      ) : (
                        limitations.map((lim, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-[#68766D]">
                            <AlertTriangle className="w-3.5 h-3.5 text-[#D99A36] shrink-0 mt-0.5" />
                            <span>{lim}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Logistics & Primary Action */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs">
                    <div className="flex items-center gap-3 text-[#68766D]">
                      <span className="flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-[#245C43]" />
                        <span>{partner.collectionOptions}</span>
                      </span>
                      <span>•</span>
                      <span>Turnaround: {partner.averageTurnaroundDays}</span>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                      {/* AI Match Insights Trigger */}
                      <button
                        type="button"
                        onClick={() => handleToggleAiExplanation({ partner, isCompatible, score, matchReasons, limitations, quantityCompatible: true, materialCompatible: true, locationCompatible: true, contaminationCompatible: true })}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          expandedAiPartnerId === partner.id
                            ? 'bg-[#EAF1E7] text-[#245C43] border-[#85B96F]'
                            : 'bg-white text-[#183E2E] border-[#E2E8DF] hover:border-[#85B96F] hover:bg-[#FAFAF7]'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#245C43]" />
                        <span>{expandedAiPartnerId === partner.id ? 'Hide AI Insights' : 'AI Match Insights'}</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${expandedAiPartnerId === partner.id ? 'rotate-180' : ''}`} />
                      </button>

                      {isCompatible ? (
                        <button
                          onClick={() => {
                            onSelectPartnerForRequest(partner, wasteRecord);
                            onClose();
                          }}
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#245C43] hover:bg-[#183E2E] text-white font-bold rounded-xl text-xs transition-all shadow-xs cursor-pointer"
                        >
                          <span>Prepare Collection Request</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-xs text-[#B94C3D] font-medium">
                          Incompatible with current parameters
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Expandable AI Insights Drawer */}
                  {expandedAiPartnerId === partner.id && (
                    <div className="mt-4 pt-4 border-t border-[#E2E8DF] space-y-3 animate-fade-in">
                      {loadingAiPartnerId === partner.id && (
                        <div className="p-4 bg-[#EAF1E7]/50 border border-[#85B96F]/30 rounded-xl flex items-center gap-2.5 text-xs text-[#245C43] animate-pulse">
                          <Loader2 className="w-4 h-4 animate-spin text-[#245C43] shrink-0" />
                          <span>Synthesizing biological compatibility and intake limits via Groq (openai/gpt-oss-20b)...</span>
                        </div>
                      )}

                      {aiErrors[partner.id] && (
                        <div className="p-3 bg-[#FDF2F2] border border-[#F8B4B4] rounded-xl text-xs text-[#9B1C1C] flex items-center justify-between">
                          <span>{aiErrors[partner.id]}</span>
                          <button
                            type="button"
                            onClick={() => handleToggleAiExplanation({ partner, isCompatible, score, matchReasons, limitations, quantityCompatible: true, materialCompatible: true, locationCompatible: true, contaminationCompatible: true })}
                            className="text-xs underline font-semibold ml-2 cursor-pointer"
                          >
                            Retry
                          </button>
                        </div>
                      )}

                      {aiExplanations[partner.id] && (
                        <div className="bg-[#FAFAF7] border border-[#85B96F]/40 rounded-xl p-4 space-y-3 text-xs">
                          <div className="flex items-center justify-between border-b border-[#E2E8DF] pb-2">
                            <div className="flex items-center gap-2">
                              <Bot className="w-4 h-4 text-[#245C43]" />
                              <span className="font-heading font-bold text-[#183E2E]">
                                AI Match Interpretation
                              </span>
                              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-[#D7E8A3] text-[#183E2E]">
                                openai/gpt-oss-20b
                              </span>
                            </div>
                            <span className="text-[10px] text-[#68766D]">
                              Source of Truth: Deterministic Engine
                            </span>
                          </div>

                          <p className="text-xs text-[#183E2E] leading-relaxed">
                            {aiExplanations[partner.id].suitabilityExplanation}
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                            <div className="bg-white p-3 rounded-lg border border-[#E2E8DF] space-y-1">
                              <strong className="text-[10px] uppercase font-bold text-[#245C43] block">
                                Material Stream
                              </strong>
                              <p className="text-[11px] text-[#68766D] leading-relaxed">
                                {aiExplanations[partner.id].materialCompatibilitySummary}
                              </p>
                            </div>

                            <div className="bg-white p-3 rounded-lg border border-[#E2E8DF] space-y-1">
                              <strong className="text-[10px] uppercase font-bold text-[#245C43] block">
                                Volume Threshold
                              </strong>
                              <p className="text-[11px] text-[#68766D] leading-relaxed">
                                {aiExplanations[partner.id].quantityConstraintSummary}
                              </p>
                            </div>

                            <div className="bg-white p-3 rounded-lg border border-[#E2E8DF] space-y-1">
                              <strong className="text-[10px] uppercase font-bold text-[#245C43] block">
                                Service Area
                              </strong>
                              <p className="text-[11px] text-[#68766D] leading-relaxed">
                                {aiExplanations[partner.id].serviceAreaSummary}
                              </p>
                            </div>
                          </div>

                          {aiExplanations[partner.id].keyHandlingAdvice && (
                            <div className="bg-[#EAF1E7] p-2.5 rounded-lg text-[11px] text-[#183E2E] leading-relaxed">
                              <strong>Recommended Batch Prep:</strong> {aiExplanations[partner.id].keyHandlingAdvice}
                            </div>
                          )}

                          <div className="text-[10px] text-[#68766D] flex items-center gap-1.5 pt-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#245C43] shrink-0" />
                            <span>Deterministic rules confirm facility intake. AI strictly summarizes operational compatibility.</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E2E8DF] bg-[#FAFAF7] flex items-center justify-between text-xs text-[#68766D]">
          <span>Evaluated across {RECOVERY_PARTNERS_DATABASE.length} regional recovery facilities</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-[#E2E8DF] hover:bg-[#EAF1E7] text-[#183E2E] font-medium rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
