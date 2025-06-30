import { BattlePassTier, GameState } from '../types/game';

export const BATTLE_PASS_SEASON = 1;
export const BATTLE_PASS_PREMIUM_COST = 500; // crystals

export const BATTLE_PASS_TIERS: BattlePassTier[] = [
  {
    level: 1,
    xpRequired: 100,
    freeReward: { type: 'essence', value: 100, icon: '💰' },
    premiumReward: { type: 'crystals', value: 25, icon: '💎' }
  },
  {
    level: 2,
    xpRequired: 200,
    freeReward: { type: 'energy', value: 5, icon: '⚡' },
    premiumReward: { type: 'cosmetic', value: 'circle_theme_infernal', icon: '🔥' }
  },
  {
    level: 3,
    xpRequired: 300,
    freeReward: { type: 'essence', value: 200, icon: '💰' },
    premiumReward: { type: 'crystals', value: 50, icon: '💎' }
  },
  {
    level: 4,
    xpRequired: 500,
    freeReward: { type: 'crystals', value: 10, icon: '💎' },
    premiumReward: { type: 'cosmetic', value: 'particle_effect_divine', icon: '✨' }
  },
  {
    level: 5,
    xpRequired: 750,
    freeReward: { type: 'energy', value: 10, icon: '⚡' },
    premiumReward: { type: 'rune', value: 'battle_pass_exclusive', icon: '⚜️' }
  },
  {
    level: 6,
    xpRequired: 1000,
    freeReward: { type: 'essence', value: 500, icon: '💰' },
    premiumReward: { type: 'cosmetic', value: 'ui_theme_celestial', icon: '🌟' }
  },
  {
    level: 7,
    xpRequired: 1250,
    freeReward: { type: 'crystals', value: 25, icon: '💎' },
    premiumReward: { type: 'crystals', value: 100, icon: '💎' }
  },
  {
    level: 8,
    xpRequired: 1500,
    freeReward: { type: 'energy', value: 15, icon: '⚡' },
    premiumReward: { type: 'cosmetic', value: 'summon_animation_vortex', icon: '🌀' }
  },
  {
    level: 9,
    xpRequired: 2000,
    freeReward: { type: 'essence', value: 750, icon: '💰' },
    premiumReward: { type: 'exclusive_entity', value: 'battle_pass_demon', icon: '👹' }
  },
  {
    level: 10,
    xpRequired: 2500,
    freeReward: { type: 'crystals', value: 50, icon: '💎' },
    premiumReward: { type: 'exclusive_entity', value: 'battle_pass_divine', icon: '👑' }
  }
];

export const getBattlePassXPForAction = (action: string): number => {
  switch (action) {
    case 'summon': return 10;
    case 'collect_entity': return 15;
    case 'sacrifice_entity': return 20;
    case 'daily_login': return 50;
    case 'complete_achievement': return 100;
    case 'rare_summon': return 25;
    case 'legendary_summon': return 50;
    case 'mythic_summon': return 100;
    default: return 0;
  }
};

export const addBattlePassXP = (gameState: GameState, xp: number): GameState => {
  const newXP = gameState.battlePassXP + xp;
  let newLevel = gameState.battlePassLevel;
  let remainingXP = newXP;

  // Calculate level ups
  while (newLevel < BATTLE_PASS_TIERS.length) {
    const currentTier = BATTLE_PASS_TIERS[newLevel];
    if (remainingXP >= currentTier.xpRequired) {
      remainingXP -= currentTier.xpRequired;
      newLevel++;
    } else {
      break;
    }
  }

  return {
    ...gameState,
    battlePassXP: remainingXP,
    battlePassLevel: newLevel
  };
};

export const canClaimBattlePassReward = (gameState: GameState, tier: number, isPremium: boolean): boolean => {
  if (tier > gameState.battlePassLevel) return false;
  if (isPremium && !gameState.battlePassPremium) return false;
  return !gameState.battlePassRewardsClaimed.includes(tier * (isPremium ? 2 : 1));
};

export const claimBattlePassReward = (gameState: GameState, tier: number, isPremium: boolean): GameState => {
  if (!canClaimBattlePassReward(gameState, tier, isPremium)) return gameState;

  const battlePassTier = BATTLE_PASS_TIERS[tier - 1];
  const reward = isPremium ? battlePassTier.premiumReward : battlePassTier.freeReward;
  
  if (!reward) return gameState;

  let updatedState = {
    ...gameState,
    battlePassRewardsClaimed: [...gameState.battlePassRewardsClaimed, tier * (isPremium ? 2 : 1)]
  };

  // Apply reward
  switch (reward.type) {
    case 'essence':
      updatedState.totalEssence += reward.value as number;
      break;
    case 'crystals':
      updatedState.essenceCrystals += reward.value as number;
      break;
    case 'energy':
      updatedState.currentEnergy = Math.min(updatedState.maxEnergy, updatedState.currentEnergy + (reward.value as number));
      break;
    case 'cosmetic':
      updatedState.unlockedCosmetics = [...updatedState.unlockedCosmetics, reward.value as string];
      break;
  }

  return updatedState;
};

export const purchaseBattlePassPremium = (gameState: GameState): GameState => {
  if (gameState.essenceCrystals < BATTLE_PASS_PREMIUM_COST || gameState.battlePassPremium) {
    return gameState;
  }

  return {
    ...gameState,
    essenceCrystals: gameState.essenceCrystals - BATTLE_PASS_PREMIUM_COST,
    battlePassPremium: true
  };
};