import luaparse from 'luaparse';
import {
  fetchLoLWikiPatchHistory,
  extractPatchSections,
  parseChampionBalanceFromSection,
  createChampionMapping,
  type BalanceData as LoLWikiBalanceData,
} from './_lolwiki';
import * as cheerio from 'cheerio';
import { compareSemver } from './_utils';

const FANDOM_DATA_URL = 'https://leagueoflegends.fandom.com/wiki/Module:ChampionData/data';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36';
const LOLWIKI_START_PATCH = '25.15'; // Patch where Fandom data became outdated

const GAME_MODES = ['aram', 'ar', 'nb', 'ofa', 'urf', 'usb'];
const STAT_PROPS = [
  'dmg_dealt',
  'dmg_taken',
  'healing',
  'shielding',
  'ability_haste',
  'mana_regen',
  'energy_regen',
  'attack_speed',
  'movement_speed',
  'tenacity',
];

async function getFandomDataScript() {
  const res = await fetch(FANDOM_DATA_URL, {
    headers: {
      'user-agent': USER_AGENT
    }
  });

  const data = await res.text();
  const start = `<pre lang="en" dir="ltr" class="mw-code mw-script">`, end = "</pre>";
  const startIdx = data.indexOf(start) + start.length;
  const endIdx = data.indexOf(end, startIdx);

  const script = data.substring(startIdx, endIdx);
  return script
    .replace(/\r\n/g, '\n')
    .replace(/\&quot\;/g, '"')
    .replace(/\&lt\;/g, '<')
    .replace(/\&gt\;/g, '>');
}

function capitalize(str: string) {
  const first = str.charCodeAt(0);
  if (first >= 65 && first <= 90) return str;
  return String.fromCharCode(first - 32) + str.substring(1);
}

function unquoteString(str: string) {
  return str.substring(1, str.length - 1);
}

function getField(fields, key: string): any {
  if (Array.isArray(fields)) {
    key = `"${key}"`;
    for (const { key: k, value } of fields) {
      if (k.raw === key)
        return value;
    }
  }
}

function getFieldNumber(fields, key: string): any {
  var field = getField(fields, key);
  if (field) {
    if (typeof field.value === 'number')
      return field.value;
    else if (field.operator === '-') {
      return -field.argument.value;
    }
  }
}

function getFieldString(fields, key: string): any {
  var field = getField(fields, key);
  if (field) {
    return unquoteString(field.raw);
  }
}

function buildBalanceBuffData(script: string) {
  const data = {};
  const ast: any = luaparse.parse(script);
  const table = ast.body[0].arguments[0];

  for (const rootFields of table.fields) {
    const fields = rootFields.value.fields;
    const stats = getField(fields, 'stats');

    const champ = {
      id: getFieldNumber(fields, 'id') as number,
      name: getFieldString(fields, 'apiname'),
      title: capitalize(getFieldString(fields, 'title')),
      stats: {}
    };

    for (const mode of GAME_MODES) {
      const fields = getField(stats.fields, mode)?.fields;

      champ.stats[mode] = {};
      for (const prop of STAT_PROPS) {
        const value = getFieldNumber(fields, prop);
        if (value != null) {
          champ.stats[mode][prop] = value;
        }
      }

      if (champ.stats[mode].dmg_dealt === 1.0) {
        delete champ.stats[mode].dmg_dealt;
      }
      if (champ.stats[mode].dmg_taken === 1.0) {
        delete champ.stats[mode].dmg_taken;
      }
      if (champ.stats[mode].tenacity === 1.0) {
        delete champ.stats[mode].tenacity;
      }

      if (Object.keys(champ.stats[mode]).length === 0) {
        delete champ.stats[mode];
      }
    }

    data[champ.id] = champ;
  }

  return data;
}

export {
  getFandomDataScript,
  buildBalanceBuffData,
  buildBalanceDataFromLoLWiki,
}

/**
 * Builds balance data from LoL Wiki for ARAM mode
 * This is used for patches >= 25.15 where Fandom data is outdated
 */
async function buildBalanceDataFromLoLWiki(currentPatch: string) {
  console.log('Using LoL Wiki for ARAM balance data...');
  
  // Fetch and parse LoL Wiki
  const html = await fetchLoLWikiPatchHistory();
  const sections = extractPatchSections(html);
  
  if (sections.length === 0) {
    throw new Error('No patch sections found in LoL Wiki');
  }
  
  // Find the section for the current patch
  const patchSection = sections.find(s => s.version === currentPatch);
  
  if (!patchSection) {
    console.warn(`Patch ${currentPatch} not found in LoL Wiki, using latest patch: ${sections[0].version}`);
    // Use the latest patch if current patch not found
    const latestSection = sections[0];
    return await parseLoLWikiSection(latestSection);
  }
  
  return await parseLoLWikiSection(patchSection);
}

async function parseLoLWikiSection(section: { version: string; content: cheerio.Cheerio<any> }) {
  const championMapping = await createChampionMapping();
  const $ = cheerio.load('');
  const balanceChanges = parseChampionBalanceFromSection(section.content, $);
  
  // Convert to the same format as buildBalanceBuffData
  const data: any = {};
  
  for (const [championName, stats] of Array.from(balanceChanges)) {
    const champInfo = championMapping.get(championName.toLowerCase());
    
    if (!champInfo) {
      console.warn(`Unknown champion: ${championName}`);
      continue;
    }
    
    data[champInfo.id] = {
      id: champInfo.id,
      name: champInfo.apiname,
      title: champInfo.title,
      stats: {
        aram: stats
      }
    };
  }
  
  return data;
}