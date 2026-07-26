import { User, PatientProfile, DoctorProfile, HealthRecord, ClinicalAlert, AuditLog, AIPrediction, ClinicalReport } from '../types';

export const MOCK_USERS: User[] = [
  {
    id: 'usr-patient-1',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@patient.healthguard.ai',
    role: 'PATIENT',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250',
    phone: '+1 (555) 234-5678',
    createdAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 'usr-patient-2',
    name: 'Robert Chen',
    email: 'robert.chen@patient.healthguard.ai',
    role: 'PATIENT',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    phone: '+1 (555) 345-6789',
    createdAt: '2026-02-01T10:30:00Z',
  },
  {
    id: 'usr-patient-3',
    name: 'Maria Garcia',
    email: 'maria.garcia@patient.healthguard.ai',
    role: 'PATIENT',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
    phone: '+1 (555) 456-7890',
    createdAt: '2026-02-15T14:15:00Z',
  },
  {
    id: 'usr-doctor-1',
    name: 'Dr. Evelyn Vance, MD',
    email: 'dr.vance@healthguard.ai',
    role: 'DOCTOR',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=250',
    phone: '+1 (555) 901-2345',
    createdAt: '2025-11-01T09:00:00Z',
  },
  {
    id: 'usr-admin-1',
    name: 'Marcus Brody (Compliance Admin)',
    email: 'admin@healthguard.ai',
    role: 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
    phone: '+1 (555) 888-0000',
    createdAt: '2025-10-01T00:00:00Z',
  },
];

export const MOCK_PATIENT_PROFILES: PatientProfile[] = [
  {
    id: 'pat-1',
    userId: 'usr-patient-1',
    mrn: 'MRN-892301',
    age: 58,
    gender: 'Female',
    primaryDoctorId: 'usr-doctor-1',
    primaryDoctorName: 'Dr. Evelyn Vance, MD',
    conditions: ['Essential Hypertension', 'Mild Osteoarthritis'],
    allergies: ['Penicillin', 'Sulfa Drugs'],
    emergencyContact: {
      name: 'David Jenkins (Son)',
      phone: '+1 (555) 234-9988',
      relation: 'Son',
    },
    riskLevel: 'HIGH',
    riskScore: 78,
    lastVitalsSync: '2026-07-25T20:15:00Z',
  },
  {
    id: 'pat-2',
    userId: 'usr-patient-2',
    mrn: 'MRN-441029',
    age: 64,
    gender: 'Male',
    primaryDoctorId: 'usr-doctor-1',
    primaryDoctorName: 'Dr. Evelyn Vance, MD',
    conditions: ['Type 2 Diabetes Mellitus', 'Hyperlipidemia'],
    allergies: ['Latex'],
    emergencyContact: {
      name: 'Linda Chen (Wife)',
      phone: '+1 (555) 345-0011',
      relation: 'Spouse',
    },
    riskLevel: 'MEDIUM',
    riskScore: 52,
    lastVitalsSync: '2026-07-25T18:40:00Z',
  },
  {
    id: 'pat-3',
    userId: 'usr-patient-3',
    mrn: 'MRN-671204',
    age: 71,
    gender: 'Female',
    primaryDoctorId: 'usr-doctor-1',
    primaryDoctorName: 'Dr. Evelyn Vance, MD',
    conditions: ['Chronic Obstructive Pulmonary Disease (COPD)', 'Congestive Heart Failure'],
    allergies: ['Aspirin', 'Codeine'],
    emergencyContact: {
      name: 'Carlos Garcia (Husband)',
      phone: '+1 (555) 456-1122',
      relation: 'Spouse',
    },
    riskLevel: 'CRITICAL',
    riskScore: 91,
    lastVitalsSync: '2026-07-25T21:10:00Z',
  },
];

export const MOCK_DOCTOR_PROFILES: DoctorProfile[] = [
  {
    id: 'doc-1',
    userId: 'usr-doctor-1',
    specialty: 'Cardiology & Remote Telehealth',
    npi: '1982736450',
    assignedPatientIds: ['pat-1', 'pat-2', 'pat-3'],
  },
];

// Generate history records for Sarah Jenkins
export function generateInitialRecords(): HealthRecord[] {
  const records: HealthRecord[] = [];
  const now = new Date('2026-07-25T21:00:00Z');

  // Patient 1 (Sarah) - 14 days of data with recent spike
  for (let i = 14; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const isSpikeDay = i <= 2;
    records.push({
      id: `rec-pat1-${i}`,
      patientId: 'pat-1',
      patientName: 'Sarah Jenkins',
      timestamp: d.toISOString(),
      vitals: {
        systolicBp: isSpikeDay ? 148 + Math.floor(Math.random() * 8) : 124 + Math.floor(Math.random() * 8),
        diastolicBp: isSpikeDay ? 94 + Math.floor(Math.random() * 4) : 81 + Math.floor(Math.random() * 4),
        heartRate: isSpikeDay ? 92 + Math.floor(Math.random() * 6) : 72 + Math.floor(Math.random() * 6),
        bloodGlucose: 104 + Math.floor(Math.random() * 12),
        isGlucoseFasting: true,
        spO2: 97 - (isSpikeDay ? 1 : 0),
        temperature: 98.6,
        weight: 164.5 - i * 0.1,
        respiratoryRate: isSpikeDay ? 20 : 16,
      },
      source: i % 2 === 0 ? 'BLUETOOTH_KIT' : 'MANUAL',
      flaggedCritical: isSpikeDay,
      notes: isSpikeDay ? 'Felt mild headache and neck tension in the evening.' : 'Normal morning routine measurement.',
    });
  }

  // Patient 2 (Robert) - Glucose focus
  for (let i = 10; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    records.push({
      id: `rec-pat2-${i}`,
      patientId: 'pat-2',
      patientName: 'Robert Chen',
      timestamp: d.toISOString(),
      vitals: {
        systolicBp: 126 + Math.floor(Math.random() * 6),
        diastolicBp: 82 + Math.floor(Math.random() * 4),
        heartRate: 76 + Math.floor(Math.random() * 4),
        bloodGlucose: i === 1 ? 210 : 118 + Math.floor(Math.random() * 20),
        isGlucoseFasting: true,
        spO2: 98,
        temperature: 98.4,
        weight: 182.0,
        respiratoryRate: 16,
      },
      source: 'BLUETOOTH_KIT',
      flaggedCritical: i === 1,
      notes: i === 1 ? 'High glucose reading post breakfast.' : 'Glucose log.',
    });
  }

  // Patient 3 (Maria) - COPD / SpO2 focus
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const lowSpO2 = i === 0;
    records.push({
      id: `rec-pat3-${i}`,
      patientId: 'pat-3',
      patientName: 'Maria Garcia',
      timestamp: d.toISOString(),
      vitals: {
        systolicBp: 138 + Math.floor(Math.random() * 6),
        diastolicBp: 88 + Math.floor(Math.random() * 4),
        heartRate: lowSpO2 ? 108 : 84,
        bloodGlucose: 110,
        isGlucoseFasting: true,
        spO2: lowSpO2 ? 88 : 93,
        temperature: 98.8,
        weight: 142.0,
        respiratoryRate: lowSpO2 ? 24 : 19,
      },
      source: 'WEARABLE_PATCH',
      flaggedCritical: lowSpO2,
      notes: lowSpO2 ? 'Shortness of breath reported upon mild exertion.' : 'Wearable pulse oximeter sync.',
    });
  }

  return records;
}

export const INITIAL_ALERTS: ClinicalAlert[] = [
  {
    id: 'alt-101',
    patientId: 'pat-3',
    patientName: 'Maria Garcia',
    metric: 'SpO2 Oxygen Saturation',
    value: '88%',
    thresholdRule: 'Severe Hypoxemia (<90%) - Critical Oxygen Desaturation',
    severity: 'CRITICAL',
    status: 'ACTIVE',
    createdAt: '2026-07-25T21:10:00Z',
  },
  {
    id: 'alt-102',
    patientId: 'pat-1',
    patientName: 'Sarah Jenkins',
    metric: 'Blood Pressure',
    value: '152/96 mmHg',
    thresholdRule: 'JNC 8 Stage 2 Hypertension (>=140 or >=90 mmHg)',
    severity: 'CRITICAL',
    status: 'ACTIVE',
    createdAt: '2026-07-25T20:15:00Z',
  },
  {
    id: 'alt-103',
    patientId: 'pat-2',
    patientName: 'Robert Chen',
    metric: 'Blood Glucose',
    value: '210 mg/dL',
    thresholdRule: 'ADA Elevated Random Glucose (>=200 mg/dL)',
    severity: 'WARNING',
    status: 'ACKNOWLEDGED',
    createdAt: '2026-07-24T14:30:00Z',
    acknowledgedBy: 'Dr. Evelyn Vance, MD',
    acknowledgedAt: '2026-07-24T15:00:00Z',
  },
];

export const INITIAL_PREDICTIONS: AIPrediction[] = [
  {
    id: 'pred-1',
    patientId: 'pat-1',
    timestamp: '2026-07-25T21:15:00Z',
    riskScore: 78,
    riskCategory: 'HIGH',
    predictedEvents: [
      '84% probability of Hypertensive Emergency within 48 hours',
      'Elevated risk of nocturnal blood pressure non-dipping',
    ],
    clinicalInsights: 'Consecutive Systolic readings exceeding 145 mmHg paired with elevated Heart Rate (92 bpm) suggest reduced vascular compliance and potential medication non-adherence.',
    recommendedActions: [
      'Initiate urgent Telehealth consultation within 12 hours',
      'Review current Amlodipine dosage and verify patient medication compliance',
      'Order 24-hour Ambulatory Blood Pressure Monitoring (ABPM)',
    ],
    confidence: 0.94,
  },
  {
    id: 'pred-3',
    patientId: 'pat-3',
    timestamp: '2026-07-25T21:12:00Z',
    riskScore: 91,
    riskCategory: 'CRITICAL',
    predictedEvents: [
      '92% risk of acute COPD Exacerbation requiring Emergency Department admission',
    ],
    clinicalInsights: 'SpO2 drop to 88% combined with compensatory tachycardia (108 bpm) and tachypnea (24 breaths/min) indicates respiratory decompensation.',
    recommendedActions: [
      'Immediate direct emergency call or urgent home health dispatch',
      'Administer emergency supplemental O2 and bronchodilator rescue protocol',
    ],
    confidence: 0.96,
  },
];

export const INITIAL_REPORTS: ClinicalReport[] = [
  {
    id: 'rep-1',
    patientId: 'pat-1',
    patientName: 'Sarah Jenkins',
    doctorId: 'usr-doctor-1',
    doctorName: 'Dr. Evelyn Vance, MD',
    createdAt: '2026-07-20T10:00:00Z',
    summary: 'Bi-weekly Remote Patient Monitoring Summary for Essential Hypertension.',
    vitalsOverview: 'Mean BP 132/86 mmHg over 14 readings. 2 elevated readings detected above JNC 8 Stage 2 threshold.',
    treatmentPlan: 'Adjust Lisinopril to 20mg daily. Continue daily morning vitals log via Bluetooth kit.',
  },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-1001',
    timestamp: '2026-07-25T21:15:00Z',
    userId: 'usr-doctor-1',
    userName: 'Dr. Evelyn Vance, MD',
    userRole: 'DOCTOR',
    action: 'PHI_ACCESS',
    resource: 'Patient / pat-1 Vitals & AI Prediction',
    ipAddress: '172.56.21.90',
    details: 'Viewed 14-day blood pressure trend and triggered Gemini AI risk analysis.',
    hipaaCompliant: true,
  },
  {
    id: 'aud-1002',
    timestamp: '2026-07-25T20:15:00Z',
    userId: 'usr-patient-1',
    userName: 'Sarah Jenkins',
    userRole: 'PATIENT',
    action: 'VITALS_ENTRY',
    resource: 'HealthRecord / rec-pat1-0',
    ipAddress: '198.51.100.42',
    details: 'Logged vitals via Bluetooth Blood Pressure Monitor (152/96 mmHg).',
    hipaaCompliant: true,
  },
  {
    id: 'aud-1003',
    timestamp: '2026-07-25T19:00:00Z',
    userId: 'usr-admin-1',
    userName: 'Marcus Brody',
    userRole: 'ADMIN',
    action: 'SECURITY_AUDIT',
    resource: 'System Audit Trail',
    ipAddress: '10.0.1.15',
    details: 'Executed routine HIPAA compliance log verification and encryption check.',
    hipaaCompliant: true,
  },
];
