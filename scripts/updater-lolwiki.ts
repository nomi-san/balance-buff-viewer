/**
 * LoL Wiki ARAM Balance Updater
 * Handles incremental updates from LoL Wiki patch history
 * Processes multiple patches to update balance data
 */

import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import cjson from 'comment-json';
import pkg from '../package.json';
import {
  fetchLoLWikiPatchHistory,
  extractPatchSections,
  parseChampionBalanceFromSection,
  createChampionMapping,
  mergeBalanceData,
  type BalanceData,
} from './_lolwiki';
import * as utils from './_utils';
import * as cheerio from 'cheerio';

/**
 * Starting patch version for LoL Wiki data source (Fandom data became outdated at this point)
 */
const LOLWIKI_START_PATCH = '25.15';

/**
 * Process multiple patches from LoL Wiki and merge them incrementally
 */
async function processPatches(startPatch: string, endPatch: string): Promise<BalanceData> {
  console.log(`Processing patches from ${startPatch} to ${endPatch}...`);
  
  // Fetch the patch history page
  console.log('Fetching LoL Wiki ARAM patch history...');
  const html = await fetchLoLWikiPatchHistory();
  
  console.log('Extracting patch sections...');
  const sections = extractPatchSections(html);
  
  if (sections.length === 0) {
    throw new Error('No patch sections found in the LoL Wiki page');
  }
  
  console.log(`Found ${sections.length} patch sections`);
  
  // Filter sections to only include patches between startPatch and endPatch
  const relevantSections = sections.filter(section => {
    const version = section.version;
    return utils.compareSemver(version, startPatch) >= 0 &&
           utils.compareSemver(version, endPatch) <= 0;
  });
  
  console.log(`Relevant patches: ${relevantSections.map(s => s.version).join(', ')}`);
  
  if (relevantSections.length === 0) {
    console.log('No new patches to process');
    return {};
  }
  
  // Create champion mapping
  console.log('Creating champion mapping from Data Dragon...');
  const championMapping = await createChampionMapping();
  console.log(`Loaded ${championMapping.size} champions`);
  
  // Load existing balance data if it exists
  let currentData: BalanceData = {};
  const balanceJsonPath = join(process.cwd(), 'dist', 'balance.json');
  
  if (existsSync(balanceJsonPath)) {
    console.log('Loading existing balance data...');
    const existingJson = await fs.readFile(balanceJsonPath, 'utf-8');
    currentData = JSON.parse(existingJson);
    
    // Remove metadata fields for merging
    delete (currentData as any)._patch;
    delete (currentData as any)._gamePatch;
  }
  
  // Process each patch in order (oldest to newest)
  // Note: sections are typically ordered newest first, so reverse them
  const patchesToProcess = relevantSections.reverse();
  
  for (const patchSection of patchesToProcess) {
    console.log(`\nProcessing patch ${patchSection.version}...`);
    
    const $ = cheerio.load('');
    const balanceChanges = parseChampionBalanceFromSection(patchSection.content, $);
    console.log(`  Found balance changes for ${balanceChanges.size} champions`);
    
    if (balanceChanges.size > 0) {
      currentData = mergeBalanceData(currentData, balanceChanges, championMapping);
    }
  }
  
  return currentData;
}

/**
 * Update to the latest patch
 */
async function main() {
  const currentVersion = pkg.data.patch;
  const latestVersion = await utils.getLatestLoLPatch();
  
  console.log(`Current version: ${currentVersion}`);
  console.log(`Latest version: ${latestVersion}`);
  
  // Determine if we need to use LoL Wiki for updates
  // If current version is < 25.15, we need to process from 25.15 onwards
  const startPatch = utils.compareSemver(currentVersion, LOLWIKI_START_PATCH) < 0
    ? LOLWIKI_START_PATCH
    : currentVersion;
  
  if (utils.compareSemver(latestVersion, startPatch) <= 0) {
    console.log('Already on the latest patch.');
    return false;
  }
  
  console.log(`\nUpdating from ${startPatch} to ${latestVersion}...`);
  console.log(`Using LoL Wiki as data source (started at ${LOLWIKI_START_PATCH})\n`);
  
  // Process all patches
  const updatedData = await processPatches(startPatch, latestVersion);
  
  // Add metadata
  (updatedData as any)._patch = latestVersion;
  (updatedData as any)._gamePatch = utils.toGamePatch(latestVersion);
  
  // Save updated balance data
  const json = JSON.stringify(updatedData, null, 2);
  const outdir = join(process.cwd(), 'dist');
  const outpath = join(outdir, 'balance.json');
  
  if (!existsSync(outdir)) {
    await fs.mkdir(outdir);
  }
  
  await fs.writeFile(outpath, json);
  console.log(`\nUpdated balance data -> ${latestVersion}`);
  
  // Update package.json
  const pkgPath = join(process.cwd(), 'package.json');
  const pkgJson = await fs.readFile(pkgPath, 'utf-8');
  const pkgData = cjson.parse(pkgJson) as any;
  
  pkgData.version = utils.nextSemver(pkgData.version, 1);
  pkgData.data.patch = latestVersion;
  pkgData.data.hash = 'lolwiki'; // We no longer use hash for LoL Wiki
  pkgData.data.date = new Date().toISOString();
  
  const newPkgJson = cjson.stringify(pkgData, null, 2);
  await fs.writeFile(pkgPath, newPkgJson, 'utf-8');
  
  console.log(`Updated package.json -> ${pkgData.version} (npm)`);
  
  return true;
}

main()
  .then((updated) => {
    if (!updated) {
      console.log('No updates available.');
      process.exit(1);
    }
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error during update:', err);
    process.exit(1);
  });
