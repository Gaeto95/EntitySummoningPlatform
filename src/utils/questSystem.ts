import { Quest, QuestObjective, QuestReward, GameState, Entity } from '../types/game';

// Quest Templates
export const QUEST_TEMPLATES: Quest[] = [
  // Daily Quests
  {
    id: 'daily_summon_3',
    name: 'Daily Ritual',
    description: 'Perform 3 summoning rituals',
    type: 'daily',
    category: 'summoning',
    icon: '🔮',
    objectives: [
      {
        id: 'summon_count',
        description: 'Summon 3 entities',
        type: 'summon',
        target: 3,
        current: 0,
        isCompleted: false
      }
    ],
    rewards: [
      { type: 'essence', amount: 150, icon: '💰', description: '150 Essence' },
      { type: 'battlepass_xp', amount: 50, icon: '⭐', description: '50 Battle Pass XP' }
    ],
    isActive: true,
    isCompleted: false,
    priority: 'medium',
    difficulty: 'easy'
  },
  {
    id: 'daily_collect_2',
    name: 'Entity Collector',
    description: 'Collect 2 entities to your grimoire',
    type: 'daily',
    category: 'collection',
    icon: '📚',
    objectives: [
      {
        id: 'collect_count',
        description: 'Collect 2 entities',
        type: 'collect',
        target: 2,
        current: 0,
        isCompleted: false
      }
    ],
    rewards: [
      { type: 'crystals', amount: 25, icon: '💎', description: '25 Essence Crystals' },
      { type: 'energy', amount: 5, icon: '⚡', description: '5 Energy' }
    ],
    isActive: true,
    isCompleted: false,
    priority: 'medium',
    difficulty: 'easy'
  },
  {
    id: 'daily_sacrifice_1',
    name: 'Power Seeker',
    description: 'Sacrifice 1 entity for power',
    type: 'daily',
    category: 'progression',
    icon: '🔥',
    objectives: [
      {
        id: 'sacrifice_count',
        description: 'Sacrifice 1 entity',
        type: 'sacrifice',
        target: 1,
        current: 0,
        isCompleted: false
      }
    ],
    rewards: [
      { type: 'essence', amount: 100, icon: '💰', description: '100 Essence' },
      { type: 'battlepass_xp', amount: 30, icon: '⭐', description: '30 Battle Pass XP' }
    ],
    isActive: true,
    isCompleted: false,
    priority: 'low',
    difficulty: 'easy'
  },

  // Weekly Quests
  {
    id: 'weekly_rare_hunter',
    name: 'Rare Entity Hunter',
    description: 'Summon 5 rare or better entities',
    type: 'weekly',
    category: 'summoning',
    icon: '💎',
    objectives: [
      {
        id: 'rare_summon_count',
        description: 'Summon 5 rare+ entities',
        type: 'summon',
        target: 5,
        current: 0,
        isCompleted: false,
        conditions: {
          entityRarity: 'rare'
        }
      }
    ],
    rewards: [
      { type: 'crystals', amount: 100, icon: '💎', description: '100 Essence Crystals' },
      { type: 'battlepass_xp', amount: 200, icon: '⭐', description: '200 Battle Pass XP' },
      { type: 'cosmetic', amount: 1, icon: '🎨', description: 'Random Cosmetic' }
    ],
    isActive: true,
    isCompleted: false,
    priority: 'high',
    difficulty: 'medium'
  },
  {
    id: 'weekly_demon_master',
    name: 'Demon Master',
    description: 'Collect 10 demon entities',
    type: 'weekly',
    category: 'collection',
    icon: '👹',
    objectives: [
      {
        id: 'demon_collect_count',
        description: 'Collect 10 demon entities',
        type: 'collect',
        target: 10,
        current: 0,
        isCompleted: false,
        conditions: {
          entityType: 'demon'
        }
      }
    ],
    rewards: [
      { type: 'essence', amount: 500, icon: '💰', description: '500 Essence' },
      { type: 'battlepass_xp', amount: 150, icon: '⭐', description: '150 Battle Pass XP' },
      { type: 'rune', amount: 1, icon: '⚜️', description: 'Demon Rune Unlock' }
    ],
    isActive: true,
    isCompleted: false,
    priority: 'high',
    difficulty: 'medium'
  },
  {
    id: 'weekly_gacha_enthusiast',
    name: 'Gacha Enthusiast',
    description: 'Perform 20 gacha pulls',
    type: 'weekly',
    category: 'summoning',
    icon: '🎰',
    objectives: [
      {
        id: 'gacha_pull_count',
        description: 'Perform 20 gacha pulls',
        type: 'gacha_pull',
        target: 20,
        current: 0,
        isCompleted: false
      }
    ],
    rewards: [
      { type: 'crystals', amount: 200, icon: '💎', description: '200 Essence Crystals' },
      { type: 'battlepass_xp', amount: 300, icon: '⭐', description: '300 Battle Pass XP' }
    ],
    isActive: true,
    isCompleted: false,
    priority: 'medium',
    difficulty: 'hard'
  },

  // Story Quests
  {
    id: 'story_first_steps',
    name: 'First Steps into Darkness',
    description: 'Complete your first summoning ritual',
    type: 'story',
    category: 'progression',
    icon: '🌟',
    objectives: [
      {
        id: 'first_summon',
        description: 'Perform your first summon',
        type: 'summon',
        target: 1,
        current: 0,
        isCompleted: false
      }
    ],
    rewards: [
      { type: 'essence', amount: 200, icon: '💰', description: '200 Essence' },
      { type: 'crystals', amount: 50, icon: '💎', description: '50 Essence Crystals' },
      { type: 'battlepass_xp', amount: 100, icon: '⭐', description: '100 Battle Pass XP' }
    ],
    isActive: true,
    isCompleted: false,
    priority: 'high',
    difficulty: 'easy'
  },
  {
    id: 'story_grimoire_keeper',
    name: 'Grimoire Keeper',
    description: 'Build a collection of 25 entities',
    type: 'story',
    category: 'collection',
    icon: '📖',
    objectives: [
      {
        id: 'collection_size',
        description: 'Collect 25 entities',
        type: 'collect',
        target: 25,
        current: 0,
        isCompleted: false
      }
    ],
    rewards: [
      { type: 'essence', amount: 1000, icon: '💰', description: '1000 Essence' },
      { type: 'crystals', amount: 100, icon: '💎', description: '100 Essence Crystals' },
      { type: 'cosmetic', amount: 1, icon: '🎨', description: 'Legendary Cosmetic' }
    ],
    isActive: false,
    isCompleted: false,
    unlockRequirement: 'Complete First Steps into Darkness',
    priority: 'high',
    difficulty: 'medium'
  },
  {
    id: 'story_legendary_summoner',
    name: 'Legendary Summoner',
    description: 'Summon your first legendary entity',
    type: 'story',
    category: 'summoning',
    icon: '👑',
    objectives: [
      {
        id: 'legendary_summon',
        description: 'Summon 1 legendary entity',
        type: 'summon',
        target: 1,
        current: 0,
        isCompleted: false,
        conditions: {
          entityRarity: 'legendary'
        }
      }
    ],
    rewards: [
      { type: 'crystals', amount: 200, icon: '💎', description: '200 Essence Crystals' },
      { type: 'battlepass_xp', amount: 500, icon: '⭐', description: '500 Battle Pass XP' },
      { type: 'rune', amount: 1, icon: '⚜️', description: 'Legendary Rune' }
    ],
    isActive: false,
    isCompleted: false,
    unlockRequirement: 'Summon 10 entities',
    priority: 'high',
    difficulty: 'hard'
  },

  // Achievement-based Quests
  {
    id: 'achievement_streak_master',
    name: 'Streak Master',
    description: 'Maintain a 7-day login streak',
    type: 'achievement',
    category: 'progression',
    icon: '🔥',
    objectives: [
      {
        id: 'login_streak',
        description: 'Login for 7 consecutive days',
        type: 'login',
        target: 7,
        current: 0,
        isCompleted: false,
        conditions: {
          consecutive: true
        }
      }
    ],
    rewards: [
      { type: 'crystals', amount: 150, icon: '💎', description: '150 Essence Crystals' },
      { type: 'vip_time', amount: 3, icon: '👑', description: '3 Days VIP' },
      { type: 'battlepass_xp', amount: 300, icon: '⭐', description: '300 Battle Pass XP' }
    ],
    isActive: true,
    isCompleted: false,
    priority: 'medium',
    difficulty: 'medium'
  },
  {
    id: 'achievement_big_spender',
    name: 'Big Spender',
    description: 'Spend 1000 essence in the shop',
    type: 'achievement',
    category: 'progression',
    icon: '💸',
    objectives: [
      {
        id: 'essence_spent',
        description: 'Spend 1000 essence',
        type: 'spend',
        target: 1000,
        current: 0,
        isCompleted: false
      }
    ],
    rewards: [
      { type: 'essence', amount: 500, icon: '💰', description: '500 Essence Refund' },
      { type: 'crystals', amount: 75, icon: '💎', description: '75 Essence Crystals' }
    ],
    isActive: true,
    isCompleted: false,
    priority: 'low',
    difficulty: 'medium'
  }
];

// Quest Management Functions
export const initializeQuestSystem = (gameState: GameState): GameState => {
  const today = new Date().toDateString();
  
  // Initialize quest system if not present
  if (!gameState.activeQuests) {
    return {
      ...gameState,
      activeQuests: [],
      completedQuests: [],
      questProgress: {},
      lastQuestRefresh: today,
      questStats: {
        totalCompleted: 0,
        dailyCompleted: 0,
        weeklyCompleted: 0,
        storyCompleted: 0
      }
    };
  }

  return gameState;
};

export const refreshDailyQuests = (gameState: GameState): GameState => {
  const today = new Date().toDateString();
  
  if (gameState.lastQuestRefresh !== today) {
    // Get daily quest templates
    const dailyQuests = QUEST_TEMPLATES.filter(q => q.type === 'daily');
    
    // Reset daily quest progress
    const newActiveQuests = [
      ...gameState.activeQuests.filter(id => {
        const quest = QUEST_TEMPLATES.find(q => q.id === id);
        return quest && quest.type !== 'daily';
      }),
      ...dailyQuests.map(q => q.id)
    ];

    // Reset daily quest progress
    const newQuestProgress = { ...gameState.questProgress };
    dailyQuests.forEach(quest => {
      newQuestProgress[quest.id] = quest.objectives.map(obj => ({ ...obj, current: 0, isCompleted: false }));
    });

    return {
      ...gameState,
      activeQuests: newActiveQuests,
      questProgress: newQuestProgress,
      lastQuestRefresh: today
    };
  }

  return gameState;
};

export const updateQuestProgress = (
  gameState: GameState,
  action: {
    type: 'summon' | 'collect' | 'sacrifice' | 'login' | 'spend' | 'gacha_pull';
    entity?: Entity;
    amount?: number;
  }
): GameState => {
  let updatedState = { ...gameState };
  let updatedProgress = { ...gameState.questProgress };
  let hasCompletedQuest = false;

  // Update progress for all active quests
  gameState.activeQuests.forEach(questId => {
    const quest = QUEST_TEMPLATES.find(q => q.id === questId);
    if (!quest) return;

    const currentProgress = updatedProgress[questId] || quest.objectives.map(obj => ({ ...obj }));
    let questUpdated = false;

    currentProgress.forEach((objective, index) => {
      if (objective.isCompleted || objective.type !== action.type) return;

      // Check if action matches objective conditions
      let shouldUpdate = true;
      if (objective.conditions && action.entity) {
        if (objective.conditions.entityType && action.entity.type !== objective.conditions.entityType) {
          shouldUpdate = false;
        }
        if (objective.conditions.entityRarity) {
          const rarityOrder = ['common', 'rare', 'legendary', 'mythic'];
          const requiredIndex = rarityOrder.indexOf(objective.conditions.entityRarity);
          const entityIndex = rarityOrder.indexOf(action.entity.rarity);
          if (entityIndex < requiredIndex) {
            shouldUpdate = false;
          }
        }
      }

      if (shouldUpdate) {
        const increment = action.amount || 1;
        objective.current = Math.min(objective.target, objective.current + increment);
        objective.isCompleted = objective.current >= objective.target;
        questUpdated = true;

        if (objective.isCompleted) {
          console.log(`Quest objective completed: ${objective.description}`);
        }
      }
    });

    if (questUpdated) {
      updatedProgress[questId] = currentProgress;
      
      // Check if entire quest is completed
      const allObjectivesComplete = currentProgress.every(obj => obj.isCompleted);
      if (allObjectivesComplete && !updatedState.completedQuests.includes(questId)) {
        updatedState.completedQuests = [...updatedState.completedQuests, questId];
        hasCompletedQuest = true;
        
        // Update quest stats
        updatedState.questStats = {
          ...updatedState.questStats,
          totalCompleted: updatedState.questStats.totalCompleted + 1,
          [quest.type === 'daily' ? 'dailyCompleted' : 
           quest.type === 'weekly' ? 'weeklyCompleted' : 
           quest.type === 'story' ? 'storyCompleted' : 'totalCompleted']: 
           updatedState.questStats[quest.type === 'daily' ? 'dailyCompleted' : 
                                   quest.type === 'weekly' ? 'weeklyCompleted' : 
                                   quest.type === 'story' ? 'storyCompleted' : 'totalCompleted'] + 1
        };

        console.log(`Quest completed: ${quest.name}`);
      }
    }
  });

  return {
    ...updatedState,
    questProgress: updatedProgress
  };
};

export const claimQuestReward = (gameState: GameState, questId: string): GameState => {
  const quest = QUEST_TEMPLATES.find(q => q.id === questId);
  if (!quest || !gameState.completedQuests.includes(questId)) {
    return gameState;
  }

  let updatedState = { ...gameState };

  // Apply rewards
  quest.rewards.forEach(reward => {
    switch (reward.type) {
      case 'essence':
        updatedState.totalEssence += reward.amount;
        break;
      case 'crystals':
        updatedState.essenceCrystals += reward.amount;
        break;
      case 'energy':
        updatedState.currentEnergy = Math.min(updatedState.maxEnergy, updatedState.currentEnergy + reward.amount);
        break;
      case 'battlepass_xp':
        // This would integrate with the battle pass system
        break;
      case 'vip_time':
        const vipTimeMs = reward.amount * 24 * 60 * 60 * 1000; // Convert days to milliseconds
        updatedState.vipExpiry = Math.max(updatedState.vipExpiry, Date.now()) + vipTimeMs;
        if (updatedState.vipLevel === 0) updatedState.vipLevel = 1;
        break;
    }
  });

  // Remove from active quests
  updatedState.activeQuests = updatedState.activeQuests.filter(id => id !== questId);

  return updatedState;
};

export const getActiveQuests = (gameState: GameState): Quest[] => {
  return gameState.activeQuests
    .map(id => QUEST_TEMPLATES.find(q => q.id === id))
    .filter(Boolean) as Quest[];
};

export const getCompletedQuests = (gameState: GameState): Quest[] => {
  return gameState.completedQuests
    .map(id => QUEST_TEMPLATES.find(q => q.id === id))
    .filter(Boolean) as Quest[];
};

export const getQuestProgress = (gameState: GameState, questId: string): QuestObjective[] => {
  const quest = QUEST_TEMPLATES.find(q => q.id === questId);
  if (!quest) return [];

  return gameState.questProgress[questId] || quest.objectives.map(obj => ({ ...obj }));
};

export const isQuestCompleted = (gameState: GameState, questId: string): boolean => {
  return gameState.completedQuests.includes(questId);
};

export const canClaimQuest = (gameState: GameState, questId: string): boolean => {
  if (!gameState.completedQuests.includes(questId)) return false;
  
  const progress = getQuestProgress(gameState, questId);
  return progress.every(obj => obj.isCompleted);
};

export const unlockStoryQuests = (gameState: GameState): GameState => {
  let updatedState = { ...gameState };
  
  QUEST_TEMPLATES.forEach(quest => {
    if (quest.type === 'story' && !quest.isActive && quest.unlockRequirement) {
      let shouldUnlock = false;
      
      // Check unlock requirements
      if (quest.unlockRequirement === 'Complete First Steps into Darkness') {
        shouldUnlock = gameState.completedQuests.includes('story_first_steps');
      } else if (quest.unlockRequirement === 'Summon 10 entities') {
        shouldUnlock = gameState.totalSummons >= 10;
      }
      
      if (shouldUnlock && !updatedState.activeQuests.includes(quest.id)) {
        updatedState.activeQuests = [...updatedState.activeQuests, quest.id];
        updatedState.questProgress[quest.id] = quest.objectives.map(obj => ({ ...obj }));
      }
    }
  });
  
  return updatedState;
};