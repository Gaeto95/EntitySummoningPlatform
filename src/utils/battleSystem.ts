import { Entity, EntityStats, BattleSkill, BattleState, BattleLog, SkillEffect } from '../types/game';

// Generate entity stats based on entity properties
export const generateEntityStats = (entity: Entity): EntityStats => {
  const rarityMultiplier = {
    common: 1,
    rare: 1.2,
    legendary: 1.5,
    mythic: 2
  };
  
  const typeModifier = {
    demon: { attack: 1.2, defense: 0.9, health: 1.0, speed: 1.1 },
    divine: { attack: 1.0, defense: 1.2, health: 1.1, speed: 0.9 },
    ancient: { attack: 1.1, defense: 1.1, health: 0.9, speed: 1.0 }
  };
  
  const levelMultiplier = 1 + (entity.level - 1) * 0.1;
  const powerFactor = entity.power / 50;
  const shinyBonus = entity.isShiny ? 1.2 : 1;
  
  const modifier = typeModifier[entity.type];
  const rarity = rarityMultiplier[entity.rarity];
  
  return {
    health: Math.round(100 * modifier.health * rarity * levelMultiplier * powerFactor * shinyBonus),
    attack: Math.round(15 * modifier.attack * rarity * levelMultiplier * powerFactor * shinyBonus),
    defense: Math.round(10 * modifier.defense * rarity * levelMultiplier * powerFactor * shinyBonus),
    speed: Math.round(10 * modifier.speed * rarity * levelMultiplier * powerFactor * shinyBonus),
    critRate: Math.min(50, Math.round(5 + (entity.power / 10) + (entity.level * 0.5))),
    critDamage: 150 + (entity.rarity === 'legendary' ? 30 : entity.rarity === 'mythic' ? 50 : 0),
    resistance: Math.round(5 * rarity * levelMultiplier)
  };
};

// Generate entity battle skills based on entity properties
export const generateEntitySkills = (entity: Entity): BattleSkill[] => {
  const baseSkills: BattleSkill[] = [
    {
      id: 'basic_attack',
      name: 'Basic Attack',
      description: 'A basic attack that deals damage to a single target',
      damage: 1, // Multiplier of attack stat
      cooldown: 0,
      currentCooldown: 0,
      type: 'attack',
      target: 'single',
      element: 'neutral',
      effects: [
        { type: 'damage', value: 1 }
      ]
    }
  ];
  
  // Add type-specific skills
  const typeSkills: Record<Entity['type'], BattleSkill[]> = {
    demon: [
      {
        id: 'infernal_rage',
        name: 'Infernal Rage',
        description: 'Unleash demonic fury, dealing heavy damage',
        damage: 1.5,
        cooldown: 3,
        currentCooldown: 0,
        type: 'attack',
        target: 'single',
        element: 'fire',
        effects: [
          { type: 'damage', value: 1.5 },
          { type: 'buff', stat: 'attack', value: 0.2, duration: 2 }
        ]
      },
      {
        id: 'soul_drain',
        name: 'Soul Drain',
        description: 'Drain life force from the enemy',
        damage: 0.8,
        cooldown: 2,
        currentCooldown: 0,
        type: 'attack',
        target: 'single',
        element: 'dark',
        effects: [
          { type: 'damage', value: 0.8 },
          { type: 'heal', value: 0.4 }
        ]
      }
    ],
    divine: [
      {
        id: 'divine_light',
        name: 'Divine Light',
        description: 'Bathe enemies in holy light',
        damage: 1.2,
        cooldown: 2,
        currentCooldown: 0,
        type: 'attack',
        target: 'all',
        element: 'light',
        effects: [
          { type: 'damage', value: 1.2 }
        ]
      },
      {
        id: 'celestial_blessing',
        name: 'Celestial Blessing',
        description: 'Heal and protect with divine energy',
        damage: 0,
        cooldown: 3,
        currentCooldown: 0,
        type: 'heal',
        target: 'self',
        element: 'light',
        effects: [
          { type: 'heal', value: 0.3 },
          { type: 'buff', stat: 'defense', value: 0.3, duration: 2 }
        ]
      }
    ],
    ancient: [
      {
        id: 'cosmic_void',
        name: 'Cosmic Void',
        description: 'Open a rift to the void, damaging all enemies',
        damage: 1.3,
        cooldown: 3,
        currentCooldown: 0,
        type: 'attack',
        target: 'all',
        element: 'dark',
        effects: [
          { type: 'damage', value: 1.3 },
          { type: 'debuff', stat: 'defense', value: -0.2, duration: 2 }
        ]
      },
      {
        id: 'time_distortion',
        name: 'Time Distortion',
        description: 'Manipulate time to gain advantage',
        damage: 0,
        cooldown: 4,
        currentCooldown: 0,
        type: 'buff',
        target: 'self',
        element: 'neutral',
        effects: [
          { type: 'buff', stat: 'speed', value: 0.5, duration: 2 },
          { type: 'buff', stat: 'critRate', value: 0.2, duration: 2 }
        ]
      }
    ]
  };
  
  // Add rarity-specific skills
  const raritySkills: Record<Entity['rarity'], BattleSkill[]> = {
    common: [],
    rare: [
      {
        id: 'power_surge',
        name: 'Power Surge',
        description: 'Channel energy for a powerful attack',
        damage: 1.8,
        cooldown: 4,
        currentCooldown: 0,
        type: 'attack',
        target: 'single',
        element: 'neutral',
        effects: [
          { type: 'damage', value: 1.8 }
        ]
      }
    ],
    legendary: [
      {
        id: 'legendary_might',
        name: 'Legendary Might',
        description: 'Unleash legendary power on all enemies',
        damage: 1.6,
        cooldown: 4,
        currentCooldown: 0,
        type: 'attack',
        target: 'all',
        element: 'neutral',
        effects: [
          { type: 'damage', value: 1.6 }
        ]
      }
    ],
    mythic: [
      {
        id: 'mythic_devastation',
        name: 'Mythic Devastation',
        description: 'Unleash mythic power that ignores defense',
        damage: 2.0,
        cooldown: 5,
        currentCooldown: 0,
        type: 'attack',
        target: 'single',
        element: 'neutral',
        effects: [
          { type: 'damage', value: 2.0 }
        ]
      }
    ]
  };
  
  // Combine skills based on entity properties
  const skills = [
    ...baseSkills,
    ...typeSkills[entity.type],
    ...raritySkills[entity.rarity]
  ];
  
  // Add shiny-specific skill if applicable
  if (entity.isShiny) {
    skills.push({
      id: 'shiny_brilliance',
      name: 'Shiny Brilliance',
      description: 'Dazzle enemies with brilliant light',
      damage: 1.5,
      cooldown: 4,
      currentCooldown: 0,
      type: 'attack',
      target: 'all',
      element: 'light',
      effects: [
        { type: 'damage', value: 1.5 },
        { type: 'debuff', stat: 'speed', value: -0.2, duration: 2 }
      ]
    });
  }
  
  return skills;
};

// Prepare entity for battle by generating stats and skills
export const prepareEntityForBattle = (entity: Entity): Entity => {
  const preparedEntity = { ...entity };
  
  if (!preparedEntity.stats) {
    preparedEntity.stats = generateEntityStats(entity);
  }
  
  if (!preparedEntity.skills) {
    preparedEntity.skills = generateEntitySkills(entity);
  }
  
  return preparedEntity;
};

// Initialize a new battle between two players
export const initializeBattle = (
  player1Id: string,
  player1Username: string,
  player1Entities: Entity[],
  player2Id: string,
  player2Username: string,
  player2Entities: Entity[]
): BattleState => {
  // Prepare entities for battle
  const preparedPlayer1Entities = player1Entities.map(prepareEntityForBattle);
  const preparedPlayer2Entities = player2Entities.map(prepareEntityForBattle);
  
  // Determine who goes first based on speed of first entity
  const player1Speed = preparedPlayer1Entities[0]?.stats?.speed || 0;
  const player2Speed = preparedPlayer2Entities[0]?.stats?.speed || 0;
  
  const firstTurn = player1Speed >= player2Speed ? 'player1' : 'player2';
  
  return {
    id: `battle_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    status: 'active',
    player1: {
      id: player1Id,
      username: player1Username,
      entities: preparedPlayer1Entities,
      currentEntityIndex: 0
    },
    player2: {
      id: player2Id,
      username: player2Username,
      entities: preparedPlayer2Entities,
      currentEntityIndex: 0
    },
    turn: 1,
    currentTurn: firstTurn,
    logs: []
  };
};

// Calculate damage based on attacker and defender stats
export const calculateDamage = (
  attacker: Entity,
  defender: Entity,
  skill: BattleSkill
): { damage: number; isCritical: boolean } => {
  if (!attacker.stats || !defender.stats) {
    throw new Error('Entity stats not initialized');
  }
  
  const attackStat = attacker.stats.attack;
  const defenseStat = defender.stats.defense;
  
  // Base damage calculation
  let damage = attackStat * skill.damage;
  
  // Apply defense reduction (diminishing returns)
  const defenseMultiplier = 1 - (defenseStat / (defenseStat + 100));
  damage = damage * defenseMultiplier;
  
  // Check for critical hit
  const isCritical = Math.random() * 100 < attacker.stats.critRate;
  if (isCritical) {
    damage = damage * (attacker.stats.critDamage / 100);
  }
  
  // Apply elemental bonuses/weaknesses (simplified)
  if (skill.element === 'fire' && defender.type === 'divine') damage *= 1.5;
  if (skill.element === 'light' && defender.type === 'demon') damage *= 1.5;
  if (skill.element === 'dark' && defender.type === 'divine') damage *= 1.5;
  
  // Apply resistance reduction
  damage = damage * (1 - (defender.stats.resistance / 100));
  
  // Ensure minimum damage
  damage = Math.max(1, Math.round(damage));
  
  return { damage, isCritical };
};

// Apply skill effects
export const applySkillEffects = (
  effect: SkillEffect,
  source: Entity,
  target: Entity,
  isCritical: boolean = false
): { updatedTarget: Entity; log: string } => {
  if (!source.stats || !target.stats) {
    throw new Error('Entity stats not initialized');
  }
  
  const updatedTarget = { ...target };
  let log = '';
  
  switch (effect.type) {
    case 'damage': {
      const baseDamage = source.stats.attack * effect.value;
      const defenseMultiplier = 1 - (target.stats.defense / (target.stats.defense + 100));
      let damage = baseDamage * defenseMultiplier;
      
      if (isCritical) {
        damage = damage * (source.stats.critDamage / 100);
      }
      
      damage = Math.max(1, Math.round(damage));
      
      if (!updatedTarget.stats) break;
      updatedTarget.stats.health = Math.max(0, updatedTarget.stats.health - damage);
      log = `${source.name} dealt ${damage}${isCritical ? ' critical' : ''} damage to ${target.name}`;
      break;
    }
    
    case 'heal': {
      if (!source.stats || !updatedTarget.stats) break;
      const healAmount = Math.round(source.stats.attack * effect.value);
      const maxHealth = generateEntityStats(target).health; // Get original max health
      updatedTarget.stats.health = Math.min(maxHealth, updatedTarget.stats.health + healAmount);
      log = `${source.name} healed ${target.name} for ${healAmount} health`;
      break;
    }
    
    case 'buff':
    case 'debuff': {
      if (!effect.stat || !updatedTarget.stats) break;
      const statValue = updatedTarget.stats[effect.stat];
      if (typeof statValue === 'number') {
        const changeAmount = Math.round(statValue * effect.value);
        updatedTarget.stats[effect.stat] = effect.type === 'buff' 
          ? statValue + changeAmount 
          : Math.max(1, statValue - changeAmount);
        
        log = `${source.name} ${effect.type === 'buff' ? 'buffed' : 'debuffed'} ${target.name}'s ${effect.stat} by ${effect.type === 'buff' ? '+' : '-'}${Math.abs(changeAmount)}`;
      }
      break;
    }
    
    case 'dot': // Damage over time
    case 'hot': // Healing over time
      // These would be implemented with a duration system
      log = `${effect.type === 'dot' ? 'Damage' : 'Healing'} over time effect applied`;
      break;
  }
  
  return { updatedTarget, log };
};

// Process a turn in the battle
export const processTurn = (
  battleState: BattleState,
  skillId: string,
  targetIndex: number
): { updatedBattle: BattleState; logs: string[] } => {
  let updatedBattle = { ...battleState };
  const logs: string[] = [];
  
  // Determine current player and opponent
  const isPlayer1Turn = updatedBattle.currentTurn === 'player1';
  const currentPlayer = isPlayer1Turn ? updatedBattle.player1 : updatedBattle.player2;
  const opponent = isPlayer1Turn ? updatedBattle.player2 : updatedBattle.player1;
  
  // Get current entity and skill
  const currentEntity = currentPlayer.entities[currentPlayer.currentEntityIndex];
  const skill = currentEntity.skills?.find(s => s.id === skillId);
  
  if (!currentEntity || !skill) {
    logs.push('Invalid entity or skill');
    return { updatedBattle, logs };
  }
  
  // Check if skill is on cooldown
  if (skill.currentCooldown > 0) {
    logs.push(`${skill.name} is on cooldown for ${skill.currentCooldown} more turns`);
    return { updatedBattle, logs };
  }
  
  // Get target(s)
  let targets: Entity[] = [];
  if (skill.target === 'single') {
    if (targetIndex >= 0 && targetIndex < opponent.entities.length) {
      targets = [opponent.entities[targetIndex]];
    } else {
      logs.push('Invalid target');
      return { updatedBattle, logs };
    }
  } else if (skill.target === 'all') {
    targets = [...opponent.entities];
  } else if (skill.target === 'self') {
    targets = [currentEntity];
  }
  
  // Apply skill effects to targets
  const updatedTargets: Entity[] = [];
  
  for (const target of targets) {
    let updatedTarget = { ...target };
    
    // Check for critical hit once per skill use
    const isCritical = Math.random() * 100 < (currentEntity.stats?.critRate || 5);
    
    // Apply each effect
    if (skill.effects) {
      for (const effect of skill.effects) {
        const result = applySkillEffects(effect, currentEntity, updatedTarget, isCritical);
        updatedTarget = result.updatedTarget;
        logs.push(result.log);
      }
    }
    
    updatedTargets.push(updatedTarget);
  }
  
  // Update opponent's entities
  if (skill.target !== 'self') {
    if (isPlayer1Turn) {
      updatedBattle.player2.entities = updatedBattle.player2.entities.map(entity => {
        const updatedEntity = updatedTargets.find(t => t.id === entity.id);
        return updatedEntity || entity;
      });
    } else {
      updatedBattle.player1.entities = updatedBattle.player1.entities.map(entity => {
        const updatedEntity = updatedTargets.find(t => t.id === entity.id);
        return updatedEntity || entity;
      });
    }
  } else {
    // Update self
    if (isPlayer1Turn) {
      updatedBattle.player1.entities[currentPlayer.currentEntityIndex] = updatedTargets[0];
    } else {
      updatedBattle.player2.entities[currentPlayer.currentEntityIndex] = updatedTargets[0];
    }
  }
  
  // Set skill cooldown
  if (skill.cooldown > 0) {
    const updatedSkills = currentEntity.skills?.map(s => 
      s.id === skill.id 
        ? { ...s, currentCooldown: s.cooldown } 
        : s
    );
    
    if (isPlayer1Turn) {
      updatedBattle.player1.entities[currentPlayer.currentEntityIndex] = {
        ...updatedBattle.player1.entities[currentPlayer.currentEntityIndex],
        skills: updatedSkills
      };
    } else {
      updatedBattle.player2.entities[currentPlayer.currentEntityIndex] = {
        ...updatedBattle.player2.entities[currentPlayer.currentEntityIndex],
        skills: updatedSkills
      };
    }
  }
  
  // Reduce cooldowns for all skills of the current entity
  const reduceCooldowns = (entity: Entity): Entity => {
    if (!entity.skills) return entity;
    
    const updatedSkills = entity.skills.map(skill => ({
      ...skill,
      currentCooldown: Math.max(0, skill.currentCooldown - 1)
    }));
    
    return { ...entity, skills: updatedSkills };
  };
  
  // Check if current entity is defeated
  const checkEntityDefeated = (entity: Entity): boolean => {
    return (entity.stats?.health || 0) <= 0;
  };
  
  // Check if any entities are defeated and switch if needed
  const checkAndSwitchDefeatedEntities = (battleState: BattleState): BattleState => {
    const updatedBattle = { ...battleState };
    
    // Check player 1's current entity
    if (checkEntityDefeated(updatedBattle.player1.entities[updatedBattle.player1.currentEntityIndex])) {
      // Find next available entity
      const nextIndex = updatedBattle.player1.entities.findIndex(
        (e, i) => i > updatedBattle.player1.currentEntityIndex && !checkEntityDefeated(e)
      );
      
      if (nextIndex !== -1) {
        updatedBattle.player1.currentEntityIndex = nextIndex;
        logs.push(`${updatedBattle.player1.username} switches to ${updatedBattle.player1.entities[nextIndex].name}`);
      }
    }
    
    // Check player 2's current entity
    if (checkEntityDefeated(updatedBattle.player2.entities[updatedBattle.player2.currentEntityIndex])) {
      // Find next available entity
      const nextIndex = updatedBattle.player2.entities.findIndex(
        (e, i) => i > updatedBattle.player2.currentEntityIndex && !checkEntityDefeated(e)
      );
      
      if (nextIndex !== -1) {
        updatedBattle.player2.currentEntityIndex = nextIndex;
        logs.push(`${updatedBattle.player2.username} switches to ${updatedBattle.player2.entities[nextIndex].name}`);
      }
    }
    
    return updatedBattle;
  };
  
  // Check if battle is over
  const checkBattleOver = (battleState: BattleState): BattleState => {
    const updatedBattle = { ...battleState };
    
    const player1Defeated = updatedBattle.player1.entities.every(checkEntityDefeated);
    const player2Defeated = updatedBattle.player2.entities.every(checkEntityDefeated);
    
    if (player1Defeated && player2Defeated) {
      updatedBattle.status = 'completed';
      updatedBattle.winner = 'draw';
      logs.push('Battle ended in a draw!');
    } else if (player1Defeated) {
      updatedBattle.status = 'completed';
      updatedBattle.winner = 'player2';
      logs.push(`${updatedBattle.player2.username} wins the battle!`);
    } else if (player2Defeated) {
      updatedBattle.status = 'completed';
      updatedBattle.winner = 'player1';
      logs.push(`${updatedBattle.player1.username} wins the battle!`);
    }
    
    return updatedBattle;
  };
  
  // Switch turns
  updatedBattle.currentTurn = isPlayer1Turn ? 'player2' : 'player1';
  
  // Increment turn counter if we've gone through both players
  if (!isPlayer1Turn) {
    updatedBattle.turn += 1;
  }
  
  // Add to battle log
  updatedBattle.logs.push({
    turn: updatedBattle.turn,
    playerId: currentPlayer.id,
    entityId: currentEntity.id,
    entityName: currentEntity.name,
    action: skill.name,
    target: targets.map(t => t.name).join(', ')
  });
  
  // Process end of turn effects
  updatedBattle = checkAndSwitchDefeatedEntities(updatedBattle);
  updatedBattle = checkBattleOver(updatedBattle);
  
  return { updatedBattle, logs };
};

// Calculate battle rewards based on outcome
export const calculateBattleRewards = (
  battleState: BattleState,
  playerRank?: { tier: string; points: number }
): BattleRewards => {
  const baseRewards = {
    essence: 100,
    crystals: 5,
    experience: 50
  };
  
  // Adjust rewards based on battle outcome
  if (battleState.winner === 'draw') {
    return {
      essence: Math.round(baseRewards.essence * 0.5),
      crystals: Math.round(baseRewards.crystals * 0.5),
      experience: Math.round(baseRewards.experience * 0.5)
    };
  }
  
  // Bonus for winning
  const winnerRewards = {
    essence: baseRewards.essence * 2,
    crystals: baseRewards.crystals * 2,
    experience: baseRewards.experience * 2
  };
  
  // Bonus based on opponent's entities
  const opponentEntities = battleState.winner === 'player1' 
    ? battleState.player2.entities 
    : battleState.player1.entities;
  
  let rarityBonus = 1;
  opponentEntities.forEach(entity => {
    if (entity.rarity === 'rare') rarityBonus += 0.1;
    if (entity.rarity === 'legendary') rarityBonus += 0.3;
    if (entity.rarity === 'mythic') rarityBonus += 0.5;
  });
  
  // Rank points calculation (if ranked match)
  let rankPoints = 0;
  if (playerRank) {
    // Base points for winning
    rankPoints = 20;
    
    // Adjust based on tier
    const tierMultiplier = {
      bronze: 1,
      silver: 1.1,
      gold: 1.2,
      platinum: 1.3,
      diamond: 1.4,
      master: 1.5
    };
    
    rankPoints *= tierMultiplier[playerRank.tier as keyof typeof tierMultiplier] || 1;
    
    // Adjust for quick/long battles
    if (battleState.turn < 5) rankPoints *= 0.8; // Quick battle
    if (battleState.turn > 15) rankPoints *= 1.2; // Long, strategic battle
  }
  
  return {
    essence: Math.round(winnerRewards.essence * rarityBonus),
    crystals: Math.round(winnerRewards.crystals * rarityBonus),
    experience: Math.round(winnerRewards.experience * rarityBonus),
    rankPoints: Math.round(rankPoints)
  };
};

// Find a match based on player rank and entities
export const findMatch = async (
  userId: string,
  userRank: { tier: string; points: number },
  userEntities: Entity[]
): Promise<{ matchFound: boolean; opponent?: any }> => {
  // In a real implementation, this would query the database for suitable opponents
  // For now, we'll simulate a match being found after a delay
  
  return new Promise(resolve => {
    setTimeout(() => {
      // 80% chance to find a match
      const matchFound = Math.random() < 0.8;
      
      if (matchFound) {
        // Generate a mock opponent
        const opponent = {
          id: `opponent_${Date.now()}`,
          username: `Opponent_${Math.floor(Math.random() * 1000)}`,
          rank: { 
            tier: userRank.tier, 
            points: userRank.points + Math.floor(Math.random() * 100) - 50 
          },
          entities: generateOpponentEntities(userEntities)
        };
        
        resolve({ matchFound: true, opponent });
      } else {
        resolve({ matchFound: false });
      }
    }, 2000); // Simulate 2 second matchmaking
  });
};

// Generate opponent entities based on player's entities
const generateOpponentEntities = (playerEntities: Entity[]): Entity[] => {
  // Create a balanced team based on player's entities
  const avgLevel = Math.max(1, Math.floor(
    playerEntities.reduce((sum, entity) => sum + entity.level, 0) / playerEntities.length
  ));
  
  const avgRarity = {
    common: 0,
    rare: 0,
    legendary: 0,
    mythic: 0
  };
  
  playerEntities.forEach(entity => {
    avgRarity[entity.rarity]++;
  });
  
  // Generate opponent entities
  const opponentEntities: Entity[] = [];
  
  // Mock entity templates
  const entityTemplates = [
    {
      name: 'Infernal Wraith',
      type: 'demon',
      rarity: avgRarity.legendary > 0 ? 'legendary' : avgRarity.rare > 0 ? 'rare' : 'common',
      personality: 'Wrathful and demanding',
      sigil: '🔥',
      aura: 'Crimson flames dancing around',
      power: 70 + Math.floor(Math.random() * 20),
      domain: 'Fire and Destruction',
      abilities: ['Soul Drain', 'Infernal Rage']
    },
    {
      name: 'Celestial Guardian',
      type: 'divine',
      rarity: avgRarity.mythic > 0 ? 'legendary' : avgRarity.rare > 0 ? 'rare' : 'common',
      personality: 'Noble but stern',
      sigil: '👑',
      aura: 'Golden light emanating from',
      power: 65 + Math.floor(Math.random() * 25),
      domain: 'Light and Protection',
      abilities: ['Divine Light', 'Celestial Blessing']
    },
    {
      name: 'Void Harbinger',
      type: 'ancient',
      rarity: avgRarity.legendary > 0 ? 'legendary' : avgRarity.rare > 0 ? 'rare' : 'common',
      personality: 'Ancient and weary',
      sigil: '👁️',
      aura: 'Shadow tendrils writhing about',
      power: 75 + Math.floor(Math.random() * 15),
      domain: 'Void and Chaos',
      abilities: ['Cosmic Void', 'Time Distortion']
    }
  ];
  
  // Create 3 entities for the opponent
  for (let i = 0; i < 3; i++) {
    const template = entityTemplates[i % entityTemplates.length];
    
    const entity: Entity = {
      id: `opponent_entity_${i}_${Date.now()}`,
      name: template.name,
      type: template.type as 'demon' | 'divine' | 'ancient',
      rarity: template.rarity as 'common' | 'rare' | 'legendary' | 'mythic',
      personality: template.personality,
      sigil: template.sigil,
      aura: template.aura,
      power: template.power,
      domain: template.domain,
      manifestationText: '',
      level: avgLevel,
      experience: 0,
      abilities: template.abilities,
      collectedAt: Date.now(),
      isShiny: Math.random() < 0.1,
      dialogue: [],
      mood: 'neutral',
      loyalty: 50
    };
    
    // Prepare entity for battle
    const battleReady = prepareEntityForBattle(entity);
    opponentEntities.push(battleReady);
  }
  
  return opponentEntities;
};

// Define BattleRewards interface
interface BattleRewards {
  essence: number;
  crystals: number;
  experience: number;
  rankPoints?: number;
}