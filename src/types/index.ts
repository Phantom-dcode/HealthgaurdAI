export type UserRole = 'PATIENT' | 'DOCTOR' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  createdAt: string;
}

export interface PatientProfile {
  id: string;
  userId: string;
  mrn: string; // Medical Record Number
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  primaryDoctorId: string;
  primaryDoctorName: string;
  conditions: string[];
  allergies: string[];
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskScore: number; // 0 - 100
  lastVitalsSync?: string;
}

export interface DoctorProfile {
  id: string;
  userId: string;
  specialty: string;
  npi: string; // National Provider Identifier
  assignedPatientIds: string[];
}

export interface VitalMetrics {
  systolicBp: number; // mmHg
  diastolicBp: number; // mmHg
  heartRate: number; // bpm
  bloodGlucose: number; // mg/dL
  isGlucoseFasting?: boolean;
  spO2: number; // %
  temperature: number; // °F
  weight: number; // lbs
  respiratoryRate: number; // breaths/min
}

export interface HealthRecord {
  id: string;
  patientId: string;
  patientName: string;
  timestamp: string;
  vitals: VitalMetrics;
  notes?: string;
  source: 'MANUAL' | 'BLUETOOTH_KIT' | 'WEARABLE_PATCH';
  flaggedCritical: boolean;
}

export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';
export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';

export interface ClinicalAlert {
  id: string;
  patientId: string;
  patientName: string;
  metric: string;
  value: string;
  thresholdRule: string; // e.g. "JNC 8 Stage 2 Hypertension (>=140 mmHg)"
  severity: AlertSeverity;
  status: AlertStatus;
  createdAt: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
}

export interface AIPrediction {
  id: string;
  patientId: string;
  timestamp: string;
  riskScore: number; // 0 - 100
  riskCategory: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  predictedEvents: string[];
  clinicalInsights: string;
  recommendedActions: string[];
  confidence: number; // e.g. 0.92
}

export interface ClinicalReport {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  createdAt: string;
  summary: string;
  vitalsOverview: string;
  treatmentPlan: string;
  downloadUrl?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  resource: string;
  ipAddress: string;
  details: string;
  hipaaCompliant: boolean;
}

export interface AuthState {
  user: User | null;
  patientProfile?: PatientProfile | null;
  doctorProfile?: DoctorProfile | null;
  token: string | null;
}
