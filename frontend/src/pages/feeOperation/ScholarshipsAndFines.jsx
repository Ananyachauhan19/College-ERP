import React, { useEffect, useState } from 'react';
import { admissionService, feeService } from '../../services/api';
import { Gift, Search, CheckCircle2, AlertCircle } from 'lucide-react';

const ScholarshipsAndFines = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [concessionName, setConcessionName] = useState('Merit / Special Concession');
  const [concessionType, setConcessionType] = useState('fixed');
  const [concessionValue, setConcessionValue] = useState('');
  const [reason, setReason] = useState('');
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    admissionService.getAdmissions().then((res) => {
      if (res.success) setStudents(res.students);
    });
  }, []);

  const handleSelectStudent = async (student) => {
    setSelectedStudent(student);
    setMsg({ text: '', type: '' });
    try {
      const res = await feeService.getStudentSchedule(student._id);
      if (res.success) setSchedule(res.schedule);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !concessionValue) return;

    setSubmitting(true);
    try {
      const res = await feeService.applyScholarship({
        studentId: selectedStudent._id,
        name: concessionName,
        type: concessionType,
        value: Number(concessionValue),
        reason,
      });

      if (res.success) {
        setMsg({ text: res.message, type: 'success' });
        setSchedule(res.schedule);
        setConcessionValue('');
        setReason('');
      }
    } catch (err) {
      setMsg({ text: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Scholarships & Fee Concessions</h1>
        <p className="text-sm text-slate-500 mt-1">
          Apply approved institutional scholarships, concessions, and fee waivers with audit logs
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

      {/* Select Student Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <label className="block text-xs font-bold uppercase text-slate-700">1. Select Student</label>
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type student name or admission number..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex flex-wrap gap-2 pt-1 max-h-36 overflow-y-auto">
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
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                  selectedStudent?._id === s._id
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {s.name} ({s.admissionNo})
              </button>
            ))}
        </div>
      </div>

      {/* Apply Concession Form */}
      {selectedStudent && schedule && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex justify-between items-start border-b pb-4">
            <div>
              <span className="font-mono text-xs font-bold text-indigo-600">
                {selectedStudent.admissionNo}
              </span>
              <h3 className="text-lg font-bold text-slate-900">{selectedStudent.name}</h3>
              <p className="text-xs text-slate-500">{selectedStudent.courseId?.name}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block font-medium">Current Balance Due</span>
              <span className="text-xl font-black font-mono text-slate-900">
                ₹{(schedule.balanceDue || 0).toLocaleString()}
              </span>
            </div>
          </div>

          <form onSubmit={handleApply} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Concession / Scholarship Title *
              </label>
              <input
                type="text"
                required
                value={concessionName}
                onChange={(e) => setConcessionName(e.target.value)}
                placeholder="e.g. Sports Concession or Dean's Merit Award"
                className="w-full px-3.5 py-2.5 border rounded-xl text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Concession Type *
                </label>
                <select
                  value={concessionType}
                  onChange={(e) => setConcessionType(e.target.value)}
                  className="w-full px-3.5 py-2.5 border rounded-xl text-sm bg-white"
                >
                  <option value="fixed">Fixed Amount (₹)</option>
                  <option value="percentage">Percentage of Total Fee (%)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Value ({concessionType === 'percentage' ? '%' : '₹'}) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={concessionValue}
                  onChange={(e) => setConcessionValue(e.target.value)}
                  placeholder={concessionType === 'percentage' ? 'e.g. 10' : 'e.g. 15000'}
                  className="w-full px-3.5 py-2.5 border rounded-xl text-sm font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Approval Reference / Justification *
              </label>
              <textarea
                rows={2}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reference document number or reason for fee adjustment"
                className="w-full px-3.5 py-2.5 border rounded-xl text-sm"
              />
            </div>

            <div className="pt-3 border-t">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2"
              >
                <Gift className="h-4 w-4" /> Apply Concession to Fee Account
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ScholarshipsAndFines;
