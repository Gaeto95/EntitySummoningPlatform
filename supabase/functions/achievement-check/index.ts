import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface AchievementCheckRequest {
  gameState: any
  entities: any[]
}

const ACHIEVEMENTS = [
  {
    id: 'first_summon',
    name: 'First Contact',
    description: 'Summon your first entity',
    icon: '🌟',
    condition: (gameState: any, entities: any[]) => gameState.total_summons >= 1,
    reward: { type: 'essence', value: 50 }
  },
  {
    id: 'first_sacrifice',
    name: 'First Blood',
    description: 'Make your first sacrifice',
    icon: '🔥',
    condition: (gameState: any, entities: any[]) => gameState.total_sacrifices >= 1,
    reward: { type: 'crystals', value: 10 }
  },
  {
    id: 'energy_master',
    name: 'Energy Master',
    description: 'Reach maximum energy capacity',
    icon: '⚡',
    condition: (gameState: any, entities: any[]) => gameState.current_energy >= gameState.max_energy && gameState.max_energy >= 10,
    reward: { type: 'energy', value: 5 }
  },
  {
    id: 'daily_devotee',
    name: 'Daily Devotee',
    description: 'Maintain a 7-day login streak',
    icon: '📅',
    condition: (gameState: any, entities: any[]) => gameState.login_streak >= 7,
    reward: { type: 'crystals', value: 25 }
  },
  {
    id: 'collector_10',
    name: 'Novice Collector',
    description: 'Collect 10 entities',
    icon: '📚',
    condition: (gameState: any, entities: any[]) => entities.length >= 10,
    reward: { type: 'essence', value: 100 }
  },
  {
    id: 'legendary_hunter',
    name: 'Legendary Hunter',
    description: 'Collect a legendary entity',
    icon: '👑',
    condition: (gameState: any, entities: any[]) => entities.some(e => e.rarity === 'legendary'),
    reward: { type: 'crystals', value: 30 }
  },
  {
    id: 'shiny_hunter',
    name: 'Shiny Hunter',
    description: 'Collect a shiny entity',
    icon: '✨',
    condition: (gameState: any, entities: any[]) => entities.some(e => e.is_shiny),
    reward: { type: 'crystals', value: 50 }
  }
]

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

    const { gameState, entities }: AchievementCheckRequest = await req.json()

    // Get current user achievements
    const { data: userAchievements, error: achievementsError } = await supabaseClient
      .from('user_achievements')
      .select('achievement_id, unlocked')
      .eq('user_id', user.id)

    if (achievementsError) {
      console.error('Error fetching achievements:', achievementsError)
      return new Response(JSON.stringify({ error: 'Failed to fetch achievements' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const unlockedAchievements = new Set(
      userAchievements?.filter(ua => ua.unlocked).map(ua => ua.achievement_id) || []
    )

    const newlyUnlocked = []

    // Check each achievement
    for (const achievement of ACHIEVEMENTS) {
      if (!unlockedAchievements.has(achievement.id) && achievement.condition(gameState, entities)) {
        // Unlock achievement
        await supabaseClient
          .from('user_achievements')
          .upsert({
            user_id: user.id,
            achievement_id: achievement.id,
            unlocked: true,
            unlocked_at: new Date().toISOString()
          })

        // Apply reward
        if (achievement.reward) {
          const { type, value } = achievement.reward
          
          switch (type) {
            case 'essence':
              await supabaseClient.rpc('update_currency', {
                user_uuid: user.id,
                currency_type: 'essence',
                amount: value,
                operation: 'add'
              })
              break
            case 'crystals':
              await supabaseClient.rpc('update_currency', {
                user_uuid: user.id,
                currency_type: 'crystals',
                amount: value,
                operation: 'add'
              })
              break
            case 'energy':
              await supabaseClient
                .from('game_states')
                .update({
                  current_energy: supabaseClient.raw(`LEAST(max_energy, current_energy + ${value})`)
                })
                .eq('user_id', user.id)
              break
          }
        }

        newlyUnlocked.push({
          ...achievement,
          unlocked: true,
          unlockedAt: Date.now()
        })
      }
    }

    return new Response(JSON.stringify({ 
      newlyUnlocked,
      totalUnlocked: unlockedAchievements.size + newlyUnlocked.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in achievement-check function:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})