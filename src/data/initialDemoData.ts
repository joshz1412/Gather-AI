import { CropRecord, WasteRecord, RecoveryRequest, ActivityLog } from '../types';
import { evaluateCropGrowth } from '../utils/harvestCalculator';
import { generateWasteAssessment } from '../utils/matchingEngine';

// Realistic sample dates relative to current demo time
const getPastDate = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

const tomatoPlantingDate = getPastDate(96); // 96 days ago -> Active Harvest Window
const wheatPlantingDate = getPastDate(112); // 112 days ago -> Ripening & Maturation
const chilliPlantingDate = getPastDate(55); // 55 days ago -> Flowering & Fruit Set

// Pre-evaluated initial crops
const tomatoEval = evaluateCropGrowth({
  cropName: 'Tomato (Tamatar)',
  plantingDate: tomatoPlantingDate,
  variety: 'Arka Rakshak',
  location: 'Nashik, Maharashtra',
  growingMethod: 'Open Field',
  soilType: 'Red Sandy Loam',
  irrigationMethod: 'Drip Irrigation',
});

const wheatEval = evaluateCropGrowth({
  cropName: 'Wheat (Gehun)',
  plantingDate: wheatPlantingDate,
  variety: 'HD-2967',
  location: 'Karnal, Haryana',
  growingMethod: 'Open Field',
  soilType: 'Alluvial',
  irrigationMethod: 'Flood / Furrow',
});

const chilliEval = evaluateCropGrowth({
  cropName: 'Green Chilli (Hari Mirch)',
  plantingDate: chilliPlantingDate,
  variety: 'G-4 (Bhagya Lakshmi)',
  location: 'Kolar, Karnataka',
  growingMethod: 'Open Field',
  soilType: 'Red Sandy Loam',
  irrigationMethod: 'Drip Irrigation',
});

export const INITIAL_CROPS: CropRecord[] = [
  {
    id: 'crop-tomato-nashik',
    cropName: 'Tomato (Tamatar)',
    variety: 'Arka Rakshak',
    location: 'Nashik, Maharashtra',
    plantingDate: tomatoPlantingDate,
    growingMethod: 'Open Field',
    soilType: 'Red Sandy Loam',
    irrigationMethod: 'Drip Irrigation',
    areaSize: '2.5 Acres',
    currentStage: tomatoEval.currentStage,
    estimatedHarvestStart: tomatoEval.estimatedHarvestStart,
    estimatedHarvestEnd: tomatoEval.estimatedHarvestEnd,
    daysSincePlanting: tomatoEval.daysSincePlanting,
    totalDurationDays: tomatoEval.totalDurationDays,
    progressPercent: tomatoEval.progressPercent,
    guidance: tomatoEval.guidance,
    sourceInformation: tomatoEval.sourceInformation,
    hasSurplusFlagged: true,
    surplusDetails: {
      estimatedQuantity: 35,
      unit: 'crates',
      condition: 'Grade B / Blemished',
      harvestDate: getPastDate(2),
      notes: 'Second picking glut; 35 crates (~875 kg) with minor sunscald not picked up by Mumbai wholesale trader.',
    },
    notes: 'High yield cluster; fruit borer under control with pheromone traps.',
    createdAt: getPastDate(96),
    updatedAt: getPastDate(2),
  },
  {
    id: 'crop-wheat-karnal',
    cropName: 'Wheat (Gehun)',
    variety: 'HD-2967',
    location: 'Karnal, Haryana',
    plantingDate: wheatPlantingDate,
    growingMethod: 'Open Field',
    soilType: 'Alluvial',
    irrigationMethod: 'Flood / Furrow',
    areaSize: '4 Acres',
    currentStage: wheatEval.currentStage,
    estimatedHarvestStart: wheatEval.estimatedHarvestStart,
    estimatedHarvestEnd: wheatEval.estimatedHarvestEnd,
    daysSincePlanting: wheatEval.daysSincePlanting,
    totalDurationDays: wheatEval.totalDurationDays,
    progressPercent: wheatEval.progressPercent,
    guidance: wheatEval.guidance,
    sourceInformation: wheatEval.sourceInformation,
    hasSurplusFlagged: false,
    notes: 'Last irrigation withheld as heads are turning golden. Pre-booked combine harvester with straw baler attachment.',
    createdAt: getPastDate(112),
    updatedAt: getPastDate(5),
  },
  {
    id: 'crop-chilli-kolar',
    cropName: 'Green Chilli (Hari Mirch)',
    variety: 'G-4 (Bhagya Lakshmi)',
    location: 'Kolar, Karnataka',
    plantingDate: chilliPlantingDate,
    growingMethod: 'Open Field',
    soilType: 'Red Sandy Loam',
    irrigationMethod: 'Drip Irrigation',
    areaSize: '1.2 Acres',
    currentStage: chilliEval.currentStage,
    estimatedHarvestStart: chilliEval.estimatedHarvestStart,
    estimatedHarvestEnd: chilliEval.estimatedHarvestEnd,
    daysSincePlanting: chilliEval.daysSincePlanting,
    totalDurationDays: chilliEval.totalDurationDays,
    progressPercent: chilliEval.progressPercent,
    guidance: chilliEval.guidance,
    sourceInformation: chilliEval.sourceInformation,
    hasSurplusFlagged: false,
    notes: 'Continuous flowering. Foliar micronutrient spray scheduled for next Monday.',
    createdAt: getPastDate(55),
    updatedAt: getPastDate(10),
  },
];

// Pre-evaluated initial waste records
const initialWaste1Partial: Partial<WasteRecord> = {
  materialCategory: 'Unsold Fresh Produce',
  materialType: 'Tomato surplus & culls (Grade B)',
  quantity: 35,
  unit: 'crates',
  pickupLocation: 'Nashik APMC Mandi Yard, Dindori Road, Nashik',
  condition: 'Grade B / Bruised but sound',
  contaminationStatus: 'Clean / 100% Segregated',
  storageDetails: 'Stacked in shaded wooden/plastic crates under mandi canopy',
  notes: 'Transferred from Harvest Intelligence: Arka Rakshak tomatoes. Sound pulp, slight skin blemishes, suitable for bio-compost or local sauce processing.',
};
const waste1Assessment = generateWasteAssessment(initialWaste1Partial);

const initialWaste2Partial: Partial<WasteRecord> = {
  materialCategory: 'Crop Residues & Stalks',
  materialType: 'Wheat straw & combine stubble bales',
  quantity: 2,
  unit: 'tonnes',
  pickupLocation: 'Village Nilokheri, GT Road, Karnal, Haryana',
  condition: 'Dry / Fibrous residues',
  contaminationStatus: 'Clean / 100% Segregated',
  storageDetails: 'Tied square bales stacked under waterproof tarpaulin in field yard',
  notes: 'Collected post-harvest to avoid open field burning. Ready for bio-pellet conversion.',
};
const waste2Assessment = generateWasteAssessment(initialWaste2Partial);

export const INITIAL_WASTE_RECORDS: WasteRecord[] = [
  {
    id: 'waste-tomato-875',
    materialCategory: 'Unsold Fresh Produce',
    materialType: 'Tomato surplus & culls (Grade B)',
    quantity: 35,
    unit: 'crates',
    pickupLocation: 'Nashik APMC Mandi Yard, Dindori Road, Nashik',
    availableFrom: getPastDate(1),
    preferredPickupWindow: 'Morning 07:00 – 11:00 AM (Next 24h)',
    condition: 'Grade B / Bruised but sound',
    contaminationStatus: 'Clean / 100% Segregated',
    storageDetails: 'Stacked in shaded wooden/plastic crates under mandi canopy',
    notes: 'Transferred from Harvest Intelligence: Arka Rakshak tomatoes. Sound pulp, slight skin blemishes.',
    originCropId: 'crop-tomato-nashik',
    originCropName: 'Tomato (Tamatar) — Arka Rakshak',
    contactName: 'Ramesh Patil (Grower)',
    contactPhone: '+91 98220 55184',
    status: 'Matching Available',
    assessment: waste1Assessment,
    selectedPartnerId: 'partner-greenroots',
    createdAt: getPastDate(1),
    updatedAt: getPastDate(1),
  },
  {
    id: 'waste-wheat-2000',
    materialCategory: 'Crop Residues & Stalks',
    materialType: 'Wheat straw & combine stubble bales',
    quantity: 2,
    unit: 'tonnes',
    pickupLocation: 'Village Nilokheri, GT Road, Karnal, Haryana',
    availableFrom: getPastDate(6),
    preferredPickupWindow: 'Daytime 10:00 AM – 04:00 PM',
    condition: 'Dry / Fibrous residues',
    contaminationStatus: 'Clean / 100% Segregated',
    storageDetails: 'Tied square bales stacked under waterproof tarpaulin in field yard',
    notes: 'Collected post-harvest to avoid open field burning. Diverted to rural bio-pellet facility.',
    originCropId: 'crop-wheat-karnal',
    originCropName: 'Wheat (Gehun) — HD-2967',
    contactName: 'Gurpreet Singh',
    contactPhone: '+91 98141 22910',
    status: 'Collection Confirmed',
    assessment: waste2Assessment,
    selectedPartnerId: 'partner-punjab-biomass',
    activeRequestId: 'req-wheat-001',
    createdAt: getPastDate(6),
    updatedAt: getPastDate(2),
  },
];

export const INITIAL_REQUESTS: RecoveryRequest[] = [
  {
    id: 'req-wheat-001',
    wasteRecordId: 'waste-wheat-2000',
    partnerId: 'partner-punjab-biomass',
    partnerName: 'Punjab Agro-Residue Bio-Pellet & Compost Facility',
    materialType: 'Wheat straw & combine stubble bales',
    quantityKg: 2000,
    pickupLocation: 'Village Nilokheri, GT Road, Karnal, Haryana',
    preferredPickupTime: 'Completed on ' + getPastDate(2),
    requestMessage: 'Formal collection arranged and dispatched via 10-wheeler tractor trolley.',
    requestStatus: 'Collection Confirmed',
    preparedAt: getPastDate(5),
    sentAt: getPastDate(5),
    acceptedAt: getPastDate(4),
    scheduledAt: getPastDate(3),
    collectedAt: getPastDate(2),
    confirmedQuantityKg: 2000,
    outcomeNotes: 'Bales weighed at facility weighbridge: 2,050 kg gross. Diverted into bio-mulch pellet line.',
    createdAt: getPastDate(5),
    updatedAt: getPastDate(2),
  },
];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'act-001',
    timestamp: getPastDate(2) + ' 16:30',
    category: 'collection',
    title: 'Collection Confirmed by Punjab Agro-Residue Facility',
    description: '2,000 kg (2 tonnes) of baled wheat straw collected from Nilokheri, Karnal. Weighed at weighbridge.',
    relatedId: 'waste-wheat-2000',
    statusBadge: 'Collection Confirmed',
  },
  {
    id: 'act-002',
    timestamp: getPastDate(1) + ' 11:15',
    category: 'waste',
    title: 'Surplus Transferred from Harvest: 35 crates Tomatoes',
    description: 'Grower transferred 35 crates (~875 kg) of Arka Rakshak tomatoes into Food Waste Recovery.',
    relatedId: 'waste-tomato-875',
    statusBadge: 'Transferred from Harvest',
  },
  {
    id: 'act-003',
    timestamp: getPastDate(1) + ' 11:20',
    category: 'match',
    title: 'Recovery Matches Identified for Tomato Surplus',
    description: 'Ranked 3 compatible facilities. Top match: GreenRoots Bio-Compost Hub (Nashik).',
    relatedId: 'waste-tomato-875',
    statusBadge: '3 Matches Found',
  },
  {
    id: 'act-004',
    timestamp: getPastDate(0) + ' 09:00',
    category: 'harvest',
    title: 'Harvest Window Alert: Nashik Tomatoes',
    description: 'Arka Rakshak tomato crop entered peak harvest window (Day 96 of 105). Check daily pickings.',
    relatedId: 'crop-tomato-nashik',
    statusBadge: 'Harvest Window Active',
  },
];
