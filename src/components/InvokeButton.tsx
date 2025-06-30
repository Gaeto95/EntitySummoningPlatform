import React, { useState } from 'react';
import { playInvokeSound } from '../utils/audioPlayer';

interface InvokeButtonProps {
  onInvoke: () => void;
  disabled: boolean;
  isInvoking: boolean;
}

export const InvokeButton: React.FC<InvokeButtonProps> = ({ onInvoke, disabled, isInvoking }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleInvoke = () => {
    if (!disabled && !isInvoking) {
      playInvokeSound();
      onInvoke();
    }
  };

  return (
    <div className="relative flex justify-center">
      <button
        onClick={handleInvoke}
        disabled={disabled || isInvoking}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative group px-6 py-3 lg:px-8 lg:py-4 font-serif text-base lg:text-lg uppercase tracking-widest transition-all duration-500 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg border-2 overflow-hidden ${
          isInvoking
            ? 'bg-gradient-to-r from-red-900 to-orange-800 text-red-100 shadow-glow-red animate-pulse border-red-500'
            : isHovered && !disabled
            ? 'bg-gradient-to-r from-purple-800 to-red-700 text-purple-100 shadow-glow-purple border-purple-400'
            : disabled
            ? 'bg-gradient-to-r from-gray-800 to-gray-700 text-gray-400 border-gray-600'
            : 'bg-gradient-to-r from-purple-900 to-purple-700 text-purple-200 border-purple-500/50 hover:border-purple-400'
        } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {/* Animated background effect */}
        {isInvoking && (
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 via-orange-500/30 to-red-600/20 animate-pulse" />
        )}
        
        <div className="relative z-10 flex items-center justify-center space-x-2">
          <span className={`transition-all duration-300 ${isInvoking ? 'animate-spin' : ''}`}>
            {isInvoking ? '🌀' : '🔥'}
          </span>
          <span className="whitespace-nowrap">
            {isInvoking ? 'Invoking...' : 'Invoke Entity'}
          </span>
          <span className={`transition-all duration-300 ${isInvoking ? 'animate-spin' : ''}`}>
            {isInvoking ? '🌀' : '🔥'}
          </span>
        </div>
        
        {/* Enhanced flame effects - smaller */}
        {(isHovered || isInvoking) && !disabled && (
          <>
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
              <div className={`animate-bounce text-orange-400 text-xs ${isInvoking ? 'animate-pulse' : ''}`}>🔥</div>
            </div>
            <div className="absolute -top-1 left-1/3 transform -translate-x-1/2">
              <div className={`animate-bounce text-red-400 text-xs ${isInvoking ? 'animate-pulse' : ''}`} style={{ animationDelay: '0.2s' }}>🔥</div>
            </div>
            <div className="absolute -top-1 right-1/3 transform translate-x-1/2">
              <div className={`animate-bounce text-yellow-400 text-xs ${isInvoking ? 'animate-pulse' : ''}`} style={{ animationDelay: '0.4s' }}>🔥</div>
            </div>
            
            {/* Additional effects during invocation */}
            {isInvoking && (
              <>
                <div className="absolute -top-2 left-1/4 transform -translate-x-1/2">
                  <div className="animate-ping text-cyan-400 text-xs">✨</div>
                </div>
                <div className="absolute -top-2 right-1/4 transform translate-x-1/2">
                  <div className="animate-ping text-purple-400 text-xs" style={{ animationDelay: '0.3s' }}>✨</div>
                </div>
              </>
            )}
          </>
        )}

        {/* Enhanced pulsing ring effect when ready */}
        {!disabled && !isInvoking && (
          <div className="absolute inset-0 rounded-lg border-2 border-purple-400/0 group-hover:border-purple-400/50 transition-all duration-300 animate-pulse" />
        )}

        {/* Energy waves during invocation */}
        {isInvoking && (
          <>
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="absolute inset-0 border-2 border-red-400/20 rounded-lg animate-ping"
                style={{
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: '2s'
                }}
              />
            ))}
          </>
        )}
      </button>
    </div>
  );
};