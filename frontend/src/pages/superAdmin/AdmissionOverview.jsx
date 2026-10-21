import React, { useEffect, useState } from 'react';
import { admissionService, academicService } from '../../services/api';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { Search, GraduationCap, Calendar, Eye, Building2 } from 'lucide-react';

const AdmissionOverview = () => {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchAdmissions();
    academicService.getDepartments().then((res) => {
      if (res.success) setDepartments(res.departments);
    });
  }, [deptFilter]);

  const fetchAdmissions = async () => {
    try {
      setLoading(true);
      const res = await admissionService.getAdmissions({ departmentId: deptFilter, search });
      if (res.success) setStudents(res.students);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAdmissions();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Student Admission Overview</h1>
        <p className="text-sm text-slate-500 mt-1">
          Institution-wide student admissions, course durations, and fee schedule assignments
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student by name or admission number..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </form>

        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name} ({d.code})
            </option>
          ))}
        </select>
      </div>

      {/* Students Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold uppercase text-slate-500">
                <th className="py-3 px-4">Admission No</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Course & Dept</th>
                <th className="py-3 px-4">Plan & Tenure</th>
                <th className="py-3 px-4 text-right">Course Fee</th>
                <th className="py-3 px-4 text-right">Fee Balance</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    Loading admissions...
                  </td>
                </tr>
              ) : students.length ? (
                students.map((s) => {
                  const schedule = s.feeScheduleRef || {};
                  return (
                    <tr key={s._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 text-xs">
                        {s.admissionNo}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-900">{s.name}</p>
                        <p className="text-xs text-slate-400">{s.email}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-slate-800 text-xs">{s.courseId?.name || 'N/A'}</p>
                        <p className="text-[11px] text-slate-500">{s.departmentId?.name}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="capitalize text-xs font-medium text-slate-700 block">
                          {s.paymentFrequency}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {s.courseDurationYears} Years ({s.courseDurationYears * 2} Sems)
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-800">
                        ₹{(s.totalCourseFee || 0).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono">
                        <span
                          className={`font-bold ${
                            schedule.balanceDue === 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          ₹{(schedule.balanceDue || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setSelectedStudent(s)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No admission records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Details Modal */}
      {selectedStudent && (
        <Modal
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          title={`Admission Details: ${selectedStudent.admissionNo}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <span className="text-xs text-slate-400 block font-semibold uppercase">Student Name</span>
                <span className="font-bold text-slate-900">{selectedStudent.name}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-semibold uppercase">Contact Email</span>
                <span className="text-slate-700">{selectedStudent.email}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-semibold uppercase">Department</span>
                <span className="text-slate-800 font-medium">{selectedStudent.departmentId?.name}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-semibold uppercase">Course Program</span>
                <span className="text-slate-800 font-medium">{selectedStudent.courseId?.name}</span>
              </div>
            </div>

            {/* Fee Schedule Summary */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Assigned Fee Schedule Periods
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 border-b">
                    <tr>
                      <th className="py-2 px-3">Period</th>
                      <th className="py-2 px-3">Due Date</th>
                      <th className="py-2 px-3 text-right">Base Due</th>
                      <th className="py-2 px-3 text-right">Paid</th>
                      <th className="py-2 px-3 text-right">Balance</th>
                      <th className="py-2 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedStudent.feeScheduleRef?.periods?.map((p) => (
                      <tr key={p._id}>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{p.periodName}</td>
                        <td className="py-2.5 px-3 text-slate-500 font-mono">
                          {new Date(p.dueDate).toLocaleDateString()}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono">₹{p.netDue.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-emerald-600 font-semibold">
                          ₹{p.amountPaid.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                          ₹{p.balance.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <Badge status={p.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdmissionOverview;
