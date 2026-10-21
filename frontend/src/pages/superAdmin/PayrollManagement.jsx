import React, { useEffect, useState } from 'react';
import { payrollService, userService } from '../../services/api';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { Banknote, Calculator, CheckCircle2, Eye, Printer, AlertTriangle } from 'lucide-react';

const PayrollManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [payrollMonth, setPayrollMonth] = useState('2026-10');
  const [preview, setPreview] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [msg, setMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [usersRes, payrollRes] = await Promise.all([
        userService.getUsers({ role: 'TEACHER' }),
        payrollService.getAllPayrolls(),
      ]);
      if (usersRes.success) {
        setTeachers(usersRes.users);
        if (usersRes.users.length > 0) {
          // If profileId exists, select it
          const firstTeacher = usersRes.users[0];
          setSelectedTeacherId(firstTeacher.profile?._id || firstTeacher.profileId || '');
        }
      }
      if (payrollRes.success) setPayrolls(payrollRes.payrolls);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewCalculation = async () => {
    if (!selectedTeacherId || !payrollMonth) return;
    try {
      setCalculating(true);
      setMsg({ text: '', type: '' });
      const res = await payrollService.previewCalculation({
        teacherId: selectedTeacherId,
        payrollMonth,
      });
      if (res.success) {
        setPreview(res);
      }
    } catch (err) {
      setMsg({ text: err.message, type: 'error' });
    } finally {
      setCalculating(false);
    }
  };

  const handleGeneratePayroll = async () => {
    if (!selectedTeacherId || !payrollMonth) return;
    try {
      const res = await payrollService.generatePayroll({
        teacherId: selectedTeacherId,
        payrollMonth,
      });
      if (res.success) {
        setMsg({ text: res.message, type: 'success' });
        setPreview(null);
        const updated = await payrollService.getAllPayrolls();
        if (updated.success) setPayrolls(updated.payrolls);
      }
    } catch (err) {
      setMsg({ text: err.message, type: 'error' });
    }
  };

  const handleMarkPaid = async (payrollId) => {
    try {
      const res = await payrollService.markPaid(payrollId);
      if (res.success) {
        setMsg({ text: res.message, type: 'success' });
        const updated = await payrollService.getAllPayrolls();
        if (updated.success) setPayrolls(updated.payrolls);
      }
    } catch (err) {
      setMsg({ text: err.message, type: 'error' });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Faculty Payroll Management</h1>
        <p className="text-sm text-slate-500 mt-1">
          Automated leave-deduction payroll calculation, payslip generation, and disbursement tracking
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

      {/* Calculator & Payroll Generator Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calculator className="h-5 w-5 text-indigo-600" />
            Calculate & Generate Monthly Payslip
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select teacher and salary month to inspect leave records and verify deductions before finalization
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Select Faculty</label>
            <select
              value={selectedTeacherId}
              onChange={(e) => {
                setSelectedTeacherId(e.target.value);
                setPreview(null);
              }}
              className="w-full px-3 py-2 border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">Choose Teacher</option>
              {teachers.map((t) => {
                const profileId = t.profile?._id || t.profileId;
                return (
                  <option key={t._id} value={profileId}>
                    {t.name} ({t.email})
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Payroll Month</label>
            <input
              type="month"
              value={payrollMonth}
              onChange={(e) => {
                setPayrollMonth(e.target.value);
                setPreview(null);
              }}
              className="w-full px-3 py-2 border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handlePreviewCalculation}
              disabled={calculating || !selectedTeacherId}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {calculating ? 'Analyzing...' : 'Calculate Deductions & Preview'}
            </button>
          </div>
        </div>

        {/* Calculation Preview Result Box */}
        {preview && (
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-6 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
              <div>
                <p className="font-bold text-slate-900">{preview.teacher?.name}</p>
                <p className="text-xs text-slate-500 font-mono">
                  Employee ID: {preview.teacher?.employeeId} • Month: {preview.calculation.payrollMonth}
                </p>
              </div>
              <span className="text-xs uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-white border border-indigo-200 text-indigo-700 font-mono">
                {preview.calculation.calculationType} Salary Basis
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-white rounded-lg border border-slate-200/80">
                <span className="text-slate-400 block font-medium">Base Salary</span>
                <span className="text-base font-bold text-slate-900 font-mono">
                  ₹{preview.calculation.baseSalary.toLocaleString()}
                </span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200/80">
                <span className="text-slate-400 block font-medium">Allowances (HRA etc.)</span>
                <span className="text-base font-bold text-emerald-600 font-mono">
                  + ₹{preview.calculation.allowances.toLocaleString()}
                </span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200/80">
                <span className="text-slate-400 block font-medium">Unpaid Leave Deduction</span>
                <span className="text-base font-bold text-rose-600 font-mono">
                  - ₹{preview.calculation.leaveDeduction.toLocaleString()}
                </span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200/80">
                <span className="text-slate-400 block font-medium">Net Payable Salary</span>
                <span className="text-lg font-black text-indigo-700 font-mono">
                  ₹{preview.calculation.netPayable.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="text-xs bg-white p-3 rounded-lg border border-slate-200/80">
              <span className="font-semibold text-slate-700 block mb-0.5">Deduction Rule Audit Explanation:</span>
              <p className="text-slate-600 italic">{preview.calculation.deductionReason}</p>
              <div className="mt-2 text-[11px] text-slate-400 font-mono flex gap-4">
                <span>Working Days: {preview.calculation.workingDaysInMonth}</span>
                <span>Paid Leaves Allowed: {preview.calculation.paidLeavesCount}</span>
                <span>Deducted Unpaid Leaves: {preview.calculation.unpaidLeavesCount}</span>
              </div>
            </div>

            {preview.isAlreadyGenerated ? (
              <div className="flex items-center gap-2 p-3 bg-amber-50 text-amber-800 rounded-lg text-xs border border-amber-200">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                <span>
                  Payroll for this period has already been generated (Ref:{' '}
                  <strong>{preview.existingPayroll?.payrollNo}</strong>). Duplicate creation is strictly prevented.
                </span>
              </div>
            ) : (
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleGeneratePayroll}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors flex items-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" /> Finalize & Issue Payslip
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Historical Payrolls Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Generated Monthly Payroll Records</h2>
          <p className="text-xs text-slate-500">History of finalized faculty payslips and disbursement statuses</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold uppercase text-slate-500">
                <th className="py-3 px-4">Payroll Ref</th>
                <th className="py-3 px-4">Faculty</th>
                <th className="py-3 px-4">Month</th>
                <th className="py-3 px-4 text-right">Base Salary</th>
                <th className="py-3 px-4 text-right">Deduction</th>
                <th className="py-3 px-4 text-right">Net Payable</th>
                <th className="py-3 px-4">Disbursement</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400">
                    Loading payroll records...
                  </td>
                </tr>
              ) : payrolls.length ? (
                payrolls.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 text-xs">
                      {p.payrollNo}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-900">{p.teacherId?.name || 'Faculty'}</p>
                      <p className="text-xs text-slate-400 font-mono">{p.teacherId?.employeeId}</p>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs font-medium text-slate-700">
                      {p.payrollMonth}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-xs text-slate-600">
                      ₹{p.baseSalary.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-xs text-rose-600">
                      - ₹{p.leaveDeduction.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      ₹{p.netPayable.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={p.status} />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {p.status !== 'paid' && (
                          <button
                            onClick={() => handleMarkPaid(p._id)}
                            className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors border border-emerald-200"
                          >
                            Mark Paid
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedPayslip(p)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="View Official Payslip"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400">
                    No payroll records finalized yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Payslip View Modal */}
      {selectedPayslip && (
        <Modal
          isOpen={!!selectedPayslip}
          onClose={() => setSelectedPayslip(null)}
          title="Official Faculty Payslip"
          maxWidth="max-w-2xl"
        >
          <div className="space-y-6">
            <div className="border border-slate-200 rounded-xl p-6 bg-white space-y-4">
              <div className="flex justify-between border-b pb-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">EDUCORE INSTITUTE</h3>
                  <p className="text-xs text-slate-500">Monthly Faculty Salary Disbursal Advice</p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs font-bold text-indigo-600 block">
                    {selectedPayslip.payrollNo}
                  </span>
                  <span className="text-xs text-slate-500">Month: {selectedPayslip.payrollMonth}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded-lg">
                <div>
                  <span className="text-slate-400 block">Faculty Member:</span>
                  <span className="font-bold text-slate-800 text-sm">{selectedPayslip.teacherId?.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block">Employee ID:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {selectedPayslip.teacherId?.employeeId}
                  </span>
                </div>
              </div>

              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-slate-400 font-semibold uppercase">
                    <th className="py-2 text-left">Earnings / Deductions Head</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  <tr>
                    <td className="py-2 text-slate-800">Base Salary</td>
                    <td className="py-2 text-right">₹{selectedPayslip.baseSalary.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-slate-800">Allowances (HRA & Special)</td>
                    <td className="py-2 text-right text-emerald-600">
                      + ₹{selectedPayslip.allowances.toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 text-slate-800">
                      Unpaid Leave Deductions ({selectedPayslip.unpaidLeavesCount} Day(s))
                    </td>
                    <td className="py-2 text-right text-rose-600">
                      - ₹{selectedPayslip.leaveDeduction.toLocaleString()}
                    </td>
                  </tr>
                  {selectedPayslip.statutoryDeductions > 0 && (
                    <tr>
                      <td className="py-2 text-slate-800">Standard Statutory Deductions</td>
                      <td className="py-2 text-right text-rose-600">
                        - ₹{selectedPayslip.statutoryDeductions.toLocaleString()}
                      </td>
                    </tr>
                  )}
                  <tr className="border-t-2 border-slate-900 font-bold text-sm">
                    <td className="py-3 text-slate-900">Net Disbursed Amount</td>
                    <td className="py-3 text-right text-emerald-700">
                      ₹{selectedPayslip.netPayable.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-500">
                <p>
                  <strong>Deduction Audit Reason:</strong> {selectedPayslip.deductionReason}
                </p>
                <p className="mt-1">
                  <strong>Disbursement Status:</strong>{' '}
                  <Badge status={selectedPayslip.status} text={selectedPayslip.status} />
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedPayslip(null)}
                className="px-4 py-2 border rounded-xl text-sm"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold flex items-center gap-2"
              >
                <Printer className="h-4 w-4" /> Print Payslip
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PayrollManagement;
