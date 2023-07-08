import { defineConfig } from 'vite';
import pkg from './package.json';

const BANNER = `/**
 * @name ${pkg.name}
 * @version ${pkg.version}
 * @description ${pkg.description}
 * @author ${pkg.author}
 * @link ${pkg.repository.url}
 */`;

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