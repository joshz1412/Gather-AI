import React from 'react';
import { 
  Building2, 
  MapPin, 
  Truck, 
  Package, 
  ShoppingBag, 
  Info, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';
import { FertilizerProduct } from '../../types';

interface FertilizerProductCardProps {
  product: FertilizerProduct;
  onViewDetails: (product: FertilizerProduct) => void;
  onRequestPurchase: (product: FertilizerProduct) => void;
}

export const FertilizerProductCard: React.FC<FertilizerProductCardProps> = ({
  product,
  onViewDetails,
  onRequestPurchase,
}) => {
  return (
    <div className="bg-white border border-[#E2E8DF] hover:border-[#85B96F]/70 rounded-3xl p-5 sm:p-6 transition-all duration-200 shadow-2xs hover:shadow-md flex flex-col justify-between group">
      <div>
        {/* Top Badges */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EAF1E7] text-[#245C43] text-[11px] font-bold">
            <Package className="w-3 h-3 text-[#245C43]" />
            <span>{product.category}</span>
          </span>

          <div className="flex items-center gap-1">
            <span className="text-[10px] font-semibold text-[#68766D] bg-[#F8F8F2] px-2 py-0.5 rounded-full border border-[#E2E8DF]">
              Simulated Demo
            </span>
          </div>
        </div>

        {/* Product Name */}
        <h3 className="font-heading font-bold text-lg text-[#183E2E] group-hover:text-[#245C43] transition-colors leading-snug">
          {product.name}
        </h3>

        {/* Company & Location */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#68766D] mt-1.5 mb-3">
          <span className="font-semibold text-[#183E2E] flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-[#245C43]" />
            {product.companyName}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-[#68766D]" />
            {product.location}
          </span>
        </div>

        {/* Price & Packaging Pill */}
        <div className="bg-[#F8F8F2] rounded-2xl p-3.5 border border-[#E2E8DF] mb-4">
          <div className="flex items-baseline justify-between gap-2">
            <div>
              <span className="text-[11px] text-[#68766D] block font-medium">Ex-Factory Price</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-heading font-black text-[#183E2E]">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-semibold text-[#68766D]">
                  {product.priceUnit.replace('₹', '')}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-[#68766D] block font-medium">Packaging</span>
              <span className="text-xs font-bold text-[#183E2E]">
                {product.packagingSize}
              </span>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-[#E2E8DF]/70 flex items-center justify-between text-[11px] text-[#68766D]">
            <span>Available: <strong className="text-[#245C43]">{product.availableQuantity} {product.quantityUnit}</strong></span>
            {product.minOrderQuantity && (
              <span>Min order: <strong>{product.minOrderQuantity} {product.quantityUnit}</strong></span>
            )}
          </div>
        </div>

        {/* Description Snippet */}
        <p className="text-xs text-[#68766D] line-clamp-2 leading-relaxed mb-4">
          {product.description}
        </p>

        {/* Logistics Term */}
        <div className="flex items-start gap-1.5 text-[11px] text-[#245C43] bg-[#EAF1E7]/70 p-2.5 rounded-xl border border-[#85B96F]/20 mb-4">
          <Truck className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#245C43]" />
          <span className="line-clamp-1">{product.deliveryOptions}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-[#E2E8DF] flex items-center gap-2">
        <button
          onClick={() => onViewDetails(product)}
          className="flex-1 py-2 px-3 rounded-xl border border-[#E2E8DF] hover:border-[#245C43] text-xs font-bold text-[#183E2E] hover:bg-[#F8F8F2] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Info className="w-3.5 h-3.5" />
          <span>View Details</span>
        </button>

        <button
          onClick={() => onRequestPurchase(product)}
          className="flex-1 py-2 px-3 rounded-xl bg-[#245C43] hover:bg-[#183E2E] text-xs font-bold text-white transition-all shadow-2xs hover:shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Request Purchase</span>
        </button>
      </div>
    </div>
  );
};
