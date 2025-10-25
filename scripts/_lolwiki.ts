/**
 * LoL Wiki ARAM Patch History Crawler
 * Fetches and parses ARAM balance data from https://wiki.leagueoflegends.com/en-us/ARAM/Patch_history
 */

import * as cheerio from 'cheerio';

const LOLWIKI_ARAM_PATCH_HISTORY_URL = 'https://wiki.leagueoflegends.com/en-us/ARAM/Patch_history';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36';

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

interface ChampionBalanceData {
  id: number;
  name: string;
  title: string;
  stats: {
    [mode: string]: {
      [stat: string]: number;
    };
  };
}

interface BalanceData {
  [championId: string]: ChampionBalanceData;
}

/**
 * Fetches the ARAM patch history page HTML
 */
async function fetchLoLWikiPatchHistory(): Promise<string> {
  const res = await fetch(LOLWIKI_ARAM_PATCH_HISTORY_URL, {
    headers: {
      'user-agent': USER_AGENT,
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'accept-language': 'en-US,en;q=0.5',
    }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch LoL Wiki: ${res.status} ${res.statusText}`);
  }

  return await res.text();
}

/**
 * Extracts patch version sections from the HTML using cheerio
 * Returns an array of patch sections with their content
 */
function extractPatchSections(html: string): Array<{ version: string; content: cheerio.Cheerio<any> }> {
  const $ = cheerio.load(html);
  const sections: Array<{ version: string; content: cheerio.Cheerio<any> }> = [];
  
  // Find all heading elements that contain patch versions
  $('h1, h2, h3').each((_, elem) => {
    const text = $(elem).text().trim();
    // Match patch versions like "v25.19", "25.19", "v25.19a", etc.
    const versionMatch = text.match(/(?:v)?(\d+\.\d+(?:\.\d+)?[a-z]?)/i);
    
    if (versionMatch) {
      const version = versionMatch[1];
      // Get all content until the next heading of the same or higher level
      const tagName = elem.tagName;
      const content = $(elem).nextUntil(tagName);
      
      if (content.length > 0) {
        sections.push({
          version,
          content
        });
      }
    }
  });
  
  return sections;
}

/**
 * Parses champion balance changes from a patch section
 * Extracts damage dealt/taken and other modifiers from the HTML content
 * 
 * The expected structure is:
 * <li>Champion Name
 *   <ul>
 *     <li>Modifier text (e.g., "Outgoing damage modifier changed to 0% from -5%")</li>
 *     <li>Ability Name (ignored)
 *       <ul>
 *         <li>Ability changes (ignored)</li>
 *       </ul>
 *     </li>
 *   </ul>
 * </li>
 */
function parseChampionBalanceFromSection(sectionContent: cheerio.Cheerio<any>, $?: cheerio.CheerioAPI): Map<string, Partial<ChampionBalanceData['stats']['aram']>> {
  const balanceChanges = new Map<string, Partial<ChampionBalanceData['stats']['aram']>>();
  
  if (!$) {
    $ = cheerio.load('');
  }
  
  // Find all list items that might contain champion data
  // The structure is typically: <li>Champion Name <ul><li>changes...</li></ul></li>
  sectionContent.find('li').each((_, elem) => {
    const $li = $(elem);
    
    // Get the direct text content of this li (champion name)
    // We need to get only the text that's directly in this li, not in nested elements
    const directText = $li.clone().children().remove().end().text().trim();
    
    // Check if this looks like a champion name (starts with capital letter, no numbers)
    const championMatch = directText.match(/^([A-Z][a-z']+(?:\s+[A-Z][a-z']+)?)/);
    if (!championMatch) {
      return; // Not a champion entry
    }
    
    const championName = championMatch[1].trim();
    
    // Now look for direct child <li> elements that contain balance modifiers
    // We want to avoid nested <ul><li> which contain ability changes
    const directChildUl = $li.children('ul').first();
    if (directChildUl.length === 0) {
      return;
    }
    
    // Get direct children <li> of the first <ul>
    directChildUl.children('li').each((_, childLi) => {
      const $childLi = $(childLi);
      const text = $childLi.clone().children('ul').remove().end().text().trim();
      
      // Only process if this is a direct balance modifier (not an ability name with nested changes)
      // Balance modifiers contain words like "modifier", "Outgoing", "Incoming", "Healing", etc.
      if (!text.toLowerCase().includes('modifier')) {
        return; // Skip ability names or other non-modifier text
      }
      
      // Parse the balance modifier from the text
      const stats = parseBalanceModifierText(text);
      
      if (Object.keys(stats).length > 0) {
        if (!balanceChanges.has(championName)) {
          balanceChanges.set(championName, {});
        }
        Object.assign(balanceChanges.get(championName)!, stats);
      }
    });
  });
  
  return balanceChanges;
}

/**
 * Parses balance modifier text and extracts stat changes
 * Examples:
 * - "Outgoing damage modifier changed to 0% from -5%" -> { dmg_dealt: 1.0 }
 * - "Incoming damage modifier changed to 0% from +2%" -> { dmg_taken: 1.0 }
 * - "Healing modifier changed to +10% from +15%" -> { healing: 1.1 }
 */
function parseBalanceModifierText(text: string): Partial<ChampionBalanceData['stats']['aram']> {
  const stats: Partial<ChampionBalanceData['stats']['aram']> = {};
  
  // Pattern: "X modifier changed to Y% from Z%"
  const modifierMatch = text.match(/(outgoing\s+damage|incoming\s+damage|damage\s+dealt|damage\s+taken|healing|shielding|ability\s+haste|mana\s+regen|energy\s+regen|attack\s+speed|movement\s+speed|tenacity)\s+modifier\s+changed\s+to\s+([+-]?\d+(?:\.\d+)?%?)\s+from\s+([+-]?\d+(?:\.\d+)?%?)/i);
  
  if (!modifierMatch) {
    return stats;
  }
  
  const modifierType = modifierMatch[1].toLowerCase().replace(/\s+/g, '_');
  const newValueStr = modifierMatch[2];
  
  // Map modifier type to stat property
  const modifierMap: Record<string, string> = {
    'outgoing_damage': 'dmg_dealt',
    'damage_dealt': 'dmg_dealt',
    'incoming_damage': 'dmg_taken',
    'damage_taken': 'dmg_taken',
    'healing': 'healing',
    'shielding': 'shielding',
    'ability_haste': 'ability_haste',
    'mana_regen': 'mana_regen',
    'energy_regen': 'energy_regen',
    'attack_speed': 'attack_speed',
    'movement_speed': 'movement_speed',
    'tenacity': 'tenacity',
  };
  
  const statKey = modifierMap[modifierType];
  if (!statKey) {
    return stats;
  }
  
  // Parse the value
  const value = parsePercentageValue(newValueStr);
  
  // For ability haste, it's an absolute value, not a modifier
  if (statKey === 'ability_haste') {
    stats[statKey] = parseFloat(newValueStr);
  } else {
    stats[statKey] = value;
  }
  
  return stats;
}

/**
 * Converts percentage string to decimal value
 * Examples: "0%" -> 1.0, "-5%" -> 0.95, "+10%" -> 1.1
 */
function parsePercentageValue(valueStr: string): number {
  valueStr = valueStr.trim();
  
  if (valueStr.endsWith('%')) {
    const percent = parseFloat(valueStr.replace('%', ''));
    // The format is always relative to 100%
    // 0% = 1.0, -5% = 0.95, +10% = 1.1
    return 1.0 + (percent / 100);
  }
  
  return parseFloat(valueStr);
}

/**
 * Merges balance data from LoL Wiki with existing champion data
 * This is used for incremental updates
 */
function mergeBalanceData(
  existingData: BalanceData,
  wikiChanges: Map<string, Partial<ChampionBalanceData['stats']['aram']>>,
  championMapping: Map<string, { id: number; apiname: string; title: string }>
): BalanceData {
  const newData: BalanceData = JSON.parse(JSON.stringify(existingData));
  
  for (const [championName, stats] of Array.from(wikiChanges)) {
    const champInfo = championMapping.get(championName.toLowerCase());
    
    if (!champInfo) {
      console.warn(`Unknown champion: ${championName}`);
      continue;
    }
    
    const champId = champInfo.id.toString();
    
    // Initialize champion data if it doesn't exist
    if (!newData[champId]) {
      newData[champId] = {
        id: champInfo.id,
        name: champInfo.apiname,
        title: champInfo.title,
        stats: {}
      };
    }
    
    // Initialize ARAM stats if they don't exist
    if (!newData[champId].stats.aram) {
      newData[champId].stats.aram = {};
    }
    
    // Update the stats
    for (const [stat, value] of Object.entries(stats)) {
      if (value !== undefined && typeof value === 'number') {
        (newData[champId].stats.aram as any)[stat] = value;
      }
    }
    
    // Clean up default values (1.0 for dmg_dealt, dmg_taken, tenacity)
    if (newData[champId].stats.aram.dmg_dealt === 1.0) {
      delete newData[champId].stats.aram.dmg_dealt;
    }
    if (newData[champId].stats.aram.dmg_taken === 1.0) {
      delete newData[champId].stats.aram.dmg_taken;
    }
    if (newData[champId].stats.aram.tenacity === 1.0) {
      delete newData[champId].stats.aram.tenacity;
    }
    
    // Remove empty stats objects
    if (Object.keys(newData[champId].stats.aram).length === 0) {
      delete newData[champId].stats.aram;
    }
    if (Object.keys(newData[champId].stats).length === 0) {
      delete newData[champId].stats;
    }
  }
  
  return newData;
}

/**
 * Creates a champion name to ID mapping from Data Dragon
 * Falls back to a basic mapping if Data Dragon is unavailable
 */
async function createChampionMapping(): Promise<Map<string, { id: number; apiname: string; title: string }>> {
  const mapping = new Map<string, { id: number; apiname: string; title: string }>();
  
  try {
    // Fetch champion data from Data Dragon
    const versionsRes = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
    const versions = await versionsRes.json();
    const latestVersion = versions[0];
    
    const championsRes = await fetch(`https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/en_US/champion.json`);
    const championsData = await championsRes.json();
    
    // Build mapping from champion data
    for (const [, champData] of Object.entries(championsData.data) as any) {
      const id = parseInt(champData.key, 10);
      const name = champData.name;
      const apiname = champData.id;
      const title = champData.title;
      
      // Add mapping by display name (e.g., "Mordekaiser")
      mapping.set(name.toLowerCase(), { id, apiname, title });
      // Also add by API name in case it's different (e.g., "MonkeyKing" vs "Wukong")
      mapping.set(apiname.toLowerCase(), { id, apiname, title });
    }
  } catch (error) {
    console.warn('Failed to fetch champion data from Data Dragon, using fallback mapping:', error);
    // Fallback to basic mapping - this would need to be expanded
    createFallbackMapping(mapping);
  }
  
  return mapping;
}

/**
 * Creates a fallback champion mapping with some common champions
 * This should only be used if Data Dragon is unavailable
 */
function createFallbackMapping(mapping: Map<string, { id: number; apiname: string; title: string }>): void {
  // Add some common champions as fallback
  const fallbackChamps = [
    { id: 82, name: 'Mordekaiser', title: 'The Iron Revenant' },
    { id: 84, name: 'Akali', title: 'The Rogue Assassin' },
    { id: 233, name: 'Briar', title: 'The Restrained Hunger' },
    { id: 887, name: 'Gwen', title: 'The Hallowed Seamstress' },
    { id: 14, name: 'Sion', title: 'The Undead Juggernaut' },
    { id: 115, name: 'Ziggs', title: 'The Hexplosives Expert' },
  ];
  
  for (const champ of fallbackChamps) {
    mapping.set(champ.name.toLowerCase(), { id: champ.id, apiname: champ.name, title: champ.title });
  }
}

export {
  fetchLoLWikiPatchHistory,
  extractPatchSections,
  parseChampionBalanceFromSection,
  mergeBalanceData,
  createChampionMapping,
  type ChampionBalanceData,
  type BalanceData,
};
