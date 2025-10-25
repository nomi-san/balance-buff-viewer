# Implementation Summary: LoL Wiki ARAM Balance Data Crawler

## Overview
Successfully implemented a new data crawler for ARAM balance data that uses LoL Wiki instead of the outdated Fandom source (for patches >= 25.15).

## What Was Implemented

### 1. LoL Wiki Parser Module (`scripts/_lolwiki.ts`)
A comprehensive HTML parser that:
- Fetches patch history from https://wiki.leagueoflegends.com/en-us/ARAM/Patch_history
- Uses cheerio for robust HTML parsing
- Extracts patch version sections
- Identifies champion balance modifiers
- Filters out ability-specific changes (which should be ignored)
- Converts percentage values to decimal format (0% → 1.0, -5% → 0.95, +10% → 1.1)
- Maps champion names to IDs using Data Dragon API
- Merges new data with existing balance data

### 2. Data Source Abstraction (`scripts/_data.ts`)
Enhanced the existing module to support both data sources:
- `buildBalanceBuffData()` - For Fandom Lua script (patches < 25.15)
- `buildBalanceDataFromLoLWiki()` - For LoL Wiki HTML (patches >= 25.15)
- Automatic source selection based on patch version

### 3. Updated Main Scripts
- **crawler.ts**: Auto-selects data source based on current patch version
- **updater.ts**: Handles updates from both Fandom and LoL Wiki sources
- Both scripts maintain backward compatibility

### 4. Standalone Scripts (Optional)
- **crawler-lolwiki.ts**: Standalone LoL Wiki crawler
- **updater-lolwiki.ts**: Standalone incremental updater
- These provide explicit control when needed

## Technical Details

### Parsing Strategy
The parser uses a multi-step approach:

1. **HTML Fetching**: Downloads the full patch history page
2. **Section Extraction**: Identifies patch version headers (h1, h2, h3)
3. **Champion Identification**: Finds champion names in list items
4. **Modifier Filtering**: 
   - ✅ Includes: Direct child `<li>` with "modifier" text
   - ❌ Excludes: Nested `<li>` under ability names
5. **Value Parsing**: Regex-based extraction of percentage values
6. **Data Conversion**: Percentage → decimal conversion
7. **Champion Mapping**: Uses Data Dragon for name → ID lookup

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

## Testing Results

### Unit Tests (Parsing Logic)
✅ **All tests passed (5/5)**
- Outgoing damage: 0% → 1.0 ✓
- Incoming damage: 0% → 1.0 ✓
- Healing: +10% → 1.1 ✓
- Damage dealt: -8% → 0.92 ✓
- Damage taken: -5% → 0.95 ✓

### Integration Tests (Cheerio + Parser)
✅ **All tests passed**
- Champion name extraction ✓
- Balance modifier identification ✓
- Ability change filtering ✓
- Nested structure handling ✓

### Quality Checks
✅ **Code Review**: 0 issues found
✅ **Security Scan (CodeQL)**: 0 vulnerabilities detected

## How to Use

### For End Users
No changes required. The system automatically:
1. Detects the current patch version
2. Selects the appropriate data source
3. Crawls and parses the data
4. Updates the balance.json file

### For Developers

**Crawl current patch:**
```bash
pnpm crawl
```

**Update to latest patch:**
```bash
pnpm update
```

**Force LoL Wiki (for testing):**
```bash
pnpm crawl:lolwiki
pnpm update:lolwiki
```

## Migration Path

The implementation uses a hybrid approach:
- **Patches < 25.15**: Continue using Fandom (proven, stable)
- **Patches >= 25.15**: Switch to LoL Wiki (current, maintained)

This ensures:
- ✅ Historical data integrity
- ✅ Smooth transition
- ✅ No breaking changes
- ✅ Future-proof updates

## Known Limitations

1. **Hotfixes**: The LoL Wiki may not immediately reflect hotfixes (e.g., 25.15b). These require manual monitoring.

2. **ARAM Only**: The LoL Wiki parser currently only handles ARAM balance data. Other game modes (URF, Nexus Blitz, etc.) still rely on Fandom.

3. **HTML Structure**: The parser depends on the LoL Wiki HTML structure. If the wiki changes its format, the parser may need updates.

4. **Champion Names**: Unusual champion names or special characters may require manual mapping in the fallback list.

## Recommendations

1. **Monitor First Run**: When the system runs for the first time with patch >= 25.15, verify the output manually.

2. **Hotfix Handling**: For critical hotfixes, consider running `pnpm update:lolwiki` manually to force an update.

3. **Wiki Structure Changes**: If the parser fails, check the LoL Wiki page structure and update the parser accordingly.

4. **Data Verification**: Periodically compare the parsed data with the wiki page to ensure accuracy.

## Success Criteria

✅ **All criteria met:**
- [x] Parses LoL Wiki ARAM patch history
- [x] Extracts champion balance modifiers
- [x] Ignores ability-specific changes
- [x] Supports incremental updates from patch 25.15
- [x] Maintains backward compatibility
- [x] No security vulnerabilities
- [x] Comprehensive documentation
- [x] Tested and validated

## Conclusion

The implementation successfully addresses the issue of outdated Fandom data by introducing a robust LoL Wiki parser. The hybrid approach ensures continuity while enabling future updates from the maintained LoL Wiki source.

**Status**: ✅ **COMPLETE AND READY FOR PRODUCTION**
