import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Activity, Cpu, Stethoscope, ArrowRight, Lock, CheckCircle2, Heart, Award } from 'lucide-react';
import { FloatingMedicalKit } from '../3d/FloatingMedicalKit';
import { HeartbeatAnimation } from '../3d/HeartbeatAnimation';
import { UserRole } from '../../types';

interface LandingPageProps {
  onSelectRole: (role: UserRole) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectRole }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-x-hidden" id="landing-page">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Column Text */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
            <Cpu className="w-4 h-4 animate-pulse" />
            <span>Next-Gen Remote Patient Monitoring & AI Clinical Intelligence</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Proactive Clinical Care Powered by <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400">HealthGuard AI</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
            Seamlessly monitor chronic conditions with real-time 3D telemetry, instant JNC 8 & ADA threshold alerts, and Gemini 3.6 Flash predictive clinical risk scoring.
          </p>

          {/* Quick Portal Launch Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={() => onSelectRole('PATIENT')}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-600/30 flex items-center gap-2.5 transition-all cursor-pointer active:scale-95"
              id="landing-btn-patient"
            >
              <span>Launch Patient Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onSelectRole('DOCTOR')}
              className="px-6 py-3.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-200 hover:text-white font-bold text-sm shadow-lg flex items-center gap-2.5 transition-all cursor-pointer active:scale-95"
              id="landing-btn-doctor"
            >
              <Stethoscope className="w-4 h-4 text-emerald-400" />
              <span>Doctor Console</span>
            </button>

            <button
              onClick={() => onSelectRole('ADMIN')}
              className="px-5 py-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium flex items-center gap-2 transition-all cursor-pointer"
              id="landing-btn-admin"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Compliance Admin</span>
            </button>
          </div>

          {/* HIPAA & Security Trust Badges */}
          <div className="pt-4 flex items-center gap-6 border-t border-slate-800/80 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>HIPAA Compliant</span>
            </div>
            <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
              <Lock className="w-4 h-4" />
              <span>AES-256 Encrypted</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <Award className="w-4 h-4 text-amber-400" />
              <span>JNC 8 & ADA Standard</span>
            </div>
          </div>
        </motion.div>

        {/* Right Column: 3D Rotating Medical Kit & Live Heartbeat Canvas */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative space-y-4"
        >
          <div className="relative h-[380px] w-full rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/80 p-2 shadow-2xl backdrop-blur-xl">
            <FloatingMedicalKit />

            {/* Floating Overlay Badge */}
            <div className="absolute top-4 left-4 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 backdrop-blur-md shadow-lg flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              <div>
                <p className="text-xs font-bold text-white">Live Telemetry Active</p>
                <p className="text-[10px] text-slate-400 font-mono">Bluetooth & Patch Sync</p>
              </div>
            </div>
          </div>

          {/* Live ECG Canvas */}
          <HeartbeatAnimation bpm={72} />
        </motion.div>
      </section>

      {/* Feature Cards Grid */}
      <section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto w-full border-t border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Clinical RPM Capabilities</h2>
          <p className="text-sm text-slate-400 mt-2">Built for high-accuracy remote patient monitoring, risk stratification, and seamless care delivery.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'JNC 8 & ADA Guideline Engine',
              desc: 'Automated clinical threshold checking for Systolic/Diastolic BP and Fasting/Random Blood Glucose. Instant warning and critical alerts.',
              icon: Activity,
              color: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/20',
            },
            {
              title: 'Gemini 3.6 Flash Predictive AI',
              desc: 'Evaluates multi-day patient vitals trends to forecast 48-hour acute clinical events, generating actionable physician insights.',
              icon: Cpu,
              color: 'text-indigo-400 border-indigo-500/30 bg-indigo-950/20',
            },
            {
              title: 'HIPAA Immutable Audit Trail',
              desc: 'All PHI access, vitals entry, and alert responses are logged with 6-year retention compliance and immutable cryptographic checksums.',
              icon: ShieldCheck,
              color: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20',
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className={`p-3 rounded-xl w-fit border ${item.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
