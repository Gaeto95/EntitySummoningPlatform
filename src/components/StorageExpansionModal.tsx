import React from 'react';
import { GameState } from '../types/game';
import { X, Archive, Plus, Star } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface StorageExpansionModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  onPurchaseSlots: (slots: number, cost: number, currency: 'essence' | 'crystals') => void;
}

const STORAGE_PACKAGES = [
  {
    slots: 10,
    cost: 100,
    currency: 'essence' as const,
    icon: '📦',
    name: 'Small Expansion',
    description: 'Add 10 storage slots'
  },
  {
    slots: 25,
    cost: 200,
    currency: 'essence' as const,
    icon: '📚',
    name: 'Medium Expansion',
    description: 'Add 25 storage slots',
    discount: 0.2
  },
  {
    slots: 50,
    cost: 100,
    currency: 'crystals' as const,
    icon: '🏛️',
    name: 'Large Expansion',
    description: 'Add 50 storage slots',
    discount: 0.4
  },
  {
    slots: 100,
    cost: 150,
    currency: 'crystals' as const,
    icon: '🌟',
    name: 'Massive Expansion',
    description: 'Add 100 storage slots',
    discount: 0.5,
    popular: true
  }
];

export const StorageExpansionModal: React.FC<StorageExpansionModalProps> = ({
  isOpen,
  onClose,
  gameState,
  onPurchaseSlots,
}) => {
  if (!isOpen) return null;

  const usedSlots = gameState.grimoireSlots || 50; // Default starting slots
  const maxSlots = gameState.maxGrimoireSlots || 50;
  const usagePercent = (usedSlots / maxSlots) * 100;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative max-w-4xl w-full max-h-[90vh] bg-gradient-to-br from-purple-900/95 to-black/95 border-2 border-purple-500/50 rounded-xl shadow-2xl overflow-hidden">
        {/* Fixed Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-purple-900/80 backdrop-blur-sm rounded-full border border-purple-500 text-purple-300 hover:text-purple-100 hover:bg-purple-800 transition-all duration-300 hover:scale-110"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[90vh] p-6">
          {/* Header */}
          <div className="text-center mb-6 pr-16">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Archive className="w-8 h-8 text-purple-400" />
              <h2 className="text-3xl font-serif text-purple-200">Grimoire Storage</h2>
              <Archive className="w-8 h-8 text-purple-400" />
            </div>
            
            <div className="flex items-center justify-center space-x-6 mb-4">
              <div className="text-purple-400">
                Essence: <span className="text-yellow-400 font-bold">{gameState.totalEssence.toLocaleString()}</span>
              </div>
              <div className="text-purple-400">
                Crystals: <span className="text-cyan-400 font-bold">{gameState.essenceCrystals.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Current Storage Status */}
          <div className="mb-6 p-4 bg-black/30 rounded-lg border border-purple-500/30">
            <h3 className="text-lg font-serif text-purple-300 mb-3 text-center">Current Storage</h3>
            
            <div className="flex items-center justify-between mb-3">
              <span className="text-purple-400">Used Slots:</span>
              <span className="text-purple-200 font-bold">{usedSlots} / {maxSlots}</span>
            </div>
            
            <div className="h-4 bg-black/50 rounded-full border border-purple-500/30 overflow-hidden mb-3">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  usagePercent > 90 ? 'bg-gradient-to-r from-red-600 to-red-500' :
                  usagePercent > 75 ? 'bg-gradient-to-r from-yellow-600 to-orange-500' :
                  'bg-gradient-to-r from-green-600 to-emerald-500'
                }`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
            
            <div className="text-center">
              <span className={`text-sm font-bold ${
                usagePercent > 90 ? 'text-red-400' :
                usagePercent > 75 ? 'text-yellow-400' :
                'text-green-400'
              }`}>
                {Math.round(usagePercent)}% Full
              </span>
              {usagePercent > 90 && (
                <div className="text-red-400 text-xs mt-1 animate-pulse">
                  ⚠️ Storage nearly full! Expand to collect more entities.
                </div>
              )}
            </div>
          </div>

          {/* Expansion Packages */}
          <div className="space-y-4">
            <h3 className="text-xl font-serif text-purple-300 text-center mb-4">Expansion Packages</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {STORAGE_PACKAGES.map((pkg, index) => {
                const canAfford = pkg.currency === 'crystals' 
                  ? gameState.essenceCrystals >= pkg.cost
                  : gameState.totalEssence >= pkg.cost;

                const originalCost = pkg.slots * (pkg.currency === 'crystals' ? 2 : 10);
                const savings = pkg.discount ? originalCost - pkg.cost : 0;

                return (
                  <div
                    key={index}
                    className={`relative p-4 rounded-lg border-2 transition-all duration-300 ${
                      pkg.popular
                        ? 'border-yellow-500 bg-gradient-to-br from-yellow-900/30 to-amber-800/30 shadow-glow-yellow-dim'
                        : 'border-purple-500/30 bg-black/30 hover:border-purple-400/50'
                    }`}
                  >
                    {pkg.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <div className="bg-yellow-500 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                          <Star className="w-3 h-3" />
                          <span>POPULAR</span>
                        </div>
                      </div>
                    )}

                    <div className="text-center">
                      <div className="text-4xl mb-3">{pkg.icon}</div>
                      <h4 className="text-lg font-serif text-purple-200 mb-1">{pkg.name}</h4>
                      <p className="text-sm text-purple-400 mb-3">{pkg.description}</p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-center space-x-2">
                          <Plus className="w-4 h-4 text-green-400" />
                          <span className="text-green-400 font-bold">{pkg.slots} Slots</span>
                        </div>
                        
                        <div className={`text-${pkg.currency === 'crystals' ? 'cyan' : 'yellow'}-400 font-bold`}>
                          {pkg.currency === 'crystals' ? '💎' : '💰'} {pkg.cost.toLocaleString()}
                        </div>
                        
                        {pkg.discount && savings > 0 && (
                          <div className="text-green-400 text-sm">
                            Save {savings.toLocaleString()} ({Math.round(pkg.discount * 100)}% off!)
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={() => onPurchaseSlots(pkg.slots, pkg.cost, pkg.currency)}
                        disabled={!canAfford}
                        className={`w-full py-2 px-4 rounded-lg font-serif uppercase tracking-wide transition-all duration-300 text-sm ${
                          canAfford
                            ? pkg.popular
                              ? 'bg-gradient-to-r from-yellow-800 to-amber-700 text-yellow-100 hover:from-yellow-700 hover:to-amber-600 hover:scale-105'
                              : 'bg-gradient-to-r from-purple-800 to-purple-700 text-purple-100 hover:from-purple-700 hover:to-purple-600 hover:scale-105'
                            : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {canAfford ? 'Purchase' : 'Insufficient Funds'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Benefits Info */}
          <div className="mt-6 bg-black/30 rounded-lg p-4 border border-purple-500/30">
            <h4 className="text-lg font-serif text-purple-300 mb-3 text-center">Why Expand Storage?</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl mb-2">📚</div>
                <div className="text-purple-400">Collect More</div>
                <div className="text-purple-300">Store unlimited entities without sacrificing favorites</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">⚡</div>
                <div className="text-purple-400">No Interruptions</div>
                <div className="text-purple-300">Continue summoning without storage management</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🏆</div>
                <div className="text-purple-400">Complete Collections</div>
                <div className="text-purple-300">Build complete sets of rare and legendary entities</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};