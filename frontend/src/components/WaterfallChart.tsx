import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { cssVar, useDark } from '../lib/d3-theme';

interface WaterfallItem {
  label: string;
  value: number;
  color: string;
  suffix?: string;
}

interface Props {
  items: WaterfallItem[];
  total: number;
  totalLabel?: string;
}

export default function WaterfallChart({ items, total, totalLabel = 'Composite' }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const dark = useDark();

  useEffect(() => {
    if (!ref.current || !items.length) return;

    const width = ref.current.clientWidth || 500;
    const height = 40 * (items.length + 1) + 60;
    const margin = { top: 20, right: 60, left: 140, bottom: 20 };
    const innerW = width - margin.left - margin.right;
    const rowH = 36;

    const neutral70 = cssVar('--neutral-70');
    const neutral50 = cssVar('--neutral-50');
    const darkMatter = cssVar('--dark-matter');
    const primary40 = cssVar('--primary-40');

    const svg = d3.select(ref.current).selectAll('svg').data([null]).join('svg')
      .attr('width', width).attr('height', height);
    svg.selectAll('*').remove();

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
    const maxVal = d3.max(items, (d) => d.value) || 1;
    const xScale = d3.scaleLinear().domain([0, maxVal * 1.15]).range([0, innerW]);

    items.forEach((item, i) => {
      const y = i * rowH;
      const barW = xScale(item.value);

      g.append('rect').attr('x', 0).attr('y', y)
        .attr('width', barW).attr('height', rowH - 4).attr('rx', 4)
        .attr('fill', item.color).attr('fill-opacity', 0.7)
        .attr('stroke', item.color).attr('stroke-width', 1);

      g.append('text').attr('x', -8).attr('y', y + (rowH - 4) / 2)
        .attr('text-anchor', 'end').attr('dominant-baseline', 'middle')
        .attr('fill', neutral70).attr('font-size', '12px').text(item.label);

      g.append('text').attr('x', barW + 8).attr('y', y + (rowH - 4) / 2)
        .attr('dominant-baseline', 'middle').attr('fill', item.color)
        .attr('font-size', '12px').attr('font-weight', '600')
        .text(`${item.value.toFixed(1)}${item.suffix || ''}`);
    });

    const totalY = items.length * rowH;
    g.append('line').attr('x1', 0).attr('y1', totalY - 6)
      .attr('x2', innerW).attr('y2', totalY - 6)
      .attr('stroke', neutral50).attr('stroke-dasharray', '4,4');

    const totalW = xScale(total);
    g.append('rect').attr('x', 0).attr('y', totalY)
      .attr('width', totalW).attr('height', rowH - 4).attr('rx', 4)
      .attr('fill', darkMatter).attr('fill-opacity', 0.9);

    g.append('text').attr('x', -8).attr('y', totalY + (rowH - 4) / 2)
      .attr('text-anchor', 'end').attr('dominant-baseline', 'middle')
      .attr('fill', primary40).attr('font-size', '12px')
      .attr('font-weight', '700').text(totalLabel);

    g.append('text').attr('x', totalW + 8).attr('y', totalY + (rowH - 4) / 2)
      .attr('dominant-baseline', 'middle').attr('fill', darkMatter)
      .attr('font-size', '13px').attr('font-weight', '700')
      .text(`${total.toFixed(2)}`);
  }, [items, total, totalLabel, dark]);

  return <div ref={ref} className="w-full" />;
}
