import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { leaveService } from '../../services/api';
import Badge from '../../components/common/Badge';
import { History, Send, MessageSquare } from 'lucide-react';

const LeaveHistory = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    leaveService.getMyLeaves().then((res) => {
      if (res.success) setLeaves(res.leaves);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Leave Applications History</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track status of submitted leave requests and view administrative decision remarks
          </p>
        </div>

        <Link
          to="/teacher/apply-leave"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
        >
          <Send className="h-4 w-4" /> Apply for Leave
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold uppercase text-slate-500">
                <th className="py-3 px-4">Leave Type</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Administrator Remarks</th>
                <th className="py-3 px-4 text-center">Submitted On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    Loading leave history...
                  </td>
                </tr>
              ) : leaves.length ? (
                leaves.map((l) => (
                  <tr key={l._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold capitalize text-slate-900 text-xs">
                      {l.leaveType} Leave
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 font-mono">
                      <p>
                        {new Date(l.startDate).toLocaleDateString()} to{' '}
                        {new Date(l.endDate).toLocaleDateString()}
                      </p>
                      <span className="font-bold text-slate-800">({l.totalDays} Day(s))</span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 max-w-xs">{l.reason}</td>
                    <td className="py-3.5 px-4">
                      <Badge status={l.status} />
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-700">
                      {l.decisionRemarks ? (
                        <div className="flex items-start gap-1.5 text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-100 italic">
                          <MessageSquare className="h-3.5 w-3.5 flex-shrink-0 text-slate-400 mt-0.5" />
                          <span>"{l.decisionRemarks}"</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Pending review</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center text-xs text-slate-400 font-mono">
                      {new Date(l.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    No leave applications recorded.
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

export default LeaveHistory;
