import { FertilizerProduct, ProduceListing, TradeRequest, TradeRequestStatus } from '../types';
import { 
  INITIAL_FERTILIZER_PRODUCTS, 
  INITIAL_PRODUCE_LISTINGS, 
  INITIAL_TRADE_REQUESTS 
} from '../data/marketplaceDatabase';

const STORAGE_KEYS = {
  FERTILIZERS: 'gather_ai_marketplace_fertilizers_v1',
  PRODUCE: 'gather_ai_marketplace_produce_v1',
  TRADE_REQUESTS: 'gather_ai_marketplace_trade_requests_v1',
};

// ==========================================
// FERTILIZER PRODUCTS (BUY MODE)
// ==========================================

export function loadFertilizerProducts(): FertilizerProduct[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FERTILIZERS);
    if (!raw) {
      saveFertilizerProducts(INITIAL_FERTILIZER_PRODUCTS);
      return INITIAL_FERTILIZER_PRODUCTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_FERTILIZER_PRODUCTS;
  }
}

export function saveFertilizerProducts(products: FertilizerProduct[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.FERTILIZERS, JSON.stringify(products));
  } catch (err) {
    console.warn('Failed to save fertilizer products to localStorage', err);
  }
}

// ==========================================
// PRODUCE LISTINGS (SELL MODE)
// ==========================================

export function loadProduceListings(): ProduceListing[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCE);
    if (!raw) {
      saveProduceListings(INITIAL_PRODUCE_LISTINGS);
      return INITIAL_PRODUCE_LISTINGS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PRODUCE_LISTINGS;
  }
}

export function saveProduceListings(listings: ProduceListing[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCE, JSON.stringify(listings));
  } catch (err) {
    console.warn('Failed to save produce listings to localStorage', err);
  }
}

export function addProduceListing(listing: ProduceListing): void {
  const current = loadProduceListings();
  const updated = [listing, ...current];
  saveProduceListings(updated);
}

export function updateProduceListing(updatedListing: ProduceListing): void {
  const current = loadProduceListings();
  const updated = current.map((item) => (item.id === updatedListing.id ? updatedListing : item));
  saveProduceListings(updated);
}

export function deleteProduceListing(listingId: string): void {
  const current = loadProduceListings();
  const updated = current.filter((item) => item.id !== listingId);
  saveProduceListings(updated);
}

// ==========================================
// TRADE REQUESTS & ENQUIRIES (TRANSACTIONS)
// ==========================================

export function loadTradeRequests(): TradeRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRADE_REQUESTS);
    if (!raw) {
      saveTradeRequests(INITIAL_TRADE_REQUESTS);
      return INITIAL_TRADE_REQUESTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_TRADE_REQUESTS;
  }
}

export function saveTradeRequests(requests: TradeRequest[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TRADE_REQUESTS, JSON.stringify(requests));
  } catch (err) {
    console.warn('Failed to save trade requests to localStorage', err);
  }
}

export function addTradeRequest(request: TradeRequest): void {
  const current = loadTradeRequests();
  const updated = [request, ...current];
  saveTradeRequests(updated);
}

export function updateTradeRequestStatus(
  requestId: string,
  newStatus: TradeRequestStatus,
  statusNotes?: string
): TradeRequest[] {
  const current = loadTradeRequests();
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const updated = current.map((req) => {
    if (req.id === requestId) {
      return {
        ...req,
        status: newStatus,
        statusNotes: statusNotes || req.statusNotes,
        updatedAt: now,
      };
    }
    return req;
  });
  saveTradeRequests(updated);
  return updated;
}

// ==========================================
// RESET TO DEMO DEFAULTS
// ==========================================

export function resetMarketplaceToDemoDefaults(): {
  products: FertilizerProduct[];
  listings: ProduceListing[];
  requests: TradeRequest[];
} {
  saveFertilizerProducts(INITIAL_FERTILIZER_PRODUCTS);
  saveProduceListings(INITIAL_PRODUCE_LISTINGS);
  saveTradeRequests(INITIAL_TRADE_REQUESTS);

  return {
    products: INITIAL_FERTILIZER_PRODUCTS,
    listings: INITIAL_PRODUCE_LISTINGS,
    requests: INITIAL_TRADE_REQUESTS,
  };
}
