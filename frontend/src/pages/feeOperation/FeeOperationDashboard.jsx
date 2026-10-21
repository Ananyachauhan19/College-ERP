import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { reportService, feeService } from '../../services/api';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import { CreditCard, TrendingUp, AlertCircle, Receipt as ReceiptIcon, ArrowRight } from 'lucide-react';

const FeeOperationDashboard = () => {
  const [stats, setStats] = useState({});
  const [recentReceipts, setRecentReceipts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([reportService.getSummary(), feeService.getReceipts()]).then(
      ([repRes, recRes]) => {
        if (repRes.success) setStats(repRes.stats);
        if (recRes.success) setRecentReceipts(recRes.receipts.slice(0, 5));
        setLoading(false);
      }
    );
  }, []);

  return (
    <div className="space-y-8">
      {/* Header with Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Fee Operations Desk</h1>
          <p className="text-sm text-slate-500 mt-1">
            Cash counter collection, payment entry, receipt verification, scholarships, and fee structures
          </p>
        </div>

        <Link
          to="/fee-operation/collect"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
        >
          <CreditCard className="h-4 w-4" /> Record Counter Payment
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Total Offline Collections"
          value={`₹${(stats.totalOfflineCollections || 0).toLocaleString()}`}
          subtitle="Collected directly at college desk"
          icon={CreditCard}
          color="indigo"
        />
        <StatCard
          title="Total Online Collections"
          value={`₹${(stats.totalOnlineCollections || 0).toLocaleString()}`}
          subtitle="Synchronized via ERP gateway"
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Outstanding Balance"
          value={`₹${(stats.totalOutstandingFees || 0).toLocaleString()}`}
          subtitle={`${stats.overduePeriodsCount || 0} overdue accounts`}
          icon={AlertCircle}
          color="rose"
        />
      </div>

      {/* Recent Counter Collections Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Latest Issued Receipts</h2>
            <p className="text-xs text-slate-500">Live authoritative ledger entries</p>
          </div>
          <Link
            to="/fee-operation/transactions"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            All Receipts <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold uppercase text-slate-500">
                <th className="py-3 px-4">Receipt No</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Period</th>
                <th className="py-3 px-4">Mode</th>
                <th className="py-3 px-4 text-right">Amount Paid</th>
                <th className="py-3 px-4 text-center">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    Loading receipts...
                  </td>
                </tr>
              ) : recentReceipts.map((r) => (
                <tr key={r._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 text-xs">
                    {r.receiptNo}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    {r.studentId?.name}
                    <span className="block text-xs text-slate-400 font-mono">
                      {r.studentId?.admissionNo}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-700">{r.periodName}</td>
                  <td className="py-3.5 px-4">
                    <Badge status={r.paymentMode} text={r.paymentMode} />
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600">
                    ₹{r.amountPaid.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-center text-xs text-slate-500 font-mono">
                    {new Date(r.issuedDate).toLocaleDateString()}
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

export default FeeOperationDashboard;
