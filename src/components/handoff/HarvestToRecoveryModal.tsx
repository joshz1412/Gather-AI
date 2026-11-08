import React, { useState } from 'react';
import { 
  X, 
  RefreshCw, 
  ArrowRight, 
  Sprout, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  Building2,
  Info
} from 'lucide-react';
import { CropRecord, WasteRecord } from '../../types';
import { generateWasteAssessment } from '../../utils/matchingEngine';

interface HarvestToRecoveryModalProps {
  crop: CropRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmHandoff: (wasteRecord: WasteRecord) => void;
}

export const HarvestToRecoveryModal: React.FC<HarvestToRecoveryModalProps> = ({
  crop,
  isOpen,
  onClose,
  onConfirmHandoff,
}) => {
  if (!isOpen || !crop) return null;

  const defaultQuantity = crop.surplusDetails?.estimatedQuantity || 25;
  const defaultUnit = crop.surplusDetails?.unit || 'crates';
  const defaultCondition = crop.surplusDetails?.condition === 'Grade B / Blemished'
    ? 'Grade B / Bruised but sound'
    : crop.surplusDetails?.condition === 'Overripe'
    ? 'Soft / Rapidly perishing'
    : crop.surplusDetails?.condition === 'Residues / Stalks'
    ? 'Dry / Fibrous residues'
    : 'Fresh surplus (edible quality)';

  const [materialType, setMaterialType] = useState(
    `${crop.cropName} surplus & market culls`
  );
  const [materialCategory, setMaterialCategory] = useState<WasteRecord['materialCategory']>(
    (crop.cropName.includes('Wheat') || crop.cropName.includes('Rice')) ? 'Crop Residues & Stalks' : 'Unsold Fresh Produce'
  );
  const [quantity, setQuantity] = useState<number>(defaultQuantity);
  const [unit, setUnit] = useState<WasteRecord['unit']>(defaultUnit);
  const [pickupLocation, setPickupLocation] = useState(crop.location);
  const [preferredPickupWindow, setPreferredPickupWindow] = useState('Within next 24–48 hours');
  const [condition, setCondition] = useState<WasteRecord['condition']>(defaultCondition as any);
  const [contaminationStatus, setContaminationStatus] = useState<WasteRecord['contaminationStatus']>(
    'Clean / 100% Segregated'
  );
  const [storageDetails, setStorageDetails] = useState(
    'Stacked in shaded crates at farm gate / mandi yard'
  );
  const [notes, setNotes] = useState(
    crop.surplusDetails?.notes || `Harvested from ${crop.cropName} field (${crop.variety || 'Standard'}). Ready for recovery.`
  );

  const previewAssessment = generateWasteAssessment({
    materialCategory,
    materialType,
    quantity,
    unit,
    condition,
    contaminationStatus,
    pickupLocation,
    storageDetails,
  });

  const handleCreateWasteRecord = () => {
    const newWaste: WasteRecord = {
      id: `waste-${Date.now()}`,
      materialCategory,
      materialType,
      quantity: Number(quantity),
      unit,
      pickupLocation,
      availableFrom: new Date().toISOString().split('T')[0],
      preferredPickupWindow,
      condition,
      contaminationStatus,
      storageDetails,
      notes,
      originCropId: crop.id,
      originCropName: `${crop.cropName} ${crop.variety ? `(${crop.variety})` : ''}`,
      contactName: 'Ramesh Patil',
      contactPhone: '+91 98220 55184',
      status: 'Matching Available',
      assessment: previewAssessment,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    onConfirmHandoff(newWaste);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1D2922]/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-[#E2E8DF] shadow-xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8DF] bg-gradient-to-r from-[#EAF1E7] via-white to-[#EAF1E7] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#245C43] text-white flex items-center justify-center shadow-xs">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#245C43] text-white px-2 py-0.5 rounded-full">
                  Harvest → Recovery Integration
                </span>
              </div>
              <h3 className="font-heading font-bold text-lg text-[#183E2E] mt-0.5">
                Transfer Surplus Produce to Recovery
              </h3>
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
          {/* Connection Banner */}
          <div className="p-4 rounded-2xl bg-[#EAF1E7] border border-[#85B96F]/40 flex items-start gap-3 text-xs text-[#183E2E]">
            <Sprout className="w-5 h-5 text-[#245C43] shrink-0 mt-0.5" />
            <div>
              <strong>Origin Crop Connected:</strong> Pre-filled from your registered harvest for{' '}
              <span className="font-bold underline">{crop.cropName}</span> ({crop.variety || 'Standard'}, {crop.location}).
              Please review and adjust details before matching with regional recovery facilities.
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#183E2E] mb-1.5">
                Specific Material Type *
              </label>
              <input
                type="text"
                value={materialType}
                onChange={(e) => setMaterialType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8DF] focus:border-[#245C43] rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#183E2E] mb-1.5">
                Material Category *
              </label>
              <select
                value={materialCategory}
                onChange={(e) => setMaterialCategory(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8DF] focus:border-[#245C43] rounded-xl text-sm"
              >
                <option value="Unsold Fresh Produce">Unsold Fresh Produce</option>
                <option value="Fruit & Vegetable Scraps">Fruit & Vegetable Scraps</option>
                <option value="Crop Residues & Stalks">Crop Residues & Stalks</option>
                <option value="Plant-based Kitchen Waste">Plant-based Kitchen Waste</option>
                <option value="Other Organic Biomass">Other Organic Biomass</option>
              </select>
            </div>
          </div>

          {/* Quantity & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#183E2E] mb-1.5">
                Estimated Quantity *
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8DF] focus:border-[#245C43] rounded-xl text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#183E2E] mb-1.5">
                Unit of Measure *
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8DF] focus:border-[#245C43] rounded-xl text-sm"
              >
                <option value="crates">Crates (~25 kg each)</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="quintals">Quintals (100 kg)</option>
                <option value="tonnes">Tonnes (1,000 kg)</option>
              </select>
            </div>
          </div>

          {/* Location & Preferred Pickup */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#183E2E] mb-1.5">
                Pickup Yard / Mandi Location *
              </label>
              <input
                type="text"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8DF] focus:border-[#245C43] rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#183E2E] mb-1.5">
                Preferred Collection Timing
              </label>
              <input
                type="text"
                value={preferredPickupWindow}
                onChange={(e) => setPreferredPickupWindow(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8DF] focus:border-[#245C43] rounded-xl text-sm"
              />
            </div>
          </div>

          {/* Condition & Contamination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#183E2E] mb-1.5">
                Material Physical Condition
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8DF] rounded-xl text-xs sm:text-sm"
              >
                <option value="Grade B / Bruised but sound">Grade B / Bruised but sound</option>
                <option value="Fresh surplus (edible quality)">Fresh surplus (edible quality)</option>
                <option value="Soft / Rapidly perishing">Soft / Rapidly perishing</option>
                <option value="Decomposing / High moisture">Decomposing / High moisture</option>
                <option value="Dry / Fibrous residues">Dry / Fibrous residues</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#183E2E] mb-1.5">
                Segregation & Cleanliness
              </label>
              <select
                value={contaminationStatus}
                onChange={(e) => setContaminationStatus(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8DF] rounded-xl text-xs sm:text-sm"
              >
                <option value="Clean / 100% Segregated">Clean / 100% Segregated</option>
                <option value="Minor organic debris (leaves, soil)">Minor organic debris (leaves, soil)</option>
                <option value="Mixed organic waste (requires pre-sorting)">Mixed organic waste (requires sorting)</option>
                <option value="Unsegregated / Contains foreign packaging">Unsegregated / Has packaging</option>
              </select>
            </div>
          </div>

          {/* Storage Details */}
          <div>
            <label className="block text-xs font-semibold text-[#183E2E] mb-1.5">
              Storage Arrangement (Helps partner determine transport)
            </label>
            <input
              type="text"
              value={storageDetails}
              onChange={(e) => setStorageDetails(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8DF] focus:border-[#245C43] rounded-xl text-sm"
            />
          </div>

          {/* Preliminary Assessment Preview */}
          <div className="bg-[#FAFAF7] border border-[#E2E8DF] rounded-2xl p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between font-semibold text-[#183E2E]">
              <span>Recovery Assessment Preview</span>
              <span className="text-[#245C43]">{previewAssessment.quantityFormatted}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {previewAssessment.suitableRecoveryCategories.map((cat, i) => (
                <span
                  key={i}
                  className="bg-white border border-[#85B96F]/40 text-[#183E2E] px-2 py-0.5 rounded-lg text-[11px] font-medium"
                >
                  ✓ {cat}
                </span>
              ))}
            </div>
            <p className="text-[#68766D] text-[11px]">
              {previewAssessment.recommendedNextAction}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E2E8DF] bg-[#FAFAF7] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-[#68766D] hover:bg-white rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateWasteRecord}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#245C43] hover:bg-[#183E2E] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-xs"
          >
            <span>Confirm & Match Recovery Partners</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
