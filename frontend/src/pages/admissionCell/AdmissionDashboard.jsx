import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { admissionService } from '../../services/api';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import { UserPlus, Users, GraduationCap, ArrowRight, Eye, Calendar } from 'lucide-react';

const AdmissionDashboard = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    admissionService.getAdmissions().then((res) => {
      if (res.success) setStudents(res.students);
      setLoading(false);
    });
  }, []);

  const totalAdmissions = students.length;
  const activeAdmissions = students.filter((s) => s.admissionStatus === 'active').length;

  return (
    <div className="space-y-8">
      {/* Header with Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Admission Cell Portal</h1>
          <p className="text-sm text-slate-500 mt-1">
            Student enrollments, academic program duration assignments, and flexible payment plan setup
          </p>
        </div>

        <Link
          to="/admission-cell/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
        >
          <UserPlus className="h-4 w-4" /> Enroll New Student
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Total Registered Admissions"
          value={totalAdmissions}
          subtitle="Enrolled students"
          icon={Users}
          color="emerald"
        />
        <StatCard
          title="Active Students"
          value={activeAdmissions}
          subtitle="In-progress academic programs"
          icon={GraduationCap}
          color="indigo"
        />
        <StatCard
          title="Current Session"
          value="2026-2027"
          subtitle="Autumn / Spring Cycle"
          icon={Calendar}
          color="sky"
        />
      </div>

      {/* Recent Admissions Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Enrolled Students</h2>
            <p className="text-xs text-slate-500">Admissions configured with fee schedules</p>
          </div>
          <Link
            to="/admission-cell/students"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            View All <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold uppercase text-slate-500">
                <th className="py-3 px-4">Admission No</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Course Program</th>
                <th className="py-3 px-4">Plan</th>
                <th className="py-3 px-4 text-right">Agreed Total Fee</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    Loading admissions...
                  </td>
                </tr>
              ) : students.slice(0, 5).map((s) => (
                <tr key={s._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 text-xs">
                    {s.admissionNo}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{s.name}</td>
                  <td className="py-3.5 px-4 text-xs text-slate-700">{s.courseId?.name}</td>
                  <td className="py-3.5 px-4 capitalize text-xs font-medium text-slate-600 font-mono">
                    {s.paymentFrequency}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                    ₹{(s.totalCourseFee || 0).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <Badge status={s.admissionStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdmissionDashboard;
