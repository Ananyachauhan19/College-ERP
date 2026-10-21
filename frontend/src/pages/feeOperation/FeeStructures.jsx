import React, { useEffect, useState } from 'react';
import { feeService, academicService } from '../../services/api';
import Modal from '../../components/common/Modal';
import { Building2, Plus, Trash2, CheckCircle2 } from 'lucide-react';

const FeeStructures = () => {
  const [structures, setStructures] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  // Form
  const [name, setName] = useState('');
  const [courseId, setCourseId] = useState('');
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [defaultFrequency, setDefaultFrequency] = useState('semester');
  const [feeHeads, setFeeHeads] = useState([
    { headName: 'Tuition Fee', amount: 60000 },
    { headName: 'Admission & Registration Fee', amount: 10000 },
    { headName: 'Lab & Computer Facility', amount: 8000 },
    { headName: 'Library & Exam Fee', amount: 6000 },
  ]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [structRes, courseRes] = await Promise.all([
        feeService.getFeeStructures(),
        academicService.getCourses(),
      ]);
      if (structRes.success) setStructures(structRes.structures);
      if (courseRes.success) setCourses(courseRes.courses);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddHead = () => {
    setFeeHeads([...feeHeads, { headName: '', amount: 0 }]);
  };

  const handleRemoveHead = (idx) => {
    setFeeHeads(feeHeads.filter((_, i) => i !== idx));
  };

  const handleHeadChange = (idx, field, val) => {
    const updated = [...feeHeads];
    updated[idx][field] = field === 'amount' ? Number(val) : val;
    setFeeHeads(updated);
  };

  const totalCalculated = feeHeads.reduce((acc, h) => acc + (Number(h.amount) || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !courseId) return;

    try {
      const res = await feeService.createFeeStructure({
        name,
        courseId,
        academicYear,
        defaultFrequency,
        feeHeads,
      });
      if (res.success) {
        setMsg({ text: 'Fee structure created successfully', type: 'success' });
        setIsModalOpen(false);
        fetchData();
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Fee Structures & Heads</h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure institutional fee heads, academic course rates, and default payment frequencies
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
        >
          <Plus className="h-4 w-4" /> Create Fee Structure
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

      {/* Grid of Fee Structures */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 py-12 text-center text-slate-400">Loading structures...</div>
        ) : structures.length ? (
          structures.map((s) => (
            <div
              key={s._id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex justify-between items-start">
                  <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-mono font-bold rounded-md uppercase">
                    {s.defaultFrequency}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">{s.academicYear}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-3">{s.name}</h3>
                <p className="text-xs text-slate-500">{s.courseId?.name}</p>

                {/* Heads list */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                  {s.feeHeads?.map((h, i) => (
                    <div key={i} className="flex justify-between text-slate-600">
                      <span>{h.headName}</span>
                      <span className="font-mono font-medium">₹{h.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Annualized Base Total</span>
                <span className="text-base font-bold text-indigo-700 font-mono">
                  ₹{(s.totalAmount || 0).toLocaleString()}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 py-12 text-center text-slate-400">
            No fee structures configured yet.
          </div>
        )}
      </div>

      {/* Modal: Create Fee Structure */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Fee Structure">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Structure Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. B.Tech Computer Science 2026 Regular"
              className="w-full px-3 py-2 border rounded-xl text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Course Program *</label>
              <select
                required
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-sm bg-white"
              >
                <option value="">Select Course</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Default Frequency *
              </label>
              <select
                value={defaultFrequency}
                onChange={(e) => setDefaultFrequency(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-sm bg-white"
              >
                <option value="semester">Semester-wise</option>
                <option value="yearly">Yearly</option>
                <option value="installment">Installment-based</option>
              </select>
            </div>
          </div>

          {/* Configurable Fee Heads */}
          <div className="border-t pt-3">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Fee Heads Breakdown
              </label>
              <button
                type="button"
                onClick={handleAddHead}
                className="text-xs text-indigo-600 font-semibold hover:underline"
              >
                + Add Fee Head
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {feeHeads.map((head, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="text"
                    required
                    placeholder="Head name (e.g. Tuition)"
                    value={head.headName}
                    onChange={(e) => handleHeadChange(idx, 'headName', e.target.value)}
                    className="flex-1 px-3 py-1.5 border rounded-lg text-xs"
                  />
                  <input
                    type="number"
                    required
                    min={0}
                    placeholder="Amount"
                    value={head.amount}
                    onChange={(e) => handleHeadChange(idx, 'amount', e.target.value)}
                    className="w-28 px-3 py-1.5 border rounded-lg text-xs font-mono"
                  />
                  {feeHeads.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveHead(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-3 p-3 bg-slate-50 rounded-xl flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700">Calculated Structure Total:</span>
              <span className="text-base font-bold text-indigo-700 font-mono">
                ₹{totalCalculated.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border rounded-xl text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold"
            >
              Save Structure
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FeeStructures;
