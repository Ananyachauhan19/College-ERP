import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { academicService, admissionService } from '../../services/api';
import Modal from '../../components/common/Modal';
import {
  UserPlus,
  Calendar,
  CreditCard,
  CheckCircle2,
  Copy,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const NewAdmission = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successResult, setSuccessResult] = useState(null);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    departmentId: '',
    courseId: '',
    academicYear: '2026-2027',
    courseDurationYears: 4,
    totalCourseFee: 320000,
    paymentFrequency: 'semester',
    scholarshipName: '',
    scholarshipAmount: 0,
  });

  useEffect(() => {
    Promise.all([academicService.getDepartments(), academicService.getCourses()]).then(
      ([deptRes, courseRes]) => {
        if (deptRes.success) setDepartments(deptRes.departments);
        if (courseRes.success) setCourses(courseRes.courses);
        setLoading(false);
      }
    );
  }, []);

  // When course changes, auto-set default duration and base fee
  const handleCourseChange = (courseId) => {
    const selectedCourse = courses.find((c) => c._id === courseId);
    if (selectedCourse) {
      const duration = selectedCourse.durationYears || 4;
      const baseFee = (selectedCourse.baseAnnualFee || 60000) * duration;
      setFormData((prev) => ({
        ...prev,
        courseId,
        departmentId: selectedCourse.departmentId?._id || prev.departmentId,
        courseDurationYears: duration,
        totalCourseFee: baseFee,
      }));
    } else {
      setFormData((prev) => ({ ...prev, courseId }));
    }
  };

  // Calculate live preview periods
  const calculatePreviewPeriods = () => {
    const duration = Number(formData.courseDurationYears) || 4;
    const totalFee = Number(formData.totalCourseFee) || 0;
    const scholarship = Number(formData.scholarshipAmount) || 0;
    const netTotal = Math.max(0, totalFee - scholarship);

    let periodCount = 1;
    let label = 'Year';
    if (formData.paymentFrequency === 'yearly') {
      periodCount = duration;
      label = 'Year';
    } else if (formData.paymentFrequency === 'semester') {
      periodCount = duration * 2;
      label = 'Semester';
    } else if (formData.paymentFrequency === 'installment') {
      periodCount = duration * 3;
      label = 'Installment';
    }

    const basePerPeriod = Math.floor(netTotal / periodCount);
    const remainder = netTotal - basePerPeriod * periodCount;

    return Array.from({ length: periodCount }).map((_, i) => ({
      name: `${label} ${i + 1}`,
      amount: i === periodCount - 1 ? basePerPeriod + remainder : basePerPeriod,
    }));
  };

  const previewPeriods = calculatePreviewPeriods();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await admissionService.createAdmission(formData);
      if (res.success) {
        setSuccessResult(res);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit admission record');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">New Student Admission Enrollment</h1>
        <p className="text-sm text-slate-500 mt-1">
          Capture student admission credentials, program duration, total fee, and configure the automated payment schedule
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Student & Course Details */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">1. Personal & Contact Information</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Full Student Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Ananya Sharma"
                className="w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="student@example.com"
                  className="w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 00000"
                  className="w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-3.5 py-2.5 border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Academic Session</label>
                <input
                  type="text"
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  className="w-full px-3.5 py-2.5 border rounded-xl text-sm bg-slate-50 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Residential Address</label>
              <textarea
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Street address, city, state, postal code"
                className="w-full px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div className="border-t border-b border-slate-100 py-4">
            <h2 className="text-base font-bold text-slate-900">2. Academic Program Selection</h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Academic Program *</label>
                <select
                  required
                  value={formData.courseId}
                  onChange={(e) => handleCourseChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">Select Course</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Department</label>
                <select
                  required
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className="w-full px-3.5 py-2.5 border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Course Duration (Years) *
                </label>
                <select
                  value={formData.courseDurationYears}
                  onChange={(e) =>
                    setFormData({ ...formData, courseDurationYears: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2.5 border rounded-xl text-sm bg-white"
                >
                  <option value={1}>1 Year (2 Semesters)</option>
                  <option value={2}>2 Years (4 Semesters)</option>
                  <option value={3}>3 Years (6 Semesters)</option>
                  <option value={4}>4 Years (8 Semesters)</option>
                  <option value={5}>5 Years (10 Semesters)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Payment Frequency Plan *
                </label>
                <select
                  value={formData.paymentFrequency}
                  onChange={(e) => setFormData({ ...formData, paymentFrequency: e.target.value })}
                  className="w-full px-3.5 py-2.5 border rounded-xl text-sm bg-white"
                >
                  <option value="semester">Semester-wise (Twice a year)</option>
                  <option value="yearly">Yearly (Annual Dues)</option>
                  <option value="installment">Installment-based (3 installments/year)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <h2 className="text-base font-bold text-slate-900 mb-4">3. Fee & Concession Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Total Course Fee (₹) *</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={formData.totalCourseFee}
                  onChange={(e) =>
                    setFormData({ ...formData, totalCourseFee: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2.5 border rounded-xl text-sm font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Approved Concession / Scholarship (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={formData.scholarshipAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, scholarshipAmount: Number(e.target.value) })
                  }
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 border rounded-xl text-sm font-mono"
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? 'Creating Admission & Generating Schedule...' : 'Confirm Admission & Issue Fee Schedule'}
            </button>
          </div>
        </div>

        {/* Right Card: Live Fee Schedule Generator Preview */}
        <div className="lg:col-span-5 bg-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-xl space-y-6 sticky top-24">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-4 w-4" /> Live Schedule Generator Preview
          </div>

          <div>
            <span className="text-xs text-slate-400 block font-medium">Net Payable Course Fee</span>
            <div className="text-3xl font-extrabold text-white font-mono mt-1">
              ₹
              {Math.max(
                0,
                (formData.totalCourseFee || 0) - (formData.scholarshipAmount || 0)
              ).toLocaleString()}
            </div>
            {formData.scholarshipAmount > 0 && (
              <span className="text-xs text-emerald-400 block mt-1 font-mono">
                Concession Applied: ₹{Number(formData.scholarshipAmount).toLocaleString()}
              </span>
            )}
          </div>

          <div className="border-t border-slate-800 pt-4 space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Program Tenure:</span>
              <span className="font-semibold text-slate-200">
                {formData.courseDurationYears} Years ({formData.courseDurationYears * 2} Semesters)
              </span>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Frequency Plan:</span>
              <span className="font-semibold text-emerald-400 uppercase font-mono">
                {formData.paymentFrequency}
              </span>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Total Generated Dues:</span>
              <span className="font-semibold text-slate-200">{previewPeriods.length} Periods</span>
            </div>
          </div>

          {/* Breakdown Preview List */}
          <div className="border-t border-slate-800 pt-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Generated Period Breakdown
            </p>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {previewPeriods.map((p, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-xs"
                >
                  <span className="font-medium text-slate-300">{p.name}</span>
                  <span className="font-mono font-bold text-emerald-400">
                    ₹{p.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed italic">
            * Upon confirmation, the authoritative fee ledger, student user login, and automated due dates will be instantly created.
          </p>
        </div>
      </form>

      {/* Success Modal */}
      {successResult && (
        <Modal
          isOpen={!!successResult}
          onClose={() => navigate('/admission-cell/students')}
          title="Admission Confirmed Successfully!"
          maxWidth="max-w-md"
        >
          <div className="text-center space-y-4 py-2">
            <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-9 w-9" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Admission No: {successResult.student?.admissionNo}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Student record created and linked to fee ledger
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-2 font-mono">
              <p className="text-slate-500 uppercase font-bold text-[10px]">Portal Access Credentials</p>
              <p>
                <strong>Email:</strong> {successResult.student?.email}
              </p>
              <p>
                <strong>Temporary Password:</strong>{' '}
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {successResult.tempPassword}
                </span>
              </p>
            </div>

            <button
              onClick={() => navigate('/admission-cell/students')}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              Go to Student Directory
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default NewAdmission;
