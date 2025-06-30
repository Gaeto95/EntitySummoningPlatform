export interface Entity {
  id: string;
  name: string;
  type: 'demon' | 'divine' | 'ancient';
  rarity: 'common' | 'rare' | 'legendary' | 'mythic';
  personality: string;
  sigil: string;
  aura: string;
  power: number;
  domain: string;
  manifestationText: string;
  level: number;
  experience: number;
  abilities: string[];
  collectedAt: number;
  isShiny?: boolean;
  dialogue: string[];
  mood: 'content' | 'angry' | 'pleased' | 'neutral';
  loyalty: number;
  // New cosmetic properties
  skinId?: string;
  particleEffect?: string;
  summonAnimation?: string;
  // New battle properties
  stats?: EntityStats;
  skills?: BattleSkill[];
}

export interface EntityStats {
  health: number;
  attack: number;
  defense: number;
  speed: number;
  critRate: number;
  critDamage: number;
  resistance: number;
}

export interface BattleSkill {
  id: string;
  name: string;
  description: string;
  damage: number;
  cooldown: number;
  currentCooldown: number;
  type: 'attack' | 'defense' | 'buff' | 'debuff' | 'heal';
  target: 'single' | 'all' | 'self';
  element?: 'fire' | 'water' | 'earth' | 'air' | 'light' | 'dark' | 'neutral';
  effects?: SkillEffect[];
}

export interface SkillEffect {
  type: 'damage' | 'heal' | 'buff' | 'debuff' | 'dot' | 'hot';
  stat?: 'health' | 'attack' | 'defense' | 'speed' | 'critRate' | 'critDamage' | 'resistance';
  value: number;
  duration?: number;
}

export interface BattleState {
  id: string;
  status: 'waiting' | 'active' | 'completed';
  player1: {
    id: string;
    username: string;
    entities: Entity[];
    currentEntityIndex: number;
  };
  player2: {
    id: string;
    username: string;
    entities: Entity[];
    currentEntityIndex: number;
  };
  turn: number;
  currentTurn: 'player1' | 'player2';
  winner?: 'player1' | 'player2' | 'draw';
  logs: BattleLog[];
  rewards?: BattleRewards;
}

export interface BattleLog {
  turn: number;
  playerId: string;
  entityId: string;
  entityName: string;
  action: string;
  target: string;
  damage?: number;
  healing?: number;
  effects?: string[];
}

export interface BattleRewards {
  essence: number;
  crystals: number;
  experience: number;
  rankPoints?: number;
}

export interface PvPRank {
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master';
  division: 1 | 2 | 3 | 4 | 5;
  points: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
  reward?: {
    type: 'rune' | 'essence' | 'power' | 'feature' | 'energy' | 'crystals' | 'battlepass_xp' | 'cosmetic';
    value: string | number;
  };
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'story' | 'achievement';
  category: 'summoning' | 'collection' | 'progression' | 'social' | 'exploration';
  icon: string;
  objectives: QuestObjective[];
  rewards: QuestReward[];
  isActive: boolean;
  isCompleted: boolean;
  completedAt?: number;
  expiresAt?: number;
  unlockRequirement?: string;
  priority: 'low' | 'medium' | 'high';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
}

export interface QuestObjective {
  id: string;
  description: string;
  type: 'summon' | 'collect' | 'sacrifice' | 'login' | 'spend' | 'achieve' | 'evolve' | 'gacha_pull';
  target: number;
  current: number;
  isCompleted: boolean;
  conditions?: {
    entityType?: 'demon' | 'divine' | 'ancient';
    entityRarity?: 'common' | 'rare' | 'legendary' | 'mythic';
    runeType?: string;
    consecutive?: boolean;
    timeLimit?: number;
  };
}

export interface QuestReward {
  type: 'essence' | 'crystals' | 'energy' | 'battlepass_xp' | 'cosmetic' | 'rune' | 'vip_time';
  amount: number;
  icon: string;
  description: string;
}

export interface GameState {
  totalSummons: number;
  totalSacrifices: number;
  totalEssence: number;
  currentStreak: number;
  bestStreak: number;
  prestigeLevel: number;
  unlockedFeatures: string[];
  lastPlayDate: number;
  playtime: number;
  // Energy System
  currentEnergy: number;
  maxEnergy: number;
  lastEnergyUpdate: number;
  energyRegenRate: number; // minutes per energy
  // Premium Currency
  essenceCrystals: number;
  // VIP System
  vipLevel: number;
  vipExpiry: number;
  // Daily Login
  loginStreak: number;
  lastLoginDate: string;
  dailyRewardsClaimed: boolean;
  // Battle Pass System
  battlePassLevel: number;
  battlePassXP: number;
  battlePassSeason: number;
  battlePassPremium: boolean;
  battlePassRewardsClaimed: number[];
  // Gacha System
  pityCounter: number;
  guaranteedLegendaryCounter: number;
  bannerPulls: Record<string, number>;
  // Storage System
  grimoireSlots: number;
  maxGrimoireSlots: number;
  // Cosmetics
  unlockedCosmetics: string[];
  equippedCosmetics: {
    circleTheme: string;
    particleEffect: string;
    uiTheme: string;
    summonAnimation: string;
  };
  // Quest System
  activeQuests: string[];
  completedQuests: string[];
  questProgress: Record<string, QuestObjective[]>;
  lastQuestRefresh: string;
  questStats: {
    totalCompleted: number;
    dailyCompleted: number;
    weeklyCompleted: number;
    storyCompleted: number;
  };
  // PvP System
  pvpRank?: PvPRank;
  pvpStats?: {
    wins: number;
    losses: number;
    draws: number;
    winStreak: number;
    bestWinStreak: number;
    totalBattles: number;
    seasonRankPoints: number;
  };
}

export interface RitualEvent {
  id: string;
  name: string;
  description: string;
  type: 'complication' | 'blessing' | 'visitor' | 'cosmic';
  effect: (gameState: GameState) => GameState;
  choices?: {
    text: string;
    effect: (gameState: GameState) => GameState;
  }[];
}

export interface WeatherState {
  type: 'clear' | 'stormy' | 'mystical' | 'eclipse' | 'aurora';
  intensity: number;
  effects: {
    summonBonus: number;
    rareChance: number;
    powerMultiplier: number;
  };
}

export interface DailyReward {
  day: number;
  type: 'essence' | 'crystals' | 'energy' | 'rune';
  amount: number;
  icon: string;
  claimed: boolean;
}

export interface VIPBenefit {
  level: number;
  name: string;
  benefits: string[];
  maxEnergy: number;
  energyRegenRate: number; // minutes per energy
  dailyBonuses: {
    essence: number;
    crystals: number;
    energy: number;
  };
  price: number; // in crystals per month
}

export interface BattlePassTier {
  level: number;
  xpRequired: number;
  freeReward?: {
    type: 'essence' | 'crystals' | 'energy' | 'cosmetic' | 'rune';
    value: string | number;
    icon: string;
  };
  premiumReward?: {
    type: 'essence' | 'crystals' | 'energy' | 'cosmetic' | 'rune' | 'exclusive_entity';
    value: string | number;
    icon: string;
  };
}

export interface SummonBanner {
  id: string;
  name: string;
  description: string;
  featuredEntities: string[];
  rateUpMultiplier: number;
  startDate: number;
  endDate: number;
  cost: number;
  currency: 'essence' | 'crystals';
  guaranteedLegendaryAt: number;
  icon: string;
  background: string;
}

export interface CosmeticItem {
  id: string;
  name: string;
  description: string;
  type: 'circle_theme' | 'particle_effect' | 'ui_theme' | 'summon_animation' | 'entity_skin';
  rarity: 'common' | 'rare' | 'legendary' | 'mythic';
  price: number;
  currency: 'essence' | 'crystals';
  preview: string;
  unlockCondition?: string;
  seasonal?: boolean;
  icon: string;
}