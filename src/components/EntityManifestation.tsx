import React, { useEffect, useState } from 'react';
import { X, Crown, Skull, Eye, Flame } from 'lucide-react';
import { playManifestSound, playCollectSound, playSacrificeSound } from '../utils/audioPlayer';

interface Entity {
  name: string;
  type: 'demon' | 'divine' | 'ancient';
  personality: string;
  sigil: string;
  aura: string;
  power: number;
  domain: string;
  manifestationText: string;
  rarity: 'common' | 'rare' | 'legendary' | 'mythic';
  isShiny?: boolean;
}

interface EntityManifestationProps {
  entity: Entity | null;
  onClose: () => void;
  onCollect: (entity: Entity) => void;
  onSacrifice: (entity: Entity) => void;
  powerBoost: number;
}

export const EntityManifestation: React.FC<EntityManifestationProps> = ({
  entity,
  onClose,
  onCollect,
  onSacrifice,
  powerBoost,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    if (entity) {
      // Simplified manifestation sequence
      setIsVisible(true);
      
      // Show text after a short delay
      const textTimer = setTimeout(() => {
        setShowText(true);
      }, 500);
      
      // Play manifestation sound
      playManifestSound(entity.type);
      
      return () => clearTimeout(textTimer);
    } else {
      setIsVisible(false);
      setShowText(false);
    }
  }, [entity]);

  if (!entity) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'demon': return <Skull className="w-8 h-8" />;
      case 'divine': return <Crown className="w-8 h-8" />;
      case 'ancient': return <Eye className="w-8 h-8" />;
      default: return <Flame className="w-8 h-8" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'demon': return 'from-red-900 to-orange-800 border-red-500';
      case 'divine': return 'from-yellow-900 to-amber-800 border-yellow-500';
      case 'ancient': return 'from-green-900 to-teal-800 border-green-500';
      default: return 'from-purple-900 to-indigo-800 border-purple-500';
    }
  };

  const getTextColor = (type: string) => {
    switch (type) {
      case 'demon': return 'text-red-300';
      case 'divine': return 'text-yellow-300';
      case 'ancient': return 'text-green-300';
      default: return 'text-purple-300';
    }
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'mythic': return 'shadow-glow-rainbow animate-pulse';
      case 'legendary': return 'shadow-glow-yellow-intense animate-pulse';
      case 'rare': return 'shadow-glow-cyan-intense animate-pulse';
      default: return 'shadow-glow-purple-dim';
    }
  };

  const getVisualEffects = (type: string) => {
    switch (type) {
      case 'demon':
        return (
          <>
            {/* Enhanced fiery overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 via-orange-600/10 to-transparent animate-pulse rounded-xl" />
            {/* More floating embers */}
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-orange-400 rounded-full animate-float opacity-80"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${3 + Math.random() * 2}s`
                }}
              />
            ))}
          </>
        );
      case 'divine':
        return (
          <>
            {/* Enhanced shimmering light overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-300/15 via-white/8 to-transparent animate-pulse rounded-xl" />
            {/* More light particles */}
            {[...Array(16)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-yellow-300 rounded-full animate-ping opacity-60"
                style={{
                  left: `${10 + Math.random() * 80}%`,
                  top: `${10 + Math.random() * 80}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 1}s`
                }}
              />
            ))}
            {/* Enhanced radial glow */}
            <div className="absolute inset-0 bg-gradient-radial from-yellow-400/10 via-transparent to-transparent rounded-xl" />
          </>
        );
      case 'ancient':
        return (
          <>
            {/* Enhanced cosmic mist overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-600/15 via-teal-600/8 to-purple-600/8 animate-pulse rounded-xl" />
            {/* More swirling cosmic patterns */}
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 border border-green-400/40 rounded-full animate-spin-slow"
                style={{
                  left: `${25 + Math.random() * 50}%`,
                  top: `${25 + Math.random() * 50}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${8 + Math.random() * 4}s`
                }}
              />
            ))}
            {/* Enhanced ethereal wisps */}
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-8 h-1 bg-gradient-to-r from-transparent via-green-400/30 to-transparent animate-pulse"
                style={{
                  left: `${Math.random() * 80}%`,
                  top: `${Math.random() * 80}%`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                  animationDelay: `${Math.random() * 3}s`
                }}
              />
            ))}
          </>
        );
      default:
        return null;
    }
  };

  const handleCollect = () => {
    playCollectSound();
    onCollect(entity);
  };

  const handleSacrifice = () => {
    playSacrificeSound();
    onSacrifice(entity);
  };

  // Calculate boosted power
  const boostedPower = Math.min(100, entity.power + powerBoost);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Portal effect background */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-96 h-96 border-4 border-purple-500/30 rounded-full animate-spin-slow">
          <div className="absolute inset-4 border-4 border-cyan-500/40 rounded-full animate-spin" style={{ animationDirection: 'reverse' }}>
            <div className="absolute inset-4 border-4 border-yellow-500/50 rounded-full animate-ping" />
          </div>
        </div>
      </div>

      <div className={`relative max-w-4xl w-full transition-all duration-1000 transform ${isVisible ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 z-10 p-2 bg-purple-900 rounded-full border border-purple-500 text-purple-300 hover:text-purple-100 hover:bg-purple-800 transition-all duration-300"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Entity card with enhanced effects */}
        <div className={`relative bg-gradient-to-br ${getTypeColor(entity.type)} border-2 rounded-xl p-8 shadow-2xl overflow-hidden ${getRarityGlow(entity.rarity)}`}>
          {/* Visual effects overlay */}
          {getVisualEffects(entity.type)}
          
          {/* Shiny effect */}
          {entity.isShiny && (
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-transparent to-yellow-400/20 animate-pulse rounded-xl" />
          )}
          
          {/* Content */}
          <div className="relative z-10">
            {/* Header with enhanced animations */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-4 mb-4">
                <div className={`text-${entity.type === 'demon' ? 'red' : entity.type === 'divine' ? 'yellow' : 'green'}-400 animate-pulse`}>
                  {getTypeIcon(entity.type)}
                </div>
                <h2 className="text-4xl font-serif text-white drop-shadow-glow flex items-center space-x-2">
                  <span>{entity.name}</span>
                  {entity.isShiny && <span className="text-yellow-400 animate-ping">✨</span>}
                </h2>
                <div className={`text-${entity.type === 'demon' ? 'red' : entity.type === 'divine' ? 'yellow' : 'green'}-400 animate-pulse`}>
                  {getTypeIcon(entity.type)}
                </div>
              </div>
              <div className="text-lg text-purple-200 uppercase tracking-widest">
                {entity.type} Entity • {entity.rarity}
              </div>
              {powerBoost > 0 && (
                <div className="text-red-400 text-sm mt-2 animate-pulse">
                  ⚡ Empowered by Sacrifice (+{powerBoost}% Power)
                </div>
              )}
            </div>

            {/* Sigil with enhanced animation */}
            <div className="text-center mb-8">
              <div className="text-8xl mb-4 drop-shadow-glow animate-pulse scale-110">
                {entity.sigil}
              </div>
              <div className="text-purple-300 font-serif text-lg">
                {entity.aura}
              </div>
            </div>

            {/* Entity Speech with typewriter effect */}
            {showText && (
              <div className="mb-8 p-6 bg-black/40 rounded-lg border border-purple-500/30 transition-all duration-1000 opacity-100 translate-y-0">
                <div className="text-center mb-4">
                  <div className="text-purple-400 text-sm uppercase tracking-wide">The Entity Speaks:</div>
                </div>
                <div className={`${getTextColor(entity.type)} font-serif text-lg leading-relaxed text-center italic`}>
                  "{entity.manifestationText}"
                </div>
              </div>
            )}

            {/* Details */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-black/30 rounded-lg p-4 border border-purple-500/30">
                <div className="text-purple-400 text-sm uppercase tracking-wide mb-2">Personality</div>
                <div className="text-white font-serif">{entity.personality}</div>
              </div>
              <div className="bg-black/30 rounded-lg p-4 border border-purple-500/30">
                <div className="text-purple-400 text-sm uppercase tracking-wide mb-2">Domain</div>
                <div className="text-white font-serif">{entity.domain}</div>
              </div>
            </div>

            {/* Power level */}
            <div className="mb-8">
              <div className="text-purple-400 text-sm uppercase tracking-wide mb-2">Power Level</div>
              <div className="relative h-3 bg-black/50 rounded-full border border-purple-500/30">
                <div
                  className={`absolute h-full bg-gradient-to-r from-${entity.type === 'demon' ? 'red' : entity.type === 'divine' ? 'yellow' : 'green'}-600 to-${entity.type === 'demon' ? 'orange' : entity.type === 'divine' ? 'amber' : 'teal'}-500 rounded-full animate-pulse`}
                  style={{ width: `${boostedPower}%` }}
                />
              </div>
              <div className="text-right text-purple-300 text-sm mt-1">
                {boostedPower}/100
                {powerBoost > 0 && (
                  <span className="text-red-400 ml-2">(+{powerBoost})</span>
                )}
              </div>
            </div>

            {/* Actions with enhanced hover effects */}
            <div className="flex space-x-4">
              <button
                onClick={handleCollect}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-green-800 to-emerald-700 text-green-100 font-serif uppercase tracking-wide rounded-lg border border-green-500/50 hover:from-green-700 hover:to-emerald-600 transition-all duration-300 hover:scale-105 hover:shadow-glow-green hover:shadow-2xl"
              >
                ⚜ Collect Entity
              </button>
              <button
                onClick={handleSacrifice}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-red-800 to-orange-700 text-red-100 font-serif uppercase tracking-wide rounded-lg border border-red-500/50 hover:from-red-700 hover:to-orange-600 transition-all duration-300 hover:scale-105 hover:shadow-glow-red hover:shadow-2xl"
              >
                🔥 Sacrifice Entity
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};