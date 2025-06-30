import React, { useState, useEffect } from 'react';
import { GameState } from '../types/game';
import { getTimeUntilNextEnergy, formatTimeRemaining, VIP_LEVELS } from '../utils/energySystem';
import { Tooltip } from './Tooltip';
import { Battery, Clock, Zap, RefreshCw } from 'lucide-react';

interface EnergyDisplayProps {
  gameState: GameState;
  onEnergyRefill: () => void;
}

export const EnergyDisplay: React.FC<EnergyDisplayProps> = ({ gameState, onEnergyRefill }) => {
  const [timeUntilNext, setTimeUntilNext] = useState(0);

  useEffect(() => {
    const updateTimer = () => {
      setTimeUntilNext(getTimeUntilNextEnergy(gameState));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [gameState.currentEnergy, gameState.lastEnergyUpdate, gameState.vipLevel]);

  const vipLevel = VIP_LEVELS.find(v => v.level === gameState.vipLevel) || VIP_LEVELS[0];
  const energyPercentage = (gameState.currentEnergy / vipLevel.maxEnergy) * 100;
  const isFull = gameState.currentEnergy >= vipLevel.maxEnergy;

  return (
    <div className="space-y-4">
      {/* Energy Bar */}
      <div className="relative">
        <div className="h-4 bg-black/50 rounded-full border border-blue-500/30 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              energyPercentage > 66 ? 'bg-gradient-to-r from-green-600 to-emerald-500' :
              energyPercentage > 33 ? 'bg-gradient-to-r from-yellow-600 to-orange-500' :
              'bg-gradient-to-r from-red-600 to-red-500'
            }`}
            style={{ width: `${energyPercentage}%` }}
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white text-sm font-bold drop-shadow-lg">
            {gameState.currentEnergy}/{vipLevel.maxEnergy}
          </span>
        </div>
      </div>

      {/* Status and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm">
          {!isFull ? (
            <>
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400">
                Next: {formatTimeRemaining(timeUntilNext)}
              </span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 text-green-400" />
              <span className="text-green-400">Full Energy!</span>
            </>
          )}
        </div>
        
        {!isFull && (
          <Tooltip content="Instantly refill all energy for 10 Essence Crystals">
            <button
              onClick={onEnergyRefill}
              disabled={gameState.essenceCrystals < 10}
              className={`flex items-center space-x-1 px-3 py-1 rounded-lg border transition-all duration-300 text-sm ${
                gameState.essenceCrystals >= 10
                  ? 'bg-gradient-to-r from-blue-800 to-cyan-700 text-blue-100 border-blue-500/50 hover:from-blue-700 hover:to-cyan-600 hover:scale-105'
                  : 'bg-gray-800 text-gray-500 border-gray-600 cursor-not-allowed'
              }`}
            >
              <RefreshCw className="w-3 h-3" />
              <span>💎 10</span>
            </button>
          </Tooltip>
        )}
      </div>

      {/* VIP Benefits */}
      {gameState.vipLevel > 0 && (
        <div className="pt-3 border-t border-blue-500/20">
          <div className="text-xs text-blue-300 space-y-1">
            <div className="flex justify-between">
              <span>Regen Rate:</span>
              <span>{vipLevel.energyRegenRate}min per energy</span>
            </div>
            <div className="flex justify-between">
              <span>Daily Bonus:</span>
              <span>+{vipLevel.dailyBonuses.energy} energy</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};