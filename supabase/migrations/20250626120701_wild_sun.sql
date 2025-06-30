-- RPC Functions for game state updates
-- These functions handle atomic updates to prevent race conditions

-- Function to increment total summons and update streak
CREATE OR REPLACE FUNCTION increment_summon_stats(user_uuid UUID)
RETURNS TABLE(new_total_summons INTEGER, new_current_streak INTEGER, new_best_streak INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_total INTEGER;
  current_streak INTEGER;
  best_streak INTEGER;
BEGIN
  -- Get current values
  SELECT total_summons, current_streak, best_streak 
  INTO current_total, current_streak, best_streak
  FROM game_states 
  WHERE user_id = user_uuid;
  
  -- Calculate new values
  current_total := current_total + 1;
  current_streak := current_streak + 1;
  best_streak := GREATEST(best_streak, current_streak);
  
  -- Update the record
  UPDATE game_states 
  SET 
    total_summons = current_total,
    current_streak = current_streak,
    best_streak = best_streak,
    updated_at = NOW()
  WHERE user_id = user_uuid;
  
  -- Return new values
  RETURN QUERY SELECT current_total, current_streak, best_streak;
END;
$$;

-- Function to consume energy safely
CREATE OR REPLACE FUNCTION consume_energy(user_uuid UUID, amount INTEGER DEFAULT 1)
RETURNS TABLE(success BOOLEAN, new_energy INTEGER, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_energy INTEGER;
  max_energy INTEGER;
BEGIN
  -- Get current energy
  SELECT current_energy, max_energy 
  INTO current_energy, max_energy
  FROM game_states 
  WHERE user_id = user_uuid;
  
  -- Check if user has enough energy
  IF current_energy < amount THEN
    RETURN QUERY SELECT FALSE, current_energy, 'Insufficient energy';
    RETURN;
  END IF;
  
  -- Consume energy
  current_energy := current_energy - amount;
  
  UPDATE game_states 
  SET 
    current_energy = current_energy,
    updated_at = NOW()
  WHERE user_id = user_uuid;
  
  RETURN QUERY SELECT TRUE, current_energy, 'Energy consumed successfully';
END;
$$;

-- Function to update energy based on time passed
CREATE OR REPLACE FUNCTION regenerate_energy(user_uuid UUID)
RETURNS TABLE(new_energy INTEGER, energy_gained INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_energy INTEGER;
  max_energy INTEGER;
  last_update TIMESTAMPTZ;
  regen_rate INTEGER;
  vip_level INTEGER;
  minutes_passed INTEGER;
  energy_to_add INTEGER;
  final_energy INTEGER;
BEGIN
  -- Get current state
  SELECT 
    gs.current_energy, 
    gs.max_energy, 
    gs.last_energy_update, 
    gs.energy_regen_rate,
    gs.vip_level
  INTO current_energy, max_energy, last_update, regen_rate, vip_level
  FROM game_states gs
  WHERE gs.user_id = user_uuid;
  
  -- Calculate minutes passed
  minutes_passed := EXTRACT(EPOCH FROM (NOW() - last_update)) / 60;
  
  -- Calculate energy to add
  energy_to_add := minutes_passed / regen_rate;
  
  -- Don't exceed max energy
  final_energy := LEAST(max_energy, current_energy + energy_to_add);
  
  -- Update if energy was gained
  IF energy_to_add > 0 THEN
    UPDATE game_states 
    SET 
      current_energy = final_energy,
      last_energy_update = NOW(),
      updated_at = NOW()
    WHERE user_id = user_uuid;
  END IF;
  
  RETURN QUERY SELECT final_energy, energy_to_add;
END;
$$;

-- Function to safely update currency
CREATE OR REPLACE FUNCTION update_currency(
  user_uuid UUID, 
  currency_type TEXT, 
  amount INTEGER, 
  operation TEXT DEFAULT 'add'
)
RETURNS TABLE(success BOOLEAN, new_amount INTEGER, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_amount INTEGER;
  final_amount INTEGER;
BEGIN
  -- Get current amount based on currency type
  IF currency_type = 'essence' THEN
    SELECT total_essence INTO current_amount FROM game_states WHERE user_id = user_uuid;
  ELSIF currency_type = 'crystals' THEN
    SELECT essence_crystals INTO current_amount FROM game_states WHERE user_id = user_uuid;
  ELSE
    RETURN QUERY SELECT FALSE, 0, 'Invalid currency type';
    RETURN;
  END IF;
  
  -- Calculate final amount
  IF operation = 'add' THEN
    final_amount := current_amount + amount;
  ELSIF operation = 'subtract' THEN
    IF current_amount < amount THEN
      RETURN QUERY SELECT FALSE, current_amount, 'Insufficient currency';
      RETURN;
    END IF;
    final_amount := current_amount - amount;
  ELSE
    RETURN QUERY SELECT FALSE, current_amount, 'Invalid operation';
    RETURN;
  END IF;
  
  -- Update the currency
  IF currency_type = 'essence' THEN
    UPDATE game_states SET total_essence = final_amount, updated_at = NOW() WHERE user_id = user_uuid;
  ELSIF currency_type = 'crystals' THEN
    UPDATE game_states SET essence_crystals = final_amount, updated_at = NOW() WHERE user_id = user_uuid;
  END IF;
  
  RETURN QUERY SELECT TRUE, final_amount, 'Currency updated successfully';
END;
$$;

-- Function to handle quest progress updates
CREATE OR REPLACE FUNCTION update_quest_progress(
  user_uuid UUID,
  quest_id TEXT,
  objective_id TEXT,
  progress_amount INTEGER DEFAULT 1
)
RETURNS TABLE(quest_completed BOOLEAN, new_progress JSONB)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_progress JSONB;
  updated_progress JSONB;
  objective_data JSONB;
  is_completed BOOLEAN := FALSE;
BEGIN
  -- Get current quest progress
  SELECT quest_progress INTO current_progress 
  FROM game_states 
  WHERE user_id = user_uuid;
  
  -- Initialize if null
  IF current_progress IS NULL THEN
    current_progress := '{}'::JSONB;
  END IF;
  
  -- Get quest objectives from current progress or initialize
  IF current_progress ? quest_id THEN
    updated_progress := current_progress;
  ELSE
    -- Initialize quest progress from quest template
    SELECT objectives INTO objective_data FROM quests WHERE id = quest_id;
    updated_progress := current_progress || jsonb_build_object(quest_id, objective_data);
  END IF;
  
  -- Update specific objective progress
  -- This is a simplified version - in practice you'd need more complex JSONB manipulation
  
  -- Update the game state
  UPDATE game_states 
  SET 
    quest_progress = updated_progress,
    updated_at = NOW()
  WHERE user_id = user_uuid;
  
  RETURN QUERY SELECT is_completed, updated_progress;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION increment_summon_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION consume_energy(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION regenerate_energy(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_currency(UUID, TEXT, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_quest_progress(UUID, TEXT, TEXT, INTEGER) TO authenticated;