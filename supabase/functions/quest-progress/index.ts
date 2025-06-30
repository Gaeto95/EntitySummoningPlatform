import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface QuestProgressRequest {
  action: {
    type: 'summon' | 'collect' | 'sacrifice' | 'login' | 'spend' | 'gacha_pull'
    entity?: any
    amount?: number
  }
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

    const { action }: QuestProgressRequest = await req.json()

    // Get current game state
    const { data: gameState, error: gameStateError } = await supabaseClient
      .from('game_states')
      .select('active_quests, quest_progress, completed_quests, quest_stats')
      .eq('user_id', user.id)
      .single()

    if (gameStateError || !gameState) {
      return new Response(JSON.stringify({ error: 'Game state not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get quest templates
    const { data: quests, error: questsError } = await supabaseClient
      .from('quests')
      .select('*')
      .in('id', gameState.active_quests)

    if (questsError) {
      console.error('Error fetching quests:', questsError)
      return new Response(JSON.stringify({ error: 'Failed to fetch quests' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    let updatedProgress = { ...gameState.quest_progress }
    let updatedCompleted = [...gameState.completed_quests]
    let updatedStats = { ...gameState.quest_stats }
    let hasCompletedQuest = false

    // Update progress for all active quests
    for (const quest of quests) {
      const currentProgress = updatedProgress[quest.id] || quest.objectives
      let questUpdated = false

      for (let i = 0; i < currentProgress.length; i++) {
        const objective = currentProgress[i]
        if (objective.isCompleted || objective.type !== action.type) continue

        // Check if action matches objective conditions
        let shouldUpdate = true
        if (objective.conditions && action.entity) {
          if (objective.conditions.entityType && action.entity.type !== objective.conditions.entityType) {
            shouldUpdate = false
          }
          if (objective.conditions.entityRarity) {
            const rarityOrder = ['common', 'rare', 'legendary', 'mythic']
            const requiredIndex = rarityOrder.indexOf(objective.conditions.entityRarity)
            const entityIndex = rarityOrder.indexOf(action.entity.rarity)
            if (entityIndex < requiredIndex) {
              shouldUpdate = false
            }
          }
        }

        if (shouldUpdate) {
          const increment = action.amount || 1
          objective.current = Math.min(objective.target, objective.current + increment)
          objective.isCompleted = objective.current >= objective.target
          questUpdated = true
        }
      }

      if (questUpdated) {
        updatedProgress[quest.id] = currentProgress
        
        // Check if entire quest is completed
        const allObjectivesComplete = currentProgress.every(obj => obj.isCompleted)
        if (allObjectivesComplete && !updatedCompleted.includes(quest.id)) {
          updatedCompleted.push(quest.id)
          hasCompletedQuest = true
          
          // Update quest stats
          updatedStats.totalCompleted = (updatedStats.totalCompleted || 0) + 1
          const statKey = quest.type === 'daily' ? 'dailyCompleted' : 
                         quest.type === 'weekly' ? 'weeklyCompleted' : 
                         quest.type === 'story' ? 'storyCompleted' : 'totalCompleted'
          updatedStats[statKey] = (updatedStats[statKey] || 0) + 1
        }
      }
    }

    // Update game state
    const { error: updateError } = await supabaseClient
      .from('game_states')
      .update({
        quest_progress: updatedProgress,
        completed_quests: updatedCompleted,
        quest_stats: updatedStats
      })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Error updating quest progress:', updateError)
      return new Response(JSON.stringify({ error: 'Failed to update quest progress' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ 
      success: true,
      questsCompleted: hasCompletedQuest,
      updatedProgress
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in quest-progress function:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})