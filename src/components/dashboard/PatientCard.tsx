import React from 'react';
import { motion } from 'motion/react';
import { User, Activity, AlertTriangle, ChevronRight, ShieldAlert, FileText, Heart } from 'lucide-react';
import { PatientProfile } from '../../types';

interface PatientCardProps {
  patient: PatientProfile & { userName: string; email?: string; avatar?: string; activeAlertsCount: number };
  onSelect: (patientId: string) => void;
  isSelected?: boolean;
}

export const PatientCard: React.FC<PatientCardProps> = ({ patient, onSelect, isSelected }) => {
  const riskBadge =
    patient.riskLevel === 'CRITICAL'
      ? 'bg-red-500/20 text-red-400 border-red-500/40'
      : patient.riskLevel === 'HIGH'
      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
      : patient.riskLevel === 'MEDIUM'
      ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40'
      : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      onClick={() => onSelect(patient.id)}
      className={`p-4 rounded-xl border transition-all cursor-pointer ${
        isSelected
          ? 'bg-cyan-950/30 border-cyan-500 shadow-lg shadow-cyan-500/10'
          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
      }`}
      id={`patient-card-${patient.id}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {patient.avatar ? (
            <img src={patient.avatar} alt={patient.userName} className="w-11 h-11 rounded-xl object-cover border border-slate-700" />
          ) : (
            <div className="w-11 h-11 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 font-bold">
              {patient.userName.charAt(0)}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white">{patient.userName}</h4>
              <span className="text-xs text-slate-400 font-mono">({patient.age}y {patient.gender.charAt(0)})</span>
            </div>
            <p className="text-xs font-mono text-slate-500">{patient.mrn}</p>
          </div>
        </div>

        {/* Risk Level Badge */}
        <div className="flex items-center gap-2">
          {patient.activeAlertsCount > 0 && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-bold animate-pulse">
              <AlertTriangle className="w-3 h-3" /> {patient.activeAlertsCount} Alerts
            </span>
          )}
          <span className={`px-2.5 py-1 rounded-lg border text-xs font-bold font-mono uppercase ${riskBadge}`}>
            {patient.riskLevel} ({patient.riskScore})
          </span>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span className="truncate max-w-[200px] text-slate-300">{patient.conditions.join(', ')}</span>
        <span className="text-[10px] font-mono text-slate-500">
          Sync: {patient.lastVitalsSync ? new Date(patient.lastVitalsSync).toLocaleTimeString() : 'N/A'}
        </span>
      </div>
    </motion.div>
  );
};
