import { cn } from '../lib/utils';

interface IconProps {
  name: string;
  size?: number;
  className?: string;
  fill?: boolean;
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700;
  style?: React.CSSProperties;
}

export default function Icon({ name, size = 24, className, fill, weight = 400, style }: IconProps) {
  return (
    <span
      className={cn('material-symbols-outlined select-none', fill && 'icon-fill', className)}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' ${weight}, 'GRAD' 0, 'opsz' 24`,
        ...style,
      }}
    >
      {name}
    </span>
  );
}
