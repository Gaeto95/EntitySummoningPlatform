import React, { useState, useEffect } from 'react';
import { GameState, Entity, PvPRank } from '../types/game';
import { X, Swords, Trophy, Shield, Target, Users, ArrowRight, Award } from 'lucide-react';
import { BattleModal } from './BattleModal';
import { LoadingSpinner } from './LoadingSpinner';

interface PvPArenaModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  entities: Entity[];
  user: any;
  onUpdateGameState: (newState: Partial<GameState>) => void;
}

export const PvPArenaModal: React.FC<PvPArenaModalProps> = ({
  isOpen,
  onClose,
  gameState,
  entities,
  user,
  onUpdateGameState
}) => {
  const [activeTab, setActiveTab] = useState<'arena' | 'ranked' | 'tournaments' | 'history'>('arena');
  const [showBattleModal, setShowBattleModal] = useState(false);
  const [selectedMode, setSelectedMode] = useState<'casual' | 'ranked' | 'tournament' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // PvP stats
  const [pvpStats, setPvpStats] = useState({
    wins: 0,
    losses: 0,
    draws: 0,
    winStreak: 0,
    bestWinStreak: 0,
    totalBattles: 0,
    seasonRankPoints: 0
  });
  
  // PvP rank
  const [pvpRank, setPvpRank] = useState<PvPRank>({
    tier: 'bronze',
    division: 5,
    points: 0
  });

  // Initialize PvP stats from game state
  useEffect(() => {
    if (gameState.pvpStats) {
      setPvpStats(gameState.pvpStats);
    }
    
    if (gameState.pvpRank) {
      setPvpRank(gameState.pvpRank);
    }
  }, [gameState]);

  const handleStartBattle = (mode: 'casual' | 'ranked' | 'tournament') => {
    setSelectedMode(mode);
    setShowBattleModal(true);
  };

  const handleBattleComplete = (result: 'win' | 'loss' | 'draw', rewards: any) => {
    // Update PvP stats
    const updatedStats = { ...pvpStats };
    
    if (result === 'win') {
      updatedStats.wins += 1;
      updatedStats.winStreak += 1;
      updatedStats.bestWinStreak = Math.max(updatedStats.bestWinStreak, updatedStats.winStreak);
    } else if (result === 'loss') {
      updatedStats.losses += 1;
      updatedStats.winStreak = 0;
    } else {
      updatedStats.draws += 1;
    }
    
    updatedStats.totalBattles += 1;
    
    // Update rank points if it was a ranked match
    if (selectedMode === 'ranked' && rewards.rankPoints) {
      updatedStats.seasonRankPoints += rewards.rankPoints;
      
      // Update rank based on points
      const updatedRank = calculateNewRank(pvpRank, result, rewards.rankPoints);
      setPvpRank(updatedRank);
      
      // Update game state with new rank
      onUpdateGameState({
        pvpRank: updatedRank
      });
    }
    
    setPvpStats(updatedStats);
    
    // Update game state
    onUpdateGameState({
      pvpStats: updatedStats,
      totalEssence: gameState.totalEssence + rewards.essence,
      essenceCrystals: gameState.essenceCrystals + rewards.crystals
    });
  };

  const calculateNewRank = (
    currentRank: PvPRank,
    result: 'win' | 'loss' | 'draw',
    pointsChange: number
  ): PvPRank => {
    const tierOrder = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master'];
    const divisionsPerTier = 5; // 5 divisions per tier except master
    
    let { tier, division, points } = currentRank;
    
    // Update points
    points += pointsChange;
    
    // Check for promotion/demotion
    const tierIndex = tierOrder.indexOf(tier);
    
    // Points needed for promotion
    const promotionThreshold = tier === 'master' ? Infinity : 100;
    
    // Points for demotion
    const demotionThreshold = 0;
    
    if (points >= promotionThreshold) {
      // Promotion
      if (division > 1) {
        // Move up a division within the same tier
        division -= 1;
        points = 0;
      } else if (tierIndex < tierOrder.length - 1) {
        // Move up a tier
        tier = tierOrder[tierIndex + 1] as PvPRank['tier'];
        division = 5;
        points = 0;
      }
    } else if (points < demotionThreshold && (tierIndex > 0 || division < 5)) {
      // Demotion
      if (division < 5) {
        // Move down a division within the same tier
        division += 1;
        points = 75;
      } else if (tierIndex > 0) {
        // Move down a tier
        tier = tierOrder[tierIndex - 1] as PvPRank['tier'];
        division = 1;
        points = 75;
      }
    }
    
    return { tier, division, points };
  };

  const getRankColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'text-amber-700';
      case 'silver': return 'text-gray-400';
      case 'gold': return 'text-yellow-400';
      case 'platinum': return 'text-cyan-400';
      case 'diamond': return 'text-blue-400';
      case 'master': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const getRankIcon = (tier: string) => {
    switch (tier) {
      case 'bronze': return '🥉';
      case 'silver': return '🥈';
      case 'gold': return '🥇';
      case 'platinum': return '💎';
      case 'diamond': return '💠';
      case 'master': return '👑';
      default: return '🏅';
    }
  };

  if (!isOpen) return null;

  return (
    <>
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
                <h2 className="text-3xl font-serif text-purple-200">PvP Arena</h2>
                <Swords className="w-8 h-8 text-red-400" />
              </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-2 border-b border-purple-500/30 mb-6">
              {[
                { id: 'arena', name: 'Battle Arena', icon: Swords },
                { id: 'ranked', name: 'Ranked Matches', icon: Trophy },
                { id: 'tournaments', name: 'Tournaments', icon: Users },
                { id: 'history', name: 'Battle History', icon: Shield }
              ].map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-purple-900/50 text-purple-200 border-b-2 border-purple-400'
                        : 'text-purple-400 hover:text-purple-300'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Arena Tab */}
            {activeTab === 'arena' && (
              <div className="space-y-6">
                {/* Player Stats */}
                <div className="bg-black/30 rounded-lg p-4 border border-purple-500/30">
                  <h3 className="text-lg font-serif text-purple-300 mb-3">Your Battle Stats</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-black/20 rounded-lg">
                      <div className="text-purple-400 text-sm">Win/Loss Ratio</div>
                      <div className="text-purple-200 text-xl font-bold">
                        {pvpStats.totalBattles > 0 
                          ? (pvpStats.wins / pvpStats.totalBattles).toFixed(2) 
                          : '0.00'}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-black/20 rounded-lg">
                      <div className="text-purple-400 text-sm">Total Battles</div>
                      <div className="text-purple-200 text-xl font-bold">{pvpStats.totalBattles}</div>
                    </div>
                    <div className="text-center p-3 bg-black/20 rounded-lg">
                      <div className="text-purple-400 text-sm">Win Streak</div>
                      <div className="text-purple-200 text-xl font-bold">{pvpStats.winStreak}</div>
                    </div>
                    <div className="text-center p-3 bg-black/20 rounded-lg">
                      <div className="text-purple-400 text-sm">Best Streak</div>
                      <div className="text-purple-200 text-xl font-bold">{pvpStats.bestWinStreak}</div>
                    </div>
                  </div>
                </div>

                {/* Battle Modes */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Casual Battle */}
                  <div className="bg-black/30 rounded-lg p-4 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300">
                    <div className="text-center mb-3">
                      <div className="text-4xl mb-2">⚔️</div>
                      <h4 className="text-lg font-serif text-purple-200">Casual Battle</h4>
                      <p className="text-sm text-purple-400 mb-3">
                        Battle other summoners with no rank at stake
                      </p>
                    </div>
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-purple-400">Rewards:</span>
                        <span className="text-green-400">100% Base</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-400">Rank Points:</span>
                        <span className="text-red-400">None</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-400">Matchmaking:</span>
                        <span className="text-purple-300">Balanced</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleStartBattle('casual')}
                      className="w-full py-2 px-4 bg-gradient-to-r from-purple-800 to-purple-700 text-purple-100 rounded-lg hover:from-purple-700 hover:to-purple-600 transition-all duration-300 hover:scale-105 font-serif"
                    >
                      Start Casual Battle
                    </button>
                  </div>

                  {/* Ranked Battle */}
                  <div className="bg-black/30 rounded-lg p-4 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300">
                    <div className="text-center mb-3">
                      <div className="text-4xl mb-2">🏆</div>
                      <h4 className="text-lg font-serif text-purple-200">Ranked Battle</h4>
                      <p className="text-sm text-purple-400 mb-3">
                        Compete for rank and greater rewards
                      </p>
                    </div>
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-purple-400">Rewards:</span>
                        <span className="text-green-400">150% Base</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-400">Rank Points:</span>
                        <span className="text-yellow-400">+15-25 per win</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-400">Matchmaking:</span>
                        <span className="text-purple-300">Rank-based</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleStartBattle('ranked')}
                      className="w-full py-2 px-4 bg-gradient-to-r from-yellow-800 to-amber-700 text-yellow-100 rounded-lg hover:from-yellow-700 hover:to-amber-600 transition-all duration-300 hover:scale-105 font-serif"
                    >
                      Start Ranked Battle
                    </button>
                  </div>

                  {/* Tournament */}
                  <div className="bg-black/30 rounded-lg p-4 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300">
                    <div className="text-center mb-3">
                      <div className="text-4xl mb-2">🎖️</div>
                      <h4 className="text-lg font-serif text-purple-200">Tournament</h4>
                      <p className="text-sm text-purple-400 mb-3">
                        Enter tournaments for exclusive rewards
                      </p>
                    </div>
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-purple-400">Rewards:</span>
                        <span className="text-green-400">200%+ Base</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-400">Entry Fee:</span>
                        <span className="text-yellow-400">100 Essence</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-400">Next Tournament:</span>
                        <span className="text-purple-300">2h 15m</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleStartBattle('tournament')}
                      disabled={true}
                      className="w-full py-2 px-4 bg-gray-800 text-gray-500 rounded-lg cursor-not-allowed font-serif"
                    >
                      Coming Soon
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Ranked Tab */}
            {activeTab === 'ranked' && (
              <div className="space-y-6">
                {/* Current Rank */}
                <div className="bg-gradient-to-r from-purple-900/50 to-indigo-800/50 rounded-lg p-6 border border-purple-500/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-5xl">{getRankIcon(pvpRank.tier)}</div>
                      <div>
                        <h3 className={`text-2xl font-serif ${getRankColor(pvpRank.tier)}`}>
                          {pvpRank.tier.charAt(0).toUpperCase() + pvpRank.tier.slice(1)} {pvpRank.division}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="text-purple-400 text-sm">
                            {pvpRank.points} / 100 Points
                          </div>
                          {pvpRank.division === 1 && pvpRank.tier !== 'master' && (
                            <div className="text-yellow-400 text-xs">
                              Promotion Match!
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-purple-300 text-sm">Season Rank Points</div>
                      <div className="text-purple-200 text-xl font-bold">{pvpStats.seasonRankPoints}</div>
                    </div>
                  </div>
                  
                  {/* Rank Progress Bar */}
                  <div className="mt-4">
                    <div className="h-3 bg-black/50 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${
                          pvpRank.tier === 'bronze' ? 'from-amber-700 to-amber-600' :
                          pvpRank.tier === 'silver' ? 'from-gray-500 to-gray-400' :
                          pvpRank.tier === 'gold' ? 'from-yellow-600 to-yellow-400' :
                          pvpRank.tier === 'platinum' ? 'from-cyan-600 to-cyan-400' :
                          pvpRank.tier === 'diamond' ? 'from-blue-600 to-blue-400' :
                          'from-purple-600 to-purple-400'
                        }`}
                        style={{ width: `${pvpRank.points}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Rank Tiers */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master'].map((tier) => (
                    <div
                      key={tier}
                      className={`text-center p-4 rounded-lg border ${
                        pvpRank.tier === tier
                          ? `border-${tier === 'bronze' ? 'amber' : tier === 'silver' ? 'gray' : tier === 'gold' ? 'yellow' : tier === 'platinum' ? 'cyan' : tier === 'diamond' ? 'blue' : 'purple'}-500`
                          : 'border-purple-500/30'
                      } ${
                        pvpRank.tier === tier
                          ? `bg-${tier === 'bronze' ? 'amber' : tier === 'silver' ? 'gray' : tier === 'gold' ? 'yellow' : tier === 'platinum' ? 'cyan' : tier === 'diamond' ? 'blue' : 'purple'}-900/20`
                          : 'bg-black/30'
                      }`}
                    >
                      <div className="text-3xl mb-2">{getRankIcon(tier)}</div>
                      <div className={`font-serif ${getRankColor(tier)}`}>
                        {tier.charAt(0).toUpperCase() + tier.slice(1)}
                      </div>
                      {pvpRank.tier === tier && (
                        <div className="text-purple-400 text-xs mt-1">Current Rank</div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Rank Rewards */}
                <div className="bg-black/30 rounded-lg p-4 border border-purple-500/30">
                  <h3 className="text-lg font-serif text-purple-300 mb-3">Season Rewards</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="text-2xl">{getRankIcon('bronze')}</div>
                        <div>
                          <div className={getRankColor('bronze')}>Bronze</div>
                          <div className="text-purple-400 text-xs">500 Essence, 50 Crystals</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-2xl">{getRankIcon('silver')}</div>
                        <div>
                          <div className={getRankColor('silver')}>Silver</div>
                          <div className="text-purple-400 text-xs">1,000 Essence, 100 Crystals</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-2xl">{getRankIcon('gold')}</div>
                        <div>
                          <div className={getRankColor('gold')}>Gold</div>
                          <div className="text-purple-400 text-xs">2,000 Essence, 200 Crystals, Exclusive Cosmetic</div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="text-2xl">{getRankIcon('platinum')}</div>
                        <div>
                          <div className={getRankColor('platinum')}>Platinum</div>
                          <div className="text-purple-400 text-xs">5,000 Essence, 300 Crystals, Exclusive Entity</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-2xl">{getRankIcon('diamond')}</div>
                        <div>
                          <div className={getRankColor('diamond')}>Diamond</div>
                          <div className="text-purple-400 text-xs">10,000 Essence, 500 Crystals, Exclusive Title</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-2xl">{getRankIcon('master')}</div>
                        <div>
                          <div className={getRankColor('master')}>Master</div>
                          <div className="text-purple-400 text-xs">20,000 Essence, 1,000 Crystals, Legendary Entity</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Start Ranked Match */}
                <div className="text-center mt-6">
                  <button
                    onClick={() => handleStartBattle('ranked')}
                    className="px-8 py-3 bg-gradient-to-r from-yellow-800 to-amber-700 text-yellow-100 rounded-lg hover:from-yellow-700 hover:to-amber-600 transition-all duration-300 hover:scale-105 font-serif uppercase tracking-wide"
                  >
                    Start Ranked Match
                  </button>
                </div>
              </div>
            )}

            {/* Tournaments Tab */}
            {activeTab === 'tournaments' && (
              <div className="space-y-6">
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🏆</div>
                  <h3 className="text-2xl font-serif text-purple-200 mb-2">Tournaments Coming Soon</h3>
                  <p className="text-purple-400 max-w-md mx-auto">
                    Compete in scheduled tournaments against other summoners for exclusive rewards and glory!
                  </p>
                </div>
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div className="space-y-6">
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📜</div>
                  <h3 className="text-2xl font-serif text-purple-200 mb-2">Battle History Coming Soon</h3>
                  <p className="text-purple-400 max-w-md mx-auto">
                    View your past battles, analyze your performance, and improve your strategy!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Battle Modal */}
      <BattleModal
        isOpen={showBattleModal}
        onClose={() => setShowBattleModal(false)}
        gameState={gameState}
        entities={entities}
        user={user}
        onBattleComplete={handleBattleComplete}
      />
    </>
  );
};