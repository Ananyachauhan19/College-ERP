import React, { useRef } from 'react';
import Modal from './Modal';
import { Printer, CheckCircle2, ShieldCheck, Download } from 'lucide-react';

const ReceiptModal = ({ isOpen, onClose, receipt }) => {
  const receiptRef = useRef();

  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const student = receipt.studentId || {};
  const course = student.courseId || {};
  const department = student.departmentId || {};

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Official Fee Payment Receipt" maxWidth="max-w-3xl">
      <div className="flex flex-col gap-6">
        {/* Printable Area */}
        <div
          ref={receiptRef}
          id="printable-receipt"
          className="border border-slate-200 rounded-xl p-8 bg-white relative overflow-hidden shadow-inner print:border-none print:shadow-none print:p-0"
        >
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none font-bold text-9xl tracking-widest text-slate-900 rotate-[-25deg]">
            EDUCORE
          </div>

          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-800 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                  E
                </div>
                <h2 className="text-2xl font-black tracking-tight text-slate-900 font-serif">
                  EDUCORE INSTITUTE OF TECHNOLOGY
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Approved by AICTE & UGC • Sector 5, Knowledge Corridor • info@educore.edu
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold uppercase rounded-md tracking-wider">
                Official Receipt
              </span>
              <p className="text-sm font-mono font-bold text-slate-800 mt-2">
                {receipt.receiptNo}
              </p>
              <p className="text-xs text-slate-500 font-mono">Invoice: {receipt.invoiceNo}</p>
            </div>
          </div>

          {/* Date & Mode Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 bg-slate-50/80 rounded-lg my-6 px-4 border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Receipt Date</span>
              <span className="font-semibold text-slate-800">
                {new Date(receipt.issuedDate || receipt.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Payment Mode</span>
              <span className="font-semibold uppercase text-slate-800 font-mono">
                {receipt.paymentMode}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Transaction Ref</span>
              <span className="font-mono text-slate-700 truncate block">
                {receipt.referenceNo || 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Status</span>
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Verified
              </span>
            </div>
          </div>

          {/* Student Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 text-sm">
            <div className="space-y-1">
              <p className="text-xs text-slate-400 uppercase font-semibold">Student Information</p>
              <p className="font-bold text-slate-900 text-base">{student.name || 'Student'}</p>
              <p className="text-xs text-slate-600 font-mono">
                Admission No: <strong className="text-slate-800">{student.admissionNo}</strong>
              </p>
              <p className="text-xs text-slate-500">{student.email}</p>
            </div>
            <div className="space-y-1 sm:text-right">
              <p className="text-xs text-slate-400 uppercase font-semibold">Academic Program</p>
              <p className="font-bold text-slate-900">{course.name || 'Academic Course'}</p>
              <p className="text-xs text-slate-600">
                Department: {department.name || department.code || 'Engineering'}
              </p>
              <p className="text-xs text-slate-500">
                Fee Period: <strong>{receipt.periodName}</strong>
              </p>
            </div>
          </div>

          {/* Ledger Table */}
          <table className="w-full text-left text-sm border-t border-b border-slate-200 my-4">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold">
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3 text-right">Previous Balance</th>
                <th className="py-2.5 px-3 text-right">Amount Received</th>
                <th className="py-2.5 px-3 text-right">Remaining Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 px-3">
                  <p className="font-medium text-slate-900">
                    Tuition & Fee Payment - {receipt.periodName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {receipt.remarks || 'Confirmed payment towards tuition and institutional dues'}
                  </p>
                </td>
                <td className="py-3 px-3 text-right font-mono text-slate-600">
                  ₹{(receipt.previousBalance || 0).toLocaleString()}
                </td>
                <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600 text-base">
                  ₹{(receipt.amountPaid || 0).toLocaleString()}
                </td>
                <td className="py-3 px-3 text-right font-mono text-slate-700">
                  ₹{(receipt.remainingBalance || 0).toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Total Highlight */}
          <div className="flex justify-between items-center py-4 bg-emerald-50/60 rounded-xl px-5 border border-emerald-100">
            <div>
              <span className="text-xs text-emerald-800 font-semibold uppercase tracking-wider block">
                Total Paid In Words
              </span>
              <span className="text-xs text-slate-600 italic">
                Rupees {(receipt.amountPaid || 0).toLocaleString()} Only
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block font-medium">Net Received</span>
              <span className="text-2xl font-black text-slate-900 font-mono">
                ₹{(receipt.amountPaid || 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Footer Signature */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-end justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <ShieldCheck className="h-4 w-4" />
              <span>Computer generated receipt. Validated by Financial Ledger.</span>
            </div>
            <div className="text-center">
              <div className="w-36 border-b border-slate-400 pb-1 mb-1 font-serif text-slate-700 font-bold italic">
                EduCore Finance
              </div>
              <span>Authorized Signatory</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm shadow-indigo-500/20"
          >
            <Printer className="h-4 w-4" /> Print / Save as PDF
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ReceiptModal;
