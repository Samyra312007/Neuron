import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface HeatmapItem {
  team: string;
  metrics: { label: string; value: number; color: string }[];
}

interface Props {
  data: HeatmapItem[];
}

export default function CognitiveHeatmap({ data }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || data.length === 0) return;

    const width = ref.current.clientWidth || 600;
    const margin = { top: 30, right: 10, bottom: 80, left: 100 };
    const innerWidth = width - margin.left - margin.right;

    const teams = data.map((d) => d.team);
    const metrics = data[0]?.metrics.map((m) => m.label) || [];
    const cellW = innerWidth / metrics.length;
    const cellH = 40;
    const height = margin.top + teams.length * cellH + margin.bottom;

    const svg = d3.select(ref.current).selectAll('svg').data([null]).join('svg')
      .attr('width', width)
      .attr('height', height);
    svg.selectAll('*').remove();

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const colorScale = d3.scaleSequential(d3.interpolateOrRd).domain([0, 1]);

    teams.forEach((team, i) => {
      const row = data.find((d) => d.team === team);
      if (!row) return;
      row.metrics.forEach((m, j) => {
        const x = j * cellW;
        const y = i * cellH;
        g.append('rect')
          .attr('x', x)
          .attr('y', y)
          .attr('width', cellW - 2)
          .attr('height', cellH - 2)
          .attr('rx', 4)
          .attr('fill', m.color || colorScale(m.value))
          .attr('stroke', '#1f2937')
          .attr('stroke-width', 1);

        g.append('text')
          .attr('x', x + (cellW - 2) / 2)
          .attr('y', y + (cellH - 2) / 2)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('fill', m.value > 0.5 ? '#fff' : '#374151')
          .attr('font-size', '11px')
          .attr('font-weight', '600')
          .text(`${Math.round(m.value * 100)}%`);
      });
    });

    g.selectAll('.y-label')
      .data(teams)
      .join('text')
      .attr('class', 'y-label')
      .attr('x', -8)
      .attr('y', (_: string, i: number) => i * cellH + cellH / 2)
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle')
      .attr('fill', '#d1d5db')
      .attr('font-size', '12px')
      .text((d: string) => d);

    g.selectAll('.x-label')
      .data(metrics)
      .join('text')
      .attr('class', 'x-label')
      .attr('x', (_: string, i: number) => i * cellW + (cellW - 2) / 2)
      .attr('y', teams.length * cellH + 16)
      .attr('text-anchor', 'end')
      .attr('transform', (_: string, i: number) => `rotate(-35, ${i * cellW + (cellW - 2) / 2}, ${teams.length * cellH + 16})`)
      .attr('fill', '#9ca3af')
      .attr('font-size', '11px')
      .text((d: string) => d);

    const legendW = 200;
    const legendH = 12;
    const legendX = width - margin.right - legendW;
    const legendY = height - 30;

    const defs = svg.append('defs');
    const lg = defs.append('linearGradient').attr('id', 'heatmap-legend');
    lg.append('stop').attr('offset', '0%').attr('stop-color', d3.interpolateOrRd(0));
    lg.append('stop').attr('offset', '50%').attr('stop-color', d3.interpolateOrRd(0.5));
    lg.append('stop').attr('offset', '100%').attr('stop-color', d3.interpolateOrRd(1));

    svg.append('rect')
      .attr('x', legendX)
      .attr('y', legendY)
      .attr('width', legendW)
      .attr('height', legendH)
      .attr('rx', 4)
      .attr('fill', 'url(#heatmap-legend)');

    svg.append('text')
      .attr('x', legendX)
      .attr('y', legendY - 4)
      .attr('fill', '#9ca3af')
      .attr('font-size', '10px')
      .text('Low');

    svg.append('text')
      .attr('x', legendX + legendW)
      .attr('y', legendY - 4)
      .attr('text-anchor', 'end')
      .attr('fill', '#9ca3af')
      .attr('font-size', '10px')
      .text('High');
  }, [data]);

  return <div ref={ref} className="w-full overflow-x-auto" />;
}
