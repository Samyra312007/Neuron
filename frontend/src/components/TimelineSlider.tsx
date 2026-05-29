import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { cssVar, useDark } from '../lib/d3-theme';

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
  snapshots, selectedBefore, selectedAfter, onSelectBefore, onSelectAfter,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const dark = useDark();

  useEffect(() => {
    if (!ref.current || !snapshots.length) return;

    const width = ref.current.clientWidth || 600;
    const height = 80;
    const margin = 40;
    const innerW = width - margin * 2;
    const dotSpacing = snapshots.length > 1 ? innerW / (snapshots.length - 1) : innerW / 2;

    const neutral30 = cssVar('--neutral-30');
    const neutral20 = cssVar('--neutral-20');
    const surfaceLowest = cssVar('--surface-lowest');
    const neutral50 = cssVar('--neutral-50');
    const neutral70 = cssVar('--neutral-70');
    const neutral60 = cssVar('--neutral-60');
    const healthFunctional = cssVar('--health-functional');
    const darkMatter = cssVar('--dark-matter');

    const svg = d3.select(ref.current).selectAll('svg').data([null]).join('svg')
      .attr('width', width).attr('height', height);
    svg.selectAll('*').remove();

    const g = svg.append('g').attr('transform', `translate(${margin}, 0)`);

    g.append('line').attr('x1', 0).attr('x2', innerW)
      .attr('y1', height / 2).attr('y2', height / 2)
      .attr('stroke', neutral30).attr('stroke-width', 2);

    snapshots.forEach((s, i) => {
      const x = snapshots.length > 1 ? i * dotSpacing : innerW / 2;
      const y = height / 2;
      const isBefore = selectedBefore === s.id;
      const isAfter = selectedAfter === s.id;
      const isSelected = isBefore || isAfter;

      g.append('circle').attr('cx', x).attr('cy', y)
        .attr('r', isSelected ? 10 : 6)
        .attr('fill', isBefore ? healthFunctional : isAfter ? darkMatter : neutral20)
        .attr('stroke', isSelected ? surfaceLowest : neutral50)
        .attr('stroke-width', isSelected ? 2 : 1)
        .style('cursor', 'pointer')
        .on('click', () => {
          if (isBefore) onSelectBefore(s.id);
          else if (isAfter) onSelectAfter(s.id);
          else if (!selectedBefore || (selectedBefore && selectedAfter)) onSelectBefore(s.id);
          else onSelectAfter(s.id);
        });

      g.append('text').attr('x', x).attr('y', y + 24)
        .attr('text-anchor', 'middle')
        .attr('fill', isSelected ? neutral70 : neutral60)
        .attr('font-size', '10px').text(s.snapshot_date);

      g.append('text').attr('x', x).attr('y', y - 14)
        .attr('text-anchor', 'middle')
        .attr('fill', isSelected ? neutral60 : neutral50)
        .attr('font-size', '9px').text(`#${s.index + 1}`);

      if (isBefore) {
        g.append('text').attr('x', x).attr('y', y - 26)
          .attr('text-anchor', 'middle').attr('fill', healthFunctional)
          .attr('font-size', '9px').attr('font-weight', '700').text('BEFORE');
      }
      if (isAfter) {
        g.append('text').attr('x', x).attr('y', y - 26)
          .attr('text-anchor', 'middle').attr('fill', darkMatter)
          .attr('font-size', '9px').attr('font-weight', '700').text('AFTER');
      }
    });
  }, [snapshots, selectedBefore, selectedAfter, onSelectBefore, onSelectAfter, dark]);

  return <div ref={ref} className="w-full" />;
}
