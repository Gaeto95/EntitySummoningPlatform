import { RitualEvent, GameState } from '../types/game';

export const RITUAL_EVENTS: RitualEvent[] = [
  {
    id: 'power_surge',
    name: 'Power Surge',
    description: 'The ritual circle crackles with unexpected energy!',
    type: 'blessing',
    effect: (state) => ({ ...state, totalEssence: state.totalEssence + 25 })
  },
  {
    id: 'void_whispers',
    name: 'Void Whispers',
    description: 'Strange voices echo from beyond...',
    type: 'complication',
    effect: (state) => state,
    choices: [
      {
        text: 'Listen carefully',
        effect: (state) => ({ ...state, totalEssence: state.totalEssence + 50 })
      },
      {
        text: 'Ignore the voices',
        effect: (state) => ({ ...state, currentStreak: Math.max(0, state.currentStreak - 1) })
      }
    ]
  },
  {
    id: 'ancient_merchant',
    name: 'Ancient Merchant',
    description: 'A mysterious figure offers to trade...',
    type: 'visitor',
    effect: (state) => state,
    choices: [
      {
        text: 'Trade 100 essence for power boost',
        effect: (state) => ({ 
          ...state, 
          totalEssence: Math.max(0, state.totalEssence - 100)
        })
      },
      {
        text: 'Decline the offer',
        effect: (state) => state
      }
    ]
  },
  {
    id: 'cosmic_alignment',
    name: 'Cosmic Alignment',
    description: 'The stars align in your favor!',
    type: 'cosmic',
    effect: (state) => ({ 
      ...state, 
      currentStreak: state.currentStreak + 2,
      totalEssence: state.totalEssence + 100
    })
  },
  {
    id: 'ritual_interference',
    name: 'Ritual Interference',
    description: 'Something disrupts your summoning circle...',
    type: 'complication',
    effect: (state) => state,
    choices: [
      {
        text: 'Spend 50 essence to stabilize',
        effect: (state) => ({ 
          ...state, 
          totalEssence: Math.max(0, state.totalEssence - 50)
        })
      },
      {
        text: 'Let the chaos flow',
        effect: (state) => ({ 
          ...state, 
          currentStreak: 0
        })
      }
    ]
  }
];

export const shouldTriggerEvent = (summonCount: number): boolean => {
  // 15% chance after 5th summon, increasing slightly with more summons
  if (summonCount < 5) return false;
  const baseChance = 0.15;
  const bonusChance = Math.min(0.1, (summonCount - 5) * 0.01);
  return Math.random() < (baseChance + bonusChance);
};

export const getRandomEvent = (): RitualEvent => {
  return RITUAL_EVENTS[Math.floor(Math.random() * RITUAL_EVENTS.length)];
};