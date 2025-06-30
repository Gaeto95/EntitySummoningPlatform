import { Achievement, Entity, GameState } from '../types/game';

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_summon',
    name: 'First Contact',
    description: 'Summon your first entity',
    icon: '🌟',
    unlocked: false,
    reward: { type: 'essence', value: 50 }
  },
  {
    id: 'first_sacrifice',
    name: 'First Blood',
    description: 'Make your first sacrifice',
    icon: '🔥',
    unlocked: false,
    reward: { type: 'crystals', value: 10 }
  },
  {
    id: 'energy_master',
    name: 'Energy Master',
    description: 'Reach maximum energy capacity',
    icon: '⚡',
    unlocked: false,
    reward: { type: 'energy', value: 5 }
  },
  {
    id: 'daily_devotee',
    name: 'Daily Devotee',
    description: 'Maintain a 7-day login streak',
    icon: '📅',
    unlocked: false,
    reward: { type: 'crystals', value: 25 }
  },
  {
    id: 'streak_master',
    name: 'Streak Master',
    description: 'Achieve a 30-day login streak',
    icon: '🔥',
    unlocked: false,
    reward: { type: 'crystals', value: 100 }
  },
  {
    id: 'collector_10',
    name: 'Novice Collector',
    description: 'Collect 10 entities',
    icon: '📚',
    unlocked: false,
    reward: { type: 'essence', value: 100 }
  },
  {
    id: 'collector_50',
    name: 'Master Collector',
    description: 'Collect 50 entities',
    icon: '🏆',
    unlocked: false,
    reward: { type: 'feature', value: 'entity_fusion' }
  },
  {
    id: 'summoner_100',
    name: 'Legendary Summoner',
    description: 'Perform 100 summons',
    icon: '⚡',
    unlocked: false,
    reward: { type: 'crystals', value: 50 }
  },
  {
    id: 'streak_10',
    name: 'Ritual Master',
    description: 'Achieve a 10-summon streak',
    icon: '🔮',
    unlocked: false,
    reward: { type: 'crystals', value: 25 }
  },
  {
    id: 'rare_hunter',
    name: 'Rare Hunter',
    description: 'Collect 5 rare entities',
    icon: '💎',
    unlocked: false,
    reward: { type: 'essence', value: 200 }
  },
  {
    id: 'legendary_hunter',
    name: 'Legendary Hunter',
    description: 'Collect a legendary entity',
    icon: '👑',
    unlocked: false,
    reward: { type: 'crystals', value: 30 }
  },
  {
    id: 'shiny_hunter',
    name: 'Shiny Hunter',
    description: 'Collect a shiny entity',
    icon: '✨',
    unlocked: false,
    reward: { type: 'crystals', value: 50 }
  },
  {
    id: 'essence_master',
    name: 'Essence Master',
    description: 'Accumulate 1000 essence',
    icon: '💰',
    unlocked: false,
    reward: { type: 'feature', value: 'essence_shop' }
  },
  {
    id: 'crystal_collector',
    name: 'Crystal Collector',
    description: 'Accumulate 100 essence crystals',
    icon: '💎',
    unlocked: false,
    reward: { type: 'energy', value: 10 }
  },
  {
    id: 'vip_member',
    name: 'VIP Member',
    description: 'Purchase VIP membership',
    icon: '👑',
    unlocked: false,
    reward: { type: 'crystals', value: 25 }
  },
  {
    id: 'prestige_first',
    name: 'Ascension',
    description: 'Reach your first prestige level',
    icon: '🌠',
    unlocked: false,
    reward: { type: 'feature', value: 'prestige_bonuses' }
  }
];

export const checkAchievements = (
  gameState: GameState,
  entities: Entity[],
  currentAchievements: Achievement[]
): Achievement[] => {
  const updatedAchievements = [...currentAchievements];
  
  ACHIEVEMENTS.forEach((achievement, index) => {
    if (updatedAchievements[index]?.unlocked) return;
    
    let shouldUnlock = false;
    
    switch (achievement.id) {
      case 'first_summon':
        shouldUnlock = gameState.totalSummons >= 1;
        break;
      case 'first_sacrifice':
        shouldUnlock = gameState.totalSacrifices >= 1;
        break;
      case 'energy_master':
        shouldUnlock = gameState.currentEnergy >= gameState.maxEnergy && gameState.maxEnergy >= 10;
        break;
      case 'daily_devotee':
        shouldUnlock = gameState.loginStreak >= 7;
        break;
      case 'streak_master':
        shouldUnlock = gameState.loginStreak >= 30;
        break;
      case 'collector_10':
        shouldUnlock = entities.length >= 10;
        break;
      case 'collector_50':
        shouldUnlock = entities.length >= 50;
        break;
      case 'summoner_100':
        shouldUnlock = gameState.totalSummons >= 100;
        break;
      case 'streak_10':
        shouldUnlock = gameState.bestStreak >= 10;
        break;
      case 'rare_hunter':
        shouldUnlock = entities.filter(e => e.rarity === 'rare').length >= 5;
        break;
      case 'legendary_hunter':
        shouldUnlock = entities.some(e => e.rarity === 'legendary');
        break;
      case 'shiny_hunter':
        shouldUnlock = entities.some(e => e.isShiny);
        break;
      case 'essence_master':
        shouldUnlock = gameState.totalEssence >= 1000;
        break;
      case 'crystal_collector':
        shouldUnlock = gameState.essenceCrystals >= 100;
        break;
      case 'vip_member':
        shouldUnlock = gameState.vipLevel > 0;
        break;
      case 'prestige_first':
        shouldUnlock = gameState.prestigeLevel >= 1;
        break;
    }
    
    if (shouldUnlock) {
      updatedAchievements[index] = {
        ...achievement,
        unlocked: true,
        unlockedAt: Date.now()
      };
    }
  });
  
  return updatedAchievements;
};