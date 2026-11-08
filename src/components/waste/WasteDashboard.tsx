import React, { useState } from 'react';
import { 
  RefreshCw, 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  Building2, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  Sprout,
  Clock,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { WasteRecord, WasteStatus } from '../../types';
import { Badge } from '../common/Badge';
import { EmptyState } from '../common/EmptyState';
import { formatQuantityKg, convertToKg } from '../../utils/matchingEngine';

interface WasteDashboardProps {
  wasteRecords: WasteRecord[];
  onOpenRegisterWaste: () => void;
  onOpenSurplusAdvisor?: () => void;
  onOpenMatches: (record: WasteRecord) => void;
  onOpenRequest: (record: WasteRecord) => void;
  onSelectWaste: (record: WasteRecord) => void;
}

export const WasteDashboard: React.FC<WasteDashboardProps> = ({
  wasteRecords,
  onOpenRegisterWaste,
  onOpenSurplusAdvisor,
  onOpenMatches,
  onOpenRequest,
  onSelectWaste,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredRecords = wasteRecords.filter((record) => {
    const matchesSearch =
      record.materialType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.materialCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.pickupLocation.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white border border-[#E2E8DF] rounded-3xl p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#E2E8DF]">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#EAF1E7] text-[#245C43] text-xs font-semibold mb-2">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Module 02 • Circular Resource Recovery</span>
            </div>
            <h2 className="text-2xl font-heading font-extrabold text-[#183E2E]">
              Give organic waste a useful next destination.
            </h2>
            <p className="text-sm text-[#68766D] mt-1 max-w-2xl">
              Register surplus produce or agricultural biomass, assess biological compatibility, match with regional composting & biogas facilities, and track collections.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {onOpenSurplusAdvisor && (
              <button
                onClick={onOpenSurplusAdvisor}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-[#EAF1E7] hover:bg-[#D7E8A3] text-[#183E2E] border border-[#85B96F]/40 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-2xs"
              >
                <Sparkles className="w-4 h-4 text-[#245C43]" />
                <span>AI Surplus Advisor</span>
              </button>
            )}
            <button
              onClick={onOpenRegisterWaste}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#245C43] hover:bg-[#183E2E] text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Register Organic Waste</span>
            </button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-5">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#68766D] absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by material, category, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#F8F8F2] border border-[#E2E8DF] focus:border-[#245C43] rounded-xl text-xs sm:text-sm text-[#1D2922]"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <Filter className="w-4 h-4 text-[#68766D] shrink-0" />
            <span className="text-xs text-[#68766D] font-medium shrink-0">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-[#F8F8F2] border border-[#E2E8DF] rounded-xl text-xs font-medium text-[#183E2E]"
            >
              <option value="all">All Batches ({wasteRecords.length})</option>
              <option value="Matching Available">Matching Available</option>
              <option value="Request Prepared">Request Prepared</option>
              <option value="Request Sent">Request Sent</option>
              <option value="Accepted">Accepted</option>
              <option value="Collection Confirmed">Collection Confirmed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Waste Records Grid */}
      {wasteRecords.length === 0 ? (
        <EmptyState
          icon={RefreshCw}
          title="No Organic Material Registered Yet"
          description="Register surplus produce, market culls, or crop residues to find certified recovery partners in your region."
          actionLabel="+ Register First Waste Batch"
          onAction={onOpenRegisterWaste}
        />
      ) : filteredRecords.length === 0 ? (
        <div className="bg-white border border-[#E2E8DF] rounded-2xl p-8 text-center text-sm text-[#68766D]">
          No organic material batches matched your search or status filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRecords.map((record) => {
            const qtyKg = convertToKg(record.quantity, record.unit);
            return (
              <div
                key={record.id}
                className="bg-white border border-[#E2E8DF] hover:border-[#85B96F]/70 rounded-2xl p-5 transition-all shadow-2xs hover:shadow-xs flex flex-col justify-between group"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div>
                      <span className="text-[11px] font-semibold text-[#245C43] uppercase tracking-wider block">
                        {record.materialCategory}
                      </span>
                      <h4 className="font-heading font-bold text-base text-[#183E2E] leading-snug mt-0.5">
                        {record.materialType}
                      </h4>
                    </div>
                    <Badge status={record.status} size="sm" />
                  </div>

                  {/* Quantity & Location */}
                  <div className="bg-[#FAFAF7] rounded-xl p-3 border border-[#E2E8DF] mb-3 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between font-semibold text-[#183E2E]">
                      <span>Volume:</span>
                      <span className="text-sm font-heading font-extrabold text-[#245C43]">
                        {record.quantity} {record.unit} ({formatQuantityKg(qtyKg)})
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[#68766D] text-[11px]">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-[#68766D]" />
                      <span className="truncate">{record.pickupLocation}</span>
                    </div>
                  </div>

                  {/* Transferred from harvest badge if applicable */}
                  {record.originCropName && (
                    <div className="bg-[#EAF1E7] border border-[#85B96F]/40 rounded-xl px-2.5 py-1.5 mb-3 flex items-center gap-1.5 text-[11px] text-[#183E2E] font-medium">
                      <Sprout className="w-3.5 h-3.5 text-[#245C43] shrink-0" />
                      <span className="truncate">Origin: {record.originCropName}</span>
                    </div>
                  )}

                  {/* Biological Suitability Preview */}
                  {record.assessment && (
                    <div className="text-xs space-y-1.5 mb-3.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#68766D] block">
                        Recommended Recovery Pathways:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {record.assessment.suitableRecoveryCategories.slice(0, 2).map((cat, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-[#F8F8F2] text-[#183E2E] border border-[#E2E8DF] px-2 py-0.5 rounded-md font-medium"
                          >
                            ✓ {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-[#E2E8DF] space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenMatches(record)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-[#245C43] hover:bg-[#183E2E] text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Check Partner Matches</span>
                    </button>

                    <button
                      onClick={() => onOpenRequest(record)}
                      className="py-2 px-3 bg-[#F8F8F2] hover:bg-[#EAF1E7] text-[#183E2E] border border-[#E2E8DF] rounded-xl text-xs font-semibold transition-colors"
                      title="Coordinate Collection Request"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => onSelectWaste(record)}
                    className="w-full text-center text-[11px] font-semibold text-[#68766D] hover:text-[#183E2E] py-1"
                  >
                    View Batch Assessment Details →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
