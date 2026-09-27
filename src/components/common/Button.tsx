import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'amber' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const variants = {
    primary: 'bg-gradient-to-r from-[#c9a961] to-[#b8941e] hover:from-[#d8b870] hover:to-[#c9a961] text-white font-bold shadow-sm hover:shadow-[#c9a961]/30 focus:ring-[#c9a961]',
    secondary: 'bg-[#fbf8ee] hover:bg-[#f4ebd0] text-[#8a6d2b] border border-[#e8dfc8] focus:ring-[#c9a961]',
    outline: 'bg-transparent border border-[#e8dfc8] text-[#1A1410] hover:bg-[#fbf8ee] hover:border-[#c9a961] focus:ring-[#c9a961]',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus:ring-rose-500',
    amber: 'bg-gradient-to-r from-[#c9a961] to-[#b8941e] hover:from-[#d8b870] hover:to-[#c9a961] text-[#1A1410] font-bold shadow-sm focus:ring-[#c9a961]',
    ghost: 'bg-transparent hover:bg-[#fbf8ee] text-[#7a6122] focus:ring-[#c9a961]',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-5 py-3 gap-2.5',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      {children}
    </button>
  );
};
