import React from 'react';

export default function ScoreBadge({ score, isPending = false, size = 'md', label = null }) {
  if (isPending || score === null || score === undefined) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
        Assessment Pending
      </span>
    );
  }

  const num = Number(score);

  let colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
  let dotColor = 'bg-rose-500';

  if (num >= 80) {
    colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    dotColor = 'bg-emerald-500';
  } else if (num >= 60) {
    colorClasses = 'bg-sky-50 text-sky-700 border-sky-200';
    dotColor = 'bg-sky-500';
  } else if (num >= 40) {
    colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
    dotColor = 'bg-amber-500';
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base font-bold px-3.5 py-1.5'
  }[size] || 'text-sm px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${colorClasses} ${sizeClasses}`}
    >
      <span className={`w-2 h-2 rounded-full ${dotColor}`} />
      <span>
        {label ? `${label}: ` : ''}
        {num}%
      </span>
    </span>
  );
}
