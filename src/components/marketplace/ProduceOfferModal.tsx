import React, { useState } from 'react';
import { 
  X, 
  Tag, 
  Wheat, 
  MapPin, 
  Truck, 
  Phone, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  Info 
} from 'lucide-react';
import { ProduceListing, TradeRequest, UserProfile } from '../../types';

interface ProduceOfferModalProps {
  listing: ProduceListing | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveRequest: (request: TradeRequest) => void;
  userProfile?: UserProfile;
}

export const ProduceOfferModal: React.FC<ProduceOfferModalProps> = ({
  listing,
  isOpen,
  onClose,
  onSaveRequest,
  userProfile,
}) => {
  const [quantity, setQuantity] = useState<number>(10);
  const [offeredPrice, setOfferedPrice] = useState<number>(0);
  const [buyerName, setBuyerName] = useState(userProfile?.fullName || 'Ramesh Patil');
  const [buyerPhone, setBuyerPhone] = useState(userProfile?.phone || '+91 98220 55184');
  const [buyerLocation, setBuyerLocation] = useState(userProfile?.location || 'Nashik APMC Mandi, Maharashtra');
  const [preferredLogistics, setPreferredLogistics] = useState<'Pickup by Buyer' | 'Delivery by Seller' | 'Third-party Logistics'>('Pickup by Buyer');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (listing) {
      setQuantity(listing.minOrderQuantity || Math.min(25, listing.quantity));
      setOfferedPrice(listing.askingPrice);
      if (userProfile?.fullName) setBuyerName(userProfile.fullName);
      if (userProfile?.phone) setBuyerPhone(userProfile.phone);
      if (userProfile?.location) setBuyerLocation(userProfile.location);
    }
  }, [listing, userProfile]);

  if (!isOpen || !listing) return null;

  const totalOfferedValue = quantity * offeredPrice;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!quantity || quantity <= 0) {
      newErrors.quantity = 'Please enter a valid quantity.';
    } else if (listing.minOrderQuantity && quantity < listing.minOrderQuantity) {
      newErrors.quantity = `Minimum order is ${listing.minOrderQuantity} ${listing.unit}.`;
    } else if (quantity > listing.quantity) {
      newErrors.quantity = `Available quantity is ${listing.quantity} ${listing.unit}.`;
    }

    if (!offeredPrice || offeredPrice <= 0) {
      newErrors.offeredPrice = 'Please enter an offered rate.';
    }

    if (!buyerName.trim()) {
      newErrors.buyerName = 'Buyer / Contact name is required.';
    }

    if (!buyerPhone.trim()) {
      newErrors.buyerPhone = 'Phone number is required.';
    }

    if (!buyerLocation.trim()) {
      newErrors.buyerLocation = 'Buyer location is required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newRequest: TradeRequest = {
      id: `trade-offer-${Date.now()}`,
      type: 'produce_purchase_offer',
      targetId: listing.id,
      targetTitle: listing.commodityName,
      targetCategory: listing.category,
      buyerId: 'user-current',
      buyerName: buyerName.trim(),
      buyerPhone: buyerPhone.trim(),
      buyerLocation: buyerLocation.trim(),
      sellerId: listing.sellerId,
      sellerName: listing.sellerName,
      sellerPhone: listing.sellerPhone,
      requestedQuantity: quantity,
      quantityUnit: listing.unit,
      offeredPricePerUnit: offeredPrice,
      priceUnit: listing.priceUnit,
      estimatedTotalValue: totalOfferedValue,
      preferredLogistics,
      message: message.trim() || `Offer of ₹${offeredPrice} ${listing.priceUnit.replace('₹', '')} for ${quantity} ${listing.unit} of ${listing.commodityName}.`,
      status: 'Submitted',
      statusNotes: `Direct offer submitted to farmer ${listing.sellerName}. Awaiting review.`,
      createdAt: now,
      updatedAt: now,
      isSimulated: true,
    };

    onSaveRequest(newRequest);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full border border-[#E2E8DF] shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
      >
        {/* Header */}
        <div className="p-6 bg-[#FAFAF7] border-b border-[#E2E8DF] flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EAF1E7] text-[#245C43] text-xs font-bold mb-1.5">
              <Tag className="w-3.5 h-3.5" />
              <span>Make an Offer / Enquiry</span>
            </div>
            <h2 className="text-xl font-heading font-extrabold text-[#183E2E]">
              {listing.commodityName}
            </h2>
            <div className="flex items-center gap-2 text-xs text-[#68766D] mt-1">
              <span>Farmer: <strong>{listing.sellerName}</strong></span>
              <span>•</span>
              <span>Asking: <strong>₹{listing.askingPrice} {listing.priceUnit.replace('₹', '')}</strong></span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white border border-[#E2E8DF] hover:bg-[#F8F8F2] text-[#68766D] flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Quantity & Offered Rate Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#183E2E]">
                  Requested Quantity ({listing.unit}) *
                </label>
                <span className="text-[11px] text-[#68766D]">
                  Avail: {listing.quantity} {listing.unit}
                </span>
              </div>
              <input
                type="number"
                min={listing.minOrderQuantity || 1}
                max={listing.quantity}
                value={quantity || ''}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                className={`w-full px-3.5 py-2.5 bg-[#F8F8F2] border rounded-xl text-sm font-semibold text-[#1D2922] ${
                  errors.quantity ? 'border-[#B94C3D]' : 'border-[#E2E8DF] focus:border-[#245C43]'
                }`}
              />
              {errors.quantity && (
                <p className="text-[10px] text-[#B94C3D] mt-1">{errors.quantity}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#183E2E]">
                  Offered Price ({listing.priceUnit}) *
                </label>
                <span className="text-[11px] text-[#68766D]">
                  {listing.isNegotiable ? 'Negotiable' : 'Fixed rate'}
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min={1}
                  value={offeredPrice || ''}
                  onChange={(e) => setOfferedPrice(parseFloat(e.target.value) || 0)}
                  className={`w-full px-3.5 py-2.5 bg-[#F8F8F2] border rounded-xl text-sm font-bold text-[#1D2922] ${
                    errors.offeredPrice ? 'border-[#B94C3D]' : 'border-[#E2E8DF] focus:border-[#245C43]'
                  }`}
                />
              </div>
              {errors.offeredPrice && (
                <p className="text-[10px] text-[#B94C3D] mt-1">{errors.offeredPrice}</p>
              )}
            </div>
          </div>

          {/* Pricing Estimation Pill */}
          <div className="bg-[#EAF1E7]/50 rounded-2xl p-3.5 border border-[#85B96F]/30 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-[#245C43] block">
                Total Offered Trade Value
              </span>
              <span className="text-[10px] text-[#68766D]">
                ({quantity} {listing.unit} × ₹{offeredPrice} {listing.priceUnit.replace('₹', '')})
              </span>
            </div>
            <span className="text-lg font-heading font-black text-[#183E2E]">
              ₹{totalOfferedValue.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Buyer Contacts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-xs font-bold text-[#183E2E] block mb-1">
                Your Name / Business Name *
              </label>
              <input
                type="text"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder="Buyer Name"
                className={`w-full px-3.5 py-2 bg-[#F8F8F2] border rounded-xl text-xs text-[#1D2922] ${
                  errors.buyerName ? 'border-[#B94C3D]' : 'border-[#E2E8DF] focus:border-[#245C43]'
                }`}
              />
              {errors.buyerName && (
                <p className="text-[10px] text-[#B94C3D] mt-1">{errors.buyerName}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-[#183E2E] block mb-1">
                Contact Phone *
              </label>
              <input
                type="tel"
                value={buyerPhone}
                onChange={(e) => setBuyerPhone(e.target.value)}
                placeholder="+91 98200 44299"
                className={`w-full px-3.5 py-2 bg-[#F8F8F2] border rounded-xl text-xs text-[#1D2922] ${
                  errors.buyerPhone ? 'border-[#B94C3D]' : 'border-[#E2E8DF] focus:border-[#245C43]'
                }`}
              />
              {errors.buyerPhone && (
                <p className="text-[10px] text-[#B94C3D] mt-1">{errors.buyerPhone}</p>
              )}
            </div>
          </div>

          {/* Buyer Location */}
          <div>
            <label className="text-xs font-bold text-[#183E2E] block mb-1">
              Your Mandi / Procurement Base Location *
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-[#68766D] absolute left-3 top-2.5" />
              <input
                type="text"
                value={buyerLocation}
                onChange={(e) => setBuyerLocation(e.target.value)}
                placeholder="Market Yard / City, State"
                className={`w-full pl-9 pr-3.5 py-2 bg-[#F8F8F2] border rounded-xl text-xs text-[#1D2922] ${
                  errors.buyerLocation ? 'border-[#B94C3D]' : 'border-[#E2E8DF] focus:border-[#245C43]'
                }`}
              />
            </div>
            {errors.buyerLocation && (
              <p className="text-[10px] text-[#B94C3D] mt-1">{errors.buyerLocation}</p>
            )}
          </div>

          {/* Logistics Selection */}
          <div>
            <label className="text-xs font-bold text-[#183E2E] block mb-1">
              Proposed Logistics & Collection Terms
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              {[
                { id: 'Pickup by Buyer', label: 'Buyer Pickup', sub: 'Own truck/tempo' },
                { id: 'Delivery by Seller', label: 'Seller Delivery', sub: 'Delivered to yard' },
                { id: 'Third-party Logistics', label: 'Negotiable Transporter', sub: 'Shared freight' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPreferredLogistics(opt.id as any)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    preferredLogistics === opt.id
                      ? 'bg-[#EAF1E7] border-[#245C43] text-[#183E2E] ring-1 ring-[#245C43]'
                      : 'bg-[#FAFAF7] border-[#E2E8DF] text-[#68766D] hover:border-[#85B96F]'
                  }`}
                >
                  <span className="font-bold block text-xs">{opt.label}</span>
                  <span className="text-[10px] opacity-80">{opt.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Offer Message */}
          <div>
            <label className="text-xs font-bold text-[#183E2E] block mb-1">
              Offer Message or Payment Terms (Optional)
            </label>
            <textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Can collect 120 crates this Friday at 7 AM with our reefer truck. Cash settlement upon weighing."
              className="w-full px-3.5 py-2 bg-[#F8F8F2] border border-[#E2E8DF] focus:border-[#245C43] rounded-xl text-xs text-[#1D2922]"
            />
          </div>

          {/* Disclaimer */}
          <div className="bg-[#FAFAF7] rounded-xl p-3 border border-[#E2E8DF] flex items-start gap-2 text-[11px] text-[#68766D]">
            <Info className="w-4 h-4 text-[#245C43] shrink-0 mt-0.5" />
            <p>
              This enquiry will be recorded in the direct marketplace without intermediaries. 
              The farmer ({listing.sellerName}) will review your offer terms and can accept or contact you directly.
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
              <Tag className="w-4 h-4" />
              <span>Submit Direct Offer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
