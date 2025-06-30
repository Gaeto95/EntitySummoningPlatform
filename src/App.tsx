import React from 'react';
import { GuestModeWrapper } from './components/GuestModeWrapper';
import { TopNavigation } from './components/TopNavigation';
import { MainSummoningArea } from './components/MainSummoningArea';
import { SidePanel } from './components/SidePanel';
import { EntityManifestation } from './components/EntityManifestation';
import { Grimoire } from './components/Grimoire';
import { AchievementNotification } from './components/AchievementNotification';
import { EventModal } from './components/EventModal';
import { EssenceShop } from './components/EssenceShop';
import { DailyRewardsModal } from './components/DailyRewardsModal';
import { VIPModal } from './components/VIPModal';
import { PremiumShop } from './components/PremiumShop';
import { BattlePassModal } from './components/BattlePassModal';
import { GachaModal } from './components/GachaModal';
import { StorageExpansionModal } from './components/StorageExpansionModal';
import { QuestPanel } from './components/QuestPanel';
import { QuestNotification } from './components/QuestNotification';
import { GuildModal } from './components/GuildModal';
import { TradingModal } from './components/TradingModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { ChatModal } from './components/ChatModal';
import { PvPArenaModal } from './components/PvPArenaModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { checkAchievements, ACHIEVEMENTS } from './utils/achievements';
import { generateWeather, getWeatherDuration } from './utils/weather';
import { shouldTriggerEvent, getRandomEvent } from './utils/events';
import { updateEnergySystem, canPerformSummon, consumeEnergy, refillEnergy, VIP_LEVELS } from './utils/energySystem';
import { checkDailyLogin, canClaimDailyReward, claimDailyReward } from './utils/dailyRewards';
import { addBattlePassXP, claimBattlePassReward, purchaseBattlePassPremium, getBattlePassXPForAction } from './utils/battlePass';
import { performGachaPull, CURRENT_BANNERS } from './utils/gachaSystem';
import { purchaseCosmetic, equipCosmetic } from './utils/cosmeticSystem';
import { 
  initializeQuestSystem, 
  refreshDailyQuests, 
  updateQuestProgress, 
  claimQuestReward, 
  unlockStoryQuests,
  getActiveQuests,
  canClaimQuest
} from './utils/questSystem';
import { Entity, GameState, Achievement, WeatherState, RitualEvent, Quest } from './types/game';

function AppContent({ 
  user, 
  gameState, 
  setGameState, 
  entities, 
  collectEntity, 
  sacrificeEntity, 
  performSummon, 
  performGachaPull: backendGachaPull, 
  isOnline,
  isGuest,
  upgradeToAccount
}: any) {
  // UI state
  const [selectedRunes, setSelectedRunes] = React.useState<string[]>([]);
  const [temperature, setTemperature] = React.useState(0.7);
  const [maxTokens, setMaxTokens] = React.useState(1000);
  const [memory, setMemory] = React.useState(50);
  const [isInvoking, setIsInvoking] = React.useState(false);
  const [manifestedEntity, setManifestedEntity] = React.useState<Entity | null>(null);
  
  // Modal states
  const [isGrimoireOpen, setIsGrimoireOpen] = React.useState(false);
  const [isShopOpen, setIsShopOpen] = React.useState(false);
  const [isDailyRewardsOpen, setIsDailyRewardsOpen] = React.useState(false);
  const [isVIPModalOpen, setIsVIPModalOpen] = React.useState(false);
  const [isPremiumShopOpen, setIsPremiumShopOpen] = React.useState(false);
  const [isBattlePassOpen, setIsBattlePassOpen] = React.useState(false);
  const [isGachaOpen, setIsGachaOpen] = React.useState(false);
  const [isStorageExpansionOpen, setIsStorageExpansionOpen] = React.useState(false);
  const [isQuestPanelOpen, setIsQuestPanelOpen] = React.useState(false);
  const [isGuildModalOpen, setIsGuildModalOpen] = React.useState(false);
  const [isTradingModalOpen, setIsTradingModalOpen] = React.useState(false);
  const [isLeaderboardModalOpen, setIsLeaderboardModalOpen] = React.useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = React.useState(false);
  const [isPvPArenaModalOpen, setIsPvPArenaModalOpen] = React.useState(false);
  const [currentEvent, setCurrentEvent] = React.useState<RitualEvent | null>(null);
  const [newAchievement, setNewAchievement] = React.useState<Achievement | null>(null);
  const [questNotification, setQuestNotification] = React.useState<{
    quest: Quest;
    type: 'completed' | 'progress' | 'new';
  } | null>(null);
  
  // Game state
  const [achievements, setAchievements] = React.useState<Achievement[]>(ACHIEVEMENTS);
  const [weather, setWeather] = React.useState<WeatherState>(generateWeather());
  const [weatherEndTime, setWeatherEndTime] = React.useState(Date.now() + getWeatherDuration('clear'));
  const [unlockedRunes, setUnlockedRunes] = React.useState<string[]>(['rage', 'truth', 'chaos', 'submission']);
  
  // Active effects
  const [activeEffects, setActiveEffects] = React.useState<{
    powerBoost: number;
    powerBoostRemaining: number;
    rareGuarantee: boolean;
    shinyCharmActive: boolean;
    shinyCharmRemaining: number;
    streakProtection: boolean;
  }>({
    powerBoost: 0,
    powerBoostRemaining: 0,
    rareGuarantee: false,
    shinyCharmActive: false,
    shinyCharmRemaining: 0,
    streakProtection: false
  });

  // Initialize quest system and daily login check
  React.useEffect(() => {
    if (!gameState) return;
    
    let updatedState = initializeQuestSystem(gameState);
    updatedState = refreshDailyQuests(updatedState);
    updatedState = checkDailyLogin(updatedState);
    
    if (updatedState !== gameState) {
      setGameState(updatedState);
      
      if (canClaimDailyReward(updatedState)) {
        setIsDailyRewardsOpen(true);
      }
    }
  }, [gameState?.lastLoginDate]);

  // Weather system
  React.useEffect(() => {
    const checkWeather = () => {
      if (Date.now() > weatherEndTime) {
        const newWeather = generateWeather();
        setWeather(newWeather);
        setWeatherEndTime(Date.now() + getWeatherDuration(newWeather.type));
      }
    };

    const interval = setInterval(checkWeather, 60000);
    return () => clearInterval(interval);
  }, [weatherEndTime]);

  // Achievement checking
  React.useEffect(() => {
    if (!gameState) return;
    
    const updatedAchievements = checkAchievements(gameState, entities, achievements);
    const newlyUnlocked = updatedAchievements.find((ach, index) => 
      ach.unlocked && !achievements[index]?.unlocked
    );
    
    if (newlyUnlocked) {
      setNewAchievement(newlyUnlocked);
      
      // Apply achievement rewards
      if (newlyUnlocked.reward) {
        const reward = newlyUnlocked.reward;
        const updatedState = { ...gameState };
        
        switch (reward.type) {
          case 'essence':
            updatedState.totalEssence += reward.value as number;
            break;
          case 'crystals':
            updatedState.essenceCrystals += reward.value as number;
            break;
          case 'energy':
            updatedState.currentEnergy = Math.min(updatedState.maxEnergy, updatedState.currentEnergy + (reward.value as number));
            break;
          case 'cosmetic':
            updatedState.unlockedCosmetics = [...updatedState.unlockedCosmetics, reward.value as string];
            break;
          case 'feature':
            updatedState.unlockedFeatures = [...updatedState.unlockedFeatures, reward.value as string];
            break;
        }
        
        setGameState(updatedState);
        
        if (reward.type === 'rune') {
          setUnlockedRunes(prev => [...prev, reward.value as string]);
        }
      }
    }
    
    setAchievements(updatedAchievements);
  }, [gameState?.totalSummons, gameState?.totalSacrifices, entities.length]);

  // Rune unlocking system
  React.useEffect(() => {
    if (!gameState) return;
    
    const newUnlocked = [...unlockedRunes];
    let hasNewUnlocks = false;

    if (gameState.totalSummons >= 3 && !newUnlocked.includes('death')) {
      newUnlocked.push('death');
      hasNewUnlocks = true;
    }
    if (gameState.totalSummons >= 5 && !newUnlocked.includes('war')) {
      newUnlocked.push('war');
      hasNewUnlocks = true;
    }
    if (gameState.totalSacrifices >= 2 && !newUnlocked.includes('fire')) {
      newUnlocked.push('fire');
      hasNewUnlocks = true;
    }
    if (gameState.totalSacrifices >= 5 && !newUnlocked.includes('void')) {
      newUnlocked.push('void');
      hasNewUnlocks = true;
    }

    if (hasNewUnlocks) {
      setUnlockedRunes(newUnlocked);
    }
  }, [gameState?.totalSummons, gameState?.totalSacrifices]);

  const handleRuneSelect = (rune: string) => {
    setSelectedRunes(prev => {
      if (prev.includes(rune)) {
        return prev.filter(r => r !== rune);
      } else if (prev.length < 4) {
        return [...prev, rune];
      }
      return prev;
    });
  };

  const handleInvoke = async () => {
    if (selectedRunes.length === 0 || !canPerformSummon(gameState)) return;
    
    // For guests, check if they need to upgrade for certain features
    if (isGuest && gameState.totalSummons >= 10) {
      const shouldUpgrade = confirm('You\'ve summoned 10 entities! Create a free account to continue with unlimited summoning and unlock all features.');
      if (shouldUpgrade) {
        upgradeToAccount();
        return;
      }
    }
    
    setIsInvoking(true);
    
    // Check for random events
    if (shouldTriggerEvent(gameState.totalSummons)) {
      const event = getRandomEvent();
      setCurrentEvent(event);
    }
    
    try {
      // Use backend summoning for authenticated users, local for guests
      const entity = await performSummon({
        runes: selectedRunes,
        temperature,
        maxTokens,
        memory,
        powerBoost: activeEffects.powerBoost,
        streak: gameState.currentStreak,
        weatherBonus: weather.effects.rareChance
      });
      
      if (entity) {
        setManifestedEntity(entity);
        
        // Update quest progress
        const updatedState = updateQuestProgress(gameState, { type: 'summon', entity });
        setGameState(updatedState);
      }
    } catch (error) {
      console.error('Summon failed:', error);
    } finally {
      setIsInvoking(false);
    }

    // Reduce active effects
    setActiveEffects(prev => ({
      ...prev,
      powerBoostRemaining: Math.max(0, prev.powerBoostRemaining - 1),
      powerBoost: prev.powerBoostRemaining > 1 ? prev.powerBoost : 0,
      rareGuarantee: false,
      shinyCharmRemaining: Math.max(0, prev.shinyCharmRemaining - 1),
      shinyCharmActive: prev.shinyCharmRemaining > 1
    }));
  };

  const handleCollectEntity = (entity: Entity) => {
    collectEntity(entity);
    setManifestedEntity(null);
    setSelectedRunes([]);
    
    // Update quest progress
    const updatedState = updateQuestProgress(gameState, { type: 'collect', entity });
    setGameState(updatedState);
  };

  const handleSacrificeEntity = (entity: Entity) => {
    const powerGain = Math.floor(entity.power / 4);
    const essenceGain = Math.floor(entity.power / 2);
    
    // Update game state
    const updatedState = {
      ...gameState,
      totalSacrifices: gameState.totalSacrifices + 1,
      totalEssence: gameState.totalEssence + essenceGain
    };
    
    setGameState(updatedState);
    
    // Update quest progress
    const questUpdatedState = updateQuestProgress(updatedState, { type: 'sacrifice', entity });
    setGameState(questUpdatedState);
    
    setActiveEffects(prev => ({
      ...prev,
      powerBoost: Math.min(50, prev.powerBoost + powerGain),
      powerBoostRemaining: Math.max(prev.powerBoostRemaining, 3)
    }));
    
    setManifestedEntity(null);
    setSelectedRunes([]);
  };

  const handleSacrificeFromGrimoire = (entity: Entity, index: number) => {
    sacrificeEntity(entity.id);
    
    const powerGain = Math.floor(entity.power / 3);
    const essenceGain = Math.floor(entity.power * 0.75);
    
    setActiveEffects(prev => ({
      ...prev,
      powerBoost: Math.min(50, prev.powerBoost + powerGain),
      powerBoostRemaining: Math.max(prev.powerBoostRemaining, 5)
    }));
    
    const updatedState = {
      ...gameState,
      totalSacrifices: gameState.totalSacrifices + 1,
      totalEssence: gameState.totalEssence + essenceGain
    };
    
    setGameState(updatedState);
    
    // Update quest progress
    const questUpdatedState = updateQuestProgress(updatedState, { type: 'sacrifice', entity });
    setGameState(questUpdatedState);
  };

  const handleEntityEvolve = (entity: Entity) => {
    // This would need backend implementation for entity evolution
    console.log('Entity evolution not yet implemented in backend');
  };

  const handleShopPurchase = (itemId: string, cost: number) => {
    if (gameState.totalEssence < cost) return;
    
    // For guests, limit certain purchases
    if (isGuest && cost > 500) {
      const shouldUpgrade = confirm('This item requires a full account! Create a free account to unlock all shop items.');
      if (shouldUpgrade) {
        upgradeToAccount();
        return;
      }
    }
    
    const updatedState = { 
      ...gameState, 
      totalEssence: gameState.totalEssence - cost 
    };
    
    setGameState(updatedState);
    
    // Update quest progress for spending
    const questUpdatedState = updateQuestProgress(updatedState, { type: 'spend', amount: cost });
    setGameState(questUpdatedState);
    
    // Apply item effects
    switch (itemId) {
      case 'power_boost_small':
        setActiveEffects(prev => ({ ...prev, powerBoost: prev.powerBoost + 10, powerBoostRemaining: 5 }));
        break;
      case 'power_boost_large':
        setActiveEffects(prev => ({ ...prev, powerBoost: prev.powerBoost + 25, powerBoostRemaining: 3 }));
        break;
      case 'rare_guarantee':
        setActiveEffects(prev => ({ ...prev, rareGuarantee: true }));
        break;
      case 'shiny_charm':
        setActiveEffects(prev => ({ ...prev, shinyCharmActive: true, shinyCharmRemaining: 10 }));
        break;
      case 'streak_protection':
        setActiveEffects(prev => ({ ...prev, streakProtection: true }));
        break;
    }
  };

  const handlePremiumShopPurchase = (itemId: string, cost: number, currency: 'essence' | 'crystals') => {
    // For guests, limit premium purchases
    if (isGuest && currency === 'crystals' && cost > 50) {
      const shouldUpgrade = confirm('Premium purchases require a full account! Create a free account to unlock all premium features.');
      if (shouldUpgrade) {
        upgradeToAccount();
        return;
      }
    }
    
    const canAfford = currency === 'crystals' 
      ? gameState.essenceCrystals >= cost
      : gameState.totalEssence >= cost;
    
    if (!canAfford) return;
    
    const updatedState = {
      ...gameState,
      [currency === 'crystals' ? 'essenceCrystals' : 'totalEssence']: 
        gameState[currency === 'crystals' ? 'essenceCrystals' : 'totalEssence'] - cost
    };
    
    setGameState(updatedState);
    
    // Apply item effects
    switch (itemId) {
      case 'energy_refill_full':
        const refillState = refillEnergy(updatedState, updatedState.maxEnergy);
        setGameState(refillState);
        break;
      case 'energy_refill_5':
        const refill5State = refillEnergy(updatedState, 5);
        setGameState(refill5State);
        break;
      // Add other premium shop effects
    }
  };

  const handleEnergyRefill = () => {
    if (gameState.essenceCrystals >= 10) {
      const refillState = {
        ...refillEnergy(gameState, gameState.maxEnergy),
        essenceCrystals: gameState.essenceCrystals - 10
      };
      setGameState(refillState);
    }
  };

  const handleClaimDailyReward = () => {
    const updatedState = claimDailyReward(gameState);
    setGameState(updatedState);
    setIsDailyRewardsOpen(false);
  };

  const handlePurchaseVIP = (level: number) => {
    // VIP requires full account
    if (isGuest) {
      const shouldUpgrade = confirm('VIP membership requires a full account! Create a free account to unlock VIP benefits.');
      if (shouldUpgrade) {
        upgradeToAccount();
        return;
      }
    }
    
    const vipLevel = VIP_LEVELS.find(v => v.level === level);
    if (!vipLevel || gameState.essenceCrystals < vipLevel.price) return;
    
    const oneMonth = 30 * 24 * 60 * 60 * 1000;
    
    const updatedState = {
      ...gameState,
      essenceCrystals: gameState.essenceCrystals - vipLevel.price,
      vipLevel: level,
      vipExpiry: Date.now() + oneMonth,
      maxEnergy: vipLevel.maxEnergy,
      energyRegenRate: vipLevel.energyRegenRate
    };
    
    setGameState(updatedState);
    setIsVIPModalOpen(false);
  };

  const handleBattlePassRewardClaim = (tier: number, isPremium: boolean) => {
    const updatedState = claimBattlePassReward(gameState, tier, isPremium);
    setGameState(updatedState);
  };

  const handleBattlePassPremiumPurchase = () => {
    // Premium battle pass requires full account
    if (isGuest) {
      const shouldUpgrade = confirm('Premium Battle Pass requires a full account! Create a free account to unlock premium rewards.');
      if (shouldUpgrade) {
        upgradeToAccount();
        return;
      }
    }
    
    const updatedState = purchaseBattlePassPremium(gameState);
    setGameState(updatedState);
  };

  const handleGachaPull = async (bannerId: string, pullCount: number) => {
    try {
      const result = await backendGachaPull(bannerId, pullCount);
      if (result) {
        // Add entities to grimoire
        if (result.entities) {
          result.entities.forEach((entity: Entity) => {
            collectEntity(entity);
          });
        }
        return result;
      }
    } catch (error) {
      console.error('Gacha pull failed:', error);
      return null;
    }
  };

  const handleCosmeticPurchase = (cosmeticId: string) => {
    const updatedState = purchaseCosmetic(gameState, cosmeticId);
    setGameState(updatedState);
  };

  const handleCosmeticEquip = (cosmeticId: string, slot: keyof GameState['equippedCosmetics']) => {
    const updatedState = equipCosmetic(gameState, cosmeticId, slot);
    setGameState(updatedState);
  };

  const handleStorageExpansion = (slots: number, cost: number, currency: 'essence' | 'crystals') => {
    // Storage expansion requires full account for guests
    if (isGuest) {
      const shouldUpgrade = confirm('Storage expansion requires a full account! Create a free account for unlimited storage.');
      if (shouldUpgrade) {
        upgradeToAccount();
        return;
      }
    }
    
    const canAfford = currency === 'crystals' 
      ? gameState.essenceCrystals >= cost
      : gameState.totalEssence >= cost;
    
    if (!canAfford) return;
    
    const updatedState = {
      ...gameState,
      [currency === 'crystals' ? 'essenceCrystals' : 'totalEssence']: 
        gameState[currency === 'crystals' ? 'essenceCrystals' : 'totalEssence'] - cost,
      maxGrimoireSlots: gameState.maxGrimoireSlots + slots
    };
    
    setGameState(updatedState);
    setIsStorageExpansionOpen(false);
  };

  const handleEventChoice = (effect: (state: GameState) => GameState) => {
    setGameState(effect(gameState));
    setCurrentEvent(null);
  };

  const handleCloseManifest = () => {
    setManifestedEntity(null);
    setSelectedRunes([]);
  };

  const handleQuestRewardClaim = (questId: string) => {
    const quest = getActiveQuests(gameState).find(q => q.id === questId);
    if (quest && canClaimQuest(gameState, questId)) {
      const updatedState = claimQuestReward(gameState, questId);
      setGameState(updatedState);
      
      setQuestNotification({
        quest,
        type: 'completed'
      });
    }
  };

  const handleUpdateGameState = (newState: Partial<GameState>) => {
    setGameState({
      ...gameState,
      ...newState
    });
  };

  if (!gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🔮</div>
          <div className="text-2xl font-serif text-purple-200">
            Loading your mystical realm...
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white overflow-x-hidden">
        {/* Enhanced Background effects */}
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_rgba(139,69,19,0.1)_0%,_transparent_50%)] animate-slow-pulse" />
        <div className="fixed inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-black/20 animate-gradient-shift" />
        
        {/* Enhanced ambient particles */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {[...Array(40)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-purple-400/20 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 10}s`,
                animationDuration: `${10 + Math.random() * 20}s`
              }}
            />
          ))}
        </div>

        {/* Top Navigation */}
        <TopNavigation
          gameState={gameState}
          activeEffects={activeEffects}
          onDailyRewardsOpen={() => setIsDailyRewardsOpen(true)}
          onVIPModalOpen={() => setIsVIPModalOpen(true)}
          onPremiumShopOpen={() => setIsPremiumShopOpen(true)}
          onGrimoireToggle={() => setIsGrimoireOpen(!isGrimoireOpen)}
          onEssenceShopOpen={() => setIsShopOpen(true)}
          onBattlePassOpen={() => setIsBattlePassOpen(true)}
          onGachaOpen={() => setIsGachaOpen(true)}
          onCosmeticShopOpen={() => {}}
          onStorageExpansionOpen={() => setIsStorageExpansionOpen(true)}
          onQuestPanelOpen={() => setIsQuestPanelOpen(true)}
          onGuildOpen={() => setIsGuildModalOpen(true)}
          onTradingOpen={() => setIsTradingModalOpen(true)}
          onLeaderboardOpen={() => setIsLeaderboardModalOpen(true)}
          onChatOpen={() => setIsChatModalOpen(true)}
          onPvPArenaOpen={() => setIsPvPArenaModalOpen(true)}
          collectedEntitiesCount={entities.length}
        />

        {/* Main content */}
        <div className="relative z-10 min-h-screen p-4 lg:p-8">
          {/* Compact Title */}
          <div className="text-center mb-6 lg:mb-8">
            <h1 className="text-3xl lg:text-4xl font-serif mb-2 bg-gradient-to-r from-purple-400 via-red-400 to-purple-400 bg-clip-text text-transparent drop-shadow-glow">
              Entity Summoning Chamber
            </h1>
            <p className="text-base lg:text-lg text-purple-300 font-serif">
              Invoke consciousness from the digital void
            </p>
            {isGuest && (
              <div className="mt-2 text-yellow-400 text-sm">
                🎮 Playing as Guest - <button onClick={upgradeToAccount} className="underline hover:text-yellow-300">Create Account</button> to unlock all features
              </div>
            )}
            {!isOnline && (
              <div className="mt-2 text-red-400 text-sm">
                ⚠️ Offline Mode - Limited functionality
              </div>
            )}
          </div>

          {/* Main Layout */}
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8 items-start">
              
              {/* Main Summoning Area */}
              <MainSummoningArea
                gameState={gameState}
                weather={weather}
                selectedRunes={selectedRunes}
                unlockedRunes={unlockedRunes}
                isInvoking={isInvoking}
                onRuneSelect={handleRuneSelect}
                onInvoke={handleInvoke}
              />

              {/* Side Panel */}
              <SidePanel
                gameState={gameState}
                weather={weather}
                collectedEntitiesCount={entities.length}
                temperature={temperature}
                maxTokens={maxTokens}
                memory={memory}
                onTemperatureChange={setTemperature}
                onMaxTokensChange={setMaxTokens}
                onMemoryChange={setMemory}
                onEnergyRefill={handleEnergyRefill}
              />
            </div>
          </div>
        </div>

        {/* Modals and Overlays */}
        <EntityManifestation
          entity={manifestedEntity}
          onClose={handleCloseManifest}
          onCollect={handleCollectEntity}
          onSacrifice={handleSacrificeEntity}
          powerBoost={activeEffects.powerBoost}
        />

        <Grimoire
          entities={entities}
          isOpen={isGrimoireOpen}
          onToggle={() => setIsGrimoireOpen(!isGrimoireOpen)}
          onSacrificeFromGrimoire={handleSacrificeFromGrimoire}
          onEntityEvolve={handleEntityEvolve}
          gameState={gameState}
        />

        <QuestPanel
          isOpen={isQuestPanelOpen}
          onClose={() => setIsQuestPanelOpen(false)}
          gameState={gameState}
          onClaimReward={handleQuestRewardClaim}
        />

        <AchievementNotification
          achievement={newAchievement}
          onClose={() => setNewAchievement(null)}
        />

        <QuestNotification
          quest={questNotification?.quest || null}
          type={questNotification?.type || 'progress'}
          onClose={() => setQuestNotification(null)}
        />

        <EventModal
          event={currentEvent}
          gameState={gameState}
          onChoice={handleEventChoice}
          onClose={() => setCurrentEvent(null)}
        />

        <EssenceShop
          isOpen={isShopOpen}
          onClose={() => setIsShopOpen(false)}
          gameState={gameState}
          onPurchase={handleShopPurchase}
        />

        <DailyRewardsModal
          isOpen={isDailyRewardsOpen}
          onClose={() => setIsDailyRewardsOpen(false)}
          gameState={gameState}
          onClaimReward={handleClaimDailyReward}
        />

        <VIPModal
          isOpen={isVIPModalOpen}
          onClose={() => setIsVIPModalOpen(false)}
          gameState={gameState}
          onPurchaseVIP={handlePurchaseVIP}
        />

        <PremiumShop
          isOpen={isPremiumShopOpen}
          onClose={() => setIsPremiumShopOpen(false)}
          gameState={gameState}
          onPurchase={handlePremiumShopPurchase}
        />

        <BattlePassModal
          isOpen={isBattlePassOpen}
          onClose={() => setIsBattlePassOpen(false)}
          gameState={gameState}
          onClaimReward={handleBattlePassRewardClaim}
          onPurchasePremium={handleBattlePassPremiumPurchase}
        />

        <GachaModal
          isOpen={isGachaOpen}
          onClose={() => setIsGachaOpen(false)}
          gameState={gameState}
          onPull={handleGachaPull}
        />

        <StorageExpansionModal
          isOpen={isStorageExpansionOpen}
          onClose={() => setIsStorageExpansionOpen(false)}
          gameState={gameState}
          onPurchaseSlots={handleStorageExpansion}
        />

        {/* Social Feature Modals */}
        <GuildModal
          isOpen={isGuildModalOpen}
          onClose={() => setIsGuildModalOpen(false)}
          gameState={gameState}
          user={user}
        />

        <TradingModal
          isOpen={isTradingModalOpen}
          onClose={() => setIsTradingModalOpen(false)}
          gameState={gameState}
          entities={entities}
          user={user}
        />

        <LeaderboardModal
          isOpen={isLeaderboardModalOpen}
          onClose={() => setIsLeaderboardModalOpen(false)}
          gameState={gameState}
          user={user}
        />

        <ChatModal
          isOpen={isChatModalOpen}
          onClose={() => setIsChatModalOpen(false)}
          gameState={gameState}
          user={user}
        />

        {/* PvP Arena Modal */}
        <PvPArenaModal
          isOpen={isPvPArenaModalOpen}
          onClose={() => setIsPvPArenaModalOpen(false)}
          gameState={gameState}
          entities={entities}
          user={user}
          onUpdateGameState={handleUpdateGameState}
        />
        
        {/* Bolt link */}
        <a 
          href="https://bolt.new" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="fixed bottom-4 left-4 z-50 opacity-70 hover:opacity-100 transition-opacity"
        >
          <img src="/bolt-logo.png" alt="Bolt" width="100" height="100" />
        </a>
      </div>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <GuestModeWrapper>
      {(props) => <AppContent {...props} />}
    </GuestModeWrapper>
  );
}

export default App;