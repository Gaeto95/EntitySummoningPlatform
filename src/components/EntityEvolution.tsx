import React from 'react';
import { Entity } from '../types/game';
import { canEntityEvolve } from '../utils/entityGenerator';
import { ArrowUp, Star } from 'lucide-react';

interface EntityEvolutionProps {
  entity: Entity;
  onEvolve: (entity: Entity) => void;
}

export const EntityEvolution: React.FC<EntityEvolutionProps> = ({ entity, onEvolve }) => {
  const canEvolve = canEntityEvolve(entity);
  const requiredExp = entity.level * 100;
  const progressPercent = (entity.experience / requiredExp) * 100;

  return (
    <div className="bg-black/30 rounded-lg p-4 border border-purple-500/30">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Star className="w-5 h-5 text-yellow-400" />
          <span className="text-purple-300 font-serif">Level {entity.level}</span>
        </div>
        {canEvolve && (
          <button
            onClick={() => onEvolve(entity)}
            className="flex items-center space-x-1 px-3 py-1 bg-gradient-to-r from-yellow-800 to-amber-700 text-yellow-100 rounded-lg border border-yellow-500/50 hover:from-yellow-700 hover:to-amber-600 transition-all duration-300 hover:scale-105"
          >
            <ArrowUp className="w-4 h-4" />
            <span className="text-sm font-serif">Evolve</span>
          </button>
        )}
      </div>

      <div className="mb-2">
        <div className="flex justify-between text-xs text-purple-400 mb-1">
          <span>Experience</span>
          <span>{entity.experience}/{requiredExp}</span>
        </div>
        <div className="h-2 bg-black/50 rounded-full border border-purple-500/30">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, progressPercent)}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-purple-400">Loyalty:</span>
          <span className="text-purple-200 ml-1">{entity.loyalty}%</span>
        </div>
        <div>
          <span className="text-purple-400">Abilities:</span>
          <span className="text-purple-200 ml-1">{entity.abilities.length}</span>
        </div>
      </div>

      {canEvolve && (
        <div className="mt-2 text-xs text-yellow-400 text-center animate-pulse">
          Ready to evolve! ✨
        </div>
      )}
    </div>
  );
};