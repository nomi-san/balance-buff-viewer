import { _t } from './i18n';

function ratioToBonus(n: number) {
  let text = parseFloat(((n - 1.0) * 100).toFixed(3)) + '%';
  if (n >= 1.0) text = '+' + text;
  return text;
}

export function getStatsText(stats: BalanceStats) {
  if (Object.keys(stats).length === 0) {
    return _t('no_stats');
  }

  const text = Array<string>();
  if (stats.dmg_dealt) text.push(_t('dmg_dealt', ratioToBonus(stats.dmg_dealt)));
  if (stats.dmg_taken) text.push(_t('dmg_taken', ratioToBonus(stats.dmg_taken)));
  if (stats.healing) text.push(_t('healing', ratioToBonus(stats.healing)));
  if (stats.shielding) text.push(_t('shielding', ratioToBonus(stats.shielding)));
  if (stats.ability_haste) text.push(_t('ability_haste', stats.ability_haste));
  if (stats.mana_regen) text.push(_t('mana_regen', ratioToBonus(stats.mana_regen)));
  if (stats.energy_regen) text.push(_t('energy_regen', ratioToBonus(stats.energy_regen)));
  if (stats.attack_speed) text.push(_t('attack_speed', ratioToBonus(stats.attack_speed)));
  if (stats.movement_speed) text.push(_t('movement_speed', ratioToBonus(stats.movement_speed)));
  if (stats.tenacity) text.push(_t('tenacity', ratioToBonus(stats.tenacity)));

  return text.join('\n');
}