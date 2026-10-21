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
    sourcemap: !single,
    chunkSizeWarningLimit: 1500,
    rollupOptions: single
      ? {}
      : {
          output: {
            manualChunks: {
              three: ['three'],
              r3f: ['@react-three/fiber', '@react-three/drei'],
              d3: ['d3-array', 'd3-scale', 'd3-shape', 'd3-geo']
            }
          }
        }
  },
  test: { environment: 'node', include: ['src/**/*.test.ts'] }
});
