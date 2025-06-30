import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { useAuth } from '../hooks/useAuth';
import { useGameState } from '../hooks/useGameState';
import { useEntities } from '../hooks/useEntities';
import { AuthModal } from './AuthModal';
import { generateEntity } from '../utils/entityGenerator';
import { Entity, GameState } from '../types/game';

// Guest user default state
const createGuestGameState = (): GameState => ({
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
  essenceCrystals: 100, // Give guests some crystals to try premium features
  vipLevel: 0,
  vipExpiry: 0,
  loginStreak: 1,
  lastLoginDate: new Date().toDateString(),
  dailyRewardsClaimed: false,
  battlePassLevel: 1,
  battlePassXP: 0,
  battlePassSeason: 1,
  battlePassPremium: false,
  battlePassRewardsClaimed: [],
  pityCounter: 0,
  guaranteedLegendaryCounter: 0,
  bannerPulls: {},
  grimoireSlots: 25, // Limited for guests
  maxGrimoireSlots: 25,
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
});

interface GuestModeWrapperProps {
  children: (props: {
    user: User | null;
    gameState: GameState;
    setGameState: (state: GameState) => void;
    entities: Entity[];
    collectEntity: (entity: Entity) => void;
    sacrificeEntity: (entityId: string) => void;
    performSummon: (request: any) => Promise<Entity | null>;
    performGachaPull: (bannerId: string, pullCount: number) => Promise<any>;
    isOnline: boolean;
    isGuest: boolean;
    upgradeToAccount: () => void;
  }) => React.ReactNode;
}

export const GuestModeWrapper: React.FC<GuestModeWrapperProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { gameState: backendGameState, setGameState: setBackendGameState, loading: gameLoading } = useGameState(user);
  const { entities: backendEntities, collectEntity: backendCollectEntity, sacrificeEntity: backendSacrificeEntity, loading: entitiesLoading } = useEntities(user);
  
  // Guest state management
  const [isGuest, setIsGuest] = useState(false);
  const [guestGameState, setGuestGameState] = useState<GameState>(createGuestGameState());
  const [guestEntities, setGuestEntities] = useState<Entity[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load guest data from localStorage
  useEffect(() => {
    if (!user && !authLoading) {
      const savedGuestState = localStorage.getItem('guestGameState');
      const savedGuestEntities = localStorage.getItem('guestEntities');
      
      if (savedGuestState) {
        try {
          setGuestGameState(JSON.parse(savedGuestState));
        } catch (error) {
          console.error('Failed to load guest game state:', error);
        }
      }
      
      if (savedGuestEntities) {
        try {
          setGuestEntities(JSON.parse(savedGuestEntities));
        } catch (error) {
          console.error('Failed to load guest entities:', error);
        }
      }
      
      setIsGuest(true);
    }
  }, [user, authLoading]);

  // Save guest data to localStorage
  useEffect(() => {
    if (isGuest) {
      localStorage.setItem('guestGameState', JSON.stringify(guestGameState));
      localStorage.setItem('guestEntities', JSON.stringify(guestEntities));
    }
  }, [isGuest, guestGameState, guestEntities]);

  // Guest mode functions
  const guestPerformSummon = async (request: any): Promise<Entity | null> => {
    if (guestGameState.currentEnergy < 1) return null;

    // Generate entity locally for guests
    const entity = generateEntity(
      request.runes,
      request.temperature,
      request.maxTokens,
      request.memory,
      request.powerBoost,
      request.streak,
      request.weatherBonus
    );

    // Update guest game state
    setGuestGameState(prev => ({
      ...prev,
      currentEnergy: prev.currentEnergy - 1,
      totalSummons: prev.totalSummons + 1,
      currentStreak: prev.currentStreak + 1,
      bestStreak: Math.max(prev.bestStreak, prev.currentStreak + 1)
    }));

    return entity;
  };

  const guestCollectEntity = (entity: Entity) => {
    if (guestEntities.length >= guestGameState.maxGrimoireSlots) {
      alert('Storage full! Upgrade to a full account for unlimited storage.');
      return;
    }

    setGuestEntities(prev => [entity, ...prev]);
    
    // Gain essence
    const essenceGain = entity.rarity === 'mythic' ? 100 : 
                       entity.rarity === 'legendary' ? 50 :
                       entity.rarity === 'rare' ? 25 : 10;
    
    setGuestGameState(prev => ({
      ...prev,
      totalEssence: prev.totalEssence + essenceGain
    }));
  };

  const guestSacrificeEntity = (entityId: string) => {
    const entity = guestEntities.find(e => e.id === entityId);
    if (!entity) return;

    setGuestEntities(prev => prev.filter(e => e.id !== entityId));
    
    const essenceGain = Math.floor(entity.power * 0.75);
    setGuestGameState(prev => ({
      ...prev,
      totalSacrifices: prev.totalSacrifices + 1,
      totalEssence: prev.totalEssence + essenceGain
    }));
  };

  const guestPerformGachaPull = async (bannerId: string, pullCount: number) => {
    // Limited gacha for guests
    if (pullCount > 1) {
      alert('Multi-pulls require a full account! Sign up to unlock all features.');
      return null;
    }

    if (guestGameState.essenceCrystals < 50) {
      alert('Insufficient crystals! Sign up for a full account to get more crystals.');
      return null;
    }

    // Deduct crystals
    setGuestGameState(prev => ({
      ...prev,
      essenceCrystals: prev.essenceCrystals - 50
    }));

    // Generate entities
    const entities: Entity[] = [];
    for (let i = 0; i < pullCount; i++) {
      // Generate a single entity
      const entity = generateEntity(['chaos', 'truth'], 0.8, 1500, 75, 0, 0, 20);
      entities.push(entity);
      
      // Add to grimoire
      guestCollectEntity(entity);
    }
    
    return { entities };
  };

  const upgradeToAccount = () => {
    setShowUpgradePrompt(true);
  };

  const handleUpgradeConfirm = () => {
    setShowUpgradePrompt(false);
    setShowAuthModal(true);
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    setIsGuest(false);
    
    // Clear guest data
    localStorage.removeItem('guestGameState');
    localStorage.removeItem('guestEntities');
    
    // Show migration success message
    alert('Account created! Your progress has been saved to the cloud.');
  };

  // Show loading screen while initializing
  if (authLoading || (user && (gameLoading || entitiesLoading))) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🔮</div>
          <div className="text-2xl font-serif text-purple-200 mb-4">
            {user ? 'Connecting to the Mystical Realm...' : 'Preparing Guest Experience...'}
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          {!isOnline && (
            <div className="mt-4 text-red-400 text-sm">
              ⚠️ You appear to be offline. Some features may be limited.
            </div>
          )}
        </div>
      </div>
    );
  }

  // Determine which state to use
  const currentGameState = isGuest ? guestGameState : backendGameState;
  const currentEntities = isGuest ? guestEntities : backendEntities;
  const currentCollectEntity = isGuest ? guestCollectEntity : backendCollectEntity;
  const currentSacrificeEntity = isGuest ? guestSacrificeEntity : backendSacrificeEntity;
  const currentPerformSummon = isGuest ? guestPerformSummon : async (request: any) => {
    // Backend summon implementation would go here
    return guestPerformSummon(request); // For demo, use the guest implementation
  };
  const currentPerformGachaPull = isGuest ? guestPerformGachaPull : async (bannerId: string, pullCount: number) => {
    // Backend gacha implementation would go here
    return guestPerformGachaPull(bannerId, pullCount); // For demo, use the guest implementation
  };
  const currentSetGameState = isGuest ? setGuestGameState : setBackendGameState;

  return (
    <>
      {children({
        user,
        gameState: currentGameState,
        setGameState: currentSetGameState,
        entities: currentEntities,
        collectEntity: currentCollectEntity,
        sacrificeEntity: currentSacrificeEntity,
        performSummon: currentPerformSummon,
        performGachaPull: currentPerformGachaPull,
        isOnline,
        isGuest,
        upgradeToAccount
      })}
      
      {/* Guest Mode Indicator - Moved to middle left */}
      {isGuest && (
        <div className="fixed top-1/3 left-4 bg-yellow-900/90 border border-yellow-500 rounded-lg p-3 text-yellow-200 text-sm z-50 max-w-xs">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            <span className="font-bold">GUEST MODE</span>
          </div>
          <div className="text-xs mb-2">
            Progress saved locally. Create an account to sync across devices and unlock all features!
          </div>
          <button
            onClick={upgradeToAccount}
            className="w-full py-1 px-2 bg-yellow-800 hover:bg-yellow-700 rounded text-xs font-bold transition-colors"
          >
            Upgrade Account
          </button>
        </div>
      )}

      {/* Demo resource buttons */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4 z-50">
        <button
          onClick={() => {
            if (isGuest) {
              setGuestGameState(prev => ({
                ...prev,
                essenceCrystals: prev.essenceCrystals + 100
              }));
            } else if (backendGameState) {
              setBackendGameState({
                ...backendGameState,
                essenceCrystals: backendGameState.essenceCrystals + 100
              });
            }
          }}
          className="px-3 py-2 bg-cyan-900/90 border border-cyan-500 rounded-lg text-cyan-200 text-sm hover:bg-cyan-800/90 transition-colors"
        >
          + 100 Crystals (Demo)
        </button>
        <button
          onClick={() => {
            if (isGuest) {
              setGuestGameState(prev => ({
                ...prev,
                totalEssence: prev.totalEssence + 500
              }));
            } else if (backendGameState) {
              setBackendGameState({
                ...backendGameState,
                totalEssence: backendGameState.totalEssence + 500
              });
            }
          }}
          className="px-3 py-2 bg-yellow-900/90 border border-yellow-500 rounded-lg text-yellow-200 text-sm hover:bg-yellow-800/90 transition-colors"
        >
          + 500 Essence (Demo)
        </button>
      </div>

      {/* Upgrade Prompt Modal */}
      {showUpgradePrompt && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-yellow-900/95 to-amber-800/95 border-2 border-yellow-500/50 rounded-xl p-6 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">🌟</div>
              <h2 className="text-2xl font-serif text-yellow-200 mb-2">Upgrade Your Experience</h2>
              <p className="text-yellow-300 text-sm">
                Create a free account to unlock the full Entity Summoning experience!
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-yellow-200">Cloud save - Never lose progress</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-yellow-200">Unlimited storage for entities</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-yellow-200">Multiplayer features & trading</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-yellow-200">Full gacha system access</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-yellow-200">Leaderboards & competitions</span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowUpgradePrompt(false)}
                className="flex-1 py-2 px-4 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Maybe Later
              </button>
              <button
                onClick={handleUpgradeConfirm}
                className="flex-1 py-2 px-4 bg-gradient-to-r from-yellow-800 to-amber-700 text-yellow-100 rounded-lg hover:from-yellow-700 hover:to-amber-600 transition-all duration-300 hover:scale-105"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Offline indicator */}
      {!isOnline && (
        <div className="fixed bottom-4 left-4 bg-red-900/90 border border-red-500 rounded-lg p-3 text-red-200 text-sm z-50">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
            <span>Offline Mode - Limited functionality</span>
          </div>
        </div>
      )}

      {/* Connection status indicator */}
      {user && isOnline && (
        <div className="fixed bottom-4 right-4 bg-green-900/90 border border-green-500 rounded-lg p-2 text-green-200 text-xs z-50">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <span>Connected</span>
          </div>
        </div>
      )}
    </>
  );
};