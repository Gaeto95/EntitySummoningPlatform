import React, { useState } from 'react';
import { RitualEvent, GameState } from '../types/game';
import { X } from 'lucide-react';

interface EventModalProps {
  event: RitualEvent | null;
  gameState: GameState;
  onChoice: (effect: (state: GameState) => GameState) => void;
  onClose: () => void;
}

export const EventModal: React.FC<EventModalProps> = ({
  event,
  gameState,
  onChoice,
  onClose,
}) => {
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);

  if (!event) return null;

  const getEventColor = (type: string) => {
    switch (type) {
      case 'blessing': return 'from-green-900 to-emerald-800 border-green-500';
      case 'complication': return 'from-red-900 to-orange-800 border-red-500';
      case 'visitor': return 'from-purple-900 to-indigo-800 border-purple-500';
      case 'cosmic': return 'from-blue-900 to-cyan-800 border-blue-500';
      default: return 'from-gray-900 to-gray-800 border-gray-500';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'blessing': return '✨';
      case 'complication': return '⚠️';
      case 'visitor': return '👤';
      case 'cosmic': return '🌌';
      default: return '❓';
    }
  };

  const handleChoice = (choiceIndex: number) => {
    if (event.choices && event.choices[choiceIndex]) {
      onChoice(event.choices[choiceIndex].effect);
    } else {
      onChoice(event.effect);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative max-w-2xl w-full">
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 z-10 p-2 bg-purple-900 rounded-full border border-purple-500 text-purple-300 hover:text-purple-100 hover:bg-purple-800 transition-all duration-300"
        >
          <X className="w-6 h-6" />
        </button>

        <div className={`bg-gradient-to-br ${getEventColor(event.type)} border-2 rounded-xl p-6 shadow-2xl`}>
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">{getEventIcon(event.type)}</div>
            <h2 className="text-3xl font-serif text-white mb-2">{event.name}</h2>
            <p className="text-purple-200 text-lg">{event.description}</p>
          </div>

          {event.choices ? (
            <div className="space-y-3">
              <div className="text-purple-300 text-center mb-4">Choose your response:</div>
              {event.choices.map((choice, index) => (
                <button
                  key={index}
                  onClick={() => handleChoice(index)}
                  className="w-full p-4 bg-black/30 border border-purple-500/50 rounded-lg text-purple-200 hover:bg-purple-900/30 hover:border-purple-400 transition-all duration-300 text-left"
                >
                  {choice.text}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center">
              <button
                onClick={() => handleChoice(0)}
                className="px-8 py-3 bg-gradient-to-r from-purple-800 to-purple-700 text-purple-100 font-serif uppercase tracking-wide rounded-lg border border-purple-500/50 hover:from-purple-700 hover:to-purple-600 transition-all duration-300"
              >
                Continue
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};