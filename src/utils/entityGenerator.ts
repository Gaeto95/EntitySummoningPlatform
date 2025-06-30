import { Entity } from '../types/game';

const demonNames = [
  'Xhuralith', 'Vex\'thara', 'Zephyron', 'Maltheus', 'Nyxara',
  'Korvain', 'Belzeth', 'Thraxxus', 'Voidara', 'Grimlock',
  'Ashmodai', 'Lilithane', 'Baphorix', 'Azazyel', 'Malphas',
  'Infernus', 'Shadowmere', 'Drakthul', 'Vorthak', 'Nethys'
];

const divineNames = [
  'Celestine', 'Aurelia', 'Seraphiel', 'Luminara', 'Astridel',
  'Etheresia', 'Gloriana', 'Sanctus', 'Benedixia', 'Radianta',
  'Angelion', 'Virtuous', 'Empyrea', 'Divinitus', 'Celestara',
  'Solarius', 'Lumenis', 'Sanctara', 'Puriel', 'Gloreth'
];

const ancientNames = [
  'Yog\'thala', 'Cthulhara', 'Nyarlatep', 'Azathoria', 'Shub\'nira',
  'Hasturix', 'Dagoneth', 'Yoggothic', 'Carcosian', 'Rl\'yehic',
  'Tsathoggua', 'Ithaqua', 'Bokrug', 'Atlach', 'Ghatanothoa',
  'Zoth-Ommog', 'Yig-Kosha', 'Mnomquah', 'Rhan-Tegoth', 'Vulthoom'
];

const personalities = [
  'Wrathful and demanding', 'Cunning and manipulative', 'Wise but cryptic',
  'Chaotic and unpredictable', 'Ancient and weary', 'Proud and regal',
  'Mysterious and alluring', 'Vengeful and bitter', 'Playful yet dangerous',
  'Noble but fallen', 'Calculating and cold', 'Passionate and fierce',
  'Melancholic and poetic', 'Savage and primal', 'Elegant and refined',
  'Seductive and tempting', 'Honorable but stern', 'Whimsical and mad'
];

const sigils = [
  '⚡', '👁', '🔥', '💀', '⚔', '🐉', '👑', '🌙', '⭐', '💎',
  '🗲', '🔱', '⚜', '☠', '👹', '🦇', '🕷', '🐍', '🦅', '🐺',
  '🔮', '⚰', '🗡', '🛡', '💍', '🏺', '📿', '🕯', '⚱', '🔯'
];

const auras = [
  'Crimson flames dancing around', 'Golden light emanating from', 'Shadow tendrils writhing about',
  'Electric energy crackling through', 'Icy mist swirling around', 'Purple void pulsing within',
  'Silver radiance shimmering from', 'Dark smoke billowing around', 'Ethereal glow surrounding',
  'Blood-red aura throbbing around', 'Celestial light beaming from', 'Ancient darkness seeping through',
  'Fiery corona blazing around', 'Spectral energy flowing through', 'Malevolent presence looming over',
  'Prismatic light refracting from', 'Obsidian darkness emanating from', 'Starlight twinkling around'
];

const domains = [
  'War and Conflict', 'Death and Decay', 'Knowledge and Secrets', 'Chaos and Madness',
  'Fire and Destruction', 'Shadows and Illusion', 'Time and Fate', 'Dreams and Nightmares',
  'Nature and Growth', 'Ice and Winter', 'Lightning and Storms', 'Blood and Sacrifice',
  'Music and Art', 'Healing and Light', 'Lies and Deception', 'Love and Desire',
  'Fear and Terror', 'Wisdom and Truth', 'Strength and Power', 'Magic and Sorcery',
  'Memory and Forgetting', 'Transformation and Change', 'Binding and Freedom', 'Order and Law'
];

const abilities = [
  'Soul Drain', 'Mind Control', 'Elemental Mastery', 'Time Manipulation',
  'Dimensional Rift', 'Energy Absorption', 'Illusion Weaving', 'Prophecy',
  'Healing Touch', 'Death Gaze', 'Teleportation', 'Shape Shifting',
  'Memory Alteration', 'Emotion Control', 'Reality Bending', 'Spirit Communication'
];

// Enhanced manifestation texts with rarity-specific content
const manifestationTexts = {
  demon: {
    common: [
      "I emerge from shadow. What trivial matter brings you before me?",
      "The flames delivered me. Speak quickly, mortal.",
      "Your ritual was... adequate. State your purpose."
    ],
    rare: [
      "I am summoned from the burning depths! Your runes show promise, mortal. What do you seek from one such as I?",
      "The flames of the underworld have delivered me to your circle. Your power grows... interesting."
    ],
    legendary: [
      "Behold! I rise from the deepest pits of the infernal realm, where screams echo through eternity! Your ritual has impressed even the dark lords. You show true potential, summoner.",
      "From the obsidian towers of the underworld I come! Your mastery of the dark arts has not gone unnoticed. The very fabric of reality bends to accommodate my presence."
    ],
    mythic: [
      "MORTAL! You have achieved what few dare attempt - summoning one of the Primordial Flames! I am the shadow that existed before light, the fury that burns at the heart of creation itself. Your soul blazes with power that rivals the ancient ones. Speak, and reality itself shall listen!"
    ]
  },
  divine: {
    common: [
      "I descend with blessing. How may I guide you?",
      "The heavens heard your call. What wisdom do you seek?",
      "Light has brought me to you. Speak your need."
    ],
    rare: [
      "I descend from the celestial realms, drawn by your pure intent and growing wisdom. How may this servant of light assist you?",
      "The heavens have taken notice of your dedication. I come bearing greater blessings."
    ],
    legendary: [
      "From the highest spheres of celestial glory I descend! Your soul shines with a light that pierces the veil between worlds. The divine chorus sings of your deeds, child of light.",
      "Behold the glory of the eternal realm made manifest! Your faith and dedication have opened pathways that few mortals ever glimpse. I bring with me the blessings of the highest heavens."
    ],
    mythic: [
      "BLESSED CHILD! You have achieved communion with the Source itself! I am the First Light, the Word that spoke creation into being. Your spirit burns with divine fire that rivals the seraphim themselves. The very cosmos rejoices in your ascension!"
    ]
  },
  ancient: {
    common: [
      "I stir from eons of sleep. Why do you wake me?",
      "Time means nothing to me. Speak quickly.",
      "From before your kind, I come. What is it?"
    ],
    rare: [
      "From eons before your kind drew breath, I stir... Your ritual shows understanding beyond your years. What matter requires my ancient attention?",
      "The stars align as they did in ages past... You begin to comprehend the deeper mysteries."
    ],
    legendary: [
      "I am the whisper that existed before the first word was spoken! Your mind has touched the edges of cosmic truth. Few mortals achieve such understanding without losing their sanity.",
      "Before your ancestors crawled from the primordial seas, I was! Your consciousness has expanded beyond mortal limitations. The universe itself takes notice."
    ],
    mythic: [
      "CHILD OF THE VOID! You have gazed into the Abyss and emerged transformed! I am the Dreamer whose dreams shape reality, the Silence between the notes of creation's song. Your mind has transcended mortal boundaries and touched the infinite. The Old Ones whisper your name in languages that predate existence itself!"
    ]
  }
};

const getRandomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

const determineRarity = (powerLevel: number, streak: number, weatherBonus: number): Entity['rarity'] => {
  let rareChance = 0.15; // Base 15% for rare
  let legendaryChance = 0.03; // Base 3% for legendary
  let mythicChance = 0.005; // Base 0.5% for mythic
  
  // Power level influences rarity
  if (powerLevel > 80) {
    rareChance += 0.1;
    legendaryChance += 0.02;
    mythicChance += 0.005;
  }
  
  // Streak bonus
  const streakBonus = Math.min(0.1, streak * 0.01);
  rareChance += streakBonus;
  legendaryChance += streakBonus * 0.5;
  mythicChance += streakBonus * 0.2;
  
  // Weather bonus
  rareChance += weatherBonus * 0.01;
  legendaryChance += weatherBonus * 0.005;
  mythicChance += weatherBonus * 0.002;
  
  const roll = Math.random();
  
  if (roll < mythicChance) return 'mythic';
  if (roll < legendaryChance) return 'legendary';
  if (roll < rareChance) return 'rare';
  return 'common';
};

const selectManifestationText = (
  type: 'demon' | 'divine' | 'ancient', 
  rarity: Entity['rarity'],
  maxTokens: number
): string => {
  const texts = manifestationTexts[type][rarity];
  if (!texts || texts.length === 0) {
    return manifestationTexts[type].common[0];
  }
  return getRandomElement(texts);
};

export const generateEntity = (
  runes: string[], 
  temperature: number, 
  maxTokens: number, 
  memory: number, 
  powerBoost: number = 0,
  streak: number = 0,
  weatherBonus: number = 0
): Entity => {
  // Determine entity type based on runes
  let type: 'demon' | 'divine' | 'ancient' = 'demon';
  
  const runeInfluence = {
    demon: 0,
    divine: 0,
    ancient: 0
  };

  runes.forEach(rune => {
    switch (rune) {
      case 'rage':
      case 'war':
      case 'fire':
      case 'death':
      case 'blood':
        runeInfluence.demon += 2;
        break;
      case 'truth':
      case 'submission':
      case 'divine_favor':
        runeInfluence.divine += 2;
        runeInfluence.demon += 1;
        break;
      case 'chaos':
      case 'void':
      case 'legend':
        runeInfluence.ancient += 2;
        runeInfluence.demon += 1;
        break;
    }
  });

  // Add randomness based on temperature
  const randomFactor = temperature * 3;
  runeInfluence.demon += Math.random() * randomFactor;
  runeInfluence.divine += Math.random() * randomFactor;
  runeInfluence.ancient += Math.random() * randomFactor;

  // Determine type
  if (runeInfluence.divine > runeInfluence.demon && runeInfluence.divine > runeInfluence.ancient) {
    type = 'divine';
  } else if (runeInfluence.ancient > runeInfluence.demon && runeInfluence.ancient > runeInfluence.divine) {
    type = 'ancient';
  }

  // Calculate power level
  const basePower = Math.floor(Math.random() * 40) + 30;
  const temperatureBonus = Math.floor(temperature * 30);
  const runeBonus = runes.length * 5;
  const tokenBonus = Math.floor((maxTokens / 2000) * 10);
  const memoryBonus = Math.floor((memory / 100) * 10);
  const sacrificeBonus = Math.floor(powerBoost);
  const streakBonus = Math.min(20, streak * 2);
  const weatherPowerBonus = Math.floor(weatherBonus * 0.5);
  
  const power = Math.min(100, basePower + temperatureBonus + runeBonus + tokenBonus + memoryBonus + sacrificeBonus + streakBonus + weatherPowerBonus);

  // Determine rarity
  const rarity = determineRarity(power, streak, weatherBonus);
  
  // Check for shiny (1% chance, higher for rare entities)
  const shinyChance = rarity === 'mythic' ? 0.1 : rarity === 'legendary' ? 0.05 : rarity === 'rare' ? 0.02 : 0.01;
  const isShiny = Math.random() < shinyChance;

  // Select name based on type
  let name: string;
  switch (type) {
    case 'divine':
      name = getRandomElement(divineNames);
      break;
    case 'ancient':
      name = getRandomElement(ancientNames);
      break;
    default:
      name = getRandomElement(demonNames);
  }

  // Add rarity prefix for higher rarities
  if (rarity === 'legendary') name = `Lord ${name}`;
  if (rarity === 'mythic') name = `Primordial ${name}`;
  if (isShiny) name = `✨ ${name}`;

  const personality = getRandomElement(personalities);
  const sigil = getRandomElement(sigils);
  const aura = getRandomElement(auras);
  const domain = getRandomElement(domains);
  const manifestationText = selectManifestationText(type, rarity, maxTokens);
  
  // Generate abilities based on rarity
  const numAbilities = rarity === 'mythic' ? 4 : rarity === 'legendary' ? 3 : rarity === 'rare' ? 2 : 1;
  const entityAbilities = [];
  for (let i = 0; i < numAbilities; i++) {
    const ability = getRandomElement(abilities.filter(a => !entityAbilities.includes(a)));
    entityAbilities.push(ability);
  }

  // Generate dialogue options
  const dialogue = [
    "Greetings, summoner...",
    "What would you have of me?",
    "The ritual binds us both...",
    "I sense great potential in you...",
    "Our fates are now intertwined..."
  ];

  return {
    id: `entity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    type,
    rarity,
    personality,
    sigil,
    aura,
    power,
    domain,
    manifestationText,
    level: 1,
    experience: 0,
    abilities: entityAbilities,
    collectedAt: Date.now(),
    isShiny,
    dialogue,
    mood: 'neutral',
    loyalty: 50
  };
};

export const canEntityEvolve = (entity: Entity): boolean => {
  const requiredExp = entity.level * 100;
  return entity.experience >= requiredExp && entity.level < 10;
};

export const evolveEntity = (entity: Entity): Entity => {
  if (!canEntityEvolve(entity)) return entity;
  
  const newLevel = entity.level + 1;
  const powerIncrease = Math.floor(Math.random() * 10) + 5;
  
  return {
    ...entity,
    level: newLevel,
    experience: entity.experience - (entity.level * 100),
    power: Math.min(100, entity.power + powerIncrease),
    loyalty: Math.min(100, entity.loyalty + 10)
  };
};