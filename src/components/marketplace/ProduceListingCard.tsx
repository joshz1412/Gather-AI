import React from 'react';
import { 
  Sprout, 
  MapPin, 
  Truck, 
  Tag, 
  Clock, 
  User, 
  Edit3, 
  CheckCircle, 
  PauseCircle, 
  Trash2, 
  ArrowRight, 
  Wheat, 
  ShoppingBag,
  Info
} from 'lucide-react';
import { ProduceListing } from '../../types';

interface ProduceListingCardProps {
  listing: ProduceListing;
  isOwner: boolean;
  onViewDetails: (listing: ProduceListing) => void;
  onMakeOffer: (listing: ProduceListing) => void;
  onEditListing?: (listing: ProduceListing) => void;
  onToggleStatus?: (listing: ProduceListing) => void;
  onDeleteListing?: (listingId: string) => void;
}

export const ProduceListingCard: React.FC<ProduceListingCardProps> = ({
  listing,
  isOwner,
  onViewDetails,
  onMakeOffer,
  onEditListing,
  onToggleStatus,
  onDeleteListing,
}) => {
  const getStatusBadge = () => {
    switch (listing.availabilityStatus) {
      case 'Ready for Collection':
        return 'bg-[#EAF1E7] text-[#245C43] border-[#85B96F]/30';
      case 'Harvest in Progress':
        return 'bg-[#FEF3C7] text-[#92400E] border-[#FCD34D]';
      case 'Standing Crop (Ready in 7-14 Days)':
        return 'bg-[#E0F2FE] text-[#075985] border-[#BAE6FD]';
      case 'Sold Out':
        return 'bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]';
      case 'Paused':
        return 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]';
      default:
        return 'bg-[#F8F8F2] text-[#1D2922] border-[#E2E8DF]';
    }
  };

  return (
    <div className={`bg-white border rounded-3xl p-5 sm:p-6 transition-all duration-200 shadow-2xs hover:shadow-md flex flex-col justify-between group ${
      listing.status === 'Sold' ? 'opacity-70 bg-[#FAFAF7]' : 'hover:border-[#85B96F]/70 border-[#E2E8DF]'
    }`}>
      <div>
        {/* Top Badges */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="px-2.5 py-1 rounded-full bg-[#EAF1E7] text-[#245C43] text-[11px] font-bold inline-flex items-center gap-1">
              <Wheat className="w-3 h-3 text-[#245C43]" />
              {listing.category}
            </span>

            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge()}`}>
              {listing.availabilityStatus}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isOwner && (
              <span className="text-[10px] font-bold bg-[#D7E8A3] text-[#183E2E] px-2 py-0.5 rounded-full">
                My Listing
              </span>
            )}
            <span className="text-[10px] font-medium text-[#68766D] bg-[#F8F8F2] px-2 py-0.5 rounded-full border border-[#E2E8DF]">
              Simulated
            </span>
          </div>
        </div>

        {/* Commodity Name & Variety */}
        <div>
          <h3 className="font-heading font-bold text-lg text-[#183E2E] group-hover:text-[#245C43] transition-colors leading-snug">
            {listing.commodityName}
          </h3>
          {listing.variety && (
            <span className="text-xs font-semibold text-[#245C43] block mt-0.5">
              Variety: {listing.variety}
            </span>
          )}
        </div>

        {/* Farmer & Location */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#68766D] mt-2 mb-3">
          <span className="font-semibold text-[#183E2E] flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-[#245C43]" />
            {listing.sellerName}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-[#68766D]" />
            {listing.location}
          </span>
        </div>

        {/* Price & Quantity Box */}
        <div className="bg-[#F8F8F2] rounded-2xl p-3.5 border border-[#E2E8DF] mb-4">
          <div className="flex items-baseline justify-between gap-2">
            <div>
              <span className="text-[11px] text-[#68766D] block font-medium">Asking Price</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-heading font-black text-[#183E2E]">
                  ₹{listing.askingPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-semibold text-[#68766D]">
                  {listing.priceUnit.replace('₹', '')}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-[#68766D] block font-medium">Available Quantity</span>
              <span className="text-sm font-heading font-bold text-[#245C43]">
                {listing.quantity} {listing.unit}
              </span>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-[#E2E8DF]/70 flex items-center justify-between text-[11px] text-[#68766D]">
            <span>
              {listing.isNegotiable ? (
                <span className="text-[#245C43] font-semibold">✓ Price Negotiable for bulk</span>
              ) : (
                <span>Fixed Farmgate Rate</span>
              )}
            </span>
            {listing.grade && (
              <span className="font-semibold text-[#183E2E]">Grade: {listing.grade}</span>
            )}
          </div>
        </div>

        {/* Description Snippet */}
        <p className="text-xs text-[#68766D] line-clamp-2 leading-relaxed mb-4">
          {listing.description}
        </p>

        {/* Logistics Term */}
        <div className="flex items-center gap-1.5 text-[11px] text-[#245C43] bg-[#EAF1E7]/70 p-2.5 rounded-xl border border-[#85B96F]/20 mb-4">
          <Truck className="w-3.5 h-3.5 shrink-0 text-[#245C43]" />
          <span className="line-clamp-1">{listing.pickupOrDelivery}</span>
        </div>
      </div>

      {/* Card Actions */}
      <div className="pt-3 border-t border-[#E2E8DF] flex items-center gap-2">
        {isOwner ? (
          <>
            <button
              onClick={() => onEditListing?.(listing)}
              className="flex-1 py-2 px-3 rounded-xl border border-[#E2E8DF] hover:border-[#245C43] text-xs font-bold text-[#183E2E] hover:bg-[#F8F8F2] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>

            <button
              onClick={() => onToggleStatus?.(listing)}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                listing.status === 'Sold'
                  ? 'bg-[#EAF1E7] text-[#245C43] hover:bg-[#D7E8A3]'
                  : 'bg-[#F8F8F2] border border-[#E2E8DF] text-[#68766D] hover:bg-[#E2E8DF]'
              }`}
            >
              {listing.status === 'Sold' ? 'Reactivate' : 'Mark Sold'}
            </button>

            {onDeleteListing && (
              <button
                onClick={() => {
                  if (confirm(`Delete listing for ${listing.commodityName}?`)) {
                    onDeleteListing(listing.id);
                  }
                }}
                className="w-8 h-8 rounded-xl border border-[#E2E8DF] hover:border-[#B94C3D] hover:bg-[#FEE2E2] text-[#B94C3D] flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="Delete listing"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </>
        ) : (
          <>
            <button
              onClick={() => onViewDetails(listing)}
              className="flex-1 py-2 px-3 rounded-xl border border-[#E2E8DF] hover:border-[#245C43] text-xs font-bold text-[#183E2E] hover:bg-[#F8F8F2] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Info className="w-3.5 h-3.5" />
              <span>View Details</span>
            </button>

            <button
              onClick={() => onMakeOffer(listing)}
              className="flex-1 py-2 px-3 rounded-xl bg-[#245C43] hover:bg-[#183E2E] text-xs font-bold text-white transition-all shadow-2xs hover:shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Make an Offer</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
