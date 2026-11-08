import React from 'react';
import { 
  X, 
  Wheat, 
  MapPin, 
  Truck, 
  User, 
  Calendar, 
  Clock, 
  Package, 
  Tag, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  Edit3 
} from 'lucide-react';
import { ProduceListing } from '../../types';

interface ProduceDetailModalProps {
  listing: ProduceListing | null;
  isOwner: boolean;
  isOpen: boolean;
  onClose: () => void;
  onMakeOffer: (listing: ProduceListing) => void;
  onEditListing?: (listing: ProduceListing) => void;
}

export const ProduceDetailModal: React.FC<ProduceDetailModalProps> = ({
  listing,
  isOwner,
  isOpen,
  onClose,
  onMakeOffer,
  onEditListing,
}) => {
  if (!isOpen || !listing) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full border border-[#E2E8DF] shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
      >
        {/* Modal Header */}
        <div className="p-6 bg-[#FAFAF7] border-b border-[#E2E8DF] flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-full bg-[#EAF1E7] text-[#245C43] text-xs font-bold inline-flex items-center gap-1.5">
                <Wheat className="w-3.5 h-3.5" />
                {listing.category}
              </span>

              <span className="text-[10px] font-semibold text-[#68766D] bg-white px-2 py-0.5 rounded-full border border-[#E2E8DF]">
                {listing.availabilityStatus}
              </span>

              {isOwner && (
                <span className="text-[10px] font-bold bg-[#D7E8A3] text-[#183E2E] px-2 py-0.5 rounded-full">
                  Your Listing
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-[#183E2E] leading-snug">
              {listing.commodityName}
            </h2>

            {listing.variety && (
              <span className="text-sm font-semibold text-[#245C43] block mt-0.5">
                Variety / Cultivar: {listing.variety}
              </span>
            )}

            <div className="flex flex-wrap items-center gap-3 text-xs text-[#68766D] mt-2">
              <span className="font-semibold text-[#183E2E] flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-[#245C43]" />
                {listing.sellerName} ({listing.sellerRole || 'Farmer'})
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {listing.location}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white border border-[#E2E8DF] hover:bg-[#F8F8F2] text-[#68766D] flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Price & Quantity Summary Box */}
          <div className="bg-[#F8F8F2] rounded-2xl p-4 sm:p-5 border border-[#E2E8DF]">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-[#68766D] block font-medium">Asking Price</span>
                <span className="text-xl font-heading font-black text-[#183E2E]">
                  ₹{listing.askingPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-[#68766D] block font-semibold">
                  {listing.priceUnit.replace('₹', '')}
                </span>
              </div>

              <div>
                <span className="text-[#68766D] block font-medium">Available Lot</span>
                <strong className="text-base font-heading font-bold text-[#245C43] block mt-1">
                  {listing.quantity} {listing.unit}
                </strong>
              </div>

              <div>
                <span className="text-[#68766D] block font-medium">Pricing Terms</span>
                <strong className="text-xs text-[#183E2E] block mt-1">
                  {listing.isNegotiable ? 'Negotiable for volume' : 'Fixed farmgate price'}
                </strong>
              </div>

              <div>
                <span className="text-[#68766D] block font-medium">Min Order Qty</span>
                <strong className="text-xs text-[#183E2E] block mt-1">
                  {listing.minOrderQuantity || 1} {listing.unit}
                </strong>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#245C43] mb-2">
              Commodity Specifications & Description
            </h4>
            <p className="text-sm text-[#1D2922] leading-relaxed bg-[#FAFAF7] p-4 rounded-2xl border border-[#E2E8DF]">
              {listing.description}
            </p>
          </div>

          {/* Condition & Packaging Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {listing.grade && (
              <div className="bg-[#EAF1E7]/50 rounded-xl p-3 border border-[#85B96F]/30">
                <span className="text-[11px] font-bold text-[#245C43] block mb-0.5">
                  Quality Grade / Classification
                </span>
                <strong className="text-[#183E2E]">{listing.grade}</strong>
              </div>
            )}

            {listing.condition && (
              <div className="bg-[#EAF1E7]/50 rounded-xl p-3 border border-[#85B96F]/30">
                <span className="text-[11px] font-bold text-[#245C43] block mb-0.5">
                  Lot Condition & Sorting
                </span>
                <strong className="text-[#183E2E]">{listing.condition}</strong>
              </div>
            )}

            {listing.packaging && (
              <div className="bg-[#FAFAF7] rounded-xl p-3 border border-[#E2E8DF]">
                <span className="text-[11px] font-bold text-[#68766D] block mb-0.5">
                  Packaging Specifications
                </span>
                <strong className="text-[#183E2E]">{listing.packaging}</strong>
              </div>
            )}

            <div className="bg-[#FAFAF7] rounded-xl p-3 border border-[#E2E8DF]">
              <span className="text-[11px] font-bold text-[#68766D] block mb-0.5">
                Availability Timing
              </span>
              <strong className="text-[#183E2E]">
                {listing.availabilityStatus} ({listing.availabilityDate})
              </strong>
            </div>
          </div>

          {/* Logistics Terms */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#245C43] flex items-center gap-1.5 mb-2">
              <Truck className="w-3.5 h-3.5 text-[#245C43]" />
              Pickup & Transport Arrangement
            </h4>
            <p className="text-xs text-[#1D2922] bg-[#FAFAF7] p-3 rounded-xl border border-[#E2E8DF]">
              {listing.pickupOrDelivery}
            </p>
          </div>

          {/* Farmer Contact Info */}
          <div className="border-t border-[#E2E8DF] pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#68766D] mb-2">
              Farmer Direct Contact
            </h4>
            <div className="bg-[#FAFAF7] rounded-xl p-3 border border-[#E2E8DF] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <strong className="text-[#183E2E] block">{listing.sellerName}</strong>
                <span className="text-[11px] text-[#68766D]">{listing.sellerLocation}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#245C43]">
                <Phone className="w-3.5 h-3.5" />
                <span>{listing.sellerPhone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 bg-[#FAFAF7] border-t border-[#E2E8DF] flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-[#68766D]">
            Direct transaction request. No mandi middleman commission.
          </span>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-[#E2E8DF] hover:bg-[#F8F8F2] text-xs font-semibold text-[#68766D] transition-colors cursor-pointer"
            >
              Close
            </button>

            {isOwner ? (
              <button
                onClick={() => {
                  onClose();
                  onEditListing?.(listing);
                }}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-[#245C43] hover:bg-[#183E2E] text-xs font-bold text-white transition-all shadow-xs hover:shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Your Listing</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onMakeOffer(listing);
                }}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-[#245C43] hover:bg-[#183E2E] text-xs font-bold text-white transition-all shadow-xs hover:shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Tag className="w-4 h-4" />
                <span>Make an Offer / Enquire</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
