import React, { useState } from 'react';
import { GameState, CosmeticItem } from '../types/game';
import { COSMETIC_ITEMS, getCosmeticsByType } from '../utils/cosmeticSystem';
import { X, Palette, Eye, Settings, Sparkles, Lock } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface CosmeticShopProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  onPurchase: (cosmeticId: string) => void;
  onEquip: (cosmeticId: string, slot: keyof GameState['equippedCosmetics']) => void;
}

export const CosmeticShop: React.FC<CosmeticShopProps> = ({
  isOpen,
  onClose,
  gameState,
  onPurchase,
  onEquip,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CosmeticItem['type']>('circle_theme');
  const [previewItem, setPreviewItem] = useState<CosmeticItem | null>(null);

  if (!isOpen) return null;

  const categories = [
    { type: 'circle_theme' as const, name: 'Circle Themes', icon: Palette },
    { type: 'particle_effect' as const, name: 'Particle Effects', icon: Sparkles },
    { type: 'ui_theme' as const, name: 'UI Themes', icon: Settings },
    { type: 'summon_animation' as const, name: 'Summon Animations', icon: Eye },
  ];

  const categoryItems = getCosmeticsByType(selectedCategory);

  const getRarityColor = (rarity: CosmeticItem['rarity']) => {
    switch (rarity) {
      case 'mythic': return 'from-purple-600 to-pink-600';
      case 'legendary': return 'from-yellow-600 to-orange-600';
      case 'rare': return 'from-blue-600 to-cyan-600';
      default: return 'from-gray-600 to-gray-500';
    }
  };

  const getSlotForType = (type: CosmeticItem['type']): keyof GameState['equippedCosmetics'] => {
    switch (type) {
      case 'circle_theme': return 'circleTheme';
      case 'particle_effect': return 'particleEffect';
      case 'ui_theme': return 'uiTheme';
      case 'summon_animation': return 'summonAnimation';
      default: return 'circleTheme';
    }
  };

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
              <Palette className="w-8 h-8 text-purple-400" />
              <h2 className="text-3xl font-serif text-purple-200">Cosmetic Shop</h2>
              <Palette className="w-8 h-8 text-purple-400" />
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

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Category Sidebar */}
            <div className="lg:col-span-1">
              <h3 className="text-lg font-serif text-purple-300 mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <button
                      key={category.type}
                      onClick={() => setSelectedCategory(category.type)}
                      className={`w-full p-3 rounded-lg border transition-all duration-300 text-left flex items-center space-x-3 ${
                        selectedCategory === category.type
                          ? 'border-purple-500 bg-purple-900/50 text-purple-200'
                          : 'border-purple-500/30 bg-black/30 text-purple-400 hover:border-purple-400/50'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span className="font-serif">{category.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Items Grid */}
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-serif text-purple-300">
                  {categories.find(c => c.type === selectedCategory)?.name}
                </h3>
                <div className="text-sm text-purple-400">
                  {categoryItems.filter(item => gameState.unlockedCosmetics.includes(item.id)).length}/{categoryItems.length} Unlocked
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {categoryItems.map((item) => {
                  const isOwned = gameState.unlockedCosmetics.includes(item.id);
                  const isEquipped = gameState.equippedCosmetics[getSlotForType(item.type)] === item.id;
                  const canAfford = item.currency === 'crystals' 
                    ? gameState.essenceCrystals >= item.price
                    : gameState.totalEssence >= item.price;

                  return (
                    <div
                      key={item.id}
                      className={`relative p-4 rounded-lg border-2 transition-all duration-300 ${
                        isEquipped
                          ? 'border-yellow-500 bg-gradient-to-br from-yellow-900/30 to-amber-800/30 shadow-glow-yellow-dim'
                          : isOwned
                            ? 'border-green-500/50 bg-gradient-to-br from-green-900/20 to-emerald-800/20'
                            : 'border-purple-500/30 bg-black/30 hover:border-purple-400/50'
                      }`}
                    >
                      {/* Rarity Border */}
                      <div className={`absolute inset-0 rounded-lg bg-gradient-to-r ${getRarityColor(item.rarity)} opacity-20 pointer-events-none`} />
                      
                      <div className="relative z-10">
                        <div className="text-center mb-3">
                          <div className="text-4xl mb-2">{item.icon}</div>
                          <h4 className="text-lg font-serif text-purple-200 mb-1">{item.name}</h4>
                          <div className={`text-xs px-2 py-1 rounded bg-gradient-to-r ${getRarityColor(item.rarity)} text-white font-bold uppercase mb-2`}>
                            {item.rarity}
                          </div>
                          <p className="text-sm text-purple-400 mb-3">{item.description}</p>
                        </div>

                        {/* Preview */}
                        <div className="mb-3 p-2 bg-black/50 rounded border border-purple-500/30">
                          <div className="text-xs text-purple-400 mb-1">Preview:</div>
                          <div className="text-xs text-purple-300">{item.preview}</div>
                        </div>

                        {/* Price and Actions */}
                        <div className="space-y-2">
                          {!isOwned && (
                            <div className="text-center">
                              <div className={`text-${item.currency === 'crystals' ? 'cyan' : 'yellow'}-400 font-bold mb-2`}>
                                {item.currency === 'crystals' ? '💎' : '💰'} {item.price.toLocaleString()}
                              </div>
                              <button
                                onClick={() => onPurchase(item.id)}
                                disabled={!canAfford}
                                className={`w-full py-2 px-4 rounded-lg font-serif uppercase tracking-wide transition-all duration-300 text-sm ${
                                  canAfford
                                    ? 'bg-gradient-to-r from-purple-800 to-purple-700 text-purple-100 hover:from-purple-700 hover:to-purple-600 hover:scale-105'
                                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                }`}
                              >
                                {canAfford ? 'Purchase' : 'Insufficient Funds'}
                              </button>
                            </div>
                          )}

                          {isOwned && !isEquipped && (
                            <button
                              onClick={() => onEquip(item.id, getSlotForType(item.type))}
                              className="w-full py-2 px-4 bg-gradient-to-r from-green-800 to-emerald-700 text-green-100 rounded-lg font-serif uppercase tracking-wide hover:from-green-700 hover:to-emerald-600 transition-all duration-300 text-sm"
                            >
                              Equip
                            </button>
                          )}

                          {isEquipped && (
                            <div className="w-full py-2 px-4 bg-gradient-to-r from-yellow-800 to-amber-700 text-yellow-100 rounded-lg text-center font-serif uppercase tracking-wide text-sm">
                              ✓ Equipped
                            </div>
                          )}
                        </div>

                        {/* Owned indicator */}
                        {isOwned && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};