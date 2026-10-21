import React, { useEffect, useState } from 'react';
import { feeService, reportService } from '../../services/api';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import ReceiptModal from '../../components/common/ReceiptModal';
import { CreditCard, TrendingUp, AlertTriangle, Receipt as ReceiptIcon, Eye, Search } from 'lucide-react';

const FeeManagementOverview = () => {
  const [stats, setStats] = useState({});
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reportRes, receiptRes] = await Promise.all([
        reportService.getSummary(),
        feeService.getReceipts({ search }),
      ]);
      if (reportRes.success) setStats(reportRes.stats);
      if (receiptRes.success) setReceipts(receiptRes.receipts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    feeService.getReceipts({ search }).then((res) => {
      if (res.success) setReceipts(res.receipts);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Institutional Fee Overview</h1>
        <p className="text-sm text-slate-500 mt-1">
          Monitor unified fee collection ledger, offline counter entries, online collections, and receipts
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Total Expected Net Fees"
          value={`₹${(stats.totalExpectedFees || 0).toLocaleString()}`}
          subtitle="All academic sessions"
          icon={CreditCard}
          color="indigo"
        />
        <StatCard
          title="Total Collections"
          value={`₹${(stats.totalCollectedFees || 0).toLocaleString()}`}
          subtitle={`₹${(stats.totalOnlineCollections || 0).toLocaleString()} Online • ₹${(stats.totalOfflineCollections || 0).toLocaleString()} Offline`}
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Total Outstanding"
          value={`₹${(stats.totalOutstandingFees || 0).toLocaleString()}`}
          subtitle={`${stats.overduePeriodsCount || 0} overdue periods`}
          icon={AlertTriangle}
          color="rose"
        />
      </div>

      {/* All Confirmed Receipts Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Confirmed Payment Receipts</h2>
            <p className="text-xs text-slate-500">Authoritative audit ledger of all completed payments</p>
          </div>
          <form onSubmit={handleSearch} className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by receipt number..."
              className="w-full pl-9 pr-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </form>
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
                <th className="py-3 px-4 text-center">Issued Date</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    Loading receipts...
                  </td>
                </tr>
              ) : receipts.length ? (
                receipts.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 text-xs">
                      {r.receiptNo}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900">{r.studentId?.name || 'Student'}</p>
                      <p className="text-xs text-slate-400 font-mono">{r.studentId?.admissionNo}</p>
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
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setSelectedReceipt(r)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" /> View Receipt
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No receipts found.
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

export default FeeManagementOverview;
