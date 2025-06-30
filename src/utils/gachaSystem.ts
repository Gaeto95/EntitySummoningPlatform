import { Entity, GameState, SummonBanner } from '../types/game';
import { generateEntity } from './entityGenerator';

export const PITY_SYSTEM = {
  LEGENDARY_PITY: 50, // Guaranteed legendary every 50 pulls
  MYTHIC_PITY: 100,   // Guaranteed mythic every 100 pulls
  RATE_UP_BONUS: 2.0  // 2x chance for featured entities
};

export const CURRENT_BANNERS: SummonBanner[] = [
  {
    id: 'infernal_lords',
    name: 'Infernal Lords Banner',
    description: 'Increased rates for powerful demon entities',
    featuredEntities: ['Xhuralith', 'Maltheus', 'Belzeth'],
    rateUpMultiplier: 2.0,
    startDate: Date.now() - 7 * 24 * 60 * 60 * 1000, // Started 7 days ago
    endDate: Date.now() + 7 * 24 * 60 * 60 * 1000,   // Ends in 7 days
    cost: 50,
    currency: 'crystals',
    guaranteedLegendaryAt: 10,
    icon: '👹',
    background: 'from-red-900 to-orange-800'
  },
  {
    id: 'celestial_court',
    name: 'Celestial Court Banner',
    description: 'Divine entities with enhanced blessing powers',
    featuredEntities: ['Celestine', 'Aurelia', 'Seraphiel'],
    rateUpMultiplier: 2.0,
    startDate: Date.now() - 3 * 24 * 60 * 60 * 1000,
    endDate: Date.now() + 10 * 24 * 60 * 60 * 1000,
    cost: 50,
    currency: 'crystals',
    guaranteedLegendaryAt: 10,
    icon: '👑',
    background: 'from-yellow-900 to-amber-800'
  },
  {
    id: 'ancient_awakening',
    name: 'Ancient Awakening Banner',
    description: 'Primordial entities from before time',
    featuredEntities: ['Yog\'thala', 'Cthulhara', 'Azathoria'],
    rateUpMultiplier: 1.5,
    startDate: Date.now(),
    endDate: Date.now() + 14 * 24 * 60 * 60 * 1000,
    cost: 75,
    currency: 'crystals',
    guaranteedLegendaryAt: 8,
    icon: '👁️',
    background: 'from-green-900 to-teal-800'
  }
];

export const performGachaPull = (
  gameState: GameState,
  banner: SummonBanner,
  pullCount: number = 1
): {
  entities: Entity[];
  updatedGameState: GameState;
  guaranteedHits: boolean[];
} => {
  const entities: Entity[] = [];
  const guaranteedHits: boolean[] = [];
  let updatedState = { ...gameState };

  for (let i = 0; i < pullCount; i++) {
    const pullNumber = (updatedState.bannerPulls[banner.id] || 0) + 1;
    let guaranteedRarity: Entity['rarity'] | null = null;
    let isGuaranteed = false;

    // Check for guaranteed pulls
    if (pullNumber % banner.guaranteedLegendaryAt === 0) {
      guaranteedRarity = 'legendary';
      isGuaranteed = true;
    } else if (updatedState.pityCounter >= PITY_SYSTEM.LEGENDARY_PITY) {
      guaranteedRarity = 'legendary';
      isGuaranteed = true;
      updatedState.pityCounter = 0;
    } else if (updatedState.guaranteedLegendaryCounter >= PITY_SYSTEM.MYTHIC_PITY) {
      guaranteedRarity = 'mythic';
      isGuaranteed = true;
      updatedState.guaranteedLegendaryCounter = 0;
    }

    // Generate entity with banner bonuses
    const entity = generateGachaEntity(banner, guaranteedRarity);
    entities.push(entity);
    guaranteedHits.push(isGuaranteed);

    // Update counters
    updatedState.bannerPulls = {
      ...updatedState.bannerPulls,
      [banner.id]: pullNumber
    };

    if (entity.rarity === 'legendary' || entity.rarity === 'mythic') {
      updatedState.pityCounter = 0;
      if (entity.rarity === 'mythic') {
        updatedState.guaranteedLegendaryCounter = 0;
      }
    } else {
      updatedState.pityCounter++;
      updatedState.guaranteedLegendaryCounter++;
    }
  }

  return { entities, updatedGameState: updatedState, guaranteedHits };
};

const generateGachaEntity = (banner: SummonBanner, guaranteedRarity?: Entity['rarity'] | null): Entity => {
  // Enhanced generation for gacha with banner-specific bonuses
  const baseRunes = ['chaos', 'truth', 'rage']; // Default runes for gacha
  
  // Apply banner type bonuses
  let typeBonus = '';
  if (banner.id.includes('infernal')) typeBonus = 'fire';
  else if (banner.id.includes('celestial')) typeBonus = 'divine_favor';
  else if (banner.id.includes('ancient')) typeBonus = 'void';
  
  const runes = typeBonus ? [...baseRunes, typeBonus] : baseRunes;
  
  const entity = generateEntity(
    runes,
    0.8, // High temperature for variety
    1500, // High tokens for detailed descriptions
    75,  // High memory for coherent personalities
    0,   // No sacrifice bonus
    0,   // No streak bonus
    banner.rateUpMultiplier * 10 // Banner bonus
  );

  // Override rarity if guaranteed
  if (guaranteedRarity) {
    entity.rarity = guaranteedRarity;
    
    // Adjust power based on guaranteed rarity
    if (guaranteedRarity === 'mythic') {
      entity.power = Math.max(85, entity.power);
    } else if (guaranteedRarity === 'legendary') {
      entity.power = Math.max(70, entity.power);
    }
  }

  // Apply featured entity bonuses
  if (banner.featuredEntities.some(name => entity.name.includes(name))) {
    entity.power = Math.min(100, entity.power + 10);
    entity.isShiny = Math.random() < 0.1; // 10% shiny chance for featured
  }

  return entity;
};

export const getMultiPullDiscount = (pullCount: number): number => {
  switch (pullCount) {
    case 10: return 0.1; // 10% discount
    case 50: return 0.2; // 20% discount
    case 100: return 0.3; // 30% discount
    default: return 0;
  }
};

export const calculatePullCost = (banner: SummonBanner, pullCount: number): number => {
  const baseCost = banner.cost * pullCount;
  const discount = getMultiPullDiscount(pullCount);
  return Math.floor(baseCost * (1 - discount));
};