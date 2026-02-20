<p>
  <img width="100%" src="https://github.com/nomi-san/balance-buff-viewer/assets/38210249/6120e251-d319-463e-9e83-1ec318ca10b3" alt="Preview image">
</p>

<p align="cennter">
  <h1 align="center">Balance Buff Viewer</h1>
  <p align="center">
    Game modes' balance buffs/nerfs viewer for 
      <a href="https://github.com/PenguLoader/PenguLoader" target="_blank">Pengu Loader</a>
  </p>
  <p align="center">
    <img src="https://img.shields.io/npm/v/balance-buff-viewer-plugin?style=for-the-badge" />
    <img src="https://img.shields.io/npm/d18m/balance-buff-viewer-plugin?style=for-the-badge" />
  </p>
</p>

### ⚡ Features

- [x] Friendly UI with tooltips
- [x] Stat icons and highlighting
- [x] Multilingual support (en/es-mx/ko/vi/zh)

### 🎮 Game modes support
  - [x] ARAM
  - [x] ARAM: Mayhem
  - [x] AR/URF
  - [x] Nexus Blitz
  - [x] Arena (2v2v2v2)
  - [ ] One for All
  - [ ] Ultra SpellBook

<br>

## 📦 Installation

<!-- <br>

For **Pengu Loader v1.1.2+**, click 👇 to install.

<a href="https://pengu.lol/get/#nomi-san/balance-buff-viewer" target="_blank">
  <img src ="https://img.shields.io/badge/pengu_install-balance_buff_viewer-607080.svg?&style=for-the-badge&logo=javascript&logoColor=white"/>
</a>

<br>
<br> -->

1. Download [balance-buff-viewer.js](https://github.com/nomi-san/balance-buff-viewer/releases/download/main/balance-buff-viewer.js) from the [Releases page](https://github.com/nomi-san/balance-buff-viewer/releases)
2. Put it in the **plugins** folder

```
Pengu Loader/
  |__ plugins/
    |__ balance-buff-viewer.js          ✅
```

<br>

## 🚀 Development

### Build from source

- Clone this repo to your plugins folder.
- NodeJS 18+ and pnpm are required to build.

```
pnpm i
pnpm crawl
pnpm build
```

### Contribute your translation

1. Find your locale by using Pengu DevTools -> inspect `<html>` tag
2. Add the translation to [src/trans.json](src/trans.json).
3. Open a new Pull Request 👌

### Npm package & Remote plugin

This plugin is already published to npm registry, check out: ([balance-buff-viewer-plugin](https://www.npmjs.com/package/balance-buff-viewer-plugin)).

The plugin entry will import its source via esm.sh CDN with @latest version, so it will be automatically updated when we publish a newer version.

```js
(() => import('https://esm.sh/balance-buff-viewer-plugin@latest'))();
```

In case of regional restrictions, you can use other CDNs:
- jsDelivr: `https://cdn.jsdelivr.net/npm/balance-buff-viewer-plugin@latest`
- UNPKG: `https://unpkg.com/balance-buff-viewer-plugin@latest`
- Skypack: `deprecated`

## 🍻 Credits
- Pengu Loader - https://pengu.lol
- Used icons - https://leagueoflegends.fandom.com/wiki
- Balance data - https://leagueoflegends.fandom.com/wiki/Module:ChampionData/data
- Balance data (after patch 25.15) - https://wiki.leagueoflegends.com/en-us/Module:ChampionData/data
- Thanks to [@BakaFT](https://github.com/BakaFT) for the original idea and Chinese translation.
- Thanks to [@hoon610](https://github.com/hoon610) for the Korean translation.
- Thanks to [@FrannDzs](https://github.com/FrannDzs) for the Mexican translation.
- Thanks to [@Triggered0](https://github.com/Triggered0) for the Turkish translation.
