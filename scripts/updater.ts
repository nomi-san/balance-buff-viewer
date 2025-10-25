import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import cjson from 'comment-json';
import pkg from '../package.json';
import { getFandomDataScript, buildBalanceBuffData, buildBalanceDataFromLoLWiki } from './_data';
import * as utils from './_utils';

const LOLWIKI_START_PATCH = '25.15'; // Patch where we switch to LoL Wiki for ARAM data

type UpdateInfo = {
  dataHash: string;
  dataScript?: string;
  currentVersion: string;
  latestVersion: string;
  useLoLWiki: boolean;
};

async function fetchUpdate(): Promise<UpdateInfo | false> {
  let currentVersion = pkg.data.patch;
  let latestVersion = await utils.getLatestLoLPatch();

  if (utils.compareSemver(latestVersion, currentVersion) <= 0) {
    console.log(`Already on the latest patch: ${currentVersion}`);
    return false;
  }

  const gamePatchVersion = utils.toGamePatch(latestVersion);
  const useLoLWiki = utils.compareSemver(latestVersion, LOLWIKI_START_PATCH) >= 0;
  
  let dataHash: string;
  let dataScript: string | undefined;
  
  if (useLoLWiki) {
    console.log(`Patch ${gamePatchVersion} >= ${LOLWIKI_START_PATCH}: Using LoL Wiki for ARAM balance data`);
    // For LoL Wiki, we use a fixed hash since we can't hash dynamic HTML
    dataHash = `lolwiki-${latestVersion}`;
  } else {
    console.log(`Patch ${gamePatchVersion} < ${LOLWIKI_START_PATCH}: Using Fandom for balance data`);
    dataScript = await getFandomDataScript();
    dataHash = utils.getSha1(dataScript);
    
    if (dataHash === pkg.data.hash) {
      console.log('No changes detected in the Fandom data script.');
      return false;
    }
  }

  return {
    dataHash,
    dataScript,
    currentVersion,
    latestVersion,
    useLoLWiki
  };
}

async function updatePackageJson(update: UpdateInfo) {
  let path = join(process.cwd(), 'package.json');
  let json = await fs.readFile(path, 'utf-8');

  let pkg = cjson.parse(json) as any;
  pkg.version = utils.nextSemver(pkg.version, 1);
  pkg.data.patch = update.latestVersion;
  pkg.data.hash = update.dataHash;
  pkg.data.date = new Date().toISOString();

  let newJson = cjson.stringify(pkg, null, 2);
  await fs.writeFile(path, newJson, 'utf-8');

  console.log('Updated package.json -> %s (npm)', pkg.version);
}

async function updateBalanceJson(update: UpdateInfo) {
  const gamePatch = utils.toGamePatch(update.latestVersion);
  let data;
  
  if (update.useLoLWiki) {
    data = await buildBalanceDataFromLoLWiki(gamePatch);
  } else {
    data = buildBalanceBuffData(update.dataScript!);
  }
  
  data['_patch'] = update.latestVersion;
  data['_gamePatch'] = gamePatch;

  const json = JSON.stringify(data, null, 2);
  const outdir = join(process.cwd(), 'dist');
  const outpath = join(outdir, 'balance.json');

  if (!existsSync(outdir)) {
    await fs.mkdir(outdir);
  }
  await fs.writeFile(outpath, json);

  console.log('Updated balance data -> %s (%s)', update.latestVersion, update.dataHash);
}

async function main() {
  let update = await fetchUpdate();
  if (!update) {
    console.log('No updates available.');
    process.exit(1);
  }

  console.log('Update available: %s -> %s | (%s)',
    update.currentVersion, update.latestVersion,
    utils.toGamePatch(update.latestVersion));

  await updateBalanceJson(update);
  await updatePackageJson(update);
}

main().catch(err => {
  console.error('Error during update:', err);
  process.exit(1);
});