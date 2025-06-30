/*
  # Seed Data for Entity Summoning Platform

  1. Achievements
    - Insert all achievement definitions
  
  2. Quests
    - Insert quest templates
    
  3. Initial cosmetics and other reference data
*/

-- Insert achievements
INSERT INTO achievements (id, name, description, icon, reward) VALUES
('first_summon', 'First Contact', 'Summon your first entity', '🌟', '{"type": "essence", "value": 50}'),
('first_sacrifice', 'First Blood', 'Make your first sacrifice', '🔥', '{"type": "crystals", "value": 10}'),
('energy_master', 'Energy Master', 'Reach maximum energy capacity', '⚡', '{"type": "energy", "value": 5}'),
('daily_devotee', 'Daily Devotee', 'Maintain a 7-day login streak', '📅', '{"type": "crystals", "value": 25}'),
('streak_master', 'Streak Master', 'Achieve a 30-day login streak', '🔥', '{"type": "crystals", "value": 100}'),
('collector_10', 'Novice Collector', 'Collect 10 entities', '📚', '{"type": "essence", "value": 100}'),
('collector_50', 'Master Collector', 'Collect 50 entities', '🏆', '{"type": "feature", "value": "entity_fusion"}'),
('summoner_100', 'Legendary Summoner', 'Perform 100 summons', '⚡', '{"type": "crystals", "value": 50}'),
('streak_10', 'Ritual Master', 'Achieve a 10-summon streak', '🔮', '{"type": "crystals", "value": 25}'),
('rare_hunter', 'Rare Hunter', 'Collect 5 rare entities', '💎', '{"type": "essence", "value": 200}'),
('legendary_hunter', 'Legendary Hunter', 'Collect a legendary entity', '👑', '{"type": "crystals", "value": 30}'),
('shiny_hunter', 'Shiny Hunter', 'Collect a shiny entity', '✨', '{"type": "crystals", "value": 50}'),
('essence_master', 'Essence Master', 'Accumulate 1000 essence', '💰', '{"type": "feature", "value": "essence_shop"}'),
('crystal_collector', 'Crystal Collector', 'Accumulate 100 essence crystals', '💎', '{"type": "energy", "value": 10}'),
('vip_member', 'VIP Member', 'Purchase VIP membership', '👑', '{"type": "crystals", "value": 25}'),
('prestige_first', 'Ascension', 'Reach your first prestige level', '🌠', '{"type": "feature", "value": "prestige_bonuses"}')
ON CONFLICT (id) DO NOTHING;

-- Insert quest templates
INSERT INTO quests (id, name, description, type, category, icon, objectives, rewards, priority, difficulty) VALUES
('daily_summon_3', 'Daily Ritual', 'Perform 3 summoning rituals', 'daily', 'summoning', '🔮', 
 '[{"id": "summon_count", "description": "Summon 3 entities", "type": "summon", "target": 3, "current": 0, "isCompleted": false}]',
 '[{"type": "essence", "amount": 150, "icon": "💰", "description": "150 Essence"}, {"type": "battlepass_xp", "amount": 50, "icon": "⭐", "description": "50 Battle Pass XP"}]',
 'medium', 'easy'),

('daily_collect_2', 'Entity Collector', 'Collect 2 entities to your grimoire', 'daily', 'collection', '📚',
 '[{"id": "collect_count", "description": "Collect 2 entities", "type": "collect", "target": 2, "current": 0, "isCompleted": false}]',
 '[{"type": "crystals", "amount": 25, "icon": "💎", "description": "25 Essence Crystals"}, {"type": "energy", "amount": 5, "icon": "⚡", "description": "5 Energy"}]',
 'medium', 'easy'),

('daily_sacrifice_1', 'Power Seeker', 'Sacrifice 1 entity for power', 'daily', 'progression', '🔥',
 '[{"id": "sacrifice_count", "description": "Sacrifice 1 entity", "type": "sacrifice", "target": 1, "current": 0, "isCompleted": false}]',
 '[{"type": "essence", "amount": 100, "icon": "💰", "description": "100 Essence"}, {"type": "battlepass_xp", "amount": 30, "icon": "⭐", "description": "30 Battle Pass XP"}]',
 'low', 'easy'),

('weekly_rare_hunter', 'Rare Entity Hunter', 'Summon 5 rare or better entities', 'weekly', 'summoning', '💎',
 '[{"id": "rare_summon_count", "description": "Summon 5 rare+ entities", "type": "summon", "target": 5, "current": 0, "isCompleted": false, "conditions": {"entityRarity": "rare"}}]',
 '[{"type": "crystals", "amount": 100, "icon": "💎", "description": "100 Essence Crystals"}, {"type": "battlepass_xp", "amount": 200, "icon": "⭐", "description": "200 Battle Pass XP"}, {"type": "cosmetic", "amount": 1, "icon": "🎨", "description": "Random Cosmetic"}]',
 'high', 'medium'),

('weekly_demon_master', 'Demon Master', 'Collect 10 demon entities', 'weekly', 'collection', '👹',
 '[{"id": "demon_collect_count", "description": "Collect 10 demon entities", "type": "collect", "target": 10, "current": 0, "isCompleted": false, "conditions": {"entityType": "demon"}}]',
 '[{"type": "essence", "amount": 500, "icon": "💰", "description": "500 Essence"}, {"type": "battlepass_xp", "amount": 150, "icon": "⭐", "description": "150 Battle Pass XP"}, {"type": "rune", "amount": 1, "icon": "⚜️", "description": "Demon Rune Unlock"}]',
 'high', 'medium'),

('story_first_steps', 'First Steps into Darkness', 'Complete your first summoning ritual', 'story', 'progression', '🌟',
 '[{"id": "first_summon", "description": "Perform your first summon", "type": "summon", "target": 1, "current": 0, "isCompleted": false}]',
 '[{"type": "essence", "amount": 200, "icon": "💰", "description": "200 Essence"}, {"type": "crystals", "amount": 50, "icon": "💎", "description": "50 Essence Crystals"}, {"type": "battlepass_xp", "amount": 100, "icon": "⭐", "description": "100 Battle Pass XP"}]',
 'high', 'easy'),

('story_grimoire_keeper', 'Grimoire Keeper', 'Build a collection of 25 entities', 'story', 'collection', '📖',
 '[{"id": "collection_size", "description": "Collect 25 entities", "type": "collect", "target": 25, "current": 0, "isCompleted": false}]',
 '[{"type": "essence", "amount": 1000, "icon": "💰", "description": "1000 Essence"}, {"type": "crystals", "amount": 100, "icon": "💎", "description": "100 Essence Crystals"}, {"type": "cosmetic", "amount": 1, "icon": "🎨", "description": "Legendary Cosmetic"}]',
 'high', 'medium'),

('achievement_streak_master', 'Streak Master', 'Maintain a 7-day login streak', 'achievement', 'progression', '🔥',
 '[{"id": "login_streak", "description": "Login for 7 consecutive days", "type": "login", "target": 7, "current": 0, "isCompleted": false, "conditions": {"consecutive": true}}]',
 '[{"type": "crystals", "amount": 150, "icon": "💎", "description": "150 Essence Crystals"}, {"type": "vip_time", "amount": 3, "icon": "👑", "description": "3 Days VIP"}, {"type": "battlepass_xp", "amount": 300, "icon": "⭐", "description": "300 Battle Pass XP"}]',
 'medium', 'medium')
ON CONFLICT (id) DO NOTHING;