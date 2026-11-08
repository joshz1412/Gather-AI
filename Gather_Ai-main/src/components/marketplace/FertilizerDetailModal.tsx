import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  MapPin, 
  Package, 
  Truck, 
  Phone, 
  Mail, 
  FileText, 
  ShieldCheck, 
  ShoppingBag, 
  Sprout, 
  Minus, 
  Plus, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { FertilizerProduct } from '../../types';

interface FertilizerDetailModalProps {
  product: FertilizerProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onRequestPurchase: (product: FertilizerProduct, quantity: number) => void;
}

export const FertilizerDetailModal: React.FC<FertilizerDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onRequestPurchase,
}) => {
  const [orderQuantity, setOrderQuantity] = useState<number>(10);

  React.useEffect(() => {
    if (product) {
      setOrderQuantity(product.minOrderQuantity || 5);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const minQty = product.minOrderQuantity || 1;
  const maxQty = product.availableQuantity || 1000;
  const estimatedCost = orderQuantity * product.price;

  const handleIncrement = () => {
    if (orderQuantity < maxQty) {
      setOrderQuantity((prev) => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (orderQuantity > minQty) {
      setOrderQuantity((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full border border-[#E2E8DF] shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-labelledby="modal-title"
      >
        {/* Modal Header */}
        <div className="p-6 bg-[#FAFAF7] border-b border-[#E2E8DF] flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-full bg-[#EAF1E7] text-[#245C43] text-xs font-bold inline-flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5" />
                {product.category}
              </span>
              <span className="text-[10px] font-semibold text-[#68766D] bg-white px-2 py-0.5 rounded-full border border-[#E2E8DF]">
                Simulated Demo Partner
              </span>
            </div>

            <h2 id="modal-title" className="text-xl sm:text-2xl font-heading font-extrabold text-[#183E2E] leading-snug">
              {product.name}
            </h2>

            <div className="flex flex-wrap items-center gap-3 text-xs text-[#68766D] mt-1.5">
              <span className="font-semibold text-[#183E2E] flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-[#245C43]" />
                {product.companyName}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {product.location} ({product.state})
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white border border-[#E2E8DF] hover:bg-[#F8F8F2] text-[#68766D] flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Pricing & Stock Card */}
          <div className="bg-[#F8F8F2] rounded-2xl p-4 sm:p-5 border border-[#E2E8DF]">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-[#68766D] block font-medium">Unit Price</span>
                <span className="text-xl font-heading font-black text-[#183E2E]">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-[#68766D] block font-semibold">
                  {product.priceUnit.replace('₹', '')}
                </span>
              </div>

              <div>
                <span className="text-[#68766D] block font-medium">Packaging Format</span>
                <strong className="text-sm text-[#183E2E] block mt-1">
                  {product.packagingSize}
                </strong>
              </div>

              <div>
                <span className="text-[#68766D] block font-medium">Available Inventory</span>
                <strong className="text-sm text-[#245C43] block mt-1">
                  {product.availableQuantity} {product.quantityUnit}
                </strong>
              </div>

              <div>
                <span className="text-[#68766D] block font-medium">Minimum Order</span>
                <strong className="text-sm text-[#183E2E] block mt-1">
                  {product.minOrderQuantity || 1} {product.quantityUnit}
                </strong>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#245C43] mb-2">
              Product Overview
            </h4>
            <p className="text-sm text-[#1D2922] leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Composition & Nutrient Profile */}
          {product.compositionDetails && (
            <div className="bg-[#EAF1E7]/50 rounded-2xl p-4 border border-[#85B96F]/30">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#183E2E] flex items-center gap-1.5 mb-2">
                <FileText className="w-3.5 h-3.5 text-[#245C43]" />
                Nutrient Composition & Lab Analysis
              </h4>
              <p className="text-xs text-[#245C43] font-mono leading-relaxed bg-white/70 p-3 rounded-xl border border-[#85B96F]/20">
                {product.compositionDetails}
              </p>
              <span className="text-[10px] text-[#68766D] block mt-2">
                * Note: Test figures reflect average lab batch analysis provided by the manufacturer.
              </span>
            </div>
          )}

          {/* Intended Agronomic Use */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#245C43] flex items-center gap-1.5 mb-2">
              <Sprout className="w-3.5 h-3.5 text-[#245C43]" />
              Recommended Agronomic Application
            </h4>
            <div className="bg-[#FAFAF7] rounded-xl p-3 border border-[#E2E8DF] text-xs text-[#1D2922] leading-relaxed">
              {product.intendedUse}
            </div>
          </div>

          {/* Delivery & Logistics */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#245C43] flex items-center gap-1.5 mb-2">
              <Truck className="w-3.5 h-3.5 text-[#245C43]" />
              Fulfillment & Dispatch Terms
            </h4>
            <p className="text-xs text-[#1D2922] bg-[#FAFAF7] p-3 rounded-xl border border-[#E2E8DF]">
              {product.deliveryOptions}
            </p>
          </div>

          {/* Seller Coordinator Contacts */}
          <div className="border-t border-[#E2E8DF] pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#68766D] mb-2">
              Direct Seller Contact (No Intermediary)
            </h4>
            <div className="bg-[#FAFAF7] rounded-xl p-3 border border-[#E2E8DF] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <strong className="text-[#183E2E] block">
                  {product.contactCoordinator || 'Facility Dispatch Coordinator'}
                </strong>
                <span className="text-[11px] text-[#68766D]">{product.companyName}</span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-[#245C43]">
                {product.contactPhone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#245C43]" />
                    {product.contactPhone}
                  </span>
                )}
                {product.contactEmail && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#245C43]" />
                    {product.contactEmail}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Direct Purchase Quantity Calculator */}
          <div className="bg-[#245C43]/5 rounded-2xl p-4 sm:p-5 border border-[#245C43]/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[#183E2E] block mb-1">
                  Requested Order Quantity
                </span>
                <span className="text-[11px] text-[#68766D]">
                  Min: {minQty} {product.quantityUnit} • Available: {maxQty} {product.quantityUnit}
                </span>
              </div>

              {/* Quantity Counter */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleDecrement}
                  disabled={orderQuantity <= minQty}
                  className="w-9 h-9 rounded-xl bg-white border border-[#E2E8DF] hover:bg-[#F8F8F2] disabled:opacity-40 text-[#183E2E] flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <div className="min-w-[70px] text-center">
                  <span className="text-lg font-heading font-bold text-[#183E2E]">
                    {orderQuantity}
                  </span>
                  <span className="text-[10px] text-[#68766D] block font-semibold">
                    {product.quantityUnit}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleIncrement}
                  disabled={orderQuantity >= maxQty}
                  className="w-9 h-9 rounded-xl bg-white border border-[#E2E8DF] hover:bg-[#F8F8F2] disabled:opacity-40 text-[#183E2E] flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Total Calculation Row */}
            <div className="mt-4 pt-3 border-t border-[#245C43]/15 flex items-baseline justify-between">
              <div>
                <span className="text-xs text-[#68766D]">Estimated Order Value</span>
                <span className="text-[10px] text-[#68766D] block">
                  Ex-factory cost (transport confirmed upon enquiry)
                </span>
              </div>
              <div className="text-right">
                <span className="text-xl font-heading font-black text-[#183E2E]">
                  ₹{estimatedCost.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 bg-[#FAFAF7] border-t border-[#E2E8DF] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-[#68766D] text-center sm:text-left">
            <span>Direct trade enquiry. No broker fee or hidden commission.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-[#E2E8DF] hover:bg-[#F8F8F2] text-xs font-semibold text-[#68766D] transition-colors cursor-pointer"
            >
              Close
            </button>

            <button
              onClick={() => {
                onRequestPurchase(product, orderQuantity);
              }}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-[#245C43] hover:bg-[#183E2E] text-xs font-bold text-white transition-all shadow-xs hover:shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Submit Purchase Request</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
