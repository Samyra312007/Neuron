import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { BubbleItem } from '../types';
import { cssVar, useDark } from '../lib/d3-theme';

interface Props {
  data: BubbleItem[];
}

export default function SpreadBubble({ data }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const dark = useDark();

  useEffect(() => {
    if (!ref.current || !data.length) return;

    const width = ref.current.clientWidth;
    const height = 350;

    const neutral10 = cssVar('--neutral-10');
    const neutral30 = cssVar('--neutral-30');

    const svg = d3.select(ref.current).selectAll('svg').data([null]).join('svg')
      .attr('width', width).attr('height', height);
    svg.selectAll('*').remove();

    const pack = d3.pack<unknown>().size([width - 40, height - 40]).padding(20);
    const root = d3.hierarchy({ children: data })
      .sum(d => (d as unknown as BubbleItem).value || 1);

    const nodes = pack(root as any).leaves();
    const g = svg.append('g').attr('transform', 'translate(20,20)');

    g.selectAll('circle').data(nodes).join('circle')
      .attr('cx', d => d.x).attr('cy', d => d.y).attr('r', d => d.r)
      .attr('fill', d => (d.data as unknown as BubbleItem).color)
      .attr('fill-opacity', 0.6).attr('stroke', neutral30)
      .attr('stroke-width', 2).append('title')
      .text(d => {
        const item = d.data as unknown as BubbleItem;
        return `${item.label}: ${item.severity} (score: ${item.value})`;
      });

    g.selectAll('text').data(nodes).join('text')
      .attr('x', d => d.x).attr('y', d => d.y)
      .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
      .attr('fill', neutral10).attr('font-size', d => Math.max(10, d.r / 4))
      .attr('font-weight', '600')
      .text(d => {
        const item = d.data as unknown as BubbleItem;
        return item.label.length > 15 ? item.label.slice(0, 14) + '\u2026' : item.label;
      });
  }, [data, dark]);

  return <div ref={ref} className="w-full" style={{ minHeight: 350 }} />;
}
