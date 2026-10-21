import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentService } from '../../services/api';
import Badge from '../../components/common/Badge';
import { CalendarCheck, CreditCard, CheckCircle2 } from 'lucide-react';

const MyFeeSchedule = () => {
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paymentService.getMyHistory().then((res) => {
      if (res.success) setSchedule(res.schedule);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  const periods = schedule?.periods || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Academic Fee Schedule</h1>
          <p className="text-sm text-slate-500 mt-1">
            Period-by-period breakdown of institutional fees, concessions, paid amounts, and due dates
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Frequency Plan:</span>
            <span className="font-bold text-slate-900 uppercase font-mono">
              {schedule?.paymentFrequency}
            </span>
          </div>
          <div className="border-l pl-4">
            <span className="text-slate-400 block font-medium">Net Program Fee:</span>
            <span className="font-bold text-indigo-700 font-mono">
              ₹{(schedule?.netPayable || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Schedule Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold uppercase text-slate-500">
                <th className="py-3 px-4">Period</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-right">Base Amount</th>
                <th className="py-3 px-4 text-right">Concession</th>
                <th className="py-3 px-4 text-right">Amount Paid</th>
                <th className="py-3 px-4 text-right">Outstanding Balance</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {periods.map((p) => (
                <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{p.periodName}</td>
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                    {new Date(p.dueDate).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                    ₹{p.baseAmount.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-emerald-600">
                    {p.scholarshipDeduction > 0 ? `- ₹${p.scholarshipDeduction.toLocaleString()}` : '—'}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-semibold text-emerald-700">
                    ₹{p.amountPaid.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                    ₹{p.balance.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <Badge status={p.status} />
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {p.balance > 0 ? (
                      <button
                        onClick={() => navigate('/student/pay', { state: { periodNumber: p.periodNumber } })}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 mx-auto"
                      >
                        <CreditCard className="h-3 w-3" /> Pay Now
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-600 font-semibold flex items-center justify-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Paid
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MyFeeSchedule;
