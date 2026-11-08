import React, { useState } from 'react';
import { 
  X, 
  Wheat, 
  Sparkles, 
  MapPin, 
  Truck, 
  Calendar, 
  Tag, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  Edit3, 
  Loader2, 
  Info,
  ShieldCheck
} from 'lucide-react';
import { 
  ProduceListing, 
  ProduceCategory, 
  ProduceAvailabilityStatus, 
  UserProfile 
} from '../../types';
import { improveListingDescription } from '../../utils/marketplaceAiClient';

interface CreateProduceListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveListing: (listing: ProduceListing) => void;
  initialListing?: ProduceListing | null;
  userProfile?: UserProfile;
}

const CATEGORIES: ProduceCategory[] = [
  'Vegetables',
  'Fruits',
  'Grains & Cereals',
  'Pulses',
  'Seeds & Planting Materials',
  'Standing Crops',
  'Spices & Cash Crops',
];

const UNITS = ['kg', 'quintals', 'tonnes', 'crates', 'bags'] as const;
const PRICE_UNITS = ['₹/kg', '₹/quintal', '₹/tonne', '₹/crate'] as const;

export const CreateProduceListingModal: React.FC<CreateProduceListingModalProps> = ({
  isOpen,
  onClose,
  onSaveListing,
  initialListing,
  userProfile,
}) => {
  const isEditing = !!initialListing;

  const [commodityName, setCommodityName] = useState('');
  const [category, setCategory] = useState<ProduceCategory>('Vegetables');
  const [variety, setVariety] = useState('');
  const [grade, setGrade] = useState('');
  const [quantity, setQuantity] = useState<number>(100);
  const [unit, setUnit] = useState<ProduceListing['unit']>('kg');
  const [askingPrice, setAskingPrice] = useState<number>(20);
  const [priceUnit, setPriceUnit] = useState<ProduceListing['priceUnit']>('₹/kg');
  const [isNegotiable, setIsNegotiable] = useState(true);
  const [harvestDate, setHarvestDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [availabilityDate, setAvailabilityDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [availabilityStatus, setAvailabilityStatus] = useState<ProduceAvailabilityStatus>('Ready for Collection');
  const [location, setLocation] = useState('Nashik APMC Mandi, Maharashtra');
  const [condition, setCondition] = useState('');
  const [packaging, setPackaging] = useState('');
  const [minOrderQuantity, setMinOrderQuantity] = useState<number>(10);
  const [pickupOrDelivery, setPickupOrDelivery] = useState<ProduceListing['pickupOrDelivery']>('Farmgate Pickup by Buyer');
  const [description, setDescription] = useState('');
  
  // AI Assistant State
  const [isImprovingAi, setIsImprovingAi] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string[]>([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (initialListing) {
      setCommodityName(initialListing.commodityName);
      setCategory(initialListing.category);
      setVariety(initialListing.variety || '');
      setGrade(initialListing.grade || '');
      setQuantity(initialListing.quantity);
      setUnit(initialListing.unit);
      setAskingPrice(initialListing.askingPrice);
      setPriceUnit(initialListing.priceUnit);
      setIsNegotiable(initialListing.isNegotiable);
      setHarvestDate(initialListing.harvestDate || new Date().toISOString().split('T')[0]);
      setAvailabilityDate(initialListing.availabilityDate);
      setAvailabilityStatus(initialListing.availabilityStatus);
      setLocation(initialListing.location);
      setCondition(initialListing.condition || '');
      setPackaging(initialListing.packaging || '');
      setMinOrderQuantity(initialListing.minOrderQuantity || 1);
      setPickupOrDelivery(initialListing.pickupOrDelivery);
      setDescription(initialListing.description);
    } else {
      // Defaults from user profile
      if (userProfile?.location) {
        setLocation(userProfile.location);
      }
    }
  }, [initialListing, userProfile, isOpen]);

  if (!isOpen) return null;

  // Completeness score
  const completenessFields = [
    Boolean(commodityName.trim()),
    Boolean(category),
    quantity > 0,
    askingPrice > 0,
    Boolean(location.trim()),
    Boolean(description.trim()),
    Boolean(variety.trim()),
    Boolean(grade.trim()),
    Boolean(packaging.trim()),
    Boolean(condition.trim()),
  ];
  const filledCount = completenessFields.filter(Boolean).length;
  const completenessPercent = Math.round((filledCount / completenessFields.length) * 100);

  const handleImproveDescriptionWithAi = async () => {
    if (!commodityName.trim()) {
      setErrors((prev) => ({ ...prev, commodityName: 'Enter commodity name before running AI assistant.' }));
      return;
    }

    setIsImprovingAi(true);
    setAiFeedback([]);

    try {
      const result = await improveListingDescription({
        commodityName: commodityName.trim(),
        category,
        variety: variety.trim() || undefined,
        grade: grade.trim() || undefined,
        quantity,
        unit,
        location: location.trim() || undefined,
        condition: condition.trim() || undefined,
        roughNotes: description.trim() || undefined,
      });

      if (result.improvedDescription) {
        setDescription(result.improvedDescription);
      }
      if (result.completenessFeedback) {
        setAiFeedback(result.completenessFeedback);
      }
    } finally {
      setIsImprovingAi(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!commodityName.trim()) newErrors.commodityName = 'Commodity name is required.';
    if (!quantity || quantity <= 0) newErrors.quantity = 'Quantity must be greater than 0.';
    if (!askingPrice || askingPrice <= 0) newErrors.askingPrice = 'Asking price must be greater than 0.';
    if (!location.trim()) newErrors.location = 'Product location is required.';
    if (!description.trim()) newErrors.description = 'Description is required.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsPreviewMode(false);
      return;
    }

    const now = new Date().toISOString().split('T')[0];
    const listingId = initialListing?.id || `prod-${Date.now()}`;

    const newListing: ProduceListing = {
      id: listingId,
      sellerId: initialListing?.sellerId || 'user-current',
      sellerName: initialListing?.sellerName || userProfile?.fullName || 'Ramesh Patil',
      sellerRole: initialListing?.sellerRole || userProfile?.role || 'Grower & APMC Vendor',
      sellerPhone: initialListing?.sellerPhone || userProfile?.phone || '+91 98220 55184',
      sellerLocation: initialListing?.sellerLocation || location.trim(),
      commodityName: commodityName.trim(),
      category,
      variety: variety.trim() || undefined,
      grade: grade.trim() || undefined,
      quantity,
      unit,
      askingPrice,
      priceUnit,
      isNegotiable,
      harvestDate: harvestDate || undefined,
      availabilityDate: availabilityDate || now,
      availabilityStatus,
      location: location.trim(),
      description: description.trim(),
      condition: condition.trim() || undefined,
      minOrderQuantity: minOrderQuantity || 1,
      packaging: packaging.trim() || undefined,
      pickupOrDelivery,
      status: initialListing?.status || 'Active',
      isSimulated: true,
      createdAt: initialListing?.createdAt || now,
      updatedAt: now,
    };

    onSaveListing(newListing);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-3xl w-full border border-[#E2E8DF] shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
      >
        {/* Header */}
        <div className="p-6 bg-[#FAFAF7] border-b border-[#E2E8DF] flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EAF1E7] text-[#245C43] text-xs font-bold mb-1.5">
              <Wheat className="w-3.5 h-3.5" />
              <span>Direct Agricultural Marketplace</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-[#183E2E]">
              {isEditing ? 'Edit Produce Listing' : 'List Your Agricultural Produce'}
            </h2>
            <p className="text-xs text-[#68766D] mt-1">
              Publish seeds, standing crops, harvested grains, or fresh vegetables directly to eligible buyers without a middleman cut.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isPreviewMode
                  ? 'bg-[#245C43] text-white border-[#245C43]'
                  : 'bg-white text-[#183E2E] border-[#E2E8DF] hover:bg-[#F8F8F2]'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isPreviewMode ? 'Back to Edit' : 'Preview'}</span>
            </button>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white border border-[#E2E8DF] hover:bg-[#F8F8F2] text-[#68766D] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Completeness Bar */}
        <div className="px-6 py-2.5 bg-[#F8F8F2] border-b border-[#E2E8DF] flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-[#68766D] font-medium text-[11px] shrink-0">
              Listing Completeness:
            </span>
            <div className="flex-1 max-w-xs h-2 bg-[#E2E8DF] rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  completenessPercent >= 80 ? 'bg-[#245C43]' : 'bg-[#85B96F]'
                }`}
                style={{ width: `${completenessPercent}%` }}
              />
            </div>
            <span className="font-bold text-[#183E2E] text-[11px]">{completenessPercent}%</span>
          </div>

          <span className="text-[11px] text-[#245C43] font-semibold hidden sm:inline">
            {completenessPercent >= 80 ? '✓ Ready for High Buyer Trust' : 'Complete optional details for better discovery'}
          </span>
        </div>

        {/* Content Body: Preview vs Form */}
        {isPreviewMode ? (
          <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
            <div className="bg-[#FAFAF7] rounded-3xl p-6 border border-[#85B96F]/40 shadow-xs">
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-full bg-[#EAF1E7] text-[#245C43] text-xs font-bold inline-flex items-center gap-1.5">
                  <Wheat className="w-3.5 h-3.5" />
                  {category}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#EAF1E7] text-[#245C43]">
                  {availabilityStatus}
                </span>
              </div>

              <h3 className="text-xl font-heading font-black text-[#183E2E]">
                {commodityName || 'Commodity Title'}
              </h3>
              {variety && (
                <span className="text-xs font-semibold text-[#245C43] block mt-0.5">
                  Variety: {variety}
                </span>
              )}

              <div className="flex items-center gap-2 text-xs text-[#68766D] mt-2 mb-4">
                <span>{userProfile?.fullName || 'Ramesh Patil'}</span>
                <span>•</span>
                <span>{location || 'Location'}</span>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-[#E2E8DF] mb-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[#68766D] block">Asking Price</span>
                  <strong className="text-base text-[#183E2E]">₹{askingPrice} {priceUnit.replace('₹', '')}</strong>
                </div>
                <div>
                  <span className="text-[#68766D] block">Quantity</span>
                  <strong className="text-base text-[#245C43]">{quantity} {unit}</strong>
                </div>
                <div>
                  <span className="text-[#68766D] block">Negotiable</span>
                  <strong className="text-xs text-[#183E2E]">{isNegotiable ? 'Yes' : 'Fixed'}</strong>
                </div>
                <div>
                  <span className="text-[#68766D] block">Min Order</span>
                  <strong className="text-xs text-[#183E2E]">{minOrderQuantity} {unit}</strong>
                </div>
              </div>

              <p className="text-xs text-[#1D2922] leading-relaxed mb-4">
                {description || 'No description provided yet.'}
              </p>

              <div className="text-[11px] text-[#68766D] flex flex-wrap gap-4 pt-3 border-t border-[#E2E8DF]">
                {grade && <span>Grade: <strong>{grade}</strong></span>}
                {packaging && <span>Packaging: <strong>{packaging}</strong></span>}
                <span>Logistics: <strong>{pickupOrDelivery}</strong></span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsPreviewMode(false)}
                className="px-4 py-2 rounded-xl border border-[#E2E8DF] text-xs font-semibold text-[#183E2E]"
              >
                Back to Edit
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-6 py-2 rounded-xl bg-[#245C43] hover:bg-[#183E2E] text-xs font-bold text-white shadow-xs"
              >
                Publish Listing
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
            {/* Section 1: Basic Commodity Identification */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#245C43] mb-3">
                1. Commodity Identification
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#183E2E] block mb-1">
                    Commodity / Crop Name *
                  </label>
                  <input
                    type="text"
                    value={commodityName}
                    onChange={(e) => setCommodityName(e.target.value)}
                    placeholder="e.g. Tomato (Tamatar), Red Onions, Wheat Seed"
                    className={`w-full px-3.5 py-2 bg-[#F8F8F2] border rounded-xl text-xs text-[#1D2922] ${
                      errors.commodityName ? 'border-[#B94C3D]' : 'border-[#E2E8DF] focus:border-[#245C43]'
                    }`}
                  />
                  {errors.commodityName && (
                    <p className="text-[10px] text-[#B94C3D] mt-1">{errors.commodityName}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-[#183E2E] block mb-1">
                    Commodity Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProduceCategory)}
                    className="w-full px-3.5 py-2 bg-[#F8F8F2] border border-[#E2E8DF] focus:border-[#245C43] rounded-xl text-xs font-medium text-[#183E2E]"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#183E2E] block mb-1">
                    Variety / Cultivar (Optional)
                  </label>
                  <input
                    type="text"
                    value={variety}
                    onChange={(e) => setVariety(e.target.value)}
                    placeholder="e.g. Abhinav, N-2-4-1, Pusa 1121"
                    className="w-full px-3.5 py-2 bg-[#F8F8F2] border border-[#E2E8DF] focus:border-[#245C43] rounded-xl text-xs text-[#1D2922]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#183E2E] block mb-1">
                    Quality Grade (Optional)
                  </label>
                  <input
                    type="text"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="e.g. Grade A Mandi Standard, Commercial Bold"
                    className="w-full px-3.5 py-2 bg-[#F8F8F2] border border-[#E2E8DF] focus:border-[#245C43] rounded-xl text-xs text-[#1D2922]"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Quantity & Pricing */}
            <div className="pt-2 border-t border-[#E2E8DF]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#245C43] mb-3">
                2. Quantity & Direct Asking Price
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-[#183E2E] block mb-1">
                    Total Quantity Available *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={1}
                      value={quantity || ''}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                      className={`flex-1 px-3.5 py-2 bg-[#F8F8F2] border rounded-xl text-xs text-[#1D2922] ${
                        errors.quantity ? 'border-[#B94C3D]' : 'border-[#E2E8DF] focus:border-[#245C43]'
                      }`}
                    />
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value as any)}
                      className="w-28 px-2 py-2 bg-[#F8F8F2] border border-[#E2E8DF] rounded-xl text-xs font-semibold text-[#183E2E]"
                    >
                      {UNITS.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                  {errors.quantity && (
                    <p className="text-[10px] text-[#B94C3D] mt-1">{errors.quantity}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-[#183E2E] block mb-1">
                    Asking Price & Unit *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.5"
                      min={0.5}
                      value={askingPrice || ''}
                      onChange={(e) => setAskingPrice(parseFloat(e.target.value) || 0)}
                      className={`flex-1 px-3.5 py-2 bg-[#F8F8F2] border rounded-xl text-xs font-bold text-[#1D2922] ${
                        errors.askingPrice ? 'border-[#B94C3D]' : 'border-[#E2E8DF] focus:border-[#245C43]'
                      }`}
                    />
                    <select
                      value={priceUnit}
                      onChange={(e) => setPriceUnit(e.target.value as any)}
                      className="w-28 px-2 py-2 bg-[#F8F8F2] border border-[#E2E8DF] rounded-xl text-xs font-semibold text-[#183E2E]"
                    >
                      {PRICE_UNITS.map((pu) => (
                        <option key={pu} value={pu}>{pu}</option>
                      ))}
                    </select>
                  </div>
                  {errors.askingPrice && (
                    <p className="text-[10px] text-[#B94C3D] mt-1">{errors.askingPrice}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-[#183E2E] block mb-1">
                    Min Order Quantity
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={minOrderQuantity || ''}
                    onChange={(e) => setMinOrderQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3.5 py-2 bg-[#F8F8F2] border border-[#E2E8DF] rounded-xl text-xs text-[#1D2922]"
                  />
                </div>

                <div className="sm:col-span-3 flex items-center gap-3 pt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#183E2E]">
                    <input
                      type="checkbox"
                      checked={isNegotiable}
                      onChange={(e) => setIsNegotiable(e.target.checked)}
                      className="w-4 h-4 rounded text-[#245C43] focus:ring-[#245C43]"
                    />
                    <span>Price is negotiable for bulk wholesale buyers</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Section 3: Availability & Location */}
            <div className="pt-2 border-t border-[#E2E8DF]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#245C43] mb-3">
                3. Availability, Timing & Location
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#183E2E] block mb-1">
                    Availability Status *
                  </label>
                  <select
                    value={availabilityStatus}
                    onChange={(e) => setAvailabilityStatus(e.target.value as ProduceAvailabilityStatus)}
                    className="w-full px-3.5 py-2 bg-[#F8F8F2] border border-[#E2E8DF] rounded-xl text-xs font-semibold text-[#183E2E]"
                  >
                    <option value="Ready for Collection">Ready for Collection</option>
                    <option value="Harvest in Progress">Harvest in Progress</option>
                    <option value="Standing Crop (Ready in 7-14 Days)">Standing Crop (Ready in 7-14 Days)</option>
                    <option value="Sold Out">Sold Out</option>
                    <option value="Paused">Paused</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#183E2E] block mb-1">
                    Availability / Dispatch Date
                  </label>
                  <input
                    type="date"
                    value={availabilityDate}
                    onChange={(e) => setAvailabilityDate(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#F8F8F2] border border-[#E2E8DF] rounded-xl text-xs text-[#1D2922]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#183E2E] block mb-1">
                    Harvest Date (if harvested)
                  </label>
                  <input
                    type="date"
                    value={harvestDate}
                    onChange={(e) => setHarvestDate(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#F8F8F2] border border-[#E2E8DF] rounded-xl text-xs text-[#1D2922]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-[#183E2E] block mb-1">
                    Farm / Produce Location *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-[#68766D] absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Dindori Belt, Nashik, Maharashtra"
                      className={`w-full pl-9 pr-3.5 py-2 bg-[#F8F8F2] border rounded-xl text-xs text-[#1D2922] ${
                        errors.location ? 'border-[#B94C3D]' : 'border-[#E2E8DF] focus:border-[#245C43]'
                      }`}
                    />
                  </div>
                  {errors.location && (
                    <p className="text-[10px] text-[#B94C3D] mt-1">{errors.location}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-[#183E2E] block mb-1">
                    Pickup / Logistics Terms
                  </label>
                  <select
                    value={pickupOrDelivery}
                    onChange={(e) => setPickupOrDelivery(e.target.value as any)}
                    className="w-full px-3.5 py-2 bg-[#F8F8F2] border border-[#E2E8DF] rounded-xl text-xs font-semibold text-[#183E2E]"
                  >
                    <option value="Farmgate Pickup by Buyer">Farmgate Pickup by Buyer</option>
                    <option value="Seller can deliver to Mandi/Facility">Seller can deliver to Mandi/Facility</option>
                    <option value="Negotiable Logistics">Negotiable Logistics</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 4: Lot Condition & Packaging */}
            <div className="pt-2 border-t border-[#E2E8DF]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#245C43] mb-3">
                4. Lot Condition & Packaging Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#183E2E] block mb-1">
                    Packaging Specification (Optional)
                  </label>
                  <input
                    type="text"
                    value={packaging}
                    onChange={(e) => setPackaging(e.target.value)}
                    placeholder="e.g. 20 kg plastic crates, 50 kg mesh bags, bulk trolley"
                    className="w-full px-3.5 py-2 bg-[#F8F8F2] border border-[#E2E8DF] rounded-xl text-xs text-[#1D2922]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#183E2E] block mb-1">
                    Physical Condition & Handling (Optional)
                  </label>
                  <input
                    type="text"
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    placeholder="e.g. Cured in shade, sorted for firmness, moisture 12%"
                    className="w-full px-3.5 py-2 bg-[#F8F8F2] border border-[#E2E8DF] rounded-xl text-xs text-[#1D2922]"
                  />
                </div>
              </div>
            </div>

            {/* Section 5: Description & AI Assistant */}
            <div className="pt-2 border-t border-[#E2E8DF]">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <label className="text-xs font-bold text-[#183E2E] block">
                    Product Description & Buyer Notes *
                  </label>
                  <span className="text-[11px] text-[#68766D]">
                    Highlight crop maturity, handling, and storage details.
                  </span>
                </div>

                {/* AI Listing Assistant Button */}
                <button
                  type="button"
                  onClick={handleImproveDescriptionWithAi}
                  disabled={isImprovingAi}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#183E2E] to-[#245C43] text-white hover:opacity-95 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                  title="Improve description based strictly on entered facts without inventing certifications"
                >
                  {isImprovingAi ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D7E8A3]" />
                      <span>Polishing with AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-[#D7E8A3]" />
                      <span>Improve Description with AI</span>
                    </>
                  )}
                </button>
              </div>

              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter your rough commodity details or notes here. You can click 'Improve Description with AI' to refine it into a clean summary."
                className={`w-full px-3.5 py-2.5 bg-[#F8F8F2] border rounded-xl text-xs text-[#1D2922] leading-relaxed ${
                  errors.description ? 'border-[#B94C3D]' : 'border-[#E2E8DF] focus:border-[#245C43]'
                }`}
              />
              {errors.description && (
                <p className="text-[10px] text-[#B94C3D] mt-1">{errors.description}</p>
              )}

              {/* AI Feedback Chips */}
              {aiFeedback.length > 0 && (
                <div className="mt-2.5 p-3 rounded-xl bg-[#EAF1E7]/70 border border-[#85B96F]/30 text-xs text-[#183E2E]">
                  <span className="font-bold text-[11px] block mb-1 text-[#245C43] flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#245C43]" />
                    AI Completeness Suggestions:
                  </span>
                  <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-[#245C43]">
                    {aiFeedback.map((fb, idx) => (
                      <li key={idx}>{fb}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Disclaimer */}
            <div className="bg-[#FAFAF7] rounded-xl p-3 border border-[#E2E8DF] flex items-start gap-2 text-[11px] text-[#68766D]">
              <ShieldCheck className="w-4 h-4 text-[#245C43] shrink-0 mt-0.5" />
              <p>
                This listing will be published directly to participating buyers and companies. 
                You retain complete control to pause, edit, or mark this listing as sold at any time.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-[#E2E8DF] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-[#E2E8DF] hover:bg-[#F8F8F2] text-xs font-semibold text-[#68766D] transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#245C43] hover:bg-[#183E2E] text-xs font-bold text-white transition-all shadow-xs hover:shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Wheat className="w-4 h-4" />
                <span>{isEditing ? 'Save Changes' : 'Publish Produce Listing'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
