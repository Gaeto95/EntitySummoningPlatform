import React, { useState, useEffect, useRef } from 'react';
import { X, Swords, Shield, Zap, Heart, Target, SkipForward, Award } from 'lucide-react';
import { Entity, BattleState, BattleSkill, GameState } from '../types/game';
import { 
  initializeBattle, 
  processTurn, 
  calculateBattleRewards,
  prepareEntityForBattle
} from '../utils/battleSystem';
import { LoadingSpinner } from './LoadingSpinner';

interface BattleModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  entities: Entity[];
  user: any;
  onBattleComplete?: (result: 'win' | 'loss' | 'draw', rewards: any) => void;
}

export const BattleModal: React.FC<BattleModalProps> = ({
  isOpen,
  onClose,
  gameState,
  entities,
  user,
  onBattleComplete
}) => {
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [selectedEntities, setSelectedEntities] = useState<Entity[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<BattleSkill | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);
  const [battleLogs, setBattleLogs] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isBattleStarted, setIsBattleStarted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [battleRewards, setBattleRewards] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'team' | 'battle'>('team');
  
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll battle logs
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [battleLogs]);

  // Reset state when modal is opened/closed
  useEffect(() => {
    if (!isOpen) {
      setBattleState(null);
      setSelectedEntities([]);
      setSelectedSkill(null);
      setSelectedTarget(null);
      setBattleLogs([]);
      setIsSearching(false);
      setIsBattleStarted(false);
      setShowResults(false);
      setBattleRewards(null);
      setActiveTab('team');
    }
  }, [isOpen]);

  const handleEntitySelect = (entity: Entity) => {
    if (selectedEntities.some(e => e.id === entity.id)) {
      setSelectedEntities(prev => prev.filter(e => e.id !== entity.id));
    } else if (selectedEntities.length < 3) {
      // Prepare entity for battle
      const battleReadyEntity = prepareEntityForBattle(entity);
      setSelectedEntities(prev => [...prev, battleReadyEntity]);
    }
  };

  const handleFindMatch = () => {
    if (selectedEntities.length === 0) {
      alert('Please select at least one entity for battle');
      return;
    }

    setIsSearching(true);
    setBattleLogs(['Searching for opponent...']);

    // Simulate finding a match
    setTimeout(() => {
      const opponent = {
        id: 'opponent-1',
        username: 'AI Opponent',
        entities: [
          {
            id: 'opponent-entity-1',
            name: 'Shadow Wraith',
            type: 'demon',
            rarity: 'rare',
            personality: 'Wrathful',
            sigil: '🔥',
            aura: 'Dark flames',
            power: 70,
            domain: 'Fire',
            manifestationText: '',
            level: 5,
            experience: 0,
            abilities: ['Fire Blast'],
            collectedAt: Date.now(),
            dialogue: [],
            mood: 'neutral',
            loyalty: 50,
            stats: {
              health: 120,
              attack: 18,
              defense: 12,
              speed: 14,
              critRate: 10,
              critDamage: 150,
              resistance: 8
            },
            skills: [
              {
                id: 'basic_attack',
                name: 'Basic Attack',
                description: 'A basic attack',
                damage: 1,
                cooldown: 0,
                currentCooldown: 0,
                type: 'attack',
                target: 'single',
                effects: [{ type: 'damage', value: 1 }]
              },
              {
                id: 'fire_blast',
                name: 'Fire Blast',
                description: 'A powerful fire attack',
                damage: 1.5,
                cooldown: 3,
                currentCooldown: 0,
                type: 'attack',
                target: 'single',
                element: 'fire',
                effects: [{ type: 'damage', value: 1.5 }]
              }
            ]
          } as Entity,
          {
            id: 'opponent-entity-2',
            name: 'Celestial Guardian',
            type: 'divine',
            rarity: 'rare',
            personality: 'Noble',
            sigil: '✨',
            aura: 'Golden light',
            power: 65,
            domain: 'Light',
            manifestationText: '',
            level: 4,
            experience: 0,
            abilities: ['Healing Light'],
            collectedAt: Date.now(),
            dialogue: [],
            mood: 'neutral',
            loyalty: 50,
            stats: {
              health: 140,
              attack: 15,
              defense: 16,
              speed: 10,
              critRate: 8,
              critDamage: 140,
              resistance: 10
            },
            skills: [
              {
                id: 'basic_attack',
                name: 'Basic Attack',
                description: 'A basic attack',
                damage: 1,
                cooldown: 0,
                currentCooldown: 0,
                type: 'attack',
                target: 'single',
                effects: [{ type: 'damage', value: 1 }]
              },
              {
                id: 'healing_light',
                name: 'Healing Light',
                description: 'Heals the user',
                damage: 0,
                cooldown: 3,
                currentCooldown: 0,
                type: 'heal',
                target: 'self',
                element: 'light',
                effects: [{ type: 'heal', value: 0.3 }]
              }
            ]
          } as Entity
        ]
      };

      // Initialize battle
      const battle = initializeBattle(
        user?.id || 'player',
        user?.username || 'Player',
        selectedEntities,
        opponent.id,
        opponent.username,
        opponent.entities
      );

      setBattleState(battle);
      setBattleLogs(prev => [...prev, 'Opponent found!', 'Battle is starting...']);
      setIsSearching(false);
      setIsBattleStarted(true);
      setActiveTab('battle');
    }, 2000);
  };

  const handleSkillSelect = (skill: BattleSkill) => {
    setSelectedSkill(skill);
    setSelectedTarget(null);
  };

  const handleTargetSelect = (targetIndex: number) => {
    setSelectedTarget(targetIndex);
  };

  const handleExecuteAction = () => {
    if (!battleState || !selectedSkill || selectedTarget === null) return;

    // Process turn
    const { updatedBattle, logs } = processTurn(
      battleState,
      selectedSkill.id,
      selectedTarget
    );

    // Update battle state
    setBattleState(updatedBattle);
    setBattleLogs(prev => [...prev, ...logs]);

    // Reset selections
    setSelectedSkill(null);
    setSelectedTarget(null);

    // Check if battle is over
    if (updatedBattle.status === 'completed') {
      const rewards = calculateBattleRewards(updatedBattle);
      setBattleRewards(rewards);
      setTimeout(() => {
        setShowResults(true);
        if (onBattleComplete) {
          onBattleComplete(
            updatedBattle.winner === 'player1' ? 'win' : 
            updatedBattle.winner === 'player2' ? 'loss' : 'draw',
            rewards
          );
        }
      }, 1500);
    }

    // If it's AI's turn, simulate their action after a delay
    if (updatedBattle.status === 'active' && updatedBattle.currentTurn === 'player2') {
      setTimeout(() => {
        simulateAITurn(updatedBattle);
      }, 1500);
    }
  };

  const simulateAITurn = (currentBattleState: BattleState) => {
    // Get AI's current entity
    const aiEntity = currentBattleState.player2.entities[currentBattleState.player2.currentEntityIndex];
    
    if (!aiEntity || !aiEntity.skills || aiEntity.skills.length === 0) return;
    
    // Choose a skill (prioritize skills that aren't on cooldown)
    const availableSkills = aiEntity.skills.filter(skill => skill.currentCooldown === 0);
    const selectedSkill = availableSkills.length > 0 
      ? availableSkills[Math.floor(Math.random() * availableSkills.length)]
      : aiEntity.skills[0]; // Fallback to first skill
    
    // Choose a target
    let targetIndex = 0;
    if (selectedSkill.target === 'single') {
      // Target the player's current entity
      targetIndex = currentBattleState.player1.currentEntityIndex;
    }
    
    // Process turn
    const { updatedBattle, logs } = processTurn(
      currentBattleState,
      selectedSkill.id,
      targetIndex
    );
    
    // Update battle state
    setBattleState(updatedBattle);
    setBattleLogs(prev => [...prev, ...logs]);
    
    // Check if battle is over
    if (updatedBattle.status === 'completed') {
      const rewards = calculateBattleRewards(updatedBattle);
      setBattleRewards(rewards);
      setTimeout(() => {
        setShowResults(true);
        if (onBattleComplete) {
          onBattleComplete(
            updatedBattle.winner === 'player1' ? 'win' : 
            updatedBattle.winner === 'player2' ? 'loss' : 'draw',
            rewards
          );
        }
      }, 1500);
    }
  };

  const handleClaimRewards = () => {
    // In a real implementation, this would update the game state with the rewards
    onClose();
  };

  const getEntityHealthPercentage = (entity: Entity) => {
    if (!entity.stats) return 0;
    const maxHealth = prepareEntityForBattle(entity).stats?.health || 100;
    return Math.max(0, Math.min(100, (entity.stats.health / maxHealth) * 100));
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'mythic': return 'from-purple-600 to-pink-600';
      case 'legendary': return 'from-yellow-600 to-orange-600';
      case 'rare': return 'from-blue-600 to-cyan-600';
      default: return 'from-gray-600 to-gray-500';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'demon': return 'text-red-400';
      case 'divine': return 'text-yellow-400';
      case 'ancient': return 'text-green-400';
      default: return 'text-purple-400';
    }
  };

  const getSkillTypeColor = (type: string) => {
    switch (type) {
      case 'attack': return 'bg-red-900/50 border-red-500/50 text-red-300';
      case 'defense': return 'bg-blue-900/50 border-blue-500/50 text-blue-300';
      case 'buff': return 'bg-green-900/50 border-green-500/50 text-green-300';
      case 'debuff': return 'bg-purple-900/50 border-purple-500/50 text-purple-300';
      case 'heal': return 'bg-emerald-900/50 border-emerald-500/50 text-emerald-300';
      default: return 'bg-gray-900/50 border-gray-500/50 text-gray-300';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative max-w-6xl w-full max-h-[90vh] bg-gradient-to-br from-purple-900/95 to-black/95 border-2 border-purple-500/50 rounded-xl shadow-2xl overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-purple-900/80 backdrop-blur-sm rounded-full border border-purple-500 text-purple-300 hover:text-purple-100 hover:bg-purple-800 transition-all duration-300 hover:scale-110"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="overflow-y-auto max-h-[90vh] p-6">
          <div className="text-center mb-6 pr-16">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Swords className="w-8 h-8 text-red-400" />
              <h2 className="text-3xl font-serif text-purple-200">PvP Battle Arena</h2>
              <Swords className="w-8 h-8 text-red-400" />
            </div>
          </div>

          {/* Tabs */}
          {!showResults && (
            <div className="flex space-x-2 border-b border-purple-500/30 mb-6">
              <button
                onClick={() => setActiveTab('team')}
                disabled={isBattleStarted}
                className={`px-4 py-2 rounded-t-lg transition-colors ${
                  activeTab === 'team'
                    ? 'bg-purple-900/50 text-purple-200 border-b-2 border-purple-400'
                    : 'text-purple-400 hover:text-purple-300'
                } ${isBattleStarted ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Team Selection
              </button>
              <button
                onClick={() => setActiveTab('battle')}
                disabled={!isBattleStarted}
                className={`px-4 py-2 rounded-t-lg transition-colors ${
                  activeTab === 'battle'
                    ? 'bg-purple-900/50 text-purple-200 border-b-2 border-purple-400'
                    : 'text-purple-400 hover:text-purple-300'
                } ${!isBattleStarted ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Battle Arena
              </button>
            </div>
          )}

          {/* Team Selection */}
          {activeTab === 'team' && !showResults && (
            <div className="space-y-6">
              <div className="bg-black/30 rounded-lg p-4 border border-purple-500/30">
                <h3 className="text-lg font-serif text-purple-300 mb-3">Select Your Battle Team (Max 3)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {entities.map((entity) => (
                    <div
                      key={entity.id}
                      onClick={() => handleEntitySelect(entity)}
                      className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                        selectedEntities.some(e => e.id === entity.id)
                          ? 'border-green-500 bg-green-900/20'
                          : 'border-purple-500/30 bg-black/30 hover:border-purple-400/50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl">{entity.sigil}</div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-purple-200 font-serif">{entity.name}</span>
                            {entity.isShiny && <span className="text-yellow-400">✨</span>}
                          </div>
                          <div className="flex items-center space-x-2 text-xs">
                            <span className={getTypeColor(entity.type)}>{entity.type}</span>
                            <span className="text-purple-400">•</span>
                            <span className={`text-${entity.rarity === 'mythic' ? 'purple' : entity.rarity === 'legendary' ? 'yellow' : entity.rarity === 'rare' ? 'blue' : 'gray'}-400`}>
                              {entity.rarity}
                            </span>
                            <span className="text-purple-400">•</span>
                            <span className="text-purple-400">Lv. {entity.level}</span>
                          </div>
                        </div>
                        <div className="text-purple-300 font-bold">{entity.power}</div>
                      </div>

                      {/* Battle Stats Preview */}
                      <div className="mt-3 pt-3 border-t border-purple-500/30">
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <span className="text-red-400">ATK</span>
                            <span className="text-purple-300 ml-1">
                              {prepareEntityForBattle(entity).stats?.attack}
                            </span>
                          </div>
                          <div>
                            <span className="text-blue-400">DEF</span>
                            <span className="text-purple-300 ml-1">
                              {prepareEntityForBattle(entity).stats?.defense}
                            </span>
                          </div>
                          <div>
                            <span className="text-green-400">HP</span>
                            <span className="text-purple-300 ml-1">
                              {prepareEntityForBattle(entity).stats?.health}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Selection indicator */}
                      {selectedEntities.some(e => e.id === entity.id) && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={handleFindMatch}
                  disabled={selectedEntities.length === 0 || isSearching}
                  className={`px-8 py-3 rounded-lg font-serif uppercase tracking-wide transition-all duration-300 ${
                    selectedEntities.length > 0 && !isSearching
                      ? 'bg-gradient-to-r from-red-800 to-orange-700 text-red-100 hover:from-red-700 hover:to-orange-600 hover:scale-105'
                      : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isSearching ? (
                    <div className="flex items-center space-x-2">
                      <LoadingSpinner size="sm" color="red" />
                      <span>Finding Opponent...</span>
                    </div>
                  ) : (
                    <>Find Match</>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Battle Arena */}
          {activeTab === 'battle' && isBattleStarted && battleState && !showResults && (
            <div className="space-y-6">
              {/* Battle Arena */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Player Side */}
                <div className="space-y-4">
                  <h3 className="text-lg font-serif text-purple-300">Your Team</h3>
                  
                  {/* Current Entity */}
                  {battleState.player1.entities.map((entity, index) => (
                    <div
                      key={entity.id}
                      className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                        index === battleState.player1.currentEntityIndex
                          ? 'border-green-500 bg-green-900/20'
                          : 'border-purple-500/30 bg-black/30 opacity-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl">{entity.sigil}</div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-purple-200 font-serif">{entity.name}</span>
                            {entity.isShiny && <span className="text-yellow-400">✨</span>}
                          </div>
                          <div className="flex items-center space-x-2 text-xs">
                            <span className={getTypeColor(entity.type)}>{entity.type}</span>
                            <span className="text-purple-400">•</span>
                            <span className={`text-${entity.rarity === 'mythic' ? 'purple' : entity.rarity === 'legendary' ? 'yellow' : entity.rarity === 'rare' ? 'blue' : 'gray'}-400`}>
                              {entity.rarity}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Health Bar */}
                      <div className="mt-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-green-400">HP</span>
                          <span className="text-purple-300">
                            {entity.stats?.health || 0}/{prepareEntityForBattle(entity).stats?.health || 100}
                          </span>
                        </div>
                        <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-600 to-green-400"
                            style={{ width: `${getEntityHealthPercentage(entity)}%` }}
                          />
                        </div>
                      </div>

                      {/* Skills (only show for current entity) */}
                      {index === battleState.player1.currentEntityIndex && entity.skills && (
                        <div className="mt-3 pt-3 border-t border-purple-500/30">
                          <div className="text-xs text-purple-400 mb-2">
                            {battleState.currentTurn === 'player1' ? 'Select a skill to use:' : 'Waiting for opponent...'}
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {entity.skills.map((skill) => (
                              <button
                                key={skill.id}
                                onClick={() => handleSkillSelect(skill)}
                                disabled={battleState.currentTurn !== 'player1' || skill.currentCooldown > 0}
                                className={`p-2 rounded border text-left transition-all duration-300 ${
                                  selectedSkill?.id === skill.id
                                    ? 'border-yellow-500 bg-yellow-900/30'
                                    : skill.currentCooldown > 0
                                      ? 'border-gray-500/50 bg-black/50 opacity-50 cursor-not-allowed'
                                      : getSkillTypeColor(skill.type)
                                }`}
                              >
                                <div className="flex justify-between items-center">
                                  <span className="font-bold">{skill.name}</span>
                                  {skill.cooldown > 0 && (
                                    <span className="text-xs">
                                      {skill.currentCooldown > 0 ? `CD: ${skill.currentCooldown}` : 'Ready'}
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs mt-1">{skill.description}</div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Opponent Side */}
                <div className="space-y-4">
                  <h3 className="text-lg font-serif text-purple-300">Opponent's Team</h3>
                  
                  {/* Opponent Entities */}
                  {battleState.player2.entities.map((entity, index) => (
                    <div
                      key={entity.id}
                      onClick={() => {
                        if (selectedSkill && battleState.currentTurn === 'player1') {
                          handleTargetSelect(index);
                        }
                      }}
                      className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                        index === battleState.player2.currentEntityIndex
                          ? 'border-red-500 bg-red-900/20'
                          : 'border-purple-500/30 bg-black/30 opacity-50'
                      } ${
                        selectedSkill && battleState.currentTurn === 'player1'
                          ? 'cursor-pointer hover:border-yellow-500'
                          : ''
                      } ${
                        selectedTarget === index
                          ? 'border-yellow-500 bg-yellow-900/30'
                          : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl">{entity.sigil}</div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-purple-200 font-serif">{entity.name}</span>
                            {entity.isShiny && <span className="text-yellow-400">✨</span>}
                          </div>
                          <div className="flex items-center space-x-2 text-xs">
                            <span className={getTypeColor(entity.type)}>{entity.type}</span>
                            <span className="text-purple-400">•</span>
                            <span className={`text-${entity.rarity === 'mythic' ? 'purple' : entity.rarity === 'legendary' ? 'yellow' : entity.rarity === 'rare' ? 'blue' : 'gray'}-400`}>
                              {entity.rarity}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Health Bar */}
                      <div className="mt-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-red-400">HP</span>
                          <span className="text-purple-300">
                            {entity.stats?.health || 0}/{prepareEntityForBattle(entity).stats?.health || 100}
                          </span>
                        </div>
                        <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-red-600 to-red-400"
                            style={{ width: `${getEntityHealthPercentage(entity)}%` }}
                          />
                        </div>
                      </div>

                      {/* Target indicator */}
                      {selectedTarget === index && (
                        <div className="absolute inset-0 border-2 border-yellow-500 rounded-lg animate-pulse pointer-events-none" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Battle Controls */}
              <div className="flex justify-center mt-4">
                <button
                  onClick={handleExecuteAction}
                  disabled={
                    battleState.currentTurn !== 'player1' || 
                    !selectedSkill || 
                    (selectedSkill.target === 'single' && selectedTarget === null)
                  }
                  className={`px-8 py-3 rounded-lg font-serif uppercase tracking-wide transition-all duration-300 ${
                    battleState.currentTurn === 'player1' && selectedSkill && 
                    (selectedSkill.target !== 'single' || selectedTarget !== null)
                      ? 'bg-gradient-to-r from-red-800 to-orange-700 text-red-100 hover:from-red-700 hover:to-orange-600 hover:scale-105'
                      : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {battleState.currentTurn === 'player1' ? 'Execute Action' : 'Opponent\'s Turn...'}
                </button>
              </div>

              {/* Battle Logs */}
              <div className="mt-6 bg-black/30 rounded-lg p-4 border border-purple-500/30 h-48 overflow-y-auto">
                <h4 className="text-lg font-serif text-purple-300 mb-3">Battle Log</h4>
                <div className="space-y-2 text-sm">
                  {battleLogs.map((log, index) => (
                    <div key={index} className="text-purple-300">{log}</div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              </div>
            </div>
          )}

          {/* Battle Results */}
          {showResults && battleState && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-6xl mb-4">
                  {battleState.winner === 'player1' ? '🏆' : battleState.winner === 'player2' ? '💔' : '🤝'}
                </div>
                <h3 className="text-2xl font-serif text-purple-200 mb-2">
                  {battleState.winner === 'player1' 
                    ? 'Victory!' 
                    : battleState.winner === 'player2' 
                      ? 'Defeat!' 
                      : 'Draw!'}
                </h3>
                <p className="text-purple-400">
                  {battleState.winner === 'player1' 
                    ? 'Your entities have triumphed in battle!' 
                    : battleState.winner === 'player2' 
                      ? 'Your entities have been defeated. Train harder and try again!' 
                      : 'The battle ended in a draw. Both sides fought valiantly!'}
                </p>
              </div>

              {/* Battle Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-black/30 rounded-lg p-4 border border-purple-500/30">
                  <div className="flex items-center space-x-2 mb-3">
                    <Swords className="w-5 h-5 text-red-400" />
                    <h4 className="text-lg font-serif text-purple-300">Battle Stats</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-purple-400">Total Turns:</span>
                      <span className="text-purple-200">{battleState.turn}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-400">Battle Duration:</span>
                      <span className="text-purple-200">{Math.round(battleState.turn * 1.5)} minutes</span>
                    </div>
                  </div>
                </div>

                <div className="bg-black/30 rounded-lg p-4 border border-purple-500/30">
                  <div className="flex items-center space-x-2 mb-3">
                    <Award className="w-5 h-5 text-yellow-400" />
                    <h4 className="text-lg font-serif text-purple-300">Rewards</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    {battleRewards && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-purple-400">Essence:</span>
                          <span className="text-yellow-400">+{battleRewards.essence}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-400">Crystals:</span>
                          <span className="text-cyan-400">+{battleRewards.crystals}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-400">Experience:</span>
                          <span className="text-green-400">+{battleRewards.experience}</span>
                        </div>
                        {battleRewards.rankPoints && (
                          <div className="flex justify-between">
                            <span className="text-purple-400">Rank Points:</span>
                            <span className="text-purple-300">+{battleRewards.rankPoints}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-black/30 rounded-lg p-4 border border-purple-500/30">
                  <div className="flex items-center space-x-2 mb-3">
                    <Target className="w-5 h-5 text-green-400" />
                    <h4 className="text-lg font-serif text-purple-300">Entity Performance</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    {battleState.player1.entities.map((entity) => (
                      <div key={entity.id} className="flex justify-between">
                        <span className="text-purple-400">{entity.name}:</span>
                        <span className={`${entity.stats && entity.stats.health > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {entity.stats && entity.stats.health > 0 ? 'Survived' : 'Defeated'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Claim Rewards Button */}
              <div className="text-center mt-6">
                <button
                  onClick={handleClaimRewards}
                  className="px-8 py-3 bg-gradient-to-r from-yellow-800 to-amber-700 text-yellow-100 rounded-lg hover:from-yellow-700 hover:to-amber-600 transition-all duration-300 hover:scale-105 font-serif uppercase tracking-wide"
                >
                  Claim Rewards
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};