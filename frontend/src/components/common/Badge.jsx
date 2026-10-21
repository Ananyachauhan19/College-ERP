import React from 'react';

const Badge = ({ status, text, size = 'sm' }) => {
  const norm = (status || text || '').toLowerCase().replace(/_/g, ' ');

  let style = 'bg-slate-100 text-slate-700 border-slate-200';

  if (norm.includes('paid') && !norm.includes('partially') && !norm.includes('unpaid')) {
    style = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (norm.includes('partially')) {
    style = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (norm.includes('pending') || norm.includes('draft')) {
    style = 'bg-sky-50 text-sky-700 border-sky-200';
  } else if (norm.includes('overdue') || norm.includes('rejected') || norm.includes('failed') || norm.includes('cancelled')) {
    style = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (norm.includes('approved') || norm.includes('finalized') || norm.includes('active') || norm.includes('success')) {
    style = 'bg-indigo-50 text-indigo-700 border-indigo-200';
  }

  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border tracking-wide uppercase font-mono ${sizeClasses} ${style}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 fill-current bg-current opacity-70"></span>
      {text || status}
    </span>
  );
};

export default Badge;
