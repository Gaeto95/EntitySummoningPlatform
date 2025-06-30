import React, { useState } from 'react';
import { GameState } from '../types/game';
import { BATTLE_PASS_TIERS, BATTLE_PASS_PREMIUM_COST, canClaimBattlePassReward, claimBattlePassReward, purchaseBattlePassPremium } from '../utils/battlePass';
import { X, Trophy, Star, Lock, Gift, Crown } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface BattlePassModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  onClaimReward: (tier: number, isPremium: boolean) => void;
  onPurchasePremium: () => void;
}

export const BattlePassModal: React.FC<BattlePassModalProps> = ({
  isOpen,
  onClose,
  gameState,
  onClaimReward,
  onPurchasePremium,
}) => {
  const [selectedTier, setSelectedTier] = useState<number | null>(null);

  if (!isOpen) return null;

  const currentTier = BATTLE_PASS_TIERS[gameState.battlePassLevel - 1];
  const nextTier = BATTLE_PASS_TIERS[gameState.battlePassLevel];
  const progressPercent = nextTier ? (gameState.battlePassXP / nextTier.xpRequired) * 100 : 100;

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
              <Trophy className="w-8 h-8 text-yellow-400" />
              <h2 className="text-3xl font-serif text-purple-200">Battle Pass - Season {gameState.battlePassSeason}</h2>
              <Trophy className="w-8 h-8 text-yellow-400" />
            </div>
            
            <div className="flex items-center justify-center space-x-6 mb-4">
              <div className="text-purple-400">
                Level: <span className="text-yellow-400 font-bold">{gameState.battlePassLevel}</span>
              </div>
              <div className="text-purple-400">
                XP: <span className="text-cyan-400 font-bold">{gameState.battlePassXP}</span>
                {nextTier && <span className="text-purple-500">/{nextTier.xpRequired}</span>}
              </div>
            </div>

            {/* Progress Bar */}
            {nextTier && (
              <div className="max-w-md mx-auto">
                <div className="h-3 bg-black/50 rounded-full border border-purple-500/30 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-yellow-500 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="text-xs text-purple-400 mt-1">
                  {Math.round(progressPercent)}% to next level
                </div>
              </div>
            )}
          </div>

          {/* Premium Purchase */}
          {!gameState.battlePassPremium && (
            <div className="mb-6 p-4 bg-gradient-to-r from-yellow-900/30 to-amber-800/30 border border-yellow-500/50 rounded-lg">
              <div className="text-center">
                <h3 className="text-xl font-serif text-yellow-300 mb-2 flex items-center justify-center space-x-2">
                  <Crown className="w-6 h-6" />
                  <span>Unlock Premium Battle Pass</span>
                </h3>
                <p className="text-yellow-200 mb-4">
                  Get access to exclusive rewards, cosmetics, and bonus XP!
                </p>
                <button
                  onClick={onPurchasePremium}
                  disabled={gameState.essenceCrystals < BATTLE_PASS_PREMIUM_COST}
                  className={`px-6 py-3 rounded-lg font-serif uppercase tracking-wide transition-all duration-300 ${
                    gameState.essenceCrystals >= BATTLE_PASS_PREMIUM_COST
                      ? 'bg-gradient-to-r from-yellow-800 to-amber-700 text-yellow-100 hover:from-yellow-700 hover:to-amber-600 hover:scale-105'
                      : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  💎 {BATTLE_PASS_PREMIUM_COST} Crystals
                </button>
              </div>
            </div>
          )}

          {/* Battle Pass Tiers */}
          <div className="space-y-4">
            <h3 className="text-xl font-serif text-purple-300 text-center mb-4">Rewards Track</h3>
            
            <div className="grid gap-4">
              {BATTLE_PASS_TIERS.map((tier, index) => {
                const tierNumber = index + 1;
                const isUnlocked = tierNumber <= gameState.battlePassLevel;
                const canClaimFree = canClaimBattlePassReward(gameState, tierNumber, false);
                const canClaimPremium = canClaimBattlePassReward(gameState, tierNumber, true);
                const freeRewardClaimed = gameState.battlePassRewardsClaimed.includes(tierNumber);
                const premiumRewardClaimed = gameState.battlePassRewardsClaimed.includes(tierNumber * 2);

                return (
                  <div
                    key={tierNumber}
                    className={`grid grid-cols-12 gap-4 p-4 rounded-lg border-2 transition-all duration-300 ${
                      isUnlocked
                        ? 'border-yellow-500/50 bg-gradient-to-r from-yellow-900/20 to-amber-800/20'
                        : 'border-gray-500/30 bg-black/30'
                    }`}
                  >
                    {/* Tier Number */}
                    <div className="col-span-1 flex items-center justify-center">
                      <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold ${
                        isUnlocked
                          ? 'border-yellow-500 bg-yellow-900/50 text-yellow-200'
                          : 'border-gray-500 bg-gray-800 text-gray-400'
                      }`}>
                        {tierNumber}
                      </div>
                    </div>

                    {/* XP Requirement */}
                    <div className="col-span-2 flex items-center">
                      <div className="text-center">
                        <div className="text-purple-400 text-xs">XP Required</div>
                        <div className="text-purple-200 font-bold">{tier.xpRequired}</div>
                      </div>
                    </div>

                    {/* Free Reward */}
                    <div className="col-span-4 flex items-center">
                      {tier.freeReward ? (
                        <div className="flex items-center space-x-3 w-full">
                          <div className="text-2xl">{tier.freeReward.icon}</div>
                          <div className="flex-1">
                            <div className="text-purple-200 font-semibold">
                              {tier.freeReward.value} {tier.freeReward.type.replace('_', ' ')}
                            </div>
                            <div className="text-purple-400 text-xs">Free Reward</div>
                          </div>
                          {canClaimFree && !freeRewardClaimed && (
                            <button
                              onClick={() => onClaimReward(tierNumber, false)}
                              className="px-3 py-1 bg-green-800 text-green-200 rounded text-xs hover:bg-green-700 transition-colors"
                            >
                              Claim
                            </button>
                          )}
                          {freeRewardClaimed && (
                            <div className="text-green-400 text-xs">✓ Claimed</div>
                          )}
                        </div>
                      ) : (
                        <div className="text-gray-500 text-sm">No free reward</div>
                      )}
                    </div>

                    {/* Premium Reward */}
                    <div className="col-span-5 flex items-center">
                      {tier.premiumReward ? (
                        <div className="flex items-center space-x-3 w-full">
                          <div className="text-2xl">{tier.premiumReward.icon}</div>
                          <div className="flex-1">
                            <div className="text-yellow-200 font-semibold flex items-center space-x-1">
                              <Crown className="w-4 h-4" />
                              <span>{tier.premiumReward.value} {tier.premiumReward.type.replace('_', ' ')}</span>
                            </div>
                            <div className="text-yellow-400 text-xs">Premium Reward</div>
                          </div>
                          {!gameState.battlePassPremium ? (
                            <div className="text-gray-500 text-xs flex items-center space-x-1">
                              <Lock className="w-3 h-3" />
                              <span>Premium</span>
                            </div>
                          ) : canClaimPremium && !premiumRewardClaimed ? (
                            <button
                              onClick={() => onClaimReward(tierNumber, true)}
                              className="px-3 py-1 bg-yellow-800 text-yellow-200 rounded text-xs hover:bg-yellow-700 transition-colors"
                            >
                              Claim
                            </button>
                          ) : premiumRewardClaimed ? (
                            <div className="text-yellow-400 text-xs">✓ Claimed</div>
                          ) : (
                            <div className="text-gray-500 text-xs">Locked</div>
                          )}
                        </div>
                      ) : (
                        <div className="text-gray-500 text-sm">No premium reward</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* XP Sources */}
          <div className="mt-6 bg-black/30 rounded-lg p-4 border border-purple-500/30">
            <h4 className="text-lg font-serif text-purple-300 mb-3 text-center">How to Earn XP</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="text-center">
                <div className="text-purple-400">Daily Login</div>
                <div className="text-green-400">+50 XP</div>
              </div>
              <div className="text-center">
                <div className="text-purple-400">Summon Entity</div>
                <div className="text-blue-400">+10 XP</div>
              </div>
              <div className="text-center">
                <div className="text-purple-400">Collect Entity</div>
                <div className="text-yellow-400">+15 XP</div>
              </div>
              <div className="text-center">
                <div className="text-purple-400">Sacrifice Entity</div>
                <div className="text-red-400">+20 XP</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};