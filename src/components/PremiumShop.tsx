import React from 'react';
import { GameState } from '../types/game';
import { X, ShoppingCart, Zap, Star, Shield, Sparkles } from 'lucide-react';

interface PremiumShopProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  onPurchase: (itemId: string, cost: number, currency: 'essence' | 'crystals') => void;
}

const PREMIUM_SHOP_ITEMS = [
  {
    id: 'energy_refill_full',
    name: 'Full Energy Refill',
    description: 'Instantly restore all energy',
    cost: 10,
    currency: 'crystals' as const,
    icon: '⚡',
    category: 'energy'
  },
  {
    id: 'energy_refill_5',
    name: 'Energy Boost (5)',
    description: 'Restore 5 energy points',
    cost: 5,
    currency: 'crystals' as const,
    icon: '🔋',
    category: 'energy'
  },
  {
    id: 'legendary_guarantee',
    name: 'Legendary Guarantee',
    description: 'Next summon guaranteed legendary+',
    cost: 50,
    currency: 'crystals' as const,
    icon: '👑',
    category: 'summon'
  },
  {
    id: 'shiny_charm_premium',
    name: 'Premium Shiny Charm',
    description: '5x shiny chance for 20 summons',
    cost: 100,
    currency: 'crystals' as const,
    icon: '✨',
    category: 'summon'
  },
  {
    id: 'power_boost_mega',
    name: 'Mega Power Boost',
    description: '+50% power for next 10 summons',
    cost: 75,
    currency: 'crystals' as const,
    icon: '🔥',
    category: 'power'
  },
  {
    id: 'streak_insurance',
    name: 'Streak Insurance',
    description: 'Protect streak from breaking (3 uses)',
    cost: 30,
    currency: 'crystals' as const,
    icon: '🛡️',
    category: 'protection'
  },
  {
    id: 'grimoire_expansion',
    name: 'Grimoire Expansion',
    description: '+50 entity storage slots',
    cost: 200,
    currency: 'crystals' as const,
    icon: '📚',
    category: 'storage'
  },
  {
    id: 'auto_collect',
    name: 'Auto-Collect (24h)',
    description: 'Automatically collect entities',
    cost: 25,
    currency: 'crystals' as const,
    icon: '🤖',
    category: 'convenience'
  }
];

export const PremiumShop: React.FC<PremiumShopProps> = ({
  isOpen,
  onClose,
  gameState,
  onPurchase,
}) => {
  if (!isOpen) return null;

  const categories = {
    energy: { name: 'Energy', icon: Zap, color: 'blue' },
    summon: { name: 'Summoning', icon: Star, color: 'purple' },
    power: { name: 'Power', icon: Sparkles, color: 'red' },
    protection: { name: 'Protection', icon: Shield, color: 'green' },
    storage: { name: 'Storage', icon: ShoppingCart, color: 'yellow' },
    convenience: { name: 'Convenience', icon: Star, color: 'cyan' }
  };

  const groupedItems = PREMIUM_SHOP_ITEMS.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof PREMIUM_SHOP_ITEMS>);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative max-w-6xl w-full max-h-[90vh] bg-gradient-to-br from-purple-900/95 to-black/95 border-2 border-purple-500/50 rounded-xl shadow-2xl overflow-hidden">
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
              <ShoppingCart className="w-8 h-8 text-purple-400" />
              <h2 className="text-3xl font-serif text-purple-200">Premium Shop</h2>
              <ShoppingCart className="w-8 h-8 text-purple-400" />
            </div>
            
            <div className="flex items-center justify-center space-x-6">
              <div className="text-purple-400">
                Essence: <span className="text-yellow-400 font-bold">{gameState.totalEssence}</span>
              </div>
              <div className="text-purple-400">
                Crystals: <span className="text-cyan-400 font-bold">{gameState.essenceCrystals}</span>
              </div>
            </div>
          </div>

          {/* Shop Categories */}
          {Object.entries(groupedItems).map(([categoryKey, items]) => {
            const category = categories[categoryKey as keyof typeof categories];
            const IconComponent = category.icon;
            
            return (
              <div key={categoryKey} className="mb-8">
                <div className="flex items-center space-x-2 mb-4">
                  <IconComponent className={`w-6 h-6 text-${category.color}-400`} />
                  <h3 className="text-xl font-serif text-purple-300">{category.name}</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {items.map((item) => {
                    const canAfford = item.currency === 'crystals' 
                      ? gameState.essenceCrystals >= item.cost
                      : gameState.totalEssence >= item.cost;
                    
                    return (
                      <div
                        key={item.id}
                        className="bg-black/30 border border-purple-500/30 rounded-lg p-4 hover:border-purple-400/50 transition-all duration-300"
                      >
                        <div className="text-center mb-3">
                          <div className="text-4xl mb-2">{item.icon}</div>
                          <h4 className="text-lg font-serif text-purple-200 mb-1">{item.name}</h4>
                          <p className="text-sm text-purple-400 mb-3">{item.description}</p>
                          
                          <div className="flex items-center justify-center space-x-1 mb-3">
                            <span className={`text-${item.currency === 'crystals' ? 'cyan' : 'yellow'}-400 font-bold`}>
                              {item.currency === 'crystals' ? '💎' : '💰'} {item.cost}
                            </span>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => onPurchase(item.id, item.cost, item.currency)}
                          disabled={!canAfford}
                          className={`w-full py-2 px-4 rounded-lg font-serif uppercase tracking-wide transition-all duration-300 text-sm ${
                            canAfford
                              ? 'bg-gradient-to-r from-purple-800 to-purple-700 text-purple-100 hover:from-purple-700 hover:to-purple-600 hover:scale-105'
                              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {canAfford ? 'Purchase' : `Need ${item.cost - (item.currency === 'crystals' ? gameState.essenceCrystals : gameState.totalEssence)} more`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};