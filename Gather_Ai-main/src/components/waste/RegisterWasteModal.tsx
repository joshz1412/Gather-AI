import React, { useState } from 'react';
import { X, RefreshCw, AlertCircle, MapPin, Calendar, Info, Building2 } from 'lucide-react';
import { WasteRecord, WasteMaterialCategory, WasteCondition, ContaminationLevel } from '../../types';
import { generateWasteAssessment } from '../../utils/matchingEngine';

interface RegisterWasteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveWaste: (record: WasteRecord) => void;
  defaultLocation?: string;
  defaultContactName?: string;
  defaultContactPhone?: string;
}

export const RegisterWasteModal: React.FC<RegisterWasteModalProps> = ({
  isOpen,
  onClose,
  onSaveWaste,
  defaultLocation,
  defaultContactName,
  defaultContactPhone,
}) => {
  const [materialCategory, setMaterialCategory] = useState<WasteMaterialCategory>(
    'Fruit & Vegetable Scraps'
  );
  const [materialType, setMaterialType] = useState('Mixed vegetable market trimmings');
  const [quantity, setQuantity] = useState<number>(150);
  const [unit, setUnit] = useState<WasteRecord['unit']>('kg');
  const [pickupLocation, setPickupLocation] = useState(defaultLocation || 'Nashik APMC Mandi, Maharashtra');
  const [preferredPickupWindow, setPreferredPickupWindow] = useState('Tomorrow morning (08:00 – 12:00)');
  const [condition, setCondition] = useState<WasteCondition>('Grade B / Bruised but sound');
  const [contaminationStatus, setContaminationStatus] = useState<ContaminationLevel>(
    'Clean / 100% Segregated'
  );
  const [storageDetails, setStorageDetails] = useState('Stored in ventilated plastic crates');
  const [contactName, setContactName] = useState(defaultContactName || 'Ramesh Patil');
  const [contactPhone, setContactPhone] = useState(defaultContactPhone || '+91 98220 55184');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (isOpen) {
      if (defaultLocation) setPickupLocation(defaultLocation);
      if (defaultContactName) setContactName(defaultContactName);
      if (defaultContactPhone) setContactPhone(defaultContactPhone);
    }
  }, [isOpen, defaultLocation, defaultContactName, defaultContactPhone]);

  if (!isOpen) return null;

  const quickPresets = [
    {
      category: 'Unsold Fresh Produce' as WasteMaterialCategory,
      type: 'Tomato surplus & culls (Grade B)',
      qty: 35,
      unit: 'crates' as WasteRecord['unit'],
      condition: 'Grade B / Bruised but sound' as WasteCondition,
      storage: 'Stacked in shaded wooden/plastic crates under mandi canopy',
    },
    {
      category: 'Crop Residues & Stalks' as WasteMaterialCategory,
      type: 'Wheat straw & combine stubble bales',
      qty: 2,
      unit: 'tonnes' as WasteRecord['unit'],
      condition: 'Dry / Fibrous residues' as WasteCondition,
      storage: 'Tied square bales stacked under waterproof tarpaulin in field yard',
    },
    {
      category: 'Fruit & Vegetable Scraps' as WasteMaterialCategory,
      type: 'Onion peel & culled bulbs',
      qty: 400,
      unit: 'kg' as WasteRecord['unit'],
      condition: 'Soft / Rapidly perishing' as WasteCondition,
      storage: 'Open mesh ventilated bags on wooden pallets',
    },
    {
      category: 'Plant-based Kitchen Waste' as WasteMaterialCategory,
      type: 'Canteen vegetable peels & fruit pulps',
      qty: 120,
      unit: 'kg' as WasteRecord['unit'],
      condition: 'Decomposing / High moisture' as WasteCondition,
      storage: 'Blue sealed 50L organic drums',
    },
  ];

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!materialType.trim()) newErrors.materialType = 'Specific material description is required.';
    if (!pickupLocation.trim()) newErrors.pickupLocation = 'Pickup location is required.';
    if (!quantity || quantity <= 0) newErrors.quantity = 'Valid quantity greater than zero is required.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const newRecord: WasteRecord = {
      id: `waste-${Date.now()}`,
      materialCategory,
      materialType: materialType.trim(),
      quantity: Number(quantity),
      unit,
      pickupLocation: pickupLocation.trim(),
      availableFrom: new Date().toISOString().split('T')[0],
      preferredPickupWindow: preferredPickupWindow.trim(),
      condition,
      contaminationStatus,
      storageDetails: storageDetails.trim(),
      notes: notes.trim() || undefined,
      contactName: contactName.trim() || undefined,
      contactPhone: contactPhone.trim() || undefined,
      status: 'Matching Available',
      assessment: previewAssessment,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    onSaveWaste(newRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1D2922]/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-[#E2E8DF] shadow-xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8DF] flex items-center justify-between bg-[#FAFAF7]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EAF1E7] text-[#245C43] flex items-center justify-center border border-[#85B96F]/30">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-[#183E2E]">Register Organic Waste Batch</h3>
              <p className="text-xs text-[#68766D]">Specify organic material to match with certified regional recovery facilities</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#68766D] hover:text-[#183E2E] rounded-lg hover:bg-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Quick presets */}
          <div>
            <label className="block text-xs font-semibold text-[#183E2E] uppercase tracking-wider mb-2">
              Quick Pre-Fill Scenarios:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {quickPresets.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setMaterialCategory(p.category);
                    setMaterialType(p.type);
                    setQuantity(p.qty);
                    setUnit(p.unit);
                    setCondition(p.condition);
                    setStorageDetails(p.storage);
                  }}
                  className="p-2.5 bg-[#F8F8F2] hover:bg-[#EAF1E7] border border-[#E2E8DF] hover:border-[#85B96F]/50 rounded-xl text-left text-xs transition-colors"
                >
                  <strong className="block text-[#183E2E] truncate">{p.type}</strong>
                  <span className="text-[11px] text-[#68766D]">{p.qty} {p.unit}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Material Category & Specific Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#183E2E] mb-1.5">
                Material Category *
              </label>
              <select
                value={materialCategory}
                onChange={(e) => setMaterialCategory(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8DF] focus:border-[#245C43] rounded-xl text-sm"
              >
                <option value="Fruit & Vegetable Scraps">Fruit & Vegetable Scraps</option>
                <option value="Unsold Fresh Produce">Unsold Fresh Produce</option>
                <option value="Crop Residues & Stalks">Crop Residues & Stalks</option>
                <option value="Plant-based Kitchen Waste">Plant-based Kitchen Waste</option>
                <option value="Other Organic Biomass">Other Organic Biomass</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#183E2E] mb-1.5">
                Specific Material Type *
              </label>
              <input
                type="text"
                placeholder="e.g. Tomato culls, onion peels, wheat straw"
                value={materialType}
                onChange={(e) => setMaterialType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8DF] focus:border-[#245C43] rounded-xl text-sm"
              />
              {errors.materialType && (
                <p className="text-xs text-[#B94C3D] mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.materialType}
                </p>
              )}
            </div>
          </div>

          {/* Quantity & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#183E2E] mb-1.5">
                Approximate Quantity *
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8DF] focus:border-[#245C43] rounded-xl text-sm font-semibold"
              />
              {errors.quantity && (
                <p className="text-xs text-[#B94C3D] mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.quantity}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#183E2E] mb-1.5">
                Unit *
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8DF] focus:border-[#245C43] rounded-xl text-sm"
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="crates">Crates (~25 kg each)</option>
                <option value="quintals">Quintals (100 kg)</option>
                <option value="tonnes">Tonnes (1,000 kg)</option>
              </select>
            </div>
          </div>

          {/* Pickup Location & Timing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#183E2E] mb-1.5">
                Pickup Yard / Mandi Location *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#68766D] absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="e.g. Nashik APMC Mandi, Dindori Road"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-[#E2E8DF] focus:border-[#245C43] rounded-xl text-sm"
                />
              </div>
              {errors.pickupLocation && (
                <p className="text-xs text-[#B94C3D] mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.pickupLocation}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#183E2E] mb-1.5">
                Preferred Collection Timing
              </label>
              <input
                type="text"
                placeholder="e.g. Next 24 hours / Morning 8-11am"
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
                Physical Condition
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8DF] rounded-xl text-xs sm:text-sm"
              >
                <option value="Fresh surplus (edible quality)">Fresh surplus (edible quality)</option>
                <option value="Grade B / Bruised but sound">Grade B / Bruised but sound</option>
                <option value="Soft / Rapidly perishing">Soft / Rapidly perishing</option>
                <option value="Decomposing / High moisture">Decomposing / High moisture</option>
                <option value="Dry / Fibrous residues">Dry / Fibrous residues</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#183E2E] mb-1.5">
                Segregation Status
              </label>
              <select
                value={contaminationStatus}
                onChange={(e) => setContaminationStatus(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8DF] rounded-xl text-xs sm:text-sm"
              >
                <option value="Clean / 100% Segregated">Clean / 100% Segregated</option>
                <option value="Minor organic debris (leaves, soil)">Minor organic debris (leaves, soil)</option>
                <option value="Mixed organic waste (requires pre-sorting)">Mixed organic waste (requires sorting)</option>
                <option value="Unsegregated / Contains foreign packaging">Unsegregated / Foreign packaging</option>
              </select>
            </div>
          </div>

          {/* Storage & Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-[#183E2E] mb-1.5">
                Storage Method
              </label>
              <input
                type="text"
                placeholder="e.g. Ventilated crates, open pile"
                value={storageDetails}
                onChange={(e) => setStorageDetails(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E2E8DF] rounded-xl text-xs sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#183E2E] mb-1.5">
                Contact Name
              </label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E2E8DF] rounded-xl text-xs sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#183E2E] mb-1.5">
                Phone Number
              </label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E2E8DF] rounded-xl text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* Structured Assessment Live Preview */}
          <div className="bg-[#EAF1E7] border border-[#85B96F]/40 rounded-2xl p-4 space-y-2.5 text-xs text-[#183E2E]">
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-1.5">
                <Info className="w-4 h-4 text-[#245C43]" />
                <span>Deterministic Biological Waste Assessment</span>
              </span>
              <span className="text-[11px] bg-white text-[#245C43] px-2 py-0.5 rounded-full border border-[#85B96F]/30">
                {previewAssessment.quantityFormatted}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {previewAssessment.suitableRecoveryCategories.map((cat, i) => (
                <span
                  key={i}
                  className="bg-white border border-[#85B96F]/40 text-[#183E2E] px-2.5 py-0.5 rounded-lg text-[11px] font-semibold"
                >
                  ✓ {cat}
                </span>
              ))}
            </div>

            <p className="text-[#68766D] text-[11px] leading-relaxed">
              <strong>Next Step:</strong> {previewAssessment.recommendedNextAction}
            </p>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E8DF]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-[#68766D] hover:bg-[#F8F8F2] rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#245C43] hover:bg-[#183E2E] text-white text-sm font-semibold rounded-xl transition-all shadow-xs flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Register & Find Matches</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
