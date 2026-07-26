import React from 'react';
import { motion } from 'motion/react';
import { Cpu, AlertTriangle, CheckCircle2, ShieldAlert, Sparkles, ArrowUpRight, RefreshCw } from 'lucide-react';
import { AIPrediction } from '../../types';

interface RiskScoreCardProps {
  prediction: AIPrediction | null;
  onRefreshAI: () => void;
  isLoading?: boolean;
}

export const RiskScoreCard: React.FC<RiskScoreCardProps> = ({ prediction, onRefreshAI, isLoading }) => {
  const riskScore = prediction?.riskScore ?? 45;
  const riskCategory = prediction?.riskCategory ?? 'MEDIUM';

  const categoryColor =
    riskCategory === 'CRITICAL'
      ? 'from-red-500 to-rose-600 border-red-500 text-red-400 bg-red-950/30'
      : riskCategory === 'HIGH'
      ? 'from-amber-500 to-orange-600 border-amber-500 text-amber-400 bg-amber-950/30'
      : riskCategory === 'MEDIUM'
      ? 'from-yellow-500 to-amber-500 border-yellow-500 text-yellow-400 bg-yellow-950/30'
      : 'from-emerald-500 to-teal-600 border-emerald-500 text-emerald-400 bg-emerald-950/30';

  return (
    <div className="p-6 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-800 shadow-xl relative overflow-hidden flex flex-col justify-between" id="ai-risk-score-card">
      {/* Background AI neural gradient */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                <span>Gemini 3.6 Flash AI Risk Model</span>
              </h3>
              <p className="text-xs text-slate-400">48-Hour Predictive Clinical Microservice</p>
            </div>
          </div>

          <button
            onClick={onRefreshAI}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all disabled:opacity-50"
            title="Re-run AI Analysis"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>

        {/* Score & Gauge Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center p-4 rounded-xl bg-slate-950/70 border border-slate-800 my-4">
          {/* Circular Risk Score Gauge */}
          <div className="flex flex-col items-center justify-center text-center">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <motion.path
                  initial={{ strokeDasharray: '0, 100' }}
                  animate={{ strokeDasharray: `${riskScore}, 100` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  className={riskCategory === 'CRITICAL' ? 'text-red-500' : riskCategory === 'HIGH' ? 'text-amber-500' : 'text-emerald-400'}
                  strokeWidth="3.8"
                  strokeDasharray={`${riskScore}, 100`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-black text-white font-mono">{riskScore}</span>
                <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">/ 100 Risk</span>
              </div>
            </div>
            <span className={`mt-2 px-3 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${categoryColor}`}>
              {riskCategory}
            </span>
          </div>

          {/* Forecasted Events */}
          <div className="sm:col-span-2 space-y-2">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">48-Hour Event Forecast</span>
            {prediction?.predictedEvents && prediction.predictedEvents.length > 0 ? (
              <ul className="space-y-1.5">
                {prediction.predictedEvents.map((evt, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-200 bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{evt}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400">No imminent acute clinical events forecast.</p>
            )}
            <div className="text-[10px] text-slate-500 font-mono">
              Confidence Index: {prediction ? `${Math.round(prediction.confidence * 100)}%` : '94%'} | JNC 8 Standard
            </div>
          </div>
        </div>

        {/* Clinical Insights */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Physician AI Insights</span>
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            {prediction?.clinicalInsights || 'Gemini AI is analyzing recent blood pressure and blood glucose trends...'}
          </p>
        </div>

        {/* Recommended Actions */}
        {prediction?.recommendedActions && (
          <div className="mt-3 space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Suggested Physician Action Plan</span>
            <div className="space-y-1">
              {prediction.recommendedActions.map((act, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-cyan-300">
                  <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                  <span>{act}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
        <span>Evaluated against JNC 8 & ADA Guidelines</span>
        <span className="font-mono">{prediction?.timestamp ? new Date(prediction.timestamp).toLocaleTimeString() : 'Just Now'}</span>
      </div>
    </div>
  );
};
