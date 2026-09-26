import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  colorScheme?: 'emerald' | 'amber' | 'blue' | 'purple' | 'rose' | 'slate';
  onClick?: () => void;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  colorScheme = 'emerald',
  onClick,
}) => {
  const schemes = {
    emerald: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-100',
      iconBg: 'bg-emerald-800 text-white',
      accent: 'border-l-emerald-700',
    },
    amber: {
      bg: 'bg-amber-50 text-amber-900 border-amber-100',
      iconBg: 'bg-amber-600 text-white',
      accent: 'border-l-amber-500',
    },
    blue: {
      bg: 'bg-blue-50 text-blue-900 border-blue-100',
      iconBg: 'bg-blue-600 text-white',
      accent: 'border-l-blue-600',
    },
    purple: {
      bg: 'bg-purple-50 text-purple-900 border-purple-100',
      iconBg: 'bg-purple-600 text-white',
      accent: 'border-l-purple-600',
    },
    rose: {
      bg: 'bg-rose-50 text-rose-900 border-rose-100',
      iconBg: 'bg-rose-600 text-white',
      accent: 'border-l-rose-600',
    },
    slate: {
      bg: 'bg-slate-50 text-slate-900 border-slate-200',
      iconBg: 'bg-slate-700 text-white',
      accent: 'border-l-slate-600',
    },
  };

  const scheme = schemes[colorScheme];

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 border-l-4 ${scheme.accent} ${
        onClick ? 'cursor-pointer hover:border-slate-300' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">{value}</h3>
          {subtitle && <p className="text-[11px] text-slate-500 mt-1 font-medium">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl shadow-xs ${scheme.iconBg}`}>
          <Icon className="w-5 h-5 stroke-[2]" />
        </div>
      </div>

      {trend && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-1.5 text-xs">
          <span className={`font-semibold ${trend.isPositive ? 'text-emerald-700' : 'text-rose-600'}`}>
            {trend.value}
          </span>
          <span className="text-slate-400 text-[11px]">dibandingkan bulan lalu</span>
        </div>
      )}
    </div>
  );
};
