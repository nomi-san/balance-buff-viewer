/**
 * LoL Wiki ARAM Balance Crawler
 * Fetches and processes ARAM balance data from LoL Wiki patch history
 */

import path from 'node:path';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import {
  fetchLoLWikiPatchHistory,
  extractPatchSections,
  parseChampionBalanceFromSection,
  createChampionMapping,
  mergeBalanceData,
  type BalanceData,
} from './_lolwiki';
import { toGamePatch } from './_utils';
import pkg from '../package.json';
import * as cheerio from 'cheerio';

/**
 * Crawl the latest patch from LoL Wiki
 */
async function crawlLatestPatch() {
  console.log('Fetching LoL Wiki ARAM patch history...');
  const html = await fetchLoLWikiPatchHistory();
  
  console.log('Extracting patch sections...');
  const sections = extractPatchSections(html);
  
  if (sections.length === 0) {
    throw new Error('No patch sections found in the LoL Wiki page');
  }
  
  // Get the latest patch (first section)
  const latestPatch = sections[0];
  console.log(`Found latest patch: ${latestPatch.version}`);
  
  // Create champion mapping
  console.log('Creating champion mapping from Data Dragon...');
  const championMapping = await createChampionMapping();
  console.log(`Loaded ${championMapping.size} champions`);
  
  // Parse balance changes for the latest patch
  console.log('Parsing balance changes...');
  const $ = cheerio.load('');
  const balanceChanges = parseChampionBalanceFromSection(latestPatch.content, $);
  console.log(`Found balance changes for ${balanceChanges.size} champions`);
  
  // Load existing balance data if it exists
  let existingData: BalanceData = {};
  const balanceJsonPath = path.join(process.cwd(), 'dist', 'balance.json');
  
  if (existsSync(balanceJsonPath)) {
    console.log('Loading existing balance data...');
    const existingJson = await fs.readFile(balanceJsonPath, 'utf-8');
    existingData = JSON.parse(existingJson);
    
    // Remove metadata fields for merging
    delete (existingData as any)._patch;
    delete (existingData as any)._gamePatch;
  }
  
  // Merge the new data with existing data
  console.log('Merging balance data...');
  const mergedData = mergeBalanceData(existingData, balanceChanges, championMapping);
  
  // Add metadata
  (mergedData as any)._patch = pkg.data.patch;
  (mergedData as any)._gamePatch = toGamePatch(pkg.data.patch);
  
  return mergedData;
}

/**
 * Main entry point
 */
async function main() {
  const data = await crawlLatestPatch();
  
  // Write to file
  const json = JSON.stringify(data, null, 2);
  const outdir = path.join(process.cwd(), 'dist');
  const outpath = path.join(outdir, 'balance.json');
  
  if (!existsSync(outdir)) {
    await fs.mkdir(outdir);
  }
  
  await fs.writeFile(outpath, json);
  
  console.log(`\nSuccessfully crawled LoL Wiki data.`);
  console.log(`Output: ${outpath}`);
  console.log(`Champions with balance changes: ${Object.keys(data).filter(k => !k.startsWith('_')).length}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Failed to crawl LoL Wiki data:', err);
    process.exit(1);
  });
