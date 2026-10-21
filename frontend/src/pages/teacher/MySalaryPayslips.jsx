import React, { useEffect, useState } from 'react';
import { payrollService } from '../../services/api';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { Banknote, Eye, Printer, ShieldCheck } from 'lucide-react';

const MySalaryPayslips = () => {
  const [payslips, setPayslips] = useState([]);
  const [salaryStructure, setSalaryStructure] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  useEffect(() => {
    payrollService.getMyPayslips().then((res) => {
      if (res.success) {
        setPayslips(res.payslips || []);
        setSalaryStructure(res.salaryStructure);
      }
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
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Faculty Compensation & Payslips</h1>
        <p className="text-sm text-slate-500 mt-1">
          View your assigned salary structure, monthly breakdown, and official downloadable payslips
        </p>
      </div>

      {/* Salary Structure Card */}
      {salaryStructure && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Banknote className="h-5 w-5 text-indigo-600" />
              Configured Compensation Structure
            </h2>
            <span className="text-xs uppercase font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md">
              {salaryStructure.calculationType} Basis
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 block font-sans">Monthly Base Salary</span>
              <span className="text-base font-bold text-slate-900">
                ₹{salaryStructure.baseMonthlySalary.toLocaleString()}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 block font-sans">Paid Leave Allowance</span>
              <span className="text-base font-bold text-indigo-700">
                {salaryStructure.paidLeavesAllowedPerMonth} Days / Mo
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 block font-sans">HRA & Allowances</span>
              <span className="text-base font-bold text-emerald-600">
                + ₹{((salaryStructure.hra || 0) + (salaryStructure.allowances || 0)).toLocaleString()}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-400 block font-sans">Standard Deductions</span>
              <span className="text-base font-bold text-rose-600">
                - ₹{(salaryStructure.standardDeductions || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Payslips Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold uppercase text-slate-500">
                <th className="py-3 px-4">Payroll Ref</th>
                <th className="py-3 px-4">Month</th>
                <th className="py-3 px-4 text-right">Base Salary</th>
                <th className="py-3 px-4 text-right">Leave Deduction</th>
                <th className="py-3 px-4 text-right">Net Payable</th>
                <th className="py-3 px-4">Disbursement Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-xs">
              {payslips.length ? (
                payslips.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-indigo-600">{p.payrollNo}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{p.payrollMonth}</td>
                    <td className="py-3.5 px-4 text-right text-slate-700">
                      ₹{p.baseSalary.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right text-rose-600">
                      - ₹{p.leaveDeduction.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 text-sm">
                      ₹{p.netPayable.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-sans">
                      <Badge status={p.status} />
                    </td>
                    <td className="py-3.5 px-4 text-center font-sans">
                      <button
                        onClick={() => setSelectedPayslip(p)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" /> View Payslip
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400 font-sans">
                    No finalized payslips available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payslip Modal */}
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
                  <h3 className="font-extrabold text-slate-900 text-lg">EDUCORE INSTITUTE OF TECHNOLOGY</h3>
                  <p className="text-xs text-slate-500">Monthly Faculty Salary Disbursal Advice</p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs font-bold text-indigo-600 block">
                    {selectedPayslip.payrollNo}
                  </span>
                  <span className="text-xs text-slate-500">Month: {selectedPayslip.payrollMonth}</span>
                </div>
              </div>

              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b text-slate-400 font-semibold font-sans uppercase">
                    <th className="py-2 text-left">Compensation Component</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2 text-slate-800">Base Salary</td>
                    <td className="py-2 text-right">₹{selectedPayslip.baseSalary.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-slate-800">HRA & Special Allowances</td>
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
                  <tr className="border-t-2 border-slate-900 font-bold text-sm">
                    <td className="py-3 text-slate-900 font-sans">Net Disbursed Amount</td>
                    <td className="py-3 text-right text-emerald-700">
                      ₹{selectedPayslip.netPayable.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-500 space-y-1">
                <p>
                  <strong>Deduction Explanation:</strong> {selectedPayslip.deductionReason}
                </p>
                <p>
                  <strong>Status:</strong>{' '}
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

export default MySalaryPayslips;
