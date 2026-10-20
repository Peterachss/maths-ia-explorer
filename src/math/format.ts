// src/math/format.ts
const nf = (d: number) => new Intl.NumberFormat('en-GB', { minimumFractionDigits: d, maximumFractionDigits: d });

export const years = (v: number, d = 1) => `${nf(d).format(v)} years`;
export const dollars = (v: number) =>
  `$${new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 }).format(v)}`;
export const signed = (v: number, d = 1) => `${v >= 0 ? '+' : '−'}${nf(d).format(Math.abs(v))}`;
export const percent = (v: number, d = 1) => `${nf(d).format(v)}%`;
export const num = (v: number, d = 4) => nf(d).format(v);
