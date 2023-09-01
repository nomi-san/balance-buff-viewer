<p>
  <img width="100%" src="https://github.com/nomi-san/balance-buff-viewer/assets/38210249/6120e251-d319-463e-9e83-1ec318ca10b3" alt="Preview image">
</p>

# Balance Buff Viewer

Game modes' balance buffs/nerfs viewer for [Pengu Loader](https://github.com/PenguLoader/PenguLoader).

### ⚡ Features

- [x] Friendly UI with tooltips
- [x] Stat icons and highlighting
- [x] Multilingual support (en/vi/zh)
- [x] ARAM balance stats
- [x] ARURF/URF balance stats

### 📝 Todo

- [ ] One for All balance stats
- [ ] Nexus Blitz balance stats
- [ ] Ultra SpellBook balance stats

<br>

## 🔨 Installation

👉 Goto [Release](https://github.com/nomi-san/balance-buff-viewer/releases) to download the plugin.

<br>

### Build from source

- Clone this repo to your plugins folder.
- NodeJS 16+ and pnpm are required to build.

```
pnpm i
pnpm crawl
pnpm build
```

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
- Pengu Loader: https://pengu.lol
- Icons: https://leagueoflegends.fandom.com/wiki
- Balance data: https://leagueoflegends.fandom.com/wiki/Module:ChampionData/data
- Original idea & zh-CN translation: [@BakaFT](https://github.com/BakaFT)
