import React, { useState, useEffect } from 'react';
import { GameState, Entity } from '../types/game';
import { X, ArrowRightLeft, Search, Filter, Star, Crown, Skull, Eye } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

interface TradeOffer {
  id: string;
  traderId: string;
  traderName: string;
  offeredEntities: Entity[];
  requestedEntities: Entity[];
  offeredEssence: number;
  requestedEssence: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  expiresAt: number;
  createdAt: number;
}

interface TradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  entities: Entity[];
  user: any;
}

export const TradingModal: React.FC<TradingModalProps> = ({
  isOpen,
  onClose,
  gameState,
  entities,
  user
}) => {
  const [activeTab, setActiveTab] = useState<'browse' | 'create' | 'history'>('browse');
  const [tradeOffers, setTradeOffers] = useState<TradeOffer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  
  // Create trade state
  const [selectedOfferedEntities, setSelectedOfferedEntities] = useState<Entity[]>([]);
  const [offeredEssence, setOfferedEssence] = useState(0);
  const [requestedEssence, setRequestedEssence] = useState(0);
  const [tradeDescription, setTradeDescription] = useState('');

  // Mock trade offers
  useEffect(() => {
    const mockOffers: TradeOffer[] = [
      {
        id: 'trade-1',
        traderId: 'user-123',
        traderName: 'ShadowMaster',
        offeredEntities: [
          {
            id: 'entity-1',
            name: 'Infernal Wraith',
            type: 'demon',
            rarity: 'rare',
            power: 75,
            sigil: '👹',
            isShiny: false
          } as Entity
        ],
        requestedEntities: [],
        offeredEssence: 0,
        requestedEssence: 500,
        status: 'pending',
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        createdAt: Date.now() - 2 * 60 * 60 * 1000
      },
      {
        id: 'trade-2',
        traderId: 'user-456',
        traderName: 'CelestialSeeker',
        offeredEntities: [
          {
            id: 'entity-2',
            name: '✨ Divine Guardian',
            type: 'divine',
            rarity: 'legendary',
            power: 85,
            sigil: '👑',
            isShiny: true
          } as Entity
        ],
        requestedEntities: [],
        offeredEssence: 200,
        requestedEssence: 0,
        status: 'pending',
        expiresAt: Date.now() + 18 * 60 * 60 * 1000,
        createdAt: Date.now() - 5 * 60 * 60 * 1000
      }
    ];

    setTradeOffers(mockOffers);
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'demon': return <Skull className="w-4 h-4" />;
      case 'divine': return <Crown className="w-4 h-4" />;
      case 'ancient': return <Eye className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'mythic': return 'text-purple-400 border-purple-500';
      case 'legendary': return 'text-yellow-400 border-yellow-500';
      case 'rare': return 'text-blue-400 border-blue-500';
      default: return 'text-gray-400 border-gray-500';
    }
  };

  const filteredOffers = tradeOffers.filter(offer => {
    const matchesSearch = offer.traderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offer.offeredEntities.some(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRarity = filterRarity === 'all' || 
                         offer.offeredEntities.some(e => e.rarity === filterRarity);
    
    const matchesType = filterType === 'all' || 
                       offer.offeredEntities.some(e => e.type === filterType);

    return matchesSearch && matchesRarity && matchesType;
  });

  const handleAcceptTrade = async (tradeId: string) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setTradeOffers(prev => prev.map(offer => 
      offer.id === tradeId ? { ...offer, status: 'accepted' } : offer
    ));
    
    setIsLoading(false);
  };

  const handleCreateTrade = async () => {
    if (selectedOfferedEntities.length === 0 && offeredEssence === 0) {
      alert('You must offer at least one entity or some essence');
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Reset form
    setSelectedOfferedEntities([]);
    setOfferedEssence(0);
    setRequestedEssence(0);
    setTradeDescription('');
    setActiveTab('browse');
    
    setIsLoading(false);
  };

  const formatTimeRemaining = (timestamp: number) => {
    const remaining = timestamp - Date.now();
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
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
              <ArrowRightLeft className="w-8 h-8 text-purple-400" />
              <h2 className="text-3xl font-serif text-purple-200">Entity Trading</h2>
              <ArrowRightLeft className="w-8 h-8 text-purple-400" />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-2 border-b border-purple-500/30 mb-6">
            {[
              { id: 'browse', name: 'Browse Trades' },
              { id: 'create', name: 'Create Trade' },
              { id: 'history', name: 'Trade History' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-t-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-900/50 text-purple-200 border-b-2 border-purple-400'
                    : 'text-purple-400 hover:text-purple-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'browse' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                  <input
                    type="text"
                    placeholder="Search trades..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-purple-200 placeholder-purple-500 focus:border-purple-400 focus:outline-none"
                  />
                </div>

                <select
                  value={filterRarity}
                  onChange={(e) => setFilterRarity(e.target.value)}
                  className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-purple-200"
                >
                  <option value="all">All Rarities</option>
                  <option value="common">Common</option>
                  <option value="rare">Rare</option>
                  <option value="legendary">Legendary</option>
                  <option value="mythic">Mythic</option>
                </select>

                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 bg-black/50 border border-purple-500/30 rounded-lg text-purple-200"
                >
                  <option value="all">All Types</option>
                  <option value="demon">Demon</option>
                  <option value="divine">Divine</option>
                  <option value="ancient">Ancient</option>
                </select>
              </div>

              {/* Trade Offers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredOffers.map((offer) => (
                  <div
                    key={offer.id}
                    className="bg-black/30 border border-purple-500/30 rounded-lg p-4 hover:border-purple-400/50 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-purple-300 font-serif">{offer.traderName}</span>
                        <span className="text-purple-500 text-sm">
                          {formatTimeRemaining(offer.expiresAt)} left
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        offer.status === 'pending' ? 'bg-yellow-900/50 text-yellow-300' :
                        offer.status === 'accepted' ? 'bg-green-900/50 text-green-300' :
                        'bg-red-900/50 text-red-300'
                      }`}>
                        {offer.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {/* Offered Entities */}
                      <div>
                        <div className="text-sm text-purple-400 mb-2">Offering:</div>
                        <div className="space-y-2">
                          {offer.offeredEntities.map((entity) => (
                            <div
                              key={entity.id}
                              className={`flex items-center space-x-3 p-2 rounded border ${getRarityColor(entity.rarity)}`}
                            >
                              <div className="text-2xl">{entity.sigil}</div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <span className="text-purple-200 font-serif">{entity.name}</span>
                                  {entity.isShiny && <span className="text-yellow-400">✨</span>}
                                </div>
                                <div className="flex items-center space-x-2 text-xs">
                                  {getTypeIcon(entity.type)}
                                  <span className="text-purple-400">{entity.type}</span>
                                  <span className="text-purple-400">•</span>
                                  <span className={getRarityColor(entity.rarity).split(' ')[0]}>{entity.rarity}</span>
                                  <span className="text-purple-400">•</span>
                                  <span className="text-purple-400">Power: {entity.power}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                          {offer.offeredEssence > 0 && (
                            <div className="flex items-center space-x-2 text-sm">
                              <span className="text-yellow-400">💰</span>
                              <span className="text-purple-200">{offer.offeredEssence} Essence</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Requested */}
                      <div>
                        <div className="text-sm text-purple-400 mb-2">Requesting:</div>
                        {offer.requestedEssence > 0 ? (
                          <div className="flex items-center space-x-2 text-sm">
                            <span className="text-yellow-400">💰</span>
                            <span className="text-purple-200">{offer.requestedEssence} Essence</span>
                          </div>
                        ) : (
                          <div className="text-purple-500 text-sm">Open to offers</div>
                        )}
                      </div>

                      {/* Actions */}
                      {offer.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleAcceptTrade(offer.id)}
                            disabled={isLoading}
                            className="flex-1 py-2 px-4 bg-gradient-to-r from-green-800 to-emerald-700 text-green-100 rounded-lg hover:from-green-700 hover:to-emerald-600 transition-all duration-300 text-sm disabled:opacity-50"
                          >
                            {isLoading ? <LoadingSpinner size="sm" /> : 'Accept Trade'}
                          </button>
                          <button className="flex-1 py-2 px-4 bg-gradient-to-r from-red-800 to-red-700 text-red-100 rounded-lg hover:from-red-700 hover:to-red-600 transition-all duration-300 text-sm">
                            Counter Offer
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {filteredOffers.length === 0 && (
                <div className="text-center py-12 text-purple-500">
                  <div className="text-4xl mb-4">🔄</div>
                  <div className="font-serif text-lg">No trades found</div>
                  <div className="text-sm mt-2">Try adjusting your search filters</div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'create' && (
            <div className="space-y-6">
              <div className="text-center text-purple-400">
                Trade creation interface coming soon...
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              <div className="text-center text-purple-400">
                Trade history coming soon...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};