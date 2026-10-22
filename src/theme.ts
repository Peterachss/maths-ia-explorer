// src/theme.ts : the same palette as tokens.css, for canvas and WebGL code.
import { interpolateRgbBasis } from 'd3-interpolate';

export const theme = {
  ink0: '#05080d', ink1: '#0f141b', ink2: '#171f28', rule: '#26303c',
  paper0: '#f4f7fb', paper1: '#c2ccd8', paper2: '#8b98a8',
  thread: '#ff6b4a', linear: '#5aa7ff', log: '#ffc247',
  land: '#1b2634', sea: '#08111c', grat: '#33404f',
  life0: '#2f6f6a', life1: '#59a79b', life2: '#9bd8c9', life3: '#d8f5ec'
} as const;

/** One sequential ramp for the data: deep teal at low values, pale mint at high values. */
export const lifeColour = interpolateRgbBasis([theme.life0, theme.life1, theme.life2, theme.life3]);
export const LIFE_MIN = 53;
export const LIFE_MAX = 84.4;
export const lifeT = (years: number) => Math.min(1, Math.max(0, (years - LIFE_MIN) / (LIFE_MAX - LIFE_MIN)));

/** The cost surface: deep blue at the least squares minimum, warm at higher error. */
export const bowlColour = interpolateRgbBasis(['#1f4f7a', '#2f6f9f', '#6e9fb5', '#d6b47a', '#ff8a5c']);
