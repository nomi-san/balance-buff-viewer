# Frequently Asked Questions (FAQ)

## General Questions

### Why is the balance data inaccurate or outdated?

The plugin previously relied on the [League of Legends Fandom Wiki](https://leagueoflegends.fandom.com/wiki/Module:ChampionData/data) as its automated data source. Since patch 25.15, this source has not been consistently updated, causing the plugin to show outdated balance values.

**Solution**: We now rely on community contributions to manually update the balance data. See the [Contributing Guide](CONTRIBUTING.md) for how you can help!

### How do I know if the data is outdated?

Check the patch version shown in the balance tooltip when hovering over champions in champion select. If it shows a version older than the current League patch, the data may be outdated.

Current plugin version shows: **v25.15**

### Can I still use the plugin with outdated data?

Yes, the plugin will continue to work. However, the balance values shown may not be accurate for the current patch. Some champions may have had their balance changes modified since the data was last updated.

## Contributing Questions

### I'm not a developer. Can I still help?

Absolutely! You don't need to be a programmer to contribute balance data. If you can:
- Read patch notes
- Copy values from official sources
- Edit a JSON file (similar to a text file)

Then you can contribute! See our [Contributing Guide](CONTRIBUTING.md) for step-by-step instructions.

### Where do I find the official balance data?

The best sources are:

1. **Official Riot Patch Notes**: https://www.leagueoflegends.com/news/tags/patch-notes/
   - Most authoritative source
   - Released every 2 weeks

2. **In-Game Tooltips**: 
   - Create a custom ARAM/URF game
   - Hover over champions in select
   - Check the balance values shown

3. **Community Wikis** (use as backup):
   - https://leagueoflegends.fandom.com/wiki/ARAM

### How often does the balance data need updating?

League of Legends releases patches approximately every 2 weeks. Balance changes for game modes like ARAM and URF typically occur:
- **ARAM**: Almost every patch
- **URF**: When the mode is available (typically a few times per year)
- **Arena**: When the mode is available (seasonal)
- **Nexus Blitz**: When the mode is available (rare)

### What if I make a mistake?

Don't worry! All contributions go through:
1. **Pull Request Review**: Maintainers will review your changes
2. **Community Feedback**: Other users can spot errors
3. **Version Control**: Git allows us to revert any incorrect changes

It's better to contribute and make a small mistake than not contribute at all. We appreciate all efforts!

### I updated one champion's data. Should I submit?

Yes! Even small contributions are valuable. You don't need to update all champions in a patch - updating even a single champion helps the community.

### What if Fandom starts updating again?

Great! If Fandom becomes reliable again, we can switch back to automated updates. Your manual contributions will still be valuable as a historical record and backup.

## Technical Questions

### Why is `dist/balance.json` tracked in git?

Unlike most build artifacts, `dist/balance.json` is tracked in version control because:
1. It's the **source of truth** for balance data
2. It's required to build the plugin
3. It contains valuable contributor work that should be preserved
4. Changes to it should be reviewed in pull requests

### How do I test my changes without installing in League client?

You can test the JSON validity and build process:

```bash
# Validate JSON syntax
node -e "require('./dist/balance.json')"

# Build the plugin
pnpm build
```

For full functionality testing, you'll need to test in the actual League client with Pengu Loader.

### Can I automate my own data updates?

Yes! If you have programming skills, you can:
1. Fork this repository
2. Create your own data scraper
3. Set up automated updates via GitHub Actions
4. Submit pull requests with your automated updates

Just ensure your data source is accurate and cite your sources in the PR.

### What's the difference between `_patch` and `_gamePatch`?

- **`_patch`**: The package/plugin version (e.g., `15.15.1`)
- **`_gamePatch`**: The actual League of Legends game patch (e.g., `25.15`)

The relationship is: `_gamePatch = _patch.major + 10 . _patch.minor`

For example: package version `15.15.1` corresponds to game patch `25.15`

### How do I find a champion's ID?

See the [Contributing Guide](CONTRIBUTING.md#finding-champion-ids) for multiple methods, including:
- Data Dragon API
- Community Dragon API  
- Quick reference table in [QUICK_REFERENCE.md](QUICK_REFERENCE.md)

## Usage Questions

### The plugin shows "no balance stats" for a champion. Why?

This means one of:
1. The champion has no balance changes in that game mode (default/normal values)
2. The champion is very new and hasn't been added to the data yet
3. The data file is incomplete

Champions with all stats at `1.0` (no change) are automatically filtered out.

### Why do some stats show percentages and others show flat numbers?

Different stats work differently:
- **Percentages** (multipliers): Damage dealt, damage taken, healing, shielding, etc.
  - `1.1` = +10%
  - `0.9` = -10%
  
- **Flat numbers**: Ability haste
  - `10` = +10 ability haste
  - `-5` = -5 ability haste

### Does this work for all game modes?

Currently supported:
- ✅ ARAM
- ✅ URF
- ✅ AR/URF (All Random URF)
- ✅ Nexus Blitz
- ✅ Arena (2v2v2v2)

Not yet implemented:
- ❌ One for All
- ❌ Ultra Spell Book

## Need More Help?

- 📖 Read the [Contributing Guide](CONTRIBUTING.md)
- 📝 Check the [Quick Reference](QUICK_REFERENCE.md)
- 🐛 [Report an issue](https://github.com/nomi-san/balance-buff-viewer/issues/new/choose)
- 💬 Ask in the pull request or issue discussions

Thank you for your interest in keeping Balance Buff Viewer accurate! 🎮
