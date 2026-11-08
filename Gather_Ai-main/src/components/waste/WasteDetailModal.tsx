import React from 'react';
import { 
  X, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  MapPin, 
  Calendar, 
  FileText,
  Clock,
  ShieldCheck,
  ChevronRight,
  Info
} from 'lucide-react';
import { WasteRecord } from '../../types';
import { Badge } from '../common/Badge';
import { formatQuantityKg, convertToKg } from '../../utils/matchingEngine';

interface WasteDetailModalProps {
  wasteRecord: WasteRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenMatches: (record: WasteRecord) => void;
  onOpenRequest: (record: WasteRecord) => void;
}

export const WasteDetailModal: React.FC<WasteDetailModalProps> = ({
  wasteRecord,
  isOpen,
  onClose,
  onOpenMatches,
  onOpenRequest,
}) => {
  if (!isOpen || !wasteRecord) return null;

  const assessment = wasteRecord.assessment;
  const qtyKg = convertToKg(wasteRecord.quantity, wasteRecord.unit);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1D2922]/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-[#E2E8DF] shadow-xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8DF] bg-[#FAFAF7] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EAF1E7] text-[#245C43] flex items-center justify-center font-bold border border-[#85B96F]/30">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-bold text-lg text-[#183E2E]">
                  {wasteRecord.materialType}
                </h3>
                <Badge status={wasteRecord.status} />
              </div>
              <p className="text-xs text-[#68766D] mt-0.5">
                Category: {wasteRecord.materialCategory} • {formatQuantityKg(qtyKg)}
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
          {/* Batch Metadata Card */}
          <div className="bg-[#FAFAF7] border border-[#E2E8DF] rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-[#68766D] block">Registered Quantity</span>
              <strong className="text-[#183E2E] font-bold text-sm">
                {wasteRecord.quantity} {wasteRecord.unit} ({formatQuantityKg(qtyKg)})
              </strong>
            </div>

            <div>
              <span className="text-[#68766D] block">Physical Condition</span>
              <strong className="text-[#183E2E]">{wasteRecord.condition}</strong>
            </div>

            <div>
              <span className="text-[#68766D] block">Segregation Level</span>
              <strong className="text-[#2F8059]">{wasteRecord.contaminationStatus}</strong>
            </div>

            <div className="col-span-2">
              <span className="text-[#68766D] block">Pickup Location</span>
              <strong className="text-[#183E2E]">{wasteRecord.pickupLocation}</strong>
            </div>

            <div>
              <span className="text-[#68766D] block">Availability Window</span>
              <strong className="text-[#183E2E]">{wasteRecord.preferredPickupWindow}</strong>
            </div>
          </div>

          {/* Storage Details */}
          {wasteRecord.storageDetails && (
            <div className="bg-white border border-[#E2E8DF] rounded-xl p-3 text-xs">
              <span className="text-[#68766D] font-semibold block mb-0.5">Storage Arrangement:</span>
              <p className="text-[#1D2922]">{wasteRecord.storageDetails}</p>
            </div>
          )}

          {/* Structured Assessment (PRD 6.4) */}
          {assessment && (
            <div className="bg-white border border-[#85B96F]/50 rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-heading font-bold text-sm text-[#183E2E] flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#245C43]" />
                  <span>Structured Biological Waste Assessment</span>
                </h4>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  assessment.urgencyLevel === 'Immediate Action Needed'
                    ? 'bg-[#FEE2E2] text-[#B94C3D] border-[#FCA5A5]'
                    : 'bg-[#EAF1E7] text-[#245C43] border-[#85B96F]/40'
                }`}>
                  {assessment.urgencyLevel}
                </span>
              </div>

              {/* Suitable Categories */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#245C43] block mb-1.5">
                  Compatible Resource Processing Pathways:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {assessment.suitableRecoveryCategories.map((cat, i) => (
                    <span
                      key={i}
                      className="bg-[#EAF1E7] border border-[#85B96F]/40 text-[#183E2E] px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2F8059]" />
                      <span>{cat}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Incompatible routes with reasons */}
              {assessment.incompatibleRoutes.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#D99A36] block mb-1.5">
                    Biological Incompatibilities & Exclusions:
                  </span>
                  <div className="space-y-1.5">
                    {assessment.incompatibleRoutes.map((inc, i) => (
                      <div key={i} className="text-xs bg-[#FEF9C3]/40 border border-[#FEF08A] rounded-xl p-2.5">
                        <strong className="text-[#854D0E] block">{inc.category}:</strong>
                        <span className="text-[#92400E] leading-relaxed">{inc.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Next Action */}
              <div className="bg-[#FAFAF7] rounded-xl p-3 border border-[#E2E8DF] text-xs">
                <strong className="text-[#183E2E] block mb-0.5">Recommended Coordinator Action:</strong>
                <p className="text-[#68766D]">{assessment.recommendedNextAction}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E2E8DF] bg-[#FAFAF7] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-[#68766D] hover:bg-white rounded-xl"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenRequest(wasteRecord);
              }}
              className="px-4 py-2 bg-white border border-[#E2E8DF] hover:bg-[#EAF1E7] text-[#183E2E] text-xs font-semibold rounded-xl transition-colors"
            >
              Prepare Request Draft
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenMatches(wasteRecord);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#245C43] hover:bg-[#183E2E] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-xs"
            >
              <Building2 className="w-4 h-4" />
              <span>Check Partner Matches</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
