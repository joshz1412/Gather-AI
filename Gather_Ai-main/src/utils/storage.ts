import { CropRecord, WasteRecord, RecoveryRequest, ActivityLog, ImpactSummary, AppSettings } from '../types';
import { INITIAL_CROPS, INITIAL_WASTE_RECORDS, INITIAL_REQUESTS, INITIAL_ACTIVITY_LOGS } from '../data/initialDemoData';
import { convertToKg } from './matchingEngine';
import { resetMarketplaceToDemoDefaults } from './marketplaceStorage';

const STORAGE_KEYS = {
  CROPS: 'gather_ai_crops_v1',
  WASTE: 'gather_ai_waste_v1',
  REQUESTS: 'gather_ai_requests_v1',
  ACTIVITY: 'gather_ai_activity_v1',
  SETTINGS: 'gather_ai_settings_v1',
};

export const DEFAULT_SETTINGS: AppSettings = {
  profile: {
    fullName: 'Ramesh Patil',
    email: 'ramesh.patil@nashikgrowers.in',
    role: 'Grower & APMC Vendor',
    farmOrOrgName: 'Patil Fresh Produce & Mandi Stalls',
    location: 'Nashik APMC Mandi, Maharashtra',
    phone: '+91 98220 55184',
  },
  farm: {
    defaultLocation: 'Nashik APMC Mandi, Maharashtra',
    preferredWeightUnit: 'kg',
    defaultWasteUnit: 'kg',
    guidanceFocus: 'Organic & Bio-inputs',
    defaultPickupWindow: 'Within 24-48 hours',
    shelfLifeAlertDays: 3,
  },
  ai: {
    enableAiSuggestions: true,
    explanationDetail: 'detailed',
    showFollowUpSuggestions: true,
    languageMode: 'English',
  },
  notifications: {
    inAppAlerts: true,
    cropGuidanceReminders: true,
    harvestWindowReminders: true,
    surplusRecoveryUpdates: true,
    collectionStatusUpdates: true,
  },
  appearance: {
    theme: 'light',
    density: 'comfortable',
    highContrast: false,
  },
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      saveSettings(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
    const parsed = JSON.parse(raw);
    return {
      profile: { ...DEFAULT_SETTINGS.profile, ...(parsed.profile || {}) },
      farm: { ...DEFAULT_SETTINGS.farm, ...(parsed.farm || {}) },
      ai: { ...DEFAULT_SETTINGS.ai, ...(parsed.ai || {}) },
      notifications: { ...DEFAULT_SETTINGS.notifications, ...(parsed.notifications || {}) },
      appearance: { ...DEFAULT_SETTINGS.appearance, ...(parsed.appearance || {}) },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.warn('Failed to save settings to localStorage', err);
  }
}

export function resetSettingsToDefault(): AppSettings {
  saveSettings(DEFAULT_SETTINGS);
  return DEFAULT_SETTINGS;
}

export function loadCrops(): CropRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CROPS);
    if (!raw) {
      saveCrops(INITIAL_CROPS);
      return INITIAL_CROPS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_CROPS;
  }
}

export function saveCrops(crops: CropRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CROPS, JSON.stringify(crops));
  } catch (err) {
    console.warn('Failed to save crops to localStorage', err);
  }
}

export function loadWasteRecords(): WasteRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WASTE);
    if (!raw) {
      saveWasteRecords(INITIAL_WASTE_RECORDS);
      return INITIAL_WASTE_RECORDS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_WASTE_RECORDS;
  }
}

export function saveWasteRecords(records: WasteRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.WASTE, JSON.stringify(records));
  } catch (err) {
    console.warn('Failed to save waste records to localStorage', err);
  }
}

export function loadRequests(): RecoveryRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REQUESTS);
    if (!raw) {
      saveRequests(INITIAL_REQUESTS);
      return INITIAL_REQUESTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_REQUESTS;
  }
}

export function saveRequests(requests: RecoveryRequest[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
  } catch (err) {
    console.warn('Failed to save requests to localStorage', err);
  }
}

export function loadActivityLogs(): ActivityLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVITY);
    if (!raw) {
      saveActivityLogs(INITIAL_ACTIVITY_LOGS);
      return INITIAL_ACTIVITY_LOGS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ACTIVITY_LOGS;
  }
}

export function saveActivityLogs(logs: ActivityLog[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(logs));
  } catch (err) {
    console.warn('Failed to save activity logs to localStorage', err);
  }
}

export function logActivity(activity: Omit<ActivityLog, 'id' | 'timestamp'>): void {
  const current = loadActivityLogs();
  const now = new Date();
  const timeFormatted = now.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  const newLog: ActivityLog = {
    ...activity,
    id: `act-${Date.now()}`,
    timestamp: timeFormatted,
  };

  const updated = [newLog, ...current];
  saveActivityLogs(updated);
}

export function calculateImpactSummary(
  crops: CropRecord[],
  wasteRecords: WasteRecord[],
  requests: RecoveryRequest[]
): ImpactSummary {
  let registeredKg = 0;
  let matchedKg = 0;
  let acceptedKg = 0;
  let confirmedCollectedKg = 0;
  let confirmedProcessedKg = 0;

  for (const record of wasteRecords) {
    const recordKg = convertToKg(record.quantity, record.unit);
    registeredKg += recordKg;

    if (
      record.status !== 'Draft' &&
      record.status !== 'Cancelled'
    ) {
      matchedKg += recordKg;
    }

    if (
      record.status === 'Accepted' ||
      record.status === 'Collection Scheduled' ||
      record.status === 'Collection Confirmed' ||
      record.status === 'Recovery Reported'
    ) {
      acceptedKg += recordKg;
    }

    if (
      record.status === 'Collection Confirmed' ||
      record.status === 'Recovery Reported'
    ) {
      confirmedCollectedKg += recordKg;
    }

    if (record.status === 'Recovery Reported') {
      confirmedProcessedKg += recordKg;
    }
  }

  // Also check individual requests for confirmed quantities if explicitly reported
  for (const req of requests) {
    if (req.confirmedQuantityKg && (req.requestStatus === 'Collection Confirmed' || req.requestStatus === 'Recovery Reported')) {
      // already counted via wasteRecord status or confirmed quantity
    }
  }

  const openWasteCount = wasteRecords.filter(
    (w) => w.status !== 'Collection Confirmed' && w.status !== 'Recovery Reported' && w.status !== 'Cancelled'
  ).length;

  const pendingRequests = requests.filter(
    (r) => r.requestStatus === 'Request Prepared' || r.requestStatus === 'Request Sent' || r.requestStatus === 'Awaiting Response'
  ).length;

  return {
    registeredQuantityKg: registeredKg,
    matchedQuantityKg: matchedKg,
    acceptedQuantityKg: acceptedKg,
    confirmedCollectedKg: confirmedCollectedKg,
    confirmedProcessedKg: confirmedProcessedKg,
    activeCropCount: crops.length,
    openWasteCount,
    pendingRequestsCount: pendingRequests,
    lastUpdated: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
  };
}

export function resetToDemoDefaults(): {
  crops: CropRecord[];
  waste: WasteRecord[];
  requests: RecoveryRequest[];
  activity: ActivityLog[];
} {
  saveCrops(INITIAL_CROPS);
  saveWasteRecords(INITIAL_WASTE_RECORDS);
  saveRequests(INITIAL_REQUESTS);
  saveActivityLogs(INITIAL_ACTIVITY_LOGS);
  resetMarketplaceToDemoDefaults();

  return {
    crops: INITIAL_CROPS,
    waste: INITIAL_WASTE_RECORDS,
    requests: INITIAL_REQUESTS,
    activity: INITIAL_ACTIVITY_LOGS,
  };
}
