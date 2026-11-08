import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Copy, 
  Check, 
  ExternalLink, 
  Mail, 
  MessageSquare, 
  Clock, 
  Truck, 
  ShieldCheck, 
  AlertTriangle,
  Building2,
  FileText,
  Sparkles,
  Loader2,
  Bot,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { WasteRecord, RecoveryPartner, RecoveryRequest, WasteStatus } from '../../types';
import { generateCollectionRequestMessage, convertToKg, formatQuantityKg } from '../../utils/matchingEngine';
import { Badge } from '../common/Badge';
import { fetchRequestDraft, DraftRequestResult } from '../../services/aiService';

interface CollectionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  wasteRecord: WasteRecord | null;
  partner: RecoveryPartner | null;
  existingRequest?: RecoveryRequest | null;
  onSaveRequest: (request: RecoveryRequest, updatedWasteStatus: WasteStatus) => void;
}

export const CollectionRequestModal: React.FC<CollectionRequestModalProps> = ({
  isOpen,
  onClose,
  wasteRecord,
  partner,
  existingRequest,
  onSaveRequest,
}) => {
  if (!isOpen || !wasteRecord || !partner) return null;

  const defaultDraft = existingRequest?.requestMessage || generateCollectionRequestMessage(wasteRecord, partner);
  const [message, setMessage] = useState(defaultDraft);
  const [copied, setCopied] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<WasteStatus>(
    existingRequest?.requestStatus || 'Request Prepared'
  );
  const [weighbridgeKg, setWeighbridgeKg] = useState<number>(
    existingRequest?.confirmedQuantityKg || convertToKg(wasteRecord.quantity, wasteRecord.unit)
  );
  const [outcomeNotes, setOutcomeNotes] = useState(
    existingRequest?.outcomeNotes || 'Weighed at facility intake. Dispatched into bio-composting windrow line.'
  );

  // AI Request Drafting state (GroqCloud openai/gpt-oss-20b)
  const [isAiDrafting, setIsAiDrafting] = useState(false);
  const [aiDraftError, setAiDraftError] = useState<string | null>(null);
  const [aiDraftResult, setAiDraftResult] = useState<DraftRequestResult | null>(null);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [showAiControls, setShowAiControls] = useState(false);

  const handleGenerateAiDraft = async () => {
    if (!wasteRecord || !partner) return;
    setIsAiDrafting(true);
    setAiDraftError(null);

    try {
      const result = await fetchRequestDraft({
        wasteRecord: {
          id: wasteRecord.id,
          materialType: wasteRecord.materialType,
          materialCategory: wasteRecord.materialCategory,
          quantity: wasteRecord.quantity,
          unit: wasteRecord.unit,
          condition: wasteRecord.condition,
          contaminationStatus: wasteRecord.contaminationStatus,
          pickupLocation: wasteRecord.pickupLocation,
          preferredPickupWindow: wasteRecord.preferredPickupWindow,
          storageDetails: wasteRecord.storageDetails,
          contactName: wasteRecord.contactName,
          notes: wasteRecord.notes,
        },
        partner: {
          id: partner.id,
          name: partner.name,
          processingType: partner.processingType,
          coordinatorName: partner.contact.coordinator,
          email: partner.contact.email,
          location: partner.location,
        },
        specialInstructions: specialInstructions.trim() || undefined,
      });

      setAiDraftResult(result);
      setMessage(result.draftMessage);
      setShowAiControls(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate AI request draft.';
      setAiDraftError(msg);
    } finally {
      setIsAiDrafting(false);
    }
  };

  const handleResetToTemplate = () => {
    const tmpl = generateCollectionRequestMessage(wasteRecord, partner);
    setMessage(tmpl);
    setAiDraftResult(null);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenEmail = () => {
    const subject = encodeURIComponent(`Organic Waste Recovery Request — ${wasteRecord.materialType}`);
    const body = encodeURIComponent(message);
    window.open(`mailto:${partner.contact.email}?subject=${subject}&body=${body}`, '_blank');
  };

  const handleOpenWhatsApp = () => {
    const cleanPhone = partner.contact.phone.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(message);
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  const handleUpdateStatus = (newStatus: WasteStatus) => {
    setCurrentStatus(newStatus);

    if (newStatus === 'Collection Confirmed' || newStatus === 'Recovery Reported') {
      try {
        confetti({
          particleCount: 75,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {
        // ignore if canvas not supported
      }
    }

    const updatedRequest: RecoveryRequest = {
      id: existingRequest?.id || `req-${Date.now()}`,
      wasteRecordId: wasteRecord.id,
      partnerId: partner.id,
      partnerName: partner.name,
      materialType: wasteRecord.materialType,
      quantityKg: convertToKg(wasteRecord.quantity, wasteRecord.unit),
      pickupLocation: wasteRecord.pickupLocation,
      preferredPickupTime: wasteRecord.preferredPickupWindow,
      requestMessage: message,
      requestStatus: newStatus,
      preparedAt: existingRequest?.preparedAt || new Date().toISOString(),
      sentAt: (newStatus === 'Request Sent' || currentStatus === 'Request Sent') ? (existingRequest?.sentAt || new Date().toISOString()) : undefined,
      acceptedAt: (newStatus === 'Accepted' || newStatus === 'Collection Scheduled' || newStatus === 'Collection Confirmed') ? (existingRequest?.acceptedAt || new Date().toISOString()) : undefined,
      scheduledAt: (newStatus === 'Collection Scheduled' || newStatus === 'Collection Confirmed') ? (existingRequest?.scheduledAt || new Date().toISOString()) : undefined,
      collectedAt: (newStatus === 'Collection Confirmed' || newStatus === 'Recovery Reported') ? (existingRequest?.collectedAt || new Date().toISOString()) : undefined,
      confirmedQuantityKg: (newStatus === 'Collection Confirmed' || newStatus === 'Recovery Reported') ? Number(weighbridgeKg) : undefined,
      outcomeNotes: (newStatus === 'Collection Confirmed' || newStatus === 'Recovery Reported') ? outcomeNotes : undefined,
      createdAt: existingRequest?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveRequest(updatedRequest, newStatus);
  };

  const statusSteps: WasteStatus[] = [
    'Request Prepared',
    'Request Sent',
    'Awaiting Response',
    'Accepted',
    'Collection Scheduled',
    'Collection Confirmed',
    'Recovery Reported',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1D2922]/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-[#E2E8DF] shadow-xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8DF] bg-[#FAFAF7] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#245C43] text-white flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-bold text-lg text-[#183E2E]">
                  Collection Request Coordinator
                </h3>
                <Badge status={currentStatus} />
              </div>
              <p className="text-xs text-[#68766D] mt-0.5">
                Target Facility: <span className="font-semibold text-[#183E2E]">{partner.name}</span> ({partner.processingType})
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
          {/* PRD Honest Communication Principle */}
          <div className="p-3.5 rounded-2xl bg-[#EAF1E7] border border-[#85B96F]/40 text-xs text-[#183E2E] flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-[#245C43] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Human Control Principle (PRD 1.6 & 6.8):</strong> Review, edit, and approve this collection draft before dispatch. The platform will never record a message as sent unless you explicitly copy or send it.
            </p>
          </div>

          {/* Interactive Request Lifecycle Stepper */}
          <div className="bg-[#FAFAF7] border border-[#E2E8DF] rounded-2xl p-4 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#68766D] block">
              Coordination Lifecycle Progression:
            </span>
            <div className="flex items-center justify-between overflow-x-auto pb-1 gap-1">
              {statusSteps.map((step, idx) => {
                const isCurrent = currentStatus === step;
                const isPassed = statusSteps.indexOf(currentStatus) > idx;

                return (
                  <button
                    key={step}
                    type="button"
                    onClick={() => handleUpdateStatus(step)}
                    className={`flex-1 min-w-[100px] px-2 py-1.5 rounded-xl text-center text-[11px] font-medium transition-all border ${
                      isCurrent
                        ? 'bg-[#245C43] text-white border-[#245C43] shadow-xs font-bold'
                        : isPassed
                        ? 'bg-[#EAF1E7] text-[#183E2E] border-[#85B96F]/40'
                        : 'bg-white text-[#68766D] border-[#E2E8DF] hover:bg-[#F8F8F2]'
                    }`}
                  >
                    <div className="truncate">{step}</div>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-[#68766D]">
              Click any step above to update or advance the verified operational status of this collection.
            </p>
          </div>

          {/* Partner Intake Info Card */}
          <div className="bg-white border border-[#E2E8DF] rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-[#68766D] block">Coordinator</span>
              <strong className="text-[#183E2E]">{partner.contact.coordinator}</strong>
            </div>
            <div>
              <span className="text-[#68766D] block">Phone / WhatsApp</span>
              <strong className="text-[#183E2E]">{partner.contact.phone}</strong>
            </div>
            <div>
              <span className="text-[#68766D] block">Intake Email</span>
              <strong className="text-[#183E2E]">{partner.contact.email}</strong>
            </div>
          </div>

          {/* Editable Request Draft Area */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#183E2E]">
                  Collection Request Message (Editable Draft):
                </label>
                {aiDraftResult && (
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-[#D7E8A3] text-[#183E2E]">
                    openai/gpt-oss-20b
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* AI Draft Button */}
                <button
                  type="button"
                  onClick={handleGenerateAiDraft}
                  disabled={isAiDrafting}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#245C43] hover:bg-[#183E2E] disabled:bg-[#68766D] text-white rounded-lg transition-all shadow-2xs cursor-pointer"
                >
                  {isAiDrafting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Drafting with AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-[#D7E8A3]" />
                      <span>{aiDraftResult ? 'Regenerate AI Draft' : 'Refine with AI (Groq)'}</span>
                    </>
                  )}
                </button>

                {aiDraftResult && (
                  <button
                    type="button"
                    onClick={handleResetToTemplate}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#68766D] hover:text-[#183E2E] bg-white border border-[#E2E8DF] rounded-lg transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#EAF1E7] text-[#245C43] hover:bg-[#D7E8A3] rounded-lg transition-colors border border-[#85B96F]/40 shadow-2xs cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#2F8059]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy Draft'}</span>
                </button>
              </div>
            </div>

            {/* Optional AI Prompt Customization */}
            <div className="flex items-center justify-between text-[11px] text-[#68766D]">
              <button
                type="button"
                onClick={() => setShowAiControls(!showAiControls)}
                className="hover:text-[#245C43] underline font-medium cursor-pointer"
              >
                {showAiControls ? '− Hide custom drafting instructions' : '+ Add custom instructions for AI drafter'}
              </button>
              {aiDraftResult?.subject && (
                <span className="truncate max-w-[280px] font-medium text-[#183E2E]">
                  Subject: {aiDraftResult.subject}
                </span>
              )}
            </div>

            {showAiControls && (
              <div className="p-3 bg-[#FAFAF7] border border-[#E2E8DF] rounded-xl space-y-2 text-xs">
                <label className="font-semibold text-[#183E2E] block">
                  Custom instructions for AI draft (optional):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="e.g., Emphasize morning pickup, ask if crates will be returned immediately..."
                    className="flex-1 px-3 py-1.5 bg-white border border-[#E2E8DF] rounded-lg text-xs"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleGenerateAiDraft();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleGenerateAiDraft}
                    disabled={isAiDrafting}
                    className="px-3 py-1.5 bg-[#245C43] text-white rounded-lg font-semibold text-xs cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}

            {/* AI Error Alert */}
            {aiDraftError && (
              <div className="p-3 bg-[#FDF2F2] border border-[#F8B4B4] rounded-xl text-xs text-[#9B1C1C] flex items-center justify-between">
                <span>{aiDraftError}</span>
                <button
                  type="button"
                  onClick={handleGenerateAiDraft}
                  className="underline font-semibold ml-2 cursor-pointer"
                >
                  Retry
                </button>
              </div>
            )}

            {/* AI Key Highlights Pills */}
            {aiDraftResult && aiDraftResult.keyHighlights.length > 0 && (
              <div className="p-3 bg-[#EAF1E7]/60 border border-[#85B96F]/30 rounded-xl space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#245C43] block">
                  AI Drafted Inclusions:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {aiDraftResult.keyHighlights.map((hl, i) => (
                    <span
                      key={i}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-white border border-[#85B96F]/40 text-[#183E2E]"
                    >
                      • {hl}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <textarea
              rows={11}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-4 bg-[#FAFAF7] border border-[#E2E8DF] focus:border-[#245C43] focus:bg-white rounded-2xl text-xs font-mono leading-relaxed text-[#1D2922]"
            />
          </div>

          {/* Verified Collection Input if status is Confirmed */}
          {(currentStatus === 'Collection Confirmed' || currentStatus === 'Recovery Reported') && (
            <div className="bg-[#EAF1E7] border border-[#2F8059]/40 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#183E2E]">
                <ShieldCheck className="w-4 h-4 text-[#2F8059]" />
                <span>Verified Weighbridge Recovery Record (Scene 5 Outcome)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[#68766D] mb-1 font-semibold">
                    Confirmed Net Weighed Quantity (kg) *
                  </label>
                  <input
                    type="number"
                    value={weighbridgeKg}
                    onChange={(e) => setWeighbridgeKg(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-[#85B96F] rounded-xl text-sm font-bold text-[#183E2E]"
                  />
                  <span className="text-[11px] text-[#68766D] mt-0.5 block">
                    Displays on Impact Dashboard as verified recovered biomass.
                  </span>
                </div>

                <div>
                  <label className="block text-[#68766D] mb-1 font-semibold">
                    Outcome & Quality Notes
                  </label>
                  <input
                    type="text"
                    value={outcomeNotes}
                    onChange={(e) => setOutcomeNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E2E8DF] rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Working Send & Dispatch Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  handleOpenEmail();
                  handleUpdateStatus('Request Sent');
                }}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#F8F8F2] hover:bg-[#EAF1E7] border border-[#E2E8DF] rounded-xl text-xs font-semibold text-[#183E2E] transition-colors"
              >
                <Mail className="w-4 h-4 text-[#245C43]" />
                <span>Open in Email Client</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleOpenWhatsApp();
                  handleUpdateStatus('Request Sent');
                }}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#F8F8F2] hover:bg-[#EAF1E7] border border-[#E2E8DF] rounded-xl text-xs font-semibold text-[#183E2E] transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-[#2F8059]" />
                <span>Open in WhatsApp</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {currentStatus === 'Request Prepared' && (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('Request Sent')}
                  className="px-4 py-2 bg-[#245C43] hover:bg-[#183E2E] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Mark as Request Sent</span>
                </button>
              )}

              {currentStatus === 'Request Sent' && (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('Accepted')}
                  className="px-4 py-2 bg-[#2F8059] hover:bg-[#1e583d] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Simulate Partner Accepted</span>
                </button>
              )}

              {currentStatus === 'Accepted' && (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('Collection Scheduled')}
                  className="px-4 py-2 bg-[#0284C7] hover:bg-[#0369a1] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2"
                >
                  <Truck className="w-4 h-4" />
                  <span>Schedule Collection</span>
                </button>
              )}

              {currentStatus === 'Collection Scheduled' && (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('Collection Confirmed')}
                  className="px-4 py-2 bg-[#245C43] hover:bg-[#183E2E] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 animate-pulse"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Confirm Weighbridge Collection</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E2E8DF] bg-[#FAFAF7] flex items-center justify-between text-xs text-[#68766D]">
          <span>Request Ref: {existingRequest?.id || 'New Request'}</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white border border-[#E2E8DF] hover:bg-[#EAF1E7] text-[#183E2E] font-medium rounded-xl transition-colors"
          >
            Done / Close
          </button>
        </div>
      </div>
    </div>
  );
};
