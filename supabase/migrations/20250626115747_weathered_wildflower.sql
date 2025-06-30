/*
  # Initial Database Schema for Entity Summoning Platform

  1. New Tables
    - `profiles` - User profiles and basic information
    - `game_states` - Core game progression data
    - `entities` - Player's collected entities
    - `quests` - Quest system with progress tracking
    - `achievements` - Achievement progress and unlocks
    - `guilds` - Guild information and settings
    - `guild_members` - Guild membership data
    - `trades` - Entity trading system
    - `leaderboards` - Various ranking systems
    - `friends` - Friend relationships
    - `chat_messages` - In-game messaging
    - `gacha_history` - Pull history and pity tracking
    - `energy_transactions` - Energy usage logging
    - `cosmetic_unlocks` - Cosmetic ownership
    - `battle_pass_progress` - Battle pass tracking

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Add policies for public read access where appropriate
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  username text UNIQUE,
  display_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_seen timestamptz DEFAULT now(),
  is_online boolean DEFAULT false,
  preferences jsonb DEFAULT '{}'::jsonb
);

-- Game states table
CREATE TABLE IF NOT EXISTS game_states (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  total_summons integer DEFAULT 0,
  total_sacrifices integer DEFAULT 0,
  total_essence integer DEFAULT 0,
  current_streak integer DEFAULT 0,
  best_streak integer DEFAULT 0,
  prestige_level integer DEFAULT 0,
  unlocked_features text[] DEFAULT '{}',
  last_play_date timestamptz DEFAULT now(),
  playtime integer DEFAULT 0,
  current_energy integer DEFAULT 10,
  max_energy integer DEFAULT 10,
  last_energy_update timestamptz DEFAULT now(),
  energy_regen_rate integer DEFAULT 60,
  essence_crystals integer DEFAULT 500,
  vip_level integer DEFAULT 0,
  vip_expiry timestamptz,
  login_streak integer DEFAULT 0,
  last_login_date text DEFAULT '',
  daily_rewards_claimed boolean DEFAULT false,
  battle_pass_level integer DEFAULT 1,
  battle_pass_xp integer DEFAULT 0,
  battle_pass_season integer DEFAULT 1,
  battle_pass_premium boolean DEFAULT false,
  battle_pass_rewards_claimed integer[] DEFAULT '{}',
  pity_counter integer DEFAULT 0,
  guaranteed_legendary_counter integer DEFAULT 0,
  banner_pulls jsonb DEFAULT '{}'::jsonb,
  grimoire_slots integer DEFAULT 50,
  max_grimoire_slots integer DEFAULT 50,
  unlocked_cosmetics text[] DEFAULT '{}',
  equipped_cosmetics jsonb DEFAULT '{"circleTheme": "default", "particleEffect": "default", "uiTheme": "default", "summonAnimation": "default"}'::jsonb,
  active_quests text[] DEFAULT '{}',
  completed_quests text[] DEFAULT '{}',
  quest_progress jsonb DEFAULT '{}'::jsonb,
  last_quest_refresh text DEFAULT '',
  quest_stats jsonb DEFAULT '{"totalCompleted": 0, "dailyCompleted": 0, "weeklyCompleted": 0, "storyCompleted": 0}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Entities table
CREATE TABLE IF NOT EXISTS entities (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  entity_id text NOT NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('demon', 'divine', 'ancient')),
  rarity text NOT NULL CHECK (rarity IN ('common', 'rare', 'legendary', 'mythic')),
  personality text NOT NULL,
  sigil text NOT NULL,
  aura text NOT NULL,
  power integer NOT NULL CHECK (power >= 0 AND power <= 100),
  domain text NOT NULL,
  manifestation_text text NOT NULL,
  level integer DEFAULT 1,
  experience integer DEFAULT 0,
  abilities text[] DEFAULT '{}',
  collected_at timestamptz DEFAULT now(),
  is_shiny boolean DEFAULT false,
  dialogue text[] DEFAULT '{}',
  mood text DEFAULT 'neutral' CHECK (mood IN ('content', 'angry', 'pleased', 'neutral')),
  loyalty integer DEFAULT 50,
  skin_id text,
  particle_effect text,
  summon_animation text,
  created_at timestamptz DEFAULT now()
);

-- Quests table
CREATE TABLE IF NOT EXISTS quests (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  type text NOT NULL CHECK (type IN ('daily', 'weekly', 'story', 'achievement')),
  category text NOT NULL CHECK (category IN ('summoning', 'collection', 'progression', 'social', 'exploration')),
  icon text NOT NULL,
  objectives jsonb NOT NULL,
  rewards jsonb NOT NULL,
  is_active boolean DEFAULT true,
  unlock_requirement text,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  difficulty text DEFAULT 'easy' CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  reward jsonb,
  created_at timestamptz DEFAULT now()
);

-- User achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_id text REFERENCES achievements(id) NOT NULL,
  unlocked boolean DEFAULT false,
  unlocked_at timestamptz,
  progress jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Guilds table
CREATE TABLE IF NOT EXISTS guilds (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text UNIQUE NOT NULL,
  description text,
  icon text,
  owner_id uuid REFERENCES auth.users(id) NOT NULL,
  max_members integer DEFAULT 50,
  is_public boolean DEFAULT true,
  requirements jsonb DEFAULT '{}'::jsonb,
  stats jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Guild members table
CREATE TABLE IF NOT EXISTS guild_members (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  guild_id uuid REFERENCES guilds(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at timestamptz DEFAULT now(),
  contribution_points integer DEFAULT 0,
  UNIQUE(guild_id, user_id)
);

-- Trades table
CREATE TABLE IF NOT EXISTS trades (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  initiator_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipient_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  initiator_entities uuid[] DEFAULT '{}',
  recipient_entities uuid[] DEFAULT '{}',
  initiator_essence integer DEFAULT 0,
  recipient_essence integer DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
  expires_at timestamptz DEFAULT (now() + interval '24 hours'),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Leaderboards table
CREATE TABLE IF NOT EXISTS leaderboards (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  leaderboard_type text NOT NULL,
  score bigint NOT NULL,
  rank integer,
  season text,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, leaderboard_type, season)
);

-- Friends table
CREATE TABLE IF NOT EXISTS friends (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  friend_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  channel_type text NOT NULL CHECK (channel_type IN ('global', 'guild', 'private')),
  channel_id uuid,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Gacha history table
CREATE TABLE IF NOT EXISTS gacha_history (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  banner_id text NOT NULL,
  pull_count integer NOT NULL,
  cost integer NOT NULL,
  currency text NOT NULL CHECK (currency IN ('essence', 'crystals')),
  entities_received uuid[] DEFAULT '{}',
  pity_counter_before integer DEFAULT 0,
  pity_counter_after integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Energy transactions table
CREATE TABLE IF NOT EXISTS energy_transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('consume', 'refill', 'regen', 'bonus')),
  amount integer NOT NULL,
  energy_before integer NOT NULL,
  energy_after integer NOT NULL,
  source text,
  created_at timestamptz DEFAULT now()
);

-- Cosmetic unlocks table
CREATE TABLE IF NOT EXISTS cosmetic_unlocks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  cosmetic_id text NOT NULL,
  unlocked_at timestamptz DEFAULT now(),
  source text,
  UNIQUE(user_id, cosmetic_id)
);

-- Battle pass progress table
CREATE TABLE IF NOT EXISTS battle_pass_progress (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  season integer NOT NULL,
  level integer DEFAULT 1,
  xp integer DEFAULT 0,
  premium boolean DEFAULT false,
  rewards_claimed integer[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, season)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE guilds ENABLE ROW LEVEL SECURITY;
ALTER TABLE guild_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE gacha_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE energy_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cosmetic_unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_pass_progress ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Game states policies
CREATE POLICY "Users can read own game state"
  ON game_states
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own game state"
  ON game_states
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own game state"
  ON game_states
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Entities policies
CREATE POLICY "Users can read own entities"
  ON entities
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own entities"
  ON entities
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entities"
  ON entities
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own entities"
  ON entities
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Quests policies (public read)
CREATE POLICY "Anyone can read quests"
  ON quests
  FOR SELECT
  TO authenticated
  USING (true);

-- Achievements policies (public read)
CREATE POLICY "Anyone can read achievements"
  ON achievements
  FOR SELECT
  TO authenticated
  USING (true);

-- User achievements policies
CREATE POLICY "Users can read own achievements"
  ON user_achievements
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON user_achievements
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own achievements"
  ON user_achievements
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Guild policies
CREATE POLICY "Anyone can read public guilds"
  ON guilds
  FOR SELECT
  TO authenticated
  USING (is_public = true);

CREATE POLICY "Guild owners can update their guilds"
  ON guilds
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Authenticated users can create guilds"
  ON guilds
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

-- Guild members policies
CREATE POLICY "Guild members can read guild membership"
  ON guild_members
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    guild_id IN (SELECT guild_id FROM guild_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can join guilds"
  ON guild_members
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Guild admins can manage members"
  ON guild_members
  FOR UPDATE
  TO authenticated
  USING (
    guild_id IN (
      SELECT guild_id FROM guild_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Trades policies
CREATE POLICY "Users can read their trades"
  ON trades
  FOR SELECT
  TO authenticated
  USING (auth.uid() = initiator_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can create trades"
  ON trades
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = initiator_id);

CREATE POLICY "Trade participants can update trades"
  ON trades
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = initiator_id OR auth.uid() = recipient_id);

-- Leaderboards policies (public read)
CREATE POLICY "Anyone can read leaderboards"
  ON leaderboards
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own leaderboard entries"
  ON leaderboards
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Friends policies
CREATE POLICY "Users can read their friends"
  ON friends
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can manage their friendships"
  ON friends
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Chat messages policies
CREATE POLICY "Users can read chat messages"
  ON chat_messages
  FOR SELECT
  TO authenticated
  USING (
    channel_type = 'global' OR
    (channel_type = 'guild' AND channel_id IN (
      SELECT guild_id FROM guild_members WHERE user_id = auth.uid()
    )) OR
    (channel_type = 'private' AND (sender_id = auth.uid() OR channel_id = auth.uid()))
  );

CREATE POLICY "Users can send chat messages"
  ON chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- Gacha history policies
CREATE POLICY "Users can read own gacha history"
  ON gacha_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gacha history"
  ON gacha_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Energy transactions policies
CREATE POLICY "Users can read own energy transactions"
  ON energy_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own energy transactions"
  ON energy_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Cosmetic unlocks policies
CREATE POLICY "Users can read own cosmetic unlocks"
  ON cosmetic_unlocks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cosmetic unlocks"
  ON cosmetic_unlocks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Battle pass progress policies
CREATE POLICY "Users can read own battle pass progress"
  ON battle_pass_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own battle pass progress"
  ON battle_pass_progress
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_game_states_user_id ON game_states(user_id);
CREATE INDEX IF NOT EXISTS idx_entities_user_id ON entities(user_id);
CREATE INDEX IF NOT EXISTS idx_entities_rarity ON entities(rarity);
CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(type);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_guild_members_guild_id ON guild_members(guild_id);
CREATE INDEX IF NOT EXISTS idx_guild_members_user_id ON guild_members(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_initiator_id ON trades(initiator_id);
CREATE INDEX IF NOT EXISTS idx_trades_recipient_id ON trades(recipient_id);
CREATE INDEX IF NOT EXISTS idx_leaderboards_type_season ON leaderboards(leaderboard_type, season);
CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_channel ON chat_messages(channel_type, channel_id);
CREATE INDEX IF NOT EXISTS idx_gacha_history_user_id ON gacha_history(user_id);
CREATE INDEX IF NOT EXISTS idx_energy_transactions_user_id ON energy_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_cosmetic_unlocks_user_id ON cosmetic_unlocks(user_id);
CREATE INDEX IF NOT EXISTS idx_battle_pass_progress_user_season ON battle_pass_progress(user_id, season);

-- Create functions for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, display_name)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'display_name'
  );
  
  INSERT INTO public.game_states (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON game_states FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON guilds FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON trades FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON battle_pass_progress FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();