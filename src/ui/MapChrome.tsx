import { LocateFixed, Minus, MousePointer2, Plus } from 'lucide-react';
import type { RefObject } from 'react';
import type { ViewCommand } from '../three/view';
import { copy } from '../copy';

/** Google Earth style map chrome: zoom, recentre, a scale legend and credits. */
export function MapChrome({ view, onReset }: { view: RefObject<ViewCommand>; onReset: () => void }) {
  const zoom = (factor: number) => {
    if (view.current) view.current.zoom = factor;
  };
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

      <div className="map-legend" aria-label={copy.map.legend}>
        <span className="map-legend-title">{copy.map.legend}</span>
        <span className="map-legend-bar" aria-hidden="true" />
        <span className="map-legend-range"><span>{copy.map.low}</span><span>{copy.map.high}</span></span>
      </div>

      <p className="map-hint">
        <MousePointer2 size={13} aria-hidden="true" />
        <span className="hint-desktop">{copy.map.hint}</span>
        <span className="hint-touch">{copy.map.hintTouch}</span>
      </p>
      <p className="map-attribution">{copy.map.imagery}</p>
    </>
  );
}
