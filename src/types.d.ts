
type GameMode = 'aram' | 'cherry' | 'nexusblitz' | 'urf' | 'arurf' | 'kiwi'
type GameFlowPhase = 'Lobby' | 'ChampSelect' | 'None'

interface GameFlowSession {
  map: {
    id: number
    gameMode: GameMode
    gameModeName: string
    gameModeShortName: string
  }
}

interface ChampSelectSession {
  gameId: number
  localPlayerCellId: number
  benchEnabled: boolean
  benchChampions: BenchChampion[]
  myTeam: Player[]
  theirTeam: Player[]
}

interface BenchChampion {
  championId: number
  isPriority: boolean
}

interface Player {
  assignedPosition: string
  cellId: number
  championId: number
  championPickIntent: number
  entitledFeatureType: string
  nameVisibilityType: string
  obfuscatedPuuid: string
  obfuscatedSummonerId: number
  puuid: string
  selectedSkinId: number
  spell1Id: number
  spell2Id: number
  summonerId: BigInt
  team: number
  wardSkinId: number
}

interface BalanceStats {
  dmg_dealt: number       // damage dealt modifier in aram as decimal (defaults to 1.0)
  dmg_taken: number       // damage taken modifier in aram as decimal (defaults to 1.0)
  healing: number         // healing modifier in aram as decimal
  shielding: number       // shielding modifier in aram as decimal
  ability_haste: number   // initial ability haste in aram as integer
  mana_regen: number      // mana regeneration modifier in aram as decimal
  energy_regen: number    // energy regeneration modifier in aram as decimal
  attack_speed: number    // total attack speed modifier in aram as decimal
  movement_speed: number  // movement speed modifier in aram as decimal
  tenacity: number        // tenacity and slow resistance modifier in aram as decimal (defaults to 1.0)
}

interface BalanceTooltipData {
  champId: number
  champName: string
  title: string
  description: string
}

declare module 'virtual:icons' {
  const icons: Record<string, Array<number>>
  export const mime: string
  export default icons
}