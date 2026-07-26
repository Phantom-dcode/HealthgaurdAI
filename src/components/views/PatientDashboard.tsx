import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Activity, Plus, Clock, AlertTriangle, ShieldCheck, User, Stethoscope, RefreshCw, CheckCircle2, ChevronRight, FileText } from 'lucide-react';
import { FloatingDataPoints } from '../3d/FloatingDataPoints';
import { HeartbeatAnimation } from '../3d/HeartbeatAnimation';
import { HealthChart } from '../dashboard/HealthChart';
import { RiskScoreCard } from '../dashboard/RiskScoreCard';
import { AlertCard } from '../dashboard/AlertCard';
import { VitalsForm } from '../dashboard/VitalsForm';
import { PatientProfile, HealthRecord, ClinicalAlert, AIPrediction, VitalMetrics, User as UserType } from '../../types';

interface PatientDashboardProps {
  patient: PatientProfile;
  user: UserType | null;
  records: HealthRecord[];
  alerts: ClinicalAlert[];
  prediction: AIPrediction | null;
  onLogVitalsSubmit: (vitals: VitalMetrics, notes?: string, source?: 'MANUAL' | 'BLUETOOTH_KIT' | 'WEARABLE_PATCH') => Promise<void>;
  onAcknowledgeAlert: (id: string) => Promise<void>;
  onResolveAlert: (id: string, notes?: string) => Promise<void>;
  onRefreshAIPrediction: () => Promise<void>;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  patient,
  user,
  records,
  alerts,
  prediction,
  onLogVitalsSubmit,
  onAcknowledgeAlert,
  onResolveAlert,
  onRefreshAIPrediction,
}) => {
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
  const [isRefreshingAI, setIsRefreshingAI] = useState(false);

  const latestRecord = records[0];
  const currentVitals: VitalMetrics = latestRecord?.vitals || {
    systolicBp: 124,
    diastolicBp: 82,
    heartRate: 72,
    bloodGlucose: 104,
    isGlucoseFasting: true,
    spO2: 98,
    temperature: 98.6,
    weight: 164.5,
    respiratoryRate: 16,
  };

  const handleRefreshAI = async () => {
    setIsRefreshingAI(true);
    try {
      await onRefreshAIPrediction();
    } finally {
      setIsRefreshingAI(false);
    }
  };

  const patientAlerts = alerts.filter((a) => a.patientId === patient.id || a.patientName === user?.name);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8" id="patient-dashboard-container">
      {/* Patient Profile Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
      >
        <div className="flex items-center gap-4">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250'}
            alt={user?.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-500/50 shadow-lg shadow-cyan-500/20"
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-white">{user?.name || 'Sarah Jenkins'}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold">
                {patient.mrn}
              </span>
              <span className="text-xs font-mono text-slate-400">({patient.age}y {patient.gender})</span>
            </div>

            <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
              <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />
              <span>Primary Doctor: <strong className="text-white">{patient.primaryDoctorName}</strong></span>
            </p>

            <div className="flex items-center gap-2 mt-2 flex-wrap text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Conditions:</span>
              {patient.conditions.map((cond, i) => (
                <span key={i} className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px]">
                  {cond}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Header CTA & Risk Status */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setIsVitalsModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-xl shadow-cyan-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
            id="btn-log-vitals-patient-dashboard"
          >
            <Plus className="w-4 h-4" />
            <span>Log Daily Vitals</span>
          </button>
        </div>
      </motion.div>

      {/* Live ECG Pulse Canvas */}
      <HeartbeatAnimation bpm={currentVitals.heartRate} isAlert={patient.riskLevel === 'CRITICAL'} />

      {/* 3D Floating Vital Metric Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <span>Current Vitals Telemetry</span>
          </h2>
          <span className="text-xs font-mono text-slate-400">
            Last Sync: {latestRecord ? new Date(latestRecord.timestamp).toLocaleTimeString() : 'Just Now'}
          </span>
        </div>
        <FloatingDataPoints vitals={currentVitals} />
      </div>

      {/* Main Grid: Health Chart & AI Risk Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <HealthChart records={records} />
        </div>
        <div>
          <RiskScoreCard prediction={prediction} onRefreshAI={handleRefreshAI} isLoading={isRefreshingAI} />
        </div>
      </div>

      {/* Active Clinical Alerts Section */}
      {patientAlerts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span>Clinical Alerts & Warnings ({patientAlerts.length})</span>
          </h2>
          <div className="space-y-3">
            {patientAlerts.map((alt) => (
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

      {/* Historical Telemetry Logs Table */}
      <div className="p-6 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            <span>Historical Vitals Log</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">AES-256 Encrypted Storage</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Source</th>
                <th className="p-3">BP (mmHg)</th>
                <th className="p-3">HR (bpm)</th>
                <th className="p-3">Glucose (mg/dL)</th>
                <th className="p-3">SpO2</th>
                <th className="p-3">Status</th>
                <th className="p-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-mono text-slate-400">{new Date(r.timestamp).toLocaleString()}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-cyan-300">
                      {r.source}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-bold text-white">
                    {r.vitals.systolicBp}/{r.vitals.diastolicBp}
                  </td>
                  <td className="p-3 font-mono">{r.vitals.heartRate}</td>
                  <td className="p-3 font-mono">{r.vitals.bloodGlucose}</td>
                  <td className="p-3 font-mono">{r.vitals.spO2}%</td>
                  <td className="p-3">
                    {r.flaggedCritical ? (
                      <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-bold text-[10px]">
                        Critical
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px]">
                        Normal
                      </span>
                    )}
                  </td>
                  <td className="p-3 max-w-xs truncate text-slate-400">{r.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vitals Input Modal */}
      <VitalsForm
        isOpen={isVitalsModalOpen}
        onClose={() => setIsVitalsModalOpen(false)}
        onSubmit={onLogVitalsSubmit}
        patientName={user?.name}
      />
    </div>
  );
};
