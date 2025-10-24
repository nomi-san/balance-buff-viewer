# Contributing to Balance Buff Viewer

Thank you for your interest in contributing to Balance Buff Viewer! This guide will help you update the balance data when the automated data source becomes outdated.

## Background

The balance data is sourced from [League of Legends Fandom Wiki](https://leagueoflegends.fandom.com/wiki/Module:ChampionData/data), which may become outdated or unavailable. Since patch 25.15, the Fandom data has not been updated regularly, so **manual updates from contributors are essential** to keep the plugin accurate.

## How to Update Balance Data

### Prerequisites

- Node.js 18 or higher
- pnpm package manager
- Git
- A fork of this repository

### Step 1: Find Official Balance Data

Balance data for different game modes can be found in the official League of Legends patch notes:

1. **Official Patch Notes**: https://www.leagueoflegends.com/en-us/news/tags/patch-notes/
   - Look for sections like "ARAM Balance Changes", "URF Balance Changes", "Arena Balance Changes", etc.

2. **Community Wikis** (alternative sources):
   - https://leagueoflegends.fandom.com/wiki/ARAM
   - https://leagueoflegends.fandom.com/wiki/URF
   - https://leagueoflegends.fandom.com/wiki/Arena

3. **Game Client**: Check in-game tooltips for the most accurate current data

### Step 2: Understand the Data Structure

The balance data is stored in `dist/balance.json` with the following structure:

```json
{
  "_patch": "15.15.1",
  "_gamePatch": "25.15",
  "266": {
    "id": 266,
    "name": "Aatrox",
    "title": "The Darkin Blade",
    "stats": {
      "aram": {
        "dmg_dealt": 1.05,
        "dmg_taken": 0.95,
        "healing": 0.9
      },
      "urf": {
        "dmg_dealt": 1.1
      }
    }
  }
}
```

#### Supported Game Modes

- `aram` - ARAM (All Random All Mid)
- `ar` - AR/URF (All Random Ultra Rapid Fire)
- `urf` - URF (Ultra Rapid Fire)
- `nb` - Nexus Blitz
- `ofa` - One for All (not yet implemented)
- `usb` - Ultra Spell Book (not yet implemented)

#### Supported Stats

- `dmg_dealt` - Damage dealt multiplier (1.0 = normal, 1.1 = +10% damage)
- `dmg_taken` - Damage taken multiplier (1.0 = normal, 0.9 = -10% damage taken)
- `healing` - Healing multiplier (1.0 = normal, 0.8 = -20% healing)
- `shielding` - Shielding multiplier
- `ability_haste` - Ability haste bonus (flat value, not multiplier)
- `mana_regen` - Mana regeneration multiplier
- `energy_regen` - Energy regeneration multiplier
- `attack_speed` - Attack speed multiplier
- `movement_speed` - Movement speed multiplier
- `tenacity` - Tenacity multiplier

**Note**: A value of `1.0` means no change and will be automatically removed from the data.

### Step 3: Manual Data Update Process

#### Option A: Update via Fandom (when available)

If the Fandom wiki has been updated:

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/balance-buff-viewer.git
cd balance-buff-viewer

# Install dependencies
npm install -g pnpm
pnpm install

# Run the crawler to fetch data from Fandom
pnpm crawl

# Build the plugin
pnpm build

# Test the changes (see Step 4)
```

#### Option B: Manual JSON Update (when Fandom is outdated)

When the Fandom source is outdated, you need to manually update the balance data:

1. **Clone and setup**:
```bash
git clone https://github.com/YOUR_USERNAME/balance-buff-viewer.git
cd balance-buff-viewer
npm install -g pnpm
pnpm install
```

2. **Generate initial data structure** (if `dist/balance.json` doesn't exist):
```bash
# This may fail if Fandom is down, but might create a partial file
pnpm crawl || true

# If that doesn't work, create a minimal balance.json file:
mkdir -p dist
cat > dist/balance.json << 'EOF'
{
  "_patch": "15.15.1",
  "_gamePatch": "25.15"
}
EOF
```

**Important**: The `dist/balance.json` file is tracked in git (exception to the `dist/` ignore rule) because it's required for building the plugin and contains the data updates.

3. **Manually edit the balance data**:
   - Open or create `dist/balance.json`
   - Update the `_patch` and `_gamePatch` fields to match the current League patch
   - For each champion that has balance changes:
     - Find the champion ID from [Data Dragon](https://ddragon.leagueoflegends.com/cdn/dragontail-15.15.1.tgz) or the [Champion List](https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-summary.json)
     - Add or update their stats under the appropriate game mode

4. **Example update for a single champion**:

Let's say Lux has new ARAM balance changes in patch 25.16:
- Deals +5% damage
- Takes +10% damage
- -20% shield power

```json
{
  "_patch": "15.16.1",
  "_gamePatch": "25.16",
  "99": {
    "id": 99,
    "name": "Lux",
    "title": "The Lady Of Luminosity",
    "stats": {
      "aram": {
        "dmg_dealt": 1.05,
        "dmg_taken": 1.10,
        "shielding": 0.8
      }
    }
  }
}
```

5. **Update package.json**:
   - Increment the version number (patch version)
   - Update the `data.patch` field to the new patch version
   - Update the `data.date` to current date
   - Update the `data.hash` (you can use a random value or calculate from your data)

```json
{
  "version": "15.16.1",
  "data": {
    "patch": "15.16.1",
    "hash": "your-sha1-hash-here",
    "date": "2025-10-24T18:00:00.000Z"
  }
}
```

6. **Build the plugin**:
```bash
pnpm build
```

### Step 4: Test Your Changes

1. **Verify the JSON structure**:
```bash
# Check if the JSON is valid
node -e "console.log('Valid JSON:', !!require('./dist/balance.json'))"
```

2. **Test in Pengu Loader** (recommended):
   - Copy the built `dist/index.js` to your Pengu Loader plugins folder as `balance-buff-viewer.js`
   - Launch League of Legends client
   - Check the balance tooltips in champion select for ARAM/URF/other modes
   - Verify the displayed percentages match the official patch notes

3. **Visual verification**:
   - Create a custom lobby for ARAM or URF
   - Hover over champion portraits in champion select
   - The tooltip should show "Balance Data V{patch}" with the updated stats
   - Compare with official patch notes to ensure accuracy

### Step 5: Submit Your Changes

1. **Commit your changes**:
```bash
git add dist/balance.json package.json
git commit -m "chore: update balance data to patch {version}"
```

2. **Push to your fork**:
```bash
git push origin main
```

3. **Create a Pull Request**:
   - Go to https://github.com/nomi-san/balance-buff-viewer
   - Click "New Pull Request"
   - Select your fork and branch
   - Title: `Update balance data to patch {version}`
   - Description: Include:
     - Patch version
     - Source of the data (patch notes URL)
     - List of champions updated
     - Any special notes about the changes

## Finding Champion IDs

Champion IDs are needed to update the balance data. Here are several ways to find them:

### Method 1: Data Dragon API
```bash
# Download champion data
curl https://ddragon.leagueoflegends.com/cdn/15.15.1/data/en_US/champion.json | jq
```

### Method 2: Community Dragon
```bash
# Champion summary with IDs
curl https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-summary.json | jq
```

### Method 3: Common Champion IDs Reference

Here are some commonly balanced champions for quick reference:

| Champion | ID | Champion | ID | Champion | ID |
|----------|----|-----------|----|----------|----|
| Aatrox | 266 | Lux | 99 | Yasuo | 157 |
| Ahri | 103 | Malphite | 54 | Yone | 777 |
| Akali | 84 | Maokai | 57 | Yuumi | 350 |
| Ashe | 22 | Master Yi | 11 | Zed | 238 |
| Blitzcrank | 53 | Miss Fortune | 21 | Ziggs | 115 |
| Lux | 99 | Seraphine | 147 | Zoe | 142 |

For a complete list, use one of the API methods above.

## Data Accuracy Guidelines

When updating balance data:

1. **Always use official sources**: Prefer official patch notes over community wikis
2. **Double-check percentages**: 
   - In-game: "+10% damage" → JSON: `"dmg_dealt": 1.10`
   - In-game: "-10% damage taken" → JSON: `"dmg_taken": 0.90`
   - Flat ability haste is stored as-is: "+10 AH" → `"ability_haste": 10`
3. **Test before submitting**: Always test in the actual game client if possible
4. **Remove 1.0 values**: Values of exactly 1.0 mean "no change" and should be omitted
5. **Document your sources**: Include patch notes URLs in your PR description

## Automation Scripts

### Update Script Behavior

The `pnpm update` script (`scripts/updater.ts`) automatically:
1. Fetches the latest LoL patch version
2. Checks if Fandom data has been updated
3. Updates `package.json` and `dist/balance.json` if changes are found
4. Increments the package version

If Fandom is outdated, this script will exit with code 1, indicating manual update is needed.

### Crawler Script

The `pnpm crawl` script (`scripts/crawler.ts`):
1. Fetches balance data from Fandom wiki
2. Parses the Lua script data
3. Generates `dist/balance.json`

This is useful when Fandom is updated but you need to regenerate the JSON.

## Translation Updates

If you'd like to contribute translations for the balance stat names:

1. Check your locale code in the League client (use Pengu DevTools)
2. Edit `src/trans.json`
3. Add your translations for each stat key
4. Submit a PR with title: `Add {language} translation`

See the [main README](README.md#contribute-your-translation) for more details.

## Questions?

If you have questions about contributing:
- Open an issue: https://github.com/nomi-san/balance-buff-viewer/issues
- Check existing PRs for examples
- Contact the maintainer: @nomi-san

Thank you for helping keep Balance Buff Viewer accurate and up-to-date! 🎮
