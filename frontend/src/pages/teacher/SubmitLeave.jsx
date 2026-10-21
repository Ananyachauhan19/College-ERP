import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { leaveService } from '../../services/api';
import { Send, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';

const SubmitLeave = () => {
  const navigate = useNavigate();
  const [leaveType, setLeaveType] = useState('casual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Calculate days in real-time
  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) return 0;
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const totalDays = calculateDays();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason) return;

    if (new Date(endDate) < new Date(startDate)) {
      setError('End date cannot be earlier than start date.');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      const res = await leaveService.applyLeave({
        leaveType,
        startDate,
        endDate,
        reason,
      });

      if (res.success) {
        navigate('/teacher/leaves');
      }
    } catch (err) {
      setError(err.message || 'Failed to submit leave application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Faculty Leave Application</h1>
        <p className="text-sm text-slate-500 mt-1">
          Submit formal leave request for administrative review and approval
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
            Leave Category *
          </label>
          <select
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
            className="w-full px-3.5 py-2.5 border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          >
            <option value="casual">Casual Leave (Standard Allowance)</option>
            <option value="sick">Sick / Medical Leave</option>
            <option value="earned">Earned Academic Leave</option>
            <option value="unpaid">Unpaid Personal Leave</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Start Date *
            </label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2.5 border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              End Date *
            </label>
            <input
              type="date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3.5 py-2.5 border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
          </div>
        </div>

        {totalDays > 0 && (
          <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-between text-xs text-rose-800">
            <span>Requested Duration:</span>
            <span className="font-bold font-mono text-sm">{totalDays} Day(s)</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
            Reason for Absence *
          </label>
          <textarea
            rows={3}
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please detail the reason for your leave..."
            className="w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting || totalDays <= 0}
            className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? 'Submitting Leave...' : <><Send className="h-4 w-4" /> Submit Application</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubmitLeave;
