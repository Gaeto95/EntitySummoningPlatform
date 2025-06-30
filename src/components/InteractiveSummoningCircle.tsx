import React, { useState, useRef, useEffect } from 'react';
import { Lock } from 'lucide-react';
import { playRuneSound, audioPlayer } from '../utils/audioPlayer';

interface InteractiveSummoningCircleProps {
  isInvoking: boolean;
  selectedRunes: string[];
  unlockedRunes: string[];
  onRuneSelect: (rune: string) => void;
  onRunePlacement: (rune: string, position: { x: number; y: number }) => void;
  weather: any;
}

const allRunes = [
  { name: 'rage', symbol: '⚡', description: 'Channel fury and passion', color: 'red', unlockRequirement: 'Available from start' },
  { name: 'truth', symbol: '☽', description: 'Seek ancient wisdom', color: 'blue', unlockRequirement: 'Available from start' },
  { name: 'chaos', symbol: '⚜', description: 'Embrace the unknown', color: 'purple', unlockRequirement: 'Available from start' },
  { name: 'submission', symbol: '⚖', description: 'Bow to greater powers', color: 'yellow', unlockRequirement: 'Available from start' },
  { name: 'death', symbol: '☠', description: 'Dance with mortality', color: 'gray', unlockRequirement: 'Summon 3 entities' },
  { name: 'war', symbol: '⚔', description: 'Summon conflict', color: 'orange', unlockRequirement: 'Summon 5 entities' },
  { name: 'fire', symbol: '🔥', description: 'Ignite primal forces', color: 'red', unlockRequirement: 'Sacrifice 2 entities' },
  { name: 'void', symbol: '❈', description: 'Embrace nothingness', color: 'indigo', unlockRequirement: 'Sacrifice 5 entities' },
];

export const InteractiveSummoningCircle: React.FC<InteractiveSummoningCircleProps> = ({ 
  isInvoking, 
  selectedRunes, 
  unlockedRunes,
  onRuneSelect,
  onRunePlacement,
  weather 
}) => {
  const [animationPhase, setAnimationPhase] = useState(0);
  const [hoveredRune, setHoveredRune] = useState<string | null>(null);
  const circleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize audio when component mounts
    audioPlayer.initializeSounds();
  }, []);

  // Enhanced animation sequence for invoking
  useEffect(() => {
    if (isInvoking) {
      const phases = [
        { phase: 1, delay: 0 },     // Initial glow
        { phase: 2, delay: 500 },   // Rune activation
        { phase: 3, delay: 1000 },  // Energy buildup
        { phase: 4, delay: 1500 },  // Reality tear
        { phase: 5, delay: 2000 },  // Portal opening
        { phase: 0, delay: 3000 }   // Reset
      ];

      phases.forEach(({ phase, delay }) => {
        setTimeout(() => setAnimationPhase(phase), delay);
      });
    } else {
      setAnimationPhase(0);
    }
  }, [isInvoking]);

  const handleRuneClick = (runeName: string, isUnlocked: boolean) => {
    if (!isUnlocked) {
      audioPlayer.playSound('parameter_change', 0.1);
      return;
    }

    const isCurrentlySelected = selectedRunes.includes(runeName);
    playRuneSound(!isCurrentlySelected);
    onRuneSelect(runeName);
  };

  const getWeatherEffect = () => {
    if (!weather) return '';
    
    switch (weather.type) {
      case 'stormy':
        return 'animate-pulse shadow-glow-purple';
      case 'mystical':
        return 'animate-pulse shadow-glow-green';
      case 'eclipse':
        return 'animate-pulse shadow-glow-red-intense';
      case 'aurora':
        return 'animate-pulse shadow-glow-blue';
      default:
        return '';
    }
  };

  const getAnimationClasses = () => {
    if (!isInvoking) return '';
    
    switch (animationPhase) {
      case 1: return 'animate-pulse shadow-glow-purple-intense';
      case 2: return 'animate-spin-slow shadow-glow-red-intense';
      case 3: return 'animate-bounce shadow-glow-yellow-intense';
      case 4: return 'animate-ping shadow-glow-cyan-intense';
      case 5: return 'animate-pulse shadow-glow-rainbow';
      default: return '';
    }
  };

  // Calculate positions for runes around the circle - pushed further out
  const getRunePosition = (index: number, total: number) => {
    const angle = (index * Math.PI * 2) / total - Math.PI / 2; // Start from top
    const radius = 140; // Increased distance from center
    const x = 50 + (radius * Math.cos(angle)) / 2.5; // Adjusted for more spacing
    const y = 50 + (radius * Math.sin(angle)) / 2.5;
    return { x, y };
  };

  return (
    <div className="relative w-80 h-80 lg:w-96 lg:h-96 mx-auto">
      {/* Main summoning circle */}
      <div 
        ref={circleRef}
        className={`absolute inset-8 rounded-full border-4 transition-all duration-1000 ${
          isInvoking 
            ? `border-red-500/80 ${getAnimationClasses()}` 
            : selectedRunes.length > 0 
              ? `border-purple-500/60 shadow-glow-purple ${getWeatherEffect()}`
              : 'border-purple-500/30'
        }`}
      >
        {/* Multiple concentric rings for enhanced effect */}
        <div className={`absolute inset-3 rounded-full border-2 transition-all duration-1000 ${
          isInvoking ? 'border-red-400/60 animate-spin' : 'border-purple-400/40'
        }`}>
          <div className={`absolute inset-3 rounded-full border transition-all duration-1000 ${
            isInvoking ? 'border-red-300/40 animate-pulse' : 'border-purple-300/20'
          }`} />
        </div>

        {/* Enhanced inner circle with portal effect */}
        <div className={`absolute inset-6 rounded-full bg-gradient-to-br border flex items-center justify-center transition-all duration-1000 overflow-hidden ${
          isInvoking 
            ? 'from-red-900/60 to-black/80 border-red-500/80 shadow-glow-red' 
            : selectedRunes.length > 0
              ? 'from-purple-900/40 to-black/60 border-purple-500/60 shadow-glow-purple'
              : 'from-purple-900/20 to-black/40 border-purple-500/40'
        }`}>
          {/* Portal effect when invoking */}
          {isInvoking && animationPhase >= 4 && (
            <div className="absolute inset-0 bg-gradient-radial from-transparent via-purple-500/20 to-black animate-spin-slow" />
          )}
          
          {/* Central symbol with enhanced effects */}
          <div className={`text-5xl lg:text-6xl transition-all duration-1000 relative z-10 ${
            isInvoking 
              ? 'text-red-400 animate-pulse scale-110 drop-shadow-glow-red' 
              : selectedRunes.length > 0
                ? 'text-purple-300 scale-105 drop-shadow-glow-purple animate-pulse'
                : 'text-purple-400 drop-shadow-glow-purple'
          }`}>
            {isInvoking ? (
              animationPhase >= 5 ? '🌀' : 
              animationPhase >= 3 ? '🔥' : 
              animationPhase >= 2 ? '⚡' : '🔥'
            ) : selectedRunes.length > 0 ? '⚡' : '❈'}
          </div>

          {/* Energy waves during invocation */}
          {isInvoking && (
            <>
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="absolute inset-0 border-2 border-red-400/30 rounded-full animate-ping"
                  style={{
                    animationDelay: `${i * 0.5}s`,
                    animationDuration: '2s'
                  }}
                />
              ))}
            </>
          )}
        </div>
      </div>

      {/* Runes positioned around the circle - further out */}
      {allRunes.map((rune, index) => {
        const position = getRunePosition(index, allRunes.length);
        const isSelected = selectedRunes.includes(rune.name);
        const isUnlocked = unlockedRunes.includes(rune.name);
        const isHovered = hoveredRune === rune.name;
        
        return (
          <div
            key={rune.name}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
            }}
          >
            {/* Rune container */}
            <div
              onClick={() => handleRuneClick(rune.name, isUnlocked)}
              onMouseEnter={() => setHoveredRune(rune.name)}
              onMouseLeave={() => setHoveredRune(null)}
              className={`relative w-12 h-12 lg:w-14 lg:h-14 border-2 rounded-full transition-all duration-300 cursor-pointer flex items-center justify-center ${
                !isUnlocked
                  ? 'border-gray-700/50 bg-black/50 cursor-not-allowed opacity-60'
                  : isSelected
                    ? 'border-purple-400 bg-purple-900/60 shadow-glow-purple scale-110 animate-pulse'
                    : isHovered
                      ? 'border-purple-500 bg-purple-900/40 shadow-glow-purple-dim scale-105'
                      : 'border-purple-700/50 bg-black/40 hover:border-purple-500 hover:bg-purple-900/30'
              } ${isInvoking && isSelected ? 'animate-bounce scale-125' : ''}`}
            >
              {/* Rune symbol */}
              <div className={`text-xl lg:text-2xl transition-all duration-300 ${
                !isUnlocked
                  ? 'text-gray-600'
                  : isSelected 
                    ? 'text-purple-200 drop-shadow-glow-purple scale-110' 
                    : isHovered
                      ? 'text-purple-300'
                      : 'text-purple-500'
              } ${isInvoking && isSelected ? 'animate-spin text-red-400' : ''}`}>
                {!isUnlocked ? (
                  <Lock className="w-4 h-4" />
                ) : (
                  rune.symbol
                )}
              </div>

              {/* Selection indicator */}
              {isSelected && isUnlocked && (
                <>
                  <div className="absolute inset-0 rounded-full border border-purple-400/50 animate-pulse" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-400 rounded-full animate-pulse" />
                </>
              )}

              {/* Locked overlay */}
              {!isUnlocked && (
                <div className="absolute inset-0 bg-black/60 rounded-full" />
              )}

              {/* Enhanced tooltip */}
              {isHovered && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 z-50">
                  <div className="bg-black/90 border border-purple-500/50 rounded-lg p-2 text-xs text-center whitespace-nowrap">
                    <div className="text-purple-300 font-semibold mb-1">{rune.name.toUpperCase()}</div>
                    <div className="text-purple-400 mb-1">{rune.description}</div>
                    {!isUnlocked ? (
                      <div className="text-red-400 text-xs">🔒 {rune.unlockRequirement}</div>
                    ) : (
                      <div className="text-green-400 text-xs">
                        {isSelected ? '✓ Selected • Click to deselect' : 'Click to select'}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Rune name label */}
              <div className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-2 text-xs font-serif uppercase tracking-wide transition-colors duration-300 ${
                !isUnlocked
                  ? 'text-gray-600'
                  : isSelected 
                    ? 'text-purple-200' 
                    : isHovered
                      ? 'text-purple-300'
                      : 'text-purple-500'
              }`}>
                {rune.name}
              </div>
            </div>

            {/* Connection lines to center when selected */}
            {isSelected && isUnlocked && (
              <div className="absolute inset-0 pointer-events-none">
                <div 
                  className={`absolute w-0.5 bg-gradient-to-r from-purple-500/60 to-transparent transition-all duration-500 ${
                    isInvoking ? 'from-red-500/80 animate-pulse' : ''
                  }`}
                  style={{
                    height: `${Math.sqrt((position.x - 50) ** 2 + (position.y - 50) ** 2) * 3}px`,
                    transformOrigin: 'top',
                    transform: `rotate(${Math.atan2(50 - position.y, 50 - position.x) * 180 / Math.PI + 90}deg)`,
                    left: '50%',
                    top: '50%'
                  }}
                />
              </div>
            )}
          </div>
        );
      })}

      {/* Enhanced weather particles */}
      {weather && weather.type !== 'clear' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`absolute text-base animate-float opacity-60 ${
                isInvoking ? 'animate-bounce' : ''
              }`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            >
              {weather.type === 'stormy' ? '⚡' : 
               weather.type === 'mystical' ? '🌫️' :
               weather.type === 'eclipse' ? '🌑' :
               weather.type === 'aurora' ? '🌌' : '✨'}
            </div>
          ))}
        </div>
      )}

      {/* Reality distortion effect during high-level invocation */}
      {isInvoking && animationPhase >= 4 && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-ping"
              style={{
                left: `${50 + 50 * Math.cos((i * Math.PI * 2) / 6)}%`,
                top: `${50 + 50 * Math.sin((i * Math.PI * 2) / 6)}%`,
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};