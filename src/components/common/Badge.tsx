import React from 'react';
import { getStatusColor } from '../../utils/formatters';

interface BadgeProps {
  status: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  status,
  label,
  size = 'md',
  showDot = true,
  className = '',
}) => {
  const colors = getStatusColor(status);

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3 py-1.5 font-semibold',
  };

  const dotSize = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  const displayLabel = label || status.replace(/_/g, ' ');

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${colors.bg} ${colors.text} ${colors.border} ${sizeClasses[size]} tracking-wide ${className}`}
    >
      {showDot && <span className={`rounded-full ${colors.dot} ${dotSize[size]}`} />}
      {displayLabel}
    </span>
  );
};
