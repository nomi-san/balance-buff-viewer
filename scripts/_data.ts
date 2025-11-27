import luaparse from 'luaparse';

const WIKI_DATA_URL = 'https://wiki.leagueoflegends.com/en-us/Module:ChampionData/data';

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

async function fetchDataScript() {
  const res = await fetch(WIKI_DATA_URL, {
    headers: {
      'Accept': '*/*',
      'User-Agent': 'curl/8.13.0',
    }
  });

  const html = await res.text();
  const start = `-- &lt;pre>`, end = `-- &lt;/pre>`;
  const startIdx = html.indexOf(start) + start.length;
  const endIdx = html.indexOf(end, startIdx);

  const script = html.substring(startIdx, endIdx);
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

function getField(fields: any[], key: string): any {
  if (Array.isArray(fields)) {
    key = `"${key}"`;
    for (const { key: k, value } of fields) {
      if (k.raw === key)
        return value;
    }
  }
}

function getFieldNumber(fields: any[], key: string): any {
  var field = getField(fields, key);
  if (field) {
    if (typeof field.value === 'number')
      return field.value;
    else if (field.operator === '-') {
      return -field.argument.value;
    }
  }
}

function getFieldString(fields: any[], key: string): any {
  var field = getField(fields, key);
  if (field) {
    return unquoteString(field.raw);
  }
}

function buildBalanceBuffData(script: string) {
  const data: Record<string, any> = {};
  const ast: any = luaparse.parse(script);
  const table = ast.body[0].arguments[0];

  for (const rootFields of table.fields) {
    const fields = rootFields.value.fields;
    const stats = getField(fields, 'stats');

    const champ = {
      id: getFieldNumber(fields, 'id') as number,
      name: getFieldString(fields, 'apiname'),
      title: capitalize(getFieldString(fields, 'title')),
      stats: {} as Record<string, any>,
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
  fetchDataScript,
  buildBalanceBuffData,
}