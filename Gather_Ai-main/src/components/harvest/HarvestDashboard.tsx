import React, { useState } from 'react';
import { 
  Sprout, 
  Plus, 
  Camera, 
  Clock, 
  MapPin, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Search, 
  ChevronRight,
  Filter,
  Sparkles,
  Info
} from 'lucide-react';
import { CropRecord } from '../../types';
import { Badge } from '../common/Badge';
import { EmptyState } from '../common/EmptyState';
import { formatReadableDate } from '../../utils/harvestCalculator';

interface HarvestDashboardProps {
  crops: CropRecord[];
  onOpenAddCrop: () => void;
  onOpenPhotoAnalysis: () => void;
  onOpenFreshnessCalculator: (cropName?: string) => void;
  onSelectCrop: (crop: CropRecord) => void;
  onInitiateHandoff: (crop: CropRecord) => void;
}

export const HarvestDashboard: React.FC<HarvestDashboardProps> = ({
  crops,
  onOpenAddCrop,
  onOpenPhotoAnalysis,
  onOpenFreshnessCalculator,
  onSelectCrop,
  onInitiateHandoff,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');

  const filteredCrops = crops.filter((crop) => {
    const matchesSearch =
      crop.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (crop.variety && crop.variety.toLowerCase().includes(searchQuery.toLowerCase())) ||
      crop.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStage = stageFilter === 'all' || crop.currentStage === stageFilter;

    return matchesSearch && matchesStage;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Quick Tool Cards */}
      <div className="bg-white border border-[#E2E8DF] rounded-3xl p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#E2E8DF]">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#EAF1E7] text-[#245C43] text-xs font-semibold mb-2">
              <Sprout className="w-3.5 h-3.5" />
              <span>Module 01 • Agricultural Intelligence</span>
            </div>
            <h2 className="text-2xl font-heading font-extrabold text-[#183E2E]">
              Know what your crops need next.
            </h2>
            <p className="text-sm text-[#68766D] mt-1 max-w-2xl">
              Get grounded guidance on vegetative stages, critical field milestones, estimated harvest windows, and post-harvest produce handling.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Photo Scanner Trigger */}
            <button
              onClick={onOpenPhotoAnalysis}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-[#F8F8F2] hover:bg-[#EAF1E7] text-[#183E2E] border border-[#E2E8DF] hover:border-[#85B96F]/50 rounded-xl text-xs font-semibold transition-all shadow-2xs"
            >
              <Camera className="w-4 h-4 text-[#245C43]" />
              <span>Identify Crop Photo</span>
            </button>

            {/* Freshness Calculator Trigger */}
            <button
              onClick={() => onOpenFreshnessCalculator()}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-[#F8F8F2] hover:bg-[#EAF1E7] text-[#183E2E] border border-[#E2E8DF] hover:border-[#85B96F]/50 rounded-xl text-xs font-semibold transition-all shadow-2xs"
            >
              <Clock className="w-4 h-4 text-[#245C43]" />
              <span>Freshness & Lifespan</span>
            </button>

            {/* Add Crop Primary Button */}
            <button
              onClick={onOpenAddCrop}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#245C43] hover:bg-[#183E2E] text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add a Crop</span>
            </button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-5">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#68766D] absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search crops by name, variety, or region..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#F8F8F2] border border-[#E2E8DF] focus:border-[#245C43] rounded-xl text-xs sm:text-sm text-[#1D2922]"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <Filter className="w-4 h-4 text-[#68766D] shrink-0" />
            <span className="text-xs text-[#68766D] font-medium shrink-0">Stage:</span>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="px-3 py-1.5 bg-[#F8F8F2] border border-[#E2E8DF] rounded-xl text-xs font-medium text-[#183E2E]"
            >
              <option value="all">All Stages ({crops.length})</option>
              <option value="Harvest Window Active">Harvest Window Active</option>
              <option value="Ripening & Maturation">Ripening & Maturation</option>
              <option value="Flowering & Fruit Set">Flowering & Fruit Set</option>
              <option value="Vegetative Growth">Vegetative Growth</option>
              <option value="Germination & Seedling">Germination & Seedling</option>
              <option value="Post-Harvest / Surplus Phase">Post-Harvest / Surplus</option>
            </select>
          </div>
        </div>
      </div>

      {/* Crops List */}
      {crops.length === 0 ? (
        <EmptyState
          icon={Sprout}
          title="No Crops Registered Yet"
          description="Register your first crop or field parcel to receive stage guidance, critical observations, and estimated harvest windows."
          actionLabel="+ Register Your First Crop"
          onAction={onOpenAddCrop}
        />
      ) : filteredCrops.length === 0 ? (
        <div className="bg-white border border-[#E2E8DF] rounded-2xl p-8 text-center text-sm text-[#68766D]">
          No crops matched your search or stage filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCrops.map((crop) => {
            return (
              <div
                key={crop.id}
                className="bg-white border border-[#E2E8DF] hover:border-[#85B96F]/70 rounded-2xl p-5 transition-all shadow-2xs hover:shadow-xs flex flex-col justify-between group"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-[#EAF1E7] text-[#245C43] flex items-center justify-center font-heading font-extrabold text-base border border-[#85B96F]/30 shrink-0">
                        {crop.cropName.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-heading font-bold text-base text-[#183E2E] truncate">
                          {crop.cropName}
                        </h4>
                        <div className="text-xs text-[#68766D] flex items-center gap-1.5 truncate mt-0.5">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">{crop.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <Badge status={crop.currentStage} size="sm" />
                  </div>

                  {/* Growth Progress Indicator */}
                  <div className="bg-[#FAFAF7] rounded-xl p-3 border border-[#E2E8DF] mb-3.5 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-[#183E2E]">
                      <span>Growth Progress</span>
                      <span className="text-[#245C43]">
                        Day {crop.daysSincePlanting} of ~{crop.totalDurationDays}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#E2E8DF] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#85B96F] to-[#245C43] rounded-full transition-all"
                        style={{ width: `${Math.min(100, crop.progressPercent)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#68766D]">
                      <span>Planted: {formatReadableDate(crop.plantingDate)}</span>
                      <span>Harvest: {formatReadableDate(crop.estimatedHarvestStart)}</span>
                    </div>
                  </div>

                  {/* Recommendation snippet */}
                  <div className="text-xs text-[#1D2922] mb-3.5 space-y-1">
                    <span className="font-bold text-[#183E2E] text-[11px] uppercase tracking-wider block">
                      Recommended Action:
                    </span>
                    <p className="text-[#68766D] line-clamp-2 leading-relaxed">
                      {crop.guidance.recommendedAction}
                    </p>
                  </div>

                  {/* Surplus Flag Callout if present */}
                  {crop.hasSurplusFlagged && crop.surplusDetails && (
                    <div className="bg-[#FEF9C3]/60 border border-[#FEF08A] rounded-xl p-3 mb-3.5 space-y-2 text-xs">
                      <div className="flex items-center gap-1.5 text-[#854D0E] font-semibold">
                        <AlertTriangle className="w-3.5 h-3.5 text-[#D99A36] shrink-0" />
                        <span>
                          Surplus Batch Flagged: {crop.surplusDetails.estimatedQuantity} {crop.surplusDetails.unit}
                        </span>
                      </div>
                      <p className="text-[#92400E] text-[11px]">
                        Condition: {crop.surplusDetails.condition}.
                      </p>
                      <button
                        onClick={() => onInitiateHandoff(crop)}
                        className="w-full py-1.5 px-3 bg-[#245C43] hover:bg-[#183E2E] text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Find Recovery Option</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-[#E2E8DF] text-xs">
                  <button
                    onClick={() => onSelectCrop(crop)}
                    className="font-semibold text-[#245C43] hover:underline flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#245C43]" />
                    <span>AI Stage Advisory</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onOpenFreshnessCalculator(crop.cropName)}
                      title="Test produce freshness & shelf life"
                      className="p-1.5 text-[#68766D] hover:text-[#183E2E] hover:bg-[#F8F8F2] rounded-lg transition-colors"
                    >
                      <Clock className="w-4 h-4" />
                    </button>
                    {!crop.hasSurplusFlagged && (
                      <button
                        onClick={() => onSelectCrop(crop)}
                        title="Flag surplus harvest batch"
                        className="px-2 py-1 text-[11px] font-medium text-[#245C43] bg-[#EAF1E7] hover:bg-[#D7E8A3] rounded-lg transition-colors"
                      >
                        + Flag Surplus
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
