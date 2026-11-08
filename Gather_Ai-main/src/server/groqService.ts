import fs from 'fs';
import path from 'path';

/**
 * Gather AI — Shared Server-Side AI Brain
 * 
 * Flow:
 * USER INPUT -> CONTEXT RETRIEVAL -> APPLICATION RULES AND DATA VALIDATION
 * -> AI MODEL -> STRUCTURED RESPONSE VALIDATION -> USER-FACING RECOMMENDATIONS
 * 
 * Powered by GroqCloud (OpenAI-compatible endpoint):
 * Model: openai/gpt-oss-20b (or configurable via GROQ_MODEL)
 * API Key: Loaded strictly on the server from GROQ_API_KEY / .env.local
 */

const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';
export const DEFAULT_MODEL_ID = 'openai/gpt-oss-20b';

/**
 * Resolves the configured model ID from environment or default.
 */
export function getGroqModel(): string {
  if (process.env.GROQ_MODEL && process.env.GROQ_MODEL.trim().length > 0) {
    return process.env.GROQ_MODEL.trim();
  }
  return DEFAULT_MODEL_ID;
}

/**
 * Resolve the server-side GROQ_API_KEY securely.
 * Checks process.env first, then checks local env files.
 */
export function getGroqApiKey(): string | null {
  if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim().length > 0) {
    return process.env.GROQ_API_KEY.trim();
  }

  // Fallback to checking local env files on server startup
  const envFiles = ['.env.local', '.env'];
  for (const filename of envFiles) {
    const fullPath = path.resolve(process.cwd(), filename);
    if (fs.existsSync(fullPath)) {
      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        for (const line of content.split('\n')) {
          const trimmed = line.trim();
          if (trimmed.startsWith('GROQ_API_KEY=')) {
            const val = trimmed.split('=', 2)[1].replace(/["']/g, '').trim();
            if (val.length > 0) {
              process.env.GROQ_API_KEY = val;
              return val;
            }
          }
        }
      } catch {
        // Silently continue
      }
    }
  }

  return null;
}

/**
 * Low-level server-side caller for Groq chat completions
 */
async function callGroqCompletions(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  options: {
    temperature?: number;
    max_tokens?: number;
    timeoutMs?: number;
  } = {}
): Promise<string> {
  const apiKey = getGroqApiKey();
  if (!apiKey) {
    throw new Error('GROQ_API_KEY_MISSING');
  }

  const model = getGroqModel();
  const { temperature = 0.2, max_tokens = 1100, timeoutMs = 28000 } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Gather-AI-Server/1.0',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[Groq API Response Status ${response.status}]:`, errText);
      if (response.status === 429) {
        throw new Error('RATE_LIMITED');
      }
      if (response.status === 401 || response.status === 403) {
        throw new Error('AUTHENTICATION_FAILED');
      }
      let parsedErr = 'API error occurred';
      try {
        const j = JSON.parse(errText);
        parsedErr = j?.error?.message || parsedErr;
      } catch {
        // ignore
      }
      throw new Error(`GROQ_ERROR_${response.status}: ${parsedErr}`);
    }

    const data = (await response.json()) as {
      choices?: Array<{
        message?: {
          content?: string;
        };
      }>;
    };
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== 'string') {
      throw new Error('MALFORMED_AI_RESPONSE');
    }

    return content;
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        throw new Error('AI_REQUEST_TIMEOUT');
      }
      throw err;
    }
    throw new Error('UNKNOWN_AI_ERROR');
  }
}

/**
 * Safely parse JSON from model output that might contain surrounding text
 */
function extractJson<T>(rawText: string, fallback: T): T {
  try {
    return JSON.parse(rawText.trim());
  } catch {
    const match = rawText.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        // Fallback
      }
    }
    return fallback;
  }
}

// =========================================================================
// TYPES & SCHEMAS FOR THE 6 BRAIN TASKS
// =========================================================================

export type BrainTaskType = 
  | 'crop_advice'
  | 'harvest_readiness'
  | 'surplus_recommendation'
  | 'recovery_match_explanation'
  | 'collection_request'
  | 'gather_assistant'
  | 'cross_module_insights';

// 1. Crop Advice & Harvest Readiness
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

// 2. Surplus Recommendation
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

// 3. Recovery Match Explanation
export interface RecoveryMatchExplanationOutput {
  partner_id: string;
  match_summary: string;
  compatible_criteria: string[];
  conditions_to_verify: string[];
  next_action: string;
  model_used: string;
}

// 4. Collection Request
export interface CollectionRequestOutput {
  subject: string;
  message: string;
  missing_fields: string[];
  requires_user_review: boolean;
  key_highlights?: string[];
  model_used: string;
}

// 5. Shared Assistant
export interface GatherAssistantOutput {
  answer: string;
  key_points: string[];
  suggested_actions: string[];
  missing_information: string[];
  cautions: string[];
  model_used: string;
}

// 6. Cross-Module Insights
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

// =========================================================================
// TASK IMPLEMENTATIONS
// =========================================================================

/**
 * Task 1: Crop Advice
 */
export async function executeCropAdvice(input: {
  cropName: string;
  location?: string;
  plantingDate?: string;
  currentStage?: string;
  growingMethod?: string;
  soilType?: string;
  question?: string;
  variety?: string;
}): Promise<CropAdviceOutput> {
  const model = getGroqModel();
  const cropName = input.cropName?.trim().substring(0, 100) || 'Crop';
  const location = input.location?.trim().substring(0, 150) || 'India';
  const plantingDate = input.plantingDate?.trim() || '';
  const currentStage = input.currentStage?.trim() || '';
  const question = input.question?.trim().substring(0, 1000) || 'Provide current crop management guidance and stage priorities.';
  const variety = input.variety?.trim() || '';
  const growingMethod = input.growingMethod?.trim() || 'Open Field';

  const systemPrompt = `You are Gather AI's Agronomic Intelligence Engine serving Indian growers and smallholders.
Provide grounded, practical, structured crop guidance.

CRITICAL CONSTRAINTS:
1. Explain the likely growth stage only when there is sufficient information.
2. Suggest up to 3 prioritized recommendations. Each recommendation must have:
   - "title": short action title
   - "action": what the user should do
   - "reason": why it matters
   - "priority": "high", "medium", or "low"
3. HARVEST READINESS: Estimate a harvest window ONLY when supported by a plausible planting date and crop-specific duration benchmarks.
   - If planting date is provided: Provide "earliest_date" and "latest_date" in ISO YYYY-MM-DD format (or estimated dates based on the planting date), along with "basis" and "confidence_note".
   - If planting date is unknown or insufficient: Set "harvest_estimate" to null, and explain in "missing_information" what is needed.
   - NEVER fabricate exact calendar harvest dates without caveats or claim a crop is ready based only on day counts alone.
4. CROP SAFETY: Never confidently diagnose plant diseases from text alone. Do NOT prescribe specific synthetic chemical cocktails without context.
5. Identify any missing information and environmental cautions.
6. Provide response strictly as a JSON object with no markdown backticks.

JSON SCHEMA:
{
  "summary": "2-3 sentences overview of crop status and priorities",
  "likely_stage": "current stage name or null",
  "recommendations": [
    {
      "title": "Concise title",
      "action": "Specific practical task",
      "reason": "Agronomic rationale",
      "priority": "high" | "medium" | "low"
    }
  ],
  "harvest_estimate": {
    "earliest_date": "YYYY-MM-DD" or null,
    "latest_date": "YYYY-MM-DD" or null,
    "basis": "Variety duration benchmarks",
    "confidence_note": "Depends on temperature, moisture, and local micro-climate"
  } or null,
  "missing_information": ["Items that would improve guidance"],
  "cautions": ["Risks to monitor (pests, heat stress, moisture)"],
  "disclaimer": "Recommendations are general agricultural guidance. Important crop-health and planting decisions should be verified with a qualified agricultural expert or your local Krishi Vigyan Kendra (KVK) / agricultural extension service."
}`;

  const userPrompt = `CROP RECORD:
- Crop Name: ${cropName} ${variety ? `(Variety: ${variety})` : ''}
- Region: ${location}
- Planting Date: ${plantingDate || 'Not specified'}
- Recorded Stage: ${currentStage || 'Not specified'}
- Growing Method: ${growingMethod}
- User Question / Observed Concern: ${question}`;

  const rawOutput = await callGroqCompletions([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]);

  const parsed = extractJson<Partial<CropAdviceOutput>>(rawOutput, {});

  const recommendations: CropRecommendationItem[] = Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0
    ? parsed.recommendations.slice(0, 3).map((r) => ({
        title: r.title || 'Crop Monitoring',
        action: r.action || 'Inspect canopy moisture and root vigor.',
        reason: r.reason || 'Sustains vegetative vigor and flowering uniformity.',
        priority: (['high', 'medium', 'low'].includes(r.priority) ? r.priority : 'medium') as 'high' | 'medium' | 'low',
      }))
    : [
        {
          title: 'Moisture Management',
          action: 'Maintain uniform root-zone moisture; avoid intermittent drying and waterlogging.',
          reason: 'Prevents physiological stresses, flower drop, and root asphyxiation.',
          priority: 'high',
        },
        {
          title: 'Canopy Inspection',
          action: 'Monitor underside of leaves for early sucking pest colonization or fungal spots.',
          reason: 'Early detection prevents rapid field infestation during warm hours.',
          priority: 'medium',
        },
      ];

  const harvestEstimate = parsed.harvest_estimate && typeof parsed.harvest_estimate === 'object'
    ? {
        earliest_date: parsed.harvest_estimate.earliest_date || null,
        latest_date: parsed.harvest_estimate.latest_date || null,
        basis: parsed.harvest_estimate.basis || 'Standard agro-climatic growth duration cycle',
        confidence_note: parsed.harvest_estimate.confidence_note || 'Harvest readiness requires field verification of fruit color break and firmness.',
      }
    : null;

  return {
    summary: parsed.summary || `Agronomic guidance for ${cropName} in ${location}.`,
    likely_stage: parsed.likely_stage || (currentStage || null),
    recommendations,
    harvest_estimate: plantingDate ? harvestEstimate : null,
    missing_information: Array.isArray(parsed.missing_information) && parsed.missing_information.length > 0
      ? parsed.missing_information
      : (plantingDate ? ['Recent rainfall records', 'Specific seed variety'] : ['Planting / sowing date is required to calculate harvest timing']),
    cautions: Array.isArray(parsed.cautions) && parsed.cautions.length > 0
      ? parsed.cautions
      : ['Monitor midday heat stress and leaf curl.', 'Avoid chemical application during peak flowering.'],
    disclaimer: 'Recommendations are general agricultural guidance. Important crop-health and planting decisions should be verified with a qualified agricultural expert or your local Krishi Vigyan Kendra (KVK) / agricultural extension service.',
    model_used: model,
  };
}

/**
 * Task 2: Harvest Readiness
 */
export async function executeHarvestReadiness(input: {
  cropName: string;
  plantingDate?: string;
  location?: string;
  currentStage?: string;
  observedSigns?: string;
}): Promise<CropAdviceOutput> {
  return executeCropAdvice({
    cropName: input.cropName,
    plantingDate: input.plantingDate,
    location: input.location,
    currentStage: input.currentStage || 'Harvest Assessment Phase',
    question: `Evaluate harvest readiness based on physical indicators and elapsed duration. Observed signs: ${input.observedSigns || 'Standard field monitoring'}. Is it ready for harvest?`,
  });
}

/**
 * Task 3: Surplus Recommendation
 */
export async function executeSurplusRecommendation(input: {
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
}): Promise<SurplusRecommendationOutput> {
  const model = getGroqModel();
  const materialType = input.materialType?.trim() || 'Organic Biomass';
  const quantity = input.quantity ?? 50;
  const unit = input.unit?.trim() || 'kg';
  const condition = input.condition?.trim() || 'Sound / Unsold surplus';
  const edibleOrWaste = input.edibleOrWaste?.trim() || 'Inedible organic discard';
  const timeBeforeDeterioration = input.timeBeforeDeterioration?.trim() || '24-48 hours';
  const pickupLocation = input.pickupLocation?.trim() || 'Farm Gate / Collection Point';
  const userObjective = input.userObjective?.trim() || 'Prevent landfill disposal and capture organic recovery value';

  const systemPrompt = `You are Gather AI's Food Waste Recovery Coordinator.
Your role is to evaluate surplus agricultural produce or organic waste and recommend realistic, practical circular recovery routes.

CRITICAL RULES:
1. Distinguish edible surplus from organic waste requiring biological recovery. Do NOT recommend human consumption or animal feed unless the condition is explicitly confirmed safe, unblemished, and handled under food-grade standards.
2. Consider realistic recovery routes:
   - For edible produce in sound condition: "Edible Surplus Redistribution / Local Food Banks"
   - For perishable wet horticultural waste (culls, peels, rotten produce): "Commercial Windrow Composting" or "Biomethanation / Bio-CNG"
   - For starchy or protein-rich scraps: "Black Soldier Fly Larvae (BSFL) Bioconversion"
   - For dry fibrous crop residue: "Biochar Pyrolysis / Soil Conditioner"
3. Ground the recommendation in urgency (time before deterioration) and quantity constraints.
4. Highlight essential conditions to check (segregation, foreign plastics, moisture level).
5. Suggest a concrete next action within the Gather AI platform (e.g. "Register this batch in Food Waste Recovery to match with compatible local composters").
6. Output strictly JSON with no markdown backticks.

JSON SCHEMA:
{
  "summary": "2-3 sentences evaluating the material and urgency",
  "recommended_route": "Primary recommended processing route",
  "other_options": ["1-2 alternative viable routes"],
  "reasoning": "Clear explanation of why this route is technically and logistically suitable",
  "conditions_to_check": ["2-3 verification checks before handoff (e.g. plastic film removal, moisture)"],
  "missing_information": ["Any missing details regarding storage, chemical residue, or packaging"],
  "next_action": "Specific step inside Gather AI"
}`;

  const userPrompt = `SURPLUS / WASTE MATERIAL:
- Material: ${materialType}
- Volume: ${quantity} ${unit}
- Condition: ${condition}
- Classification: ${edibleOrWaste}
- Window Before Decay: ${timeBeforeDeterioration}
- Location: ${pickupLocation}
- Objective: ${userObjective}
- Available Partner Capabilities in System: ${input.availableRoutes?.join(', ') || 'Commercial Composting, Bio-CNG / Anaerobic Digestion, Vermicomposting'}`;

  const rawOutput = await callGroqCompletions([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]);

  const parsed = extractJson<Partial<SurplusRecommendationOutput>>(rawOutput, {});

  return {
    summary: parsed.summary || `Evaluation for ${quantity} ${unit} of ${materialType} in ${pickupLocation}.`,
    recommended_route: parsed.recommended_route || 'Aerobic Windrow Composting',
    other_options: Array.isArray(parsed.other_options) && parsed.other_options.length > 0
      ? parsed.other_options
      : ['Biomethanation / Bio-CNG', 'Organic Soil Conditioner'],
    reasoning: parsed.reasoning || `${materialType} has high biological matter suitable for rapid aerobic decomposition, converting surplus into enriched soil organic carbon.`,
    conditions_to_check: Array.isArray(parsed.conditions_to_check) && parsed.conditions_to_check.length > 0
      ? parsed.conditions_to_check
      : ['Verify batch is free from plastic mulch film, rubber bands, or twine.', 'Keep stored in ventilated, shaded crates to control moisture.'],
    missing_information: Array.isArray(parsed.missing_information) && parsed.missing_information.length > 0
      ? parsed.missing_information
      : ['Storage container type', 'Exact harvest date of the batch'],
    next_action: parsed.next_action || 'Proceed to register this batch in Food Waste Recovery and run partner matching.',
    model_used: model,
  };
}

/**
 * Task 4: Recovery Match Explanation
 */
export async function executeRecoveryMatchExplanation(input: {
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
}): Promise<RecoveryMatchExplanationOutput> {
  const model = getGroqModel();
  const { wasteRecord, partnerMatch } = input;
  if (!wasteRecord || !partnerMatch) {
    throw new Error('Waste record and candidate partner match data are required.');
  }

  const partnerId = partnerMatch.partnerId || 'partner-default';
  const partnerName = partnerMatch.partnerName || 'Certified Recovery Facility';
  const processingType = partnerMatch.processingType || 'Organic Recovery';
  const isCompatible = partnerMatch.isCompatible !== false;
  const score = partnerMatch.score ?? 85;
  const serviceAreas = Array.isArray(partnerMatch.serviceArea) ? partnerMatch.serviceArea : ['Operational Territory'];
  const matchReasons = Array.isArray(partnerMatch.matchReasons) && partnerMatch.matchReasons.length > 0
    ? partnerMatch.matchReasons
    : ['Material intake stream aligns with processing technology'];
  const limitations = Array.isArray(partnerMatch.limitations) && partnerMatch.limitations.length > 0
    ? partnerMatch.limitations
    : ['Standard biological purity thresholds apply'];

  const systemPrompt = `You are Gather AI's Partner Matching Explainer.
The application's deterministic matching engine is the ABSOLUTE SOURCE OF TRUTH.
Your task is to explain why this candidate partner was scored as ${isCompatible ? 'COMPATIBLE' : 'INCOMPATIBLE'} (${score}% match) based strictly on the provided data.

CRITICAL RULES:
1. Use ONLY the supplied partner ID "${partnerId}" and partner name "${partnerName}". NEVER invent or substitute another partner.
2. The compatibility outcome (${isCompatible ? 'Compatible' : 'Incompatible'}) cannot be overridden. If incompatible, explain the exact threshold violated.
3. NEVER claim a collection request has been sent or accepted. It is a candidate match.
4. Provide structured criteria analysis.
5. Output strictly JSON.

JSON SCHEMA:
{
  "partner_id": "${partnerId}",
  "match_summary": "2-3 sentences explaining the algorithmic score and operational alignment",
  "compatible_criteria": ["2-3 specific criteria that passed (e.g. volume within limits, matching material intake)"],
  "conditions_to_verify": ["1-2 items to confirm prior to dispatch (e.g. moisture tolerance, vehicle clearance)"],
  "next_action": "Recommended next action in Gather AI (e.g. Prepare Collection Request)"
}`;

  const userPrompt = `WASTE BATCH:
- Material: ${wasteRecord.materialType} (${wasteRecord.materialCategory || 'General Organic'})
- Volume: ${wasteRecord.quantity} ${wasteRecord.unit || 'kg'}
- Condition: ${wasteRecord.condition || 'Fresh'}
- Contamination Level: ${wasteRecord.contaminationStatus || 'Clean'}
- Pickup Location: ${wasteRecord.pickupLocation || 'Farm Gate'}

DETERMINISTIC MATCH RESULT:
- Partner ID: ${partnerId}
- Partner Name: ${partnerName}
- Technology: ${processingType}
- Compatibility: ${isCompatible ? 'COMPATIBLE' : 'INCOMPATIBLE'} (${score}% Score)
- Minimum: ${partnerMatch.minimumQuantityKg || 50} kg, Maximum: ${partnerMatch.maximumQuantityKg || 10000} kg
- Location: ${partnerMatch.facilityLocation || 'Regional Park'}
- Service Coverage: ${serviceAreas.join(', ')}
- Algorithmic Reasons: ${matchReasons.join('; ')}
- Algorithmic Limitations: ${limitations.join('; ')}`;

  const rawOutput = await callGroqCompletions([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]);

  const parsed = extractJson<Partial<RecoveryMatchExplanationOutput>>(rawOutput, {});

  return {
    partner_id: partnerId,
    match_summary: parsed.match_summary || `${partnerName} matched with ${score}% compatibility based on material intake stream and volume criteria.`,
    compatible_criteria: Array.isArray(parsed.compatible_criteria) && parsed.compatible_criteria.length > 0
      ? parsed.compatible_criteria
      : [
          `Intake technology (${processingType}) accepts ${wasteRecord.materialType}.`,
          `Batch quantity (${wasteRecord.quantity} ${wasteRecord.unit || 'kg'}) satisfies facility capacity bounds.`,
          `Pickup location is within the active service perimeter.`,
        ],
    conditions_to_verify: Array.isArray(parsed.conditions_to_verify) && parsed.conditions_to_verify.length > 0
      ? parsed.conditions_to_verify
      : ['Confirm batch moisture does not exceed facility intake threshold.', 'Verify collection vehicle access road.'],
    next_action: parsed.next_action || 'Proceed to generate and review the collection request message.',
    model_used: model,
  };
}

/**
 * Task 5: Collection Request Writer
 */
export async function executeCollectionRequest(input: {
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
}): Promise<CollectionRequestOutput> {
  const model = getGroqModel();
  const { wasteRecord, partner } = input;
  if (!wasteRecord || !partner) {
    throw new Error('Waste record and partner details are required.');
  }

  const partnerName = partner.name || 'Recovery Facility';
  const coordinatorName = partner.coordinatorName || 'Operations & Logistics Lead';
  const batchId = wasteRecord.id || 'BATCH-REQ';

  const systemPrompt = `You are Gather AI's Collection Request Writer.
Draft a professional, concise, courteous collection inquiry message from the producer to the recovery facility coordinator.

CRITICAL RULES:
1. Use real batch values. Never invent fictitious quantities, pickup addresses, or coordinator names.
2. DO NOT claim the message was already sent, scheduled, or that pickup is confirmed. This is a draft for user review.
3. Include specific coordination details: exact material, quantity, storage container, requested pickup window, and 2 operational questions (ramp/crate tipper access, crate return).
4. Identify any missing fields clearly.
5. Set "requires_user_review": true always.
6. Output strictly JSON.

JSON SCHEMA:
{
  "subject": "Clear subject line including material, volume, and location",
  "message": "Complete professional message text with salutation and Gather AI reference",
  "missing_fields": ["Any fields that were missing or had placeholders"],
  "requires_user_review": true,
  "key_highlights": ["3 concise bullets summarizing volume, window, and handling"]
}`;

  const userPrompt = `PARTNER COORDINATOR:
- Facility: ${partnerName} (${partner.processingType || 'Organic Recovery'})
- Coordinator: ${coordinatorName}
- Location: ${partner.location || 'Regional Facility'}

BATCH SPECIFICATIONS:
- Batch Ref: ${batchId}
- Material: ${wasteRecord.materialType} (${wasteRecord.materialCategory || 'Organic'})
- Quantity: ${wasteRecord.quantity} ${wasteRecord.unit || 'kg'}
- Quality / Condition: ${wasteRecord.condition || 'Fresh'}
- Segregation: ${wasteRecord.contaminationStatus || 'Clean / Segregated'}
- Storage: ${wasteRecord.storageDetails || 'Ventilated crates under shade'}
- Pickup Location: ${wasteRecord.pickupLocation || 'Farm gate'}
- Preferred Collection Window: ${wasteRecord.preferredPickupWindow || 'Morning (08:00 - 11:00 AM)'}
- Sender Name: ${wasteRecord.contactName || 'Gather AI Producer'}
${input.specialInstructions ? `- Special Instructions: ${input.specialInstructions}` : ''}`;

  const rawOutput = await callGroqCompletions([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]);

  const parsed = extractJson<Partial<CollectionRequestOutput>>(rawOutput, {});

  const missingFields: string[] = [];
  if (!wasteRecord.preferredPickupWindow) missingFields.push('Preferred pickup time window');
  if (!wasteRecord.contactName) missingFields.push('On-site contact person name');

  return {
    subject: parsed.subject || `Collection Inquiry: ${wasteRecord.quantity} ${wasteRecord.unit || 'kg'} ${wasteRecord.materialType} – ${wasteRecord.pickupLocation}`,
    message: parsed.message || `Dear ${coordinatorName},\n\nWe have registered a batch of ${wasteRecord.materialType} (${wasteRecord.quantity} ${wasteRecord.unit || 'kg'}) at ${wasteRecord.pickupLocation} and would like to coordinate a pickup with ${partnerName}.\n\nPreferred window: ${wasteRecord.preferredPickupWindow || 'Flexible'}.\n\nPlease let us know your logistics schedule.\n\nBest regards,\n${wasteRecord.contactName || 'Gather AI Producer'}`,
    missing_fields: Array.isArray(parsed.missing_fields) && parsed.missing_fields.length > 0 ? parsed.missing_fields : missingFields,
    requires_user_review: true,
    key_highlights: Array.isArray(parsed.key_highlights) && parsed.key_highlights.length > 0
      ? parsed.key_highlights
      : [
          `${wasteRecord.quantity} ${wasteRecord.unit || 'kg'} ${wasteRecord.materialType}`,
          `Pickup at ${wasteRecord.pickupLocation}`,
          `Facility: ${partnerName}`,
        ],
    model_used: model,
  };
}

/**
 * Task 6: Shared Assistant ("Ask Gather AI")
 */
export async function executeGatherAssistant(input: {
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
}): Promise<GatherAssistantOutput> {
  const model = getGroqModel();
  const question = input.question?.trim().substring(0, 1000);
  if (!question) {
    throw new Error('A question is required for Ask Gather AI.');
  }

  const ctx = input.context || {};
  let contextDescription = `Active App Tab: ${ctx.activeTab || 'General Dashboard'}\n`;

  if (ctx.cropRecord) {
    contextDescription += `ACTIVE CROP CONTEXT:
- Name: ${ctx.cropRecord.cropName} (${ctx.cropRecord.variety || 'Standard'})
- Region: ${ctx.cropRecord.location}
- Planting Date: ${ctx.cropRecord.plantingDate || 'Unknown'}
- Current Stage: ${ctx.cropRecord.currentStage || 'Vegetative'}
- Surplus Flagged: ${ctx.cropRecord.hasSurplusFlagged ? 'YES' : 'NO'}\n`;
  }

  if (ctx.wasteRecord) {
    contextDescription += `ACTIVE ORGANIC WASTE CONTEXT:
- Material: ${ctx.wasteRecord.materialType}
- Volume: ${ctx.wasteRecord.quantity} ${ctx.wasteRecord.unit}
- Quality: ${ctx.wasteRecord.condition}
- Lifecycle Status: ${ctx.wasteRecord.status}
- Location: ${ctx.wasteRecord.pickupLocation}\n`;
  }

  if (ctx.partner) {
    contextDescription += `VIEWED RECOVERY PARTNER:
- Facility: ${ctx.partner.name} (${ctx.partner.processingType})
- Location: ${ctx.partner.location}\n`;
  }

  if (ctx.appStateSummary) {
    contextDescription += `CURRENT PLATFORM TOTALS:
- Registered Crops: ${ctx.appStateSummary.cropCount} (Active Harvests: ${ctx.appStateSummary.activeHarvestCrops.join(', ') || 'None'})
- Flagged Surplus: ${ctx.appStateSummary.flaggedSurplusCrops.join(', ') || 'None'}
- Open Waste Batches: ${ctx.appStateSummary.wasteCount}
- Pending Requests: ${ctx.appStateSummary.pendingRequestsCount}\n`;
  }

  const systemPrompt = `You are the Gather AI Brain — an intelligent sustainability assistant uniting Harvest Intelligence with Food Waste Recovery for Indian growers and circular partners.

CORE BEHAVIOUR:
1. Explain recommendations in simple, trustworthy, practical language.
2. USE THE SUPPLIED CONTEXT. If the user asks about "my crop" and a crop record is in the context, refer directly to it.
3. For general crop inquiries (e.g. "give me the stages of a crop" or "explain the main stages of crop growth"):
   - Clearly explain the standard agricultural growth phases in simple terms: Germination / Seedling, Vegetative, Flowering / Reproductive, Ripening / Maturation, and Harvest.
   - Gently ask which specific crop they are growing if they need tailored duration, irrigation, or recovery advice.
4. Connect harvest decisions with waste recovery: when crops approach maturity or surplus is mentioned, highlight practical recovery pathways.
5. Distinguish known facts from estimates. Never invent live sensors, weather readings, or imaginary partner contacts.
6. If the question is outside agriculture or organic recovery, provide a brief courteous answer, then steer back to Gather AI.
7. Provide response strictly as a JSON object with no markdown backticks.

JSON SCHEMA:
{
  "answer": "Clear, direct, conversational answer (2-4 paragraphs)",
  "key_points": ["2-3 crucial takeaways"],
  "suggested_actions": ["2 practical next steps inside Gather AI"],
  "missing_information": ["Any missing detail that would improve this guidance"],
  "cautions": ["Important cautions (crop health, spoilage window, safety)"]
}`;

  const userPrompt = `USER CONTEXT:\n${contextDescription}\n\nUSER QUESTION:\n${question}`;

  const rawOutput = await callGroqCompletions([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]);

  const parsed = extractJson<Partial<GatherAssistantOutput>>(rawOutput, {});

  return {
    answer: parsed.answer || 'Gather AI connects your crop cultivation decisions with practical organic waste recovery.',
    key_points: Array.isArray(parsed.key_points) && parsed.key_points.length > 0
      ? parsed.key_points
      : ['Align field harvest windows with market readiness.', 'Prepare organic recovery channels before perishability sets in.'],
    suggested_actions: Array.isArray(parsed.suggested_actions) && parsed.suggested_actions.length > 0
      ? parsed.suggested_actions
      : ['Review crop stage guidance in Harvest Intelligence', 'Explore compatible recovery hubs in Food Waste Recovery'],
    missing_information: Array.isArray(parsed.missing_information) ? parsed.missing_information : [],
    cautions: Array.isArray(parsed.cautions) ? parsed.cautions : ['Always verify major crop interventions with local extension experts.'],
    model_used: model,
  };
}

/**
 * Task 7: Cross-Module Insights Generator
 * Evaluates real crops and waste records to generate proactive circular recommendations
 */
export async function executeCrossModuleInsights(input: {
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
}): Promise<CrossModuleInsightsOutput> {
  const model = getGroqModel();
  const { crops, wasteRecords } = input;

  // Algorithmic foundation first (deterministic source of truth)
  const algorithmicInsights: CrossModuleInsightItem[] = [];

  // 1. Check for crops with surplus flagged but not yet in waste records
  for (const crop of crops) {
    if (crop.hasSurplusFlagged && crop.surplusDetails) {
      const alreadyTransferred = wasteRecords.some((w) => w.materialType.toLowerCase().includes(crop.cropName.toLowerCase()));
      if (!alreadyTransferred) {
        algorithmicInsights.push({
          id: `insight-surplus-${crop.id}`,
          type: 'surplus_action',
          title: `Unrouted Surplus: ${crop.cropName}`,
          description: `${crop.surplusDetails.estimatedQuantity} ${crop.surplusDetails.unit} of surplus produce has been flagged in ${crop.location}. Connecting it to recovery prevents field loss.`,
          recommended_action: `Initiate hand-off to Food Waste Recovery for ${crop.cropName}`,
          urgency: 'high',
          target_tab: 'harvest',
          related_crop_id: crop.id,
        });
      }
    }
  }

  // 2. Check for active harvest windows
  for (const crop of crops) {
    if (crop.currentStage === 'Harvest Window Active') {
      algorithmicInsights.push({
        id: `insight-harvest-${crop.id}`,
        type: 'harvest_planning',
        title: `Harvest Window Active: ${crop.cropName}`,
        description: `${crop.cropName} has reached peak harvest timing. Pre-aligning recovery partners cushions against sorting gluts.`,
        recommended_action: `Review post-harvest storage and pre-screen local composting hubs`,
        urgency: 'medium',
        target_tab: 'harvest',
        related_crop_id: crop.id,
      });
    }
  }

  // 3. Check for open waste records with no partner requests
  for (const waste of wasteRecords) {
    if (waste.status === 'Registered' || waste.status === 'Matching Available') {
      algorithmicInsights.push({
        id: `insight-match-${waste.id}`,
        type: 'partner_coordination',
        title: `Pending Recovery Batch: ${waste.materialType}`,
        description: `${waste.quantity} ${waste.unit} of organic biomass is awaiting facility matching and request preparation.`,
        recommended_action: `Run partner matching and generate a collection request`,
        urgency: 'high',
        target_tab: 'waste',
        related_waste_id: waste.id,
      });
    }
  }

  return {
    insights: algorithmicInsights.slice(0, 4),
    overall_status: algorithmicInsights.length > 0
      ? `${algorithmicInsights.length} circular opportunities identified across harvest and recovery.`
      : 'All crops and organic recovery batches are actively routed.',
    model_used: model,
  };
}

/**
 * Unified Brain Dispatcher
 */
export async function executeGatherBrain(
  task: BrainTaskType,
  payload: Record<string, unknown>
): Promise<unknown> {
  switch (task) {
    case 'crop_advice':
      return executeCropAdvice(payload as unknown as Parameters<typeof executeCropAdvice>[0]);
    case 'harvest_readiness':
      return executeHarvestReadiness(payload as unknown as Parameters<typeof executeHarvestReadiness>[0]);
    case 'surplus_recommendation':
      return executeSurplusRecommendation(payload as unknown as Parameters<typeof executeSurplusRecommendation>[0]);
    case 'recovery_match_explanation':
      return executeRecoveryMatchExplanation(payload as unknown as Parameters<typeof executeRecoveryMatchExplanation>[0]);
    case 'collection_request':
      return executeCollectionRequest(payload as unknown as Parameters<typeof executeCollectionRequest>[0]);
    case 'gather_assistant':
      return executeGatherAssistant(payload as unknown as Parameters<typeof executeGatherAssistant>[0]);
    case 'cross_module_insights':
      return executeCrossModuleInsights(payload as unknown as Parameters<typeof executeCrossModuleInsights>[0]);
    default:
      throw new Error(`Unsupported brain task: ${task}`);
  }
}

// =========================================================================
// BACKWARD COMPATIBILITY WRAPPERS FOR EXISTING ENDPOINTS
// =========================================================================

export async function generateHarvestGuidance(input: {
  cropName: string;
  location: string;
  plantingDate?: string;
  currentStage?: string;
  question?: string;
  growingMethod?: string;
  soilType?: string;
}) {
  const result = await executeCropAdvice(input);
  return {
    stageAssessment: result.summary,
    practicalNextSteps: result.recommendations.map((r) => `${r.title}: ${r.action}`),
    harvestWindowEstimate: result.harvest_estimate
      ? `${result.harvest_estimate.earliest_date ? `From ${result.harvest_estimate.earliest_date} to ${result.harvest_estimate.latest_date}. ` : ''}${result.harvest_estimate.basis}. ${result.harvest_estimate.confidence_note}`
      : 'Planting date is required to provide an estimated harvest window.',
    criticalObservations: result.cautions,
    cautionsAndRisks: result.cautions,
    missingInformationNotice: result.missing_information.length > 0 ? result.missing_information.join('; ') : null,
    expertDisclaimer: result.disclaimer,
    modelUsed: result.model_used,
    // Include full structured output for upgraded consumers
    structured: result,
  };
}

export async function generateRecoveryExplanation(input: {
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
}) {
  const pMatch = {
    partnerId: input.partnerMatch.partnerId || 'partner-hub',
    partnerName: input.partnerMatch.partnerName || 'Recovery Partner',
    processingType: input.partnerMatch.processingType || 'Organic Recovery',
    isCompatible: input.partnerMatch.isCompatible !== false,
    score: input.partnerMatch.score ?? 85,
    matchReasons: input.partnerMatch.matchReasons,
    limitations: input.partnerMatch.limitations,
    minimumQuantityKg: input.partnerMatch.minimumQuantityKg,
    maximumQuantityKg: input.partnerMatch.maximumQuantityKg,
    serviceArea: input.partnerMatch.serviceArea,
    facilityLocation: input.partnerMatch.facilityLocation,
  };

  const result = await executeRecoveryMatchExplanation({
    wasteRecord: input.wasteRecord,
    partnerMatch: pMatch,
  });

  return {
    suitabilityExplanation: result.match_summary,
    materialCompatibilitySummary: result.compatible_criteria[0] || 'Material stream aligns with processing technology.',
    quantityConstraintSummary: result.compatible_criteria[1] || 'Batch volume is within processing envelope.',
    serviceAreaSummary: result.compatible_criteria[2] || 'Location is within active transport service radius.',
    keyHandlingAdvice: result.conditions_to_verify.join('; ') || 'Ensure segregation in ventilated containers.',
    modelUsed: result.model_used,
    structured: result,
  };
}

export async function generateCollectionRequestDraft(input: {
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
}) {
  const result = await executeCollectionRequest(input);
  return {
    subject: result.subject,
    draftMessage: result.message,
    keyHighlights: result.key_highlights || [],
    modelUsed: result.model_used,
    structured: result,
  };
}

// =========================================================================
// HEALTH & MODEL AVAILABILITY CHECK
// =========================================================================

export async function checkServerAiHealth(): Promise<{
  configured: boolean;
  status: 'connected' | 'missing_key' | 'error';
  model: string;
  message: string;
}> {
  const apiKey = getGroqApiKey();
  const targetModel = getGroqModel();

  if (!apiKey) {
    return {
      configured: false,
      status: 'missing_key',
      model: targetModel,
      message: 'GROQ_API_KEY environment variable is not configured on the server.',
    };
  }

  try {
    const res = await fetch(`${GROQ_BASE_URL}/models`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'User-Agent': 'Gather-AI-Server/1.0',
      },
    });

    if (res.ok) {
      const data = (await res.json()) as { data?: Array<{ id: string }> };
      const models = data?.data?.map((m: { id: string }) => m.id) || [];
      const isAvailable = models.includes(targetModel);

      return {
        configured: true,
        status: 'connected',
        model: isAvailable ? targetModel : (models[0] || targetModel),
        message: isAvailable
          ? `Connected to GroqCloud API. Model ${targetModel} verified active.`
          : `Connected to GroqCloud API, but ${targetModel} was not in list. Available: ${models.slice(0, 3).join(', ')}`,
      };
    } else {
      return {
        configured: true,
        status: 'error',
        model: targetModel,
        message: `GroqCloud API returned HTTP ${res.status}. Check API key permissions.`,
      };
    }
  } catch (err: unknown) {
    return {
      configured: true,
      status: 'error',
      model: targetModel,
      message: err instanceof Error ? err.message : 'Unable to connect to GroqCloud API.',
    };
  }
}

/**
 * Task: Marketplace Listing Description Assistant
 * Polishes a farmer's rough description strictly using supplied facts without inventing fake claims.
 */
export async function executeMarketplaceListingAssistant(input: {
  commodityName: string;
  category: string;
  variety?: string;
  grade?: string;
  quantity?: number;
  unit?: string;
  location?: string;
  condition?: string;
  roughNotes?: string;
}): Promise<{ improvedDescription: string; completenessFeedback: string[] }> {
  const systemPrompt = `You are an honest agricultural listing assistant for Gather AI, a direct farmer-to-buyer agricultural marketplace.
Your goal is to polish a farmer's rough description into a professional, clear, and compelling trade summary.

CRITICAL TRUTHFULNESS RULES:
1. Base the description STRICTLY AND ONLY on the facts supplied.
2. DO NOT invent certifications (e.g. "certified organic", "FSSAI approved", "ISO"), chemical treatments, lab tests, or grades that were not provided.
3. If no grade or variety is mentioned, do not guess one.
4. Keep the description concise (2-4 clear sentences). Highlight commodity type, condition, packaging/handling, and suitability for buyers.
5. Provide 2-3 brief bullet suggestions on any missing details that would help buyers (e.g., specific variety, packaging type, exact collection timing).

Respond STRICTLY in JSON format with two keys:
{
  "improvedDescription": "string",
  "completenessFeedback": ["string", "string"]
}`;

  const userPrompt = `Commodity: ${input.commodityName || 'Produce'}
Category: ${input.category || 'Agricultural Produce'}
Variety: ${input.variety || 'Not specified'}
Grade: ${input.grade || 'Not specified'}
Quantity: ${input.quantity ? `${input.quantity} ${input.unit || ''}` : 'Not specified'}
Location: ${input.location || 'Not specified'}
Condition: ${input.condition || 'Not specified'}
Farmer's Notes: ${input.roughNotes || 'Fresh harvest ready for direct buyer collection.'}

Generate an honest, polished description and bullet feedback.`;

  try {
    const raw = await callGroqCompletions([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ], { temperature: 0.3 });

    const parsed = JSON.parse(raw);
    return {
      improvedDescription: parsed.improvedDescription || input.roughNotes || 'Freshly harvested lot available for direct pickup.',
      completenessFeedback: Array.isArray(parsed.completenessFeedback) ? parsed.completenessFeedback : [],
    };
  } catch {
    const fallbackDesc = `${input.commodityName || 'Agricultural lot'} (${input.category || 'Produce'}) available directly from farmgate at ${input.location || 'farm location'}. ${input.condition ? `Condition: ${input.condition}. ` : ''}${input.roughNotes || 'Lot sorted and ready for buyer inspection and collection.'}`;
    return {
      improvedDescription: fallbackDesc,
      completenessFeedback: [
        !input.variety ? 'Adding the specific crop variety helps buyers assess market grade.' : '',
        !input.grade ? 'Indicating whether this is Grade A, Mandi standard, or processing grade clarifies quality.' : '',
      ].filter(Boolean),
    };
  }
}

/**
 * Task: Natural Language Query Interpreter for Marketplace
 */
export async function executeMarketplaceQueryInterpreter(input: {
  query: string;
  mode: 'buy' | 'sell';
}): Promise<{
  interpretedIntent: string;
  suggestedCategory?: string;
  suggestedMaxPrice?: number;
  suggestedLocation?: string;
  extractedKeywords: string[];
}> {
  const systemPrompt = `You are a search query interpreter for Gather AI's agricultural marketplace.
Mode: ${input.mode === 'buy' ? 'BUY (Fertilizer and soil products)' : 'SELL (Agricultural produce and commodities)'}.

Analyze the user's natural language search query and extract structured filter suggestions.
Respond STRICTLY in JSON format:
{
  "interpretedIntent": "Brief 1-sentence summary of what the user is looking for",
  "suggestedCategory": "One of ['Organic Compost', 'Vermicompost', 'Enriched Bio-Slurry', 'Soil Conditioner & Bio-Pellets', 'Bio-Enzymes & Liquid Manure', 'Insect Frass Fertilizer'] if in BUY mode; or ['Vegetables', 'Fruits', 'Grains & Cereals', 'Pulses', 'Seeds & Planting Materials', 'Standing Crops'] if in SELL mode; or null if not obvious",
  "suggestedMaxPrice": number or null,
  "suggestedLocation": "City/State mentioned or null",
  "extractedKeywords": ["keyword1", "keyword2"]
}`;

  try {
    const raw = await callGroqCompletions([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `User query: "${input.query}"` },
    ], { temperature: 0.2 });

    const parsed = JSON.parse(raw);
    return {
      interpretedIntent: parsed.interpretedIntent || `Search for "${input.query}"`,
      suggestedCategory: parsed.suggestedCategory || undefined,
      suggestedMaxPrice: typeof parsed.suggestedMaxPrice === 'number' ? parsed.suggestedMaxPrice : undefined,
      suggestedLocation: parsed.suggestedLocation || undefined,
      extractedKeywords: Array.isArray(parsed.extractedKeywords) ? parsed.extractedKeywords : [input.query],
    };
  } catch {
    return {
      interpretedIntent: `Searching catalog for "${input.query}"`,
      extractedKeywords: input.query.split(' ').filter((w) => w.length > 2),
    };
  }
}

