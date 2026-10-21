import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { leaveService, payrollService } from '../../services/api';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import { CalendarCheck, Banknote, Send, History, ArrowRight, UserCheck } from 'lucide-react';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [payslips, setPayslips] = useState([]);
  const [salaryStructure, setSalaryStructure] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([leaveService.getMyLeaves(), payrollService.getMyPayslips()]).then(
      ([leaveRes, payRes]) => {
        if (leaveRes.success) setLeaves(leaveRes.leaves);
        if (payRes.success) {
          setPayslips(payRes.payslips || []);
          setSalaryStructure(payRes.salaryStructure);
        }
        setLoading(false);
      }
    );
  }, []);

  const pendingLeaves = leaves.filter((l) => l.status === 'pending').length;
  const approvedLeaves = leaves.filter((l) => l.status === 'approved').length;
  const latestPayslip = payslips[0];

  return (
    <div className="space-y-8">
      {/* Welcome Card */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-300 text-xs font-semibold uppercase tracking-wider mb-2">
            Faculty Academic Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.name}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Employee ID: <strong className="font-mono text-white">{user?.profile?.employeeId}</strong> •{' '}
            {user?.profile?.designation} ({user?.profile?.departmentId?.name || 'Academic Dept'})
          </p>
        </div>

        <Link
          to="/teacher/apply-leave"
          className="inline-flex items-center gap-2 px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-rose-600/20 transition-all"
        >
          <Send className="h-4 w-4" /> Apply for Leave
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Monthly Base Compensation"
          value={`₹${(salaryStructure?.baseMonthlySalary || 65000).toLocaleString()}`}
          subtitle={`Paid Leave Allowance: ${salaryStructure?.paidLeavesAllowedPerMonth || 2} Days / Month`}
          icon={Banknote}
          color="indigo"
        />
        <StatCard
          title="Approved Leave Requests"
          value={approvedLeaves}
          subtitle={`${pendingLeaves} request(s) awaiting approval`}
          icon={CalendarCheck}
          color="emerald"
        />
        <StatCard
          title="Latest Disbursed Salary"
          value={latestPayslip ? `₹${latestPayslip.netPayable.toLocaleString()}` : '—'}
          subtitle={latestPayslip ? `Month: ${latestPayslip.payrollMonth}` : 'No payslips generated yet'}
          icon={UserCheck}
          color="purple"
        />
      </div>

      {/* Two Column Grid: Recent Leaves & Payslips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leaves */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <h2 className="text-base font-bold text-slate-900">Recent Leave Requests</h2>
            <Link
              to="/teacher/leaves"
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              All Leaves <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {leaves.length ? (
              leaves.slice(0, 3).map((l) => (
                <div
                  key={l._id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold capitalize text-slate-800 text-sm">
                        {l.leaveType} Leave
                      </span>
                      <span className="text-slate-500 font-mono">({l.totalDays} Day(s))</span>
                    </div>
                    <p className="text-slate-500 mt-0.5">
                      {new Date(l.startDate).toLocaleDateString()} to{' '}
                      {new Date(l.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge status={l.status} />
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-slate-400 text-sm">No leave requests submitted.</p>
            )}
          </div>
        </div>

        {/* Recent Payslips */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <h2 className="text-base font-bold text-slate-900">Monthly Payslips</h2>
            <Link
              to="/teacher/payslips"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              All Payslips <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {payslips.length ? (
              payslips.slice(0, 3).map((p) => (
                <div
                  key={p._id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold font-mono text-indigo-700 text-sm">
                      {p.payrollMonth}
                    </span>
                    <p className="text-slate-500 mt-0.5">Ref: {p.payrollNo}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 font-mono text-sm block">
                      ₹{p.netPayable.toLocaleString()}
                    </span>
                    <Badge status={p.status} text={p.status} />
                  </div>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-slate-400 text-sm">No monthly payslips issued yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
