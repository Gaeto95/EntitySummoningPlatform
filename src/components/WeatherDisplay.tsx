import React from 'react';
import { WeatherState } from '../types/game';
import { WEATHER_TYPES } from '../utils/weather';
import { Tooltip } from './Tooltip';

interface WeatherDisplayProps {
  weather: WeatherState;
}

export const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ weather }) => {
  const weatherInfo = WEATHER_TYPES[weather.type];
  
  const getEffectsTooltip = () => {
    const effects = [];
    if (weather.effects.summonBonus > 0) {
      effects.push(`+${weather.effects.summonBonus}% Summon Power`);
    }
    if (weather.effects.rareChance > 0) {
      effects.push(`+${weather.effects.rareChance}% Rare Chance`);
    }
    if (weather.effects.powerMultiplier > 1) {
      effects.push(`x${weather.effects.powerMultiplier} Power Multiplier`);
    }
    return effects.length > 0 ? effects.join('\n') : 'No special effects';
  };
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Tooltip content={weatherInfo.description}>
          <div className="flex items-center space-x-2">
            <span className="text-2xl animate-pulse">{weatherInfo.particles}</span>
            <span className={`text-${weatherInfo.color}-400 font-semibold`}>
              {weatherInfo.name}
            </span>
          </div>
        </Tooltip>
        
        <Tooltip content={`Weather intensity: ${Math.round(weather.intensity * 100)}%`}>
          <span className={`text-${weatherInfo.color}-400 text-sm font-semibold`}>
            {Math.round(weather.intensity * 100)}%
          </span>
        </Tooltip>
      </div>
      
      <div className="text-purple-300 text-sm leading-relaxed">
        {weatherInfo.description}
      </div>
      
      {(weather.effects.summonBonus > 0 || weather.effects.rareChance > 0 || weather.effects.powerMultiplier > 1) && (
        <Tooltip content={getEffectsTooltip()}>
          <div className="space-y-1">
            {weather.effects.summonBonus > 0 && (
              <div className="text-green-400 text-xs flex items-center justify-between">
                <span>⚡ Summon Power:</span>
                <span>+{weather.effects.summonBonus}%</span>
              </div>
            )}
            
            {weather.effects.rareChance > 0 && (
              <div className="text-blue-400 text-xs flex items-center justify-between">
                <span>💎 Rare Chance:</span>
                <span>+{weather.effects.rareChance}%</span>
              </div>
            )}
            
            {weather.effects.powerMultiplier > 1 && (
              <div className="text-red-400 text-xs flex items-center justify-between">
                <span>🔥 Power Multiplier:</span>
                <span>x{weather.effects.powerMultiplier}</span>
              </div>
            )}
          </div>
        </Tooltip>
      )}
    </div>
  );
};