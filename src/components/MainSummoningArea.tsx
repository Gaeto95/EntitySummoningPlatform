import React from 'react';
import { InteractiveSummoningCircle } from './InteractiveSummoningCircle';
import { InvokeButton } from './InvokeButton';
import { Tooltip } from './Tooltip';
import { canPerformSummon } from '../utils/energySystem';
import { GameState, WeatherState } from '../types/game';
import { Sparkles, Zap } from 'lucide-react';

interface MainSummoningAreaProps {
  gameState: GameState;
  weather: WeatherState;
  selectedRunes: string[];
  unlockedRunes: string[];
  isInvoking: boolean;
  onRuneSelect: (rune: string) => void;
  onInvoke: () => void;
}

export const MainSummoningArea: React.FC<MainSummoningAreaProps> = ({
  gameState,
  weather,
  selectedRunes,
  unlockedRunes,
  isInvoking,
  onRuneSelect,
  onInvoke,
}) => {
  const canSummon = canPerformSummon(gameState) && selectedRunes.length > 0;

  return (
    <div className="xl:col-span-2 flex flex-col items-center space-y-8 lg:space-y-10">
      {/* Summoning Circle with Integrated Runes - more space */}
      <div className="relative mb-8">
        <InteractiveSummoningCircle 
          isInvoking={isInvoking} 
          selectedRunes={selectedRunes}
          unlockedRunes={unlockedRunes}
          onRuneSelect={onRuneSelect}
          onRunePlacement={() => {}}
          weather={weather}
        />
        
        {/* Power indicator moved to bottom of circle area */}
        {selectedRunes.length > 0 && (
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
            <div className="text-center bg-black/20 backdrop-blur-sm border border-purple-500/30 rounded-lg px-4 py-2">
              <div className="text-purple-400 text-xs uppercase tracking-wide mb-1">Ritual Power</div>
              <div className="w-36 h-2 bg-black/50 rounded-full border border-purple-500/30 mb-1">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isInvoking 
                      ? 'bg-gradient-to-r from-red-600 to-orange-500 animate-pulse' 
                      : 'bg-gradient-to-r from-purple-600 to-red-500'
                  }`}
                  style={{ width: `${Math.min(100, selectedRunes.length * 25)}%` }}
                />
              </div>
              <div className="text-purple-300 text-xs">
                {selectedRunes.length}/4 runes active
              </div>
            </div>
          </div>
        )}
        
        {/* Simplified status overlay with semi-transparent styling */}
        {isInvoking && (
          <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center">
            <div className="bg-black/20 backdrop-blur-sm border border-red-500/30 rounded-lg px-3 py-1">
              <div className="text-red-200 font-serif text-xs drop-shadow-lg">
                The veil between worlds grows thin...
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Invoke Button - with much more spacing */}
      <div className="mt-16 text-center">
        <Tooltip 
          content={
            !canSummon 
              ? selectedRunes.length === 0 
                ? "Select at least one rune to begin the ritual"
                : `Insufficient energy (${gameState.currentEnergy}/${gameState.maxEnergy})`
              : "Begin the summoning ritual with selected runes"
          }
          position="bottom"
        >
          <div>
            <InvokeButton
              onInvoke={onInvoke}
              disabled={!canSummon}
              isInvoking={isInvoking}
            />
          </div>
        </Tooltip>
        
        {!canSummon && (
          <p className="text-purple-500 text-xs text-center mt-4 flex items-center justify-center space-x-2">
            {selectedRunes.length === 0 ? (
              <>
                <Sparkles className="w-3 h-3" />
                <span>Select runes around the circle to begin the ritual</span>
              </>
            ) : (
              <>
                <Zap className="w-3 h-3" />
                <span>Insufficient energy to perform ritual</span>
              </>
            )}
          </p>
        )}
      </div>

      {/* Rune Status Display - with more spacing */}
      <div className="w-full bg-black/20 backdrop-blur-sm border border-purple-500/30 rounded-xl overflow-hidden mt-8">
        <div className="p-3 border-b border-purple-500/20">
          <h2 className="text-lg font-serif text-center text-purple-300 flex items-center justify-center space-x-2">
            <span>⚡</span>
            <span>Ritual Configuration</span>
            <span>⚡</span>
          </h2>
        </div>
        
        <div className="p-4">
          <div className="text-center space-y-1">
            <div className="text-purple-400 text-sm">
              Selected Runes: {selectedRunes.length > 0 ? (
                <span className="text-purple-200 font-semibold">
                  {selectedRunes.map(rune => rune.charAt(0).toUpperCase() + rune.slice(1)).join(', ')}
                </span>
              ) : (
                <span className="text-purple-500">None - Click runes around the circle</span>
              )}
            </div>
            <div className="text-purple-500 text-xs">
              {unlockedRunes.length}/8 runes unlocked • {selectedRunes.length}/4 selected
            </div>
            {selectedRunes.length >= 4 && (
              <div className="text-yellow-400 text-xs animate-pulse">
                ⚠️ Maximum runes selected for optimal power
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};