export interface AuditReport {
  id: string;
  company_name: string;
  cin_or_gstin: string;
  trust_score: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'Low Risk' | 'Medium Risk' | 'High Risk' | 'Critical Risk';
  recommendation: string;
  date: string;
  timestamp: number;
  breakdown: Array<{
    source: string;
    label: string;
    max_score: number;
    actual_score: number;
    findings: string[];
  }>;
  risk_flags: Array<{
    id: number | string;
    level: string;
    title: string;
    description: string;
  }>;
  news_count: number;
  raw_data?: any;
}

const STORAGE_KEY = 'vendorcheck_audit_history_v1';

export function getSavedAudits(): AuditReport[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Error reading audit history from storage', e);
    return [];
  }
}

export function saveAuditReport(report: Omit<AuditReport, 'id' | 'timestamp'> & { id?: string }): AuditReport {
  if (typeof window === 'undefined') {
    return {
      ...report,
      id: report.id || `audit_${Date.now()}`,
      timestamp: Date.now()
    };
  }

  try {
    const current = getSavedAudits();
    const newReport: AuditReport = {
      ...report,
      id: report.id || `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now()
    };

    // Prepend and keep latest 50
    const updated = [newReport, ...current.filter(r => r.cin_or_gstin !== report.cin_or_gstin)].slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newReport;
  } catch (e) {
    console.error('Error saving audit report to storage', e);
    return {
      ...report,
      id: report.id || `audit_${Date.now()}`,
      timestamp: Date.now()
    };
  }
}

export function clearSavedAudits(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Error clearing audit history', e);
  }
}
