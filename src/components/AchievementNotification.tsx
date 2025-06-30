import React, { useEffect, useState } from 'react';
import { Achievement } from '../types/game';
import { X } from 'lucide-react';

interface AchievementNotificationProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  achievement,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  if (!achievement) return null;

  return (
    <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
      isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
    }`}>
      <div className="bg-gradient-to-r from-yellow-900 to-amber-800 border-2 border-yellow-500 rounded-lg p-4 shadow-2xl max-w-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-3xl animate-bounce">{achievement.icon}</div>
            <div>
              <div className="text-yellow-200 font-serif text-lg">Achievement Unlocked!</div>
              <div className="text-yellow-100 font-bold">{achievement.name}</div>
              <div className="text-yellow-300 text-sm">{achievement.description}</div>
              {achievement.reward && (
                <div className="text-yellow-400 text-xs mt-1">
                  Reward: {achievement.reward.type === 'essence' ? `${achievement.reward.value} Essence` : 
                           achievement.reward.type === 'rune' ? `${achievement.reward.value} Rune` :
                           achievement.reward.type === 'power' ? `+${achievement.reward.value}% Power` :
                           'New Feature Unlocked'}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="text-yellow-400 hover:text-yellow-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};