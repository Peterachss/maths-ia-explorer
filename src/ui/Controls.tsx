import { useEffect, useId, useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import type { Country } from '../data/schema';
import { useStore } from '../store';
import { copy } from '../copy';
import { SegmentedControl } from './Segmented';

export function SearchBox({ countries }: { countries: Country[] }) {
  const id = useId();
  const listId = `${id}-list`;
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const select = useStore((s) => s.select);
  const hits = useMemo(
    () => q.trim() ? countries.filter((c) =>
      c.name.toLowerCase().includes(q.trim().toLowerCase()) ||
      c.iso3.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 6) : [],
    [q, countries]
  );
  useEffect(() => setActive(0), [q]);

  const choose = (iso3: string) => {
    select(iso3);
    setQ('');
    setOpen(false);
    setActive(0);
  };
  const expanded = open && Boolean(q.trim());

  return (
    <div className="search" onBlur={(e) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
    }}>
      <label htmlFor={id} className="visually-hidden">{copy.controls.search}</label>
      <Search size={18} strokeWidth={1.6} aria-hidden="true" />
      <input
        id={id}
        type="search"
        value={q}
        placeholder={copy.controls.searchPlaceholder}
        autoComplete="off"
        role="combobox"
        aria-expanded={expanded}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={expanded && hits[active] ? `${id}-opt-${hits[active].iso3}` : undefined}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' && hits.length) {
            e.preventDefault();
            setOpen(true);
            setActive((i) => Math.min(hits.length - 1, i + 1));
          } else if (e.key === 'ArrowUp' && hits.length) {
            e.preventDefault();
            setOpen(true);
            setActive((i) => Math.max(0, i - 1));
          } else if (e.key === 'Enter' && expanded && hits[active]) {
            e.preventDefault();
            choose(hits[active].iso3);
          } else if (e.key === 'Escape') {
            setQ('');
            setOpen(false);
          }
        }}
      />
      {expanded && (
        <ul className="search-hits" id={listId} role="listbox" aria-label="Matching countries">
          {hits.map((c, i) => (
            <li
              key={c.iso3}
              id={`${id}-opt-${c.iso3}`}
              role="option"
              aria-selected={i === active}
              className={i === active ? 'active' : ''}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setActive(i)}
              onClick={() => choose(c.iso3)}
            >
              <span>{c.name}</span>
              <span className="hit-iso">{c.iso3}</span>
            </li>
          ))}
          {hits.length === 0 && (
            <li className="search-empty" role="presentation">
              No countries match “{q}”. Try a country name or code.
            </li>
          )}
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
                <X size={15} strokeWidth={1.6} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ModelToggles() {
  const { model, setModel, compareCurves, setCompareCurves, xAxis, setXAxis } = useStore();
  return (
    <div className="toggles">
      <SegmentedControl
        label="Active model"
        value={model}
        onChange={setModel}
        options={[
          { value: 'log', label: copy.controls.log },
          { value: 'linear', label: copy.controls.linear }
        ]}
      />
      <SegmentedControl
        label="Horizontal axis"
        value={xAxis}
        onChange={setXAxis}
        options={[
          { value: 'log', label: copy.controls.logAxis },
          { value: 'linear', label: copy.controls.linearAxis }
        ]}
      />
      <label className="check-inline">
        <input type="checkbox" checked={compareCurves} onChange={(e) => setCompareCurves(e.target.checked)} />
        <span>Show both curves</span>
      </label>
    </div>
  );
}
