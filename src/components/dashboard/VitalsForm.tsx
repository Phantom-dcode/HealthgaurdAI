import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Activity, AlertTriangle, CheckCircle2, Bluetooth, Radio, Cpu, Send, ShieldCheck } from 'lucide-react';
import { VitalMetrics } from '../../types';
import { evaluateVitals } from '../../lib/clinical-thresholds';

interface VitalsFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (vitals: VitalMetrics, notes?: string, source?: 'MANUAL' | 'BLUETOOTH_KIT' | 'WEARABLE_PATCH') => Promise<void>;
  patientName?: string;
}

export const VitalsForm: React.FC<VitalsFormProps> = ({ isOpen, onClose, onSubmit, patientName }) => {
  const [systolicBp, setSystolicBp] = useState<number>(128);
  const [diastolicBp, setDiastolicBp] = useState<number>(84);
  const [heartRate, setHeartRate] = useState<number>(75);
  const [bloodGlucose, setBloodGlucose] = useState<number>(112);
  const [isGlucoseFasting, setIsGlucoseFasting] = useState<boolean>(true);
  const [spO2, setSpO2] = useState<number>(97);
  const [temperature, setTemperature] = useState<number>(98.6);
  const [respiratoryRate, setRespiratoryRate] = useState<number>(16);
  const [weight, setWeight] = useState<number>(165);
  const [notes, setNotes] = useState<string>('');
  const [source, setSource] = useState<'MANUAL' | 'BLUETOOTH_KIT' | 'WEARABLE_PATCH'>('BLUETOOTH_KIT');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentVitals: VitalMetrics = {
    systolicBp,
    diastolicBp,
    heartRate,
    bloodGlucose,
    isGlucoseFasting,
    spO2,
    temperature,
    respiratoryRate,
    weight,
  };

  const evalResult = evaluateVitals(currentVitals);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(currentVitals, notes, source);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulateSync = () => {
    // Simulate Bluetooth sync from RPM Smart Monitor
    setSystolicBp(132 + Math.floor(Math.random() * 8));
    setDiastolicBp(84 + Math.floor(Math.random() * 4));
    setHeartRate(74 + Math.floor(Math.random() * 6));
    setBloodGlucose(108 + Math.floor(Math.random() * 10));
    setSpO2(98);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          id="vitals-entry-modal"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/90">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Record Daily Vitals</h3>
                <p className="text-xs text-slate-400">JNC 8 & ADA Threshold Compliance Check for {patientName || 'Patient'}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* Source Device Selection */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Telemetry Input Source</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'BLUETOOTH_KIT', name: 'Bluetooth RPM Kit', icon: Bluetooth },
                  { id: 'WEARABLE_PATCH', name: 'Wearable Patch', icon: Radio },
                  { id: 'MANUAL', name: 'Manual Entry', icon: Cpu },
                ].map((item) => {
                  const Icon = item.icon;
                  const active = source === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSource(item.id as any)}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-2 text-xs font-medium transition-all ${
                        active
                          ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300 shadow-md shadow-cyan-500/10'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </div>
              {source === 'BLUETOOTH_KIT' && (
                <button
                  type="button"
                  onClick={handleSimulateSync}
                  className="mt-1 self-end text-xs text-cyan-400 hover:underline flex items-center gap-1 font-medium"
                >
                  <Bluetooth className="w-3.5 h-3.5" /> Auto-Sync connected Bluetooth Cuff & Oximeter
                </button>
              )}
            </div>

            {/* Live Clinical Threshold Status Alert Header */}
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 transition-colors ${
                evalResult.severity === 'CRITICAL'
                  ? 'bg-red-950/30 border-red-500/50 text-red-300'
                  : evalResult.severity === 'WARNING'
                  ? 'bg-amber-950/30 border-amber-500/50 text-amber-300'
                  : 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
              }`}
            >
              {evalResult.severity === 'CRITICAL' || evalResult.severity === 'WARNING' ? (
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              )}
              <div className="text-xs">
                <div className="font-bold uppercase tracking-wider mb-1">
                  Clinical Severity: {evalResult.severity} (Risk Score: {evalResult.overallRiskScore}/100)
                </div>
                {evalResult.flags.length > 0 ? (
                  <ul className="list-disc list-inside space-y-0.5">
                    {evalResult.flags.map((f, i) => (
                      <li key={i}>
                        <span className="font-semibold">{f.metric}:</span> {f.value} — {f.rule}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>All recorded values sit within standard JNC 8 & ADA physiological reference ranges.</p>
                )}
              </div>
            </div>

            {/* Vitals Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Systolic & Diastolic BP */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <label className="text-xs font-semibold text-slate-300">Blood Pressure (mmHg)</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">Systolic</span>
                    <input
                      type="number"
                      value={systolicBp}
                      onChange={(e) => setSystolicBp(Number(e.target.value))}
                      className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono font-bold text-sm focus:border-cyan-500 outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">Diastolic</span>
                    <input
                      type="number"
                      value={diastolicBp}
                      onChange={(e) => setDiastolicBp(Number(e.target.value))}
                      className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono font-bold text-sm focus:border-cyan-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Heart Rate */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <label className="text-xs font-semibold text-slate-300">Heart Rate (bpm)</label>
                <input
                  type="number"
                  value={heartRate}
                  onChange={(e) => setHeartRate(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono font-bold text-sm focus:border-cyan-500 outline-none"
                />
                <p className="text-[10px] text-slate-500">Normal resting: 60 - 100 bpm</p>
              </div>

              {/* Blood Glucose */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">Blood Glucose (mg/dL)</label>
                  <button
                    type="button"
                    onClick={() => setIsGlucoseFasting(!isGlucoseFasting)}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700"
                  >
                    {isGlucoseFasting ? 'Fasting' : 'Post-Prandial'}
                  </button>
                </div>
                <input
                  type="number"
                  value={bloodGlucose}
                  onChange={(e) => setBloodGlucose(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono font-bold text-sm focus:border-cyan-500 outline-none"
                />
              </div>

              {/* SpO2 */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <label className="text-xs font-semibold text-slate-300">SpO2 Oxygen Saturation (%)</label>
                <input
                  type="number"
                  value={spO2}
                  onChange={(e) => setSpO2(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono font-bold text-sm focus:border-cyan-500 outline-none"
                />
                <p className="text-[10px] text-slate-500">Target range: 95% - 100%</p>
              </div>

              {/* Temperature & Respiratory */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">Temp (°F)</span>
                    <input
                      type="number"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(Number(e.target.value))}
                      className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono font-bold text-sm focus:border-cyan-500 outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">Resp Rate</span>
                    <input
                      type="number"
                      value={respiratoryRate}
                      onChange={(e) => setRespiratoryRate(Number(e.target.value))}
                      className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono font-bold text-sm focus:border-cyan-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Weight */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <label className="text-xs font-semibold text-slate-300">Body Weight (lbs)</label>
                <input
                  type="number"
                  step="0.5"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono font-bold text-sm focus:border-cyan-500 outline-none"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs font-semibold text-slate-300">Symptom & Patient Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Took morning medication with water at 8:00 AM. Feeling good."
                rows={2}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-white text-xs focus:border-cyan-500 outline-none"
              />
            </div>
          </form>

          {/* Footer */}
          <div className="p-5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>AES-256 Encrypted Telemetry Log</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Evaluating...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit & Run Analysis</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
