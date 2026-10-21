import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CreditCard,
  CalendarCheck,
  Banknote,
  FileText,
  UserPlus,
  BookOpen,
  Receipt,
  Gift,
  History,
  BarChart3,
  Send,
  Building2,
} from 'lucide-react';

const navConfig = {
  SUPER_ADMIN: [
    { label: 'Overview', to: '/super-admin', icon: LayoutDashboard },
    { label: 'User Management', to: '/super-admin/users', icon: Users },
    { label: 'All Admissions', to: '/super-admin/admissions', icon: GraduationCap },
    { label: 'Fee Management', to: '/super-admin/fees', icon: CreditCard },
    { label: 'Leave Approvals', to: '/super-admin/leaves', icon: CalendarCheck },
    { label: 'Teacher Payroll', to: '/super-admin/payroll', icon: Banknote },
    { label: 'Audit Logs', to: '/super-admin/audit', icon: FileText },
  ],
  ADMISSION_CELL: [
    { label: 'Dashboard', to: '/admission-cell', icon: LayoutDashboard },
    { label: 'New Admission', to: '/admission-cell/new', icon: UserPlus },
    { label: 'Student Directory', to: '/admission-cell/students', icon: GraduationCap },
    { label: 'Courses & Programs', to: '/admission-cell/courses', icon: BookOpen },
  ],
  FEE_OPERATION: [
    { label: 'Dashboard', to: '/fee-operation', icon: LayoutDashboard },
    { label: 'Counter Collection', to: '/fee-operation/collect', icon: CreditCard },
    { label: 'Fee Structures', to: '/fee-operation/structures', icon: Building2 },
    { label: 'Scholarships & Fines', to: '/fee-operation/concessions', icon: Gift },
    { label: 'Transaction Receipts', to: '/fee-operation/transactions', icon: Receipt },
    { label: 'Financial Reports', to: '/fee-operation/reports', icon: BarChart3 },
  ],
  STUDENT: [
    { label: 'Dashboard', to: '/student', icon: LayoutDashboard },
    { label: 'Fee Schedule', to: '/student/schedule', icon: CalendarCheck },
    { label: 'Pay Dues Online', to: '/student/pay', icon: CreditCard },
    { label: 'Payment Receipts', to: '/student/receipts', icon: Receipt },
  ],
  TEACHER: [
    { label: 'Dashboard', to: '/teacher', icon: LayoutDashboard },
    { label: 'Apply for Leave', to: '/teacher/apply-leave', icon: Send },
    { label: 'Leave History', to: '/teacher/leaves', icon: History },
    { label: 'Salary & Payslips', to: '/teacher/payslips', icon: Banknote },
  ],
};

const Sidebar = () => {
  const { role } = useAuth();
  const links = navConfig[role] || [];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-200 bg-white min-h-screen flex flex-col justify-between">
      <div>
        {/* Brand Header */}
        <div className="flex h-16 items-center gap-2.5 px-6 border-b border-slate-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 text-white font-bold text-lg shadow-md shadow-indigo-500/20">
            E
          </div>
          <div>
            <h1 className="font-extrabold text-slate-900 tracking-tight leading-none text-base">
              EduCore ERP
            </h1>
            <p className="text-[10px] text-indigo-600 font-semibold uppercase tracking-wider mt-0.5">
              College System
            </p>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="p-4 space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Main Navigation
          </p>
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to.split('/').length <= 2}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Branding */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="rounded-xl bg-white p-3 border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-slate-800">Integrated ERP</p>
          <p className="text-[11px] text-slate-500 mt-0.5">5 Role Centralized Hub</p>
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-emerald-600 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Online Database Connected
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
