import { ReactNode } from 'react';
import { cn } from '../lib/utils';

interface AlertBannerProps {
  type: 'info' | 'warning' | 'error' | 'success';
  children: ReactNode;
  className?: string;
}

const colors = {
  info: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  warning: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
  error: 'bg-red-500/10 border-red-500/20 text-red-400',
  success: 'bg-green-500/10 border-green-500/20 text-green-400',
};

export default function AlertBanner({ type, children, className }: AlertBannerProps) {
  return (
    <div className={cn('px-4 py-3 rounded-lg border text-sm', colors[type], className)}>
      {children}
    </div>
  );
}
