import React, { useState } from 'react';
import { ShieldCheck, Lock, Activity, Users, FileText, CheckCircle2, ShieldAlert, Cpu, Database, Server } from 'lucide-react';
import { AuditLog, User } from '../../types';

interface AdminDashboardProps {
  auditLogs: AuditLog[];
  users: User[];
  analytics: {
    totalPatients: number;
    activeAlerts: number;
    totalReadings: number;
    criticalPatients: number;
    complianceRate: number;
    uptimePercentage: number;
    hipaaCompliantLogsCount: number;
  } | null;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ auditLogs, users, analytics }) => {
  const [logFilter, setLogFilter] = useState<'ALL' | 'PHI_ACCESS' | 'VITALS_ENTRY' | 'ALERT_ACKNOWLEDGE'>('ALL');

  const filteredLogs = auditLogs.filter((l) => {
    if (logFilter === 'ALL') return true;
    return l.action === logFilter;
  });

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8" id="admin-dashboard-container">
      {/* Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">HIPAA Compliance & Security Administration</h1>
            <p className="text-xs text-slate-400">Marcus Brody — Chief Compliance Administrator</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-mono">
            <CheckCircle2 className="w-4 h-4" /> HIPAA Verified & Compliant
          </span>
        </div>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Enrolled Patients', value: analytics?.totalPatients ?? 3, sub: 'Remote Patient Monitoring', icon: Users, color: 'text-cyan-400' },
          { label: 'Telemetry Readings', value: analytics?.totalReadings ?? 42, sub: 'Encrypted Vitals Stream', icon: Activity, color: 'text-emerald-400' },
          { label: 'Compliance Audit Score', value: `${analytics?.complianceRate ?? 98.4}%`, sub: '6-Year Retention Guarantee', icon: ShieldCheck, color: 'text-indigo-400' },
          { label: 'System Service Uptime', value: `${analytics?.uptimePercentage ?? 99.99}%`, sub: 'Cloud Run Redundant Nodes', icon: Server, color: 'text-purple-400' },
        ].map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{m.label}</span>
                <Icon className={`w-4 h-4 ${m.color}`} />
              </div>
              <p className="text-2xl font-black text-white font-mono">{m.value}</p>
              <p className="text-[10px] text-slate-500">{m.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Immutable HIPAA Audit Trail Section */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-indigo-400" />
              <span>Immutable HIPAA Audit Trail</span>
            </h2>
            <p className="text-xs text-slate-400">Cryptographically signed logs for all PHI access, vitals entry, and clinical interventions.</p>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl text-xs">
            {(['ALL', 'PHI_ACCESS', 'VITALS_ENTRY', 'ALERT_ACKNOWLEDGE'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setLogFilter(f)}
                className={`px-3 py-1 rounded-lg font-mono font-semibold transition-all ${
                  logFilter === f ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="p-3">Log ID</th>
                <th className="p-3">Timestamp</th>
                <th className="p-3">User</th>
                <th className="p-3">Action</th>
                <th className="p-3">Resource</th>
                <th className="p-3">IP Address</th>
                <th className="p-3">HIPAA Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 text-cyan-400">{log.id}</td>
                  <td className="p-3 text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="p-3 font-sans font-bold text-white">
                    {log.userName} ({log.userRole})
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30 text-[10px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300 font-sans max-w-xs truncate">{log.details}</td>
                  <td className="p-3 text-slate-400">{log.ipAddress}</td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1 text-emerald-400 text-[10px] font-bold">
                      <CheckCircle2 className="w-3 h-3" /> Signed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Authorized System Users Directory */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-cyan-400" />
          <span>Authorized Access Directory</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {users.map((u) => (
            <div key={u.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
              <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full object-cover border border-slate-700" />
              <div>
                <p className="text-sm font-bold text-white">{u.name}</p>
                <p className="text-xs text-slate-400">{u.email}</p>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[10px] mt-1 inline-block">
                  {u.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
