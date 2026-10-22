// src/store.ts : one shared state for the 3D stage and the DOM.
import { create } from 'zustand';

export type StageView = 'globe' | 'model';
export type ModelShow = 'linear' | 'log' | 'both';
export type XAxis = 'linear' | 'log';
export interface Focus { key: number; iso3: string[]; }

interface State {
  selected: string[];
  hovered: string | null;
  excluded: string[];
  stage: StageView;
  modelShow: ModelShow;
  xAxis: XAxis;
  focus: Focus;
  activeSection: string;
  announce: string;
  selectionEvent: number;
  select: (iso3: string) => void;
  toggle: (iso3: string) => void;
  clear: () => void;
  hover: (iso3: string | null) => void;
  toggleExcluded: (iso3: string) => void;
  setExcluded: (list: string[]) => void;
  setStage: (s: StageView) => void;
  setModelShow: (m: ModelShow) => void;
  setXAxis: (x: XAxis) => void;
  setActiveSection: (id: string) => void;
  flyTo: (iso3: string[]) => void;
  presetAnchors: () => void;
}

const MAX_SELECTED = 8;

function fromUrl(): { selected: string[]; excluded: string[] } {
  if (typeof window === 'undefined') return { selected: [], excluded: [] };
  const q = new URLSearchParams(window.location.search);
  const split = (k: string) => (q.get(k) ?? '').split(',').filter((s) => /^[A-Z]{3}$/.test(s));
  return { selected: split('c').slice(0, MAX_SELECTED), excluded: split('x') };
}

export const useStore = create<State>((set, get) => ({
  ...fromUrl(),
  hovered: null,
  stage: 'globe',
  modelShow: 'both',
  xAxis: 'log',
  focus: { key: 0, iso3: ['ZWE', 'SGP'] },
  activeSection: 'h-two',
  announce: '',
  selectionEvent: 0,
  select: (iso3) => {
    const s = get().selected;
    if (s.includes(iso3)) {
      set({ announce: `${iso3} is already selected`, selectionEvent: get().selectionEvent + 1 });
      return;
    }
    const next = [...s, iso3].slice(-MAX_SELECTED);
    set({
      selected: next,
      announce: `Selected ${iso3}. ${next.length} selected.`,
      selectionEvent: get().selectionEvent + 1
    });
    get().flyTo(next.slice(-2));
  },
  toggle: (iso3) => {
    const s = get().selected;
    if (s.includes(iso3)) set({ selected: s.filter((c) => c !== iso3), announce: `Removed ${iso3} from the selection` });
    else get().select(iso3);
  },
  clear: () => set({ selected: [], announce: 'Selection cleared' }),
  hover: (iso3) => set({ hovered: iso3 }),
  toggleExcluded: (iso3) => {
    const e = get().excluded;
    set({ excluded: e.includes(iso3) ? e.filter((c) => c !== iso3) : [...e, iso3] });
  },
  setExcluded: (list) => set({ excluded: list }),
  setStage: (stage) => set({ stage }),
  setModelShow: (modelShow) => set({ modelShow }),
  setXAxis: (xAxis) => set({ xAxis }),
  setActiveSection: (activeSection) => set({ activeSection }),
  flyTo: (iso3) => set((st) => ({ focus: { key: st.focus.key + 1, iso3 } })),
  presetAnchors: () => {
    set({ selected: ['ZWE', 'SGP'], announce: 'Compared Zimbabwe and Singapore' });
    get().flyTo(['ZWE', 'SGP']);
  }
}));

/** Keep the URL in sync so any state can be shared. Returns an unsubscribe. */
export function syncUrl(): () => void {
  return useStore.subscribe((s) => {
    const q = new URLSearchParams();
    if (s.selected.length) q.set('c', s.selected.join(','));
    if (s.excluded.length) q.set('x', s.excluded.join(','));
    const qs = q.toString();
    window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
  });
}
