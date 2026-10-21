import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { paymentService, feeService } from '../../services/api';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import { CreditCard, Calendar, CheckCircle2, AlertCircle, ArrowRight, BookOpen } from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState(null);
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paymentService.getMyHistory().then((res) => {
      if (res.success) {
        setSchedule(res.schedule);
        setReceipts(res.receipts || []);
      }
      setLoading(false);
    });
  }, []);

  const student = user?.profile || {};
  const course = student.courseId || {};
  const totalPaid = schedule?.totalPaid || 0;
  const balanceDue = schedule?.balanceDue || 0;
  const netPayable = schedule?.netPayable || 1;
  const progressPercent = Math.min(100, Math.round((totalPaid / netPayable) * 100));

  // Find next upcoming due period
  const nextDue = schedule?.periods?.find((p) => p.balance > 0);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-2">
              Student Academic Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Admission No: <strong className="font-mono text-white">{student.admissionNo}</strong> •{' '}
              {course.name} ({student.courseDurationYears} Years)
            </p>
          </div>

          {nextDue && (
            <Link
              to="/student/pay"
              className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/20 transition-all"
            >
              <CreditCard className="h-4 w-4" /> Pay Upcoming Due (₹{nextDue.balance.toLocaleString()})
            </Link>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Total Program Fee"
          value={`₹${(schedule?.totalCourseFee || 0).toLocaleString()}`}
          subtitle={`Plan: ${schedule?.paymentFrequency?.toUpperCase() || 'SEMESTER'}`}
          icon={BookOpen}
          color="indigo"
        />
        <StatCard
          title="Total Paid Amount"
          value={`₹${totalPaid.toLocaleString()}`}
          subtitle={`${progressPercent}% of course fees settled`}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Remaining Outstanding"
          value={`₹${balanceDue.toLocaleString()}`}
          subtitle={nextDue ? `Next: ${nextDue.periodName} Due` : 'All current dues clear'}
          icon={AlertCircle}
          color={balanceDue > 0 ? 'rose' : 'emerald'}
        />
      </div>

      {/* Fee Progress Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
        <div className="flex justify-between items-center text-xs font-bold">
          <span className="text-slate-700 uppercase tracking-wider">Overall Tuition Clearance</span>
          <span className="text-indigo-600 font-mono">{progressPercent}% Paid</span>
        </div>
        <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Two Column Grid: Upcoming Dues & Latest Receipts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Next Fee Period Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <h2 className="text-base font-bold text-slate-900">Next Upcoming Due Period</h2>
            <Link
              to="/student/schedule"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              Full Schedule <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {nextDue ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900 text-sm">{nextDue.periodName}</span>
                  <Badge status={nextDue.status} />
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Due Date:</span>
                  <span className="font-mono text-slate-700 font-bold">
                    {new Date(nextDue.dueDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Payable Amount:</span>
                  <span className="font-mono text-slate-900 font-black text-sm">
                    ₹{nextDue.balance.toLocaleString()}
                  </span>
                </div>
              </div>

              <Link
                to="/student/pay"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <CreditCard className="h-4 w-4" /> Proceed to Online Payment
              </Link>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-sm">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
              All academic periods are currently settled!
            </div>
          )}
        </div>

        {/* Latest Receipts Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <h2 className="text-base font-bold text-slate-900">Recent Payment Receipts</h2>
            <Link
              to="/student/receipts"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              All Receipts <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-2">
            {receipts.length ? (
              receipts.slice(0, 3).map((r) => (
                <div
                  key={r._id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                >
                  <div>
                    <p className="font-bold font-mono text-indigo-700">{r.receiptNo}</p>
                    <p className="text-slate-500">
                      {r.periodName} • {r.paymentMode.toUpperCase()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-600 font-mono">
                      ₹{r.amountPaid.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {new Date(r.issuedDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-slate-400 text-sm">No payment receipts yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
