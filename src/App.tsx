import React, { useState, useEffect } from 'react';
import { Navbar } from './components/shared/Navbar';
import { LandingPage } from './components/views/LandingPage';
import { PatientDashboard } from './components/views/PatientDashboard';
import { DoctorDashboard } from './components/views/DoctorDashboard';
import { AdminDashboard } from './components/views/AdminDashboard';
import { api } from './lib/api';
import { UserRole, User, PatientProfile, HealthRecord, ClinicalAlert, AIPrediction, ClinicalReport, AuditLog, VitalMetrics } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'LANDING' | 'PATIENT' | 'DOCTOR' | 'ADMIN'>('LANDING');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [patients, setPatients] = useState<(PatientProfile & { userName: string; email?: string; avatar?: string; activeAlertsCount: number })[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('pat-1');
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [alerts, setAlerts] = useState<ClinicalAlert[]>([]);
  const [prediction, setPrediction] = useState<AIPrediction | null>(null);
  const [reports, setReports] = useState<ClinicalReport[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [adminAnalytics, setAdminAnalytics] = useState<any>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize data from Express API
  const fetchData = async (role: UserRole = 'PATIENT') => {
    try {
      const email =
        role === 'PATIENT'
          ? 'sarah.jenkins@patient.healthguard.ai'
          : role === 'DOCTOR'
          ? 'dr.vance@healthguard.ai'
          : 'admin@healthguard.ai';

      const authRes = await api.login(email, role);
      if (authRes.user) {
        setCurrentUser(authRes.user);
        setPatientProfile(authRes.patientProfile);
      }

      const [pList, recordsList, alertsList, auditList, analyticsRes, usersRes] = await Promise.all([
        api.getPatients(),
        api.getVitalsHistory(),
        api.getAlerts(),
        api.getAuditLogs(),
        api.getAdminAnalytics(),
        api.getUsers(),
      ]);

      setPatients(pList);
      setHealthRecords(recordsList);
      setAlerts(alertsList);
      setAuditLogs(auditList);
      setAdminAnalytics(analyticsRes);
      setUsersList(usersRes);

      // Fetch prediction for selected patient
      if (selectedPatientId) {
        const pred = await api.generateAIPrediction(selectedPatientId);
        setPrediction(pred);
        const rep = await api.getReports(selectedPatientId);
        setReports(rep);
      }
    } catch (err) {
      console.error('Failed to load API data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData('PATIENT');
  }, []);

  // Handle Role Switch
  const handleRoleChange = async (role: UserRole) => {
    setIsLoading(true);
    setActiveTab(role);
    await fetchData(role);
  };

  const handleSelectRoleFromLanding = (role: UserRole) => {
    handleRoleChange(role);
  };

  // Handle Vitals Submission
  const handleLogVitalsSubmit = async (
    vitals: VitalMetrics,
    notes?: string,
    source?: 'MANUAL' | 'BLUETOOTH_KIT' | 'WEARABLE_PATCH'
  ) => {
    const targetPatientId = patientProfile?.id || 'pat-1';
    await api.logVitals(targetPatientId, vitals, notes, source);
    await fetchData(currentUser?.role || 'PATIENT');
  };

  // Handle Alert Acknowledge & Resolve
  const handleAcknowledgeAlert = async (id: string) => {
    await api.acknowledgeAlert(id, currentUser?.name || 'Authorized Doctor');
    const updatedAlerts = await api.getAlerts();
    setAlerts(updatedAlerts);
  };

  const handleResolveAlert = async (id: string, notes?: string) => {
    await api.resolveAlert(id, notes);
    const updatedAlerts = await api.getAlerts();
    setAlerts(updatedAlerts);
  };

  // Handle Refresh AI Prediction
  const handleRefreshAIPrediction = async () => {
    const targetId = selectedPatientId || patientProfile?.id || 'pat-1';
    const pred = await api.generateAIPrediction(targetId);
    setPrediction(pred);
  };

  // Handle Create Telehealth Report
  const handleCreateReport = async (
    patientId: string,
    summary: string,
    vitalsOverview: string,
    treatmentPlan: string
  ) => {
    await api.createReport(patientId, summary, vitalsOverview, treatmentPlan);
    const rep = await api.getReports(patientId);
    setReports(rep);
  };

  // Handle Patient selection in Doctor View
  const handleSelectPatient = async (patientId: string) => {
    setSelectedPatientId(patientId);
    const pred = await api.generateAIPrediction(patientId);
    setPrediction(pred);
    const rep = await api.getReports(patientId);
    setReports(rep);
  };

  const activeAlertsCount = alerts.filter((a) => a.status === 'ACTIVE').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar
        currentRole={activeTab === 'LANDING' ? 'PATIENT' : activeTab}
        onRoleChange={handleRoleChange}
        currentUser={currentUser}
        activeAlertsCount={activeAlertsCount}
        onLogVitalsClick={() => handleRoleChange('PATIENT')}
        onRunAIPredictClick={handleRefreshAIPrediction}
      />

      {/* Main Content Views */}
      <main className="flex-1">
        {activeTab === 'LANDING' && (
          <LandingPage onSelectRole={handleSelectRoleFromLanding} />
        )}

        {activeTab === 'PATIENT' && patientProfile && (
          <PatientDashboard
            patient={patientProfile}
            user={currentUser}
            records={healthRecords.filter((r) => r.patientId === patientProfile.id)}
            alerts={alerts}
            prediction={prediction}
            onLogVitalsSubmit={handleLogVitalsSubmit}
            onAcknowledgeAlert={handleAcknowledgeAlert}
            onResolveAlert={handleResolveAlert}
            onRefreshAIPrediction={handleRefreshAIPrediction}
          />
        )}

        {activeTab === 'DOCTOR' && (
          <DoctorDashboard
            patients={patients}
            alerts={alerts}
            records={healthRecords}
            prediction={prediction}
            reports={reports}
            selectedPatientId={selectedPatientId}
            onSelectPatient={handleSelectPatient}
            onAcknowledgeAlert={handleAcknowledgeAlert}
            onResolveAlert={handleResolveAlert}
            onRefreshAIPrediction={handleRefreshAIPrediction}
            onCreateReport={handleCreateReport}
          />
        )}

        {activeTab === 'ADMIN' && (
          <AdminDashboard
            auditLogs={auditLogs}
            users={usersList}
            analytics={adminAnalytics}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 px-4 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 HealthGuard AI — Production Remote Patient Monitoring Platform.</p>
          <div className="flex items-center gap-4 font-mono text-[11px] text-slate-400">
            <span>JNC 8 & ADA Compliant</span>
            <span>AES-256 Encrypted</span>
            <span>Gemini 3.6 Flash Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
