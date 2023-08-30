import path from 'node:path'
import fs from 'node:fs/promises'
import { defineConfig } from 'vite';
import pkg from './package.json';

const BANNER = `/**
 * @name ${pkg.name}
 * @version ${pkg.version}
 * @description ${pkg.description}
 * @author ${pkg.author}
 * @link ${pkg.repository.url}
 */`;

fs.writeFile(
  path.join(__dirname, 'balance-buff-viewer.js'),
  `${BANNER}\n\nexport * from 'https://cdn.skypack.dev/${pkg.name}?min';`
);

export default defineConfig({
  build: {
    emptyOutDir: false,
    rollupOptions: {
      input: 'src/index.ts',
      output: {
        manualChunks: undefined,
        entryFileNames: 'index.js',
      }
    }
  },
  esbuild: {
    banner: BANNER,
    legalComments: 'none'
  }
});