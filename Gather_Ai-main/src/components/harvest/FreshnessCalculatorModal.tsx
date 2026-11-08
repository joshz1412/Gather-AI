import React, { useState } from 'react';
import { X, Clock, AlertTriangle, ShieldCheck, CheckCircle2, Info, ArrowRight } from 'lucide-react';
import { CROPS_DATABASE } from '../../data/cropsDatabase';
import { 
  assessProduceFreshness, 
  FreshnessAssessmentInput, 
  FreshnessAssessmentOutput 
} from '../../utils/harvestCalculator';
import { Badge } from '../common/Badge';

interface FreshnessCalculatorModalProps {
  initialCropName?: string;
  isOpen: boolean;
  onClose: () => void;
  onOpenRecoveryForProduce?: (cropName: string, notes: string) => void;
}

export const FreshnessCalculatorModal: React.FC<FreshnessCalculatorModalProps> = ({
  initialCropName = 'Tomato (Tamatar)',
  isOpen,
  onClose,
  onOpenRecoveryForProduce,
}) => {
  const [cropName, setCropName] = useState(initialCropName);
  const [harvestDate, setHarvestDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 3);
    return d.toISOString().split('T')[0];
  });
  const [storageCondition, setStorageCondition] = useState<FreshnessAssessmentInput['storageCondition']>(
    'Ambient Shade'
  );
  const [temperatureApproxC, setTemperatureApproxC] = useState<number>(28);
  const [observedCondition, setObservedCondition] = useState<FreshnessAssessmentInput['observedCondition']>(
    'Slightly Soft / Minor Blemishes'
  );

  if (!isOpen) return null;

  const assessment: FreshnessAssessmentOutput = assessProduceFreshness({
    cropName,
    harvestDate,
    storageCondition,
    temperatureApproxC,
    observedCondition,
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1D2922]/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-[#E2E8DF] shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8DF] flex items-center justify-between bg-[#FAFAF7]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EAF1E7] text-[#245C43] flex items-center justify-center border border-[#85B96F]/30">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-[#183E2E]">Produce Freshness Assessment</h3>
              <p className="text-xs text-[#68766D]">Estimate remaining storage lifespan and triage post-harvest batches</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#68766D] hover:text-[#183E2E] rounded-lg hover:bg-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#183E2E] mb-1.5">
                Produce / Crop Type
              </label>
              <select
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8DF] focus:border-[#245C43] rounded-xl text-sm"
              >
                {CROPS_DATABASE.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#183E2E] mb-1.5">
                Harvest Date
              </label>
              <input
                type="date"
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8DF] focus:border-[#245C43] rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#183E2E] mb-1.5">
                Storage Method
              </label>
              <select
                value={storageCondition}
                onChange={(e) => setStorageCondition(e.target.value as any)}
                className="w-full px-2.5 py-2 bg-white border border-[#E2E8DF] rounded-lg text-xs"
              >
                <option value="Ambient Shade">Ambient Shade / Mandi shed</option>
                <option value="Well-ventilated Chawl">Well-ventilated Chawl / Yard</option>
                <option value="Open Field / Direct Sunlight">Open Field / Direct Sunlight</option>
                <option value="Cold Storage (10°C–14°C)">Cold Storage (10°C–14°C)</option>
                <option value="Refrigerated Cold Room (2°C–6°C)">Refrigerated Cold Room (2°C–6°C)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#183E2E] mb-1.5">
                Approx Temperature (°C)
              </label>
              <input
                type="number"
                value={temperatureApproxC}
                onChange={(e) => setTemperatureApproxC(Number(e.target.value))}
                className="w-full px-2.5 py-2 bg-white border border-[#E2E8DF] rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#183E2E] mb-1.5">
                Observed Visual Condition
              </label>
              <select
                value={observedCondition}
                onChange={(e) => setObservedCondition(e.target.value as any)}
                className="w-full px-2.5 py-2 bg-white border border-[#E2E8DF] rounded-lg text-xs"
              >
                <option value="Firm & Fresh">Firm & Fresh</option>
                <option value="Slightly Soft / Minor Blemishes">Slightly Soft / Minor Blemishes</option>
                <option value="Significant Softening / Wrinkled">Significant Softening / Wrinkled</option>
                <option value="Softening & Mildew / Mould presence">Softening & Mildew / Mould</option>
              </select>
            </div>
          </div>

          {/* Assessment Output Card */}
          <div className="bg-[#FAFAF7] border border-[#85B96F]/50 rounded-2xl p-5 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#68766D]">
                Freshness Evaluation
              </span>
              <Badge status={assessment.status} size="md" />
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#E2E8DF] flex items-center justify-between">
              <div>
                <span className="text-xs text-[#68766D] block">Estimated Stability Window:</span>
                <span className="text-2xl font-heading font-extrabold text-[#183E2E]">
                  ~{assessment.estimatedRemainingDays} {assessment.estimatedRemainingDays === 1 ? 'day' : 'days'}
                </span>
                <span className="text-xs text-[#68766D] ml-2">remaining before quality drop</span>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                assessment.urgencyLevel === 'High' || assessment.urgencyLevel === 'Immediate'
                  ? 'bg-[#FEE2E2] text-[#B94C3D] border-[#FCA5A5]'
                  : 'bg-[#EAF1E7] text-[#245C43] border-[#85B96F]/40'
              }`}>
                {assessment.urgencyLevel} Urgency
              </span>
            </div>

            <div className="text-xs text-[#1D2922] space-y-1.5">
              <strong className="block text-[#183E2E]">Handling Actions:</strong>
              <ul className="space-y-1">
                {assessment.recommendations.map((r, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-[#68766D]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#245C43] shrink-0 mt-0.5" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#EAF1E7] p-3 rounded-xl border border-[#85B96F]/30 text-xs text-[#183E2E]">
              <strong className="block mb-0.5">Assessment Reasoning:</strong>
              <p className="text-[#68766D] leading-relaxed">{assessment.reasoning}</p>
            </div>

            <div className="text-[11px] text-[#68766D] flex items-start gap-1.5 bg-white p-2.5 rounded-lg border border-[#E2E8DF]">
              <Info className="w-3.5 h-3.5 text-[#68766D] shrink-0 mt-0.5" />
              <span>{assessment.caveat}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E2E8DF] bg-[#FAFAF7] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-[#68766D] hover:bg-white rounded-xl"
          >
            Close
          </button>

          {onOpenRecoveryForProduce && (
            <button
              onClick={() => {
                onClose();
                onOpenRecoveryForProduce(cropName, `Evaluated freshness: ${assessment.status}. Condition: ${observedCondition}.`);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#245C43] hover:bg-[#183E2E] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-xs"
            >
              <span>Channel to Recovery</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
