import React, { useEffect, useState } from 'react';
import { paymentService } from '../../services/api';
import Badge from '../../components/common/Badge';
import ReceiptModal from '../../components/common/ReceiptModal';
import { Receipt, Eye, Printer } from 'lucide-react';

const PaymentReceipts = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    paymentService.getMyHistory().then((res) => {
      if (res.success) setReceipts(res.receipts || []);
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Payment Receipts & History</h1>
        <p className="text-sm text-slate-500 mt-1">
          Complete ledger of confirmed payments, counter transactions, and official downloadable receipts
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold uppercase text-slate-500">
                <th className="py-3 px-4">Receipt No</th>
                <th className="py-3 px-4">Period</th>
                <th className="py-3 px-4">Payment Mode</th>
                <th className="py-3 px-4 text-right">Amount Received</th>
                <th className="py-3 px-4 text-center">Date Issued</th>
                <th className="py-3 px-4 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {receipts.length ? (
                receipts.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 text-xs">
                      {r.receiptNo}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-800">{r.periodName}</td>
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
                        <Eye className="h-3.5 w-3.5" /> View / Print
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    No confirmed receipts yet.
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

export default PaymentReceipts;
