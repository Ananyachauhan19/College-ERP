import React, { useEffect, useState } from 'react';
import { admissionService, academicService } from '../../services/api';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { Search, Edit, Eye, Filter } from 'lucide-react';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [editStudent, setEditStudent] = useState(null);
  const [msg, setMsg] = useState({ text: '', type: '' });

  // Edit form state
  const [editForm, setEditForm] = useState({
    phone: '',
    address: '',
    admissionStatus: 'active',
    updateReason: '',
  });

  useEffect(() => {
    fetchStudents();
    academicService.getDepartments().then((res) => {
      if (res.success) setDepartments(res.departments);
    });
  }, [deptFilter]);

  const fetchStudents = async () => {
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
    fetchStudents();
  };

  const openEditModal = (student) => {
    setEditStudent(student);
    setEditForm({
      phone: student.phone || '',
      address: student.address || '',
      admissionStatus: student.admissionStatus || 'active',
      updateReason: '',
    });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editStudent) return;
    try {
      const res = await admissionService.updateAdmission(editStudent._id, editForm);
      if (res.success) {
        setMsg({ text: res.message, type: 'success' });
        setEditStudent(null);
        fetchStudents();
      }
    } catch (err) {
      setMsg({ text: err.message, type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Student Directory</h1>
        <p className="text-sm text-slate-500 mt-1">
          Search, view enrollment details, and update student demographic records with audit reasons
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

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, admission no, or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </form>

        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
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
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Program & Dept</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    Loading directory...
                  </td>
                </tr>
              ) : students.length ? (
                students.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 text-xs">
                      {s.admissionNo}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{s.name}</td>
                    <td className="py-3.5 px-4">
                      <p className="text-xs font-medium text-slate-800">{s.courseId?.name}</p>
                      <p className="text-[11px] text-slate-400">{s.departmentId?.name}</p>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 font-mono">
                      <p>{s.phone}</p>
                      <p className="text-[11px] text-slate-400">{s.email}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={s.admissionStatus} />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => openEditModal(s)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        <Edit className="h-3.5 w-3.5" /> Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editStudent && (
        <Modal
          isOpen={!!editStudent}
          onClose={() => setEditStudent(null)}
          title={`Edit Student: ${editStudent.admissionNo}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number</label>
              <input
                type="tel"
                required
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Residential Address</label>
              <textarea
                rows={2}
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Admission Status</label>
              <select
                value={editForm.admissionStatus}
                onChange={(e) => setEditForm({ ...editForm, admissionStatus: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-sm bg-white"
              >
                <option value="active">Active</option>
                <option value="graduated">Graduated</option>
                <option value="suspended">Suspended</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Reason for Change (Audit Trail) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Student relocated, updated contact"
                value={editForm.updateReason}
                onChange={(e) => setEditForm({ ...editForm, updateReason: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-sm"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => setEditStudent(null)}
                className="px-4 py-2 border rounded-xl text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default StudentManagement;
