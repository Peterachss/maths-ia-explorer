import { useId, useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import type { Country } from '../data/schema';
import { useStore } from '../store';
import { copy } from '../copy';
import { SegmentedControl } from './Segmented';

export function SearchBox({ countries }: { countries: Country[] }) {
  const id = useId();
  const [q, setQ] = useState('');
  const select = useStore((s) => s.select);
  const hits = useMemo(
    () => (q.trim() ? countries.filter((c) => c.name.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 6) : []),
    [q, countries]
  );
  return (
    <div className="search">
      <label htmlFor={id} className="visually-hidden">{copy.controls.search}</label>
      <Search size={20} strokeWidth={1.5} aria-hidden="true" />
      <input
        id={id} type="search" value={q} placeholder={copy.controls.searchPlaceholder} autoComplete="off"
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && hits[0]) { select(hits[0].iso3); setQ(''); } if (e.key === 'Escape') setQ(''); }}
      />
      {hits.length > 0 && (
        <ul className="search-hits" role="listbox" aria-label="Matching countries">
          {hits.map((c) => (
            <li key={c.iso3} role="option" aria-selected="false">
              <button type="button" onClick={() => { select(c.iso3); setQ(''); }}>{c.name}</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function SelectionBar({ countries }: { countries: Country[] }) {
  const { selected, toggle, clear, presetAnchors } = useStore();
  return (
    <div className="selection">
      <div className="button-row">
        <button type="button" className="btn primary" onClick={presetAnchors}>{copy.controls.anchors}</button>
        <button type="button" className="btn ghost" onClick={clear} disabled={!selected.length}>{copy.controls.clear}</button>
      </div>
      {selected.length === 0 ? (
        <p className="note">{copy.empty.selection}</p>
      ) : (
        <ul className="chips" aria-label="Selected countries">
          {selected.map((iso) => (
            <li key={iso}>
              <button type="button" className="chip" onClick={() => toggle(iso)} aria-label={`Remove ${countries.find((c) => c.iso3 === iso)?.name ?? iso}`}>
                {countries.find((c) => c.iso3 === iso)?.name ?? iso}
                <X size={16} strokeWidth={1.5} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ModelToggles() {
  const { modelShow, setModelShow, xAxis, setXAxis } = useStore();
  return (
    <div className="toggles">
      <SegmentedControl
        label="Models shown"
        value={modelShow}
        onChange={setModelShow}
        options={[
          { value: 'linear', label: copy.controls.linear },
          { value: 'log', label: copy.controls.log },
          { value: 'both', label: copy.controls.both }
        ]}
      />
      <SegmentedControl
        label="Horizontal axis"
        value={xAxis}
        onChange={setXAxis}
        options={[
          { value: 'linear', label: copy.controls.linearAxis },
          { value: 'log', label: copy.controls.logAxis }
        ]}
      />
    </div>
  );
}
