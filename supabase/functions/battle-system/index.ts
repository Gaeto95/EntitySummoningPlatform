import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface BattleRequest {
  action: 'find_match' | 'start_battle' | 'process_turn' | 'end_battle';
  battleType: 'casual' | 'ranked' | 'tournament';
  entities?: any[];
  battleId?: string;
  skillId?: string;
  targetIndex?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const request: BattleRequest = await req.json()

    // Get user's profile and game state
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('username')
      .eq('user_id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
      return new Response(JSON.stringify({ error: 'Failed to fetch profile' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { data: gameState, error: gameStateError } = await supabaseClient
      .from('game_states')
      .select('pvp_rank, pvp_stats')
      .eq('user_id', user.id)
      .single()

    if (gameStateError) {
      console.error('Error fetching game state:', gameStateError)
      return new Response(JSON.stringify({ error: 'Failed to fetch game state' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Handle different battle actions
    switch (request.action) {
      case 'find_match': {
        if (!request.entities || request.entities.length === 0) {
          return new Response(JSON.stringify({ error: 'No entities provided for battle' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Insert into matchmaking queue
        const { data: matchmaking, error: matchmakingError } = await supabaseClient
          .from('pvp_matchmaking')
          .insert({
            user_id: user.id,
            battle_type: request.battleType,
            tier: request.battleType === 'ranked' ? gameState.pvp_rank.tier : null,
            division: request.battleType === 'ranked' ? gameState.pvp_rank.division : null,
            entities: request.entities
          })
          .select()
          .single()

        if (matchmakingError) {
          console.error('Error inserting into matchmaking:', matchmakingError)
          return new Response(JSON.stringify({ error: 'Failed to enter matchmaking queue' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Try to find a match
        const { data: match, error: matchError } = await supabaseClient.rpc('find_pvp_match', {
          p_user_id: user.id,
          p_battle_type: request.battleType,
          p_tier: request.battleType === 'ranked' ? gameState.pvp_rank.tier : null,
          p_division: request.battleType === 'ranked' ? gameState.pvp_rank.division : null
        })

        if (matchError) {
          console.error('Error finding match:', matchError)
          return new Response(JSON.stringify({ error: 'Failed to find match' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        if (match && match.length > 0 && match[0].opponent_id) {
          // Match found!
          const { match_id, opponent_id, opponent_entities } = match[0]

          // Get opponent's username
          const { data: opponentProfile } = await supabaseClient
            .from('profiles')
            .select('username')
            .eq('user_id', opponent_id)
            .single()

          // Create battle record
          const { data: battleRecord, error: battleError } = await supabaseClient
            .from('battle_records')
            .insert({
              battle_id: match_id,
              player1_id: user.id,
              player2_id: opponent_id,
              battle_type: request.battleType,
              player1_entities: request.entities,
              player2_entities: opponent_entities,
              battle_log: []
            })
            .select()
            .single()

          if (battleError) {
            console.error('Error creating battle record:', battleError)
            return new Response(JSON.stringify({ error: 'Failed to create battle' }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
          }

          return new Response(JSON.stringify({ 
            matchFound: true,
            battleId: match_id,
            opponent: {
              id: opponent_id,
              username: opponentProfile?.username || 'Unknown',
              entities: opponent_entities
            }
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        } else {
          // No match found yet
          return new Response(JSON.stringify({ 
            matchFound: false,
            queueId: matchmaking.id
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
      }

      case 'start_battle': {
        // This would initialize a battle with an AI opponent
        // For simplicity, we'll just return a mock battle
        const battleId = `battle_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
        
        return new Response(JSON.stringify({ 
          battleId,
          opponent: {
            id: 'ai_opponent',
            username: 'AI Opponent',
            entities: [
              {
                id: 'ai_entity_1',
                name: 'Shadow Wraith',
                type: 'demon',
                rarity: 'rare',
                power: 70,
                stats: {
                  health: 120,
                  attack: 18,
                  defense: 12,
                  speed: 14,
                  critRate: 10,
                  critDamage: 150,
                  resistance: 8
                }
              }
            ]
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'process_turn': {
        // This would process a turn in an ongoing battle
        // For simplicity, we'll just return a mock result
        return new Response(JSON.stringify({ 
          success: true,
          updatedBattle: {
            // Mock battle state
          },
          logs: ['Turn processed successfully']
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'end_battle': {
        if (!request.battleId) {
          return new Response(JSON.stringify({ error: 'No battle ID provided' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Update battle record with result
        const { error: updateError } = await supabaseClient
          .from('battle_records')
          .update({
            winner_id: user.id, // In a real implementation, this would be determined by the battle outcome
            is_draw: false,
            rewards: {
              essence: 100,
              crystals: 10,
              experience: 50
            },
            rank_points_change: request.battleType === 'ranked' ? 20 : null
          })
          .eq('battle_id', request.battleId)

        if (updateError) {
          console.error('Error updating battle record:', updateError)
          return new Response(JSON.stringify({ error: 'Failed to update battle record' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Update PvP stats
        if (request.battleType === 'ranked') {
          await supabaseClient.rpc('update_pvp_stats', {
            p_user_id: user.id,
            p_result: 'win', // In a real implementation, this would be determined by the battle outcome
            p_battle_type: request.battleType,
            p_rank_points: 20
          })
        }

        return new Response(JSON.stringify({ 
          success: true,
          rewards: {
            essence: 100,
            crystals: 10,
            experience: 50,
            rankPoints: request.battleType === 'ranked' ? 20 : null
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }

  } catch (error) {
    console.error('Error in battle-system function:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})