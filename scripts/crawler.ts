import path from 'node:path';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { buildBalanceBuffData, getFandomDataScript, buildBalanceDataFromLoLWiki } from './_data';
import { toGamePatch, compareSemver } from './_utils';
import pkg from '../package.json';

const LOLWIKI_START_PATCH = '25.15'; // Patch where we switch to LoL Wiki for ARAM data

async function main() {
  const currentPatch = pkg.data.patch;
  const gamePatch = toGamePatch(currentPatch);
  
  let data;
  
  // Use LoL Wiki if patch >= 25.15, otherwise use Fandom
  if (compareSemver(currentPatch, LOLWIKI_START_PATCH) >= 0) {
    console.log(`Patch ${gamePatch} (>= ${LOLWIKI_START_PATCH}): Using LoL Wiki for ARAM balance data`);
    data = await buildBalanceDataFromLoLWiki(gamePatch);
  } else {
    console.log(`Patch ${gamePatch} (< ${LOLWIKI_START_PATCH}): Using Fandom for balance data`);
    const script = await getFandomDataScript();
    console.log(script);
    data = buildBalanceBuffData(script);
  }
  
  data['_patch'] = pkg.data.patch;
  data['_gamePatch'] = gamePatch;

  const json = JSON.stringify(data, null, 2);
  const outdir = path.join(process.cwd(), 'dist');
  const outpath = path.join(outdir, 'balance.json');

  if (!existsSync(outdir)) {
    await fs.mkdir(outdir);
  }
  await fs.writeFile(outpath, json);
}

main()
  .then(() => console.log('Successfully crawled balance data.'))
  .catch((err) => (console.log('Failed to crawl balance data.', err), process.exit(1)))
  ;