import React from 'react';
import { GameState, WeatherState } from '../types/game';
import { EnergyDisplay } from './EnergyDisplay';
import { WeatherDisplay } from './WeatherDisplay';
import { RitualParameters } from './RitualParameters';
import { Tooltip } from './Tooltip';
import { Activity, CloudLightning, Settings } from 'lucide-react';

interface SidePanelProps {
  gameState: GameState;
  weather: WeatherState;
  collectedEntitiesCount: number;
  temperature: number;
  maxTokens: number;
  memory: number;
  onTemperatureChange: (value: number) => void;
  onMaxTokensChange: (value: number) => void;
  onMemoryChange: (value: number) => void;
  onEnergyRefill: () => void;
}

export const SidePanel: React.FC<SidePanelProps> = ({
  gameState,
  weather,
  collectedEntitiesCount,
  temperature,
  maxTokens,
  memory,
  onTemperatureChange,
  onMaxTokensChange,
  onMemoryChange,
  onEnergyRefill,
}) => {
  return (
    <div className="space-y-6">
      {/* Energy Display - more integrated styling */}
      <div className="bg-black/10 backdrop-blur-sm border border-blue-500/10 rounded-xl overflow-hidden">
        <div className="p-3 border-b border-blue-500/10">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <h3 className="text-base font-serif text-blue-300">Energy System</h3>
          </div>
        </div>
        <div className="p-4">
          <EnergyDisplay 
            gameState={gameState}
            onEnergyRefill={onEnergyRefill}
          />
        </div>
      </div>

      {/* Weather Display - more integrated styling */}
      <div className="bg-black/10 backdrop-blur-sm border border-purple-500/10 rounded-xl overflow-hidden">
        <div className="p-3 border-b border-purple-500/10">
          <div className="flex items-center space-x-2">
            <CloudLightning className="w-4 h-4 text-purple-400" />
            <h3 className="text-base font-serif text-purple-300">Atmospheric Conditions</h3>
          </div>
        </div>
        <div className="p-4">
          <WeatherDisplay weather={weather} />
        </div>
      </div>

      {/* Ritual Parameters - more integrated styling */}
      <div className="bg-black/10 backdrop-blur-sm border border-purple-500/10 rounded-xl overflow-hidden">
        <div className="p-3 border-b border-purple-500/10">
          <div className="flex items-center space-x-2">
            <Settings className="w-4 h-4 text-purple-400" />
            <h3 className="text-base font-serif text-purple-300">Ritual Parameters</h3>
          </div>
        </div>
        <div className="p-4">
          <RitualParameters
            temperature={temperature}
            maxTokens={maxTokens}
            memory={memory}
            onTemperatureChange={onTemperatureChange}
            onMaxTokensChange={onMaxTokensChange}
            onMemoryChange={onMemoryChange}
          />
        </div>
      </div>

      {/* Quick Stats - more integrated styling */}
      <div className="bg-black/10 backdrop-blur-sm border border-purple-500/10 rounded-xl p-4">
        <h3 className="text-base font-serif text-center text-purple-300 mb-4 flex items-center justify-center space-x-2">
          <span>🔮</span>
          <span>Ritual Status</span>
        </h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Tooltip content="Number of entities currently in your grimoire">
            <div className="text-center p-2 bg-black/20 rounded-lg border border-purple-500/10">
              <div className="text-purple-400 text-xs">Entities Bound</div>
              <div className="text-purple-200 text-lg font-serif">{collectedEntitiesCount}</div>
            </div>
          </Tooltip>
          
          <Tooltip content="Total number of summoning rituals performed">
            <div className="text-center p-2 bg-black/20 rounded-lg border border-purple-500/10">
              <div className="text-purple-400 text-xs">Total Summoned</div>
              <div className="text-purple-200 text-lg font-serif">{gameState.totalSummons}</div>
            </div>
          </Tooltip>
          
          <Tooltip content="Number of entities sacrificed for power">
            <div className="text-center p-2 bg-black/20 rounded-lg border border-purple-500/10">
              <div className="text-purple-400 text-xs">Sacrifices Made</div>
              <div className="text-red-400 text-lg font-serif">{gameState.totalSacrifices}</div>
            </div>
          </Tooltip>
          
          <Tooltip content={`Current login streak: ${gameState.loginStreak} days. Keep logging in daily to maintain your streak!`}>
            <div className="text-center p-2 bg-black/20 rounded-lg border border-purple-500/10">
              <div className="text-purple-400 text-xs">Login Streak</div>
              <div className="text-green-400 text-lg font-serif">{gameState.loginStreak}</div>
            </div>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};