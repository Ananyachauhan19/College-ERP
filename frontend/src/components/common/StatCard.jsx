import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, trend, color = 'indigo' }) => {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-50/80',
      text: 'text-indigo-600',
      border: 'border-indigo-100',
      glow: 'shadow-indigo-500/5',
    },
    emerald: {
      bg: 'bg-emerald-50/80',
      text: 'text-emerald-600',
      border: 'border-emerald-100',
      glow: 'shadow-emerald-500/5',
    },
    amber: {
      bg: 'bg-amber-50/80',
      text: 'text-amber-600',
      border: 'border-amber-100',
      glow: 'shadow-amber-500/5',
    },
    rose: {
      bg: 'bg-rose-50/80',
      text: 'text-rose-600',
      border: 'border-rose-100',
      glow: 'shadow-rose-500/5',
    },
    sky: {
      bg: 'bg-sky-50/80',
      text: 'text-sky-600',
      border: 'border-sky-100',
      glow: 'shadow-sky-500/5',
    },
    purple: {
      bg: 'bg-purple-50/80',
      text: 'text-purple-600',
      border: 'border-purple-100',
      glow: 'shadow-purple-500/5',
    },
  };

  const c = colorMap[color] || colorMap.indigo;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border ${c.border} transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${c.glow}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{value}</h3>
          {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${c.bg} ${c.text}`}>
            <Icon className="h-6 w-6" strokeWidth={2} />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-emerald-600 border-t border-slate-50 pt-3">
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
