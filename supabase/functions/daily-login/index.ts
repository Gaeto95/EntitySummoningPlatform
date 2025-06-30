import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const DAILY_REWARDS = [
  { day: 1, type: 'essence', amount: 50, icon: '💰' },
  { day: 2, type: 'energy', amount: 5, icon: '⚡' },
  { day: 3, type: 'essence', amount: 100, icon: '💰' },
  { day: 4, type: 'crystals', amount: 10, icon: '💎' },
  { day: 5, type: 'essence', amount: 200, icon: '💰' },
  { day: 6, type: 'energy', amount: 10, icon: '⚡' },
  { day: 7, type: 'crystals', amount: 25, icon: '💎' },
  { day: 8, type: 'essence', amount: 300, icon: '💰' },
  { day: 9, type: 'crystals', amount: 15, icon: '💎' },
  { day: 10, type: 'energy', amount: 15, icon: '⚡' },
  { day: 11, type: 'essence', amount: 400, icon: '💰' },
  { day: 12, type: 'crystals', amount: 20, icon: '💎' },
  { day: 13, type: 'essence', amount: 500, icon: '💰' },
  { day: 14, type: 'energy', amount: 20, icon: '⚡' },
  { day: 15, type: 'crystals', amount: 50, icon: '💎' },
]

function getStreakBonus(streak: number): number {
  if (streak >= 30) return 3.0 // 200% bonus
  if (streak >= 14) return 2.5 // 150% bonus
  if (streak >= 7) return 2.0  // 100% bonus
  if (streak >= 3) return 1.5  // 50% bonus
  return 1.0 // No bonus
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

    const { action } = await req.json()

    // Get current game state
    const { data: gameState, error: gameStateError } = await supabaseClient
      .from('game_states')
      .select('login_streak, last_login_date, daily_rewards_claimed')
      .eq('user_id', user.id)
      .single()

    if (gameStateError || !gameState) {
      return new Response(JSON.stringify({ error: 'Game state not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (action === 'check_login') {
      const today = new Date().toDateString()
      const lastLogin = gameState.last_login_date
      
      if (lastLogin === today) {
        return new Response(JSON.stringify({ 
          alreadyLoggedIn: true,
          canClaimReward: !gameState.daily_rewards_claimed && gameState.login_streak > 0
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayString = yesterday.toDateString()
      
      let newStreak = 1
      if (lastLogin === yesterdayString) {
        newStreak = gameState.login_streak + 1
      }
      
      // Update login streak
      await supabaseClient
        .from('game_states')
        .update({
          last_login_date: today,
          login_streak: newStreak,
          daily_rewards_claimed: false
        })
        .eq('user_id', user.id)

      return new Response(JSON.stringify({ 
        newStreak,
        canClaimReward: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (action === 'claim_reward') {
      if (gameState.daily_rewards_claimed || gameState.login_streak <= 0) {
        return new Response(JSON.stringify({ error: 'No reward to claim' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const rewardIndex = ((gameState.login_streak - 1) % DAILY_REWARDS.length)
      const reward = DAILY_REWARDS[rewardIndex]
      const streakBonus = getStreakBonus(gameState.login_streak)
      const finalAmount = Math.floor(reward.amount * streakBonus)

      // Apply reward
      switch (reward.type) {
        case 'essence':
          await supabaseClient.rpc('update_currency', {
            user_uuid: user.id,
            currency_type: 'essence',
            amount: finalAmount,
            operation: 'add'
          })
          break
        case 'crystals':
          await supabaseClient.rpc('update_currency', {
            user_uuid: user.id,
            currency_type: 'crystals',
            amount: finalAmount,
            operation: 'add'
          })
          break
        case 'energy':
          await supabaseClient
            .from('game_states')
            .update({
              current_energy: supabaseClient.raw(`LEAST(max_energy, current_energy + ${finalAmount})`)
            })
            .eq('user_id', user.id)
          break
      }

      // Mark reward as claimed
      await supabaseClient
        .from('game_states')
        .update({ daily_rewards_claimed: true })
        .eq('user_id', user.id)

      return new Response(JSON.stringify({ 
        reward: {
          ...reward,
          amount: finalAmount,
          streakBonus: Math.round((streakBonus - 1) * 100)
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in daily-login function:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})