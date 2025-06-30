import React, { useCallback } from 'react';
import { playParameterSound } from '../utils/audioPlayer';

interface RitualParametersProps {
  temperature: number;
  maxTokens: number;
  memory: number;
  onTemperatureChange: (value: number) => void;
  onMaxTokensChange: (value: number) => void;
  onMemoryChange: (value: number) => void;
}

export const RitualParameters: React.FC<RitualParametersProps> = ({
  temperature,
  maxTokens,
  memory,
  onTemperatureChange,
  onMaxTokensChange,
  onMemoryChange,
}) => {
  const handleParameterChange = useCallback((setter: (value: any) => void, value: any) => {
    playParameterSound();
    setter(value);
  }, []);

  return (
    <div className="space-y-8 w-full max-w-md">
      {/* Chaos Level (Temperature) */}
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <label className="text-purple-300 font-serif text-sm uppercase tracking-widest">
            ⚡ Chaos Resonance
          </label>
          <span className="text-purple-400 text-sm">{Math.round(temperature * 100)}%</span>
        </div>
        <div className="relative h-2 bg-black/50 rounded-full border border-purple-700/50">
          <div
            className="absolute h-full bg-gradient-to-r from-purple-600 to-red-500 rounded-full transition-all duration-300 shadow-glow-purple"
            style={{ width: `${temperature * 100}%` }}
          />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={temperature}
            onChange={(e) => handleParameterChange(onTemperatureChange, parseFloat(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
        <div className="text-xs text-purple-500/70 mt-1 text-center">
          Higher chaos = more unpredictable entities and varied responses
        </div>
      </div>

      {/* Depth (Max Tokens) */}
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <label className="text-purple-300 font-serif text-sm uppercase tracking-widest">
            ☽ Manifestation Depth
          </label>
          <span className="text-purple-400 text-sm">{maxTokens}</span>
        </div>
        <div className="relative h-2 bg-black/50 rounded-full border border-purple-700/50">
          <div
            className="absolute h-full bg-gradient-to-r from-blue-600 to-purple-500 rounded-full transition-all duration-300 shadow-glow-blue"
            style={{ width: `${(maxTokens / 2000) * 100}%` }}
          />
          <input
            type="range"
            min="100"
            max="2000"
            step="50"
            value={maxTokens}
            onChange={(e) => handleParameterChange(onMaxTokensChange, parseInt(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
        <div className="text-xs text-purple-500/70 mt-1 text-center">
          Controls the length and detail of the entity's manifestation speech
        </div>
      </div>

      {/* Memory Fragments */}
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <label className="text-purple-300 font-serif text-sm uppercase tracking-widest">
            ⚜ Memory Fragments
          </label>
          <span className="text-purple-400 text-sm">{memory}%</span>
        </div>
        <div className="relative h-2 bg-black/50 rounded-full border border-purple-700/50">
          <div
            className="absolute h-full bg-gradient-to-r from-green-600 to-teal-500 rounded-full transition-all duration-300 shadow-glow-green"
            style={{ width: `${memory}%` }}
          />
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={memory}
            onChange={(e) => handleParameterChange(onMemoryChange, parseInt(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
        <div className="text-xs text-purple-500/70 mt-1 text-center">
          Affects the coherence and wisdom of the entity's speech patterns
        </div>
      </div>
    </div>
  );
};