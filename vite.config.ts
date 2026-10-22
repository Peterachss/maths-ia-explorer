import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Set SINGLE=1 to build one self contained HTML file (used for the offline preview).
const single = process.env.SINGLE === '1';

// GitHub Pages serves this repository from /maths-ia-explorer/. The deploy
// workflow sets BASE_PATH; local builds keep the root path.
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  base,
  plugins: [react(), ...(single ? [viteSingleFile()] : [])],
  build: {
    target: 'es2022',
    modulePreload: false,
    sourcemap: !single,
    chunkSizeWarningLimit: 1500,
    rollupOptions: single
      ? {}
      : {
          output: {
            manualChunks(id) {
              // Keep Vite's preload helper with the entry's vendor chunk. If it
              // lands in the lazy r3f chunk, the initial bundle imports r3f and
              // three just to obtain this 1 kB helper.
              if (id.includes('vite/preload-helper')) return 'vendor';
              if (!id.includes('node_modules')) return undefined;
              if (id.includes('@react-three')) return 'r3f';
              if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return 'react';
              if (/node_modules\/three\//.test(id)) return 'three';
              if (/node_modules\/d3-/.test(id)) return 'd3';
              if (id.includes('world-atlas') || id.includes('topojson')) return 'geo';
              if (id.includes('lucide-react') || id.includes('/zustand/')) return 'vendor';
              return undefined;
            }
          }
        }
  },
  test: { environment: 'node', include: ['src/**/*.test.ts'] }
});
