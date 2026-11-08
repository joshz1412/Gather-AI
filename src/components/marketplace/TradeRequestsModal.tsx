import React, { useState } from 'react';
import { 
  X, 
  Tag, 
  ShoppingBag, 
  Wheat, 
  Package, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Truck, 
  Phone, 
  MapPin, 
  Building2, 
  User, 
  ArrowRight,
  Filter
} from 'lucide-react';
import { TradeRequest, TradeRequestStatus } from '../../types';

interface TradeRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  requests: TradeRequest[];
  onUpdateStatus: (requestId: string, status: TradeRequestStatus, notes?: string) => void;
  currentUserId?: string;
}

export const TradeRequestsModal: React.FC<TradeRequestsModalProps> = ({
  isOpen,
  onClose,
  requests,
  onUpdateStatus,
  currentUserId = 'user-current',
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'outgoing' | 'incoming'>('all');

  if (!isOpen) return null;

  const outgoingRequests = requests.filter(
    (r) => r.buyerId === currentUserId || r.buyerId === 'user-ramesh-patil'
  );
  const incomingRequests = requests.filter(
    (r) => r.sellerId === currentUserId || r.sellerId === 'user-ramesh-patil'
  );

  const displayedRequests = 
    filterTab === 'outgoing' 
      ? outgoingRequests 
      : filterTab === 'incoming' 
        ? incomingRequests 
        : requests;

  const getStatusBadge = (status: TradeRequestStatus) => {
    switch (status) {
      case 'Accepted':
        return 'bg-[#EAF1E7] text-[#245C43] border-[#85B96F]/40';
      case 'Under Review':
        return 'bg-[#E0F2FE] text-[#075985] border-[#BAE6FD]';
      case 'Submitted':
        return 'bg-[#FEF3C7] text-[#92400E] border-[#FCD34D]';
      case 'Declined':
        return 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]';
      case 'Completed':
        return 'bg-[#D7E8A3] text-[#183E2E] border-[#85B96F]/50';
      case 'Cancelled':
        return 'bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]';
      default:
        return 'bg-[#F8F8F2] text-[#1D2922] border-[#E2E8DF]';
    }
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
              <Tag className="w-3.5 h-3.5" />
              <span>Direct Trade Transaction Ledger</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-[#183E2E]">
              My Enquiries & Trade Offers
            </h2>
            <p className="text-xs text-[#68766D] mt-1">
              Track your outgoing fertilizer purchase requests and review incoming buyer offers for your produce.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white border border-[#E2E8DF] hover:bg-[#F8F8F2] text-[#68766D] flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Filters */}
        <div className="px-6 py-3 bg-[#F8F8F2] border-b border-[#E2E8DF] flex items-center gap-2 overflow-x-auto text-xs">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
              filterTab === 'all'
                ? 'bg-[#245C43] text-white'
                : 'bg-white text-[#68766D] hover:text-[#183E2E] border border-[#E2E8DF]'
            }`}
          >
            All Activity ({requests.length})
          </button>

          <button
            onClick={() => setFilterTab('outgoing')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
              filterTab === 'outgoing'
                ? 'bg-[#245C43] text-white'
                : 'bg-white text-[#68766D] hover:text-[#183E2E] border border-[#E2E8DF]'
            }`}
          >
            My Purchases & Inquiries ({outgoingRequests.length})
          </button>

          <button
            onClick={() => setFilterTab('incoming')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
              filterTab === 'incoming'
                ? 'bg-[#245C43] text-white'
                : 'bg-white text-[#68766D] hover:text-[#183E2E] border border-[#E2E8DF]'
            }`}
          >
            Offers Received on My Produce ({incomingRequests.length})
          </button>
        </div>

        {/* Request List Body */}
        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          {displayedRequests.length === 0 ? (
            <div className="text-center py-12 bg-[#FAFAF7] rounded-3xl border border-dashed border-[#E2E8DF]">
              <Tag className="w-10 h-10 text-[#68766D]/40 mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#183E2E]">No trade records in this view</p>
              <p className="text-xs text-[#68766D] mt-1">
                Enquire about fertilizer products or list your produce to start direct trading.
              </p>
            </div>
          ) : (
            displayedRequests.map((req) => {
              const isUserSeller = req.sellerId === currentUserId || req.sellerId === 'user-ramesh-patil';
              const isUserBuyer = req.buyerId === currentUserId || req.buyerId === 'user-ramesh-patil';

              return (
                <div
                  key={req.id}
                  className="bg-white border border-[#E2E8DF] hover:border-[#85B96F]/60 rounded-2xl p-5 shadow-2xs transition-all space-y-3.5"
                >
                  {/* Top Meta Line */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EAF1E7] text-[#245C43]">
                        {req.type === 'fertilizer_purchase_enquiry' ? (
                          <>
                            <ShoppingBag className="w-3 h-3" />
                            <span>Fertilizer Purchase Request</span>
                          </>
                        ) : (
                          <>
                            <Wheat className="w-3 h-3" />
                            <span>Produce Trade Offer</span>
                          </>
                        )}
                      </span>

                      <span className="text-[11px] text-[#68766D]">
                        {req.createdAt}
                      </span>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(req.status)}`}>
                      {req.status}
                    </span>
                  </div>

                  {/* Title & Parties */}
                  <div>
                    <h3 className="text-base font-heading font-bold text-[#183E2E]">
                      {req.targetTitle}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#68766D] mt-1">
                      <span>Buyer: <strong className="text-[#183E2E]">{req.buyerName}</strong> ({req.buyerLocation})</span>
                      <span>→</span>
                      <span>Seller: <strong className="text-[#183E2E]">{req.sellerName}</strong></span>
                    </div>
                  </div>

                  {/* Deal Metrics Strip */}
                  <div className="bg-[#F8F8F2] rounded-xl p-3 border border-[#E2E8DF] grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div>
                      <span className="text-[#68766D] text-[11px] block">Requested Quantity</span>
                      <strong className="text-[#183E2E] text-sm font-heading">
                        {req.requestedQuantity} {req.quantityUnit}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[#68766D] text-[11px] block">Offered / Unit Rate</span>
                      <strong className="text-[#183E2E] text-sm font-heading">
                        ₹{req.offeredPricePerUnit} {req.priceUnit.replace('₹', '')}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[#68766D] text-[11px] block">Total Estimated Value</span>
                      <strong className="text-[#245C43] text-sm font-heading">
                        ₹{req.estimatedTotalValue?.toLocaleString('en-IN') || (req.requestedQuantity * (req.offeredPricePerUnit || 0)).toLocaleString('en-IN')}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[#68766D] text-[11px] block">Logistics Terms</span>
                      <strong className="text-[#183E2E] text-xs">
                        {req.preferredLogistics}
                      </strong>
                    </div>
                  </div>

                  {/* User Message */}
                  {req.message && (
                    <div className="bg-[#FAFAF7] rounded-xl p-3 border border-[#E2E8DF] text-xs text-[#1D2922]">
                      <span className="font-bold text-[#68766D] text-[10px] block uppercase tracking-wider mb-0.5">
                        Enquiry Message:
                      </span>
                      <p className="italic">"{req.message}"</p>
                    </div>
                  )}

                  {/* Status Notes / Timeline */}
                  {req.statusNotes && (
                    <div className="flex items-start gap-1.5 text-xs text-[#245C43] bg-[#EAF1E7]/60 p-2.5 rounded-xl border border-[#85B96F]/30">
                      <Clock className="w-3.5 h-3.5 text-[#245C43] shrink-0 mt-0.5" />
                      <span>{req.statusNotes}</span>
                    </div>
                  )}

                  {/* Interactive Status Actions */}
                  <div className="pt-2 border-t border-[#E2E8DF] flex flex-wrap items-center justify-between gap-2">
                    <div className="text-[11px] text-[#68766D]">
                      {isUserSeller ? (
                        <span>You are the seller for this lot</span>
                      ) : (
                        <span>You submitted this purchase enquiry</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Seller Controls for incoming offers */}
                      {isUserSeller && req.status !== 'Accepted' && req.status !== 'Declined' && req.status !== 'Completed' && (
                        <>
                          <button
                            type="button"
                            onClick={() => onUpdateStatus(req.id, 'Declined', 'Offer declined by seller.')}
                            className="px-3 py-1.5 rounded-xl border border-[#B94C3D] hover:bg-[#FEE2E2] text-[#B94C3D] text-xs font-bold transition-colors cursor-pointer"
                          >
                            Decline Offer
                          </button>

                          <button
                            type="button"
                            onClick={() => onUpdateStatus(req.id, 'Accepted', `Accepted by ${req.sellerName}. Terms confirmed for direct dispatch.`)}
                            className="px-4 py-1.5 rounded-xl bg-[#245C43] hover:bg-[#183E2E] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Accept Offer</span>
                          </button>
                        </>
                      )}

                      {/* Complete trade action once accepted */}
                      {isUserSeller && req.status === 'Accepted' && (
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(req.id, 'Completed', 'Direct transaction completed successfully.')}
                          className="px-4 py-1.5 rounded-xl bg-[#183E2E] hover:bg-[#245C43] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                        >
                          Mark Completed
                        </button>
                      )}

                      {/* Buyer cancellation action */}
                      {isUserBuyer && (req.status === 'Submitted' || req.status === 'Under Review') && (
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(req.id, 'Cancelled', 'Cancelled by buyer.')}
                          className="px-3 py-1.5 rounded-xl border border-[#E2E8DF] hover:bg-[#FEE2E2] hover:border-[#B94C3D] text-[#68766D] hover:text-[#B94C3D] text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Cancel Request
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#FAFAF7] border-t border-[#E2E8DF] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#245C43] hover:bg-[#183E2E] text-xs font-bold text-white transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
