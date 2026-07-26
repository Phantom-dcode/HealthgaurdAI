import { User, PatientProfile, HealthRecord, ClinicalAlert, AIPrediction, ClinicalReport, AuditLog, VitalMetrics } from '../types';

export const api = {
  // Auth
  async login(email: string, role?: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role }),
    });
    return res.json();
  },

  async register(data: { name: string; email: string; role: string; age?: number; gender?: string; phone?: string; conditions?: string[] }) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getCurrentUser(userId?: string) {
    const res = await fetch(`/api/auth/me${userId ? `?userId=${userId}` : ''}`);
    return res.json();
  },

  // Patients
  async getPatients(): Promise<(PatientProfile & { userName: string; email: string; avatar?: string; activeAlertsCount: number })[]> {
    const res = await fetch('/api/patients');
    return res.json();
  },

  async getPatientById(id: string) {
    const res = await fetch(`/api/patients/${id}`);
    return res.json();
  },

  // Vitals
  async logVitals(patientId: string, vitals: VitalMetrics, notes?: string, source?: string) {
    const res = await fetch('/api/vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId, vitals, notes, source }),
    });
    return res.json();
  },

  async getVitalsHistory(patientId?: string): Promise<HealthRecord[]> {
    const res = await fetch(`/api/vitals${patientId ? `?patientId=${patientId}` : ''}`);
    return res.json();
  },

  // Alerts
  async getAlerts(): Promise<ClinicalAlert[]> {
    const res = await fetch('/api/alerts');
    return res.json();
  },

  async acknowledgeAlert(id: string, acknowledgedBy: string) {
    const res = await fetch(`/api/alerts/${id}/acknowledge`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acknowledgedBy }),
    });
    return res.json();
  },

  async resolveAlert(id: string, notes?: string) {
    const res = await fetch(`/api/alerts/${id}/resolve`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes }),
    });
    return res.json();
  },

  // AI Risk Predictions (Gemini 3.6 Flash)
  async generateAIPrediction(patientId: string): Promise<AIPrediction> {
    const res = await fetch('/api/ai/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId }),
    });
    return res.json();
  },

  // Reports
  async createReport(patientId: string, summary: string, vitalsOverview: string, treatmentPlan: string): Promise<ClinicalReport> {
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId, summary, vitalsOverview, treatmentPlan }),
    });
    return res.json();
  },

  async getReports(patientId: string): Promise<ClinicalReport[]> {
    const res = await fetch(`/api/reports/${patientId}`);
    return res.json();
  },

  // Admin
  async getAdminAnalytics() {
    const res = await fetch('/api/admin/analytics');
    return res.json();
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await fetch('/api/admin/audit-logs');
    return res.json();
  },

  async getUsers(): Promise<User[]> {
    const res = await fetch('/api/admin/users');
    return res.json();
  },
};
