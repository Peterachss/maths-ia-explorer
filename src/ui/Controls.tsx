import { useId, useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import type { Country } from '../data/schema';
import { useStore } from '../store';
import { copy } from '../copy';
import { SegmentedControl } from './Segmented';

export function SearchBox({ countries }: { countries: Country[] }) {
  const id = useId();
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const select = useStore((s) => s.select);
  const hits = useMemo(
    () => q.trim() ? countries.filter((c) =>
      c.name.toLowerCase().includes(q.trim().toLowerCase()) ||
      c.iso3.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 6) : [],
    [q, countries]
  );
  const expanded = open && Boolean(q.trim());
  const choose = (iso: string) => { select(iso); setQ(''); setOpen(false); setActive(0); };
  return (
    <div className="search" onBlur={(e) => {
      if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
    }}>
      <label htmlFor={id} className="visually-hidden">{copy.controls.search}</label>
      <Search size={20} strokeWidth={1.5} aria-hidden="true" />
      <input
        id={id} type="search" role="combobox" value={q}
        placeholder={copy.controls.searchPlaceholder} autoComplete="off"
        aria-autocomplete="list" aria-expanded={expanded}
        aria-controls={`${id}-results`}
        aria-activedescendant={expanded && hits[active] ? `${id}-option-${active}` : undefined}
        onFocus={() => setOpen(true)}
        onChange={(e) => { setQ(e.target.value); setActive(0); setOpen(true); }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault(); setOpen(true);
            if (hits.length) setActive((i) => (i + (e.key === 'ArrowDown' ? 1 : -1) + hits.length) % hits.length);
          }
          if (e.key === 'Enter' && hits[active]) { e.preventDefault(); choose(hits[active].iso3); }
          if (e.key === 'Escape') { setOpen(false); setQ(''); }
        }}
      />
      <ul id={`${id}-results`} className="search-hits" role="listbox"
        aria-label="Matching countries" hidden={!expanded}>
        {hits.map((c, i) => (
          <li key={c.iso3} id={`${id}-option-${i}`} role="option" aria-selected={i === active}>
            <button type="button" tabIndex={-1} onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setActive(i)} onClick={() => choose(c.iso3)}>
              <span>{c.name}</span><span className="search-code">{c.iso3}</span>
            </button>
          </li>
        ))}
        {!hits.length && <li className="search-empty" role="presentation">No countries match “{q}”. Try a country name or code.</li>}
      </ul>
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
