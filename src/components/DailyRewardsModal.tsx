import React from 'react';
import { GameState, DailyReward } from '../types/game';
import { getDailyReward, DAILY_REWARDS, getStreakBonus } from '../utils/dailyRewards';
import { X, Calendar, Gift, Flame } from 'lucide-react';

interface DailyRewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  onClaimReward: () => void;
}

export const DailyRewardsModal: React.FC<DailyRewardsModalProps> = ({
  isOpen,
  onClose,
  gameState,
  onClaimReward,
}) => {
  if (!isOpen) return null;

  const currentReward = getDailyReward(gameState.loginStreak);
  const streakBonus = getStreakBonus(gameState.loginStreak);
  const canClaim = !gameState.dailyRewardsClaimed && gameState.loginStreak > 0;

  const getRewardDisplay = (reward: DailyReward, isToday: boolean = false) => {
    const bonusAmount = Math.floor(reward.amount * streakBonus);
    const finalAmount = isToday && streakBonus > 1 ? bonusAmount : reward.amount;
    
    return (
      <div className={`relative p-3 rounded-lg border-2 transition-all duration-300 ${
        isToday 
          ? 'border-yellow-500 bg-gradient-to-br from-yellow-900/50 to-amber-800/50 shadow-glow-yellow-dim scale-105' 
          : 'border-purple-500/30 bg-black/30'
      }`}>
        <div className="text-center">
          <div className="text-2xl mb-2">{reward.icon}</div>
          <div className="text-xs text-purple-400 mb-1">Day {reward.day}</div>
          <div className="text-sm text-purple-200">
            {finalAmount} {reward.type === 'crystals' ? 'Crystals' : 
                          reward.type === 'energy' ? 'Energy' : 'Essence'}
          </div>
          {isToday && streakBonus > 1 && (
            <div className="text-xs text-yellow-400 mt-1">
              +{Math.round((streakBonus - 1) * 100)}% Bonus!
            </div>
          )}
        </div>
        {isToday && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
            <Gift className="w-3 h-3 text-yellow-900" />
          </div>
        )}
      </div>
    );
  };

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
              <Calendar className="w-8 h-8 text-purple-400" />
              <h2 className="text-3xl font-serif text-purple-200">Daily Rewards</h2>
              <Calendar className="w-8 h-8 text-purple-400" />
            </div>
            
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className="flex items-center space-x-2">
                <Flame className="w-5 h-5 text-orange-400" />
                <span className="text-orange-300 font-serif">
                  {gameState.loginStreak} Day Streak
                </span>
              </div>
              {streakBonus > 1 && (
                <div className="bg-gradient-to-r from-yellow-800 to-amber-700 px-3 py-1 rounded-full">
                  <span className="text-yellow-200 text-sm font-bold">
                    +{Math.round((streakBonus - 1) * 100)}% Bonus Active!
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Today's Reward */}
          {canClaim && (
            <div className="mb-6 p-4 bg-gradient-to-r from-yellow-900/30 to-amber-800/30 border border-yellow-500/50 rounded-lg">
              <div className="text-center mb-4">
                <h3 className="text-xl font-serif text-yellow-300 mb-2">Today's Reward</h3>
                {getRewardDisplay(currentReward, true)}
              </div>
              <button
                onClick={onClaimReward}
                className="w-full py-3 px-6 bg-gradient-to-r from-yellow-800 to-amber-700 text-yellow-100 font-serif uppercase tracking-wide rounded-lg border border-yellow-500/50 hover:from-yellow-700 hover:to-amber-600 transition-all duration-300 hover:scale-105"
              >
                🎁 Claim Reward
              </button>
            </div>
          )}

          {/* Reward Calendar */}
          <div className="mb-6">
            <h3 className="text-lg font-serif text-purple-300 mb-4 text-center">Reward Calendar</h3>
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3">
              {DAILY_REWARDS.slice(0, 15).map((reward, index) => (
                <div key={reward.day}>
                  {getRewardDisplay(reward, reward.day === (gameState.loginStreak % DAILY_REWARDS.length || DAILY_REWARDS.length))}
                </div>
              ))}
            </div>
          </div>

          {/* Streak Bonuses Info */}
          <div className="bg-black/30 rounded-lg p-4 border border-purple-500/30">
            <h4 className="text-lg font-serif text-purple-300 mb-3 text-center">Streak Bonuses</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="text-center">
                <div className="text-purple-400">3+ Days</div>
                <div className="text-green-400">+50% Rewards</div>
              </div>
              <div className="text-center">
                <div className="text-purple-400">7+ Days</div>
                <div className="text-blue-400">+100% Rewards</div>
              </div>
              <div className="text-center">
                <div className="text-purple-400">14+ Days</div>
                <div className="text-yellow-400">+150% Rewards</div>
              </div>
              <div className="text-center">
                <div className="text-purple-400">30+ Days</div>
                <div className="text-red-400">+200% Rewards</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};