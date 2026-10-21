import React, { useEffect, useState } from 'react';
import { auditService } from '../../services/api';
import Badge from '../../components/common/Badge';
import { ShieldCheck, Filter, Search } from 'lucide-react';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [moduleFilter, setModuleFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, [moduleFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await auditService.getAuditLogs({ module: moduleFilter });
      if (res.success) setLogs(res.logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">System Audit Logs</h1>
          <p className="text-sm text-slate-500 mt-1">
            Tamper-evident chronological audit trail of all financial, administrative, and permission events
          </p>
        </div>

        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className="px-4 py-2 border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="">All Functional Modules</option>
          <option value="ADMISSION">Admissions</option>
          <option value="FEE">Fee Collection</option>
          <option value="LEAVE">Leaves</option>
          <option value="PAYROLL">Payroll</option>
          <option value="USER">User Security</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold uppercase text-slate-500">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Initiator</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400">
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length ? (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800 text-xs">
                        {log.userId?.name || 'Authorized Admin'}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono">{log.userRole}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs font-bold text-indigo-700">
                      {log.action}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono bg-slate-100 text-slate-600 border border-slate-200">
                        {log.module}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-slate-600 max-w-md truncate">
                      {JSON.stringify(log.details || {})}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400">
                    No audit records logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
