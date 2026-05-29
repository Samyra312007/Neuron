import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { TreemapItem } from '../types';
import { formatCurrency } from '../lib/utils';
import { cssVar, useDark } from '../lib/d3-theme';

interface Props {
  data: TreemapItem[];
  onItemClick?: (item: TreemapItem) => void;
}

export default function DarkMatterTreemap({ data, onItemClick }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const dark = useDark();

  useEffect(() => {
    if (!ref.current || !data.length) return;

    const width = ref.current.clientWidth;
    const height = 400;

    const neutral10 = cssVar('--neutral-10');
    const neutral60 = cssVar('--neutral-60');
    const neutral30 = cssVar('--neutral-30');
    const healthFunctional = cssVar('--health-functional');

    const svg = d3.select(ref.current).selectAll('svg').data([null]).join('svg')
      .attr('width', width).attr('height', height);
    svg.selectAll('*').remove();

    const root = d3.hierarchy({ children: data })
      .sum(d => (d as unknown as TreemapItem).value || 1);

    d3.treemap<unknown>().size([width, height]).padding(4)(root as any);

    const cell = svg.selectAll('g')
      .data(root.leaves()).join('g')
      .attr('transform', d => `translate(${(d as any).x0},${(d as any).y0})`);

    const cellG = cell.append('rect')
      .attr('width', d => (d as any).x1 - (d as any).x0)
      .attr('height', d => (d as any).y1 - (d as any).y0)
      .attr('fill', d => (d.data as unknown as TreemapItem).color)
      .attr('fill-opacity', 0.7).attr('rx', 4)
      .attr('stroke', neutral30).attr('stroke-width', 2)
      .style('cursor', onItemClick ? 'pointer' : 'default');

    if (onItemClick) {
      cellG.on('click', (_: any, d: any) => {
        onItemClick(d.data as unknown as TreemapItem);
      });
    }

    cell.append('text').attr('x', 8).attr('y', 20)
      .attr('fill', neutral10).attr('font-size', '13px').attr('font-weight', '600')
      .text(d => (d.data as unknown as TreemapItem).label);

    cell.append('text').attr('x', 8).attr('y', 38)
      .attr('fill', neutral60).attr('font-size', '11px')
      .text(d => {
        const item = d.data as unknown as TreemapItem;
        return `${item.value}h`;
      });

    cell.append('text').attr('x', 8).attr('y', 54)
      .attr('fill', healthFunctional).attr('font-size', '11px')
      .attr('font-weight', '500')
      .text(d => {
        const item = d.data as unknown as TreemapItem;
        return formatCurrency(item.cost);
      });
  }, [data, dark]);

  return <div ref={ref} className="w-full" style={{ minHeight: 400 }} />;
}
