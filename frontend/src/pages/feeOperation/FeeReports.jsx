import React, { useEffect, useState } from 'react';
import { reportService, admissionService } from '../../services/api';
import Badge from '../../components/common/Badge';
import { Download, BarChart3, Users, CreditCard } from 'lucide-react';

const FeeReports = () => {
  const [data, setData] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([reportService.getSummary(), admissionService.getAdmissions()]).then(
      ([repRes, admRes]) => {
        if (repRes.success) setData(repRes);
        if (admRes.success) setStudents(admRes.students);
        setLoading(false);
      }
    );
  }, []);

  const exportToCSV = () => {
    if (!students.length) return;
    const headers = ['Admission No', 'Student Name', 'Course', 'Department', 'Total Fee', 'Balance Due', 'Status'];
    const rows = students.map((s) => [
      s.admissionNo,
      s.name,
      s.courseId?.name || '',
      s.departmentId?.name || '',
      s.totalCourseFee || 0,
      s.feeScheduleRef?.balanceDue || 0,
      s.admissionStatus || '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `EduCore_Fee_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stats = data?.stats || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Fee Collection Reports</h1>
          <p className="text-sm text-slate-500 mt-1">
            Institutional fee summaries, collection distribution, outstanding lists, and CSV export
          </p>
        </div>

        <button
          onClick={exportToCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
        >
          <Download className="h-4 w-4" /> Export Report (CSV)
        </button>
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900">Department Quotas & Students</h2>
          <div className="divide-y divide-slate-100">
            {data?.departmentBreakdown?.map((d) => (
              <div key={d.code} className="py-2.5 flex justify-between text-xs">
                <span className="font-semibold text-slate-800">{d.name}</span>
                <span className="font-mono text-indigo-600 font-bold">{d.count} Students</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900">Collections Summary</h2>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-2 border-b">
              <span className="text-slate-600">Total Expected Gross:</span>
              <span className="font-bold font-mono">₹{(stats.totalExpectedFees || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-slate-600">Online ERP Gateway Collected:</span>
              <span className="font-bold font-mono text-emerald-600">
                ₹{(stats.totalOnlineCollections || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-slate-600">Counter Desk Collected:</span>
              <span className="font-bold font-mono text-blue-600">
                ₹{(stats.totalOfflineCollections || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between py-2 font-bold text-sm">
              <span className="text-slate-900">Total Outstanding Balance:</span>
              <span className="font-mono text-rose-600">
                ₹{(stats.totalOutstandingFees || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Outstanding Students Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm">Student Outstanding Balances</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                <th className="py-2.5 px-4">Admission No</th>
                <th className="py-2.5 px-4">Student</th>
                <th className="py-2.5 px-4">Course</th>
                <th className="py-2.5 px-4 text-right">Total Fee</th>
                <th className="py-2.5 px-4 text-right">Balance Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-xs">
              {students.map((s) => (
                <tr key={s._id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 font-bold text-indigo-600">{s.admissionNo}</td>
                  <td className="py-2.5 px-4 font-sans text-slate-800 font-medium">{s.name}</td>
                  <td className="py-2.5 px-4 font-sans text-slate-600">{s.courseId?.name}</td>
                  <td className="py-2.5 px-4 text-right text-slate-700">
                    ₹{(s.totalCourseFee || 0).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-4 text-right font-bold text-slate-900">
                    ₹{(s.feeScheduleRef?.balanceDue || 0).toLocaleString()}
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

export default FeeReports;
