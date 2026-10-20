// src/geo/texture.ts : draws real Natural Earth geometry onto an equirectangular canvas.
import { CanvasTexture, SRGBColorSpace } from 'three';
import { geoEquirectangular, geoGraticule10, geoPath } from 'd3-geo';
import { feature, mesh } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import world from 'world-atlas/countries-110m.json';
import { theme } from '../theme';

export function makeEarthTexture(width = 2048): CanvasTexture {
  const height = width / 2;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const projection = geoEquirectangular().fitSize([width, height], { type: 'Sphere' });
  const path = geoPath(projection, ctx);
  const topo = world as unknown as Topology<{ countries: GeometryCollection }>;

  ctx.fillStyle = theme.sea;
  ctx.fillRect(0, 0, width, height);

  ctx.beginPath();
  path(geoGraticule10());
  ctx.strokeStyle = theme.grat;
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.beginPath();
  path(feature(topo, topo.objects.countries) as never);
  ctx.fillStyle = theme.land;
  ctx.fill();

  ctx.beginPath();
  path(mesh(topo, topo.objects.countries, (a, b) => a !== b) as never);
  ctx.strokeStyle = theme.rule;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.beginPath();
  path(mesh(topo, topo.objects.countries, (a, b) => a === b) as never);
  ctx.strokeStyle = theme.paper1;
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.globalAlpha = 1;

  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}
