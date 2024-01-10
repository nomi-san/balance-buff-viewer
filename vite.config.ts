import path from 'node:path'
import fs from 'node:fs/promises'
import { defineConfig, Plugin } from 'vite';
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
  `${BANNER}\n\n(() => import('https://cdn.skypack.dev/${pkg.name}?min'))();`
);

function imageIcons(): Plugin {
  const virtualModuleId = 'virtual:icons'
  const resolvedVirtualModuleId = '\0' + virtualModuleId

  return {
    name: 'icon-images',
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },
    async load(id) {
      if (id === resolvedVirtualModuleId) {
        const code = Array<string>();
        const dir = path.join(__dirname, 'src/icons');
        const files = await fs.readdir(dir);
        for (const file of files.filter(n => /\.png$/i.test(n))) {
          const name = path.parse(file).name;
          const data = await fs.readFile(path.join(dir, file));
          const bytes = Array.from(data);
          code.push(`${name}: ${JSON.stringify(bytes)}`);
        }
        return `export const mime = 'image/png'; export default { ${code.join(',')} };`
      }
    },
  }
}

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
  },
  plugins: [
    imageIcons()
  ]
});