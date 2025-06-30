import React, { useState } from 'react';
import { GameState, Quest, QuestObjective } from '../types/game';
import { getActiveQuests, getQuestProgress, canClaimQuest } from '../utils/questSystem';
import { X, Target, Clock, Star, Gift, CheckCircle, Circle, Trophy, Calendar, BookOpen, Award } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface QuestPanelProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  onClaimReward: (questId: string) => void;
}

export const QuestPanel: React.FC<QuestPanelProps> = ({
  isOpen,
  onClose,
  gameState,
  onClaimReward,
}) => {
  const [selectedTab, setSelectedTab] = useState<'active' | 'completed'>('active');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'daily' | 'weekly' | 'story' | 'achievement'>('all');

  if (!isOpen) return null;

  const activeQuests = getActiveQuests(gameState);
  const filteredQuests = activeQuests.filter(quest => 
    selectedCategory === 'all' || quest.type === selectedCategory
  );

  const getQuestTypeIcon = (type: Quest['type']) => {
    switch (type) {
      case 'daily': return <Calendar className="w-4 h-4" />;
      case 'weekly': return <Clock className="w-4 h-4" />;
      case 'story': return <BookOpen className="w-4 h-4" />;
      case 'achievement': return <Award className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getQuestTypeColor = (type: Quest['type']) => {
    switch (type) {
      case 'daily': return 'text-green-400 border-green-500/50 bg-green-900/20';
      case 'weekly': return 'text-blue-400 border-blue-500/50 bg-blue-900/20';
      case 'story': return 'text-purple-400 border-purple-500/50 bg-purple-900/20';
      case 'achievement': return 'text-yellow-400 border-yellow-500/50 bg-yellow-900/20';
      default: return 'text-gray-400 border-gray-500/50 bg-gray-900/20';
    }
  };

  const getPriorityColor = (priority: Quest['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getDifficultyStars = (difficulty: Quest['difficulty']) => {
    const stars = {
      easy: 1,
      medium: 2,
      hard: 3,
      expert: 4
    };
    return stars[difficulty] || 1;
  };

  const renderObjectiveProgress = (objective: QuestObjective) => {
    const progressPercent = Math.min(100, (objective.current / objective.target) * 100);
    
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            {objective.isCompleted ? (
              <CheckCircle className="w-4 h-4 text-green-400" />
            ) : (
              <Circle className="w-4 h-4 text-purple-400" />
            )}
            <span className={objective.isCompleted ? 'text-green-300' : 'text-purple-300'}>
              {objective.description}
            </span>
          </div>
          <span className={`text-xs font-bold ${objective.isCompleted ? 'text-green-400' : 'text-purple-400'}`}>
            {objective.current}/{objective.target}
          </span>
        </div>
        
        <div className="h-2 bg-black/50 rounded-full border border-purple-500/30 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              objective.isCompleted 
                ? 'bg-gradient-to-r from-green-600 to-emerald-500' 
                : 'bg-gradient-to-r from-purple-600 to-blue-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    );
  };

  const renderRewards = (quest: Quest) => {
    return (
      <div className="flex flex-wrap gap-2">
        {quest.rewards.map((reward, index) => (
          <Tooltip key={index} content={reward.description}>
            <div className="flex items-center space-x-1 bg-black/30 rounded px-2 py-1 text-xs">
              <span>{reward.icon}</span>
              <span className="text-yellow-400 font-bold">{reward.amount}</span>
            </div>
          </Tooltip>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative max-w-6xl w-full max-h-[90vh] bg-gradient-to-br from-purple-900/95 to-black/95 border-2 border-purple-500/50 rounded-xl shadow-2xl overflow-hidden">
        {/* Fixed Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-purple-900/80 backdrop-blur-sm rounded-full border border-purple-500 text-purple-300 hover:text-purple-100 hover:bg-purple-800 transition-all duration-300 hover:scale-110"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[90vh] p-6">
          {/* Header */}
          <div className="text-center mb-6 pr-16">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Target className="w-8 h-8 text-purple-400" />
              <h2 className="text-3xl font-serif text-purple-200">Quest Journal</h2>
              <Target className="w-8 h-8 text-purple-400" />
            </div>
            
            {/* Quest Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-black/30 rounded-lg p-3 border border-purple-500/30">
                <div className="text-purple-400 text-xs">Total Completed</div>
                <div className="text-purple-200 text-xl font-bold">{gameState.questStats?.totalCompleted || 0}</div>
              </div>
              <div className="bg-black/30 rounded-lg p-3 border border-green-500/30">
                <div className="text-green-400 text-xs">Daily Completed</div>
                <div className="text-green-200 text-xl font-bold">{gameState.questStats?.dailyCompleted || 0}</div>
              </div>
              <div className="bg-black/30 rounded-lg p-3 border border-blue-500/30">
                <div className="text-blue-400 text-xs">Weekly Completed</div>
                <div className="text-blue-200 text-xl font-bold">{gameState.questStats?.weeklyCompleted || 0}</div>
              </div>
              <div className="bg-black/30 rounded-lg p-3 border border-yellow-500/30">
                <div className="text-yellow-400 text-xs">Story Completed</div>
                <div className="text-yellow-200 text-xl font-bold">{gameState.questStats?.storyCompleted || 0}</div>
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6 justify-center">
            {[
              { id: 'all', name: 'All Quests', icon: Target },
              { id: 'daily', name: 'Daily', icon: Calendar },
              { id: 'weekly', name: 'Weekly', icon: Clock },
              { id: 'story', name: 'Story', icon: BookOpen },
              { id: 'achievement', name: 'Achievement', icon: Award }
            ].map((category) => {
              const IconComponent = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-300 ${
                    selectedCategory === category.id
                      ? 'border-purple-500 bg-purple-900/50 text-purple-200'
                      : 'border-purple-500/30 bg-black/30 text-purple-400 hover:border-purple-400/50'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="text-sm font-serif">{category.name}</span>
                </button>
              );
            })}
          </div>

          {/* Quest List */}
          <div className="space-y-4">
            {filteredQuests.length === 0 ? (
              <div className="text-center py-12 text-purple-500">
                <div className="text-4xl mb-4">📋</div>
                <div className="font-serif text-lg">No active quests in this category</div>
                <div className="text-sm mt-2">Complete current quests to unlock new ones!</div>
              </div>
            ) : (
              filteredQuests.map((quest) => {
                const progress = getQuestProgress(gameState, quest.id);
                const isCompleted = progress.every(obj => obj.isCompleted);
                const canClaim = canClaimQuest(gameState, quest.id);
                
                return (
                  <div
                    key={quest.id}
                    className={`p-6 rounded-lg border-2 transition-all duration-300 ${
                      isCompleted
                        ? 'border-green-500/50 bg-gradient-to-r from-green-900/20 to-emerald-800/20'
                        : 'border-purple-500/30 bg-black/30 hover:border-purple-400/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        {/* Quest Icon */}
                        <div className="text-4xl">{quest.icon}</div>
                        
                        {/* Quest Info */}
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-serif text-purple-200">{quest.name}</h3>
                            
                            {/* Quest Type Badge */}
                            <div className={`flex items-center space-x-1 px-2 py-1 rounded text-xs border ${getQuestTypeColor(quest.type)}`}>
                              {getQuestTypeIcon(quest.type)}
                              <span className="uppercase font-bold">{quest.type}</span>
                            </div>
                            
                            {/* Priority Indicator */}
                            <div className={`text-xs font-bold uppercase ${getPriorityColor(quest.priority)}`}>
                              {quest.priority}
                            </div>
                          </div>
                          
                          <p className="text-purple-400 text-sm mb-3">{quest.description}</p>
                          
                          {/* Difficulty Stars */}
                          <div className="flex items-center space-x-1 mb-3">
                            <span className="text-xs text-purple-400">Difficulty:</span>
                            {[...Array(4)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < getDifficultyStars(quest.difficulty)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-600'
                                }`}
                              />
                            ))}
                          </div>
                          
                          {/* Objectives */}
                          <div className="space-y-3 mb-4">
                            {progress.map((objective, index) => (
                              <div key={index}>
                                {renderObjectiveProgress(objective)}
                              </div>
                            ))}
                          </div>
                          
                          {/* Rewards */}
                          <div className="mb-4">
                            <div className="text-sm text-purple-400 mb-2">Rewards:</div>
                            {renderRewards(quest)}
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Button */}
                      <div className="ml-4">
                        {isCompleted ? (
                          canClaim ? (
                            <button
                              onClick={() => onClaimReward(quest.id)}
                              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-800 to-emerald-700 text-green-100 rounded-lg border border-green-500/50 hover:from-green-700 hover:to-emerald-600 transition-all duration-300 hover:scale-105"
                            >
                              <Gift className="w-4 h-4" />
                              <span className="text-sm font-serif">Claim</span>
                            </button>
                          ) : (
                            <div className="flex items-center space-x-2 px-4 py-2 bg-green-800/50 text-green-300 rounded-lg border border-green-500/30">
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-sm font-serif">Completed</span>
                            </div>
                          )
                        ) : (
                          <div className="flex items-center space-x-2 px-4 py-2 bg-purple-800/50 text-purple-300 rounded-lg border border-purple-500/30">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm font-serif">In Progress</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Progress Summary */}
                    <div className="flex items-center justify-between text-xs text-purple-500">
                      <span>
                        {progress.filter(obj => obj.isCompleted).length}/{progress.length} objectives completed
                      </span>
                      {quest.expiresAt && (
                        <span>
                          Expires: {new Date(quest.expiresAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};