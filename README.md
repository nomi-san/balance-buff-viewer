<img align="left" src="https://i.imgur.com/YgFjlxu.png" width="128" height="128" />

# Balance Buff Viewer
Game modes' balance buffs/nerfs viewer for [Pengu Loader](https://github.com/PenguLoader/PenguLoader).

<br>

### ⚡ Features
- [x] Friendly UI with tooltips
- [x] Multilingual support
- [x] ARAM balance
- [x] ARURF/URF balance

### 📝 Todo
- [ ] One for All
- [ ] Nexus Blitz
- [ ] Ultra SpellBook

### 📷 Screenshots

<img width="500" src="https://github.com/nomi-san/balance-buff-viewer/assets/38210249/7b249bea-ff5c-477e-92cf-8489ac3fe576" />
<br>

<img width="500" src="https://github.com/nomi-san/balance-buff-viewer/assets/38210249/b0659d36-351c-46da-a287-59c40581b7ab" />
<br>

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

### npm package & remote plugin

This plugins is also a npm package ([balance-buff-viewer-plugin](https://www.npmjs.com/package/balance-buff-viewer-plugin)).
The plugin entry will import it's source via Skypack CDN with @latest version, it will be automatically updated when we publish a newer version.

```js
import 'https://cdn.skypack.dev/balance-buff-viewer-plugin@latest?min';
```

In case of regional restrictions, you can use other ESM CDNs:
- esm.sh
- esm.run
- unpkg

## 🍻 Credits
- Pengu Loader: https://pengu.lol
- LoL Fandom Module:ChampionData: https://leagueoflegends.fandom.com/wiki/Module:ChampionData/data
- Original idea & zh-CN translation: [@BakaFT](https://github.com/BakaFT)
