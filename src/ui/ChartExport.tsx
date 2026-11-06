import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, Maximize2, Minimize2 } from 'lucide-react';

/**
 * A single export menu for a chart figure. PNG and SVG are rendered from the
 * live SVG with computed styles inlined, so CSS variables survive the export.
 * CSV is supplied by the chart itself.
 */
export function ChartExport({ filename, csv }: { filename: string; csv?: string }) {
  const safe = useMemo(() => filename.replace(/[^a-z0-9-]+/gi, '-').toLowerCase(), [filename]);
  const root = useRef<HTMLDetailsElement>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [canFullscreen, setCanFullscreen] = useState(false);
  const figure = () => root.current?.closest('figure') ?? null;
  useEffect(() => {
    setCanFullscreen(Boolean(document.fullscreenEnabled));
    const onChange = () => setFullscreen(document.fullscreenElement === figure());
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);
  const toggleFullscreen = async () => {
    const fig = figure();
    if (!fig) return;
    try {
      if (document.fullscreenElement === fig) await document.exitFullscreen();
      else await fig.requestFullscreen();
    } catch {
      setFullscreen(false);
    }
  };
  // The figure also contains the export trigger's Lucide icon, so target the
  // chart SVG by its role instead of taking the first <svg> descendant.
  const chartSvg = () => figure()?.querySelector<SVGSVGElement>('svg[role="group"], svg[role="img"]') ?? null;
  const background = () =>
    getComputedStyle(document.documentElement).getPropertyValue('--surface-0').trim() || '#0d1015';

  const svgText = () => {
    const svg = chartSvg();
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
    // Give exported figures the same dark card background as the app so the
    // light chart type stays readable when the SVG or PNG is opened elsewhere.
    const backdrop = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    backdrop.setAttribute('x', '0');
    backdrop.setAttribute('y', '0');
    backdrop.setAttribute('width', '100%');
    backdrop.setAttribute('height', '100%');
    backdrop.setAttribute('fill', background());
    clone.insertBefore(backdrop, clone.firstChild);
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
    const svg = chartSvg();
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
      ctx.fillStyle = background();
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
    <>
      {canFullscreen && (
        <button
          type="button"
          className="chart-fullscreen"
          onClick={toggleFullscreen}
          aria-label={fullscreen ? 'Exit chart full screen' : 'View chart full screen'}
          title={fullscreen ? 'Exit full screen' : 'View full screen'}
        >
          {fullscreen ? <Minimize2 size={14} strokeWidth={1.8} aria-hidden="true" /> : <Maximize2 size={14} strokeWidth={1.8} aria-hidden="true" />}
        </button>
      )}
      <details className="export" ref={root}>
        <summary aria-label="Export chart"><Download size={14} strokeWidth={1.8} aria-hidden="true" /> <span className="export-label">Export</span></summary>
        <div className="export-menu">
          <button type="button" onClick={exportPng}>PNG</button>
          <button type="button" onClick={exportSvg}>SVG</button>
          {csv && <button type="button" onClick={exportCsv}>CSV</button>}
        </div>
      </details>
    </>
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
