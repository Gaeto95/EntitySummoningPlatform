import { GameState } from '../types/game';

export const ENERGY_CONFIG = {
  BASE_MAX_ENERGY: 10,
  BASE_REGEN_RATE: 60, // minutes per energy point
  ENERGY_PER_SUMMON: 1,
  MAX_OVERFLOW_HOURS: 24,
};

export const VIP_LEVELS = [
  {
    level: 0,
    name: 'Novice Summoner',
    benefits: ['Basic summoning abilities'],
    maxEnergy: 10,
    energyRegenRate: 60,
    dailyBonuses: { essence: 0, crystals: 0, energy: 0 },
    price: 0
  },
  {
    level: 1,
    name: 'Apprentice Mystic',
    benefits: ['+5 Max Energy', '+20% Energy Regen', 'Daily Crystal Bonus'],
    maxEnergy: 15,
    energyRegenRate: 48,
    dailyBonuses: { essence: 50, crystals: 5, energy: 2 },
    price: 100
  },
  {
    level: 2,
    name: 'Adept Ritualist',
    benefits: ['+10 Max Energy', '+40% Energy Regen', 'Exclusive Runes', 'Premium UI Theme'],
    maxEnergy: 20,
    energyRegenRate: 36,
    dailyBonuses: { essence: 100, crystals: 10, energy: 5 },
    price: 200
  },
  {
    level: 3,
    name: 'Master Occultist',
    benefits: ['+15 Max Energy', '+60% Energy Regen', 'Legendary Guarantee Weekly', 'All Premium Features'],
    maxEnergy: 25,
    energyRegenRate: 24,
    dailyBonuses: { essence: 200, crystals: 20, energy: 10 },
    price: 500
  }
];

export const updateEnergySystem = (gameState: GameState): GameState => {
  const now = Date.now();
  const timeDiff = now - gameState.lastEnergyUpdate;
  const minutesPassed = Math.floor(timeDiff / (1000 * 60));
  
  if (minutesPassed <= 0) return gameState;
  
  const vipLevel = VIP_LEVELS.find(v => v.level === gameState.vipLevel) || VIP_LEVELS[0];
  const energyToAdd = Math.floor(minutesPassed / vipLevel.energyRegenRate);
  
  if (energyToAdd <= 0) return gameState;
  
  const newEnergy = Math.min(vipLevel.maxEnergy, gameState.currentEnergy + energyToAdd);
  
  return {
    ...gameState,
    currentEnergy: newEnergy,
    maxEnergy: vipLevel.maxEnergy,
    lastEnergyUpdate: now,
    energyRegenRate: vipLevel.energyRegenRate
  };
};

export const canPerformSummon = (gameState: GameState): boolean => {
  return gameState.currentEnergy >= ENERGY_CONFIG.ENERGY_PER_SUMMON;
};

export const consumeEnergy = (gameState: GameState, amount: number = ENERGY_CONFIG.ENERGY_PER_SUMMON): GameState => {
  return {
    ...gameState,
    currentEnergy: Math.max(0, gameState.currentEnergy - amount)
  };
};

export const refillEnergy = (gameState: GameState, amount: number): GameState => {
  const vipLevel = VIP_LEVELS.find(v => v.level === gameState.vipLevel) || VIP_LEVELS[0];
  return {
    ...gameState,
    currentEnergy: Math.min(vipLevel.maxEnergy, gameState.currentEnergy + amount)
  };
};

export const getTimeUntilNextEnergy = (gameState: GameState): number => {
  const vipLevel = VIP_LEVELS.find(v => v.level === gameState.vipLevel) || VIP_LEVELS[0];
  if (gameState.currentEnergy >= vipLevel.maxEnergy) return 0;
  
  const timeSinceLastUpdate = Date.now() - gameState.lastEnergyUpdate;
  const minutesSinceLastUpdate = Math.floor(timeSinceLastUpdate / (1000 * 60));
  const minutesUntilNext = vipLevel.energyRegenRate - (minutesSinceLastUpdate % vipLevel.energyRegenRate);
  
  return minutesUntilNext * 60 * 1000; // Convert to milliseconds
};

export const formatTimeRemaining = (milliseconds: number): string => {
  const totalMinutes = Math.ceil(milliseconds / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};