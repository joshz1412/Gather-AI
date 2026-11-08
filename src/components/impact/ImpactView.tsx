import React from 'react';
import { 
  BarChart3, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  Layers, 
  Truck, 
  Building2, 
  Info, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { ImpactSummary, WasteRecord, RecoveryRequest } from '../../types';
import { formatQuantityKg } from '../../utils/matchingEngine';

interface ImpactViewProps {
  impactSummary: ImpactSummary;
  wasteRecords: WasteRecord[];
  requests: RecoveryRequest[];
  onNavigateToWaste: () => void;
}

export const ImpactView: React.FC<ImpactViewProps> = ({
  impactSummary,
  wasteRecords,
  requests,
  onNavigateToWaste,
}) => {
  // Compute percentage conversion pipeline
  const reg = impactSummary.registeredQuantityKg || 1;
  const matchPct = Math.round((impactSummary.matchedQuantityKg / reg) * 100);
  const acceptedPct = Math.round((impactSummary.acceptedQuantityKg / reg) * 100);
  const collectedPct = Math.round((impactSummary.confirmedCollectedKg / reg) * 100);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white border border-[#E2E8DF] rounded-3xl p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#E2E8DF]">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#EAF1E7] text-[#245C43] text-xs font-semibold mb-2">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Honest Impact & Material Ledger</span>
            </div>
            <h2 className="text-2xl font-heading font-extrabold text-[#183E2E]">
              Verified Resource Recovery Impact
            </h2>
            <p className="text-sm text-[#68766D] mt-1 max-w-2xl">
              Strictly distinguishing registered biomass from matched options and weighbridge-verified collections.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F8F8F2] text-xs font-semibold text-[#183E2E] border border-[#E2E8DF] shrink-0">
            <ShieldCheck className="w-4 h-4 text-[#2F8059]" />
            <span>Honest AI Audit Standard (No Fabricated Offsets)</span>
          </div>
        </div>

        {/* PRD Principle Callout */}
        <div className="mt-5 p-4 rounded-2xl bg-[#EAF1E7] border border-[#85B96F]/40 text-xs text-[#183E2E] flex items-start gap-2.5">
          <Info className="w-4 h-4 text-[#245C43] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Core Product Rule (PRD 6.10):</strong> Recommendations are never counted as confirmed collections. Environmental savings are only accounted after verified facility weighbridge acceptance.
          </p>
        </div>
      </div>

      {/* Visual Pipeline Conversion Funnel */}
      <div className="bg-white border border-[#E2E8DF] rounded-3xl p-6 shadow-2xs space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-base text-[#183E2E] flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#245C43]" />
            <span>Material Progression Funnel (Verified vs Estimated)</span>
          </h3>
          <span className="text-xs text-[#68766D]">Updated in Real-Time</span>
        </div>

        {/* Funnel Stages Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Stage 1: Registered */}
          <div className="bg-[#FAFAF7] border border-[#E2E8DF] rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-[#68766D]">
              <span className="font-semibold uppercase tracking-wider text-[11px]">1. Registered</span>
              <span>100%</span>
            </div>
            <div className="text-2xl font-heading font-extrabold text-[#183E2E]">
              {formatQuantityKg(impactSummary.registeredQuantityKg)}
            </div>
            <p className="text-[11px] text-[#68766D] leading-snug">
              Total organic biomass declared by growers & vendors.
            </p>
          </div>

          {/* Stage 2: Matched */}
          <div className="bg-[#EAF1E7]/50 border border-[#85B96F]/40 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-[#245C43]">
              <span className="font-semibold uppercase tracking-wider text-[11px]">2. Matched</span>
              <span>{matchPct}%</span>
            </div>
            <div className="text-2xl font-heading font-extrabold text-[#245C43]">
              {formatQuantityKg(impactSummary.matchedQuantityKg)}
            </div>
            <p className="text-[11px] text-[#68766D] leading-snug">
              Material with identified compatible recovery facilities.
            </p>
          </div>

          {/* Stage 3: Accepted */}
          <div className="bg-[#EAF1E7] border border-[#85B96F]/60 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-[#183E2E]">
              <span className="font-semibold uppercase tracking-wider text-[11px]">3. Accepted Request</span>
              <span>{acceptedPct}%</span>
            </div>
            <div className="text-2xl font-heading font-extrabold text-[#183E2E]">
              {formatQuantityKg(impactSummary.acceptedQuantityKg)}
            </div>
            <p className="text-[11px] text-[#68766D] leading-snug">
              Recovery partner agreed to intake and collection terms.
            </p>
          </div>

          {/* Stage 4: Confirmed Recovered */}
          <div className="bg-[#245C43] text-white rounded-2xl p-4 space-y-2 shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#D7E8A3]">
              <span className="font-bold uppercase tracking-wider text-[11px]">4. Confirmed Collected</span>
              <span>{collectedPct}%</span>
            </div>
            <div className="text-2xl font-heading font-extrabold text-white">
              {formatQuantityKg(impactSummary.confirmedCollectedKg)}
            </div>
            <p className="text-[11px] text-[#F8F8F2]/90 leading-snug">
              Physical haulage confirmed & weighed at facility weighbridge.
            </p>
          </div>
        </div>
      </div>

      {/* Verified Collection Logs */}
      <div className="bg-white border border-[#E2E8DF] rounded-3xl p-6 shadow-2xs space-y-4">
        <h3 className="font-heading font-bold text-base text-[#183E2E] flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#2F8059]" />
          <span>Verified Weighbridge Audit Records</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E2E8DF] text-[#68766D] uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3">Batch Material</th>
                <th className="py-3 px-3">Recovery Facility</th>
                <th className="py-3 px-3">Weighed Volume</th>
                <th className="py-3 px-3">Outcome Status</th>
                <th className="py-3 px-3">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8DF]">
              {requests
                .filter((r) => r.requestStatus === 'Collection Confirmed' || r.requestStatus === 'Recovery Reported')
                .map((req) => (
                  <tr key={req.id} className="hover:bg-[#FAFAF7]">
                    <td className="py-3.5 px-3 font-semibold text-[#183E2E]">
                      {req.materialType}
                    </td>
                    <td className="py-3.5 px-3 text-[#68766D]">
                      {req.partnerName}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-[#2F8059]">
                      {req.confirmedQuantityKg?.toLocaleString()} kg
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="bg-[#2F8059] text-white px-2 py-0.5 rounded-full font-bold text-[10px]">
                        {req.requestStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-[#68766D] max-w-xs truncate">
                      {req.outcomeNotes || 'Weighed at facility weighbridge'}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {requests.filter((r) => r.requestStatus === 'Collection Confirmed' || r.requestStatus === 'Recovery Reported').length === 0 && (
          <div className="p-6 text-center text-xs text-[#68766D]">
            No collections have reached confirmed weighbridge status yet. Complete requests in Food Waste Recovery to record physical collection.
          </div>
        )}
      </div>
    </div>
  );
};
