export type NavigationTab = 
  | 'overview' 
  | 'harvest' 
  | 'waste' 
  | 'partners' 
  | 'impact' 
  | 'activity'
  | 'settings';

export type CropStageName = 
  | 'Germination & Seedling'
  | 'Vegetative Growth'
  | 'Flowering & Fruit Set'
  | 'Ripening & Maturation'
  | 'Harvest Window Active'
  | 'Post-Harvest / Surplus Phase';

export interface CropReference {
  id: string;
  name: string;
  category: 'Vegetable' | 'Grain / Cereal' | 'Tuber' | 'Fruit' | 'Cash Crop' | 'Spice';
  standardDurationDays: {
    min: number;
    max: number;
  };
  stages: {
    name: CropStageName;
    startDayPercent: number;
    endDayPercent: number;
    guidance: string;
    criticalObservations: string[];
    riskFactors: string[];
  }[];
  primarySeasonsIndia: string[]; // e.g., ["Kharif (June-Oct)", "Rabi (Oct-March)"]
  idealSoil: string[];
  optimalTempRange: string; // e.g., "18°C - 30°C"
  postHarvestShelfLifeDays: {
    ambient: number;
    coldStorage: number;
  };
  commonVarieties: string[];
  surplusPotentialNotes: string;
}

export interface CropRecord {
  id: string;
  cropName: string;
  variety?: string;
  location: string;
  plantingDate: string; // YYYY-MM-DD
  growingMethod: 'Open Field' | 'Greenhouse / Polyhouse' | 'Hydroponic' | 'Organic / Natural';
  soilType: 'Alluvial' | 'Black Soil' | 'Red Sandy Loam' | 'Clayey Loam' | 'Laterite' | 'Sandy Loam';
  irrigationMethod?: 'Drip Irrigation' | 'Flood / Furrow' | 'Sprinkler' | 'Rainfed';
  areaSize?: string;
  currentStage: CropStageName;
  estimatedHarvestStart: string;
  estimatedHarvestEnd: string;
  daysSincePlanting: number;
  totalDurationDays: number;
  progressPercent: number;
  guidance: {
    summary: string;
    keyMilestones: string[];
    recommendedAction: string;
    environmentalRisks: string[];
    produceAttentionNeeded: boolean;
    attentionReason?: string;
    uncertaintyNotes: string;
  };
  sourceInformation: string;
  hasSurplusFlagged: boolean;
  surplusDetails?: {
    estimatedQuantity: number;
    unit: 'kg' | 'quintals' | 'tonnes' | 'crates';
    condition: 'Fresh Surplus' | 'Grade B / Blemished' | 'Overripe' | 'Residues / Stalks';
    harvestDate: string;
    notes: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type WasteMaterialCategory = 
  | 'Fruit & Vegetable Scraps'
  | 'Unsold Fresh Produce'
  | 'Crop Residues & Stalks'
  | 'Plant-based Kitchen Waste'
  | 'Other Organic Biomass';

export type WasteCondition = 
  | 'Fresh surplus (edible quality)'
  | 'Grade B / Bruised but sound'
  | 'Soft / Rapidly perishing'
  | 'Decomposing / High moisture'
  | 'Dry / Fibrous residues';

export type ContaminationLevel = 
  | 'Clean / 100% Segregated'
  | 'Minor organic debris (leaves, soil)'
  | 'Mixed organic waste (requires pre-sorting)'
  | 'Unsegregated / Contains foreign packaging';

export type WasteStatus = 
  | 'Draft'
  | 'Registered'
  | 'Matching Available'
  | 'Request Prepared'
  | 'Request Sent'
  | 'Awaiting Response'
  | 'Accepted'
  | 'Declined'
  | 'Collection Scheduled'
  | 'Collection Confirmed'
  | 'Recovery Reported'
  | 'Cancelled';

export type RecoveryProcessingType = 
  | 'Aerobic Composting'
  | 'Vermicomposting & Bio-Enzymes'
  | 'Biomethanation / Bio-CNG'
  | 'Organic Soil Conditioner'
  | 'Black Soldier Fly Feed'
  | 'Edible Surplus Redistribution';

export interface WasteAssessment {
  identifiedMaterial: string;
  quantityInKg: number;
  quantityFormatted: string;
  isEdibleSurplus: boolean;
  suitableRecoveryCategories: RecoveryProcessingType[];
  incompatibleRoutes: {
    category: string;
    reason: string;
  }[];
  urgencyLevel: 'Standard' | 'Time-sensitive (48h)' | 'Immediate Action Needed';
  recommendedNextAction: string;
  dataCompletenessNotes: string[];
}

export interface WasteRecord {
  id: string;
  materialCategory: WasteMaterialCategory;
  materialType: string;
  quantity: number;
  unit: 'kg' | 'quintals' | 'tonnes' | 'crates';
  pickupLocation: string;
  availableFrom: string;
  preferredPickupWindow: string;
  condition: WasteCondition;
  contaminationStatus: ContaminationLevel;
  storageDetails: string;
  notes?: string;
  originCropId?: string;
  originCropName?: string;
  contactName?: string;
  contactPhone?: string;
  status: WasteStatus;
  assessment?: WasteAssessment;
  selectedPartnerId?: string;
  activeRequestId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecoveryPartner {
  id: string;
  name: string;
  processingType: RecoveryProcessingType;
  description: string;
  acceptedMaterials: string[];
  excludedMaterials: string[];
  minimumQuantityKg: number;
  maximumQuantityKg: number;
  serviceArea: string[];
  location: string;
  state: string;
  collectionOptions: 'Pickup service provided' | 'Drop-off at facility only' | 'Both pickup & drop-off available';
  contact: {
    email: string;
    phone: string;
    coordinator: string;
  };
  verificationStatus: 'Simulated Demo Partner' | 'Sample Verified Facility' | 'Registered Model Unit';
  lastVerifiedAt: string;
  averageTurnaroundDays: string;
  handlingRestrictions: string[];
}

export interface MatchScoreResult {
  partner: RecoveryPartner;
  isCompatible: boolean;
  score: number; // 0 - 100
  matchReasons: string[];
  limitations: string[];
  quantityCompatible: boolean;
  materialCompatible: boolean;
  locationCompatible: boolean;
  contaminationCompatible: boolean;
}

export interface RecoveryRequest {
  id: string;
  wasteRecordId: string;
  partnerId: string;
  partnerName: string;
  materialType: string;
  quantityKg: number;
  pickupLocation: string;
  preferredPickupTime: string;
  requestMessage: string;
  requestStatus: WasteStatus;
  preparedAt: string;
  sentAt?: string;
  acceptedAt?: string;
  scheduledAt?: string;
  collectedAt?: string;
  confirmedQuantityKg?: number;
  outcomeNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  category: 'harvest' | 'waste' | 'match' | 'request' | 'collection' | 'system';
  title: string;
  description: string;
  relatedId?: string;
  statusBadge?: string;
}

export interface ImpactSummary {
  registeredQuantityKg: number;
  matchedQuantityKg: number;
  acceptedQuantityKg: number;
  confirmedCollectedKg: number;
  confirmedProcessedKg: number;
  activeCropCount: number;
  openWasteCount: number;
  pendingRequestsCount: number;
  lastUpdated: string;
}

export type UserRole = 
  | 'Grower & APMC Vendor'
  | 'Smallholder Farmer'
  | 'Food Business Operator'
  | 'Recovery Partner'
  | 'Agronomist';

export interface UserProfile {
  fullName: string;
  email: string;
  role: UserRole;
  farmOrOrgName: string;
  location: string;
  phone: string;
}

export interface FarmPreferences {
  defaultLocation: string;
  preferredWeightUnit: 'kg' | 'quintals' | 'tonnes';
  defaultWasteUnit: 'kg' | 'crates' | 'quintals' | 'tonnes';
  guidanceFocus: 'Organic & Bio-inputs' | 'Balanced Integrated Pest Mgmt' | 'Yield Maximization';
  defaultPickupWindow: 'Tomorrow morning (08:00 – 12:00)' | 'Within 24-48 hours' | 'Flexible / End of week';
  shelfLifeAlertDays: number;
}

export interface AiPreferences {
  enableAiSuggestions: boolean;
  explanationDetail: 'concise' | 'detailed';
  showFollowUpSuggestions: boolean;
  languageMode: 'English' | 'Hinglish (Hindi + English)';
}

export interface NotificationPreferences {
  inAppAlerts: boolean;
  cropGuidanceReminders: boolean;
  harvestWindowReminders: boolean;
  surplusRecoveryUpdates: boolean;
  collectionStatusUpdates: boolean;
}

export type ThemePreference = 'light' | 'dark' | 'system';
export type DensityPreference = 'comfortable' | 'compact';

export interface AppearancePreferences {
  theme: ThemePreference;
  density: DensityPreference;
  highContrast: boolean;
}

export interface AppSettings {
  profile: UserProfile;
  farm: FarmPreferences;
  ai: AiPreferences;
  notifications: NotificationPreferences;
  appearance: AppearancePreferences;
}

// ==========================================
// DIRECT FARMER-COMPANY MARKETPLACE TYPES
// ==========================================

export type MarketplaceMode = 'buy' | 'sell' | 'recover';

export type FertilizerCategory = 
  | 'Organic Compost'
  | 'Vermicompost'
  | 'Enriched Bio-Slurry'
  | 'Soil Conditioner & Bio-Pellets'
  | 'Bio-Enzymes & Liquid Manure'
  | 'Insect Frass Fertilizer'
  | 'Bio-Pesticides & Neem Formulation';

export interface FertilizerProduct {
  id: string;
  name: string;
  category: FertilizerCategory;
  companyId: string;
  companyName: string;
  description: string;
  price: number;
  priceUnit: string;
  availableQuantity: number;
  quantityUnit: string;
  packagingSize: string;
  location: string;
  state: string;
  deliveryOptions: string;
  compositionDetails?: string;
  intendedUse: string;
  isSimulated: boolean;
  verificationBadge: string;
  minOrderQuantity?: number;
  contactCoordinator?: string;
  contactPhone?: string;
  contactEmail?: string;
  createdAt: string;
}

export type ProduceCategory = 
  | 'Vegetables'
  | 'Fruits'
  | 'Grains & Cereals'
  | 'Pulses'
  | 'Seeds & Planting Materials'
  | 'Standing Crops'
  | 'Spices & Cash Crops';

export type ProduceAvailabilityStatus = 
  | 'Ready for Collection'
  | 'Harvest in Progress'
  | 'Standing Crop (Ready in 7-14 Days)'
  | 'Sold Out'
  | 'Paused';

export type ProduceListingStatus = 'Active' | 'Under Offer' | 'Sold' | 'Paused';

export interface ProduceListing {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerRole?: string;
  sellerPhone: string;
  sellerLocation: string;
  commodityName: string;
  category: ProduceCategory;
  variety?: string;
  grade?: string;
  quantity: number;
  unit: 'kg' | 'quintals' | 'tonnes' | 'crates' | 'bags';
  askingPrice: number;
  priceUnit: '₹/kg' | '₹/quintal' | '₹/tonne' | '₹/crate';
  isNegotiable: boolean;
  harvestDate?: string;
  availabilityDate: string;
  availabilityStatus: ProduceAvailabilityStatus;
  location: string;
  description: string;
  condition?: string;
  minOrderQuantity?: number;
  packaging?: string;
  pickupOrDelivery: 'Farmgate Pickup by Buyer' | 'Seller can deliver to Mandi/Facility' | 'Negotiable Logistics';
  status: ProduceListingStatus;
  isSimulated: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TradeRequestType = 'fertilizer_purchase_enquiry' | 'produce_purchase_offer';

export type TradeRequestStatus = 
  | 'Submitted' 
  | 'Under Review' 
  | 'Accepted' 
  | 'Declined' 
  | 'Completed' 
  | 'Cancelled';

export interface TradeRequest {
  id: string;
  type: TradeRequestType;
  targetId: string;
  targetTitle: string;
  targetCategory: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  buyerLocation: string;
  sellerId: string;
  sellerName: string;
  sellerPhone?: string;
  requestedQuantity: number;
  quantityUnit: string;
  offeredPricePerUnit?: number;
  priceUnit: string;
  estimatedTotalValue?: number;
  preferredLogistics: 'Pickup by Buyer' | 'Delivery by Seller' | 'Third-party Logistics';
  message: string;
  status: TradeRequestStatus;
  statusNotes?: string;
  createdAt: string;
  updatedAt: string;
  isSimulated: boolean;
}

