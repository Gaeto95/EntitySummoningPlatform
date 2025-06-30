import React, { useState, useEffect } from 'react';
import { GameState } from '../types/game';
import { X, Users, Crown, Shield, Star, Search, Plus, Settings } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

interface Guild {
  id: string;
  name: string;
  description: string;
  icon: string;
  memberCount: number;
  maxMembers: number;
  level: number;
  isPublic: boolean;
  requirements: {
    minLevel?: number;
    minPower?: number;
  };
  stats: {
    totalSummons: number;
    totalSacrifices: number;
    weeklyActivity: number;
  };
  role?: 'owner' | 'admin' | 'member';
}

interface GuildModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  user: any;
}

export const GuildModal: React.FC<GuildModalProps> = ({
  isOpen,
  onClose,
  gameState,
  user
}) => {
  const [currentGuild, setCurrentGuild] = useState<Guild | null>(null);
  const [availableGuilds, setAvailableGuilds] = useState<Guild[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'activities' | 'settings'>('overview');

  // Mock data
  useEffect(() => {
    const mockGuilds: Guild[] = [
      {
        id: 'shadow-covenant',
        name: 'Shadow Covenant',
        description: 'Masters of dark summoning arts seeking legendary entities',
        icon: '🌙',
        memberCount: 25,
        maxMembers: 50,
        level: 8,
        isPublic: true,
        requirements: { minLevel: 5, minPower: 500 },
        stats: { totalSummons: 1247, totalSacrifices: 892, weeklyActivity: 95 }
      },
      {
        id: 'divine-order',
        name: 'Divine Order',
        description: 'Seekers of celestial entities and divine wisdom',
        icon: '✨',
        memberCount: 18,
        maxMembers: 30,
        level: 6,
        isPublic: true,
        requirements: { minLevel: 3, minPower: 300 },
        stats: { totalSummons: 892, totalSacrifices: 445, weeklyActivity: 87 }
      },
      {
        id: 'void-walkers',
        name: 'Void Walkers',
        description: 'Elite summoners exploring ancient mysteries',
        icon: '👁️',
        memberCount: 12,
        maxMembers: 15,
        level: 12,
        isPublic: false,
        requirements: { minLevel: 10, minPower: 1000 },
        stats: { totalSummons: 2156, totalSacrifices: 1678, weeklyActivity: 98 }
      }
    ];

    setAvailableGuilds(mockGuilds);
    
    // Mock current guild membership
    if (gameState.totalSummons >= 5) {
      setCurrentGuild({
        ...mockGuilds[0],
        role: 'member'
      });
    }
  }, [gameState]);

  const filteredGuilds = availableGuilds.filter(guild =>
    guild.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guild.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canJoinGuild = (guild: Guild) => {
    if (currentGuild) return false;
    if (guild.memberCount >= guild.maxMembers) return false;
    if (guild.requirements.minLevel && gameState.totalSummons < guild.requirements.minLevel) return false;
    if (guild.requirements.minPower && gameState.totalEssence < guild.requirements.minPower) return false;
    return true;
  };

  const handleJoinGuild = async (guild: Guild) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setCurrentGuild({ ...guild, role: 'member' });
    setIsLoading(false);
  };

  const handleLeaveGuild = async () => {
    if (!confirm('Are you sure you want to leave your guild?')) return;
    
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setCurrentGuild(null);
    setIsLoading(false);
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
              <Users className="w-8 h-8 text-purple-400" />
              <h2 className="text-3xl font-serif text-purple-200">Guild System</h2>
              <Users className="w-8 h-8 text-purple-400" />
            </div>
          </div>

          {currentGuild ? (
            // Guild Management Interface
            <div className="space-y-6">
              {/* Guild Header */}
              <div className="bg-gradient-to-r from-purple-900/50 to-indigo-800/50 rounded-lg p-6 border border-purple-500/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl">{currentGuild.icon}</div>
                    <div>
                      <h3 className="text-2xl font-serif text-purple-200">{currentGuild.name}</h3>
                      <p className="text-purple-400">{currentGuild.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm">
                        <span className="text-purple-300">Level {currentGuild.level}</span>
                        <span className="text-purple-300">{currentGuild.memberCount}/{currentGuild.maxMembers} Members</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          currentGuild.role === 'owner' ? 'bg-yellow-900/50 text-yellow-300' :
                          currentGuild.role === 'admin' ? 'bg-blue-900/50 text-blue-300' :
                          'bg-green-900/50 text-green-300'
                        }`}>
                          {currentGuild.role?.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleLeaveGuild}
                    disabled={isLoading}
                    className="px-4 py-2 bg-red-800 text-red-200 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    Leave Guild
                  </button>
                </div>
              </div>

              {/* Guild Tabs */}
              <div className="flex space-x-2 border-b border-purple-500/30">
                {[
                  { id: 'overview', name: 'Overview', icon: Users },
                  { id: 'members', name: 'Members', icon: Users },
                  { id: 'activities', name: 'Activities', icon: Star },
                  { id: 'settings', name: 'Settings', icon: Settings }
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

              {/* Tab Content */}
              <div className="min-h-[400px]">
                {activeTab === 'overview' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-black/30 rounded-lg p-4 border border-purple-500/30">
                      <h4 className="text-lg font-serif text-purple-300 mb-3">Guild Stats</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-purple-400">Total Summons:</span>
                          <span className="text-purple-200">{currentGuild.stats.totalSummons.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-400">Total Sacrifices:</span>
                          <span className="text-purple-200">{currentGuild.stats.totalSacrifices.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-400">Weekly Activity:</span>
                          <span className="text-green-400">{currentGuild.stats.weeklyActivity}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-black/30 rounded-lg p-4 border border-purple-500/30">
                      <h4 className="text-lg font-serif text-purple-300 mb-3">Recent Activities</h4>
                      <div className="space-y-2 text-sm">
                        <div className="text-purple-300">ShadowMaster summoned a Legendary Demon</div>
                        <div className="text-purple-300">VoidWalker completed weekly quest</div>
                        <div className="text-purple-300">MysticSeer joined the guild</div>
                      </div>
                    </div>

                    <div className="bg-black/30 rounded-lg p-4 border border-purple-500/30">
                      <h4 className="text-lg font-serif text-purple-300 mb-3">Guild Bonuses</h4>
                      <div className="space-y-2 text-sm">
                        <div className="text-green-400">+5% Essence from summons</div>
                        <div className="text-green-400">+10% XP from quests</div>
                        <div className="text-green-400">Access to guild shop</div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'members' && (
                  <div className="space-y-4">
                    <div className="text-center text-purple-400">
                      Guild member management coming soon...
                    </div>
                  </div>
                )}

                {activeTab === 'activities' && (
                  <div className="space-y-4">
                    <div className="text-center text-purple-400">
                      Guild activities and events coming soon...
                    </div>
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="space-y-4">
                    <div className="text-center text-purple-400">
                      Guild settings coming soon...
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Guild Discovery Interface
            <div className="space-y-6">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                <input
                  type="text"
                  placeholder="Search guilds..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-purple-200 placeholder-purple-500 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20"
                />
              </div>

              {/* Guild List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredGuilds.map((guild) => (
                  <div
                    key={guild.id}
                    className="bg-black/30 border border-purple-500/30 rounded-lg p-4 hover:border-purple-400/50 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl">{guild.icon}</div>
                        <div>
                          <h3 className="text-lg font-serif text-purple-200">{guild.name}</h3>
                          <div className="flex items-center space-x-2 text-sm">
                            <span className="text-purple-400">Level {guild.level}</span>
                            <span className="text-purple-400">•</span>
                            <span className="text-purple-400">{guild.memberCount}/{guild.maxMembers}</span>
                            {!guild.isPublic && (
                              <>
                                <span className="text-purple-400">•</span>
                                <span className="text-yellow-400">Private</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-purple-300 text-sm mb-4">{guild.description}</p>

                    {guild.requirements && (
                      <div className="mb-4 text-xs">
                        <div className="text-purple-400 mb-1">Requirements:</div>
                        <div className="space-y-1">
                          {guild.requirements.minLevel && (
                            <div className={`${gameState.totalSummons >= guild.requirements.minLevel ? 'text-green-400' : 'text-red-400'}`}>
                              Min Level: {guild.requirements.minLevel} (You: {gameState.totalSummons})
                            </div>
                          )}
                          {guild.requirements.minPower && (
                            <div className={`${gameState.totalEssence >= guild.requirements.minPower ? 'text-green-400' : 'text-red-400'}`}>
                              Min Power: {guild.requirements.minPower} (You: {gameState.totalEssence})
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => handleJoinGuild(guild)}
                      disabled={!canJoinGuild(guild) || isLoading}
                      className={`w-full py-2 px-4 rounded-lg font-serif uppercase tracking-wide transition-all duration-300 text-sm ${
                        canJoinGuild(guild)
                          ? 'bg-gradient-to-r from-purple-800 to-purple-700 text-purple-100 hover:from-purple-700 hover:to-purple-600 hover:scale-105'
                          : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {isLoading ? (
                        <LoadingSpinner size="sm" />
                      ) : guild.memberCount >= guild.maxMembers ? (
                        'Full'
                      ) : !canJoinGuild(guild) ? (
                        'Requirements Not Met'
                      ) : (
                        'Join Guild'
                      )}
                    </button>
                  </div>
                ))}
              </div>

              {/* Create Guild Option */}
              <div className="text-center">
                <button className="flex items-center space-x-2 mx-auto px-6 py-3 bg-gradient-to-r from-green-800 to-emerald-700 text-green-100 rounded-lg hover:from-green-700 hover:to-emerald-600 transition-all duration-300 hover:scale-105">
                  <Plus className="w-5 h-5" />
                  <span className="font-serif">Create New Guild</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};