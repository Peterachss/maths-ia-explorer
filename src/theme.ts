// src/theme.ts : the same palette as tokens.css, for canvas and WebGL code.
import { interpolateRgbBasis } from 'd3-interpolate';

export const theme = {
  ink0: '#05080d', ink1: '#0f141b', ink2: '#171f28', rule: '#26303c',
  paper0: '#f4f7fb', paper1: '#c2ccd8', paper2: '#8b98a8',
  thread: '#ff6b4a', linear: '#5aa7ff', log: '#ffc247',
  land: '#1b2634', sea: '#08111c', grat: '#33404f'
} as const;

/** One sequential ramp for the data: warm low values, cool high values. */
export const lifeColour = interpolateRgbBasis(['#ff5d5d', '#ff9f43', '#ffe066', '#c9ecd8', '#d9f1ff']);
export const lifeT = (years: number) => Math.min(1, Math.max(0, (years - 50) / 36));

/** The cost surface: deep blue at the least squares minimum, warm at higher error. */
export const bowlColour = interpolateRgbBasis(['#1f4f7a', '#2f6f9f', '#6e9fb5', '#d6b47a', '#ff8a5c']);
