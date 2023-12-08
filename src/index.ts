import { loadTranslation, _t } from './i18n';
import { Tooltip } from './tooltip';
import { getStatsHtml } from './data';
import BALANCE_DATA from '../dist/balance.json';

// @ts-ignore
const VERSION = BALANCE_DATA['version'];
const GAME_MODES = ['aram', 'ar', 'nb', 'urf', 'arurf'];

const delay = (t: number) => new Promise(r => setTimeout(r, t));
const playerManager = () => document.getElementById('lol-uikit-layer-manager-wrapper')!;

let gameMode_ = '';
let tooltip_: Tooltip = null!;
let teamArray_ = Array<BalanceTooltipData>();
let benchArray_ = Array<BalanceTooltipData>();

function isSupportedMode(mode: string) {
  mode = mode.toLowerCase();
  if (mode === 'nexusblitz') {
    mode = 'nb';
  } else if (mode === 'cherry') {
    mode = 'ar';
  }
  gameMode_ = mode;
  return GAME_MODES.includes(mode);
}

function setBalanceTooltip(array: Array<BalanceTooltipData>, index: number, champId: number) {
  if (champId in BALANCE_DATA) {
    array[index] = {
      champId,
      champName: BALANCE_DATA[champId].name,
      title: _t('title') + ` v${VERSION}`,
      description: getStatsHtml(BALANCE_DATA[champId].stats?.[gameMode_]),
    };
  }
}

function update(session: ChampSelectSession) {
  if (!isSupportedMode(gameMode_))
    return;

  teamArray_ = [];
  benchArray_ = [];

  if (gameMode_ === 'ar') {
    let myCellId = session.localPlayerCellId;
    let myIndex = session.myTeam.findIndex(x => x.cellId === myCellId);
    let mateIndex = myIndex + ((myIndex % 2 === 0) ? 1 : -1);

    let me = session.myTeam[myIndex];
    let mate = session.myTeam[mateIndex];

    setBalanceTooltip(teamArray_, myIndex % 2, me.championPickIntent || me.championId);
    setBalanceTooltip(teamArray_, mateIndex % 2, mate.championPickIntent || mate.championId);

    return;
  }

  for (let i = 0; i < session.myTeam.length; ++i) {
    const player = session.myTeam[i];
    const champId = player.championPickIntent || player.championId;
    setBalanceTooltip(teamArray_, i, champId);
  }

  if (session.benchEnabled && Array.isArray(session.benchChampions)) {
    for (let i = 0; i < session.benchChampions.length; ++i) {
      const slot = session.benchChampions[i];
      const champId = slot.championId;
      setBalanceTooltip(benchArray_, i, champId);
    }
  }
}

async function mount() {
  const { map }: GameFlowSession = await fetch('/lol-gameflow/v1/session').then(r => r.json());
  if (!isSupportedMode(map.gameMode))
    return;

  const { benchEnabled }: ChampSelectSession = await fetch('/lol-champ-select/v1/session').then(r => r.json());

  let party: HTMLElement;
  tooltip_ = new Tooltip(playerManager());

  do {
    await delay(100);
    party = document.querySelector('.summoner-array.your-party')!;
  } while (!party);

  party.querySelectorAll('.summoner-container-wrapper').forEach((el, index) => {
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
}

function unmount() {
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

  window.addEventListener('blur', () => tooltip_?.hide());
}

window.addEventListener('load', load);