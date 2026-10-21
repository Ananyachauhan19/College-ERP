import React, { useEffect, useState } from 'react';
import { reportService } from '../../services/api';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import ReceiptModal from '../../components/common/ReceiptModal';
import {
  Users,
  CreditCard,
  TrendingUp,
  AlertCircle,
  CalendarCheck,
  Banknote,
  Receipt as ReceiptIcon,
  Eye,
} from 'lucide-react';

const SuperAdminOverview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await reportService.getSummary();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch overview metrics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  const stats = data?.stats || {};

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Institution Executive Overview</h1>
        <p className="text-sm text-slate-500 mt-1">
          High-level institutional KPIs, collections ledger, department quotas, and administrative activity
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Enrolled Students"
          value={stats.totalStudents || 0}
          subtitle={`${stats.activeStudents || 0} active admissions`}
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Total Collected Fees"
          value={`₹${(stats.totalCollectedFees || 0).toLocaleString()}`}
          subtitle={`₹${(stats.totalOnlineCollections || 0).toLocaleString()} Online • ₹${(stats.totalOfflineCollections || 0).toLocaleString()} Counter`}
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Outstanding Balance"
          value={`₹${(stats.totalOutstandingFees || 0).toLocaleString()}`}
          subtitle={`${stats.overduePeriodsCount || 0} overdue fee period(s)`}
          icon={AlertCircle}
          color="rose"
        />
        <StatCard
          title="Pending Leave Requests"
          value={stats.pendingLeaves || 0}
          subtitle="Faculty leave approvals required"
          icon={CalendarCheck}
          color="purple"
        />
      </div>

      {/* Secondary Metrics & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Breakdown */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-4">Department-wise Enrollment</h2>
          <div className="space-y-3">
            {data?.departmentBreakdown?.map((dept) => (
              <div key={dept.code} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-none">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{dept.name}</p>
                  <p className="text-xs text-slate-400 font-mono">{dept.code}</p>
                </div>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg">
                  {dept.count} Students
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Collection Breakdown */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-4">Fee Collection Overview</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-600">Total Expected Course Fees</span>
                <span className="text-slate-900 font-mono">₹{(stats.totalExpectedFees || 0).toLocaleString()}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{
                    width: stats.totalExpectedFees
                      ? `${Math.min(100, Math.round((stats.totalCollectedFees / stats.totalExpectedFees) * 100))}%`
                      : '0%',
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                <p className="text-xs text-emerald-800 font-medium">Online ERP</p>
                <p className="text-lg font-bold text-emerald-950 font-mono mt-0.5">
                  ₹{(stats.totalOnlineCollections || 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                <p className="text-xs text-blue-800 font-medium">Offline Counter</p>
                <p className="text-lg font-bold text-blue-950 font-mono mt-0.5">
                  ₹{(stats.totalOfflineCollections || 0).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="pt-2 text-xs text-slate-500 flex justify-between border-t border-slate-100">
              <span>Approved Scholarships Granted:</span>
              <span className="font-bold text-slate-700 font-mono">
                ₹{(stats.totalScholarships || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Student Fee Status Summary */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-4">Student Payment Accounts</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <span className="text-xs font-medium text-slate-600">Fully Paid Students</span>
              <span className="text-sm font-bold text-emerald-600">{stats.fullyPaidStudents || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <span className="text-xs font-medium text-slate-600">Partially Paid Students</span>
              <span className="text-sm font-bold text-amber-600">{stats.partiallyPaidStudents || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <span className="text-xs font-medium text-slate-600">Unpaid Accounts</span>
              <span className="text-sm font-bold text-rose-600">{stats.unpaidStudents || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <span className="text-xs font-medium text-slate-600">Finalized Payrolls</span>
              <span className="text-sm font-bold text-indigo-600">{stats.finalizedPayrolls || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Collections Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Fee Transactions</h2>
            <p className="text-xs text-slate-500">Live authoritative ledger entries</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold uppercase text-slate-500">
                <th className="py-3 px-4">Transaction Ref</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Period</th>
                <th className="py-3 px-4">Mode</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.recentTransactions?.length ? (
                data.recentTransactions.map((txn) => (
                  <tr key={txn._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-indigo-600 text-xs">
                      {txn.transactionNo}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">{txn.studentId?.name || 'Student'}</p>
                      <p className="text-xs text-slate-400 font-mono">{txn.studentId?.admissionNo}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-xs">{txn.periodName}</td>
                    <td className="py-3 px-4">
                      <Badge status={txn.paymentMode} text={txn.paymentMode} />
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      ₹{txn.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center text-xs text-slate-500">
                      {new Date(txn.paymentDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400 text-sm">
                    No transactions recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Modal */}
      {selectedReceipt && (
        <ReceiptModal
          isOpen={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          receipt={selectedReceipt}
        />
      )}
    </div>
  );
};

export default SuperAdminOverview;
