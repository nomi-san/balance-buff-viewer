# Data Source Migration: Fandom → LoL Wiki

## Overview

Starting with patch 25.15, the ARAM balance data source has been migrated from LoL Fandom to LoL Wiki due to Fandom becoming outdated.

## Data Sources

- **Patches < 25.15**: [LoL Fandom - Module:ChampionData/data](https://leagueoflegends.fandom.com/wiki/Module:ChampionData/data)
  - Format: Lua script with all game modes
  - Parser: luaparse
  
- **Patches >= 25.15**: [LoL Wiki - ARAM Patch History](https://wiki.leagueoflegends.com/en-us/ARAM/Patch_history)
  - Format: HTML page with patch notes
  - Parser: cheerio + custom pattern matching

## Implementation

### Modules

1. **scripts/_lolwiki.ts** - LoL Wiki parser
   - `fetchLoLWikiPatchHistory()` - Fetches HTML from LoL Wiki
   - `extractPatchSections()` - Parses patch version sections
   - `parseChampionBalanceFromSection()` - Extracts champion balance modifiers
   - `createChampionMapping()` - Builds champion name → ID mapping from Data Dragon
   - `mergeBalanceData()` - Merges new data with existing data

2. **scripts/_data.ts** - Data source abstraction
   - `buildBalanceBuffData()` - Parses Fandom Lua script (< 25.15)
   - `buildBalanceDataFromLoLWiki()` - Parses LoL Wiki HTML (>= 25.15)

3. **scripts/crawler.ts** - Main crawler
   - Automatically selects data source based on patch version
   
4. **scripts/updater.ts** - Automated updater
   - Detects patch version and uses appropriate data source

### Parsing Logic

The LoL Wiki parser:

1. **Identifies champion sections** in the HTML structure
2. **Filters balance modifiers** from ability-specific changes
   - ✅ Include: Direct child `<li>` elements with "modifier" text
   - ❌ Exclude: Nested `<li>` elements under ability names
3. **Extracts percentage values** using regex patterns
4. **Converts to decimal format**: 
   - 0% → 1.0 (no change)
   - -5% → 0.95 (5% reduction)
   - +10% → 1.1 (10% increase)

### Supported Modifiers

- Outgoing damage / Damage dealt → `dmg_dealt`
- Incoming damage / Damage taken → `dmg_taken`
- Healing → `healing`
- Shielding → `shielding`
- Ability haste → `ability_haste`
- Mana regen → `mana_regen`
- Energy regen → `energy_regen`
- Attack speed → `attack_speed`
- Movement speed → `movement_speed`
- Tenacity → `tenacity`

## Usage

### Crawl Current Patch

```bash
pnpm crawl          # Uses appropriate source based on package.json patch
pnpm crawl:lolwiki  # Force LoL Wiki (standalone)
```

### Update to Latest Patch

```bash
pnpm update          # Auto-detects and uses appropriate source
pnpm update:lolwiki  # Force LoL Wiki incremental update
```

## Known Limitations

1. **Hotfixes**: The LoL Wiki patch history may miss some hotfixes or hidden patch fixes (e.g., 25.15b) that include ARAM balance changes.

2. **ARAM Only**: The LoL Wiki parser currently only extracts ARAM balance data. Other game modes (URF, Nexus Blitz, etc.) still rely on Fandom data.

3. **HTML Structure Dependency**: The parser relies on the HTML structure of the LoL Wiki page. Changes to the page structure may require parser updates.

4. **Champion Name Mapping**: Champion names must match between LoL Wiki and Data Dragon. Unusual cases may require manual mapping.

## Migration Notes

- The migration is automatic and based on the patch version
- Existing data for patches < 25.15 is preserved
- No manual intervention required for normal updates
- The `package.json` `data.hash` field uses `lolwiki-{version}` format for LoL Wiki patches

## Testing

Run the parser tests with mock data:

```bash
npx tsx /tmp/test-parser.ts
```

The tests verify:
- Champion balance modifiers are correctly extracted
- Ability-specific changes are ignored
- Percentage values are correctly converted to decimals
- Unknown champions are handled gracefully
