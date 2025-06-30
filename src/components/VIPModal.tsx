import React from 'react';
import { GameState } from '../types/game';
import { VIP_LEVELS } from '../utils/energySystem';
import { X, Crown, Star, Zap, Gift } from 'lucide-react';

interface VIPModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  onPurchaseVIP: (level: number) => void;
}

export const VIPModal: React.FC<VIPModalProps> = ({
  isOpen,
  onClose,
  gameState,
  onPurchaseVIP,
}) => {
  if (!isOpen) return null;

  const currentVIP = VIP_LEVELS.find(v => v.level === gameState.vipLevel) || VIP_LEVELS[0];
  const isVIPActive = gameState.vipLevel > 0 && gameState.vipExpiry > Date.now();

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative max-w-4xl w-full max-h-[90vh] bg-gradient-to-br from-yellow-900/95 to-amber-800/95 border-2 border-yellow-500/50 rounded-xl shadow-2xl overflow-hidden">
        {/* Fixed Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-yellow-900/80 backdrop-blur-sm rounded-full border border-yellow-500 text-yellow-300 hover:text-yellow-100 hover:bg-yellow-800 transition-all duration-300 hover:scale-110"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[90vh] p-6">
          {/* Header */}
          <div className="text-center mb-6 pr-16">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Crown className="w-8 h-8 text-yellow-400" />
              <h2 className="text-3xl font-serif text-yellow-200">VIP Membership</h2>
              <Crown className="w-8 h-8 text-yellow-400" />
            </div>
            
            {isVIPActive && (
              <div className="bg-gradient-to-r from-yellow-800 to-amber-700 px-4 py-2 rounded-full inline-block">
                <span className="text-yellow-200 font-serif">
                  Current: {currentVIP.name}
                </span>
              </div>
            )}
          </div>

          {/* VIP Levels */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {VIP_LEVELS.map((vip) => (
              <div
                key={vip.level}
                className={`relative p-4 rounded-lg border-2 transition-all duration-300 ${
                  vip.level === gameState.vipLevel
                    ? 'border-yellow-500 bg-gradient-to-br from-yellow-900/50 to-amber-800/50 shadow-glow-yellow-dim'
                    : vip.level === 0
                      ? 'border-gray-500/30 bg-black/30'
                      : 'border-purple-500/30 bg-black/30 hover:border-purple-400/50'
                }`}
              >
                <div className="text-center mb-3">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    {vip.level === 0 ? (
                      <Star className="w-5 h-5 text-gray-400" />
                    ) : (
                      [...Array(vip.level)].map((_, i) => (
                        <Crown key={i} className="w-4 h-4 text-yellow-400" />
                      ))
                    )}
                  </div>
                  <h3 className="text-lg font-serif text-purple-200 mb-1">{vip.name}</h3>
                  {vip.level > 0 && (
                    <div className="text-yellow-400 font-bold">
                      💎 {vip.price} Crystals/Month
                    </div>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-purple-400">Max Energy:</span>
                    <span className="text-purple-200">{vip.maxEnergy}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-purple-400">Regen Rate:</span>
                    <span className="text-purple-200">{vip.energyRegenRate}min</span>
                  </div>
                  {vip.level > 0 && (
                    <div className="text-xs text-purple-300 mt-2">
                      <div>Daily: +{vip.dailyBonuses.essence} Essence</div>
                      <div>Daily: +{vip.dailyBonuses.crystals} Crystals</div>
                      <div>Daily: +{vip.dailyBonuses.energy} Energy</div>
                    </div>
                  )}
                </div>

                <div className="space-y-1 mb-4">
                  {vip.benefits.map((benefit, index) => (
                    <div key={index} className="text-xs text-purple-300 flex items-center space-x-1">
                      <span className="text-green-400">✓</span>
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>

                {vip.level > 0 && vip.level !== gameState.vipLevel && (
                  <button
                    onClick={() => onPurchaseVIP(vip.level)}
                    disabled={gameState.essenceCrystals < vip.price}
                    className={`w-full py-2 px-4 rounded-lg font-serif uppercase tracking-wide transition-all duration-300 text-sm ${
                      gameState.essenceCrystals >= vip.price
                        ? 'bg-gradient-to-r from-yellow-800 to-amber-700 text-yellow-100 hover:from-yellow-700 hover:to-amber-600 hover:scale-105'
                        : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {gameState.essenceCrystals >= vip.price ? 'Upgrade' : 'Insufficient Crystals'}
                  </button>
                )}

                {vip.level === gameState.vipLevel && vip.level > 0 && (
                  <div className="w-full py-2 px-4 bg-green-800 text-green-200 rounded-lg text-center text-sm font-serif">
                    ✓ Active
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Crystal Purchase Options */}
          <div className="bg-black/30 rounded-lg p-4 border border-purple-500/30">
            <h4 className="text-lg font-serif text-purple-300 mb-3 text-center flex items-center justify-center space-x-2">
              <Gift className="w-5 h-5" />
              <span>Get Essence Crystals</span>
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { crystals: 100, price: '$0.99', bonus: 0 },
                { crystals: 500, price: '$4.99', bonus: 50 },
                { crystals: 1200, price: '$9.99', bonus: 200 },
                { crystals: 2500, price: '$19.99', bonus: 500 },
              ].map((pack, index) => (
                <div key={index} className="bg-purple-900/30 p-3 rounded-lg border border-purple-500/30 text-center">
                  <div className="text-2xl mb-2">💎</div>
                  <div className="text-purple-200 font-bold">
                    {pack.crystals + pack.bonus}
                  </div>
                  {pack.bonus > 0 && (
                    <div className="text-green-400 text-xs">+{pack.bonus} Bonus!</div>
                  )}
                  <div className="text-purple-400 text-sm mt-1">{pack.price}</div>
                  <button className="w-full mt-2 py-1 px-2 bg-gradient-to-r from-purple-800 to-purple-700 text-purple-100 rounded text-xs hover:from-purple-700 hover:to-purple-600 transition-all duration-300">
                    Purchase
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};