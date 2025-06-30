import React from 'react';
import { GameState } from '../types/game';
import { canClaimDailyReward } from '../utils/dailyRewards';
import { getActiveQuests } from '../utils/questSystem';
import { Tooltip } from './Tooltip';
import { Calendar, Crown, ShoppingBag, Book, Zap, Flame, Trophy, Archive, Target, Users, ArrowRightLeft, MessageCircle, Swords } from 'lucide-react';

interface TopNavigationProps {
  gameState: GameState;
  activeEffects: any;
  onDailyRewardsOpen: () => void;
  onVIPModalOpen: () => void;
  onPremiumShopOpen: () => void;
  onGrimoireToggle: () => void;
  onEssenceShopOpen: () => void;
  onBattlePassOpen: () => void;
  onGachaOpen: () => void;
  onCosmeticShopOpen: () => void;
  onStorageExpansionOpen: () => void;
  onQuestPanelOpen: () => void;
  onGuildOpen: () => void;
  onTradingOpen: () => void;
  onLeaderboardOpen: () => void;
  onChatOpen: () => void;
  onPvPArenaOpen: () => void;
  collectedEntitiesCount: number;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  gameState,
  activeEffects,
  onDailyRewardsOpen,
  onVIPModalOpen,
  onPremiumShopOpen,
  onGrimoireToggle,
  onEssenceShopOpen,
  onBattlePassOpen,
  onGachaOpen,
  onCosmeticShopOpen,
  onStorageExpansionOpen,
  onQuestPanelOpen,
  onGuildOpen,
  onTradingOpen,
  onLeaderboardOpen,
  onChatOpen,
  onPvPArenaOpen,
  collectedEntitiesCount,
}) => {
  const canClaimDaily = canClaimDailyReward(gameState);
  const storagePercent = (collectedEntitiesCount / gameState.maxGrimoireSlots) * 100;
  const activeQuests = getActiveQuests(gameState);
  const completableQuests = activeQuests.filter(quest => {
    const progress = gameState.questProgress[quest.id] || quest.objectives;
    return progress.every(obj => obj.isCompleted);
  });

  return (
    <div className="relative z-10 p-4">
      {/* Top Stats Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4">
        {/* Currency Display */}
        <div className="flex flex-wrap items-center gap-3">
          <Tooltip content="Essence - Primary currency earned from summoning and sacrificing entities">
            <div className="bg-black/20 backdrop-blur-sm border border-yellow-500/30 rounded-lg px-3 py-2 flex items-center">
              <span className="text-yellow-400 font-serif text-sm">💰 {gameState.totalEssence.toLocaleString()}</span>
              <button 
                className="ml-2 text-yellow-500 hover:text-yellow-300 transition-colors text-xs"
                onClick={() => {
                  const updatedState = {...gameState, totalEssence: gameState.totalEssence + 500};
                  // This is just for demo purposes
                }}
              >
                +
              </button>
            </div>
          </Tooltip>
          
          <Tooltip content="Essence Crystals - Premium currency for special items and VIP benefits">
            <div className="bg-black/20 backdrop-blur-sm border border-cyan-500/30 rounded-lg px-3 py-2 flex items-center">
              <span className="text-cyan-400 font-serif text-sm">💎 {gameState.essenceCrystals.toLocaleString()}</span>
              <button 
                className="ml-2 text-cyan-500 hover:text-cyan-300 transition-colors text-xs"
                onClick={() => {
                  const updatedState = {...gameState, essenceCrystals: gameState.essenceCrystals + 100};
                  // This is just for demo purposes
                }}
              >
                +
              </button>
            </div>
          </Tooltip>

          {/* Battle Pass Level */}
          <Tooltip content={`Battle Pass Level ${gameState.battlePassLevel} - Season ${gameState.battlePassSeason}`}>
            <div className="bg-black/20 backdrop-blur-sm border border-purple-500/30 rounded-lg px-3 py-2">
              <span className="text-purple-400 font-serif text-sm flex items-center space-x-1">
                <Trophy className="w-4 h-4" />
                <span>Lv.{gameState.battlePassLevel}</span>
              </span>
            </div>
          </Tooltip>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* PvP Arena */}
          <Tooltip content="PvP Arena - Battle other summoners">
            <button
              onClick={onPvPArenaOpen}
              className="flex items-center space-x-1 px-2 py-1.5 bg-gradient-to-br from-red-900 to-orange-800 border border-red-500/50 rounded-lg text-red-300 hover:text-red-100 hover:bg-red-800 transition-all duration-300 text-xs"
            >
              <Swords className="w-3 h-3" />
              <span className="hidden sm:inline font-serif">Battle</span>
            </button>
          </Tooltip>

          {/* Quests */}
          <Tooltip content={`Quest Journal - ${activeQuests.length} active quests${completableQuests.length > 0 ? `, ${completableQuests.length} ready to claim!` : ''}`}>
            <button
              onClick={onQuestPanelOpen}
              className={`flex items-center space-x-1 px-2 py-1.5 rounded-lg border transition-all duration-300 text-xs ${
                completableQuests.length > 0
                  ? 'bg-gradient-to-br from-green-900 to-emerald-800 border-green-500/50 text-green-300 hover:text-green-100 hover:bg-green-800 animate-pulse shadow-glow-green'
                  : 'bg-gradient-to-br from-purple-900 to-indigo-800 border-purple-500/50 text-purple-300 hover:text-purple-100 hover:bg-purple-800'
              }`}
            >
              <Target className="w-3 h-3" />
              <span className="hidden sm:inline font-serif">Quests</span>
              {activeQuests.length > 0 && (
                <span className={`text-xs rounded-full px-1 min-w-[16px] text-center ${
                  completableQuests.length > 0 ? 'bg-green-500 text-white' : 'bg-purple-500 text-white'
                }`}>
                  {completableQuests.length > 0 ? completableQuests.length : activeQuests.length}
                </span>
              )}
            </button>
          </Tooltip>

          {/* Daily Rewards */}
          <Tooltip content={canClaimDaily ? "Daily reward available! Click to claim." : "Daily login rewards and streak tracking"}>
            <button
              onClick={onDailyRewardsOpen}
              className={`flex items-center space-x-1 px-2 py-1.5 rounded-lg border transition-all duration-300 text-xs ${
                canClaimDaily
                  ? 'bg-gradient-to-br from-green-900 to-emerald-800 border-green-500/50 text-green-300 hover:text-green-100 hover:bg-green-800 animate-pulse shadow-glow-green'
                  : 'bg-gradient-to-br from-blue-900 to-cyan-800 border-blue-500/50 text-blue-300 hover:text-blue-100 hover:bg-blue-800'
              }`}
            >
              <Calendar className="w-3 h-3" />
              <span className="hidden sm:inline font-serif">Daily</span>
              {canClaimDaily && <span className="text-xs bg-green-500 text-white rounded-full px-1">!</span>}
            </button>
          </Tooltip>

          {/* Battle Pass */}
          <Tooltip content={`Battle Pass - Level ${gameState.battlePassLevel} (${gameState.battlePassPremium ? 'Premium' : 'Free'})`}>
            <button
              onClick={onBattlePassOpen}
              className="flex items-center space-x-1 px-2 py-1.5 bg-gradient-to-br from-purple-900 to-indigo-800 border border-purple-500/50 rounded-lg text-purple-300 hover:text-purple-100 hover:bg-purple-800 transition-all duration-300 text-xs"
            >
              <Trophy className="w-3 h-3" />
              <span className="hidden sm:inline font-serif">Pass</span>
              {gameState.battlePassPremium && <span className="text-xs bg-purple-500 text-white rounded-full px-1">★</span>}
            </button>
          </Tooltip>

          {/* VIP */}
          <Tooltip content={`VIP Membership - ${gameState.vipLevel > 0 ? `Current: Level ${gameState.vipLevel}` : 'Unlock premium benefits'}`}>
            <button
              onClick={onVIPModalOpen}
              className="flex items-center space-x-1 px-2 py-1.5 bg-gradient-to-br from-yellow-900 to-amber-800 border border-yellow-500/50 rounded-lg text-yellow-300 hover:text-yellow-100 hover:bg-yellow-800 transition-all duration-300 text-xs"
            >
              <Crown className="w-3 h-3" />
              <span className="hidden sm:inline font-serif">VIP</span>
              {gameState.vipLevel > 0 && <span className="text-xs bg-yellow-500 text-yellow-900 rounded-full px-1">{gameState.vipLevel}</span>}
            </button>
          </Tooltip>

          {/* Premium Shop */}
          <Tooltip content="Premium Shop - Purchase powerful items with Essence Crystals">
            <button
              onClick={onPremiumShopOpen}
              className="flex items-center space-x-1 px-2 py-1.5 bg-gradient-to-br from-purple-900 to-indigo-800 border border-purple-500/50 rounded-lg text-purple-300 hover:text-purple-100 hover:bg-purple-800 transition-all duration-300 text-xs"
            >
              <ShoppingBag className="w-3 h-3" />
              <span className="hidden sm:inline font-serif">Shop</span>
            </button>
          </Tooltip>

          {/* Storage Expansion */}
          <Tooltip content={`Storage: ${collectedEntitiesCount}/${gameState.maxGrimoireSlots} (${Math.round(storagePercent)}% full)`}>
            <button
              onClick={onStorageExpansionOpen}
              className={`flex items-center space-x-1 px-2 py-1.5 rounded-lg border transition-all duration-300 text-xs ${
                storagePercent > 90
                  ? 'bg-gradient-to-br from-red-900 to-orange-800 border-red-500/50 text-red-300 hover:text-red-100 hover:bg-red-800 animate-pulse'
                  : 'bg-gradient-to-br from-gray-900 to-slate-800 border-gray-500/50 text-gray-300 hover:text-gray-100 hover:bg-gray-800'
              }`}
            >
              <Archive className="w-3 h-3" />
              <span className="hidden sm:inline font-serif">Storage</span>
              {storagePercent > 90 && <span className="text-xs bg-red-500 text-white rounded-full px-1">!</span>}
            </button>
          </Tooltip>

          {/* Grimoire */}
          <Tooltip content={`Grimoire - View your collected entities (${collectedEntitiesCount} collected)`}>
            <button
              onClick={onGrimoireToggle}
              className="flex items-center space-x-1 px-2 py-1.5 bg-gradient-to-br from-indigo-900 to-purple-800 border border-indigo-500/50 rounded-lg text-indigo-300 hover:text-indigo-100 hover:bg-indigo-800 transition-all duration-300 text-xs"
            >
              <Book className="w-3 h-3" />
              <span className="hidden sm:inline font-serif">Grimoire</span>
              {collectedEntitiesCount > 0 && (
                <span className="text-xs bg-indigo-500 text-white rounded-full px-1 min-w-[16px] text-center">
                  {collectedEntitiesCount > 99 ? '99+' : collectedEntitiesCount}
                </span>
              )}
            </button>
          </Tooltip>

          {/* Social Features */}
          <Tooltip content="Guild System - Join or create a guild">
            <button
              onClick={onGuildOpen}
              className="flex items-center space-x-1 px-2 py-1.5 bg-gradient-to-br from-blue-900 to-indigo-800 border border-blue-500/50 rounded-lg text-blue-300 hover:text-blue-100 hover:bg-blue-800 transition-all duration-300 text-xs"
            >
              <Users className="w-3 h-3" />
              <span className="hidden sm:inline font-serif">Guild</span>
            </button>
          </Tooltip>

          <Tooltip content="Trading - Exchange entities with other players">
            <button
              onClick={onTradingOpen}
              className="flex items-center space-x-1 px-2 py-1.5 bg-gradient-to-br from-green-900 to-emerald-800 border border-green-500/50 rounded-lg text-green-300 hover:text-green-100 hover:bg-green-800 transition-all duration-300 text-xs"
            >
              <ArrowRightLeft className="w-3 h-3" />
              <span className="hidden sm:inline font-serif">Trade</span>
            </button>
          </Tooltip>

          <Tooltip content="Leaderboards - Global rankings">
            <button
              onClick={onLeaderboardOpen}
              className="flex items-center space-x-1 px-2 py-1.5 bg-gradient-to-br from-yellow-900 to-amber-800 border border-yellow-500/50 rounded-lg text-yellow-300 hover:text-yellow-100 hover:bg-yellow-800 transition-all duration-300 text-xs"
            >
              <Trophy className="w-3 h-3" />
              <span className="hidden sm:inline font-serif">Ranks</span>
            </button>
          </Tooltip>

          <Tooltip content="Chat - Communicate with other summoners">
            <button
              onClick={onChatOpen}
              className="flex items-center space-x-1 px-2 py-1.5 bg-gradient-to-br from-purple-900 to-violet-800 border border-purple-500/50 rounded-lg text-purple-300 hover:text-purple-100 hover:bg-purple-800 transition-all duration-300 text-xs"
            >
              <MessageCircle className="w-3 h-3" />
              <span className="hidden sm:inline font-serif">Chat</span>
            </button>
          </Tooltip>

          {/* Essence Shop (if unlocked) */}
          {gameState.unlockedFeatures.includes('essence_shop') && (
            <Tooltip content="Essence Shop - Purchase power-ups and enhancements with Essence">
              <button
                onClick={onEssenceShopOpen}
                className="flex items-center space-x-1 px-2 py-1.5 bg-gradient-to-br from-orange-900 to-red-800 border border-orange-500/50 rounded-lg text-orange-300 hover:text-orange-100 hover:bg-orange-800 transition-all duration-300 text-xs"
              >
                <Zap className="w-3 h-3" />
                <span className="hidden sm:inline font-serif">Essence</span>
              </button>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Active Effects Bar */}
      {(gameState.currentStreak > 0 || activeEffects.powerBoost > 0 || activeEffects.shinyCharmActive) && (
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {gameState.currentStreak > 0 && (
            <Tooltip content={`Current summoning streak: ${gameState.currentStreak}. Best streak: ${gameState.bestStreak}`}>
              <div className="bg-black/20 backdrop-blur-sm border border-green-500/30 rounded-lg px-2 py-1">
                <span className="text-green-400 font-serif text-xs flex items-center space-x-1">
                  <Flame className="w-3 h-3" />
                  <span>{gameState.currentStreak} Streak</span>
                </span>
              </div>
            </Tooltip>
          )}
          
          {activeEffects.powerBoost > 0 && (
            <Tooltip content={`Power boost from sacrifices: +${activeEffects.powerBoost}% for ${activeEffects.powerBoostRemaining} more summons`}>
              <div className="bg-black/20 backdrop-blur-sm border border-red-500/30 rounded-lg px-2 py-1">
                <span className="text-red-400 font-serif text-xs">⚡ +{activeEffects.powerBoost}% ({activeEffects.powerBoostRemaining})</span>
              </div>
            </Tooltip>
          )}

          {activeEffects.shinyCharmActive && (
            <Tooltip content={`Shiny Charm active: Increased shiny chance for ${activeEffects.shinyCharmRemaining} more summons`}>
              <div className="bg-black/20 backdrop-blur-sm border border-yellow-500/30 rounded-lg px-2 py-1">
                <span className="text-yellow-400 font-serif text-xs">✨ Shiny ({activeEffects.shinyCharmRemaining})</span>
              </div>
            </Tooltip>
          )}

          {activeEffects.rareGuarantee && (
            <Tooltip content="Next summon guaranteed to be rare or better!">
              <div className="bg-black/20 backdrop-blur-sm border border-purple-500/30 rounded-lg px-2 py-1 animate-pulse">
                <span className="text-purple-400 font-serif text-xs">💎 Rare Guarantee</span>
              </div>
            </Tooltip>
          )}

          {activeEffects.streakProtection && (
            <Tooltip content="Streak protection active - your streak won't break on failed summons">
              <div className="bg-black/20 backdrop-blur-sm border border-blue-500/30 rounded-lg px-2 py-1">
                <span className="text-blue-400 font-serif text-xs">🛡️ Protected</span>
              </div>
            </Tooltip>
          )}
        </div>
      )}
    </div>
  );
};