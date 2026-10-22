import { useMemo, useRef } from 'react';
import { Download } from 'lucide-react';

/**
 * A single export menu for a chart figure. PNG and SVG are rendered from the
 * live SVG with computed styles inlined, so CSS variables survive the export.
 * CSV is supplied by the chart itself.
 */
export function ChartExport({ filename, csv }: { filename: string; csv?: string }) {
  const safe = useMemo(() => filename.replace(/[^a-z0-9-]+/gi, '-').toLowerCase(), [filename]);
  const root = useRef<HTMLDetailsElement>(null);
  const figure = () => root.current?.closest('figure') ?? null;

  const svgText = () => {
    const svg = figure()?.querySelector('svg');
    if (!svg) return null;
    const clone = svg.cloneNode(true) as SVGSVGElement;
    const original = svg;
    const source = [original, ...original.querySelectorAll('*')];
    const target = [clone, ...clone.querySelectorAll('*')];
    source.forEach((node, i) => {
      const dest = target[i] as SVGElement | undefined;
      if (!dest) return;
      const cs = getComputedStyle(node);
      for (const prop of ['fill', 'stroke', 'stroke-width', 'stroke-dasharray', 'font-family', 'font-size', 'font-weight', 'opacity', 'paint-order']) {
        const value = cs.getPropertyValue(prop);
        if (value && value !== 'none') dest.style.setProperty(prop, value);
      }
    });
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const vb = clone.getAttribute('viewBox')?.split(' ').map(Number);
    if (vb && vb.length === 4) {
      clone.setAttribute('width', String(vb[2]));
      clone.setAttribute('height', String(vb[3]));
    }
    return new XMLSerializer().serializeToString(clone);
  };

  const download = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const exportSvg = () => {
    const text = svgText();
    if (text) download(new Blob([text], { type: 'image/svg+xml' }), `${safe}.svg`);
  };

  const exportPng = () => {
    const text = svgText();
    if (!text) return;
    const svg = figure()?.querySelector('svg');
    const vb = svg?.viewBox.baseVal;
    const width = vb?.width || 1040;
    const height = vb?.height || 680;
    const image = new Image();
    const url = URL.createObjectURL(new Blob([text], { type: 'image/svg+xml' }));
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width * 2;
      canvas.height = height * 2;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(2, 2);
      ctx.drawImage(image, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (blob) download(blob, `${safe}.png`);
        URL.revokeObjectURL(url);
      }, 'image/png');
    };
    image.src = url;
  };

  const exportCsv = () => {
    if (csv) download(new Blob([csv], { type: 'text/csv;charset=utf-8' }), `${safe}.csv`);
  };

  return (
    <details className="export" ref={root}>
      <summary><Download size={14} strokeWidth={1.8} aria-hidden="true" /> Export</summary>
      <div className="export-menu">
        <button type="button" onClick={exportPng}>PNG</button>
        <button type="button" onClick={exportSvg}>SVG</button>
        {csv && <button type="button" onClick={exportCsv}>CSV</button>}
      </div>
    </details>
  );
}

/** A screen-reader table that mirrors the plotted values. */
export function ChartData({
  caption,
  columns,
  rows
}: {
  caption: string;
  columns: string[];
  rows: (string | number)[][];
}) {
  return (
    <div className="visually-hidden">
      <table>
        <caption>{caption}</caption>
      <thead><tr>{columns.map((c) => <th key={c} scope="col">{c}</th>)}</tr></thead>
        <tbody>{rows.map((row, i) => (
          <tr key={i}>{row.map((cell, j) => j === 0 ? <th key={j} scope="row">{cell}</th> : <td key={j}>{cell}</td>)}</tr>
        ))}</tbody>
      </table>
    </div>
  );
}
