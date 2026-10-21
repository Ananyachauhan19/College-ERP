import React, { useEffect, useState } from 'react';
import { leaveService } from '../../services/api';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { CalendarCheck, Check, X, Eye, AlertCircle } from 'lucide-react';

const LeaveApprovals = () => {
  const [leaves, setLeaves] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchLeaves();
  }, [statusFilter]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await leaveService.getAllLeaves({ status: statusFilter });
      if (res.success) setLeaves(res.leaves);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (status) => {
    if (!selectedLeave) return;
    try {
      setSubmitting(true);
      const res = await leaveService.decideLeave(selectedLeave._id, {
        status,
        decisionRemarks: remarks,
      });
      if (res.success) {
        setMsg({ text: res.message, type: 'success' });
        setSelectedLeave(null);
        setRemarks('');
        fetchLeaves();
      }
    } catch (err) {
      setMsg({ text: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Faculty Leave Approvals</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review submitted teacher leave applications, add decision remarks, and notify faculty
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="">All Leave Statuses</option>
          <option value="pending">Pending Approval</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {msg.text && (
        <div
          className={`p-4 rounded-xl text-sm border ${
            msg.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-700'
              : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* Leaves Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold uppercase text-slate-500">
                <th className="py-3 px-4">Faculty Member</th>
                <th className="py-3 px-4">Leave Type</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    Loading leave requests...
                  </td>
                </tr>
              ) : leaves.length ? (
                leaves.map((l) => (
                  <tr key={l._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900">{l.teacherId?.name || 'Faculty'}</p>
                      <p className="text-xs text-slate-400 font-mono">
                        {l.teacherId?.employeeId} • {l.teacherId?.departmentId?.code}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="capitalize font-medium text-xs text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                        {l.leaveType} Leave
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 font-mono">
                      <p>
                        {new Date(l.startDate).toLocaleDateString()} -{' '}
                        {new Date(l.endDate).toLocaleDateString()}
                      </p>
                      <span className="font-bold text-slate-800">({l.totalDays} Day(s))</span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 max-w-xs truncate">
                      {l.reason}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={l.status} />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => {
                          setSelectedLeave(l);
                          setRemarks(l.decisionRemarks || '');
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" /> Review
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    No leave requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Decision Review Modal */}
      {selectedLeave && (
        <Modal
          isOpen={!!selectedLeave}
          onClose={() => setSelectedLeave(null)}
          title="Review Leave Application"
          maxWidth="max-w-lg"
        >
          <div className="space-y-5">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-xs text-slate-500 font-semibold uppercase">Faculty:</span>
                <span className="font-bold text-slate-900">{selectedLeave.teacherId?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-500 font-semibold uppercase">Employee ID:</span>
                <span className="font-mono text-slate-700">{selectedLeave.teacherId?.employeeId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-500 font-semibold uppercase">Leave Type:</span>
                <span className="capitalize font-semibold text-indigo-700">{selectedLeave.leaveType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-500 font-semibold uppercase">Dates:</span>
                <span className="font-mono text-slate-800">
                  {new Date(selectedLeave.startDate).toLocaleDateString()} to{' '}
                  {new Date(selectedLeave.endDate).toLocaleDateString()} ({selectedLeave.totalDays} Day(s))
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <span className="text-xs text-slate-500 font-semibold uppercase block mb-1">
                  Reason for Leave:
                </span>
                <p className="text-slate-800 italic bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
                  "{selectedLeave.reason}"
                </p>
              </div>
            </div>

            {selectedLeave.status === 'pending' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                    Decision Remarks / Feedback (Sent to Teacher via Email)
                  </label>
                  <textarea
                    rows={3}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Enter approval conditions or rejection reason..."
                    className="w-full p-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleDecision('rejected')}
                    className="px-4 py-2 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <X className="h-4 w-4" /> Reject Leave
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleDecision('approved')}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
                  >
                    <Check className="h-4 w-4" /> Approve Leave
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 p-4 rounded-xl border text-xs text-slate-600">
                <p>
                  <strong>Current Status:</strong> <Badge status={selectedLeave.status} />
                </p>
                <p className="mt-1">
                  <strong>Admin Remarks:</strong> {selectedLeave.decisionRemarks || 'None'}
                </p>
                <p className="mt-1">
                  <strong>Decided On:</strong> {new Date(selectedLeave.decidedAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default LeaveApprovals;
