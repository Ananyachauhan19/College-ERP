import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldAlert,
  ArrowRight,
  GraduationCap,
  CreditCard,
  UserCheck,
  BookOpen,
  Lock,
  Mail,
} from 'lucide-react';

const roleQuickLogins = [
  {
    role: 'SUPER_ADMIN',
    name: 'Super Admin',
    email: 'admin@educore.edu',
    password: 'Admin@123',
    icon: ShieldAlert,
    badgeColor: 'border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100',
    desc: 'Institution KPIs, User Admin, Leaves, Payroll',
  },
  {
    role: 'ADMISSION_CELL',
    name: 'Admission Cell',
    email: 'admission@educore.edu',
    password: 'Admission@123',
    icon: GraduationCap,
    badgeColor: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
    desc: 'Student Enrollment, Course & Fee Schedule Generator',
  },
  {
    role: 'FEE_OPERATION',
    name: 'Fee Operation',
    email: 'fee@educore.edu',
    password: 'Fee@123',
    icon: CreditCard,
    badgeColor: 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100',
    desc: 'Counter Collection, "Mark as Paid", Receipts & Reports',
  },
  {
    role: 'STUDENT',
    name: 'Student Portal',
    email: 'student@educore.edu',
    password: 'Student@123',
    icon: BookOpen,
    badgeColor: 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100',
    desc: 'Fee Schedule, Online Payments, Download Receipts',
  },
  {
    role: 'TEACHER',
    name: 'Teacher / Faculty',
    email: 'teacher@educore.edu',
    password: 'Teacher@123',
    icon: UserCheck,
    badgeColor: 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100',
    desc: 'Leave Applications, History, Salary & Payslips',
  },
];

const roleRedirectMap = {
  SUPER_ADMIN: '/super-admin',
  ADMISSION_CELL: '/admission-cell',
  FEE_OPERATION: '/fee-operation',
  STUDENT: '/student',
  TEACHER: '/teacher',
};

const LoginPage = () => {
  const [email, setEmail] = useState('admin@educore.edu');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      const destination = roleRedirectMap[user.role] || '/login';
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
    setLoading(true);

    try {
      const user = await login(account.email, account.password);
      const destination = roleRedirectMap[user.role] || '/login';
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to authenticate quick login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Card: 1-Click Role Switcher Demo */}
        <div className="lg:col-span-5 text-white space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-3">
              Role-Based Centralized ERP
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              EduCore College ERP System
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              Select any role below for an instant demo login into its dedicated dashboard:
            </p>
          </div>

          <div className="space-y-2.5">
            {roleQuickLogins.map((acc) => {
              const Icon = acc.icon;
              return (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleQuickLogin(acc)}
                  disabled={loading}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 flex items-center justify-between group ${acc.badgeColor} shadow-sm`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/80 shadow-xs">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-sm leading-tight text-slate-900">{acc.name}</p>
                      <p className="text-[11px] opacity-80 mt-0.5">{acc.desc}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Card: Login Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-100">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Sign in to your account</h2>
            <p className="text-sm text-slate-500 mt-1">
              Enter your credentials to access your designated institutional portal
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700 flex items-center gap-3">
              <ShieldAlert className="h-5 w-5 flex-shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@educore.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>EduCore College ERP v1.0</span>
            <span className="font-mono text-emerald-600 font-medium">SSL Encrypted Portal</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
