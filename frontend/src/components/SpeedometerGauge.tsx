import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { cssVar, useDark } from '../lib/d3-theme';

interface Props {
  value: number;
  label: string;
  color?: string;
  min?: number;
  max?: number;
}

export default function SpeedometerGauge({ value, label, color = '#00b8f0', min = 0, max = 1 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const dark = useDark();

  useEffect(() => {
    if (!ref.current) return;

    const width = ref.current.clientWidth || 280;
    const height = 200;
    const radius = Math.min(width, height * 1.2) / 2;
    const arcWidth = 20;
    const pct = Math.min(Math.max((value - min) / (max - min), 0), 1);

    const neutral30 = cssVar('--neutral-30');
    const neutral10 = cssVar('--neutral-10');
    const neutral60 = cssVar('--neutral-60');

    const svg = d3.select(ref.current).selectAll('svg').data([null]).join('svg')
      .attr('width', width).attr('height', height);
    svg.selectAll('*').remove();

    const g = svg.append('g').attr('transform', `translate(${width / 2},${height * 0.75})`);

    const arc = d3.arc<{ endAngle: number }>()
      .innerRadius(radius - arcWidth).outerRadius(radius)
      .startAngle(-Math.PI * 0.75).cornerRadius(4);

    const totalAngle = Math.PI * 1.5;

    const bg = d3.arc<unknown>()
      .innerRadius(radius - arcWidth).outerRadius(radius)
      .startAngle(-Math.PI * 0.75).endAngle(Math.PI * 0.75).cornerRadius(4);

    g.append('path').attr('d', bg as any).attr('fill', neutral30);

    const angle = -Math.PI * 0.75 + totalAngle * pct;
    g.append('path').attr('d', arc({ endAngle: angle }) as any).attr('fill', color);

    g.append('line')
      .attr('x1', 0).attr('y1', 0)
      .attr('x2', radius * 0.75 * Math.cos(angle - Math.PI * 0.75))
      .attr('y2', -(radius - arcWidth / 2) * Math.sin(angle - Math.PI * 0.75))
      .attr('stroke', color).attr('stroke-width', 3).attr('stroke-linecap', 'round');

    g.append('circle').attr('cx', 0).attr('cy', 0).attr('r', 6).attr('fill', color);

    g.append('text').attr('y', -20).attr('text-anchor', 'middle')
      .attr('fill', neutral10).attr('font-size', '28px')
      .attr('font-weight', '700').text(Math.round(pct * 100));

    g.append('text').attr('y', 18).attr('text-anchor', 'middle')
      .attr('fill', neutral60).attr('font-size', '12px').text(label);
  }, [value, label, color, min, max, dark]);

  return <div ref={ref} className="w-full" style={{ minHeight: 200 }} />;
}
