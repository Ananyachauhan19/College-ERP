import React, { useEffect, useState } from 'react';
import { userService, academicService } from '../../services/api';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { UserPlus, Search, UserCheck, UserX, Shield, Mail, Phone } from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'ADMISSION_CELL',
    phone: '',
    departmentId: '',
    designation: 'Assistant Professor',
  });

  useEffect(() => {
    fetchUsers();
    academicService.getDepartments().then((res) => {
      if (res.success) setDepartments(res.departments);
    });
  }, [roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await userService.getUsers({ role: roleFilter, search });
      if (res.success) setUsers(res.users);
    } catch (err) {
      setMsg({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleStatus = async (user) => {
    try {
      const res = await userService.toggleStatus(user._id);
      if (res.success) {
        setMsg({ text: res.message, type: 'success' });
        fetchUsers();
      }
    } catch (err) {
      setMsg({ text: err.message, type: 'error' });
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await userService.createUser(formData);
      if (res.success) {
        setMsg({ text: res.message, type: 'success' });
        setIsModalOpen(false);
        setFormData({
          name: '',
          email: '',
          password: '',
          role: 'ADMISSION_CELL',
          phone: '',
          departmentId: '',
          designation: 'Assistant Professor',
        });
        fetchUsers();
      }
    } catch (err) {
      setMsg({ text: err.message, type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">User Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage institutional staff accounts, assign roles, and control access
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
        >
          <UserPlus className="h-4 w-4" /> Add New Staff Member
        </button>
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

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </form>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="">All Roles</option>
          <option value="SUPER_ADMIN">Super Admin</option>
          <option value="ADMISSION_CELL">Admission Cell</option>
          <option value="FEE_OPERATION">Fee Operation Team</option>
          <option value="TEACHER">Faculty / Teacher</option>
          <option value="STUDENT">Student</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold uppercase text-slate-500">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400">
                    Loading users...
                  </td>
                </tr>
              ) : users.length ? (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{u.name}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={u.role} text={u.role.replace(/_/g, ' ')} />
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 font-mono">
                      {u.phone || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        status={u.isActive ? 'active' : 'suspended'}
                        text={u.isActive ? 'Active' : 'Deactivated'}
                      />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                          u.isActive
                            ? 'text-rose-600 border-rose-200 hover:bg-rose-50'
                            : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                        }`}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400">
                    No users matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Staff User */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Staff Account">
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Dr. John Doe"
              className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@educore.edu"
                className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Temporary Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Min 6 characters"
                className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Assigned Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="ADMISSION_CELL">Admission Cell</option>
                <option value="FEE_OPERATION">Fee Operation Team</option>
                <option value="TEACHER">Faculty / Teacher</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 00000"
                className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {formData.role === 'TEACHER' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Department</label>
                <select
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-sm bg-white"
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Designation</label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="Assistant Professor"
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border rounded-xl text-sm text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm"
            >
              Create Account
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserManagement;
