import React, { useState } from 'react';
import { X, Sprout, Calendar, MapPin, AlertCircle, Info, ChevronRight } from 'lucide-react';
import { CropRecord } from '../../types';
import { CROPS_DATABASE } from '../../data/cropsDatabase';
import { evaluateCropGrowth, formatReadableDate } from '../../utils/harvestCalculator';

interface AddCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCrop: (crop: CropRecord) => void;
  defaultLocation?: string;
  defaultArea?: string;
}

export const AddCropModal: React.FC<AddCropModalProps> = ({
  isOpen,
  onClose,
  onSaveCrop,
  defaultLocation,
  defaultArea,
}) => {
  const [cropName, setCropName] = useState('Tomato (Tamatar)');
  const [variety, setVariety] = useState('');
  const [location, setLocation] = useState(defaultLocation || 'Nashik, Maharashtra');
  const [plantingDate, setPlantingDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 45); // default ~45 days ago
    return d.toISOString().split('T')[0];
  });
  const [growingMethod, setGrowingMethod] = useState<CropRecord['growingMethod']>('Open Field');
  const [soilType, setSoilType] = useState<CropRecord['soilType']>('Red Sandy Loam');
  const [irrigationMethod, setIrrigationMethod] = useState<CropRecord['irrigationMethod']>('Drip Irrigation');
  const [areaSize, setAreaSize] = useState(defaultArea || '2 Acres');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (isOpen) {
      if (defaultLocation) setLocation(defaultLocation);
      if (defaultArea) setAreaSize(defaultArea);
    }
  }, [isOpen, defaultLocation, defaultArea]);

  if (!isOpen) return null;

  const selectedRef = CROPS_DATABASE.find(
    (c) => c.name.toLowerCase() === cropName.toLowerCase() || c.id === cropName
  );

  const previewEval = evaluateCropGrowth({
    cropName,
    plantingDate,
    variety,
    location,
    growingMethod,
    soilType,
    irrigationMethod,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!cropName.trim()) newErrors.cropName = 'Crop type is required.';
    if (!location.trim()) newErrors.location = 'Growing location is required.';
    if (!plantingDate) newErrors.plantingDate = 'Planting date is required.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const newCrop: CropRecord = {
      id: `crop-${Date.now()}`,
      cropName,
      variety: variety.trim() || undefined,
      location: location.trim(),
      plantingDate,
      growingMethod,
      soilType,
      irrigationMethod,
      areaSize: areaSize.trim() || undefined,
      currentStage: previewEval.currentStage,
      estimatedHarvestStart: previewEval.estimatedHarvestStart,
      estimatedHarvestEnd: previewEval.estimatedHarvestEnd,
      daysSincePlanting: previewEval.daysSincePlanting,
      totalDurationDays: previewEval.totalDurationDays,
      progressPercent: previewEval.progressPercent,
      guidance: previewEval.guidance,
      sourceInformation: previewEval.sourceInformation,
      hasSurplusFlagged: false,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    onSaveCrop(newCrop);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1D2922]/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-[#E2E8DF] shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#E2E8DF] flex items-center justify-between bg-[#FAFAF7]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EAF1E7] text-[#245C43] flex items-center justify-center border border-[#85B96F]/30">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-[#183E2E]">Register a Crop</h3>
              <p className="text-xs text-[#68766D]">Add crop parameters for stage guidance and harvest estimation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#68766D] hover:text-[#183E2E] rounded-lg hover:bg-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Quick Pre-select pills from database */}
          <div>
            <label className="block text-xs font-semibold text-[#183E2E] uppercase tracking-wider mb-2">
              Select or Search Crop Type *
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {CROPS_DATABASE.slice(0, 6).map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => {
                    setCropName(c.name);
                    if (c.commonVarieties.length > 0) {
                      setVariety(c.commonVarieties[0]);
                    }
                  }}
                  className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                    cropName === c.name
                      ? 'bg-[#245C43] text-white border-[#245C43] font-semibold'
                      : 'bg-[#F8F8F2] text-[#183E2E] border-[#E2E8DF] hover:bg-[#EAF1E7]'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
            <select
              value={cropName}
              onChange={(e) => {
                setCropName(e.target.value);
                const found = CROPS_DATABASE.find((c) => c.name === e.target.value);
                if (found && found.commonVarieties.length > 0) {
                  setVariety(found.commonVarieties[0]);
                }
              }}
              className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8DF] focus:border-[#245C43] focus:ring-1 focus:ring-[#245C43] rounded-xl text-sm text-[#1D2922]"
            >
              {CROPS_DATABASE.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name} ({c.category} • {c.standardDurationDays.min}–{c.standardDurationDays.max} days)
                </option>
              ))}
              <option value="Other / Custom Crop">Other / Custom Crop...</option>
            </select>
            {errors.cropName && (
              <p className="text-xs text-[#B94C3D] mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.cropName}
              </p>
            )}
          </div>

          {/* Variety & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#183E2E] mb-1.5">
                Crop Variety (Optional)
              </label>
              <input
                type="text"
                placeholder={selectedRef ? selectedRef.commonVarieties.join(', ') : 'e.g. Arka Rakshak'}
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8DF] focus:border-[#245C43] rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#183E2E] mb-1.5">
                Growing Region / Location *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#68766D] absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="e.g. Nashik, Maharashtra"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-[#E2E8DF] focus:border-[#245C43] rounded-xl text-sm"
                />
              </div>
              {errors.location && (
                <p className="text-xs text-[#B94C3D] mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.location}
                </p>
              )}
            </div>
          </div>

          {/* Planting Date & Area */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#183E2E] mb-1.5">
                Planting Date *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-[#68766D] absolute left-3 top-3" />
                <input
                  type="date"
                  value={plantingDate}
                  onChange={(e) => setPlantingDate(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-[#E2E8DF] focus:border-[#245C43] rounded-xl text-sm"
                />
              </div>
              {errors.plantingDate && (
                <p className="text-xs text-[#B94C3D] mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.plantingDate}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#183E2E] mb-1.5">
                Cultivated Area (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 2.5 Acres / 1 Hectare"
                value={areaSize}
                onChange={(e) => setAreaSize(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8DF] focus:border-[#245C43] rounded-xl text-sm"
              />
            </div>
          </div>

          {/* Growing Conditions (Optional) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#68766D] mb-1">
                Growing Method
              </label>
              <select
                value={growingMethod}
                onChange={(e) => setGrowingMethod(e.target.value as any)}
                className="w-full px-2.5 py-2 bg-white border border-[#E2E8DF] rounded-lg text-xs"
              >
                <option value="Open Field">Open Field</option>
                <option value="Greenhouse / Polyhouse">Greenhouse / Polyhouse</option>
                <option value="Organic / Natural">Organic / Natural Farming</option>
                <option value="Hydroponic">Hydroponic</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#68766D] mb-1">
                Soil Type
              </label>
              <select
                value={soilType}
                onChange={(e) => setSoilType(e.target.value as any)}
                className="w-full px-2.5 py-2 bg-white border border-[#E2E8DF] rounded-lg text-xs"
              >
                <option value="Red Sandy Loam">Red Sandy Loam</option>
                <option value="Black Soil">Black Cotton Soil</option>
                <option value="Alluvial">Alluvial Loam</option>
                <option value="Clayey Loam">Clayey Loam</option>
                <option value="Sandy Loam">Sandy Loam</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#68766D] mb-1">
                Irrigation Method
              </label>
              <select
                value={irrigationMethod}
                onChange={(e) => setIrrigationMethod(e.target.value as any)}
                className="w-full px-2.5 py-2 bg-white border border-[#E2E8DF] rounded-lg text-xs"
              >
                <option value="Drip Irrigation">Drip Irrigation</option>
                <option value="Flood / Furrow">Flood / Furrow</option>
                <option value="Sprinkler">Sprinkler</option>
                <option value="Rainfed">Rainfed</option>
              </select>
            </div>
          </div>

          {/* Real-time Calculation Preview Card */}
          <div className="bg-[#EAF1E7] border border-[#85B96F]/40 rounded-2xl p-4 space-y-2.5 text-xs text-[#183E2E]">
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-1.5">
                <Info className="w-4 h-4 text-[#245C43]" />
                <span>Computed Agronomic Guidance Preview</span>
              </span>
              <span className="text-[11px] bg-white text-[#245C43] px-2 py-0.5 rounded-full border border-[#85B96F]/30">
                Day {previewEval.daysSincePlanting} of ~{previewEval.totalDurationDays}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-white/70 p-2.5 rounded-xl border border-white">
              <div>
                <span className="text-[#68766D] block text-[11px]">Current Estimated Stage:</span>
                <strong className="text-[#183E2E] font-semibold">{previewEval.currentStage}</strong>
              </div>
              <div>
                <span className="text-[#68766D] block text-[11px]">Estimated Harvest Window:</span>
                <strong className="text-[#245C43] font-semibold">
                  {formatReadableDate(previewEval.estimatedHarvestStart)} – {formatReadableDate(previewEval.estimatedHarvestEnd)}
                </strong>
              </div>
            </div>

            <p className="text-[#68766D] text-[11px] leading-relaxed">
              <strong>Recommended Action:</strong> {previewEval.guidance.recommendedAction}
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-[#183E2E] mb-1.5">
              Additional Field Observations (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Sown in raised beds with silver-black mulch sheet; healthy vigor."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8DF] focus:border-[#245C43] rounded-xl text-sm"
            />
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E8DF]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-[#68766D] hover:bg-[#F8F8F2] rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#245C43] hover:bg-[#183E2E] text-white text-sm font-semibold rounded-xl transition-all shadow-xs flex items-center gap-2"
            >
              <Sprout className="w-4 h-4" />
              <span>Save Crop Record</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
