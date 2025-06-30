import React, { useEffect, useState } from 'react';
import { Quest } from '../types/game';
import { X, CheckCircle, Gift } from 'lucide-react';

interface QuestNotificationProps {
  quest: Quest | null;
  type: 'completed' | 'progress' | 'new';
  onClose: () => void;
}

export const QuestNotification: React.FC<QuestNotificationProps> = ({
  quest,
  type,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (quest) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [quest, onClose]);

  if (!quest) return null;

  const getNotificationStyle = () => {
    switch (type) {
      case 'completed':
        return 'from-green-900 to-emerald-800 border-green-500';
      case 'progress':
        return 'from-blue-900 to-cyan-800 border-blue-500';
      case 'new':
        return 'from-purple-900 to-indigo-800 border-purple-500';
      default:
        return 'from-gray-900 to-gray-800 border-gray-500';
    }
  };

  const getNotificationIcon = () => {
    switch (type) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-400" />;
      case 'progress':
        return <div className="text-2xl">{quest.icon}</div>;
      case 'new':
        return <Gift className="w-6 h-6 text-purple-400" />;
      default:
        return <div className="text-2xl">{quest.icon}</div>;
    }
  };

  const getNotificationTitle = () => {
    switch (type) {
      case 'completed':
        return 'Quest Completed!';
      case 'progress':
        return 'Quest Progress';
      case 'new':
        return 'New Quest Available!';
      default:
        return 'Quest Update';
    }
  };

  return (
    <div className={`fixed top-20 right-6 z-50 transition-all duration-300 transform ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className={`bg-gradient-to-r ${getNotificationStyle()} border-2 rounded-lg p-4 shadow-2xl max-w-sm min-w-[300px]`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            {getNotificationIcon()}
            <div>
              <div className="text-white font-serif text-sm font-bold">{getNotificationTitle()}</div>
              <div className="text-gray-200 text-xs">{quest.name}</div>
            </div>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="text-gray-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="text-gray-300 text-xs mb-3">
          {quest.description}
        </div>

        {type === 'completed' && quest.rewards && (
          <div className="flex flex-wrap gap-1">
            {quest.rewards.map((reward, index) => (
              <div key={index} className="flex items-center space-x-1 bg-black/30 rounded px-2 py-1 text-xs">
                <span>{reward.icon}</span>
                <span className="text-yellow-400 font-bold">{reward.amount}</span>
              </div>
            ))}
          </div>
        )}

        {type === 'progress' && (
          <div className="text-xs text-gray-400">
            Check your Quest Journal for details
          </div>
        )}
      </div>
    </div>
  );
};