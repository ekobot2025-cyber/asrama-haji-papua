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
  badge?: string;
  onClick?: () => void;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  colorScheme = 'emerald',
  badge,
  onClick,
}) => {
  const schemes = {
    emerald: {
      borderHover: 'hover:border-emerald-300',
      topLine: 'bg-emerald-600',
      iconBox: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
      badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    amber: {
      borderHover: 'hover:border-amber-300',
      topLine: 'bg-amber-500',
      iconBox: 'bg-amber-50 text-amber-800 border-amber-200/80',
      badge: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    blue: {
      borderHover: 'hover:border-blue-300',
      topLine: 'bg-blue-600',
      iconBox: 'bg-blue-50 text-blue-800 border-blue-200/80',
      badge: 'bg-blue-50 text-blue-800 border-blue-200',
    },
    purple: {
      borderHover: 'hover:border-purple-300',
      topLine: 'bg-purple-600',
      iconBox: 'bg-purple-50 text-purple-800 border-purple-200/80',
      badge: 'bg-purple-50 text-purple-800 border-purple-200',
    },
    rose: {
      borderHover: 'hover:border-rose-300',
      topLine: 'bg-rose-600',
      iconBox: 'bg-rose-50 text-rose-800 border-rose-200/80',
      badge: 'bg-rose-50 text-rose-800 border-rose-200',
    },
    slate: {
      borderHover: 'hover:border-slate-400',
      topLine: 'bg-slate-700',
      iconBox: 'bg-slate-100 text-slate-800 border-slate-200',
      badge: 'bg-slate-100 text-slate-700 border-slate-200',
    },
  };

  const scheme = schemes[colorScheme];

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl bg-white p-4 sm:p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group ${
        scheme.borderHover
      } ${onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''}`}
    >
      {/* Top subtle color indicator line */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${scheme.topLine} opacity-80 group-hover:opacity-100 transition-opacity`} />

      <div>
        <div className="flex items-start justify-between gap-2">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
            {title}
          </p>
          <div className={`p-2 rounded-xl border shadow-2xs shrink-0 ${scheme.iconBox}`}>
            <Icon className="w-4 h-4 stroke-[2.2]" />
          </div>
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {value}
          </h3>
          {trend && (
            <span className={`inline-flex items-center text-[10px] font-black px-1.5 py-0.5 rounded-full border ${
              trend.isPositive ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}>
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </span>
          )}
          {badge && (
            <span className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${scheme.badge}`}>
              {badge}
            </span>
          )}
        </div>
      </div>

      {subtitle && (
        <p className="text-[11px] text-slate-500 mt-2 font-medium truncate">
          {subtitle}
        </p>
      )}
    </div>
  );
};
