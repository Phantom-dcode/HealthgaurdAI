import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Stethoscope,
  Users,
  AlertTriangle,
  Cpu,
  Search,
  Filter,
  FileText,
  Plus,
  X,
  Send,
  Activity,
  Phone,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { PatientCard } from '../dashboard/PatientCard';
import { AlertCard } from '../dashboard/AlertCard';
import { HealthChart } from '../dashboard/HealthChart';
import { RiskScoreCard } from '../dashboard/RiskScoreCard';
import { PatientProfile, HealthRecord, ClinicalAlert, AIPrediction, ClinicalReport, User } from '../../types';

interface DoctorDashboardProps {
  patients: (PatientProfile & { userName: string; email?: string; avatar?: string; activeAlertsCount: number })[];
  alerts: ClinicalAlert[];
  records: HealthRecord[];
  prediction: AIPrediction | null;
  reports: ClinicalReport[];
  selectedPatientId: string;
  onSelectPatient: (patientId: string) => void;
  onAcknowledgeAlert: (id: string) => Promise<void>;
  onResolveAlert: (id: string, notes?: string) => Promise<void>;
  onRefreshAIPrediction: () => Promise<void>;
  onCreateReport: (patientId: string, summary: string, vitalsOverview: string, treatmentPlan: string) => Promise<void>;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({
  patients,
  alerts,
  records,
  prediction,
  reports,
  selectedPatientId,
  onSelectPatient,
  onAcknowledgeAlert,
  onResolveAlert,
  onRefreshAIPrediction,
  onCreateReport,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [showReportModal, setShowReportModal] = useState(false);
  const [isRefreshingAI, setIsRefreshingAI] = useState(false);

  // Form states for clinical report
  const [reportSummary, setReportSummary] = useState('');
  const [reportVitalsOverview, setReportVitalsOverview] = useState('');
  const [reportTreatmentPlan, setReportTreatmentPlan] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const activePatient = patients.find((p) => p.id === selectedPatientId) || patients[0];
  const activePatientRecords = records.filter((r) => r.patientId === activePatient?.id);
  const activePatientAlerts = alerts.filter((a) => a.patientId === activePatient?.id);

  // Filter patients
  const filteredPatients = patients.filter((p) => {
    const matchesSearch = p.userName.toLowerCase().includes(searchTerm.toLowerCase()) || p.mrn.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = riskFilter === 'ALL' || p.riskLevel === riskFilter;
    return matchesSearch && matchesRisk;
  });

  const handleRefreshAI = async () => {
    setIsRefreshingAI(true);
    try {
      await onRefreshAIPrediction();
    } finally {
      setIsRefreshingAI(false);
    }
  };

  const handleCreateReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient) return;
    setIsSubmittingReport(true);
    try {
      await onCreateReport(activePatient.id, reportSummary, reportVitalsOverview, reportTreatmentPlan);
      setShowReportModal(false);
      setReportSummary('');
      setReportVitalsOverview('');
      setReportTreatmentPlan('');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8" id="doctor-dashboard-container">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/20">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">Physician Remote Monitoring Console</h1>
            <p className="text-xs text-slate-400">Dr. Evelyn Vance, MD — Cardiology & Telehealth RPM</p>
          </div>
        </div>

        {/* Triage Summary Stats */}
        <div className="flex items-center gap-3 text-xs">
          <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <span>Assigned: <strong className="text-white font-mono">{patients.length} Patients</strong></span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>Critical Alerts: <strong className="font-mono">{alerts.filter((a) => a.status === 'ACTIVE' && a.severity === 'CRITICAL').length}</strong></span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Roster & Right Patient Deep Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Patient Roster (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>RPM Patient Roster</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-500">{filteredPatients.length} shown</span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by name or MRN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-cyan-500 outline-none"
              />
            </div>

            {/* Risk Filter Buttons */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
              {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRiskFilter(r)}
                  className={`px-2.5 py-1 rounded-lg font-mono font-bold transition-all ${
                    riskFilter === r
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Patient Cards List */}
            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {filteredPatients.map((p) => (
                <PatientCard
                  key={p.id}
                  patient={p}
                  onSelect={onSelectPatient}
                  isSelected={p.id === selectedPatientId}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Selected Patient Deep Dive & Actions (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {activePatient && (
            <>
              {/* Selected Patient Banner */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={activePatient.avatar}
                      alt={activePatient.userName}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-cyan-500/40"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-black text-white">{activePatient.userName}</h2>
                        <span className="text-xs font-mono text-slate-400">MRN: {activePatient.mrn}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {activePatient.age} years old • {activePatient.gender} • Risk Level: <strong className="text-cyan-300 font-mono">{activePatient.riskLevel} ({activePatient.riskScore})</strong>
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-slate-300">
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Emergency: {activePatient.emergencyContact.name} ({activePatient.emergencyContact.phone})</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowReportModal(true)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-cyan-400" />
                      <span>New Clinical Report</span>
                    </button>
                    <button
                      onClick={handleRefreshAI}
                      disabled={isRefreshingAI}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-600/20"
                    >
                      <Sparkles className={`w-4 h-4 ${isRefreshingAI ? 'animate-spin' : ''}`} />
                      <span>Run Gemini 3.6 Flash</span>
                    </button>
                  </div>
                </div>

                {/* Conditions & Allergies */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold block mb-1">Diagnosed Conditions:</span>
                    <div className="flex flex-wrap gap-1">
                      {activePatient.conditions.map((c, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-950 text-slate-200 font-mono text-[11px]">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block mb-1">Documented Allergies:</span>
                    <div className="flex flex-wrap gap-1">
                      {activePatient.allergies.map((a, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-red-950/40 border border-red-500/30 text-red-300 font-mono text-[11px]">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Risk Prediction Card & Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RiskScoreCard prediction={prediction} onRefreshAI={handleRefreshAI} isLoading={isRefreshingAI} />
                <HealthChart records={activePatientRecords} />
              </div>

              {/* Patient Active Alerts */}
              {activePatientAlerts.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <span>Patient Triage Alerts ({activePatientAlerts.length})</span>
                  </h3>
                  <div className="space-y-3">
                    {activePatientAlerts.map((alt) => (
                      <AlertCard
                        key={alt.id}
                        alert={alt}
                        onAcknowledge={onAcknowledgeAlert}
                        onResolve={onResolveAlert}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Telehealth Reports */}
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  <span>Clinical Telehealth Reports ({reports.length})</span>
                </h3>
                {reports.length === 0 ? (
                  <p className="text-xs text-slate-500">No telehealth reports filed for this patient yet.</p>
                ) : (
                  <div className="space-y-3">
                    {reports.map((rep) => (
                      <div key={rep.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                          <span>Report #{rep.id}</span>
                          <span>{new Date(rep.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="font-bold text-white">{rep.summary}</p>
                        <p className="text-slate-300"><strong className="text-slate-400">Vitals:</strong> {rep.vitalsOverview}</p>
                        <p className="text-cyan-300"><strong className="text-slate-400">Plan:</strong> {rep.treatmentPlan}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* New Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">New Telehealth Clinical Report</h3>
              <button onClick={() => setShowReportModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReportSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Clinical Summary Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bi-weekly RPM Review for Essential Hypertension"
                  value={reportSummary}
                  onChange={(e) => setReportSummary(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Vitals Overview</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Systolic BP averaged 138 mmHg over 14 readings with 2 elevated spikes..."
                  value={reportVitalsOverview}
                  onChange={(e) => setReportVitalsOverview(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Treatment Plan & Medication Adjustment</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Increase Lisinopril to 20mg once daily. Instruct patient to log morning BP after resting 5 min..."
                  value={reportTreatmentPlan}
                  onChange={(e) => setReportTreatmentPlan(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReport}
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Save Report</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
