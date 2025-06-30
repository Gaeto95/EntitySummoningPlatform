import React, { useState, useEffect } from 'react';
import { GameState, SummonBanner, Entity } from '../types/game';
import { CURRENT_BANNERS, calculatePullCost, getMultiPullDiscount } from '../utils/gachaSystem';
import { X, Star, Sparkles, Clock, Gift, Crown, Skull, Eye, Flame } from 'lucide-react';
import { Tooltip } from './Tooltip';
import { playGachaPullSound } from '../utils/audioPlayer';

interface GachaModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  onPull: (bannerId: string, pullCount: number) => Promise<any>;
}

export const GachaModal: React.FC<GachaModalProps> = ({
  isOpen,
  onClose,
  gameState,
  onPull,
}) => {
  const [selectedBanner, setSelectedBanner] = useState<SummonBanner | null>(null);
  const [pullCount, setPullCount] = useState(1);
  const [isPulling, setIsPulling] = useState(false);
  const [pulledEntities, setPulledEntities] = useState<Entity[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset state when modal is closed
    if (!isOpen) {
      setSelectedBanner(null);
      setPulledEntities([]);
      setShowResults(false);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const activeBanners = CURRENT_BANNERS.filter(banner => 
    Date.now() >= banner.startDate && Date.now() <= banner.endDate
  );

  const formatTimeRemaining = (endDate: number): string => {
    const remaining = endDate - Date.now();
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const handlePull = async (banner: SummonBanner, count: number) => {
    const cost = calculatePullCost(banner, count);
    const canAfford = banner.currency === 'crystals' 
      ? gameState.essenceCrystals >= cost
      : gameState.totalEssence >= cost;

    if (canAfford) {
      setIsPulling(true);
      setError(null);
      
      try {
        // Play sound effect
        playGachaPullSound();
        
        // Generate mock entities immediately instead of animation
        const mockEntities: Entity[] = Array.from({ length: count }, (_, i) => ({
          id: `gacha_${Date.now()}_${i}`,
          name: `Summoned Entity ${i + 1}`,
          type: ['demon', 'divine', 'ancient'][Math.floor(Math.random() * 3)] as 'demon' | 'divine' | 'ancient',
          rarity: ['common', 'rare', 'legendary', 'mythic'][Math.floor(Math.random() * 4)] as 'common' | 'rare' | 'legendary' | 'mythic',
          personality: 'Mysterious and powerful',
          sigil: ['⚡', '👁', '🔥', '💀', '⚔', '🐉', '👑', '🌙'][Math.floor(Math.random() * 8)],
          aura: 'Shimmering with otherworldly energy',
          power: Math.floor(Math.random() * 50) + 50,
          domain: 'Cosmic Forces',
          manifestationText: 'I have been summoned by your ritual...',
          level: 1,
          experience: 0,
          abilities: ['Cosmic Power'],
          collectedAt: Date.now(),
          isShiny: Math.random() < 0.1,
          dialogue: ['Greetings, summoner...'],
          mood: 'neutral' as const,
          loyalty: 50
        }));

        setPulledEntities(mockEntities);
        setShowResults(true);
        
        // Call the actual pull function
        const result = await onPull(banner.id, count);
        console.log("Pull result:", result);
      } catch (err) {
        console.error('Gacha pull failed:', err);
        setError('Failed to perform summon. Please try again.');
      } finally {
        setIsPulling(false);
      }
    }
  };

  const handleCloseResults = () => {
    setShowResults(false);
    setPulledEntities([]);
    setSelectedBanner(null);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'demon': return <Skull className="w-6 h-6" />;
      case 'divine': return <Crown className="w-6 h-6" />;
      case 'ancient': return <Eye className="w-6 h-6" />;
      default: return <Flame className="w-6 h-6" />;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'mythic': return 'from-purple-600 to-pink-600';
      case 'legendary': return 'from-yellow-600 to-orange-600';
      case 'rare': return 'from-blue-600 to-cyan-600';
      default: return 'from-gray-600 to-gray-500';
    }
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'mythic': return 'shadow-glow-rainbow animate-pulse';
      case 'legendary': return 'shadow-glow-yellow-intense animate-pulse';
      case 'rare': return 'shadow-glow-cyan-intense animate-pulse';
      default: return 'shadow-glow-purple-dim';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative max-w-6xl w-full max-h-[90vh] bg-gradient-to-br from-purple-900/95 to-black/95 border-2 border-purple-500/50 rounded-xl shadow-2xl overflow-hidden">
        {/* Fixed Close Button */}
        <button
          onClick={showResults ? handleCloseResults : onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-purple-900/80 backdrop-blur-sm rounded-full border border-purple-500 text-purple-300 hover:text-purple-100 hover:bg-purple-800 transition-all duration-300 hover:scale-110"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Simple Loading Indicator */}
        {isPulling && (
          <div className="absolute inset-0 bg-black/90 z-30 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-t-transparent border-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
              <div className="text-xl font-serif text-purple-200">
                Summoning Entities...
              </div>
            </div>
          </div>
        )}

        {/* Gacha Results Display */}
        {showResults && (
          <div className="absolute inset-0 bg-black/95 z-30 overflow-y-auto">
            <div className="p-6">
              <div className="text-center mb-6 pr-16">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <Gift className="w-8 h-8 text-yellow-400" />
                  <h2 className="text-3xl font-serif text-yellow-200">Summoning Results</h2>
                  <Gift className="w-8 h-8 text-yellow-400" />
                </div>
                <p className="text-purple-300">
                  You have summoned {pulledEntities.length} entit{pulledEntities.length === 1 ? 'y' : 'ies'}!
                </p>
              </div>

              {/* Results Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {pulledEntities.map((entity, index) => (
                  <div
                    key={entity.id}
                    className={`relative p-4 rounded-lg border-2 transition-all duration-500 ${getRarityGlow(entity.rarity)} bg-gradient-to-br ${getRarityColor(entity.rarity)}/20 border-purple-500/50`}
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    {/* Rarity indicator */}
                    <div className={`absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-bold uppercase bg-gradient-to-r ${getRarityColor(entity.rarity)} text-white`}>
                      {entity.rarity}
                    </div>

                    {/* Shiny indicator */}
                    {entity.isShiny && (
                      <div className="absolute -top-2 -left-2 text-yellow-400 animate-ping">
                        ✨
                      </div>
                    )}

                    <div className="text-center">
                      {/* Entity Icon */}
                      <div className="flex items-center justify-center mb-3">
                        <div className="text-4xl mb-2">{entity.sigil}</div>
                      </div>

                      {/* Entity Info */}
                      <h3 className="text-lg font-serif text-white mb-1 flex items-center justify-center space-x-2">
                        <span>{entity.name}</span>
                        {entity.isShiny && <span className="text-yellow-400">✨</span>}
                      </h3>
                      
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <div className="text-purple-300">
                          {getTypeIcon(entity.type)}
                        </div>
                        <span className="text-purple-300 text-sm uppercase">{entity.type}</span>
                      </div>

                      <div className="text-purple-400 text-sm mb-3">{entity.personality}</div>

                      {/* Power Level */}
                      <div className="mb-3">
                        <div className="text-xs text-purple-400 mb-1">Power: {entity.power}</div>
                        <div className="h-2 bg-black/50 rounded-full border border-purple-500/30">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${getRarityColor(entity.rarity)} animate-pulse`}
                            style={{ width: `${entity.power}%` }}
                          />
                        </div>
                      </div>

                      {/* Abilities */}
                      <div className="text-xs text-purple-300">
                        <div className="text-purple-400 mb-1">Abilities:</div>
                        <div className="flex flex-wrap gap-1 justify-center">
                          {entity.abilities.map((ability, i) => (
                            <span key={i} className="bg-purple-900/50 px-2 py-1 rounded text-xs">
                              {ability}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Stats */}
              <div className="bg-black/30 rounded-lg p-4 border border-purple-500/30 mb-6">
                <h4 className="text-lg font-serif text-purple-300 mb-3 text-center">Pull Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-center">
                  <div>
                    <div className="text-gray-400">Common</div>
                    <div className="text-gray-300 font-bold">
                      {pulledEntities.filter(e => e.rarity === 'common').length}
                    </div>
                  </div>
                  <div>
                    <div className="text-blue-400">Rare</div>
                    <div className="text-blue-300 font-bold">
                      {pulledEntities.filter(e => e.rarity === 'rare').length}
                    </div>
                  </div>
                  <div>
                    <div className="text-yellow-400">Legendary</div>
                    <div className="text-yellow-300 font-bold">
                      {pulledEntities.filter(e => e.rarity === 'legendary').length}
                    </div>
                  </div>
                  <div>
                    <div className="text-purple-400">Mythic</div>
                    <div className="text-purple-300 font-bold">
                      {pulledEntities.filter(e => e.rarity === 'mythic').length}
                    </div>
                  </div>
                </div>
                {pulledEntities.some(e => e.isShiny) && (
                  <div className="text-center mt-3">
                    <div className="text-yellow-400 text-sm">
                      ✨ {pulledEntities.filter(e => e.isShiny).length} Shiny Entit{pulledEntities.filter(e => e.isShiny).length === 1 ? 'y' : 'ies'} Found! ✨
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="text-center mt-6">
                <button
                  onClick={handleCloseResults}
                  className="px-6 py-3 bg-gradient-to-r from-green-800 to-emerald-700 text-green-100 rounded-lg hover:from-green-700 hover:to-emerald-600 transition-all duration-300 hover:scale-105 font-serif uppercase tracking-wide"
                >
                  ✓ Collect All
                </button>
                <button
                  onClick={() => setShowResults(false)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-800 to-purple-700 text-purple-100 rounded-lg hover:from-purple-700 hover:to-purple-600 transition-all duration-300 hover:scale-105 font-serif uppercase tracking-wide ml-4"
                >
                  🎰 Pull Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Content - Only show when not pulling or showing results */}
        {!isPulling && !showResults && (
          <div className="overflow-y-auto max-h-[90vh] p-6">
            {/* Header */}
            <div className="text-center mb-6 pr-16">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <Sparkles className="w-8 h-8 text-purple-400" />
                <h2 className="text-3xl font-serif text-purple-200">Premium Summoning</h2>
                <Sparkles className="w-8 h-8 text-purple-400" />
              </div>
              
              <div className="flex items-center justify-center space-x-6">
                <div className="text-purple-400">
                  Essence: <span className="text-yellow-400 font-bold">{gameState.totalEssence.toLocaleString()}</span>
                </div>
                <div className="text-purple-400">
                  Crystals: <span className="text-cyan-400 font-bold">{gameState.essenceCrystals.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-center">
                {error}
              </div>
            )}

            {!selectedBanner ? (
              /* Banner Selection */
              <div className="space-y-4">
                <h3 className="text-xl font-serif text-purple-300 text-center mb-6">Choose a Banner</h3>
                
                {activeBanners.map((banner) => {
                  const pullsOnBanner = gameState.bannerPulls[banner.id] || 0;
                  const pullsUntilGuaranteed = banner.guaranteedLegendaryAt - (pullsOnBanner % banner.guaranteedLegendaryAt);
                  
                  return (
                    <div
                      key={banner.id}
                      className={`p-6 rounded-lg border-2 cursor-pointer transition-all duration-300 hover:scale-[1.02] bg-gradient-to-r ${banner.background} border-purple-500/50 hover:border-purple-400 hover:shadow-2xl hover:shadow-purple-500/20`}
                      onClick={() => setSelectedBanner(banner)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-4xl animate-pulse">{banner.icon}</div>
                          <div>
                            <h4 className="text-xl font-serif text-white mb-1">{banner.name}</h4>
                            <p className="text-purple-200 text-sm mb-2">{banner.description}</p>
                            <div className="flex items-center space-x-4 text-xs">
                              <div className="text-purple-300">
                                Featured: {banner.featuredEntities.join(', ')}
                              </div>
                              <div className="text-yellow-300">
                                {banner.rateUpMultiplier}x Rate Up
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-cyan-400 font-bold mb-2">
                            💎 {banner.cost} per pull
                          </div>
                          <div className="text-purple-300 text-sm mb-1">
                            Pulls: {pullsOnBanner}
                          </div>
                          <div className="text-yellow-400 text-sm">
                            Guaranteed in: {pullsUntilGuaranteed}
                          </div>
                          <div className="flex items-center space-x-1 text-xs text-purple-400 mt-2">
                            <Clock className="w-3 h-3" />
                            <span>{formatTimeRemaining(banner.endDate)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Pull Interface */
              <div className="space-y-6">
                <button
                  onClick={() => setSelectedBanner(null)}
                  className="text-purple-400 hover:text-purple-200 transition-colors mb-4"
                >
                  ← Back to Banners
                </button>
                
                <div className={`p-6 rounded-lg bg-gradient-to-r ${selectedBanner.background} border border-purple-500/50`}>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="text-4xl animate-pulse">{selectedBanner.icon}</div>
                    <div>
                      <h3 className="text-2xl font-serif text-white">{selectedBanner.name}</h3>
                      <p className="text-purple-200">{selectedBanner.description}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-purple-300">Rate Up</div>
                      <div className="text-yellow-400 font-bold">{selectedBanner.rateUpMultiplier}x</div>
                    </div>
                    <div className="text-center">
                      <div className="text-purple-300">Your Pulls</div>
                      <div className="text-cyan-400 font-bold">{gameState.bannerPulls[selectedBanner.id] || 0}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-purple-300">Pity Counter</div>
                      <div className="text-red-400 font-bold">{gameState.pityCounter}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-purple-300">Time Left</div>
                      <div className="text-orange-400 font-bold">{formatTimeRemaining(selectedBanner.endDate)}</div>
                    </div>
                  </div>
                </div>

                {/* Pull Options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 10, 50].map((count) => {
                    const cost = calculatePullCost(selectedBanner, count);
                    const discount = getMultiPullDiscount(count);
                    const canAfford = selectedBanner.currency === 'crystals' 
                      ? gameState.essenceCrystals >= cost
                      : gameState.totalEssence >= cost;

                    return (
                      <div
                        key={count}
                        className="bg-black/30 border border-purple-500/30 rounded-lg p-4 text-center hover:border-purple-400/50 transition-all duration-300"
                      >
                        <div className="text-2xl mb-2">
                          {count === 1 ? '🎯' : count === 10 ? '🎁' : '💫'}
                        </div>
                        <h4 className="text-lg font-serif text-purple-200 mb-2">
                          {count} Pull{count > 1 ? 's' : ''}
                        </h4>
                        
                        <div className="space-y-2 mb-4">
                          <div className="text-cyan-400 font-bold">
                            💎 {cost.toLocaleString()}
                          </div>
                          {discount > 0 && (
                            <div className="text-green-400 text-sm">
                              {Math.round(discount * 100)}% Discount!
                            </div>
                          )}
                          {count >= 10 && (
                            <div className="text-yellow-400 text-xs">
                              Guaranteed 4★+ in 10-pull
                            </div>
                          )}
                        </div>
                        
                        <button
                          onClick={() => handlePull(selectedBanner, count)}
                          disabled={!canAfford || isPulling}
                          className={`w-full py-2 px-4 rounded-lg font-serif uppercase tracking-wide transition-all duration-300 text-sm ${
                            canAfford && !isPulling
                              ? 'bg-gradient-to-r from-purple-800 to-purple-700 text-purple-100 hover:from-purple-700 hover:to-purple-600 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30'
                              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {isPulling ? 'Summoning...' : canAfford ? 'Summon' : 'Insufficient Crystals'}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Rates Information */}
                <div className="bg-black/30 rounded-lg p-4 border border-purple-500/30">
                  <h4 className="text-lg font-serif text-purple-300 mb-3 text-center">Drop Rates</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-center">
                    <div>
                      <div className="text-gray-400">Common</div>
                      <div className="text-gray-300">70%</div>
                    </div>
                    <div>
                      <div className="text-blue-400">Rare</div>
                      <div className="text-blue-300">25%</div>
                    </div>
                    <div>
                      <div className="text-yellow-400">Legendary</div>
                      <div className="text-yellow-300">4.5%</div>
                    </div>
                    <div>
                      <div className="text-purple-400">Mythic</div>
                      <div className="text-purple-300">0.5%</div>
                    </div>
                  </div>
                  <div className="text-xs text-purple-500 text-center mt-3">
                    * Featured entities have {selectedBanner.rateUpMultiplier}x increased rates
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};