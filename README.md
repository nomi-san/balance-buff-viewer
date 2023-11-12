<p>
  <img width="100%" src="https://github.com/nomi-san/balance-buff-viewer/assets/38210249/6120e251-d319-463e-9e83-1ec318ca10b3" alt="Preview image">
</p>

# Balance Buff Viewer

Game modes' balance buffs/nerfs viewer for [Pengu Loader](https://github.com/PenguLoader/PenguLoader).

### ⚡ Features

- [x] Friendly UI with tooltips
- [x] Stat icons and highlighting
- [x] Multilingual support (en/es-mx/ko/vi/zh)
- [x] ARAM balance stats
- [x] AR/URF balance stats
- [x] Nexus Blitz balance stats

### 📝 Todo

- [ ] One for All balance stats
- [ ] Ultra SpellBook balance stats

<br>

## 🔨 Installation

<br>

<a href="https://github.com/nomi-san/balance-buff-viewer">
  <img src ="https://img.shields.io/badge/pengu_plugin-balance_buff_viewer-607080.svg?&style=for-the-badge&logo=javascript&logoColor=white"/>
</a>

<br>
<br>

For **Pengu Loader v1.1.2+**, just drag n drop the button above into your Pengu app.

Or goto 👉 [Releases page](https://github.com/nomi-san/balance-buff-viewer/releases) to download the plugin.

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
