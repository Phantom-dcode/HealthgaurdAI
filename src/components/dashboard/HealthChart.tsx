import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { Activity, Heart, Droplet, Wind } from 'lucide-react';
import { HealthRecord } from '../../types';

interface HealthChartProps {
  records: HealthRecord[];
}

export const HealthChart: React.FC<HealthChartProps> = ({ records }) => {
  const [metric, setMetric] = useState<'BP' | 'HR' | 'GLUCOSE' | 'SPO2'>('BP');

  // Format data for Recharts sorted chronologically
  const chartData = [...records]
    .reverse()
    .map((r) => ({
      date: new Date(r.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      systolic: r.vitals.systolicBp,
      diastolic: r.vitals.diastolicBp,
      heartRate: r.vitals.heartRate,
      glucose: r.vitals.bloodGlucose,
      spO2: r.vitals.spO2,
    }));

  return (
    <div className="p-6 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-800 shadow-xl space-y-4" id="health-chart-panel">
      {/* Header & Metric Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <span>30-Day Physiological Vitals Trend</span>
          </h3>
          <p className="text-xs text-slate-400">JNC 8 & ADA Guideline Threshold Overlays</p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
          {[
            { id: 'BP', label: 'Blood Pressure', icon: Activity },
            { id: 'HR', label: 'Heart Rate', icon: Heart },
            { id: 'GLUCOSE', label: 'Glucose', icon: Droplet },
            { id: 'SPO2', label: 'SpO2 Sat', icon: Wind },
          ].map((item) => {
            const Icon = item.icon;
            const active = metric === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setMetric(item.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  active
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recharts Container */}
      <div className="h-72 w-full pt-2">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-xs">
            No vitals history recorded yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                }}
              />

              {/* BP Chart */}
              {metric === 'BP' && (
                <>
                  <ReferenceLine y={140} label={{ value: 'JNC 8 Stage 2 (140)', fill: '#ef4444', fontSize: 10 }} stroke="#ef4444" strokeDasharray="4 4" />
                  <ReferenceLine y={120} label={{ value: 'Normal Target (120)', fill: '#10b981', fontSize: 10 }} stroke="#10b981" strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="systolic" name="Systolic BP" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4, fill: '#06b6d4' }} activeDot={{ r: 7 }} />
                  <Line type="monotone" dataKey="diastolic" name="Diastolic BP" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3, fill: '#3b82f6' }} />
                </>
              )}

              {/* Heart Rate Chart */}
              {metric === 'HR' && (
                <>
                  <ReferenceLine y={100} label={{ value: 'Tachycardia (100)', fill: '#f59e0b', fontSize: 10 }} stroke="#f59e0b" strokeDasharray="4 4" />
                  <ReferenceLine y={60} label={{ value: 'Bradycardia (60)', fill: '#3b82f6', fontSize: 10 }} stroke="#3b82f6" strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="heartRate" name="Heart Rate (bpm)" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 7 }} />
                </>
              )}

              {/* Glucose Chart */}
              {metric === 'GLUCOSE' && (
                <>
                  <ReferenceLine y={140} label={{ value: 'ADA High (140)', fill: '#f59e0b', fontSize: 10 }} stroke="#f59e0b" strokeDasharray="4 4" />
                  <ReferenceLine y={70} label={{ value: 'ADA Low (70)', fill: '#ef4444', fontSize: 10 }} stroke="#ef4444" strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="glucose" name="Blood Glucose (mg/dL)" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b' }} activeDot={{ r: 7 }} />
                </>
              )}

              {/* SpO2 Chart */}
              {metric === 'SPO2' && (
                <>
                  <ReferenceLine y={90} label={{ value: 'Hypoxemia (<90%)', fill: '#ef4444', fontSize: 10 }} stroke="#ef4444" strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="spO2" name="SpO2 Saturation (%)" stroke="#a855f7" strokeWidth={3} dot={{ r: 4, fill: '#a855f7' }} activeDot={{ r: 7 }} />
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
