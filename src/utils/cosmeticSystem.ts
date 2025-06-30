import { CosmeticItem, GameState } from '../types/game';

export const COSMETIC_ITEMS: CosmeticItem[] = [
  // Circle Themes
  {
    id: 'circle_theme_infernal',
    name: 'Infernal Circle',
    description: 'Blazing red summoning circle with fire effects',
    type: 'circle_theme',
    rarity: 'rare',
    price: 100,
    currency: 'crystals',
    preview: 'bg-gradient-to-br from-red-900 to-orange-800',
    icon: '🔥'
  },
  {
    id: 'circle_theme_celestial',
    name: 'Celestial Circle',
    description: 'Golden divine circle with holy light',
    type: 'circle_theme',
    rarity: 'rare',
    price: 100,
    currency: 'crystals',
    preview: 'bg-gradient-to-br from-yellow-900 to-amber-800',
    icon: '✨'
  },
  {
    id: 'circle_theme_void',
    name: 'Void Circle',
    description: 'Dark cosmic circle with swirling galaxies',
    type: 'circle_theme',
    rarity: 'legendary',
    price: 250,
    currency: 'crystals',
    preview: 'bg-gradient-to-br from-purple-900 to-black',
    icon: '🌌'
  },
  
  // Particle Effects
  {
    id: 'particle_effect_divine',
    name: 'Divine Sparkles',
    description: 'Golden light particles that dance around entities',
    type: 'particle_effect',
    rarity: 'rare',
    price: 75,
    currency: 'crystals',
    preview: 'Shimmering golden particles',
    icon: '✨'
  },
  {
    id: 'particle_effect_shadow',
    name: 'Shadow Wisps',
    description: 'Dark ethereal wisps that follow your cursor',
    type: 'particle_effect',
    rarity: 'rare',
    price: 75,
    currency: 'crystals',
    preview: 'Flowing shadow particles',
    icon: '🌫️'
  },
  {
    id: 'particle_effect_cosmic',
    name: 'Cosmic Dust',
    description: 'Stardust particles with rainbow colors',
    type: 'particle_effect',
    rarity: 'legendary',
    price: 200,
    currency: 'crystals',
    preview: 'Multicolored cosmic particles',
    icon: '🌟'
  },

  // UI Themes
  {
    id: 'ui_theme_celestial',
    name: 'Celestial Interface',
    description: 'Golden and white UI theme with divine aesthetics',
    type: 'ui_theme',
    rarity: 'legendary',
    price: 300,
    currency: 'crystals',
    preview: 'Golden UI with divine glow',
    icon: '👑'
  },
  {
    id: 'ui_theme_demonic',
    name: 'Demonic Interface',
    description: 'Red and black UI with infernal styling',
    type: 'ui_theme',
    rarity: 'legendary',
    price: 300,
    currency: 'crystals',
    preview: 'Red UI with fire effects',
    icon: '👹'
  },
  {
    id: 'ui_theme_ancient',
    name: 'Ancient Interface',
    description: 'Eldritch green UI with cosmic horror vibes',
    type: 'ui_theme',
    rarity: 'mythic',
    price: 500,
    currency: 'crystals',
    preview: 'Green UI with tentacle motifs',
    icon: '👁️'
  },

  // Summon Animations
  {
    id: 'summon_animation_vortex',
    name: 'Dimensional Vortex',
    description: 'Entities emerge from swirling portals',
    type: 'summon_animation',
    rarity: 'rare',
    price: 150,
    currency: 'crystals',
    preview: 'Swirling portal animation',
    icon: '🌀'
  },
  {
    id: 'summon_animation_lightning',
    name: 'Lightning Strike',
    description: 'Entities appear in dramatic lightning flashes',
    type: 'summon_animation',
    rarity: 'rare',
    price: 150,
    currency: 'crystals',
    preview: 'Electric manifestation',
    icon: '⚡'
  },
  {
    id: 'summon_animation_cosmic',
    name: 'Cosmic Convergence',
    description: 'Reality bends as entities phase into existence',
    type: 'summon_animation',
    rarity: 'mythic',
    price: 400,
    currency: 'crystals',
    preview: 'Reality-warping effect',
    icon: '🌌'
  }
];

export const purchaseCosmetic = (gameState: GameState, cosmeticId: string): GameState => {
  const cosmetic = COSMETIC_ITEMS.find(item => item.id === cosmeticId);
  if (!cosmetic) return gameState;

  const canAfford = cosmetic.currency === 'crystals' 
    ? gameState.essenceCrystals >= cosmetic.price
    : gameState.totalEssence >= cosmetic.price;

  if (!canAfford || gameState.unlockedCosmetics.includes(cosmeticId)) {
    return gameState;
  }

  const updatedState = {
    ...gameState,
    unlockedCosmetics: [...gameState.unlockedCosmetics, cosmeticId],
    [cosmetic.currency === 'crystals' ? 'essenceCrystals' : 'totalEssence']: 
      gameState[cosmetic.currency === 'crystals' ? 'essenceCrystals' : 'totalEssence'] - cosmetic.price
  };

  return updatedState;
};

export const equipCosmetic = (gameState: GameState, cosmeticId: string, slot: keyof GameState['equippedCosmetics']): GameState => {
  const cosmetic = COSMETIC_ITEMS.find(item => item.id === cosmeticId);
  if (!cosmetic || !gameState.unlockedCosmetics.includes(cosmeticId)) {
    return gameState;
  }

  // Map cosmetic types to equipment slots
  const typeToSlot: Record<CosmeticItem['type'], keyof GameState['equippedCosmetics']> = {
    'circle_theme': 'circleTheme',
    'particle_effect': 'particleEffect',
    'ui_theme': 'uiTheme',
    'summon_animation': 'summonAnimation',
    'entity_skin': 'circleTheme' // Fallback
  };

  const targetSlot = typeToSlot[cosmetic.type];
  if (targetSlot !== slot) return gameState;

  return {
    ...gameState,
    equippedCosmetics: {
      ...gameState.equippedCosmetics,
      [slot]: cosmeticId
    }
  };
};

export const getCosmeticsByType = (type: CosmeticItem['type']): CosmeticItem[] => {
  return COSMETIC_ITEMS.filter(item => item.type === type);
};

export const getUnlockedCosmeticsByType = (gameState: GameState, type: CosmeticItem['type']): CosmeticItem[] => {
  return COSMETIC_ITEMS.filter(item => 
    item.type === type && gameState.unlockedCosmetics.includes(item.id)
  );
};