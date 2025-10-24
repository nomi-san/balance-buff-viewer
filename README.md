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

### 🎮 Game modes
  - [x] ARAM
  - [x] AR/URF
  - [x] Nexus Blitz
  - [x] Arena (2v2v2v2)
  - [ ] One for All
  - [ ] Ultra SpellBook

> **⚠️ Data Accuracy Notice**  
> The automated balance data source (LoL Fandom) may be outdated since patch 25.15. If you notice inaccurate data, please consider [contributing updates](CONTRIBUTING.md#how-to-update-balance-data)! Community contributions are essential to keep the data current.

<br>

## 🔨 Installation

<br>

For **Pengu Loader v1.1.2+**, click 👇 to install.

<a href="https://pengu.lol/get/#nomi-san/balance-buff-viewer" target="_blank">
  <img src ="https://img.shields.io/badge/pengu_install-balance_buff_viewer-607080.svg?&style=for-the-badge&logo=javascript&logoColor=white"/>
</a>

<br>
<br>

Or goto 👉 [Releases page](https://github.com/nomi-san/balance-buff-viewer/releases) to download the plugin manually.

<br>

### Build from source

- Clone this repo to your plugins folder.
- NodeJS 18+ and pnpm are required to build.

```
pnpm i
pnpm crawl
pnpm build
```

### Contribute your translation

1. Find your locale by using Pengu DevTools.
2. Add your translation to [src/trans.json](src/trans.json).
3. Open a new Pull Request 👌

### Contribute balance data updates

Since patch 25.15, the automated data source (LoL Fandom) may be outdated. You can help by manually updating the balance data when new patches are released!

📖 **[Read the Contributing Guide](CONTRIBUTING.md)** for detailed instructions on:
- How to update balance data manually
- Finding official patch notes and data sources
- Testing your changes
- Submitting updates via Pull Request

We greatly appreciate community contributions to keep the balance data accurate! 🙏

### Remote plugin

This plugins is also a npm package ([balance-buff-viewer-plugin](https://www.npmjs.com/package/balance-buff-viewer-plugin)).
The plugin entry will import its source via Skypack CDN with @latest version, so it will be automatically updated when we publish a newer version.

```js
import 'https://cdn.skypack.dev/balance-buff-viewer-plugin?min';
```

In case of regional restrictions, you can use other ESM CDNs:
- esm.sh
- esm.run
- unpkg

## 🍻 Credits
- Pengu Loader - https://pengu.lol
- Used icons - https://leagueoflegends.fandom.com/wiki
- Balance data - https://leagueoflegends.fandom.com/wiki/Module:ChampionData/data
- Thanks to [@BakaFT](https://github.com/BakaFT) for the original idea and Chinese translation.
- Thanks to [@hoon610](https://github.com/hoon610) for the Korean translation.
- Thanks to [@FrannDzs](https://github.com/FrannDzs) for the Mexican translation.
