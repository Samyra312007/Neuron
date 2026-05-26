import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Gene {
  label: string;
  score: number;
  color: string;
}

interface Props {
  genes: Gene[];
  previousGenes?: Gene[];
}

export default function DNAHelix({ genes, previousGenes }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || !genes.length) return;

    const width = ref.current.clientWidth;
    const height = 300;
    const centerX = width / 2;
    const amplitude = Math.min(120, width * 0.15);
    const frequency = 0.012;
    const rungs = genes.length;
    const spacing = height / (rungs + 1);

    const svg = d3.select(ref.current).selectAll('svg').data([null]).join('svg')
      .attr('width', width)
      .attr('height', height);
    svg.selectAll('*').remove();

    const strandData = d3.range(0, height, 2).map(y => ({
      y,
      x1: centerX - amplitude * Math.sin(y * frequency),
      x2: centerX + amplitude * Math.sin(y * frequency),
    }));

    const lineLeft = d3.line<{ y: number; x1: number }>()
      .x(d => d.x1)
      .y(d => d.y)
      .curve(d3.curveBasis);

    const lineRight = d3.line<{ y: number; x2: number }>()
      .x(d => d.x2)
      .y(d => d.y)
      .curve(d3.curveBasis);

    svg.append('path')
      .datum(strandData)
      .attr('d', lineLeft as any)
      .attr('fill', 'none')
      .attr('stroke', '#4b5563')
      .attr('stroke-width', 3);

    svg.append('path')
      .datum(strandData)
      .attr('d', lineRight as any)
      .attr('fill', 'none')
      .attr('stroke', '#4b5563')
      .attr('stroke-width', 3);

    genes.forEach((gene, i) => {
      const y = (i + 1) * spacing;
      const sinVal = Math.sin(y * frequency);
      const x1 = centerX - amplitude * sinVal;
      const x2 = centerX + amplitude * sinVal;

      const prev = previousGenes?.[i];

      svg.append('line')
        .attr('x1', x1)
        .attr('y1', y)
        .attr('x2', x2)
        .attr('y2', y)
        .attr('stroke', gene.color)
        .attr('stroke-width', 4)
        .attr('stroke-opacity', gene.score)
        .attr('stroke-linecap', 'round');

      if (prev) {
        const prevSinVal = Math.sin(y * frequency);
        const prevX1 = centerX - amplitude * prevSinVal;
        const prevX2 = centerX + amplitude * prevSinVal;
        svg.append('line')
          .attr('x1', prevX1)
          .attr('y1', y + 8)
          .attr('x2', prevX2)
          .attr('y2', y + 8)
          .attr('stroke', gene.color)
          .attr('stroke-width', 2)
          .attr('stroke-opacity', 0.3)
          .attr('stroke-linecap', 'round')
          .attr('stroke-dasharray', '4,3');
      }

      const labelX = x1 < centerX ? x1 - 8 : x2 + 8;
      const anchor = x1 < centerX ? 'end' : 'start';
      const scoreLabelX = x1 < centerX ? x2 + 8 : x1 - 8;
      const scoreAnchor = x1 < centerX ? 'start' : 'end';

      svg.append('text')
        .attr('x', labelX)
        .attr('y', y + 4)
        .attr('text-anchor', anchor)
        .attr('fill', '#9ca3af')
        .attr('font-size', '11px')
        .text(gene.label);

      const scoreText = svg.append('text')
        .attr('x', scoreLabelX)
        .attr('y', y + 4)
        .attr('text-anchor', scoreAnchor)
        .attr('fill', gene.color)
        .attr('font-size', '12px')
        .attr('font-weight', '700')
        .text(`${Math.round(gene.score * 100)}%`);

      if (prev) {
        const diff = gene.score - prev.score;
        const diffColor = diff > 0 ? '#10b981' : diff < 0 ? '#ef4444' : '#6b7280';
        svg.append('text')
          .attr('x', scoreLabelX)
          .attr('y', y + 20)
          .attr('text-anchor', scoreAnchor)
          .attr('fill', diffColor)
          .attr('font-size', '10px')
          .attr('font-weight', '500')
          .text(`${diff > 0 ? '+' : ''}${(diff * 100).toFixed(0)}%`);
      }
    });

  }, [genes, previousGenes]);

  return <div ref={ref} className="w-full" style={{ minHeight: 300 }} />;
}
