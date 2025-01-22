import luaparse from 'luaparse';
import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import pkg from '../package.json';

const FANDOM_DATA_URL = 'https://leagueoflegends.fandom.com/wiki/Module:ChampionData/data';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36';

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
  const start = "<pre class='mw-code mw-script' dir='ltr'>", end = "</pre>";
  const startIdx = data.indexOf(start) + start.length;
  const endIdx = data.indexOf(end, startIdx);

  const script = data.substring(startIdx, endIdx);
  return script
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

async function main() {
  const script = await getFandomDataScript();
  console.log(script)
  const data = buildBalanceBuffData(script);

  const version = pkg['game-patch'];
  data['version'] = version;

  const json = JSON.stringify(data, null, 2);
  const outdir = path.join(process.cwd(), 'dist');
  const outpath = path.join(outdir, 'balance.json');

  if (!existsSync(outdir)) {
    await fs.mkdir(outdir);
  }
  await fs.writeFile(outpath, json);
}

main()
  .then(() => console.log('Successfully parsed fandom data.'))
  .catch((err) => (console.log('Failed to parse fandom data.', err), process.exit(1)))
  ;