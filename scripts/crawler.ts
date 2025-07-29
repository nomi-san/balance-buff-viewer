import path from 'node:path';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { buildBalanceBuffData, getFandomDataScript } from './_data';
import { toGamePatch } from './_utils';
import pkg from '../package.json';

async function main() {
  const script = await getFandomDataScript();
  console.log(script)

  const data = buildBalanceBuffData(script);
  data['_patch'] = pkg.data.patch;
  data['_gamePatch'] = toGamePatch(pkg.data.patch);

  const json = JSON.stringify(data, null, 2);
  const outdir = path.join(process.cwd(), 'dist');
  const outpath = path.join(outdir, 'balance.json');

  if (!existsSync(outdir)) {
    await fs.mkdir(outdir);
  }
  await fs.writeFile(outpath, json);
}

main()
  .then(() => console.log('Successfully crawled Fandom data.'))
  .catch((err) => (console.log('Failed to crawl Fandom data.', err), process.exit(1)))
  ;