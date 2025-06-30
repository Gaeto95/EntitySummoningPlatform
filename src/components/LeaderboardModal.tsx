import React, { useState, useEffect } from 'react';
import { GameState } from '../types/game';
import { X, Trophy, Crown, Star, TrendingUp, Users, Zap } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  score: number;
  change: number; // Position change from last period
  avatar?: string;
  guild?: string;
  isCurrentUser?: boolean;
}

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  user: any;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  gameState,
  user
}) => {
  const [selectedBoard, setSelectedBoard] = useState<'power' | 'summons' | 'collection' | 'guild'>('power');
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'alltime'>('weekly');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);

  // Mock leaderboard data
  useEffect(() => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockData: LeaderboardEntry[] = [
        {
          rank: 1,
          userId: 'user-1',
          username: 'ShadowMaster',
          score: 15420,
          change: 2,
          guild: 'Shadow Covenant'
        },
        {
          rank: 2,
          userId: 'user-2',
          username: 'VoidWalker',
          score: 14890,
          change: -1,
          guild: 'Void Walkers'
        },
        {
          rank: 3,
          userId: 'user-3',
          username: 'CelestialSeeker',
          score: 13750,
          change: 1,
          guild: 'Divine Order'
        },
        {
          rank: 4,
          userId: 'user-4',
          username: 'MysticSeer',
          score: 12340,
          change: 0,
          guild: 'Shadow Covenant'
        },
        {
          rank: 5,
          userId: 'user-5',
          username: 'DemonLord',
          score: 11890,
          change: 3,
          guild: 'Infernal Legion'
        }
      ];

      // Add current user if not in top 5
      const currentUserRank: LeaderboardEntry = {
        rank: 47,
        userId: user?.id || 'current-user',
        username: user?.username || 'You',
        score: gameState.totalEssence,
        change: 5,
        isCurrentUser: true
      };

      setLeaderboardData(mockData);
      setUserRank(currentUserRank);
      setIsLoading(false);
    }, 1000);
  }, [selectedBoard, selectedPeriod, gameState, user]);

  const getLeaderboardIcon = (type: string) => {
    switch (type) {
      case 'power': return <Zap className="w-5 h-5" />;
      case 'summons': return <Star className="w-5 h-5" />;
      case 'collection': return <Trophy className="w-5 h-5" />;
      case 'guild': return <Users className="w-5 h-5" />;
      default: return <Trophy className="w-5 h-5" />;
    }
  };

  const getScoreLabel = (type: string) => {
    switch (type) {
      case 'power': return 'Total Power';
      case 'summons': return 'Total Summons';
      case 'collection': return 'Entities Collected';
      case 'guild': return 'Guild Points';
      default: return 'Score';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2: return <Trophy className="w-6 h-6 text-gray-300" />;
      case 3: return <Trophy className="w-6 h-6 text-amber-600" />;
      default: return <span className="text-purple-400 font-bold">#{rank}</span>;
    }
  };

  const getChangeIndicator = (change: number) => {
    if (change > 0) {
      return (
        <div className="flex items-center space-x-1 text-green-400">
          <TrendingUp className="w-4 h-4" />
          <span className="text-xs">+{change}</span>
        </div>
      );
    } else if (change < 0) {
      return (
        <div className="flex items-center space-x-1 text-red-400">
          <TrendingUp className="w-4 h-4 rotate-180" />
          <span className="text-xs">{change}</span>
        </div>
      );
    } else {
      return <span className="text-gray-500 text-xs">-</span>;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative max-w-4xl w-full max-h-[90vh] bg-gradient-to-br from-purple-900/95 to-black/95 border-2 border-purple-500/50 rounded-xl shadow-2xl overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-purple-900/80 backdrop-blur-sm rounded-full border border-purple-500 text-purple-300 hover:text-purple-100 hover:bg-purple-800 transition-all duration-300 hover:scale-110"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="overflow-y-auto max-h-[90vh] p-6">
          <div className="text-center mb-6 pr-16">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Trophy className="w-8 h-8 text-yellow-400" />
              <h2 className="text-3xl font-serif text-purple-200">Leaderboards</h2>
              <Trophy className="w-8 h-8 text-yellow-400" />
            </div>
          </div>

          {/* Leaderboard Type Selection */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
            {[
              { id: 'power', name: 'Power', icon: 'zap' },
              { id: 'summons', name: 'Summons', icon: 'star' },
              { id: 'collection', name: 'Collection', icon: 'trophy' },
              { id: 'guild', name: 'Guilds', icon: 'users' }
            ].map((board) => (
              <button
                key={board.id}
                onClick={() => setSelectedBoard(board.id as any)}
                className={`flex items-center justify-center space-x-2 p-3 rounded-lg border transition-all duration-300 ${
                  selectedBoard === board.id
                    ? 'border-purple-500 bg-purple-900/50 text-purple-200'
                    : 'border-purple-500/30 bg-black/30 text-purple-400 hover:border-purple-400/50'
                }`}
              >
                {getLeaderboardIcon(board.id)}
                <span className="font-serif">{board.name}</span>
              </button>
            ))}
          </div>

          {/* Time Period Selection */}
          <div className="flex space-x-2 mb-6 justify-center">
            {[
              { id: 'daily', name: 'Daily' },
              { id: 'weekly', name: 'Weekly' },
              { id: 'monthly', name: 'Monthly' },
              { id: 'alltime', name: 'All Time' }
            ].map((period) => (
              <button
                key={period.id}
                onClick={() => setSelectedPeriod(period.id as any)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedPeriod === period.id
                    ? 'bg-purple-900/50 text-purple-200 border border-purple-400'
                    : 'text-purple-400 hover:text-purple-300 border border-transparent'
                }`}
              >
                {period.name}
              </button>
            ))}
          </div>

          {/* Leaderboard Content */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" text="Loading leaderboard..." />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Top 3 Podium */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {leaderboardData.slice(0, 3).map((entry, index) => (
                  <div
                    key={entry.userId}
                    className={`text-center p-4 rounded-lg border-2 ${
                      index === 0 ? 'border-yellow-500 bg-yellow-900/20' :
                      index === 1 ? 'border-gray-400 bg-gray-900/20' :
                      'border-amber-600 bg-amber-900/20'
                    } ${index === 0 ? 'order-2' : index === 1 ? 'order-1' : 'order-3'}`}
                  >
                    <div className="flex justify-center mb-2">
                      {getRankIcon(entry.rank)}
                    </div>
                    <div className="text-purple-200 font-serif font-bold">{entry.username}</div>
                    {entry.guild && (
                      <div className="text-purple-400 text-xs">{entry.guild}</div>
                    )}
                    <div className="text-purple-300 text-lg font-bold mt-2">
                      {entry.score.toLocaleString()}
                    </div>
                    <div className="text-purple-400 text-xs">{getScoreLabel(selectedBoard)}</div>
                    <div className="mt-2">{getChangeIndicator(entry.change)}</div>
                  </div>
                ))}
              </div>

              {/* Rest of Leaderboard */}
              <div className="space-y-2">
                {leaderboardData.slice(3).map((entry) => (
                  <div
                    key={entry.userId}
                    className="flex items-center justify-between p-4 bg-black/30 border border-purple-500/30 rounded-lg hover:border-purple-400/50 transition-all duration-300"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-8 text-center">
                        {getRankIcon(entry.rank)}
                      </div>
                      <div>
                        <div className="text-purple-200 font-serif">{entry.username}</div>
                        {entry.guild && (
                          <div className="text-purple-400 text-xs">{entry.guild}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-purple-200 font-bold">
                          {entry.score.toLocaleString()}
                        </div>
                        <div className="text-purple-400 text-xs">{getScoreLabel(selectedBoard)}</div>
                      </div>
                      {getChangeIndicator(entry.change)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Current User Rank (if not in top list) */}
              {userRank && userRank.rank > 5 && (
                <div className="mt-6 pt-4 border-t border-purple-500/30">
                  <div className="text-center text-purple-400 text-sm mb-2">Your Ranking</div>
                  <div className="flex items-center justify-between p-4 bg-purple-900/30 border border-purple-500/50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 text-center">
                        <span className="text-purple-300 font-bold">#{userRank.rank}</span>
                      </div>
                      <div>
                        <div className="text-purple-200 font-serif">{userRank.username}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-purple-200 font-bold">
                          {userRank.score.toLocaleString()}
                        </div>
                        <div className="text-purple-400 text-xs">{getScoreLabel(selectedBoard)}</div>
                      </div>
                      {getChangeIndicator(userRank.change)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};