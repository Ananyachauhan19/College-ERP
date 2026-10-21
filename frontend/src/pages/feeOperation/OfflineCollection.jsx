import React, { useEffect, useState } from 'react';
import { admissionService, feeService } from '../../services/api';
import Badge from '../../components/common/Badge';
import ReceiptModal from '../../components/common/ReceiptModal';
import {
  Search,
  CreditCard,
  CheckCircle2,
  Receipt,
  User,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

const OfflineCollection = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [selectedPeriodNumber, setSelectedPeriodNumber] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('cash');
  const [referenceNo, setReferenceNo] = useState('');
  const [remarks, setRemarks] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [generatedReceipt, setGeneratedReceipt] = useState(null);
  const [msg, setMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    admissionService.getAdmissions().then((res) => {
      if (res.success) setStudents(res.students);
    });
  }, []);

  const handleSelectStudent = async (student) => {
    setSelectedStudent(student);
    setMsg({ text: '', type: '' });
    setLoading(true);
    try {
      const res = await feeService.getStudentSchedule(student._id);
      if (res.success) {
        setSchedule(res.schedule);
        // Find first unpaid or partially paid period
        const firstUnpaid = res.schedule.periods.find((p) => p.balance > 0);
        if (firstUnpaid) {
          setSelectedPeriodNumber(firstUnpaid.periodNumber);
          setPaymentAmount(firstUnpaid.balance);
        } else {
          setSelectedPeriodNumber('');
          setPaymentAmount('');
        }
      }
    } catch (err) {
      setMsg({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (pNum) => {
    setSelectedPeriodNumber(pNum);
    const period = schedule?.periods?.find((p) => p.periodNumber === Number(pNum));
    if (period) {
      setPaymentAmount(period.balance);
    }
  };

  // Convenient "Mark as Paid" handler: Sets payment amount to the exact remaining balance of the period
  const handleMarkAsPaidClick = (period) => {
    setSelectedPeriodNumber(period.periodNumber);
    setPaymentAmount(period.balance);
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !selectedPeriodNumber || !paymentAmount) return;

    setErrorMsg('');
    setSubmitting(true);
    try {
      const period = schedule?.periods?.find((p) => p.periodNumber === Number(selectedPeriodNumber));
      const isFull = Number(paymentAmount) >= (period?.balance || 0);

      const res = await feeService.collectOffline({
        studentId: selectedStudent._id,
        periodNumber: Number(selectedPeriodNumber),
        amount: Number(paymentAmount),
        paymentMode,
        referenceNo: referenceNo || `CASH-${Date.now()}`,
        remarks: remarks || `Counter payment received for ${period?.periodName}`,
        isMarkAsPaid: isFull,
      });

      if (res.success) {
        setGeneratedReceipt(res.receipt);
        setSchedule(res.schedule);
        setMsg({ text: res.message, type: 'success' });
        // Refresh schedule
        const updated = await feeService.getStudentSchedule(selectedStudent._id);
        if (updated.success) setSchedule(updated.schedule);
      }
    } catch (err) {
      setMsg({ text: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const setErrorMsg = (text) => setMsg({ text, type: 'error' });

  const activePeriod = schedule?.periods?.find(
    (p) => p.periodNumber === Number(selectedPeriodNumber)
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Counter Fee Collection</h1>
        <p className="text-sm text-slate-500 mt-1">
          Record offline payments made directly at the college counter, process partial or full settlement, and issue instant receipts
        </p>
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

      {/* Step 1: Search & Select Student */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
          <Search className="h-4 w-4 text-indigo-600" />
          1. Lookup Student Fee Account
        </h2>

        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type student name or admission number to search..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Search Results Pill List */}
        <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pt-1">
          {students
            .filter(
              (s) =>
                s.name.toLowerCase().includes(search.toLowerCase()) ||
                s.admissionNo.toLowerCase().includes(search.toLowerCase())
            )
            .slice(0, 8)
            .map((s) => (
              <button
                key={s._id}
                type="button"
                onClick={() => handleSelectStudent(s)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium border text-left flex items-center gap-2 transition-all ${
                  selectedStudent?._id === s._id
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <User className="h-3.5 w-3.5 opacity-70" />
                <span>{s.name}</span>
                <span className="opacity-75 font-mono font-bold">({s.admissionNo})</span>
              </button>
            ))}
        </div>
      </div>

      {/* Step 2: Student Account Overview & Fee Schedule Periods */}
      {selectedStudent && schedule && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Schedule Table & Period Selection */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <span className="text-xs uppercase font-bold text-indigo-600 font-mono">
                  {selectedStudent.admissionNo}
                </span>
                <h3 className="text-lg font-bold text-slate-900">{selectedStudent.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedStudent.courseId?.name} • Plan: {schedule.paymentFrequency}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block font-medium">Total Remaining Due</span>
                <span
                  className={`text-xl font-black font-mono ${
                    schedule.balanceDue === 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  ₹{(schedule.balanceDue || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Periods Table */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Select Academic Period to Record Payment
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b">
                    <tr>
                      <th className="py-2.5 px-3">Period</th>
                      <th className="py-2.5 px-3 text-right">Net Due</th>
                      <th className="py-2.5 px-3 text-right">Paid</th>
                      <th className="py-2.5 px-3 text-right">Balance</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {schedule.periods.map((p) => {
                      const isSelected = Number(selectedPeriodNumber) === p.periodNumber;
                      return (
                        <tr
                          key={p._id}
                          className={`transition-colors ${
                            isSelected ? 'bg-indigo-50/70 font-semibold' : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="py-2.5 px-3 font-sans text-slate-900">{p.periodName}</td>
                          <td className="py-2.5 px-3 text-right text-slate-700">
                            ₹{p.netDue.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-right text-emerald-600">
                            ₹{p.amountPaid.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                            ₹{p.balance.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-center font-sans">
                            <Badge status={p.status} />
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            {p.balance > 0 ? (
                              <button
                                type="button"
                                onClick={() => handleMarkAsPaidClick(p)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ml-auto ${
                                  isSelected
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                }`}
                              >
                                <Zap className="h-3 w-3" /> Mark as Paid
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-400 font-sans italic">Settled</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right: Payment Entry Form */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="border-b pb-3">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-indigo-600" />
                Record Counter Transaction
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Target Period: <strong>{activePeriod?.periodName || 'None selected'}</strong>
              </p>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Selected Period
                </label>
                <select
                  value={selectedPeriodNumber}
                  onChange={(e) => handlePeriodChange(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm bg-white"
                >
                  <option value="">Select Fee Period</option>
                  {schedule.periods.map((p) => (
                    <option key={p.periodNumber} value={p.periodNumber}>
                      {p.periodName} (Balance: ₹{p.balance.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold uppercase text-slate-600">
                    Amount Received (₹) *
                  </label>
                  {activePeriod && activePeriod.balance > 0 && (
                    <button
                      type="button"
                      onClick={() => setPaymentAmount(activePeriod.balance)}
                      className="text-xs text-indigo-600 hover:underline font-semibold"
                    >
                      Fill Exact Balance (₹{activePeriod.balance.toLocaleString()})
                    </button>
                  )}
                </div>
                <input
                  type="number"
                  required
                  min={1}
                  max={activePeriod?.balance || 999999}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 border rounded-xl text-base font-mono font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                    Payment Mode *
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-sm bg-white"
                  >
                    <option value="cash">Cash Counter</option>
                    <option value="cheque">Cheque</option>
                    <option value="bank_transfer">Bank Transfer (NEFT/RTGS)</option>
                    <option value="online">POS / Card Terminal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                    Reference / Cheque No
                  </label>
                  <input
                    type="text"
                    value={referenceNo}
                    onChange={(e) => setReferenceNo(e.target.value)}
                    placeholder="e.g. CHQ-928172"
                    className="w-full px-3 py-2 border rounded-xl text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Remarks / Notes
                </label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Paid at admin building fee counter"
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>

              <div className="pt-3 border-t">
                <button
                  type="submit"
                  disabled={submitting || !selectedPeriodNumber || !paymentAmount}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    'Recording & Generating Receipt...'
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" /> Save Payment & Issue Receipt
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Receipt Modal */}
      {generatedReceipt && (
        <ReceiptModal
          isOpen={!!generatedReceipt}
          onClose={() => setGeneratedReceipt(null)}
          receipt={generatedReceipt}
        />
      )}
    </div>
  );
};

export default OfflineCollection;
