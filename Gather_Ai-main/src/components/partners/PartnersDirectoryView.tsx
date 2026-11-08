import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  Filter, 
  MapPin, 
  Truck, 
  Mail, 
  Phone, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  ShoppingBag, 
  Wheat, 
  Plus, 
  Tag, 
  Package, 
  RotateCcw, 
  Check, 
  ArrowRight,
  Info
} from 'lucide-react';
import { 
  MarketplaceMode, 
  FertilizerProduct, 
  ProduceListing, 
  TradeRequest, 
  TradeRequestStatus,
  UserProfile 
} from '../../types';
import { RECOVERY_PARTNERS_DATABASE } from '../../data/partnersDatabase';
import { formatQuantityKg } from '../../utils/matchingEngine';
import { 
  loadFertilizerProducts, 
  loadProduceListings, 
  saveProduceListings, 
  addProduceListing, 
  updateProduceListing, 
  deleteProduceListing, 
  loadTradeRequests, 
  addTradeRequest, 
  updateTradeRequestStatus 
} from '../../utils/marketplaceStorage';
import { logActivity } from '../../utils/storage';
import { interpretMarketplaceSearch } from '../../utils/marketplaceAiClient';
import { FertilizerProductCard } from '../marketplace/FertilizerProductCard';
import { FertilizerDetailModal } from '../marketplace/FertilizerDetailModal';
import { FertilizerEnquiryModal } from '../marketplace/FertilizerEnquiryModal';
import { ProduceListingCard } from '../marketplace/ProduceListingCard';
import { ProduceDetailModal } from '../marketplace/ProduceDetailModal';
import { ProduceOfferModal } from '../marketplace/ProduceOfferModal';
import { CreateProduceListingModal } from '../marketplace/CreateProduceListingModal';
import { TradeRequestsModal } from '../marketplace/TradeRequestsModal';

interface PartnersDirectoryViewProps {
  userProfile?: UserProfile;
  onShowToast?: (message: string) => void;
  initialMode?: MarketplaceMode;
}

export const PartnersDirectoryView: React.FC<PartnersDirectoryViewProps> = ({
  userProfile,
  onShowToast,
  initialMode = 'buy',
}) => {
  // Primary Marketplace Mode: BUY vs SELL vs RECOVER
  const [marketplaceMode, setMarketplaceMode] = useState<MarketplaceMode>(initialMode);

  // Data Collections
  const [fertilizerProducts, setFertilizerProducts] = useState<FertilizerProduct[]>([]);
  const [produceListings, setProduceListings] = useState<ProduceListing[]>([]);
  const [tradeRequests, setTradeRequests] = useState<TradeRequest[]>([]);

  // Search & Filters for BUY mode
  const [buySearchQuery, setBuySearchQuery] = useState('');
  const [buyCategoryFilter, setBuyCategoryFilter] = useState('all');
  const [buyLocationFilter, setBuyLocationFilter] = useState('all');
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiSearchSummary, setAiSearchSummary] = useState<string | null>(null);

  // Search & Filters for SELL mode
  const [sellSearchQuery, setSellSearchQuery] = useState('');
  const [sellCategoryFilter, setSellCategoryFilter] = useState('all');
  const [sellViewOwnerFilter, setSellViewOwnerFilter] = useState<'all' | 'mine'>('all');

  // Search & Filters for RECOVER mode
  const [recoverSearchQuery, setRecoverSearchQuery] = useState('');
  const [recoverTypeFilter, setRecoverTypeFilter] = useState('all');

  // Modal States
  const [selectedFertilizerForDetail, setSelectedFertilizerForDetail] = useState<FertilizerProduct | null>(null);
  const [selectedFertilizerForEnquiry, setSelectedFertilizerForEnquiry] = useState<FertilizerProduct | null>(null);
  const [enquiryInitialQty, setEnquiryInitialQty] = useState<number>(10);

  const [selectedProduceForDetail, setSelectedProduceForDetail] = useState<ProduceListing | null>(null);
  const [selectedProduceForOffer, setSelectedProduceForOffer] = useState<ProduceListing | null>(null);
  const [isCreateListingModalOpen, setIsCreateListingModalOpen] = useState(false);
  const [editingProduceListing, setEditingProduceListing] = useState<ProduceListing | null>(null);

  const [isTradeRequestsModalOpen, setIsTradeRequestsModalOpen] = useState(false);

  // Load datasets on mount
  useEffect(() => {
    setFertilizerProducts(loadFertilizerProducts());
    setProduceListings(loadProduceListings());
    setTradeRequests(loadTradeRequests());
  }, []);

  const toast = (msg: string) => {
    if (onShowToast) onShowToast(msg);
  };

  // ----------------------------------------------------
  // Handlers for BUY mode
  // ----------------------------------------------------
  const handleOpenFertilizerEnquiry = (product: FertilizerProduct, qty: number = 10) => {
    setSelectedFertilizerForDetail(null);
    setSelectedFertilizerForEnquiry(product);
    setEnquiryInitialQty(qty);
  };

  const handleSaveFertilizerEnquiry = (request: TradeRequest) => {
    addTradeRequest(request);
    const updated = loadTradeRequests();
    setTradeRequests(updated);

    logActivity({
      category: 'match',
      title: `Purchase Request Submitted: ${request.targetTitle}`,
      description: `Requested ${request.requestedQuantity} ${request.quantityUnit} from ${request.sellerName}. Est value: ₹${request.estimatedTotalValue?.toLocaleString('en-IN')}.`,
      relatedId: request.id,
      statusBadge: 'Request Submitted',
    });

    toast(`Purchase request for ${request.targetTitle} submitted to ${request.sellerName}!`);
  };

  const handleAiSearchBuy = async (queryText: string) => {
    setBuySearchQuery(queryText);
    if (!queryText.trim()) {
      setAiSearchSummary(null);
      return;
    }

    setIsAiSearching(true);
    try {
      const res = await interpretMarketplaceSearch(queryText, 'buy');
      if (res.suggestedCategory) {
        setBuyCategoryFilter(res.suggestedCategory);
      }
      setAiSearchSummary(res.interpretedIntent);
    } finally {
      setIsAiSearching(false);
    }
  };

  // ----------------------------------------------------
  // Handlers for SELL mode
  // ----------------------------------------------------
  const handleSaveProduceListing = (newListing: ProduceListing) => {
    const isEdit = produceListings.some((l) => l.id === newListing.id);
    if (isEdit) {
      updateProduceListing(newListing);
      toast(`Updated listing for ${newListing.commodityName}!`);
    } else {
      addProduceListing(newListing);
      toast(`Published listing for ${newListing.commodityName} to marketplace!`);

      logActivity({
        category: 'harvest',
        title: `Commodity Listed: ${newListing.commodityName}`,
        description: `Listed ${newListing.quantity} ${newListing.unit} of ${newListing.commodityName} at ₹${newListing.askingPrice} ${newListing.priceUnit.replace('₹', '')}.`,
        relatedId: newListing.id,
        statusBadge: 'Marketplace Active',
      });
    }

    setProduceListings(loadProduceListings());
    setEditingProduceListing(null);
  };

  const handleToggleListingStatus = (listing: ProduceListing) => {
    const nextStatus = listing.status === 'Sold' ? 'Active' : 'Sold';
    const nextAvail = nextStatus === 'Sold' ? 'Sold Out' : 'Ready for Collection';
    const updated: ProduceListing = {
      ...listing,
      status: nextStatus,
      availabilityStatus: nextAvail,
    };
    updateProduceListing(updated);
    setProduceListings(loadProduceListings());
    toast(`Marked ${listing.commodityName} as ${nextStatus}!`);
  };

  const handleDeleteListing = (listingId: string) => {
    deleteProduceListing(listingId);
    setProduceListings(loadProduceListings());
    toast('Produce listing removed.');
  };

  const handleSaveProduceOffer = (request: TradeRequest) => {
    addTradeRequest(request);
    const updated = loadTradeRequests();
    setTradeRequests(updated);

    logActivity({
      category: 'match',
      title: `Trade Offer Sent: ${request.targetTitle}`,
      description: `Offered ₹${request.offeredPricePerUnit} ${request.priceUnit.replace('₹', '')} for ${request.requestedQuantity} ${request.quantityUnit} to ${request.sellerName}.`,
      relatedId: request.id,
      statusBadge: 'Offer Submitted',
    });

    toast(`Direct offer for ${request.targetTitle} sent to farmer ${request.sellerName}!`);
  };

  // ----------------------------------------------------
  // Handlers for Trade Requests
  // ----------------------------------------------------
  const handleUpdateTradeStatus = (requestId: string, newStatus: TradeRequestStatus, notes?: string) => {
    const updated = updateTradeRequestStatus(requestId, newStatus, notes);
    setTradeRequests(updated);

    logActivity({
      category: 'match',
      title: `Trade Status: ${newStatus}`,
      description: `Trade request ${requestId} updated to ${newStatus}. ${notes || ''}`,
      relatedId: requestId,
      statusBadge: newStatus,
    });

    toast(`Trade request updated to "${newStatus}".`);
  };

  // ----------------------------------------------------
  // Filtered Lists
  // ----------------------------------------------------
  const filteredFertilizers = fertilizerProducts.filter((p) => {
    const query = buySearchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      p.name.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      p.companyName.toLowerCase().includes(query) ||
      p.location.toLowerCase().includes(query) ||
      (p.compositionDetails && p.compositionDetails.toLowerCase().includes(query));

    const matchesCategory = buyCategoryFilter === 'all' || p.category === buyCategoryFilter;
    const matchesLocation = buyLocationFilter === 'all' || p.location.includes(buyLocationFilter);

    return matchesSearch && matchesCategory && matchesLocation;
  });

  const currentUserName = userProfile?.fullName || 'Ramesh Patil';

  const filteredProduce = produceListings.filter((l) => {
    const query = sellSearchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      l.commodityName.toLowerCase().includes(query) ||
      l.category.toLowerCase().includes(query) ||
      l.sellerName.toLowerCase().includes(query) ||
      l.location.toLowerCase().includes(query) ||
      (l.variety && l.variety.toLowerCase().includes(query));

    const matchesCategory = sellCategoryFilter === 'all' || l.category === sellCategoryFilter;
    const matchesOwner = sellViewOwnerFilter === 'all' || l.sellerName === currentUserName;

    return matchesSearch && matchesCategory && matchesOwner;
  });

  const filteredPartners = RECOVERY_PARTNERS_DATABASE.filter((p) => {
    const query = recoverSearchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      p.name.toLowerCase().includes(query) ||
      p.location.toLowerCase().includes(query) ||
      p.state.toLowerCase().includes(query) ||
      p.acceptedMaterials.some((m) => m.toLowerCase().includes(query));

    const matchesType = recoverTypeFilter === 'all' || p.processingType === recoverTypeFilter;

    return matchesSearch && matchesType;
  });

  const myListingCount = produceListings.filter((l) => l.sellerName === currentUserName).length;
  const pendingRequestsCount = tradeRequests.filter((r) => r.status === 'Submitted' || r.status === 'Under Review').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Mode Selector */}
      <div className="bg-white border border-[#E2E8DF] rounded-3xl p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#E2E8DF]">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#EAF1E7] text-[#245C43] text-xs font-semibold mb-2">
              <ShoppingBag className="w-3.5 h-3.5 text-[#245C43]" />
              <span>Direct Farmer–Company Trading Platform</span>
            </div>
            <h2 className="text-2xl font-heading font-extrabold text-[#183E2E]">
              Recovery Partner Directory & Marketplace
            </h2>
            <p className="text-sm text-[#68766D] mt-1 max-w-3xl leading-relaxed">
              Connect directly with agricultural companies and certified facilities. Trade fertilizers and farm produce without an intermediary broker, or recover organic waste into valuable resources.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* View Enquiries & Trades Button */}
            <button
              onClick={() => setIsTradeRequestsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#F8F8F2] hover:bg-[#EAF1E7] text-[#183E2E] border border-[#E2E8DF] hover:border-[#85B96F] text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <Tag className="w-3.5 h-3.5 text-[#245C43]" />
              <span>My Enquiries & Trades</span>
              {tradeRequests.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#245C43] text-white text-[10px] font-bold flex items-center justify-center">
                  {tradeRequests.length}
                </span>
              )}
            </button>

            {/* List Produce CTA in Sell Mode */}
            {marketplaceMode === 'sell' && (
              <button
                onClick={() => {
                  setEditingProduceListing(null);
                  setIsCreateListingModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-[#245C43] hover:bg-[#183E2E] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs hover:shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>+ List Your Produce</span>
              </button>
            )}
          </div>
        </div>

        {/* Primary Marketplace Action Selector */}
        <div className="pt-5 space-y-3">
          <div className="w-full overflow-x-auto pb-1 sm:pb-0">
            <div className="inline-flex min-w-full sm:min-w-0 p-1.5 bg-[#F8F8F2] rounded-2xl border border-[#E2E8DF] gap-1">
              {/* Option 1: BUY */}
              <button
                onClick={() => setMarketplaceMode('buy')}
                className={`flex-1 sm:flex-initial px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer ${
                  marketplaceMode === 'buy'
                    ? 'bg-[#245C43] text-white shadow-xs'
                    : 'text-[#68766D] hover:text-[#183E2E] hover:bg-white/60'
                }`}
              >
                <ShoppingBag className="w-4 h-4 shrink-0" />
                <span>BUY — Fertilizers & Soil Products</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                  marketplaceMode === 'buy' ? 'bg-[#D7E8A3] text-[#183E2E]' : 'bg-[#E2E8DF] text-[#183E2E]'
                }`}>
                  {fertilizerProducts.length}
                </span>
              </button>

              {/* Option 2: SELL */}
              <button
                onClick={() => setMarketplaceMode('sell')}
                className={`flex-1 sm:flex-initial px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer ${
                  marketplaceMode === 'sell'
                    ? 'bg-[#245C43] text-white shadow-xs'
                    : 'text-[#68766D] hover:text-[#183E2E] hover:bg-white/60'
                }`}
              >
                <Wheat className="w-4 h-4 shrink-0" />
                <span>SELL — Agricultural Produce</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                  marketplaceMode === 'sell' ? 'bg-[#D7E8A3] text-[#183E2E]' : 'bg-[#E2E8DF] text-[#183E2E]'
                }`}>
                  {produceListings.length}
                </span>
              </button>

              {/* Supporting Option: RECOVER */}
              <button
                onClick={() => setMarketplaceMode('recover')}
                className={`flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer ${
                  marketplaceMode === 'recover'
                    ? 'bg-[#183E2E] text-white shadow-xs'
                    : 'text-[#68766D] hover:text-[#183E2E] hover:bg-white/60'
                }`}
              >
                <Building2 className="w-4 h-4 shrink-0" />
                <span>RECOVER — Organic Waste Facilities</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                  marketplaceMode === 'recover' ? 'bg-[#D7E8A3] text-[#183E2E]' : 'bg-[#E2E8DF] text-[#183E2E]'
                }`}>
                  {RECOVERY_PARTNERS_DATABASE.length}
                </span>
              </button>
            </div>
          </div>

          {/* Dedicated Supporting Text Row Below Selector */}
          <div className="flex items-center gap-2 text-xs text-[#68766D] px-1 pt-0.5">
            <ShieldCheck className="w-4 h-4 text-[#245C43] shrink-0" />
            <span>Direct farmer-to-company transactions • Zero broker cut</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODE 1: BUY — FERTILIZERS & SOIL PRODUCTS MARKETPLACE   */}
      {/* ======================================================== */}
      {marketplaceMode === 'buy' && (
        <div className="space-y-6">
          {/* Header & Subtitle */}
          <div className="bg-gradient-to-r from-[#EAF1E7]/80 to-[#F8F8F2] border border-[#85B96F]/30 rounded-3xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-heading font-black text-[#183E2E]">
                  Buy Fertilizers Directly
                </h3>
                <p className="text-xs sm:text-sm text-[#68766D] mt-1 max-w-2xl leading-relaxed">
                  Find suitable fertilizers and soil products from agricultural companies and recovery partners, without an unnecessary intermediary.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs bg-white px-3 py-1.5 rounded-xl border border-[#E2E8DF] text-[#183E2E] shrink-0 font-medium">
                <Package className="w-3.5 h-3.5 text-[#245C43]" />
                <span>{filteredFertilizers.length} Products Available</span>
              </div>
            </div>

            {/* Natural Language Search & Filters */}
            <div className="mt-5 space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#68766D] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Search fertilizers by name, category, composition (e.g. vermicompost, NPK, bio-slurry)..."
                    value={buySearchQuery}
                    onChange={(e) => {
                      setBuySearchQuery(e.target.value);
                      if (!e.target.value) setAiSearchSummary(null);
                    }}
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E2E8DF] focus:border-[#245C43] rounded-xl text-xs sm:text-sm text-[#1D2922]"
                  />
                  {buySearchQuery && (
                    <button
                      onClick={() => {
                        setBuySearchQuery('');
                        setAiSearchSummary(null);
                      }}
                      className="absolute right-3 top-2.5 text-xs text-[#68766D] hover:text-[#183E2E]"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 overflow-x-auto">
                  <select
                    value={buyCategoryFilter}
                    onChange={(e) => setBuyCategoryFilter(e.target.value)}
                    className="px-3 py-2.5 bg-white border border-[#E2E8DF] rounded-xl text-xs font-semibold text-[#183E2E]"
                  >
                    <option value="all">All Product Categories</option>
                    <option value="Organic Compost">Organic Compost</option>
                    <option value="Vermicompost">Vermicompost</option>
                    <option value="Enriched Bio-Slurry">Enriched Bio-Slurry</option>
                    <option value="Soil Conditioner & Bio-Pellets">Soil Conditioner & Bio-Pellets</option>
                    <option value="Bio-Enzymes & Liquid Manure">Bio-Enzymes & Liquid Manure</option>
                    <option value="Insect Frass Fertilizer">Insect Frass Fertilizer</option>
                  </select>

                  <select
                    value={buyLocationFilter}
                    onChange={(e) => setBuyLocationFilter(e.target.value)}
                    className="px-3 py-2.5 bg-white border border-[#E2E8DF] rounded-xl text-xs font-semibold text-[#183E2E]"
                  >
                    <option value="all">All Locations</option>
                    <option value="Nashik">Nashik</option>
                    <option value="Pune">Pune</option>
                    <option value="Kolar">Kolar (Karnataka)</option>
                    <option value="Karnal">Karnal (Haryana)</option>
                    <option value="Bengaluru">Bengaluru</option>
                  </select>
                </div>
              </div>

              {/* Natural Language Prompt Suggestion Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="text-[11px] font-semibold text-[#68766D] flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#245C43]" />
                  Try searching:
                </span>
                {[
                  'Affordable compost in Nashik',
                  'Vermicompost for vegetable nursery',
                  'Liquid bio-slurry for drip fertigation',
                  'Insect frass bio-stimulant',
                ].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => handleAiSearchBuy(chip)}
                    className="px-2.5 py-1 rounded-lg bg-white/90 hover:bg-white text-[#245C43] hover:text-[#183E2E] border border-[#85B96F]/30 hover:border-[#245C43] text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    "{chip}"
                  </button>
                ))}
              </div>

              {/* AI Search Feedback Banner */}
              {aiSearchSummary && (
                <div className="p-2.5 bg-[#EAF1E7] border border-[#85B96F]/40 rounded-xl text-xs text-[#245C43] flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#245C43]" />
                    <span>AI Filter: <strong>{aiSearchSummary}</strong></span>
                  </span>
                  <button
                    onClick={() => {
                      setBuySearchQuery('');
                      setBuyCategoryFilter('all');
                      setAiSearchSummary(null);
                    }}
                    className="text-[11px] font-bold text-[#183E2E] underline"
                  >
                    Reset
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Product Cards Grid */}
          {filteredFertilizers.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-[#E2E8DF] p-6">
              <Package className="w-12 h-12 text-[#68766D]/40 mx-auto mb-3" />
              <h3 className="text-base font-bold text-[#183E2E]">No fertilizer products match your filters</h3>
              <p className="text-xs text-[#68766D] mt-1 max-w-md mx-auto">
                Try widening your search terms or resetting the category filter to view all available organic fertilizers.
              </p>
              <button
                onClick={() => {
                  setBuySearchQuery('');
                  setBuyCategoryFilter('all');
                  setBuyLocationFilter('all');
                  setAiSearchSummary(null);
                }}
                className="mt-4 px-4 py-2 bg-[#F8F8F2] hover:bg-[#EAF1E7] text-xs font-bold text-[#183E2E] rounded-xl border border-[#E2E8DF]"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredFertilizers.map((product) => (
                <FertilizerProductCard
                  key={product.id}
                  product={product}
                  onViewDetails={setSelectedFertilizerForDetail}
                  onRequestPurchase={(prod) => handleOpenFertilizerEnquiry(prod, prod.minOrderQuantity || 5)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODE 2: SELL — AGRICULTURAL PRODUCE MARKETPLACE          */}
      {/* ======================================================== */}
      {marketplaceMode === 'sell' && (
        <div className="space-y-6">
          {/* Header & Subtitle */}
          <div className="bg-gradient-to-r from-[#EAF1E7]/80 to-[#F8F8F2] border border-[#85B96F]/30 rounded-3xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-heading font-black text-[#183E2E]">
                  Sell Your Produce Directly
                </h3>
                <p className="text-xs sm:text-sm text-[#68766D] mt-1 max-w-2xl leading-relaxed">
                  List your agricultural products, reach suitable buyers, and manage enquiries in one place — without requiring a broker.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingProduceListing(null);
                    setIsCreateListingModalOpen(true);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#245C43] hover:bg-[#183E2E] text-white text-xs font-bold transition-all shadow-xs hover:shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ List Your Produce</span>
                </button>
              </div>
            </div>

            {/* Produce Search & Category Pills */}
            <div className="mt-5 space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#68766D] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Search commodities by crop name, variety, grade, farmer, or region..."
                    value={sellSearchQuery}
                    onChange={(e) => setSellSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E2E8DF] focus:border-[#245C43] rounded-xl text-xs sm:text-sm text-[#1D2922]"
                  />
                  {sellSearchQuery && (
                    <button
                      onClick={() => setSellSearchQuery('')}
                      className="absolute right-3 top-2.5 text-xs text-[#68766D] hover:text-[#183E2E]"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Filter Mine vs All */}
                <div className="inline-flex p-1 bg-white rounded-xl border border-[#E2E8DF]">
                  <button
                    onClick={() => setSellViewOwnerFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      sellViewOwnerFilter === 'all'
                        ? 'bg-[#245C43] text-white'
                        : 'text-[#68766D] hover:text-[#183E2E]'
                    }`}
                  >
                    All Market Lots ({produceListings.length})
                  </button>

                  <button
                    onClick={() => setSellViewOwnerFilter('mine')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      sellViewOwnerFilter === 'mine'
                        ? 'bg-[#245C43] text-white'
                        : 'text-[#68766D] hover:text-[#183E2E]'
                    }`}
                  >
                    My Listings ({myListingCount})
                  </button>
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {[
                  { id: 'all', label: 'All Commodities' },
                  { id: 'Vegetables', label: 'Vegetables' },
                  { id: 'Fruits', label: 'Fruits' },
                  { id: 'Grains & Cereals', label: 'Grains & Cereals' },
                  { id: 'Pulses', label: 'Pulses' },
                  { id: 'Seeds & Planting Materials', label: 'Seeds' },
                  { id: 'Standing Crops', label: 'Standing Crops' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSellCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      sellCategoryFilter === cat.id
                        ? 'bg-[#245C43] text-white'
                        : 'bg-white text-[#68766D] hover:text-[#183E2E] border border-[#E2E8DF]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Produce Listings Grid */}
          {filteredProduce.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-[#E2E8DF] p-6">
              <Wheat className="w-12 h-12 text-[#68766D]/40 mx-auto mb-3" />
              <h3 className="text-base font-bold text-[#183E2E]">No agricultural listings found</h3>
              <p className="text-xs text-[#68766D] mt-1 max-w-md mx-auto">
                {sellViewOwnerFilter === 'mine'
                  ? "You haven't listed any produce yet. Click '+ List Your Produce' to publish your first lot directly to buyers."
                  : 'Try adjusting your search criteria or commodity category filter.'}
              </p>
              <button
                onClick={() => {
                  setEditingProduceListing(null);
                  setIsCreateListingModalOpen(true);
                }}
                className="mt-4 px-5 py-2.5 bg-[#245C43] hover:bg-[#183E2E] text-xs font-bold text-white rounded-xl shadow-xs"
              >
                + List Your Produce Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProduce.map((listing) => (
                <ProduceListingCard
                  key={listing.id}
                  listing={listing}
                  isOwner={listing.sellerName === currentUserName}
                  onViewDetails={setSelectedProduceForDetail}
                  onMakeOffer={setSelectedProduceForOffer}
                  onEditListing={(l) => {
                    setEditingProduceListing(l);
                    setIsCreateListingModalOpen(true);
                  }}
                  onToggleStatus={handleToggleListingStatus}
                  onDeleteListing={handleDeleteListing}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODE 3: RECOVER — ORGANIC WASTE FACILITIES DIRECTORY    */}
      {/* ======================================================== */}
      {marketplaceMode === 'recover' && (
        <div className="space-y-6">
          {/* Recovery Header */}
          <div className="bg-white border border-[#E2E8DF] rounded-3xl p-6 shadow-2xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#E2E8DF]">
              <div>
                <h3 className="text-xl font-heading font-black text-[#183E2E]">
                  Certified Regional Recovery Facilities
                </h3>
                <p className="text-xs sm:text-sm text-[#68766D] mt-1 max-w-2xl leading-relaxed">
                  Directory of bio-composting, vermiculture, biomethanation, and agro-residue facilities. All capacity limits and intake rules are transparently verified.
                </p>
              </div>

              <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#F8F8F2] text-[#183E2E] border border-[#E2E8DF] shrink-0">
                {RECOVERY_PARTNERS_DATABASE.length} Facilities Listed (Simulated Demo Units)
              </span>
            </div>

            {/* Search & Technology Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-5">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-[#68766D] absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search facilities by name, material, or state..."
                  value={recoverSearchQuery}
                  onChange={(e) => setRecoverSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#F8F8F2] border border-[#E2E8DF] focus:border-[#245C43] rounded-xl text-xs sm:text-sm text-[#1D2922]"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                <Filter className="w-4 h-4 text-[#68766D] shrink-0" />
                <select
                  value={recoverTypeFilter}
                  onChange={(e) => setRecoverTypeFilter(e.target.value)}
                  className="px-3 py-1.5 bg-[#F8F8F2] border border-[#E2E8DF] rounded-xl text-xs font-medium text-[#183E2E]"
                >
                  <option value="all">All Processing Technologies</option>
                  <option value="Aerobic Composting">Aerobic Composting</option>
                  <option value="Biomethanation / Bio-CNG">Biomethanation / Bio-CNG</option>
                  <option value="Vermicomposting & Bio-Enzymes">Vermicomposting & Bio-Enzymes</option>
                  <option value="Organic Soil Conditioner">Organic Soil Conditioner</option>
                  <option value="Edible Surplus Redistribution">Edible Surplus Redistribution</option>
                  <option value="Black Soldier Fly Feed">Black Soldier Fly Feed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Facilities Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredPartners.map((partner) => (
              <div
                key={partner.id}
                className="bg-white border border-[#E2E8DF] hover:border-[#85B96F]/60 rounded-3xl p-6 transition-all shadow-2xs hover:shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-heading font-bold text-lg text-[#183E2E]">
                        {partner.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#68766D] mt-1">
                        <span className="font-semibold text-[#245C43]">{partner.processingType}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {partner.location} ({partner.state})
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#F8F8F2] text-[#68766D] border border-[#E2E8DF] px-2 py-0.5 rounded-full shrink-0">
                      {partner.verificationStatus}
                    </span>
                  </div>

                  <p className="text-xs text-[#68766D] leading-relaxed mb-4">
                    {partner.description}
                  </p>

                  {/* Capacities & Logistics */}
                  <div className="bg-[#FAFAF7] rounded-2xl p-4 border border-[#E2E8DF] grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs mb-4">
                    <div>
                      <span className="text-[#68766D] block text-[11px]">Intake Capacity</span>
                      <strong className="text-[#183E2E]">
                        {formatQuantityKg(partner.minimumQuantityKg)} – {formatQuantityKg(partner.maximumQuantityKg)}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[#68766D] block text-[11px]">Logistics Transport</span>
                      <strong className="text-[#183E2E]">{partner.collectionOptions}</strong>
                    </div>

                    <div>
                      <span className="text-[#68766D] block text-[11px]">Turnaround Time</span>
                      <strong className="text-[#245C43]">{partner.averageTurnaroundDays}</strong>
                    </div>

                    <div className="col-span-2 sm:col-span-3">
                      <span className="text-[#68766D] block text-[11px]">Service Perimeter</span>
                      <strong className="text-[#183E2E]">{partner.serviceArea.join(', ')}</strong>
                    </div>
                  </div>

                  {/* Accepted vs Excluded Materials */}
                  <div className="space-y-3 text-xs mb-4">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#245C43] block mb-1">
                        Accepted Organic Feedstock:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {partner.acceptedMaterials.map((mat, i) => (
                          <span
                            key={i}
                            className="bg-[#EAF1E7] text-[#183E2E] border border-[#85B96F]/30 px-2 py-0.5 rounded-lg text-[11px]"
                          >
                            ✓ {mat}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#B94C3D] block mb-1">
                        Strictly Excluded:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {partner.excludedMaterials.map((exc, i) => (
                          <span
                            key={i}
                            className="bg-[#FEE2E2]/60 text-[#991B1B] border border-[#FECACA] px-2 py-0.5 rounded-lg text-[11px]"
                          >
                            ✕ {exc}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Coordinator Footer */}
                <div className="pt-3 border-t border-[#E2E8DF] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#68766D]">
                  <div>
                    <span className="font-semibold text-[#183E2E]">{partner.contact.coordinator}</span>
                    <div className="flex items-center gap-3 text-[11px] mt-0.5">
                      <span>{partner.contact.phone}</span>
                      <span>•</span>
                      <span>{partner.contact.email}</span>
                    </div>
                  </div>

                  <span className="text-[11px] text-[#68766D]">
                    Verified: {partner.lastVerifiedAt}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* GLOBAL MARKETPLACE MODALS                                */}
      {/* ======================================================== */}

      {/* 1. Fertilizer Detail Modal */}
      <FertilizerDetailModal
        product={selectedFertilizerForDetail}
        isOpen={!!selectedFertilizerForDetail}
        onClose={() => setSelectedFertilizerForDetail(null)}
        onRequestPurchase={(prod, qty) => handleOpenFertilizerEnquiry(prod, qty)}
      />

      {/* 2. Fertilizer Enquiry / Purchase Modal */}
      <FertilizerEnquiryModal
        product={selectedFertilizerForEnquiry}
        initialQuantity={enquiryInitialQty}
        isOpen={!!selectedFertilizerForEnquiry}
        onClose={() => setSelectedFertilizerForEnquiry(null)}
        onSaveRequest={handleSaveFertilizerEnquiry}
        userProfile={userProfile}
      />

      {/* 3. Produce Detail Modal */}
      <ProduceDetailModal
        listing={selectedProduceForDetail}
        isOwner={selectedProduceForDetail?.sellerName === currentUserName}
        isOpen={!!selectedProduceForDetail}
        onClose={() => setSelectedProduceForDetail(null)}
        onMakeOffer={(listing) => {
          setSelectedProduceForDetail(null);
          setSelectedProduceForOffer(listing);
        }}
        onEditListing={(listing) => {
          setSelectedProduceForDetail(null);
          setEditingProduceListing(listing);
          setIsCreateListingModalOpen(true);
        }}
      />

      {/* 4. Produce Offer Modal */}
      <ProduceOfferModal
        listing={selectedProduceForOffer}
        isOpen={!!selectedProduceForOffer}
        onClose={() => setSelectedProduceForOffer(null)}
        onSaveRequest={handleSaveProduceOffer}
        userProfile={userProfile}
      />

      {/* 5. Create / Edit Produce Listing Modal */}
      <CreateProduceListingModal
        isOpen={isCreateListingModalOpen}
        onClose={() => {
          setIsCreateListingModalOpen(false);
          setEditingProduceListing(null);
        }}
        onSaveListing={handleSaveProduceListing}
        initialListing={editingProduceListing}
        userProfile={userProfile}
      />

      {/* 6. Trade Requests / Enquiries Ledger Modal */}
      <TradeRequestsModal
        isOpen={isTradeRequestsModalOpen}
        onClose={() => setIsTradeRequestsModalOpen(false)}
        requests={tradeRequests}
        onUpdateStatus={handleUpdateTradeStatus}
        currentUserId={userProfile?.fullName === 'Ramesh Patil' ? 'user-ramesh-patil' : 'user-current'}
      />
    </div>
  );
};
