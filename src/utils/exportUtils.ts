import { CropRecord, WasteRecord, RecoveryRequest, ActivityLog, AppSettings } from '../types';

/**
 * Triggers a real browser file download for text/csv or application/json
 */
export function triggerDownload(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Escapes a cell value for standard CSV (RFC 4180)
 */
function escapeCsvCell(val: unknown): string {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Formats a 2D array into valid CSV string
 */
export function formatCsv(headers: string[], rows: unknown[][]): string {
  const headerLine = headers.map(escapeCsvCell).join(',');
  const rowLines = rows.map((r) => r.map(escapeCsvCell).join(','));
  return [headerLine, ...rowLines].join('\r\n');
}

/**
 * Exports Crops dataset as CSV or JSON
 */
export function exportCropsData(crops: CropRecord[], format: 'csv' | 'json'): void {
  const dateStr = new Date().toISOString().split('T')[0];
  if (format === 'json') {
    const jsonStr = JSON.stringify(crops, null, 2);
    triggerDownload(`gather-ai-crops-${dateStr}.json`, jsonStr, 'application/json');
    return;
  }

  const headers = [
    'Crop ID',
    'Crop Name',
    'Variety',
    'Location',
    'Planting Date',
    'Current Stage',
    'Growing Method',
    'Soil Type',
    'Has Surplus Flagged',
    'Surplus Quantity',
    'Surplus Unit',
    'Created At',
  ];

  const rows = crops.map((c) => [
    c.id,
    c.cropName,
    c.variety,
    c.location,
    c.plantingDate,
    c.currentStage,
    c.growingMethod,
    c.soilType,
    c.hasSurplusFlagged ? 'Yes' : 'No',
    c.surplusDetails?.estimatedQuantity ?? '',
    c.surplusDetails?.unit ?? '',
    c.createdAt,
  ]);

  const csv = formatCsv(headers, rows);
  triggerDownload(`gather-ai-crops-${dateStr}.csv`, csv, 'text/csv');
}

/**
 * Exports Waste Records dataset as CSV or JSON
 */
export function exportWasteData(waste: WasteRecord[], format: 'csv' | 'json'): void {
  const dateStr = new Date().toISOString().split('T')[0];
  if (format === 'json') {
    const jsonStr = JSON.stringify(waste, null, 2);
    triggerDownload(`gather-ai-waste-${dateStr}.json`, jsonStr, 'application/json');
    return;
  }

  const headers = [
    'Waste Record ID',
    'Material Category',
    'Material Type',
    'Quantity',
    'Unit',
    'Pickup Location',
    'Available From',
    'Preferred Window',
    'Condition',
    'Contamination Status',
    'Status',
    'Selected Partner ID',
    'Active Request ID',
    'Created At',
  ];

  const rows = waste.map((w) => [
    w.id,
    w.materialCategory,
    w.materialType,
    w.quantity,
    w.unit,
    w.pickupLocation,
    w.availableFrom,
    w.preferredPickupWindow,
    w.condition,
    w.contaminationStatus,
    w.status,
    w.selectedPartnerId || '',
    w.activeRequestId || '',
    w.createdAt,
  ]);

  const csv = formatCsv(headers, rows);
  triggerDownload(`gather-ai-waste-${dateStr}.csv`, csv, 'text/csv');
}

/**
 * Exports Recovery Requests dataset as CSV or JSON
 */
export function exportRequestsData(requests: RecoveryRequest[], format: 'csv' | 'json'): void {
  const dateStr = new Date().toISOString().split('T')[0];
  if (format === 'json') {
    const jsonStr = JSON.stringify(requests, null, 2);
    triggerDownload(`gather-ai-requests-${dateStr}.json`, jsonStr, 'application/json');
    return;
  }

  const headers = [
    'Request ID',
    'Waste Record ID',
    'Partner ID',
    'Partner Name',
    'Material Type',
    'Quantity (kg)',
    'Pickup Location',
    'Preferred Pickup Time',
    'Request Status',
    'Confirmed Quantity (kg)',
    'Created At',
  ];

  const rows = requests.map((r) => [
    r.id,
    r.wasteRecordId,
    r.partnerId,
    r.partnerName,
    r.materialType,
    r.quantityKg,
    r.pickupLocation,
    r.preferredPickupTime,
    r.requestStatus,
    r.confirmedQuantityKg ?? '',
    r.createdAt,
  ]);

  const csv = formatCsv(headers, rows);
  triggerDownload(`gather-ai-requests-${dateStr}.csv`, csv, 'text/csv');
}

/**
 * Exports Activity Logs dataset as CSV or JSON
 */
export function exportActivityData(logs: ActivityLog[], format: 'csv' | 'json'): void {
  const dateStr = new Date().toISOString().split('T')[0];
  if (format === 'json') {
    const jsonStr = JSON.stringify(logs, null, 2);
    triggerDownload(`gather-ai-activity-${dateStr}.json`, jsonStr, 'application/json');
    return;
  }

  const headers = ['Log ID', 'Timestamp', 'Category', 'Title', 'Description', 'Status Badge'];
  const rows = logs.map((l) => [
    l.id,
    l.timestamp,
    l.category,
    l.title,
    l.description,
    l.statusBadge || '',
  ]);

  const csv = formatCsv(headers, rows);
  triggerDownload(`gather-ai-activity-${dateStr}.csv`, csv, 'text/csv');
}

/**
 * Exports complete workspace backup
 */
export function exportCompleteBackup(
  crops: CropRecord[],
  waste: WasteRecord[],
  requests: RecoveryRequest[],
  activity: ActivityLog[],
  settings: AppSettings
): void {
  const dateStr = new Date().toISOString().split('T')[0];
  const payload = {
    exportedAt: new Date().toISOString(),
    version: '1.2.0',
    platform: 'Gather AI',
    data: {
      crops,
      wasteRecords: waste,
      requests,
      activityLogs: activity,
      settings,
    },
  };

  const jsonStr = JSON.stringify(payload, null, 2);
  triggerDownload(`gather-ai-complete-backup-${dateStr}.json`, jsonStr, 'application/json');
}
