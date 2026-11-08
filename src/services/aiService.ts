/**
 * Gather AI — Shared Client-Side AI Brain Service
 * 
 * Flow:
 * USER INPUT -> CONTEXT RETRIEVAL -> APPLICATION RULES AND DATA VALIDATION
 * -> AI MODEL -> STRUCTURED RESPONSE VALIDATION -> USER-FACING RECOMMENDATIONS
 * 
 * All requests route through secure server-side endpoints on /api/*.
 * Never stores or requests the secret API key in client code.
 */

export interface AiHealthStatus {
  configured: boolean;
  status: 'connected' | 'missing_key' | 'error';
  model: string;
  message: string;
}

// -------------------------------------------------------------
// 1. Crop Advice & Harvest Readiness Schemas (Section 11)
// -------------------------------------------------------------
export interface CropRecommendationItem {
  title: string;
  action: string;
  reason: string;
  priority: 'low' | 'medium' | 'high';
}

export interface HarvestEstimate {
  earliest_date: string | null;
  latest_date: string | null;
  basis: string;
  confidence_note: string;
}

export interface CropAdviceOutput {
  summary: string;
  likely_stage: string | null;
  recommendations: CropRecommendationItem[];
  harvest_estimate: HarvestEstimate | null;
  missing_information: string[];
  cautions: string[];
  disclaimer: string;
  model_used: string;
}

export interface CropAdviceParams {
  cropName: string;
  location?: string;
  plantingDate?: string;
  currentStage?: string;
  growingMethod?: string;
  soilType?: string;
  question?: string;
  variety?: string;
}

// -------------------------------------------------------------
// 2. Surplus Recommendation Schema (Section 11)
// -------------------------------------------------------------
export interface SurplusRecommendationOutput {
  summary: string;
  recommended_route: string;
  other_options: string[];
  reasoning: string;
  conditions_to_check: string[];
  missing_information: string[];
  next_action: string;
  model_used: string;
}

export interface SurplusRecommendationParams {
  materialType: string;
  quantity?: number;
  unit?: string;
  condition?: string;
  edibleOrWaste?: string;
  timeBeforeDeterioration?: string;
  pickupLocation?: string;
  storageConstraints?: string;
  userObjective?: string;
  availableRoutes?: string[];
}

// -------------------------------------------------------------
// 3. Recovery Match Explanation Schema (Section 11)
// -------------------------------------------------------------
export interface RecoveryMatchExplanationOutput {
  partner_id: string;
  match_summary: string;
  compatible_criteria: string[];
  conditions_to_verify: string[];
  next_action: string;
  model_used: string;
}

export interface RecoveryMatchExplanationParams {
  wasteRecord: {
    id?: string;
    materialType: string;
    materialCategory?: string;
    quantity: number;
    unit?: string;
    condition?: string;
    contaminationStatus?: string;
    pickupLocation?: string;
    storageDetails?: string;
  };
  partnerMatch: {
    partnerId: string;
    partnerName: string;
    processingType: string;
    isCompatible: boolean;
    score: number;
    matchReasons?: string[];
    limitations?: string[];
    minimumQuantityKg?: number;
    maximumQuantityKg?: number;
    serviceArea?: string[];
    facilityLocation?: string;
  };
}

// -------------------------------------------------------------
// 4. Collection Request Schema (Section 11)
// -------------------------------------------------------------
export interface CollectionRequestOutput {
  subject: string;
  message: string;
  missing_fields: string[];
  requires_user_review: boolean;
  key_highlights?: string[];
  model_used: string;
}

export interface CollectionRequestParams {
  wasteRecord: {
    id?: string;
    materialType: string;
    materialCategory?: string;
    quantity: number;
    unit?: string;
    condition?: string;
    contaminationStatus?: string;
    pickupLocation?: string;
    preferredPickupWindow?: string;
    storageDetails?: string;
    contactName?: string;
    notes?: string;
  };
  partner: {
    id?: string;
    name: string;
    processingType?: string;
    coordinatorName?: string;
    email?: string;
    location?: string;
  };
  specialInstructions?: string;
}

// -------------------------------------------------------------
// 5. Shared Assistant Schema (Section 11)
// -------------------------------------------------------------
export interface GatherAssistantOutput {
  answer: string;
  key_points: string[];
  suggested_actions: string[];
  missing_information: string[];
  cautions: string[];
  model_used: string;
}

export interface GatherAssistantParams {
  question: string;
  context?: {
    activeTab?: string;
    cropRecord?: {
      cropName: string;
      variety?: string;
      location: string;
      plantingDate?: string;
      currentStage?: string;
      hasSurplusFlagged?: boolean;
    };
    wasteRecord?: {
      materialType: string;
      quantity: number;
      unit: string;
      condition: string;
      status: string;
      pickupLocation: string;
    };
    partner?: {
      name: string;
      processingType: string;
      location: string;
    };
    appStateSummary?: {
      cropCount: number;
      wasteCount: number;
      pendingRequestsCount: number;
      activeHarvestCrops: string[];
      flaggedSurplusCrops: string[];
    };
  };
}

// -------------------------------------------------------------
// 6. Cross-Module Insights Schema
// -------------------------------------------------------------
export interface CrossModuleInsightItem {
  id: string;
  type: 'surplus_action' | 'harvest_planning' | 'partner_coordination' | 'data_enrichment';
  title: string;
  description: string;
  recommended_action: string;
  urgency: 'high' | 'medium' | 'low';
  target_tab?: 'harvest' | 'waste' | 'partners' | 'overview';
  related_crop_id?: string;
  related_waste_id?: string;
}

export interface CrossModuleInsightsOutput {
  insights: CrossModuleInsightItem[];
  overall_status: string;
  model_used: string;
}

export interface CrossModuleInsightsParams {
  crops: Array<{
    id: string;
    cropName: string;
    location: string;
    currentStage: string;
    hasSurplusFlagged: boolean;
    surplusDetails?: { estimatedQuantity: number; unit: string };
  }>;
  wasteRecords: Array<{
    id: string;
    materialType: string;
    quantity: number;
    unit: string;
    status: string;
    selectedPartnerId?: string;
  }>;
  requestsCount: number;
}

// -------------------------------------------------------------
// Legacy Wrapper Interfaces for Backward Compatibility
// -------------------------------------------------------------
export interface HarvestGuidanceParams extends CropAdviceParams {}
export interface HarvestGuidanceResult {
  stageAssessment: string;
  practicalNextSteps: string[];
  harvestWindowEstimate: string;
  criticalObservations: string[];
  cautionsAndRisks: string[];
  missingInformationNotice: string | null;
  expertDisclaimer: string;
  modelUsed: string;
  structured?: CropAdviceOutput;
}

export interface RecoveryExplanationParams {
  wasteRecord: {
    materialType: string;
    materialCategory?: string;
    quantity: number;
    unit?: string;
    condition?: string;
    contaminationStatus?: string;
    pickupLocation?: string;
    storageDetails?: string;
  };
  partnerMatch: {
    partnerId?: string;
    partnerName?: string;
    processingType?: string;
    isCompatible?: boolean;
    score?: number;
    matchReasons?: string[];
    limitations?: string[];
    minimumQuantityKg?: number;
    maximumQuantityKg?: number;
    serviceArea?: string[];
    facilityLocation?: string;
  };
}

export interface RecoveryExplanationResult {
  suitabilityExplanation: string;
  materialCompatibilitySummary: string;
  quantityConstraintSummary: string;
  serviceAreaSummary: string;
  keyHandlingAdvice: string;
  modelUsed: string;
  structured?: RecoveryMatchExplanationOutput;
}

export interface DraftRequestParams extends CollectionRequestParams {}
export interface DraftRequestResult {
  subject: string;
  draftMessage: string;
  keyHighlights: string[];
  modelUsed: string;
  structured?: CollectionRequestOutput;
}

// =============================================================
// API CLIENT IMPLEMENTATIONS
// =============================================================

/**
 * Check server AI health & model availability
 */
export async function checkAiHealth(): Promise<AiHealthStatus> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return {
        configured: false,
        status: 'error',
        model: 'openai/gpt-oss-20b',
        message: err.error || 'Server reported an error checking AI health.',
      };
    }
    return await res.json();
  } catch {
    return {
      configured: false,
      status: 'error',
      model: 'openai/gpt-oss-20b',
      message: 'Unable to connect to Gather AI server endpoints.',
    };
  }
}

/**
 * Universal Brain Dispatcher Endpoint
 */
export async function callGatherBrain<T = unknown>(
  task: string,
  input: Record<string, unknown>
): Promise<T> {
  const res = await fetch('/api/brain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task, input }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Brain request failed with HTTP ${res.status}.`);
  }

  return await res.json();
}

/**
 * Task 1: Crop Advice
 */
export async function fetchCropAdvice(
  params: CropAdviceParams
): Promise<CropAdviceOutput> {
  const res = await fetch('/api/crop-advice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Crop advice request failed with status ${res.status}.`);
  }

  return await res.json();
}

/**
 * Task 2: Harvest Readiness
 */
export async function fetchHarvestReadiness(
  params: {
    cropName: string;
    plantingDate?: string;
    location?: string;
    currentStage?: string;
    observedSigns?: string;
  }
): Promise<CropAdviceOutput> {
  const res = await fetch('/api/harvest-readiness', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Harvest readiness request failed with status ${res.status}.`);
  }

  return await res.json();
}

/**
 * Task 3: Surplus Recommendation
 */
export async function fetchSurplusRecommendation(
  params: SurplusRecommendationParams
): Promise<SurplusRecommendationOutput> {
  const res = await fetch('/api/surplus-recommendation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Surplus recommendation request failed with status ${res.status}.`);
  }

  return await res.json();
}

/**
 * Task 4: Recovery Match Explanation
 */
export async function fetchRecoveryMatchExplanation(
  params: RecoveryMatchExplanationParams
): Promise<RecoveryMatchExplanationOutput> {
  const res = await fetch('/api/recovery-match-explanation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Partner match explanation request failed with status ${res.status}.`);
  }

  return await res.json();
}

/**
 * Task 5: Collection Request Writer
 */
export async function fetchCollectionRequest(
  params: CollectionRequestParams
): Promise<CollectionRequestOutput> {
  const res = await fetch('/api/collection-request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Collection request generation failed with status ${res.status}.`);
  }

  return await res.json();
}

/**
 * Task 6: Ask Gather AI Shared Assistant
 */
export async function askGatherAssistant(
  params: GatherAssistantParams
): Promise<GatherAssistantOutput> {
  const res = await fetch('/api/gather-assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Gather AI Assistant request failed with status ${res.status}.`);
  }

  return await res.json();
}

/**
 * Task 7: Cross-Module Insights
 */
export async function fetchCrossModuleInsights(
  params: CrossModuleInsightsParams
): Promise<CrossModuleInsightsOutput> {
  const res = await fetch('/api/cross-module-insights', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Cross-module insights failed with status ${res.status}.`);
  }

  return await res.json();
}

// -------------------------------------------------------------
// Legacy Wrapper Functions
// -------------------------------------------------------------
export async function fetchHarvestGuidance(
  params: HarvestGuidanceParams
): Promise<HarvestGuidanceResult> {
  const res = await fetch('/api/harvest-guidance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `AI guidance request failed with status ${res.status}.`);
  }

  return await res.json();
}

export async function fetchRecoveryExplanation(
  params: RecoveryExplanationParams
): Promise<RecoveryExplanationResult> {
  const res = await fetch('/api/recovery-explanation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Partner explanation request failed with status ${res.status}.`);
  }

  return await res.json();
}

export async function fetchRequestDraft(
  params: DraftRequestParams
): Promise<DraftRequestResult> {
  const res = await fetch('/api/draft-request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request draft generation failed with status ${res.status}.`);
  }

  return await res.json();
}
