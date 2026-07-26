import React from 'react';
import { motion } from 'motion/react';
import { Activity, Heart, Droplet, Thermometer, Wind, Weight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { VitalMetrics } from '../../types';

interface FloatingDataPointsProps {
  vitals: VitalMetrics;
  onLogNewClick?: () => void;
}

export const FloatingDataPoints: React.FC<FloatingDataPointsProps> = ({ vitals, onLogNewClick }) => {
  const cards = [
    {
      id: 'card-bp',
      title: 'Blood Pressure',
      value: `${vitals.systolicBp}/${vitals.diastolicBp}`,
      unit: 'mmHg',
      icon: Activity,
      status: vitals.systolicBp >= 140 || vitals.diastolicBp >= 90 ? 'CRITICAL' : vitals.systolicBp >= 121 || vitals.diastolicBp >= 81 ? 'WARNING' : 'NORMAL',
      reference: 'JNC 8: Target <120/80',
      gradient: 'from-cyan-500/10 to-blue-500/10 border-cyan-500/20 text-cyan-400',
    },
    {
      id: 'card-hr',
      title: 'Heart Rate',
      value: vitals.heartRate,
      unit: 'bpm',
      icon: Heart,
      status: vitals.heartRate > 120 || vitals.heartRate < 50 ? 'CRITICAL' : vitals.heartRate > 100 || vitals.heartRate < 60 ? 'WARNING' : 'NORMAL',
      reference: 'Normal: 60 - 100 bpm',
      gradient: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-400',
    },
    {
      id: 'card-glucose',
      title: 'Blood Glucose',
      value: vitals.bloodGlucose,
      unit: 'mg/dL',
      icon: Droplet,
      status: vitals.bloodGlucose > 300 || vitals.bloodGlucose < 70 ? 'CRITICAL' : vitals.bloodGlucose >= 140 ? 'WARNING' : 'NORMAL',
      reference: vitals.isGlucoseFasting ? 'ADA Fasting: 70-100' : 'ADA Random: <140',
      gradient: 'from-amber-500/10 to-yellow-500/10 border-amber-500/20 text-amber-400',
    },
    {
      id: 'card-spo2',
      title: 'SpO2 Oxygen',
      value: `${vitals.spO2}%`,
      unit: 'Sat',
      icon: Wind,
      status: vitals.spO2 < 90 ? 'CRITICAL' : vitals.spO2 <= 94 ? 'WARNING' : 'NORMAL',
      reference: 'Target: 95% - 100%',
      gradient: 'from-purple-500/10 to-indigo-500/10 border-purple-500/20 text-purple-400',
    },
    {
      id: 'card-temp',
      title: 'Body Temp',
      value: `${vitals.temperature}°`,
      unit: 'F',
      icon: Thermometer,
      status: vitals.temperature >= 103 ? 'CRITICAL' : vitals.temperature >= 100.4 || vitals.temperature <= 95 ? 'WARNING' : 'NORMAL',
      reference: 'Normal: 98.6°F',
      gradient: 'from-sky-500/10 to-slate-500/10 border-sky-500/20 text-sky-400',
    },
    {
      id: 'card-weight',
      title: 'Body Weight',
      value: vitals.weight,
      unit: 'lbs',
      icon: Weight,
      status: 'NORMAL',
      reference: 'BMI Target Stable',
      gradient: 'from-teal-500/10 to-emerald-500/10 border-teal-500/20 text-teal-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="floating-data-points-grid">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        const isCritical = card.status === 'CRITICAL';
        const isWarning = card.status === 'WARNING';

        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.08 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className={`p-5 rounded-2xl bg-slate-900/80 backdrop-blur-md border shadow-lg relative overflow-hidden transition-all ${
              isCritical
                ? 'border-red-500/50 bg-red-950/20 shadow-red-900/20'
                : isWarning
                ? 'border-amber-500/50 bg-amber-950/20'
                : 'border-slate-800 hover:border-cyan-500/30'
            }`}
            id={`metric-card-${card.id}`}
          >
            {/* Background accent glow */}
            <div className="absolute -right-8 -bottom-8 w-28 h-28 rounded-full bg-cyan-500/5 blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className={`p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50 ${card.gradient}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-slate-300">{card.title}</span>
              </div>

              {/* Status Badge */}
              {isCritical ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-[11px] font-semibold text-red-400 animate-pulse">
                  <AlertTriangle className="w-3 h-3" /> Critical
                </span>
              ) : isWarning ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[11px] font-semibold text-amber-400">
                  <AlertTriangle className="w-3 h-3" /> Warning
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-medium text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" /> Normal
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-2 my-2">
              <span className="text-3xl font-extrabold tracking-tight text-white font-mono">{card.value}</span>
              <span className="text-xs font-medium text-slate-400">{card.unit}</span>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span className="truncate">{card.reference}</span>
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">RPM Sync</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
