import { loadTranslation, _t } from './i18n';
import { Tooltip } from './tooltip';
import { getStatsHtml } from './data';
import BALANCE_DATA from '../dist/balance.json';

const delay = (t: number) => new Promise(r => setTimeout(r, t));
const playerManager = () => document.getElementById('lol-uikit-layer-manager-wrapper')!;

let gameMode_ = '';
let tooltip_: Tooltip = null!;
let teamArray_ = Array<BalanceTooltipData>();
let benchArray_ = Array<BalanceTooltipData>();

function isValidGameMode() {
  return gameMode_ === 'aram' || gameMode_ === 'urf';
}

function update(session: ChampSelectSession) {
  if (!isValidGameMode())
    return;

  teamArray_ = [];
  for (const { championId } of session.myTeam) {
    if (championId) {
      const stats = BALANCE_DATA[championId].stats[gameMode_];
      if (stats) {
        teamArray_.push({
          champId: championId,
          champName: BALANCE_DATA[championId].name,
          title: _t('title'),
          description: getStatsHtml(stats),
        });
        continue;
      }
      teamArray_.push(null!);
    }
  }

  if (session.benchEnabled) {
    benchArray_ = [];
    for (const { championId } of session.benchChampions) {
      if (championId) {
        const stats = BALANCE_DATA[championId].stats[gameMode_];
        if (stats) {
          benchArray_.push({
            champId: championId,
            champName: BALANCE_DATA[championId].name,
            title: _t('title'),
            description: getStatsHtml(stats),
          });
          continue;
        }
      }
      benchArray_.push(null!);
    }
  }
}

async function mount() {
  console.log('MOUNT');

  const { map }: GameFlowSession = await fetch('/lol-gameflow/v1/session').then(r => r.json());
  const { benchEnabled }: ChampSelectSession = await fetch('/lol-champ-select/v1/session').then(r => r.json());

  gameMode_ = map.gameMode.toLowerCase();
  if (!isValidGameMode()) return;

  tooltip_ = new Tooltip(playerManager());

  let party: HTMLElement;
  do {
    await delay(100);
    party = document.querySelector('.summoner-array.your-party')!;
  } while (!party);

  party.querySelectorAll('.summoner-container-wrapper').forEach((el, index) => {
    console.log('MOUNTING', index);
    el.addEventListener('mouseout', () => tooltip_.hide());
    el.addEventListener('mouseover', () => {
      const data = teamArray_[index];
      if (data) tooltip_.show(el, 'right', data.title, data.description);
    });
  });

  if (benchEnabled) {
    document.querySelectorAll('.bench-container .champion-bench-item').forEach((el, index) => {
      el.addEventListener('mouseout', () => tooltip_.hide());
      el.addEventListener('mouseover', () => {
        const data = benchArray_[index];
        if (data) tooltip_.show(el, 'bottom', data.title, data.description);
      });
    });
  }

  console.log('MOUNTED');
}

function unmount() {
  console.log('UNMOUNT');

  gameMode_ = '';
  tooltip_?.hide();
  tooltip_ = null!;
  teamArray_ = [];
  benchArray_ = [];
}

async function load() {
  while (!playerManager()) {
    await delay(500);
  }

  loadTranslation();

  const link = document.querySelector('link[rel="riot:plugins:websocket"]') as HTMLAnchorElement;
  const ws = new WebSocket(link.href, 'wamp');

  const EP_SESSION = 'OnJsonApiEvent/lol-champ-select/v1/session'.replace(/\//g, '_');
  const EP_GAMEFLOW = 'OnJsonApiEvent/lol-gameflow/v1/gameflow-phase'.replace(/\//g, '_');

  ws.onopen = () => {
    console.log('WS OPENED');
    ws.send(JSON.stringify([5, EP_SESSION]));
    ws.send(JSON.stringify([5, EP_GAMEFLOW]));
  };

  ws.onmessage = (e) => {
    const [, endpoint, { data }] = JSON.parse(e.data);

    if (endpoint === EP_SESSION) {
      update(data);
    } else if (endpoint === EP_GAMEFLOW) {
      if (data === 'ChampSelect') {
        mount();
      } else if (data === 'None') {
        unmount();
      }
    }
  };
}

window.addEventListener('load', load);