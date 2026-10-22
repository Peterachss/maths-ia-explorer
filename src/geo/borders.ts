// Country borders drawn onto a transparent equirectangular texture. The
// satellite image supplies the land; this layer adds the map lines that make
// the globe readable without covering the imagery.
import { CanvasTexture, SRGBColorSpace } from 'three';
import { geoEquirectangular, geoPath } from 'd3-geo';
import { mesh } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import world from 'world-atlas/countries-110m.json';

export function makeBorderTexture(width = 2048): CanvasTexture {
  const height = width / 2;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const projection = geoEquirectangular().fitSize([width, height], { type: 'Sphere' });
  const path = geoPath(projection, ctx);
  const topo = world as unknown as Topology<{ countries: GeometryCollection }>;
  const scale = width / 4096;
  const px = (lon: number) => ((lon + 180) / 360) * width;
  const py = (lat: number) => ((90 - lat) / 180) * height;

  ctx.clearRect(0, 0, width, height);

  // A faint 30 degree graticule. It is a map layer, never a data layer.
  ctx.beginPath();
  for (let lon = -180; lon <= 180; lon += 30) {
    ctx.moveTo(px(lon), 0);
    ctx.lineTo(px(lon), height);
  }
  for (let lat = -60; lat <= 60; lat += 30) {
    ctx.moveTo(0, py(lat));
    ctx.lineTo(width, py(lat));
  }
  ctx.strokeStyle = 'rgba(224, 239, 255, 0.14)';
  ctx.lineWidth = 1.1 * scale;
  ctx.stroke();

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
