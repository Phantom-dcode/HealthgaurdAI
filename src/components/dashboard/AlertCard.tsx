import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, CheckCircle2, ShieldAlert, Clock, User, Check, Sparkles } from 'lucide-react';
import { ClinicalAlert } from '../../types';

interface AlertCardProps {
  alert: ClinicalAlert;
  onAcknowledge: (id: string) => Promise<void>;
  onResolve: (id: string, notes?: string) => Promise<void>;
}

export const AlertCard: React.FC<AlertCardProps> = ({ alert, onAcknowledge, onResolve }) => {
  const [resolveNotes, setResolveNotes] = useState('');
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const isCritical = alert.severity === 'CRITICAL';
  const isWarning = alert.severity === 'WARNING';
  const isResolved = alert.status === 'RESOLVED';
  const isAcknowledged = alert.status === 'ACKNOWLEDGED';

  const handleAck = async () => {
    setIsProcessing(true);
    try {
      await onAcknowledge(alert.id);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResolveSubmit = async () => {
    setIsProcessing(true);
    try {
      await onResolve(alert.id, resolveNotes);
      setShowResolveModal(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-xl border transition-all ${
        isResolved
          ? 'bg-slate-900/40 border-slate-800 opacity-70'
          : isCritical
          ? 'bg-red-950/20 border-red-500/50 shadow-lg shadow-red-950/20'
          : 'bg-amber-950/20 border-amber-500/40'
      }`}
      id={`alert-card-${alert.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={`p-2 rounded-lg shrink-0 mt-0.5 ${
              isResolved
                ? 'bg-slate-800 text-slate-400'
                : isCritical
                ? 'bg-red-500/20 text-red-400 animate-pulse'
                : 'bg-amber-500/20 text-amber-400'
            }`}
          >
            {isResolved ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-white">{alert.patientName}</span>
              <span className="text-xs font-mono font-semibold text-slate-400">({alert.metric})</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                  isCritical ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}
              >
                {alert.severity}
              </span>
            </div>

            <p className="text-xs text-slate-200 font-mono font-bold">Reading: {alert.value}</p>
            <p className="text-xs text-slate-400">{alert.thresholdRule}</p>

            <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1 font-mono">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {new Date(alert.createdAt).toLocaleTimeString()}
              </span>
              {alert.acknowledgedBy && (
                <span className="flex items-center gap-1 text-cyan-400">
                  <User className="w-3 h-3" /> Ack: {alert.acknowledgedBy}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          {!isResolved && (
            <>
              {!isAcknowledged && (
                <button
                  onClick={handleAck}
                  disabled={isProcessing}
                  className="px-3 py-1.5 rounded-lg bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/40 text-amber-300 text-xs font-semibold transition-all whitespace-nowrap"
                >
                  Acknowledge
                </button>
              )}
              <button
                onClick={() => setShowResolveModal(true)}
                disabled={isProcessing}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all whitespace-nowrap"
              >
                Resolve Alert
              </button>
            </>
          )}
          {isResolved && (
            <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-400 text-xs font-medium">Resolved</span>
          )}
        </div>
      </div>

      {/* Resolve Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h4 className="text-sm font-bold text-white">Resolve Clinical Alert for {alert.patientName}</h4>
            <p className="text-xs text-slate-400">{alert.thresholdRule}</p>
            <textarea
              value={resolveNotes}
              onChange={(e) => setResolveNotes(e.target.value)}
              placeholder="Clinical resolution notes (e.g., Conducted telehealth call, medication adjusted to Amlodipine 10mg)..."
              rows={3}
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none focus:border-emerald-500"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowResolveModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleResolveSubmit}
                disabled={isProcessing}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
              >
                Confirm Resolve
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
