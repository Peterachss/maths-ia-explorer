// Country borders drawn onto a transparent equirectangular texture. The
// satellite image supplies the land; this layer adds the map lines that make
// the globe readable without covering the imagery.
import { CanvasTexture, SRGBColorSpace } from 'three';
import { geoEquirectangular, geoPath } from 'd3-geo';
import { mesh } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import world from 'world-atlas/countries-110m.json';

export function makeBorderTexture(width = 4096): CanvasTexture {
  const height = width / 2;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const projection = geoEquirectangular().fitSize([width, height], { type: 'Sphere' });
  const path = geoPath(projection, ctx);
  const topo = world as unknown as Topology<{ countries: GeometryCollection }>;
  const scale = width / 4096;

  ctx.clearRect(0, 0, width, height);

  // Internal borders: quiet, so the satellite image stays the subject.
  ctx.beginPath();
  path(mesh(topo, topo.objects.countries, (a, b) => a !== b) as never);
  ctx.strokeStyle = 'rgba(235, 244, 255, 0.42)';
  ctx.lineWidth = 2.2 * scale;
  ctx.stroke();

  // Coastlines: slightly stronger, like a map layer over imagery.
  ctx.beginPath();
  path(mesh(topo, topo.objects.countries, (a, b) => a === b) as never);
  ctx.strokeStyle = 'rgba(245, 250, 255, 0.72)';
  ctx.lineWidth = 3.2 * scale;
  ctx.stroke();

  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}
