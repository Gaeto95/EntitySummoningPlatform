import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, getGameState, updateGameState } from '../lib/supabase';
import { GameState } from '../types/game';

const defaultGameState: GameState = {
  totalSummons: 0,
  totalSacrifices: 0,
  totalEssence: 0,
  currentStreak: 0,
  bestStreak: 0,
  prestigeLevel: 0,
  unlockedFeatures: [],
  lastPlayDate: Date.now(),
  playtime: 0,
  currentEnergy: 10,
  maxEnergy: 10,
  lastEnergyUpdate: Date.now(),
  energyRegenRate: 60,
  essenceCrystals: 500,
  vipLevel: 0,
  vipExpiry: 0,
  loginStreak: 0,
  lastLoginDate: '',
  dailyRewardsClaimed: false,
  battlePassLevel: 1,
  battlePassXP: 0,
  battlePassSeason: 1,
  battlePassPremium: false,
  battlePassRewardsClaimed: [],
  pityCounter: 0,
  guaranteedLegendaryCounter: 0,
  bannerPulls: {},
  grimoireSlots: 50,
  maxGrimoireSlots: 50,
  unlockedCosmetics: [],
  equippedCosmetics: {
    circleTheme: 'default',
    particleEffect: 'default',
    uiTheme: 'default',
    summonAnimation: 'default'
  },
  activeQuests: [],
  completedQuests: [],
  questProgress: {},
  lastQuestRefresh: '',
  questStats: {
    totalCompleted: 0,
    dailyCompleted: 0,
    weeklyCompleted: 0,
    storyCompleted: 0
  }
};

export const useGameState = (user: User | null) => {
  const [gameState, setGameState] = useState<GameState>(defaultGameState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert database row to GameState
  const convertDbToGameState = (dbRow: any): GameState => {
    return {
      totalSummons: dbRow.total_summons || 0,
      totalSacrifices: dbRow.total_sacrifices || 0,
      totalEssence: dbRow.total_essence || 0,
      currentStreak: dbRow.current_streak || 0,
      bestStreak: dbRow.best_streak || 0,
      prestigeLevel: dbRow.prestige_level || 0,
      unlockedFeatures: dbRow.unlocked_features || [],
      lastPlayDate: new Date(dbRow.last_play_date).getTime(),
      playtime: dbRow.playtime || 0,
      currentEnergy: dbRow.current_energy || 10,
      maxEnergy: dbRow.max_energy || 10,
      lastEnergyUpdate: new Date(dbRow.last_energy_update).getTime(),
      energyRegenRate: dbRow.energy_regen_rate || 60,
      essenceCrystals: dbRow.essence_crystals || 500,
      vipLevel: dbRow.vip_level || 0,
      vipExpiry: dbRow.vip_expiry ? new Date(dbRow.vip_expiry).getTime() : 0,
      loginStreak: dbRow.login_streak || 0,
      lastLoginDate: dbRow.last_login_date || '',
      dailyRewardsClaimed: dbRow.daily_rewards_claimed || false,
      battlePassLevel: dbRow.battle_pass_level || 1,
      battlePassXP: dbRow.battle_pass_xp || 0,
      battlePassSeason: dbRow.battle_pass_season || 1,
      battlePassPremium: dbRow.battle_pass_premium || false,
      battlePassRewardsClaimed: dbRow.battle_pass_rewards_claimed || [],
      pityCounter: dbRow.pity_counter || 0,
      guaranteedLegendaryCounter: dbRow.guaranteed_legendary_counter || 0,
      bannerPulls: dbRow.banner_pulls || {},
      grimoireSlots: dbRow.grimoire_slots || 50,
      maxGrimoireSlots: dbRow.max_grimoire_slots || 50,
      unlockedCosmetics: dbRow.unlocked_cosmetics || [],
      equippedCosmetics: dbRow.equipped_cosmetics || {
        circleTheme: 'default',
        particleEffect: 'default',
        uiTheme: 'default',
        summonAnimation: 'default'
      },
      activeQuests: dbRow.active_quests || [],
      completedQuests: dbRow.completed_quests || [],
      questProgress: dbRow.quest_progress || {},
      lastQuestRefresh: dbRow.last_quest_refresh || '',
      questStats: dbRow.quest_stats || {
        totalCompleted: 0,
        dailyCompleted: 0,
        weeklyCompleted: 0,
        storyCompleted: 0
      }
    };
  };

  // Convert GameState to database format
  const convertGameStateToDb = (state: GameState) => {
    return {
      total_summons: state.totalSummons,
      total_sacrifices: state.totalSacrifices,
      total_essence: state.totalEssence,
      current_streak: state.currentStreak,
      best_streak: state.bestStreak,
      prestige_level: state.prestigeLevel,
      unlocked_features: state.unlockedFeatures,
      last_play_date: new Date(state.lastPlayDate).toISOString(),
      playtime: state.playtime,
      current_energy: state.currentEnergy,
      max_energy: state.maxEnergy,
      last_energy_update: new Date(state.lastEnergyUpdate).toISOString(),
      energy_regen_rate: state.energyRegenRate,
      essence_crystals: state.essenceCrystals,
      vip_level: state.vipLevel,
      vip_expiry: state.vipExpiry ? new Date(state.vipExpiry).toISOString() : null,
      login_streak: state.loginStreak,
      last_login_date: state.lastLoginDate,
      daily_rewards_claimed: state.dailyRewardsClaimed,
      battle_pass_level: state.battlePassLevel,
      battle_pass_xp: state.battlePassXP,
      battle_pass_season: state.battlePassSeason,
      battle_pass_premium: state.battlePassPremium,
      battle_pass_rewards_claimed: state.battlePassRewardsClaimed,
      pity_counter: state.pityCounter,
      guaranteed_legendary_counter: state.guaranteedLegendaryCounter,
      banner_pulls: state.bannerPulls,
      grimoire_slots: state.grimoireSlots,
      max_grimoire_slots: state.maxGrimoireSlots,
      unlocked_cosmetics: state.unlockedCosmetics,
      equipped_cosmetics: state.equippedCosmetics,
      active_quests: state.activeQuests,
      completed_quests: state.completedQuests,
      quest_progress: state.questProgress,
      last_quest_refresh: state.lastQuestRefresh,
      quest_stats: state.questStats
    };
  };

  // Load game state from database
  useEffect(() => {
    if (!user) {
      setGameState(defaultGameState);
      setLoading(false);
      return;
    }

    const loadGameState = async () => {
      try {
        setLoading(true);
        const { data, error } = await getGameState(user.id);
        
        if (error) {
          console.error('Error loading game state:', error);
          setError(error.message);
          setGameState(defaultGameState);
        } else if (data) {
          setGameState(convertDbToGameState(data));
        } else {
          setGameState(defaultGameState);
        }
      } catch (err: any) {
        console.error('Error loading game state:', err);
        setError(err.message);
        setGameState(defaultGameState);
      } finally {
        setLoading(false);
      }
    };

    loadGameState();
  }, [user]);

  // Save game state to database
  const saveGameState = async (newState: GameState) => {
    if (!user) return;

    try {
      const dbData = convertGameStateToDb(newState);
      const { error } = await updateGameState(user.id, dbData);
      
      if (error) {
        console.error('Error saving game state:', error);
        setError(error.message);
      } else {
        setGameState(newState);
        setError(null);
      }
    } catch (err: any) {
      console.error('Error saving game state:', err);
      setError(err.message);
    }
  };

  // Real-time subscription for game state changes
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('game_state_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'game_states',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.new) {
            setGameState(convertDbToGameState(payload.new));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return {
    gameState,
    setGameState: saveGameState,
    loading,
    error
  };
};