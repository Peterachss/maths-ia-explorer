// src/theme.ts : the same palette as tokens.css, for canvas and WebGL code.
import { interpolateRgbBasis } from 'd3-interpolate';

export const theme = {
  ink0: '#0d0c0a', paper0: '#f1e9d7', paper1: '#c9bfa6', rule: '#3a3529',
  thread: '#e4572e', linear: '#86a9d1', log: '#e9b44c',
  land: '#1b1912', sea: '#0a0907', grat: '#4a4435'
} as const;

/** Single hue ramp, dark to light. Higher life expectancy is lighter. */
export const lifeColour = interpolateRgbBasis(['#3b2a1e', '#7a4a27', '#c0792f', '#e9b44c', '#f6e3a8']);
export const lifeT = (years: number) => Math.min(1, Math.max(0, (years - 50) / 36));
