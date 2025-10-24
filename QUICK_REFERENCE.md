# Quick Reference: Updating Balance Data

This is a quick reference guide for contributors who are already familiar with the update process. For detailed instructions, see [CONTRIBUTING.md](CONTRIBUTING.md).

## Quick Update Steps

```bash
# 1. Setup
git clone https://github.com/YOUR_USERNAME/balance-buff-viewer.git
cd balance-buff-viewer
npm install -g pnpm && pnpm install

# 2. Try automated update (if Fandom is updated)
pnpm crawl

# 3. Or manually edit dist/balance.json

# 4. Update package.json
# - Increment version (e.g., 15.15.1 -> 15.16.1)
# - Update data.patch (e.g., 15.16.1)
# - Update data.date (current ISO date)

# 5. Build and test
pnpm build

# 6. Submit
git add dist/balance.json package.json
git commit -m "chore: update balance data to patch X.X.X"
git push origin main
# Create PR on GitHub
```

## Value Conversion Reference

| In-Game Text | JSON Value | Example |
|--------------|------------|---------|
| +10% damage dealt | `"dmg_dealt": 1.10` | Lux deals +10% |
| -5% damage dealt | `"dmg_dealt": 0.95` | Yuumi deals -5% |
| +15% damage taken | `"dmg_taken": 1.15` | Squishy takes +15% |
| -10% damage taken | `"dmg_taken": 0.90` | Tank takes -10% |
| -20% healing | `"healing": 0.80` | Soraka heals -20% |
| +10 Ability Haste | `"ability_haste": 10` | Flat bonus |
| -5 Ability Haste | `"ability_haste": -5` | Flat penalty |

## Common Champion IDs

| Champion | ID | Champion | ID | Champion | ID |
|----------|----|-----------|----|----------|----|
| Aatrox | 266 | Jinx | 222 | Sylas | 517 |
| Ahri | 103 | Kai'Sa | 145 | Syndra | 134 |
| Akali | 84 | Katarina | 55 | Thresh | 412 |
| Ashe | 22 | Kayn | 141 | Tristana | 18 |
| Ezreal | 81 | Lee Sin | 64 | Viego | 234 |
| Jhin | 202 | Lux | 99 | Yasuo | 157 |
| Yuumi | 350 | Seraphine | 147 | Yone | 777 |
| Zed | 238 | Senna | 235 | Zoe | 142 |

**Find more**: https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-summary.json

## Game Mode Codes

- `aram` - ARAM (All Random All Mid)
- `urf` - URF (Ultra Rapid Fire) 
- `ar` - AR/URF (All Random URF)
- `nb` - Nexus Blitz
- `ofa` - One for All
- `usb` - Ultra Spell Book

## Example JSON Entry

```json
{
  "99": {
    "id": 99,
    "name": "Lux",
    "title": "The Lady Of Luminosity",
    "stats": {
      "aram": {
        "dmg_dealt": 1.05,
        "dmg_taken": 1.10,
        "shielding": 0.8
      },
      "urf": {
        "dmg_dealt": 0.95
      }
    }
  }
}
```

## Data Sources

1. **Official Patch Notes**: https://www.leagueoflegends.com/news/tags/patch-notes/
2. **ARAM Wiki**: https://leagueoflegends.fandom.com/wiki/ARAM
3. **In-game tooltips**: Most accurate, check in custom lobby

## Validation

```bash
# Validate JSON syntax
node -e "require('./dist/balance.json')"

# Build to check for errors
pnpm build
```

## Tips

- ✅ **Always** remove stats with value `1.0` (no change)
- ✅ **Always** update both `package.json` version and `data.patch`
- ✅ **Always** include source links in your PR
- ❌ **Don't** guess values - use official sources only
- ❌ **Don't** include champions with no balance changes
