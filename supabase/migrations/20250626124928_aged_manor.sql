/*
  # PvP Battle System Implementation

  1. New Tables
    - `battle_records` - Store battle history and results
    - `pvp_ranks` - Track player rankings and seasonal progress
    - `pvp_seasons` - Manage competitive seasons
    - `pvp_matchmaking` - Handle matchmaking queue

  2. Game State Updates
    - Add PvP stats to existing game_states table
    - Add PvP rank information

  3. Security
    - Enable RLS on all new tables
    - Add appropriate policies for data access

  4. Functions
    - Matchmaking algorithm
    - Rank calculation and updates
*/

-- Battle Records Table
CREATE TABLE IF NOT EXISTS battle_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id text NOT NULL,
  player1_id uuid NOT NULL,
  player2_id uuid NOT NULL,
  winner_id uuid,
  is_draw boolean DEFAULT false,
  battle_type text NOT NULL CHECK (battle_type IN ('casual', 'ranked', 'tournament')),
  player1_entities jsonb NOT NULL,
  player2_entities jsonb NOT NULL,
  battle_log jsonb NOT NULL,
  rewards jsonb,
  rank_points_change integer,
  created_at timestamptz DEFAULT now(),
  season_id integer
);

-- PvP Ranks Table
CREATE TABLE IF NOT EXISTS pvp_ranks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tier text NOT NULL CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum', 'diamond', 'master')),
  division integer NOT NULL CHECK (division BETWEEN 1 AND 5),
  points integer NOT NULL DEFAULT 0,
  season_id integer NOT NULL,
  wins integer DEFAULT 0,
  losses integer DEFAULT 0,
  draws integer DEFAULT 0,
  win_streak integer DEFAULT 0,
  best_win_streak integer DEFAULT 0,
  total_battles integer DEFAULT 0,
  season_rank_points integer DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, season_id)
);

-- PvP Seasons Table
CREATE TABLE IF NOT EXISTS pvp_seasons (
  id serial PRIMARY KEY,
  name text NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  rewards jsonb NOT NULL,
  is_active boolean DEFAULT false
);

-- PvP Matchmaking Queue
CREATE TABLE IF NOT EXISTS pvp_matchmaking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  battle_type text NOT NULL CHECK (battle_type IN ('casual', 'ranked', 'tournament')),
  tier text,
  division integer,
  entities jsonb NOT NULL,
  joined_at timestamptz DEFAULT now(),
  status text DEFAULT 'waiting' CHECK (status IN ('waiting', 'matched', 'cancelled')),
  match_id uuid
);

-- Add PvP stats to game_states
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'game_states' AND column_name = 'pvp_stats'
  ) THEN
    ALTER TABLE game_states ADD COLUMN pvp_stats jsonb DEFAULT '{
      "wins": 0,
      "losses": 0,
      "draws": 0,
      "winStreak": 0,
      "bestWinStreak": 0,
      "totalBattles": 0,
      "seasonRankPoints": 0
    }'::jsonb;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'game_states' AND column_name = 'pvp_rank'
  ) THEN
    ALTER TABLE game_states ADD COLUMN pvp_rank jsonb DEFAULT '{
      "tier": "bronze",
      "division": 5,
      "points": 0
    }'::jsonb;
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_battle_records_player1_id ON battle_records(player1_id);
CREATE INDEX IF NOT EXISTS idx_battle_records_player2_id ON battle_records(player2_id);
CREATE INDEX IF NOT EXISTS idx_battle_records_battle_type ON battle_records(battle_type);
CREATE INDEX IF NOT EXISTS idx_battle_records_season_id ON battle_records(season_id);
CREATE INDEX IF NOT EXISTS idx_pvp_ranks_user_id ON pvp_ranks(user_id);
CREATE INDEX IF NOT EXISTS idx_pvp_ranks_tier_division ON pvp_ranks(tier, division);
CREATE INDEX IF NOT EXISTS idx_pvp_matchmaking_status ON pvp_matchmaking(status);
CREATE INDEX IF NOT EXISTS idx_pvp_matchmaking_battle_type ON pvp_matchmaking(battle_type);

-- Enable Row Level Security
ALTER TABLE battle_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE pvp_ranks ENABLE ROW LEVEL SECURITY;
ALTER TABLE pvp_seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE pvp_matchmaking ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Battle Records
CREATE POLICY "Users can view their own battles" 
  ON battle_records
  FOR SELECT
  TO authenticated
  USING ((auth.uid() = player1_id) OR (auth.uid() = player2_id));

CREATE POLICY "Users can insert their own battles" 
  ON battle_records
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = player1_id);

-- PvP Ranks
CREATE POLICY "Users can view their own ranks" 
  ON pvp_ranks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view all ranks for leaderboards" 
  ON pvp_ranks
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can manage ranks" 
  ON pvp_ranks
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- PvP Seasons
CREATE POLICY "Anyone can view seasons" 
  ON pvp_seasons
  FOR SELECT
  TO authenticated
  USING (true);

-- PvP Matchmaking
CREATE POLICY "Users can view their own matchmaking entries" 
  ON pvp_matchmaking
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own matchmaking entries" 
  ON pvp_matchmaking
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own matchmaking entries" 
  ON pvp_matchmaking
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage matchmaking" 
  ON pvp_matchmaking
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Functions for PvP
CREATE OR REPLACE FUNCTION find_pvp_match(
  p_user_id UUID,
  p_battle_type TEXT,
  p_tier TEXT DEFAULT NULL,
  p_division INTEGER DEFAULT NULL
)
RETURNS TABLE(match_id UUID, opponent_id UUID, opponent_entities JSONB)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_match_id UUID;
  v_opponent_id UUID;
  v_opponent_entities JSONB;
BEGIN
  -- Find a suitable opponent
  IF p_battle_type = 'ranked' AND p_tier IS NOT NULL AND p_division IS NOT NULL THEN
    -- For ranked, find someone in similar tier/division
    SELECT user_id, entities INTO v_opponent_id, v_opponent_entities
    FROM pvp_matchmaking
    WHERE status = 'waiting'
      AND battle_type = p_battle_type
      AND user_id != p_user_id
      AND (
        (tier = p_tier AND ABS(division - p_division) <= 1) OR
        (tier != p_tier AND 
          (
            (tier = 'bronze' AND p_tier = 'silver' AND division = 1 AND p_division = 5) OR
            (tier = 'silver' AND p_tier = 'bronze' AND division = 5 AND p_division = 1) OR
            (tier = 'silver' AND p_tier = 'gold' AND division = 1 AND p_division = 5) OR
            (tier = 'gold' AND p_tier = 'silver' AND division = 5 AND p_division = 1) OR
            (tier = 'gold' AND p_tier = 'platinum' AND division = 1 AND p_division = 5) OR
            (tier = 'platinum' AND p_tier = 'gold' AND division = 5 AND p_division = 1) OR
            (tier = 'platinum' AND p_tier = 'diamond' AND division = 1 AND p_division = 5) OR
            (tier = 'diamond' AND p_tier = 'platinum' AND division = 5 AND p_division = 1) OR
            (tier = 'diamond' AND p_tier = 'master' AND division = 1) OR
            (tier = 'master' AND p_tier = 'diamond' AND p_division = 1)
          )
        )
      )
    ORDER BY joined_at ASC
    LIMIT 1;
  ELSE
    -- For casual, just find anyone
    SELECT user_id, entities INTO v_opponent_id, v_opponent_entities
    FROM pvp_matchmaking
    WHERE status = 'waiting'
      AND battle_type = p_battle_type
      AND user_id != p_user_id
    ORDER BY joined_at ASC
    LIMIT 1;
  END IF;
  
  IF v_opponent_id IS NOT NULL THEN
    -- Create a match ID
    v_match_id := gen_random_uuid();
    
    -- Update both players' matchmaking entries
    UPDATE pvp_matchmaking
    SET status = 'matched', match_id = v_match_id
    WHERE user_id IN (p_user_id, v_opponent_id)
      AND status = 'waiting';
    
    RETURN QUERY SELECT v_match_id, v_opponent_id, v_opponent_entities;
  ELSE
    RETURN QUERY SELECT NULL::UUID, NULL::UUID, NULL::JSONB;
  END IF;
END;
$$;

-- Function to update PvP stats after a battle
CREATE OR REPLACE FUNCTION update_pvp_stats(
  p_user_id UUID,
  p_result TEXT, -- 'win', 'loss', or 'draw'
  p_battle_type TEXT,
  p_rank_points INTEGER DEFAULT 0
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_stats JSONB;
  v_updated_stats JSONB;
  v_current_rank JSONB;
  v_updated_rank JSONB;
  v_wins INTEGER;
  v_losses INTEGER;
  v_draws INTEGER;
  v_win_streak INTEGER;
  v_best_win_streak INTEGER;
  v_total_battles INTEGER;
  v_season_rank_points INTEGER;
  v_tier TEXT;
  v_division INTEGER;
  v_points INTEGER;
  v_season_id INTEGER;
BEGIN
  -- Get current stats
  SELECT pvp_stats, pvp_rank INTO v_current_stats, v_current_rank
  FROM game_states
  WHERE user_id = p_user_id;
  
  -- If no stats exist, initialize them
  IF v_current_stats IS NULL THEN
    v_current_stats := '{
      "wins": 0,
      "losses": 0,
      "draws": 0,
      "winStreak": 0,
      "bestWinStreak": 0,
      "totalBattles": 0,
      "seasonRankPoints": 0
    }'::jsonb;
  END IF;
  
  IF v_current_rank IS NULL THEN
    v_current_rank := '{
      "tier": "bronze",
      "division": 5,
      "points": 0
    }'::jsonb;
  END IF;
  
  -- Extract values
  v_wins := COALESCE((v_current_stats->>'wins')::INTEGER, 0);
  v_losses := COALESCE((v_current_stats->>'losses')::INTEGER, 0);
  v_draws := COALESCE((v_current_stats->>'draws')::INTEGER, 0);
  v_win_streak := COALESCE((v_current_stats->>'winStreak')::INTEGER, 0);
  v_best_win_streak := COALESCE((v_current_stats->>'bestWinStreak')::INTEGER, 0);
  v_total_battles := COALESCE((v_current_stats->>'totalBattles')::INTEGER, 0);
  v_season_rank_points := COALESCE((v_current_stats->>'seasonRankPoints')::INTEGER, 0);
  
  -- Update stats based on result
  IF p_result = 'win' THEN
    v_wins := v_wins + 1;
    v_win_streak := v_win_streak + 1;
    v_best_win_streak := GREATEST(v_best_win_streak, v_win_streak);
  ELSIF p_result = 'loss' THEN
    v_losses := v_losses + 1;
    v_win_streak := 0;
  ELSE -- draw
    v_draws := v_draws + 1;
  END IF;
  
  v_total_battles := v_total_battles + 1;
  
  -- Update rank points for ranked battles
  IF p_battle_type = 'ranked' AND p_rank_points != 0 THEN
    v_season_rank_points := v_season_rank_points + p_rank_points;
    
    -- Extract rank values
    v_tier := COALESCE(v_current_rank->>'tier', 'bronze');
    v_division := COALESCE((v_current_rank->>'division')::INTEGER, 5);
    v_points := COALESCE((v_current_rank->>'points')::INTEGER, 0);
    
    -- Update points
    v_points := v_points + p_rank_points;
    
    -- Handle promotions/demotions
    IF v_points >= 100 THEN
      -- Promotion
      IF v_division > 1 THEN
        -- Move up a division within the same tier
        v_division := v_division - 1;
        v_points := 0;
      ELSE
        -- Move up a tier
        CASE v_tier
          WHEN 'bronze' THEN v_tier := 'silver';
          WHEN 'silver' THEN v_tier := 'gold';
          WHEN 'gold' THEN v_tier := 'platinum';
          WHEN 'platinum' THEN v_tier := 'diamond';
          WHEN 'diamond' THEN v_tier := 'master';
          ELSE v_tier := v_tier; -- Master stays master
        END CASE;
        
        IF v_tier != 'master' THEN
          v_division := 5;
          v_points := 0;
        END IF;
      END IF;
    ELSIF v_points < 0 THEN
      -- Demotion
      IF v_division < 5 THEN
        -- Move down a division within the same tier
        v_division := v_division + 1;
        v_points := 75;
      ELSE
        -- Move down a tier
        CASE v_tier
          WHEN 'silver' THEN v_tier := 'bronze';
          WHEN 'gold' THEN v_tier := 'silver';
          WHEN 'platinum' THEN v_tier := 'gold';
          WHEN 'diamond' THEN v_tier := 'platinum';
          WHEN 'master' THEN v_tier := 'diamond';
          ELSE v_tier := v_tier; -- Bronze stays bronze
        END CASE;
        
        IF v_tier = 'bronze' AND v_division = 5 THEN
          v_points := 0; -- Can't go lower than Bronze 5
        ELSE
          v_division := 1;
          v_points := 75;
        END IF;
      END IF;
    END IF;
    
    -- Create updated rank JSON
    v_updated_rank := jsonb_build_object(
      'tier', v_tier,
      'division', v_division,
      'points', v_points
    );
  ELSE
    v_updated_rank := v_current_rank;
  END IF;
  
  -- Create updated stats JSON
  v_updated_stats := jsonb_build_object(
    'wins', v_wins,
    'losses', v_losses,
    'draws', v_draws,
    'winStreak', v_win_streak,
    'bestWinStreak', v_best_win_streak,
    'totalBattles', v_total_battles,
    'seasonRankPoints', v_season_rank_points
  );
  
  -- Update game state
  UPDATE game_states
  SET 
    pvp_stats = v_updated_stats,
    pvp_rank = v_updated_rank
  WHERE user_id = p_user_id;
  
  -- Also update pvp_ranks table if this is a ranked battle
  IF p_battle_type = 'ranked' THEN
    -- Get current season
    SELECT id INTO v_season_id FROM pvp_seasons WHERE is_active = true LIMIT 1;
    
    IF v_season_id IS NOT NULL THEN
      INSERT INTO pvp_ranks (
        user_id, tier, division, points, season_id, 
        wins, losses, draws, win_streak, best_win_streak, 
        total_battles, season_rank_points
      )
      VALUES (
        p_user_id, v_tier, v_division, v_points, v_season_id,
        v_wins, v_losses, v_draws, v_win_streak, v_best_win_streak,
        v_total_battles, v_season_rank_points
      )
      ON CONFLICT (user_id, season_id) DO UPDATE
      SET 
        tier = EXCLUDED.tier,
        division = EXCLUDED.division,
        points = EXCLUDED.points,
        wins = EXCLUDED.wins,
        losses = EXCLUDED.losses,
        draws = EXCLUDED.draws,
        win_streak = EXCLUDED.win_streak,
        best_win_streak = EXCLUDED.best_win_streak,
        total_battles = EXCLUDED.total_battles,
        season_rank_points = EXCLUDED.season_rank_points,
        updated_at = now();
    END IF;
  END IF;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION find_pvp_match(UUID, TEXT, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION update_pvp_stats(UUID, TEXT, TEXT, INTEGER) TO authenticated;

-- Insert initial season
INSERT INTO pvp_seasons (name, start_date, end_date, is_active, rewards)
VALUES (
  'Season 1: Awakening',
  '2025-01-01',
  '2025-03-31',
  true,
  '{
    "bronze": {"essence": 500, "crystals": 50},
    "silver": {"essence": 1000, "crystals": 100},
    "gold": {"essence": 2000, "crystals": 200, "cosmetic": "pvp_gold_aura"},
    "platinum": {"essence": 5000, "crystals": 300, "entity": "platinum_guardian"},
    "diamond": {"essence": 10000, "crystals": 500, "title": "Diamond Summoner"},
    "master": {"essence": 20000, "crystals": 1000, "entity": "legendary_champion"}
  }'::jsonb
)
ON CONFLICT DO NOTHING;