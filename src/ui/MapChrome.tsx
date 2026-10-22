import { LocateFixed, Minus, Plus } from 'lucide-react';
import type { RefObject } from 'react';
import type { Country } from '../data/schema';
import type { ViewCommand } from '../three/view';
import { useStore } from '../store';
import { copy } from '../copy';

/** Google Earth style map chrome: tools, a legend, the selected gap and credits. */
export function MapChrome({
  countries,
  view,
  onReset,
  gap
}: {
  countries: Country[];
  view: RefObject<ViewCommand>;
  onReset: () => void;
  gap?: number;
}) {
  const selected = useStore((s) => s.selected);
  const lives = countries.map((c) => c.life);
  const low = Math.min(...lives);
  const high = Math.max(...lives);
  const selectedNames = selected
    .map((iso) => countries.find((c) => c.iso3 === iso)?.name)
    .filter(Boolean) as string[];
  const zoom = (factor: number) => {
    if (view.current) view.current.zoom = factor;
  };
  const ticks = [55, 65, 75, 85];
  return (
    <>
      <div className="map-tools" role="group" aria-label="Map controls">
        <button type="button" aria-label={copy.map.zoomIn} onClick={() => zoom(0.72)}>
          <Plus size={18} aria-hidden="true" />
        </button>
        <button type="button" aria-label={copy.map.zoomOut} onClick={() => zoom(1.38)}>
          <Minus size={18} aria-hidden="true" />
        </button>
        <button type="button" aria-label={copy.map.reset} onClick={onReset}>
          <LocateFixed size={17} aria-hidden="true" />
        </button>
      </div>

      <div className="map-legend" aria-label={`${copy.map.legend}, ${low.toFixed(1)} to ${high.toFixed(1)} years`}>
        <span className="map-legend-title">{copy.map.legend}</span>
        <span className="map-legend-bar" aria-hidden="true" />
        <span className="map-legend-ticks" aria-hidden="true">
          {ticks.map((t) => <span key={t} style={{ left: `${((t - low) / (high - low)) * 100}%` }}>{t}</span>)}
        </span>
        {selectedNames.length > 0 && <span className="map-legend-selected">Selected: {selectedNames.join(' / ')}</span>}
      </div>

      {gap !== undefined && (
        <p className="map-gap" aria-label={`Observed gap ${gap.toFixed(1)} years`}>
          <strong>{gap.toFixed(1)} years apart</strong>
          <span>Zimbabwe to Singapore</span>
        </p>
      )}

      <p className="map-hint">
        <span className="hint-desktop">{copy.map.hint}</span>
        <span className="hint-touch">{copy.map.hintTouch}</span>
      </p>
      <p className="map-attribution">{copy.map.imagery}</p>
    </>
  );
}
