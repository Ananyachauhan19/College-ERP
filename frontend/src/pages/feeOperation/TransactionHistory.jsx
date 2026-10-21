import React, { useEffect, useState } from 'react';
import { feeService } from '../../services/api';
import Badge from '../../components/common/Badge';
import ReceiptModal from '../../components/common/ReceiptModal';
import { Receipt, Search, Eye } from 'lucide-react';

const TransactionHistory = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const res = await feeService.getReceipts({ search });
      if (res.success) setReceipts(res.receipts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchReceipts();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Fee Transaction Receipts</h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse and reprint all issued receipts from online gateway and counter collections
          </p>
        </div>

        <form onSubmit={handleSearch} className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search receipt number..."
            className="w-full pl-10 pr-3 py-2 border rounded-xl text-sm"
          />
        </form>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold uppercase text-slate-500">
                <th className="py-3 px-4">Receipt No</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Period</th>
                <th className="py-3 px-4">Payment Mode</th>
                <th className="py-3 px-4 text-right">Amount Received</th>
                <th className="py-3 px-4 text-center">Date Issued</th>
                <th className="py-3 px-4 text-center">Action</th>
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
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" /> View Receipt
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No receipts recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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

export default TransactionHistory;
