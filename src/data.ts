import { _t } from './i18n';
import { getIconUrl } from './icons';

// 1.1 => +10%; 0.95 => -5%
function ratioToBonus(n: number) {
  let text = parseFloat(((n - 1.0) * 100).toFixed(3)) + '%';
  if (n >= 1.0) text = '+' + text;
  return text;
}

function isBuff(stat: string, value: number) {
  // positive cooldown
  if (stat === 'ability_haste')
    return value >= 0;
  // negative damage taken
  if (stat === 'dmg_taken')
    return value < 1.0;
  // otherwise all bonus
  return value >= 1.0;
}

export function getStatsHtml(stats: BalanceStats) {
  // no balance stats
  if (typeof(stats) !== 'object' || Object.keys(stats).length === 0) {
    return _t('no_stats');
  }

  const html = Array<string>();

  for (const key in stats) {
    const value = stats[key];
    if (typeof value === 'number') {
      const text = _t(key as any);
      const color = isBuff(key, value) ? 'limegreen' : 'tomato';
      const stat = key === 'ability_haste' ? value : ratioToBonus(value);
      const icon = `<img src="${getIconUrl(key)}" loading="lazy" decoding="async" width="14" height="14" alt="" style="margin-right:4px" />`;
      html.push(`<div style="display:flex;align-items:center;margin-bottom:3px">${icon} ${text} <span style="color:${color}">${stat}</span></div>`);
    }
  }

  return html.join('');
}