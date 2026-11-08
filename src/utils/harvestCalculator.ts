import { CROPS_DATABASE } from '../data/cropsDatabase';
import { CropRecord, CropStageName, CropReference } from '../types';

export function calculateDaysBetween(startDateStr: string, endDateStr: string): number {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const diffTime = end.getTime() - start.getTime();
  return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export function formatReadableDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function getCropReference(cropName: string): CropReference | undefined {
  const cleanName = cropName.toLowerCase();
  return CROPS_DATABASE.find((c) => 
    c.id.toLowerCase() === cleanName || 
    c.name.toLowerCase().includes(cleanName) ||
    cleanName.includes(c.id.toLowerCase())
  );
}

export function evaluateCropGrowth(params: {
  cropName: string;
  plantingDate: string;
  variety?: string;
  location: string;
  growingMethod: CropRecord['growingMethod'];
  soilType: CropRecord['soilType'];
  irrigationMethod?: CropRecord['irrigationMethod'];
  notes?: string;
  currentDate?: string;
}): {
  currentStage: CropStageName;
  daysSincePlanting: number;
  totalDurationDays: number;
  progressPercent: number;
  estimatedHarvestStart: string;
  estimatedHarvestEnd: string;
  guidance: CropRecord['guidance'];
  sourceInformation: string;
  reference?: CropReference;
} {
  const today = params.currentDate || new Date().toISOString().split('T')[0];
  const daysSince = calculateDaysBetween(params.plantingDate, today);
  const ref = getCropReference(params.cropName);

  // Default duration if crop not in specialized DB
  const minDuration = ref?.standardDurationDays.min ?? 100;
  const maxDuration = ref?.standardDurationDays.max ?? 130;
  const avgDuration = Math.round((minDuration + maxDuration) / 2);

  const progressPercent = Math.min(100, Math.round((daysSince / avgDuration) * 100));

  let currentStage: CropStageName = 'Germination & Seedling';
  let guidanceSummary = 'Ensure uniform soil moisture and seedbed aeration.';
  let keyMilestones: string[] = ['Cotyledon emergence', 'First true leaf appearance'];
  let recommendedAction = 'Check germination stand and guard against damping-off fungal disease.';
  let environmentalRisks: string[] = ['Overwatering', 'Soil crusting hindering emergence'];
  let attentionNeeded = false;
  let attentionReason: string | undefined = undefined;

  if (ref) {
    const matchedStage = ref.stages.find((st) => progressPercent >= st.startDayPercent && progressPercent <= st.endDayPercent)
      || (progressPercent > 100 ? ref.stages[ref.stages.length - 1] : ref.stages[0]);

    currentStage = matchedStage.name;
    guidanceSummary = matchedStage.guidance;
    keyMilestones = matchedStage.criticalObservations;
    environmentalRisks = matchedStage.riskFactors;

    if (currentStage === 'Harvest Window Active') {
      recommendedAction = `Active harvesting phase. Pick at peak maturity for your target market. Check daily for field heat and sorting.`;
      attentionNeeded = true;
      attentionReason = `Produce is in active harvest window. Plan market dispatch or storage to prevent field deterioration.`;
    } else if (currentStage === 'Post-Harvest / Surplus Phase' || progressPercent > 100) {
      recommendedAction = `Harvest phase complete. Sort remaining crop into marketable produce and identify surplus or organic residues for recovery.`;
      attentionNeeded = true;
      attentionReason = `Crop cycle completed (${daysSince} days). Review unsold or culled produce for organic waste recovery.`;
    } else if (currentStage === 'Ripening & Maturation') {
      recommendedAction = `Prepare crates and transport logistics. Cease heavy nitrogen feeding to prevent splitting or thick skin.`;
    } else if (currentStage === 'Flowering & Fruit Set') {
      recommendedAction = `Critical pollination window. Maintain steady drip irrigation to avoid flower drop.`;
    } else if (currentStage === 'Vegetative Growth') {
      recommendedAction = `Promote strong branching and root depth. Apply balanced nutrient fertigation.`;
    }
  } else {
    // Fallback deterministic rules
    if (progressPercent < 20) {
      currentStage = 'Germination & Seedling';
      recommendedAction = 'Ensure regular shallow irrigation and inspect seedling vigor.';
    } else if (progressPercent < 50) {
      currentStage = 'Vegetative Growth';
      recommendedAction = 'Apply scheduled nutrient top-dressing and scout for foliar pests.';
    } else if (progressPercent < 75) {
      currentStage = 'Flowering & Fruit Set';
      recommendedAction = 'Maintain consistent soil moisture to prevent blossom drop or poor fruit set.';
    } else if (progressPercent < 90) {
      currentStage = 'Ripening & Maturation';
      recommendedAction = 'Monitor maturity indicators and prepare harvest containers.';
    } else if (progressPercent <= 100) {
      currentStage = 'Harvest Window Active';
      recommendedAction = 'Commence selective harvesting during cool morning hours.';
      attentionNeeded = true;
      attentionReason = 'Crop is ready for harvest.';
    } else {
      currentStage = 'Post-Harvest / Surplus Phase';
      recommendedAction = 'Assess post-harvest yield and channel surplus/residues to organic recovery.';
      attentionNeeded = true;
      attentionReason = 'Post-harvest phase reached. Check for surplus produce.';
    }
  }

  const estimatedHarvestStart = addDays(params.plantingDate, minDuration);
  const estimatedHarvestEnd = addDays(params.plantingDate, maxDuration);

  const sourceInformation = ref
    ? `Calculated using ICAR & Indian Horticultural research reference data for ${ref.name} (${minDuration}–${maxDuration} days cycle).`
    : `Calculated from standard agronomic duration estimates (approx. ${avgDuration} days cycle).`;

  const uncertaintyNotes = `Estimates assume normal regional temperatures (${ref?.optimalTempRange || '18°C–32°C'}) and adequate irrigation. Unseasonal heatwaves, frost, or erratic rains may advance or delay the harvest window by 7–14 days.`;

  return {
    currentStage,
    daysSincePlanting: daysSince,
    totalDurationDays: avgDuration,
    progressPercent,
    estimatedHarvestStart,
    estimatedHarvestEnd,
    guidance: {
      summary: guidanceSummary,
      keyMilestones,
      recommendedAction,
      environmentalRisks,
      produceAttentionNeeded: attentionNeeded,
      attentionReason,
      uncertaintyNotes,
    },
    sourceInformation,
    reference: ref,
  };
}

export interface FreshnessAssessmentInput {
  cropName: string;
  harvestDate: string;
  storageCondition: 'Ambient Shade' | 'Open Field / Direct Sunlight' | 'Well-ventilated Chawl' | 'Cold Storage (10°C–14°C)' | 'Refrigerated Cold Room (2°C–6°C)';
  temperatureApproxC?: number;
  observedCondition: 'Firm & Fresh' | 'Slightly Soft / Minor Blemishes' | 'Significant Softening / Wrinkled' | 'Softening & Mildew / Mould presence';
}

export interface FreshnessAssessmentOutput {
  status: 'Routine handling' | 'Monitor closely' | 'Prioritise assessment or sale' | 'Condition requires human review / immediate diversion';
  estimatedRemainingDays: number;
  urgencyLevel: 'Standard' | 'Medium' | 'High' | 'Immediate';
  recommendations: string[];
  reasoning: string;
  caveat: string;
}

export function assessProduceFreshness(input: FreshnessAssessmentInput): FreshnessAssessmentOutput {
  const daysSinceHarvest = calculateDaysBetween(input.harvestDate, new Date().toISOString().split('T')[0]);
  const ref = getCropReference(input.cropName);

  const baseAmbientLife = ref?.postHarvestShelfLifeDays.ambient ?? 5;
  const baseColdLife = ref?.postHarvestShelfLifeDays.coldStorage ?? 14;

  let maxExpectedLife = baseAmbientLife;
  if (input.storageCondition.includes('Cold')) {
    maxExpectedLife = baseColdLife;
  } else if (input.storageCondition === 'Well-ventilated Chawl') {
    maxExpectedLife = Math.round(baseAmbientLife * 1.5);
  } else if (input.storageCondition === 'Open Field / Direct Sunlight') {
    maxExpectedLife = Math.max(1, Math.round(baseAmbientLife * 0.4));
  }

  // Temperature acceleration factor
  const temp = input.temperatureApproxC ?? 28;
  if (temp > 34) {
    maxExpectedLife = Math.round(maxExpectedLife * 0.6);
  } else if (temp < 15 && !input.storageCondition.includes('Cold')) {
    maxExpectedLife = Math.round(maxExpectedLife * 1.2);
  }

  const remainingDays = Math.max(0, maxExpectedLife - daysSinceHarvest);

  let status: FreshnessAssessmentOutput['status'] = 'Routine handling';
  let urgencyLevel: FreshnessAssessmentOutput['urgencyLevel'] = 'Standard';
  const recommendations: string[] = [];

  if (input.observedCondition === 'Softening & Mildew / Mould presence') {
    status = 'Condition requires human review / immediate diversion';
    urgencyLevel = 'Immediate';
    recommendations.push('Do NOT sell for fresh consumption. Risk of cross-contamination.');
    recommendations.push('Immediately isolate affected produce to protect neighboring crates.');
    recommendations.push('Transfer directly into Food Waste Recovery for composting or biomethanation.');
  } else if (input.observedCondition === 'Significant Softening / Wrinkled' || remainingDays <= 1) {
    status = 'Prioritise assessment or sale';
    urgencyLevel = 'High';
    recommendations.push('Immediate market clearance needed within 24–48 hours.');
    recommendations.push('Offer at discounted bulk grade or local processor rate.');
    recommendations.push('If unsold by evening, register surplus batch for organic-waste recovery.');
  } else if (input.observedCondition === 'Slightly Soft / Minor Blemishes' || remainingDays <= 3) {
    status = 'Monitor closely';
    urgencyLevel = 'Medium';
    recommendations.push('Inspect batch twice daily for accelerated skin breakdown.');
    recommendations.push('Ensure optimal air circulation; avoid stacking crates higher than 4 levels.');
    recommendations.push('Sort out any decaying individual pieces immediately.');
  } else {
    status = 'Routine handling';
    urgencyLevel = 'Standard';
    recommendations.push('Batch is within normal stability envelope.');
    recommendations.push('Maintain shaded, ventilated storage.');
    recommendations.push('Proceed with scheduled distribution or packing.');
  }

  const reasoning = `Based on ${daysSinceHarvest} days elapsed since harvest under ${input.storageCondition} (approx. ${temp}°C) for ${input.cropName}. Typical shelf life in these conditions is ~${maxExpectedLife} days. Observed physical condition: "${input.observedCondition}".`;

  const caveat = 'Shelf-life guidance is based on typical horticultural post-harvest behavior. Actual deterioration depends on variety, harvest handling hygiene, and localized microclimate humidity. Never consume produce showing visible mold or foul odor.';

  return {
    status,
    estimatedRemainingDays: remainingDays,
    urgencyLevel,
    recommendations,
    reasoning,
    caveat,
  };
}
