import React, { useState } from 'react';
import { Book, ChevronRight, ChevronLeft, Skull, Crown, Eye, Flame, X, Star } from 'lucide-react';
import { Entity, GameState } from '../types/game';
import { EntityEvolution } from './EntityEvolution';

interface GrimoireProps {
  entities: Entity[];
  isOpen: boolean;
  onToggle: () => void;
  onSacrificeFromGrimoire: (entity: Entity, index: number) => void;
  onEntityEvolve: (entity: Entity) => void;
  gameState: GameState;
}

export const Grimoire: React.FC<GrimoireProps> = ({ 
  entities, 
  isOpen, 
  onToggle, 
  onSacrificeFromGrimoire,
  onEntityEvolve,
  gameState 
}) => {
  const [selectedEntity, setSelectedEntity] = useState<{ entity: Entity; index: number } | null>(null);
  const [showSacrificeConfirm, setShowSacrificeConfirm] = useState<number | null>(null);
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('collected');

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'demon': return <Skull className="w-5 h-5" />;
      case 'divine': return <Crown className="w-5 h-5" />;
      case 'ancient': return <Eye className="w-5 h-5" />;
      default: return <Flame className="w-5 h-5" />;
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'demon': return 'red';
      case 'divine': return 'yellow';
      case 'ancient': return 'green';
      default: return 'purple';
    }
  };

  const handleSacrifice = (entity: Entity, index: number) => {
    onSacrificeFromGrimoire(entity, index);
    setShowSacrificeConfirm(null);
    setSelectedEntity(null);
  };

  const handleEntityClick = (entity: Entity, index: number) => {
    if (selectedEntity?.index === index) {
      setSelectedEntity(null);
    } else {
      setSelectedEntity({ entity, index });
    }
  };

  // Filter and sort entities
  const filteredEntities = entities
    .filter(entity => filterRarity === 'all' || entity.rarity === filterRarity)
    .sort((a, b) => {
      switch (sortBy) {
        case 'power':
          return b.power - a.power;
        case 'level':
          return b.level - a.level;
        case 'rarity':
          const rarityOrder = { mythic: 4, legendary: 3, rare: 2, common: 1 };
          return rarityOrder[b.rarity] - rarityOrder[a.rarity];
        default:
          return b.collectedAt - a.collectedAt;
      }
    });

  // Collection statistics
  const stats = {
    total: entities.length,
    common: entities.filter(e => e.rarity === 'common').length,
    rare: entities.filter(e => e.rarity === 'rare').length,
    legendary: entities.filter(e => e.rarity === 'legendary').length,
    mythic: entities.filter(e => e.rarity === 'mythic').length,
    shiny: entities.filter(e => e.isShiny).length,
    maxLevel: Math.max(...entities.map(e => e.level), 0)
  };

  return (
    <>
      {/* Grimoire panel */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-lg bg-gradient-to-b from-purple-900/95 to-black/95 backdrop-blur-sm border-l-2 border-purple-500/30 transform transition-transform duration-500 z-30 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-6 h-full overflow-y-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-serif text-purple-200">
                📜 Grimoire of Entities
              </h2>
              <button
                onClick={onToggle}
                className="p-1 text-purple-400 hover:text-purple-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Collection Stats */}
            <div className="grid grid-cols-2 gap-2 text-xs mb-4">
              <div className="bg-black/30 rounded p-2 text-center">
                <div className="text-purple-400">Total</div>
                <div className="text-purple-200 font-bold">{stats.total}</div>
              </div>
              <div className="bg-black/30 rounded p-2 text-center">
                <div className="text-purple-400">Max Level</div>
                <div className="text-purple-200 font-bold">{stats.maxLevel}</div>
              </div>
              <div className="bg-black/30 rounded p-2 text-center">
                <div className="text-yellow-400">Legendary</div>
                <div className="text-yellow-200 font-bold">{stats.legendary}</div>
              </div>
              <div className="bg-black/30 rounded p-2 text-center">
                <div className="text-pink-400">Mythic</div>
                <div className="text-pink-200 font-bold">{stats.mythic}</div>
              </div>
            </div>

            {/* Filters */}
            <div className="space-y-2">
              <select
                value={filterRarity}
                onChange={(e) => setFilterRarity(e.target.value)}
                className="w-full bg-black/50 border border-purple-500/30 rounded px-3 py-2 text-purple-200 text-sm"
              >
                <option value="all">All Rarities</option>
                <option value="common">Common</option>
                <option value="rare">Rare</option>
                <option value="legendary">Legendary</option>
                <option value="mythic">Mythic</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-black/50 border border-purple-500/30 rounded px-3 py-2 text-purple-200 text-sm"
              >
                <option value="collected">Recently Collected</option>
                <option value="power">Power Level</option>
                <option value="level">Entity Level</option>
                <option value="rarity">Rarity</option>
              </select>
            </div>
          </div>

          {/* Detailed Entity View */}
          {selectedEntity && (
            <div className="mb-6 p-4 bg-black/40 border-2 border-purple-500/50 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`text-${getTypeColor(selectedEntity.entity.type)}-400`}>
                    {getTypeIcon(selectedEntity.entity.type)}
                  </div>
                  <div>
                    <h3 className="text-lg font-serif text-purple-200 flex items-center space-x-2">
                      <span>{selectedEntity.entity.name}</span>
                      {selectedEntity.entity.isShiny && <span className="text-yellow-400">✨</span>}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <div className={`text-xs px-2 py-1 rounded bg-gradient-to-r ${getRarityColor(selectedEntity.entity.rarity)} text-white font-bold uppercase`}>
                        {selectedEntity.entity.rarity}
                      </div>
                      <div className="text-xs text-purple-400 uppercase">{selectedEntity.entity.type}</div>
                    </div>
                  </div>
                </div>
                <div className="text-3xl">{selectedEntity.entity.sigil}</div>
              </div>

              {/* Entity Evolution */}
              <EntityEvolution
                entity={selectedEntity.entity}
                onEvolve={onEntityEvolve}
              />

              {/* Entity Details */}
              <div className="space-y-3 text-sm mt-4">
                <div>
                  <span className="text-purple-400 font-semibold">Abilities:</span>
                  <div className="text-purple-200 mt-1 flex flex-wrap gap-1">
                    {selectedEntity.entity.abilities.map((ability, i) => (
                      <span key={i} className="bg-purple-900/50 px-2 py-1 rounded text-xs">
                        {ability}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-purple-400 font-semibold">Personality:</span>
                  <div className="text-purple-200 mt-1">{selectedEntity.entity.personality}</div>
                </div>
                <div>
                  <span className="text-purple-400 font-semibold">Domain:</span>
                  <div className="text-purple-200 mt-1">{selectedEntity.entity.domain}</div>
                </div>
                <div>
                  <span className="text-purple-400 font-semibold">Aura:</span>
                  <div className="text-purple-200 mt-1">{selectedEntity.entity.aura}</div>
                </div>
                <div>
                  <span className="text-purple-400 font-semibold">Power Level:</span>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex-1 h-2 bg-black/50 rounded-full">
                      <div
                        className={`h-full rounded-full bg-${getTypeColor(selectedEntity.entity.type)}-500`}
                        style={{ width: `${selectedEntity.entity.power}%` }}
                      />
                    </div>
                    <span className="text-purple-200 text-xs">{selectedEntity.entity.power}</span>
                  </div>
                </div>
                <div>
                  <span className="text-purple-400 font-semibold">Manifestation:</span>
                  <div className="text-purple-200 mt-1 text-xs italic leading-relaxed max-h-24 overflow-y-auto">
                    "{selectedEntity.entity.manifestationText}"
                  </div>
                </div>
              </div>

              {/* Sacrifice Button */}
              <div className="mt-4 pt-4 border-t border-purple-500/30">
                {showSacrificeConfirm === selectedEntity.index ? (
                  <div className="space-y-2">
                    <div className="text-red-400 text-sm text-center">
                      Sacrifice {selectedEntity.entity.name}?
                    </div>
                    <div className="text-xs text-purple-400 text-center">
                      Gain {Math.floor(selectedEntity.entity.power * 0.75)} essence + power boost
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSacrifice(selectedEntity.entity, selectedEntity.index)}
                        className="flex-1 py-2 px-3 bg-gradient-to-r from-red-800 to-orange-700 text-red-100 text-sm font-serif rounded border border-red-500/50 hover:from-red-700 hover:to-orange-600 transition-all duration-300"
                      >
                        🔥 Confirm
                      </button>
                      <button
                        onClick={() => setShowSacrificeConfirm(null)}
                        className="flex-1 py-2 px-3 bg-gradient-to-r from-gray-800 to-gray-700 text-gray-300 text-sm font-serif rounded border border-gray-500/50 hover:from-gray-700 hover:to-gray-600 transition-all duration-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowSacrificeConfirm(selectedEntity.index)}
                    className="w-full py-2 px-4 bg-gradient-to-r from-red-900 to-orange-800 text-red-200 text-sm font-serif uppercase tracking-wide rounded border border-red-500/50 hover:from-red-800 hover:to-orange-700 transition-all duration-300 hover:scale-105"
                  >
                    🔥 Sacrifice for Power
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Entity list */}
          <div className="space-y-3">
            {filteredEntities.length === 0 ? (
              <div className="text-center py-12 text-purple-500">
                <div className="text-4xl mb-4">⚡</div>
                <div className="font-serif">
                  {entities.length === 0 ? 'No entities bound yet' : 'No entities match your filters'}
                </div>
                <div className="text-sm mt-2">
                  {entities.length === 0 ? 'Begin your first ritual...' : 'Try adjusting your filters'}
                </div>
              </div>
            ) : (
              filteredEntities.map((entity, index) => (
                <div
                  key={entity.id}
                  className={`group relative p-3 bg-black/30 border rounded-lg cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
                    selectedEntity?.entity.id === entity.id
                      ? `border-${getTypeColor(entity.type)}-500/70 shadow-glow-${getTypeColor(entity.type)}-dim bg-${getTypeColor(entity.type)}-900/20`
                      : `border-${getTypeColor(entity.type)}-500/30 hover:border-${getTypeColor(entity.type)}-500/50 hover:shadow-glow-${getTypeColor(entity.type)}-dim`
                  }`}
                  onClick={() => handleEntityClick(entity, index)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="text-2xl">{entity.sigil}</div>
                        {entity.isShiny && (
                          <div className="absolute -top-1 -right-1 text-xs">✨</div>
                        )}
                      </div>
                      <div>
                        <div className="font-serif text-purple-200 text-sm flex items-center space-x-2">
                          <span>{entity.name}</span>
                          {entity.level > 1 && (
                            <div className="flex items-center space-x-1">
                              <Star className="w-3 h-3 text-yellow-400" />
                              <span className="text-xs text-yellow-400">{entity.level}</span>
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-purple-400 uppercase flex items-center space-x-1">
                          {getTypeIcon(entity.type)}
                          <span>{entity.type}</span>
                          <div className={`ml-2 px-1 rounded text-xs bg-gradient-to-r ${getRarityColor(entity.rarity)} text-white`}>
                            {entity.rarity.charAt(0).toUpperCase()}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-xs text-purple-400">{entity.power}</div>
                      <div className={`w-2 h-2 rounded-full bg-${getTypeColor(entity.type)}-500`} />
                      {selectedEntity?.entity.id === entity.id ? (
                        <ChevronLeft className="w-4 h-4 text-purple-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-purple-400" />
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20"
          onClick={onToggle}
        />
      )}
    </>
  );
};