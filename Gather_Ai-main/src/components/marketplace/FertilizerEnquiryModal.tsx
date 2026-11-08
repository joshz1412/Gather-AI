import React, { useState } from 'react';
import { 
  X, 
  ShoppingBag, 
  Building2, 
  MapPin, 
  Truck, 
  Phone, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Info 
} from 'lucide-react';
import { FertilizerProduct, TradeRequest, UserProfile } from '../../types';

interface FertilizerEnquiryModalProps {
  product: FertilizerProduct | null;
  initialQuantity?: number;
  isOpen: boolean;
  onClose: () => void;
  onSaveRequest: (request: TradeRequest) => void;
  userProfile?: UserProfile;
}

export const FertilizerEnquiryModal: React.FC<FertilizerEnquiryModalProps> = ({
  product,
  initialQuantity = 10,
  isOpen,
  onClose,
  onSaveRequest,
  userProfile,
}) => {
  const [quantity, setQuantity] = useState<number>(initialQuantity);
  const [buyerName, setBuyerName] = useState(userProfile?.fullName || 'Ramesh Patil');
  const [buyerPhone, setBuyerPhone] = useState(userProfile?.phone || '+91 98220 55184');
  const [buyerLocation, setBuyerLocation] = useState(userProfile?.location || 'Nashik APMC Mandi, Maharashtra');
  const [preferredLogistics, setPreferredLogistics] = useState<'Delivery by Seller' | 'Pickup by Buyer' | 'Third-party Logistics'>('Delivery by Seller');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (product) {
      setQuantity(initialQuantity || product.minOrderQuantity || 5);
      if (userProfile?.fullName) setBuyerName(userProfile.fullName);
      if (userProfile?.phone) setBuyerPhone(userProfile.phone);
      if (userProfile?.location) setBuyerLocation(userProfile.location);
    }
  }, [product, initialQuantity, userProfile]);

  if (!isOpen || !product) return null;

  const estimatedValue = quantity * product.price;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!quantity || quantity <= 0) {
      newErrors.quantity = 'Please enter a valid quantity.';
    } else if (product.minOrderQuantity && quantity < product.minOrderQuantity) {
      newErrors.quantity = `Minimum order quantity is ${product.minOrderQuantity} ${product.quantityUnit}.`;
    } else if (quantity > product.availableQuantity) {
      newErrors.quantity = `Available inventory is ${product.availableQuantity} ${product.quantityUnit}.`;
    }

    if (!buyerName.trim()) {
      newErrors.buyerName = 'Contact name is required.';
    }

    if (!buyerPhone.trim()) {
      newErrors.buyerPhone = 'Contact phone number is required.';
    }

    if (!buyerLocation.trim()) {
      newErrors.buyerLocation = 'Delivery / farm location is required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newRequest: TradeRequest = {
      id: `trade-req-${Date.now()}`,
      type: 'fertilizer_purchase_enquiry',
      targetId: product.id,
      targetTitle: product.name,
      targetCategory: product.category,
      buyerId: 'user-current',
      buyerName: buyerName.trim(),
      buyerPhone: buyerPhone.trim(),
      buyerLocation: buyerLocation.trim(),
      sellerId: product.companyId,
      sellerName: product.companyName,
      sellerPhone: product.contactPhone,
      requestedQuantity: quantity,
      quantityUnit: product.quantityUnit,
      offeredPricePerUnit: product.price,
      priceUnit: product.priceUnit,
      estimatedTotalValue: estimatedValue,
      preferredLogistics,
      message: message.trim() || `Direct purchase request for ${quantity} ${product.quantityUnit} of ${product.name}.`,
      status: 'Submitted',
      statusNotes: `Enquiry submitted to ${product.companyName}. Coordinator: ${product.contactCoordinator || 'Logistics Desk'}.`,
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
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Direct Purchase Request</span>
            </div>
            <h2 className="text-xl font-heading font-extrabold text-[#183E2E]">
              {product.name}
            </h2>
            <div className="flex items-center gap-2 text-xs text-[#68766D] mt-1">
              <span className="font-semibold text-[#183E2E]">{product.companyName}</span>
              <span>•</span>
              <span>₹{product.price} {product.priceUnit.replace('₹', '')}</span>
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
          {/* Order Quantity Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#183E2E]">
                Order Quantity ({product.quantityUnit}) *
              </label>
              <span className="text-[11px] text-[#68766D]">
                Available: {product.availableQuantity} {product.quantityUnit}
              </span>
            </div>
            <div className="relative">
              <input
                type="number"
                min={product.minOrderQuantity || 1}
                max={product.availableQuantity}
                value={quantity || ''}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                className={`w-full px-3.5 py-2.5 bg-[#F8F8F2] border rounded-xl text-sm font-semibold text-[#1D2922] focus:bg-white transition-colors ${
                  errors.quantity ? 'border-[#B94C3D]' : 'border-[#E2E8DF] focus:border-[#245C43]'
                }`}
              />
              <span className="absolute right-3.5 top-2.5 text-xs font-bold text-[#68766D]">
                {product.packagingSize}
              </span>
            </div>
            {errors.quantity && (
              <p className="text-[11px] text-[#B94C3D] mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.quantity}
              </p>
            )}
          </div>

          {/* Pricing Estimation Pill */}
          <div className="bg-[#EAF1E7]/50 rounded-2xl p-3.5 border border-[#85B96F]/30 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-[#245C43] block">
                Estimated Ex-Factory Cost
              </span>
              <span className="text-[10px] text-[#68766D]">
                ({quantity} {product.quantityUnit} × ₹{product.price})
              </span>
            </div>
            <span className="text-lg font-heading font-black text-[#183E2E]">
              ₹{estimatedValue.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-xs font-bold text-[#183E2E] block mb-1">
                Your Full Name *
              </label>
              <input
                type="text"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder="Ramesh Patil"
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
                placeholder="+91 98220 55184"
                className={`w-full px-3.5 py-2 bg-[#F8F8F2] border rounded-xl text-xs text-[#1D2922] ${
                  errors.buyerPhone ? 'border-[#B94C3D]' : 'border-[#E2E8DF] focus:border-[#245C43]'
                }`}
              />
              {errors.buyerPhone && (
                <p className="text-[10px] text-[#B94C3D] mt-1">{errors.buyerPhone}</p>
              )}
            </div>
          </div>

          {/* Delivery Location */}
          <div>
            <label className="text-xs font-bold text-[#183E2E] block mb-1">
              Farmgate / Delivery Location *
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-[#68766D] absolute left-3 top-2.5" />
              <input
                type="text"
                value={buyerLocation}
                onChange={(e) => setBuyerLocation(e.target.value)}
                placeholder="Village / Taluka, District, State"
                className={`w-full pl-9 pr-3.5 py-2 bg-[#F8F8F2] border rounded-xl text-xs text-[#1D2922] ${
                  errors.buyerLocation ? 'border-[#B94C3D]' : 'border-[#E2E8DF] focus:border-[#245C43]'
                }`}
              />
            </div>
            {errors.buyerLocation && (
              <p className="text-[10px] text-[#B94C3D] mt-1">{errors.buyerLocation}</p>
            )}
          </div>

          {/* Preferred Logistics */}
          <div>
            <label className="text-xs font-bold text-[#183E2E] block mb-1">
              Preferred Logistics Arrangement
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              {[
                { id: 'Delivery by Seller', label: 'Delivery by Seller', sub: 'Truck to farm' },
                { id: 'Pickup by Buyer', label: 'Pickup by Buyer', sub: 'Own vehicle/tempo' },
                { id: 'Third-party Logistics', label: 'Third-party / Mandi', sub: 'Transporter lot' },
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

          {/* Message / Special Instructions */}
          <div>
            <label className="text-xs font-bold text-[#183E2E] block mb-1">
              Message or Specific Requirements (Optional)
            </label>
            <textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Need delivery before Friday for onion basal preparation. Can assist with unloading."
              className="w-full px-3.5 py-2 bg-[#F8F8F2] border border-[#E2E8DF] focus:border-[#245C43] rounded-xl text-xs text-[#1D2922]"
            />
          </div>

          {/* Transparent Notice */}
          <div className="bg-[#FAFAF7] rounded-xl p-3 border border-[#E2E8DF] flex items-start gap-2 text-[11px] text-[#68766D]">
            <Info className="w-4 h-4 text-[#245C43] shrink-0 mt-0.5" />
            <p>
              This is a direct purchase request submitted to <strong>{product.companyName}</strong>. 
              No payment is deducted through Gather AI. The company coordinator will verify dispatch 
              scheduling and confirm payment settlement terms directly.
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
              <ShoppingBag className="w-4 h-4" />
              <span>Confirm & Submit Request</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
