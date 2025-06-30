import { GameState, DailyReward } from '../types/game';

export const DAILY_REWARDS: DailyReward[] = [
  { day: 1, type: 'essence', amount: 50, icon: '💰', claimed: false },
  { day: 2, type: 'energy', amount: 5, icon: '⚡', claimed: false },
  { day: 3, type: 'essence', amount: 100, icon: '💰', claimed: false },
  { day: 4, type: 'crystals', amount: 10, icon: '💎', claimed: false },
  { day: 5, type: 'essence', amount: 200, icon: '💰', claimed: false },
  { day: 6, type: 'energy', amount: 10, icon: '⚡', claimed: false },
  { day: 7, type: 'crystals', amount: 25, icon: '💎', claimed: false },
  { day: 8, type: 'essence', amount: 300, icon: '💰', claimed: false },
  { day: 9, type: 'crystals', amount: 15, icon: '💎', claimed: false },
  { day: 10, type: 'energy', amount: 15, icon: '⚡', claimed: false },
  { day: 11, type: 'essence', amount: 400, icon: '💰', claimed: false },
  { day: 12, type: 'crystals', amount: 20, icon: '💎', claimed: false },
  { day: 13, type: 'essence', amount: 500, icon: '💰', claimed: false },
  { day: 14, type: 'energy', amount: 20, icon: '⚡', claimed: false },
  { day: 15, type: 'crystals', amount: 50, icon: '💎', claimed: false },
];

export const checkDailyLogin = (gameState: GameState): GameState => {
  const today = new Date().toDateString();
  const lastLogin = gameState.lastLoginDate;
  
  if (lastLogin === today) {
    return gameState; // Already logged in today
  }
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayString = yesterday.toDateString();
  
  let newStreak = 1;
  if (lastLogin === yesterdayString) {
    // Consecutive login
    newStreak = gameState.loginStreak + 1;
  }
  
  return {
    ...gameState,
    lastLoginDate: today,
    loginStreak: newStreak,
    dailyRewardsClaimed: false
  };
};

export const canClaimDailyReward = (gameState: GameState): boolean => {
  return !gameState.dailyRewardsClaimed && gameState.loginStreak > 0;
};

export const getDailyReward = (loginStreak: number): DailyReward => {
  const rewardIndex = ((loginStreak - 1) % DAILY_REWARDS.length);
  return { ...DAILY_REWARDS[rewardIndex], claimed: false };
};

export const claimDailyReward = (gameState: GameState): GameState => {
  if (!canClaimDailyReward(gameState)) return gameState;
  
  const reward = getDailyReward(gameState.loginStreak);
  let updatedState = { ...gameState, dailyRewardsClaimed: true };
  
  switch (reward.type) {
    case 'essence':
      updatedState.totalEssence += reward.amount;
      break;
    case 'crystals':
      updatedState.essenceCrystals += reward.amount;
      break;
    case 'energy':
      const maxEnergy = updatedState.maxEnergy || 10;
      updatedState.currentEnergy = Math.min(maxEnergy, updatedState.currentEnergy + reward.amount);
      break;
  }
  
  return updatedState;
};

export const getStreakBonus = (streak: number): number => {
  if (streak >= 30) return 3.0; // 200% bonus
  if (streak >= 14) return 2.5; // 150% bonus
  if (streak >= 7) return 2.0;  // 100% bonus
  if (streak >= 3) return 1.5;  // 50% bonus
  return 1.0; // No bonus
};