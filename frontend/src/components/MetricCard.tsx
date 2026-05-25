import { cn } from '../lib/utils';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
  className?: string;
}

export default function MetricCard({ title, value, subtitle, icon, color, className }: MetricCardProps) {
  return (
    <div className={cn('neuron-card', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <p className="text-2xl font-bold mt-1" style={color ? { color } : undefined}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
    </div>
  );
}
