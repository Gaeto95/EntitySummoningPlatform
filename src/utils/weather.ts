import { WeatherState } from '../types/game';

export const WEATHER_TYPES = {
  clear: {
    name: 'Clear Skies',
    description: 'Perfect conditions for summoning',
    effects: { summonBonus: 0, rareChance: 0, powerMultiplier: 1 },
    color: 'blue',
    particles: '✨'
  },
  stormy: {
    name: 'Mystical Storm',
    description: 'Chaotic energies enhance power',
    effects: { summonBonus: 10, rareChance: 5, powerMultiplier: 1.2 },
    color: 'purple',
    particles: '⚡'
  },
  mystical: {
    name: 'Ethereal Mist',
    description: 'Ancient forces stir',
    effects: { summonBonus: 5, rareChance: 10, powerMultiplier: 1.1 },
    color: 'green',
    particles: '🌫️'
  },
  eclipse: {
    name: 'Solar Eclipse',
    description: 'Rare cosmic alignment',
    effects: { summonBonus: 20, rareChance: 25, powerMultiplier: 1.5 },
    color: 'orange',
    particles: '🌑'
  },
  aurora: {
    name: 'Celestial Aurora',
    description: 'Divine energies dance',
    effects: { summonBonus: 15, rareChance: 15, powerMultiplier: 1.3 },
    color: 'cyan',
    particles: '🌌'
  }
};

export const generateWeather = (): WeatherState => {
  const types = Object.keys(WEATHER_TYPES) as (keyof typeof WEATHER_TYPES)[];
  const weights = [50, 25, 20, 3, 2]; // Clear is most common, eclipse/aurora are rare
  
  let random = Math.random() * 100;
  let selectedType: keyof typeof WEATHER_TYPES = 'clear';
  
  for (let i = 0; i < types.length; i++) {
    if (random < weights[i]) {
      selectedType = types[i];
      break;
    }
    random -= weights[i];
  }
  
  return {
    type: selectedType,
    intensity: Math.random() * 0.5 + 0.5, // 0.5 to 1.0
    effects: WEATHER_TYPES[selectedType].effects
  };
};

export const getWeatherDuration = (type: keyof typeof WEATHER_TYPES): number => {
  switch (type) {
    case 'eclipse': return 5 * 60 * 1000; // 5 minutes
    case 'aurora': return 10 * 60 * 1000; // 10 minutes
    case 'stormy': return 15 * 60 * 1000; // 15 minutes
    case 'mystical': return 20 * 60 * 1000; // 20 minutes
    default: return 30 * 60 * 1000; // 30 minutes
  }
};