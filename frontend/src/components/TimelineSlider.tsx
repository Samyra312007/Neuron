import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Snapshot {
  id: string;
  snapshot_date: string;
  index: number;
}

interface Props {
  snapshots: Snapshot[];
  selectedBefore: string | null;
  selectedAfter: string | null;
  onSelectBefore: (id: string) => void;
  onSelectAfter: (id: string) => void;
}

export default function TimelineSlider({
  snapshots,
  selectedBefore,
  selectedAfter,
  onSelectBefore,
  onSelectAfter,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || !snapshots.length) return;

    const width = ref.current.clientWidth || 600;
    const height = 80;
    const margin = 40;
    const innerW = width - margin * 2;
    const dotSpacing = snapshots.length > 1 ? innerW / (snapshots.length - 1) : innerW / 2;

    const svg = d3.select(ref.current).selectAll('svg').data([null]).join('svg')
      .attr('width', width)
      .attr('height', height);
    svg.selectAll('*').remove();

    const g = svg.append('g').attr('transform', `translate(${margin}, 0)`);

    g.append('line')
      .attr('x1', 0)
      .attr('x2', innerW)
      .attr('y1', height / 2)
      .attr('y2', height / 2)
      .attr('stroke', '#374151')
      .attr('stroke-width', 2);

    snapshots.forEach((s, i) => {
      const x = snapshots.length > 1 ? i * dotSpacing : innerW / 2;
      const y = height / 2;
      const isBefore = selectedBefore === s.id;
      const isAfter = selectedAfter === s.id;
      const isSelected = isBefore || isAfter;

      g.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', isSelected ? 10 : 6)
        .attr('fill', isBefore ? '#f59e0b' : isAfter ? '#8b5cf6' : '#1f2937')
        .attr('stroke', isSelected ? '#fff' : '#4b5563')
        .attr('stroke-width', isSelected ? 2 : 1)
        .style('cursor', 'pointer')
        .on('click', () => {
          if (isBefore) onSelectBefore(s.id);
          else if (isAfter) onSelectAfter(s.id);
          else if (!selectedBefore || (selectedBefore && selectedAfter)) onSelectBefore(s.id);
          else onSelectAfter(s.id);
        });

      g.append('text')
        .attr('x', x)
        .attr('y', y + 24)
        .attr('text-anchor', 'middle')
        .attr('fill', isSelected ? '#d1d5db' : '#6b7280')
        .attr('font-size', '10px')
        .text(s.snapshot_date);

      g.append('text')
        .attr('x', x)
        .attr('y', y - 14)
        .attr('text-anchor', 'middle')
        .attr('fill', isSelected ? '#9ca3af' : '#4b5563')
        .attr('font-size', '9px')
        .text(`#${s.index + 1}`);

      if (isBefore) {
        g.append('text')
          .attr('x', x)
          .attr('y', y - 26)
          .attr('text-anchor', 'middle')
          .attr('fill', '#f59e0b')
          .attr('font-size', '9px')
          .attr('font-weight', '700')
          .text('BEFORE');
      }
      if (isAfter) {
        g.append('text')
          .attr('x', x)
          .attr('y', y - 26)
          .attr('text-anchor', 'middle')
          .attr('fill', '#8b5cf6')
          .attr('font-size', '9px')
          .attr('font-weight', '700')
          .text('AFTER');
      }
    });

  }, [snapshots, selectedBefore, selectedAfter, onSelectBefore, onSelectAfter]);

  return <div ref={ref} className="w-full" />;
}
