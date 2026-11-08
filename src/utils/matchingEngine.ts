import { 
  WasteRecord, 
  RecoveryPartner, 
  MatchScoreResult, 
  WasteAssessment, 
  RecoveryProcessingType 
} from '../types';

export function convertToKg(quantity: number, unit: WasteRecord['unit']): number {
  switch (unit) {
    case 'kg':
      return Math.round(quantity);
    case 'quintals':
      return Math.round(quantity * 100);
    case 'tonnes':
      return Math.round(quantity * 1000);
    case 'crates':
      return Math.round(quantity * 25); // typical 20-25kg produce crate
    default:
      return Math.round(quantity);
  }
}

export function formatQuantityKg(kg: number): string {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(1)} tonnes (${kg.toLocaleString()} kg)`;
  }
  return `${kg.toLocaleString()} kg`;
}

export function generateWasteAssessment(record: Partial<WasteRecord>): WasteAssessment {
  const qty = record.quantity || 0;
  const unit = record.unit || 'kg';
  const qtyKg = convertToKg(qty, unit);

  const materialType = record.materialType || 'Unspecified organic material';
  const category = record.materialCategory || 'Fruit & Vegetable Scraps';
  const condition = record.condition || 'Fresh surplus (edible quality)';
  const contamination = record.contaminationStatus || 'Clean / 100% Segregated';

  const isEdible = 
    (condition === 'Fresh surplus (edible quality)' || condition === 'Grade B / Bruised but sound') &&
    contamination === 'Clean / 100% Segregated' &&
    category === 'Unsold Fresh Produce';

  const suitableCategories: RecoveryProcessingType[] = [];
  const incompatibleRoutes: { category: string; reason: string }[] = [];

  // Categorize based on biological properties
  if (isEdible) {
    suitableCategories.push('Edible Surplus Redistribution');
  } else {
    incompatibleRoutes.push({
      category: 'Edible Surplus Redistribution',
      reason: 'Material is marked as degrading, bruised, or non-segregated. Unfit for human consumption safety standards.',
    });
  }

  if (category === 'Crop Residues & Stalks' || condition === 'Dry / Fibrous residues') {
    suitableCategories.push('Organic Soil Conditioner');
    suitableCategories.push('Aerobic Composting');
    incompatibleRoutes.push({
      category: 'Biomethanation / Bio-CNG',
      reason: 'High lignin and dry silica content in fibrous crop stalks can clog slurry pumps and digests slowly without pre-hydrolysis.',
    });
  } else {
    // Wet, organic, perishable
    suitableCategories.push('Aerobic Composting');
    suitableCategories.push('Biomethanation / Bio-CNG');
    suitableCategories.push('Vermicomposting & Bio-Enzymes');
    suitableCategories.push('Black Soldier Fly Feed');
  }

  // Contamination penalties
  if (contamination === 'Unsegregated / Contains foreign packaging') {
    incompatibleRoutes.push({
      category: 'Black Soldier Fly Feed',
      reason: 'Inorganic packaging fragments are toxic to insect larvae colonies.',
    });
  }

  let urgencyLevel: WasteAssessment['urgencyLevel'] = 'Standard';
  if (condition === 'Decomposing / High moisture' || condition === 'Soft / Rapidly perishing') {
    urgencyLevel = 'Immediate Action Needed';
  } else if (category === 'Fruit & Vegetable Scraps' || category === 'Unsold Fresh Produce') {
    urgencyLevel = 'Time-sensitive (48h)';
  }

  const dataCompletenessNotes: string[] = [];
  if (!record.pickupLocation || record.pickupLocation.trim().length < 3) {
    dataCompletenessNotes.push('Pickup location details are minimal. Adding specific taluka/pincode improves partner response.');
  }
  if (!record.storageDetails) {
    dataCompletenessNotes.push('Storage container/crate details missing. Will help partner allocate appropriate transport vehicle.');
  }

  let recommendedNextAction = 'Review compatible recovery partners below and initiate a collection request draft.';
  if (isEdible) {
    recommendedNextAction = 'Priority: High food value. Match with local surplus redistribution network before considering composting.';
  } else if (urgencyLevel === 'Immediate Action Needed') {
    recommendedNextAction = 'High moisture perishability: Contact nearby bio-compost or biomethanation facility immediately.';
  }

  return {
    identifiedMaterial: `${materialType} (${category})`,
    quantityInKg: qtyKg,
    quantityFormatted: formatQuantityKg(qtyKg),
    isEdibleSurplus: isEdible,
    suitableRecoveryCategories: suitableCategories,
    incompatibleRoutes,
    urgencyLevel,
    recommendedNextAction,
    dataCompletenessNotes,
  };
}

export function matchRecoveryPartners(
  record: WasteRecord,
  partners: RecoveryPartner[]
): {
  matches: MatchScoreResult[];
  hasMatches: boolean;
  noMatchReasons: string[];
} {
  const recordKg = convertToKg(record.quantity, record.unit);
  const userLoc = (record.pickupLocation || '').toLowerCase();
  const materialType = (record.materialType || '').toLowerCase();
  const category = (record.materialCategory || '').toLowerCase();

  const results: MatchScoreResult[] = partners.map((partner) => {
    const matchReasons: string[] = [];
    const limitations: string[] = [];
    let score = 0;

    // 1. Material compatibility check
    let materialCompatible = false;
    const isExcluded = partner.excludedMaterials.some((exc) => {
      const e = exc.toLowerCase();
      return materialType.includes(e) || category.includes(e);
    });

    if (isExcluded) {
      materialCompatible = false;
      limitations.push(`Explicitly excludes materials resembling "${record.materialType}".`);
    } else {
      const isAccepted = partner.acceptedMaterials.some((acc) => {
        const a = acc.toLowerCase();
        return (
          materialType.includes(a) || 
          category.includes(a) || 
          a.includes(materialType) ||
          a.includes(category) ||
          (partner.processingType === 'Aerobic Composting' && category.includes('scraps')) ||
          (partner.processingType === 'Organic Soil Conditioner' && category.includes('residue'))
        );
      });

      if (isAccepted) {
        materialCompatible = true;
        score += 35;
        matchReasons.push(`Facility actively accepts ${record.materialCategory}.`);
      } else {
        // general fallback if processing type matches assessment
        if (record.assessment?.suitableRecoveryCategories.includes(partner.processingType)) {
          materialCompatible = true;
          score += 25;
          matchReasons.push(`Processing technology (${partner.processingType}) is biologically compatible with this biomass.`);
        } else {
          limitations.push(`Material profile does not closely match regular intake streams.`);
        }
      }
    }

    // 2. Quantity compatibility check
    let quantityCompatible = false;
    if (recordKg >= partner.minimumQuantityKg && recordKg <= partner.maximumQuantityKg) {
      quantityCompatible = true;
      score += 30;
      matchReasons.push(`Quantity (${formatQuantityKg(recordKg)}) satisfies partner requirements (Min: ${formatQuantityKg(partner.minimumQuantityKg)}, Max: ${formatQuantityKg(partner.maximumQuantityKg)}).`);
    } else if (recordKg < partner.minimumQuantityKg) {
      limitations.push(`Quantity is below facility minimum threshold of ${formatQuantityKg(partner.minimumQuantityKg)}.`);
    } else {
      limitations.push(`Quantity exceeds facility batch capacity of ${formatQuantityKg(partner.maximumQuantityKg)}.`);
    }

    // 3. Location & service area check
    let locationCompatible = false;
    const isAreaMatch = partner.serviceArea.some((area) => {
      const a = area.toLowerCase();
      return userLoc.includes(a) || a.includes(userLoc) || userLoc.includes(partner.state.toLowerCase());
    });

    if (isAreaMatch || userLoc.length < 3) {
      locationCompatible = true;
      score += 25;
      matchReasons.push(`Pickup location is within service perimeter (${partner.serviceArea.join(', ')}).`);
    } else {
      // Partial state or distance caveat
      score += 5;
      limitations.push(`Facility is based in ${partner.location} (${partner.state}). Check if haulage to your area is covered.`);
    }

    // 4. Contamination check
    let contaminationCompatible = true;
    if (record.contaminationStatus === 'Unsegregated / Contains foreign packaging') {
      if (partner.processingType === 'Black Soldier Fly Feed' || partner.processingType === 'Vermicomposting & Bio-Enzymes') {
        contaminationCompatible = false;
        limitations.push('Biological process requires zero non-organic contaminants. Manual pre-sorting required prior to pickup.');
      } else {
        score -= 10;
        limitations.push('Unsegregated batch will incur sorting penalty or require on-site segregation.');
      }
    } else {
      score += 10;
      matchReasons.push(`Clean segregation status (${record.contaminationStatus}) fits rapid intake protocol.`);
    }

    const isCompatible = materialCompatible && quantityCompatible && (locationCompatible || userLoc.length < 3);

    return {
      partner,
      isCompatible,
      score: Math.max(0, Math.min(100, score)),
      matchReasons,
      limitations,
      quantityCompatible,
      materialCompatible,
      locationCompatible,
      contaminationCompatible,
    };
  });

  const sorted = results.sort((a, b) => {
    if (a.isCompatible && !b.isCompatible) return -1;
    if (!a.isCompatible && b.isCompatible) return 1;
    return b.score - a.score;
  });

  const compatibleMatches = sorted.filter((m) => m.isCompatible);
  const hasMatches = compatibleMatches.length > 0;

  const noMatchReasons: string[] = [];
  if (!hasMatches) {
    if (recordKg < 25) {
      noMatchReasons.push(`Quantity (${recordKg} kg) is below commercial partner minimums (most require at least 25–50 kg). Consider community on-site composting.`);
    }
    if (record.contaminationStatus === 'Unsegregated / Contains foreign packaging') {
      noMatchReasons.push('Material has potential foreign packaging contamination. Clean manual segregation is necessary before partners will accept.');
    }
    noMatchReasons.push('No partner currently services the exact combination of material category and geographic boundary. Try adjusting quantity or checking adjacent regional facilities.');
  }

  return {
    matches: sorted,
    hasMatches,
    noMatchReasons,
  };
}

export function generateCollectionRequestMessage(
  record: WasteRecord,
  partner: RecoveryPartner
): string {
  const qtyFormatted = formatQuantityKg(convertToKg(record.quantity, record.unit));
  const contactName = record.contactName || 'Gather AI User';
  const pickupLoc = record.pickupLocation || '[Specified Location]';
  const pickupWindow = record.preferredPickupWindow || 'Next 24–48 hours';
  const storage = record.storageDetails || 'Stored in ventilated crates at ambient temperature';
  const notes = record.notes ? `Additional notes: ${record.notes}` : '';

  return `Subject: Organic Waste Recovery & Collection Inquiry — ${qtyFormatted} of ${record.materialType}

Dear ${partner.contact.coordinator} / ${partner.name} Operations Team,

We have registered a batch of organic material available for potential resource recovery and would like to confirm collection compatibility with your facility.

BATCH SUMMARY:
• Material: ${record.materialType} (${record.materialCategory})
• Quantity: ${qtyFormatted}
• Condition: ${record.condition}
• Segregation Status: ${record.contaminationStatus}
• Current Storage: ${storage}
• Pickup Location: ${pickupLoc}
• Preferred Collection Window: ${pickupWindow}
${notes ? `• ${notes}\n` : ''}
COORDINATION QUESTIONS:
1. Can your logistics team arrange pickup for this volume, or is facility drop-off preferred?
2. Are there specific packing/container requirements (e.g. crates vs open tipper) we should observe prior to arrival?
3. Could you share your expected collection schedule and any applicable handling guidelines?

Thank you for helping keep valuable organic resources in circular use.

Best regards,
${contactName}
Gather AI Recovery Network
Ref: ${record.id}`;
}
