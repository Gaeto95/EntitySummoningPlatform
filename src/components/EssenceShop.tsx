import React from 'react';
import { GameState } from '../types/game';
import { X, ShoppingCart } from 'lucide-react';

interface EssenceShopProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  onPurchase: (item: string, cost: number) => void;
}

const SHOP_ITEMS = [
  {
    id: 'power_boost_small',
    name: 'Minor Power Boost',
    description: '+10% power for next 5 summons',
    cost: 100,
    icon: '⚡'
  },
  {
    id: 'power_boost_large',
    name: 'Major Power Boost',
    description: '+25% power for next 3 summons',
    cost: 250,
    icon: '🔥'
  },
  {
    id: 'rare_guarantee',
    name: 'Rare Summon Guarantee',
    description: 'Next summon guaranteed rare or better',
    cost: 500,
    icon: '💎'
  },
  {
    id: 'shiny_charm',
    name: 'Shiny Charm',
    description: '2x shiny chance for 10 summons',
    cost: 750,
    icon: '✨'
  },
  {
    id: 'weather_control',
    name: 'Weather Manipulation',
    description: 'Choose next weather condition',
    cost: 300,
    icon: '🌤️'
  },
  {
    id: 'streak_protection',
    name: 'Streak Protection',
    description: 'Protect current streak from breaking',
    cost: 200,
    icon: '🛡️'
  }
];

export const EssenceShop: React.FC<EssenceShopProps> = ({
  isOpen,
  onClose,
  gameState,
  onPurchase,
}) => {
  if (!isOpen) return null;

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
          <div className="text-center mb-6 pr-16">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <ShoppingCart className="w-8 h-8 text-purple-400" />
              <h2 className="text-3xl font-serif text-purple-200">Essence Emporium</h2>
              <ShoppingCart className="w-8 h-8 text-purple-400" />
            </div>
            <div className="text-purple-400">
              Current Essence: <span className="text-yellow-400 font-bold">{gameState.totalEssence}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SHOP_ITEMS.map((item) => (
              <div
                key={item.id}
                className="bg-black/30 border border-purple-500/30 rounded-lg p-4 hover:border-purple-400/50 transition-all duration-300"
              >
                <div className="text-center mb-3">
                  <div className="text-4xl mb-2">{item.icon}</div>
                  <h3 className="text-lg font-serif text-purple-200">{item.name}</h3>
                  <p className="text-sm text-purple-400 mb-3">{item.description}</p>
                  <div className="text-yellow-400 font-bold mb-3">{item.cost} Essence</div>
                </div>
                
                <button
                  onClick={() => onPurchase(item.id, item.cost)}
                  disabled={gameState.totalEssence < item.cost}
                  className={`w-full py-2 px-4 rounded-lg font-serif uppercase tracking-wide transition-all duration-300 ${
                    gameState.totalEssence >= item.cost
                      ? 'bg-gradient-to-r from-purple-800 to-purple-700 text-purple-100 hover:from-purple-700 hover:to-purple-600 hover:scale-105'
                      : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {gameState.totalEssence >= item.cost ? 'Purchase' : 'Insufficient Essence'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};