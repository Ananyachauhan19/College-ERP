import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Bell, User as UserIcon, Calendar } from 'lucide-react';

const roleColorMap = {
  SUPER_ADMIN: 'bg-purple-100 text-purple-800 border-purple-200',
  ADMISSION_CELL: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  FEE_OPERATION: 'bg-blue-100 text-blue-800 border-blue-200',
  STUDENT: 'bg-amber-100 text-amber-800 border-amber-200',
  TEACHER: 'bg-rose-100 text-rose-800 border-rose-200',
};

const roleLabelMap = {
  SUPER_ADMIN: 'Super Admin',
  ADMISSION_CELL: 'Admission Cell',
  FEE_OPERATION: 'Fee Operation Team',
  STUDENT: 'Student',
  TEACHER: 'Faculty / Teacher',
};

const Navbar = () => {
  const { user, role, logout } = useAuth();

  const roleStyle = roleColorMap[role] || 'bg-slate-100 text-slate-800 border-slate-200';
  const roleLabel = roleLabelMap[role] || role;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/90 px-6 backdrop-blur-md">
      {/* Left Session Info */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-600 border border-slate-200">
          <Calendar className="h-3.5 w-3.5 text-indigo-500" />
          <span>Session: 2026 - 2027</span>
        </div>
      </div>

      {/* Right User Actions */}
      <div className="flex items-center gap-4">
        {/* Role Pill */}
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border tracking-wide uppercase ${roleStyle}`}
        >
          {roleLabel}
        </span>

        {/* User Card */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <div className="hidden md:block text-right">
            <p className="text-sm font-semibold text-slate-900 leading-tight">{user?.name}</p>
            <p className="text-xs text-slate-500 leading-tight truncate max-w-[180px]">{user?.email}</p>
          </div>

          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="h-4 w-4" />}
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            title="Log out"
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
