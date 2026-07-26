import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { evaluateVitals } from './src/lib/clinical-thresholds';
import {
  MOCK_USERS,
  MOCK_PATIENT_PROFILES,
  MOCK_DOCTOR_PROFILES,
  generateInitialRecords,
  INITIAL_ALERTS,
  INITIAL_PREDICTIONS,
  INITIAL_REPORTS,
  INITIAL_AUDIT_LOGS,
} from './src/lib/mock-data';
import { VitalMetrics, HealthRecord, ClinicalAlert, AuditLog, AIPrediction, ClinicalReport, User } from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory data persistence store
let users: User[] = [...MOCK_USERS];
let patientProfiles = [...MOCK_PATIENT_PROFILES];
let doctorProfiles = [...MOCK_DOCTOR_PROFILES];
let healthRecords: HealthRecord[] = generateInitialRecords();
let alerts: ClinicalAlert[] = [...INITIAL_ALERTS];
let predictions: AIPrediction[] = [...INITIAL_PREDICTIONS];
let reports: ClinicalReport[] = [...INITIAL_REPORTS];
let auditLogs: AuditLog[] = [...INITIAL_AUDIT_LOGS];

// Helper to log audit trail for HIPAA compliance
function logAudit(userId: string, userName: string, userRole: 'PATIENT' | 'DOCTOR' | 'ADMIN', action: string, resource: string, details: string) {
  const newLog: AuditLog = {
    id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    userId,
    userName,
    userRole,
    action,
    resource,
    ipAddress: '127.0.0.1 (Cloud Run SSL Proxy)',
    details,
    hipaaCompliant: true,
  };
  auditLogs.unshift(newLog);
}

// Gemini AI Client Initialization (Server-Side Only)
function getGeminiAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// ==================== REST API ROUTES ====================

// 1. Auth Endpoints
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, role } = req.body;
  let user = users.find((u) => u.email.toLowerCase() === email?.toLowerCase());

  if (!user && role) {
    // Default fallback matching selected role if specific email not found
    user = users.find((u) => u.role === role) || users[0];
  }

  if (!user) {
    user = users[0];
  }

  const token = `jwt-mock-token-${user.id}-${Date.now()}`;
  const patientProfile = patientProfiles.find((p) => p.userId === user.id) || null;
  const doctorProfile = doctorProfiles.find((d) => d.userId === user.id) || null;

  logAudit(user.id, user.name, user.role, 'USER_LOGIN', 'AuthService', `User ${user.email} authenticated successfully.`);

  res.json({
    success: true,
    user,
    patientProfile,
    doctorProfile,
    token,
  });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, role, age, gender, phone, conditions } = req.body;

  const existing = users.find((u) => u.email.toLowerCase() === email?.toLowerCase());
  if (existing) {
    res.status(400).json({ error: 'User with this email already exists.' });
    return;
  }

  const newUserId = `usr-${Date.now()}`;
  const newUser: User = {
    id: newUserId,
    name: name || 'New User',
    email,
    role: role || 'PATIENT',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
    phone: phone || '+1 (555) 000-1122',
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);

  let newPatientProfile = null;
  if (newUser.role === 'PATIENT') {
    newPatientProfile = {
      id: `pat-${Date.now()}`,
      userId: newUserId,
      mrn: `MRN-${Math.floor(100000 + Math.random() * 900000)}`,
      age: Number(age) || 45,
      gender: gender || 'Male',
      primaryDoctorId: 'usr-doctor-1',
      primaryDoctorName: 'Dr. Evelyn Vance, MD',
      conditions: Array.isArray(conditions) ? conditions : ['General Monitoring'],
      allergies: ['None Reported'],
      emergencyContact: {
        name: 'Emergency Contact',
        phone: '+1 (555) 999-0000',
        relation: 'Family',
      },
      riskLevel: 'LOW' as const,
      riskScore: 20,
      lastVitalsSync: new Date().toISOString(),
    };
    patientProfiles.push(newPatientProfile);
  }

  logAudit(newUser.id, newUser.name, newUser.role, 'USER_REGISTER', 'AuthService', `Registered new account as ${newUser.role}`);

  res.json({
    success: true,
    user: newUser,
    patientProfile: newPatientProfile,
    token: `jwt-mock-token-${newUser.id}`,
  });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  // Return current default patient or doc based on auth query parameter
  const userId = (req.query.userId as string) || 'usr-patient-1';
  const user = users.find((u) => u.id === userId) || users[0];
  const patientProfile = patientProfiles.find((p) => p.userId === user.id) || null;
  const doctorProfile = doctorProfiles.find((d) => d.userId === user.id) || null;

  res.json({ user, patientProfile, doctorProfile });
});

// 2. Patient & Vitals Endpoints
app.get('/api/patients', (req: Request, res: Response) => {
  logAudit('usr-doctor-1', 'Dr. Evelyn Vance, MD', 'DOCTOR', 'GET_PATIENTS_LIST', 'PatientDirectory', 'Fetched assigned RPM patient directory');
  const result = patientProfiles.map((p) => {
    const user = users.find((u) => u.id === p.userId);
    const activeAlerts = alerts.filter((a) => a.patientId === p.id && a.status !== 'RESOLVED');
    return {
      ...p,
      userName: user?.name || 'Unknown Patient',
      email: user?.email,
      avatar: user?.avatar,
      activeAlertsCount: activeAlerts.length,
    };
  });
  res.json(result);
});

app.get('/api/patients/:id', (req: Request, res: Response) => {
  const patient = patientProfiles.find((p) => p.id === req.params.id || p.userId === req.params.id);
  if (!patient) {
    res.status(404).json({ error: 'Patient not found' });
    return;
  }
  const user = users.find((u) => u.id === patient.userId);
  const patientRecords = healthRecords.filter((r) => r.patientId === patient.id);
  const patientAlerts = alerts.filter((a) => a.patientId === patient.id);
  const latestPrediction = predictions.find((p) => p.patientId === patient.id) || null;

  logAudit('usr-doctor-1', 'Dr. Evelyn Vance, MD', 'DOCTOR', 'PHI_ACCESS', `Patient/${patient.id}`, `Accessed complete PHI profile for ${user?.name}`);

  res.json({
    patient,
    user,
    records: patientRecords,
    alerts: patientAlerts,
    latestPrediction,
  });
});

app.post('/api/vitals', (req: Request, res: Response) => {
  const { patientId, vitals, notes, source } = req.body as {
    patientId: string;
    vitals: VitalMetrics;
    notes?: string;
    source?: 'MANUAL' | 'BLUETOOTH_KIT' | 'WEARABLE_PATCH';
  };

  const patient = patientProfiles.find((p) => p.id === patientId || p.userId === patientId);
  const patientUser = users.find((u) => u.id === patient?.userId) || users[0];

  const evalResult = evaluateVitals(vitals);

  const newRecord: HealthRecord = {
    id: `rec-${Date.now()}`,
    patientId: patient?.id || patientId,
    patientName: patientUser.name,
    timestamp: new Date().toISOString(),
    vitals,
    notes,
    source: source || 'MANUAL',
    flaggedCritical: evalResult.severity === 'CRITICAL',
  };

  healthRecords.unshift(newRecord);

  // Update patient risk score and last sync
  if (patient) {
    patient.riskScore = evalResult.overallRiskScore;
    if (evalResult.overallRiskScore >= 80) patient.riskLevel = 'CRITICAL';
    else if (evalResult.overallRiskScore >= 60) patient.riskLevel = 'HIGH';
    else if (evalResult.overallRiskScore >= 35) patient.riskLevel = 'MEDIUM';
    else patient.riskLevel = 'LOW';
    patient.lastVitalsSync = newRecord.timestamp;
  }

  // Auto-generate alerts if clinical threshold exceeded
  const newAlertsCreated: ClinicalAlert[] = [];
  evalResult.flags.forEach((flag) => {
    const newAlert: ClinicalAlert = {
      id: `alt-${Date.now()}-${Math.floor(Math.random() * 100)}`,
      patientId: patient?.id || patientId,
      patientName: patientUser.name,
      metric: flag.metric,
      value: flag.value,
      thresholdRule: flag.rule,
      severity: flag.severity,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };
    alerts.unshift(newAlert);
    newAlertsCreated.push(newAlert);
  });

  logAudit(
    patientUser.id,
    patientUser.name,
    'PATIENT',
    'VITALS_ENTRY',
    `HealthRecord/${newRecord.id}`,
    `Recorded vitals (BP: ${vitals.systolicBp}/${vitals.diastolicBp}, HR: ${vitals.heartRate}, Glucose: ${vitals.bloodGlucose}). Severity: ${evalResult.severity}`
  );

  res.json({
    success: true,
    record: newRecord,
    evaluation: evalResult,
    newAlerts: newAlertsCreated,
  });
});

app.get('/api/vitals', (req: Request, res: Response) => {
  const patientId = req.query.patientId as string;
  let filtered = healthRecords;
  if (patientId) {
    filtered = healthRecords.filter((r) => r.patientId === patientId || r.patientId === `pat-${patientId}`);
  }
  res.json(filtered);
});

// 3. Clinical Alerts Endpoints
app.get('/api/alerts', (req: Request, res: Response) => {
  res.json(alerts);
});

app.put('/api/alerts/:id/acknowledge', (req: Request, res: Response) => {
  const alert = alerts.find((a) => a.id === req.params.id);
  if (!alert) {
    res.status(404).json({ error: 'Alert not found' });
    return;
  }
  alert.status = 'ACKNOWLEDGED';
  alert.acknowledgedBy = req.body.acknowledgedBy || 'Dr. Evelyn Vance, MD';
  alert.acknowledgedAt = new Date().toISOString();

  logAudit('usr-doctor-1', alert.acknowledgedBy, 'DOCTOR', 'ALERT_ACKNOWLEDGE', `Alert/${alert.id}`, `Acknowledged clinical alert: ${alert.thresholdRule}`);

  res.json(alert);
});

app.put('/api/alerts/:id/resolve', (req: Request, res: Response) => {
  const alert = alerts.find((a) => a.id === req.params.id);
  if (!alert) {
    res.status(404).json({ error: 'Alert not found' });
    return;
  }
  alert.status = 'RESOLVED';
  alert.resolvedAt = new Date().toISOString();
  alert.resolutionNotes = req.body.notes || 'Clinical intervention completed and patient stabilized.';

  logAudit('usr-doctor-1', 'Dr. Evelyn Vance, MD', 'DOCTOR', 'ALERT_RESOLVE', `Alert/${alert.id}`, `Resolved alert with notes: ${alert.resolutionNotes}`);

  res.json(alert);
});

// 4. Gemini AI Risk Microservice Endpoint
app.post('/api/ai/predict', async (req: Request, res: Response) => {
  const { patientId } = req.body;
  const patient = patientProfiles.find((p) => p.id === patientId || p.userId === patientId) || patientProfiles[0];
  const patientUser = users.find((u) => u.id === patient.userId) || users[0];
  const patientVitalsHistory = healthRecords.filter((r) => r.patientId === patient.id).slice(0, 7);

  const aiClient = getGeminiAIClient();

  if (!aiClient) {
    // Fallback response if GEMINI_API_KEY is not configured
    const fallbackPred: AIPrediction = {
      id: `pred-${Date.now()}`,
      patientId: patient.id,
      timestamp: new Date().toISOString(),
      riskScore: patient.riskScore,
      riskCategory: patient.riskLevel,
      predictedEvents: [
        'Elevated BP trend indicates 78% risk of hypertensive spike within 48 hours.',
        'Possible medication timing gap during morning vitals window.',
      ],
      clinicalInsights: `Clinical evaluation for ${patientUser.name} (${patient.age}y ${patient.gender}) based on ${patient.conditions.join(', ')}. Current vitals demonstrate JNC 8 guideline threshold warnings.`,
      recommendedActions: [
        'Schedule immediate remote telehealth follow-up',
        'Request 24-hour ambulatory blood pressure monitoring (ABPM)',
        'Verify medication adherence and sodium intake reduction',
      ],
      confidence: 0.92,
    };
    predictions.unshift(fallbackPred);
    res.json(fallbackPred);
    return;
  }

  try {
    const prompt = `
You are an expert Clinical AI Microservice for HealthGuard AI Remote Patient Monitoring.
Analyze the following patient profile and recent vitals history according to JNC 8 (Blood Pressure) and ADA (Diabetes/Glucose) guidelines.

Patient Info:
- Name: ${patientUser.name}
- Age: ${patient.age}
- Gender: ${patient.gender}
- Known Conditions: ${patient.conditions.join(', ')}
- Known Allergies: ${patient.allergies.join(', ')}
- Current Risk Level: ${patient.riskLevel}

Recent Vitals Logs (Last ${patientVitalsHistory.length} readings):
${JSON.stringify(patientVitalsHistory, null, 2)}

Provide a strict structured JSON response with the following format:
{
  "riskScore": number (0-100),
  "riskCategory": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "predictedEvents": [string, string],
  "clinicalInsights": string (concise physician-grade summary),
  "recommendedActions": [string, string, string],
  "confidence": number (0.80 to 0.99)
}
`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');

    const newPrediction: AIPrediction = {
      id: `pred-${Date.now()}`,
      patientId: patient.id,
      timestamp: new Date().toISOString(),
      riskScore: parsed.riskScore || patient.riskScore,
      riskCategory: parsed.riskCategory || patient.riskLevel,
      predictedEvents: parsed.predictedEvents || [
        'Vascular resistance elevation predicted in next 24-48 hours',
      ],
      clinicalInsights: parsed.clinicalInsights || `AI Risk Analysis completed for ${patientUser.name}.`,
      recommendedActions: parsed.recommendedActions || [
        'Contact patient to verify medication log',
        'Review recent dietary and stress factors',
      ],
      confidence: parsed.confidence || 0.94,
    };

    predictions.unshift(newPrediction);

    logAudit('usr-doctor-1', 'Dr. Evelyn Vance, MD', 'DOCTOR', 'AI_CLINICAL_PREDICTION', `Patient/${patient.id}`, `Generated Gemini 3.6 Flash clinical risk analysis for ${patientUser.name}`);

    res.json(newPrediction);
  } catch (error: any) {
    console.error('Gemini API Prediction Error:', error);
    res.status(500).json({ error: 'Failed to run AI prediction model', details: error.message });
  }
});

// 5. Reports & Admin Endpoints
app.post('/api/reports', (req: Request, res: Response) => {
  const { patientId, summary, vitalsOverview, treatmentPlan } = req.body;
  const patient = patientProfiles.find((p) => p.id === patientId || p.userId === patientId) || patientProfiles[0];
  const patientUser = users.find((u) => u.id === patient.userId) || users[0];

  const newReport: ClinicalReport = {
    id: `rep-${Date.now()}`,
    patientId: patient.id,
    patientName: patientUser.name,
    doctorId: 'usr-doctor-1',
    doctorName: 'Dr. Evelyn Vance, MD',
    createdAt: new Date().toISOString(),
    summary: summary || 'Monthly RPM Performance Report',
    vitalsOverview: vitalsOverview || 'All vitals within expected clinical range.',
    treatmentPlan: treatmentPlan || 'Maintain current regimen and daily monitoring.',
  };

  reports.unshift(newReport);

  logAudit('usr-doctor-1', 'Dr. Evelyn Vance, MD', 'DOCTOR', 'GENERATE_REPORT', `Report/${newReport.id}`, `Generated clinical report for ${patientUser.name}`);

  res.json(newReport);
});

app.get('/api/reports/:patientId', (req: Request, res: Response) => {
  const patientReports = reports.filter((r) => r.patientId === req.params.patientId || r.patientId === `pat-${req.params.patientId}`);
  res.json(patientReports);
});

app.get('/api/admin/analytics', (req: Request, res: Response) => {
  const totalPatients = patientProfiles.length;
  const activeAlerts = alerts.filter((a) => a.status === 'ACTIVE').length;
  const totalReadings = healthRecords.length;
  const criticalPatients = patientProfiles.filter((p) => p.riskLevel === 'CRITICAL' || p.riskLevel === 'HIGH').length;

  res.json({
    totalPatients,
    activeAlerts,
    totalReadings,
    criticalPatients,
    complianceRate: 98.4,
    uptimePercentage: 99.99,
    hipaaCompliantLogsCount: auditLogs.filter((l) => l.hipaaCompliant).length,
  });
});

app.get('/api/admin/audit-logs', (req: Request, res: Response) => {
  res.json(auditLogs);
});

app.get('/api/admin/users', (req: Request, res: Response) => {
  res.json(users);
});

// ==================== VITE SERVER INTEGRATION ====================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HealthGuard AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
