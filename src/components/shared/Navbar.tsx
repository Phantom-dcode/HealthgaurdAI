import React from 'react';
import { ShieldCheck, Bell, Activity, User as UserIcon, Stethoscope, ShieldAlert, Cpu } from 'lucide-react';
import { UserRole, User } from '../../types';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  currentUser: User | null;
  activeAlertsCount: number;
  onLogVitalsClick?: () => void;
  onRunAIPredictClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  currentUser,
  activeAlertsCount,
  onLogVitalsClick,
  onRunAIPredictClick,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 lg:px-8 py-3" id="app-header-navbar">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-emerald-500 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white font-sans">HealthGuard</span>
              <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">AI</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">Remote Patient Monitoring Platform</p>
          </div>
        </div>

        {/* Center: Role Selector Pills */}
        <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800" id="role-selector">
          {(['PATIENT', 'DOCTOR', 'ADMIN'] as UserRole[]).map((role) => (
            <button
              key={role}
              onClick={() => onRoleChange(role)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                currentRole === role
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              id={`role-btn-${role.toLowerCase()}`}
            >
              {role === 'PATIENT' ? 'Patient Portal' : role === 'DOCTOR' ? 'Doctor Console' : 'Compliance Admin'}
            </button>
          ))}
        </div>

        {/* Right Actions & User Profile */}
        <div className="flex items-center gap-3">
          {/* Quick Action Buttons */}
          {currentRole === 'PATIENT' && onLogVitalsClick && (
            <button
              onClick={onLogVitalsClick}
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/20 transition-all cursor-pointer active:scale-95"
              id="btn-log-vitals-header"
            >
              <Activity className="w-4 h-4" />
              <span>Log Vitals</span>
            </button>
          )}

          {currentRole === 'DOCTOR' && onRunAIPredictClick && (
            <button
              onClick={onRunAIPredictClick}
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all cursor-pointer active:scale-95"
              id="btn-ai-analysis-header"
            >
              <Cpu className="w-4 h-4" />
              <span>Run AI Risk Predict</span>
            </button>
          )}

          {/* Active Alerts Pill */}
          <div className="relative">
            <button className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white relative">
              <Bell className="w-4 h-4" />
              {activeAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {activeAlertsCount}
                </span>
              )}
            </button>
          </div>

          {/* HIPAA Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>HIPAA Verified</span>
          </div>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
            {currentUser?.avatar ? (
              <img src={currentUser.avatar} alt={currentUser.name} className="w-8 h-8 rounded-full object-cover border border-slate-700" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
                <UserIcon className="w-4 h-4" />
              </div>
            )}
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-white leading-tight">{currentUser?.name || 'Authorized User'}</p>
              <p className="text-[10px] text-slate-400 font-mono">{currentRole}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
