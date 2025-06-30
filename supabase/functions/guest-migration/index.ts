import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface GuestMigrationRequest {
  guestGameState: any
  guestEntities: any[]
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

    const { guestGameState, guestEntities }: GuestMigrationRequest = await req.json()

    // Check if user already has game state
    const { data: existingState } = await supabaseClient
      .from('game_states')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (existingState) {
      return new Response(JSON.stringify({ error: 'User already has game state' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Convert guest state to database format
    const dbGameState = {
      user_id: user.id,
      total_summons: guestGameState.totalSummons || 0,
      total_sacrifices: guestGameState.totalSacrifices || 0,
      total_essence: guestGameState.totalEssence || 0,
      current_streak: guestGameState.currentStreak || 0,
      best_streak: guestGameState.bestStreak || 0,
      prestige_level: guestGameState.prestigeLevel || 0,
      unlocked_features: guestGameState.unlockedFeatures || [],
      last_play_date: new Date(guestGameState.lastPlayDate || Date.now()).toISOString(),
      playtime: guestGameState.playtime || 0,
      current_energy: guestGameState.currentEnergy || 10,
      max_energy: guestGameState.maxEnergy || 10,
      last_energy_update: new Date(guestGameState.lastEnergyUpdate || Date.now()).toISOString(),
      energy_regen_rate: guestGameState.energyRegenRate || 60,
      essence_crystals: guestGameState.essenceCrystals || 100,
      vip_level: guestGameState.vipLevel || 0,
      vip_expiry: guestGameState.vipExpiry ? new Date(guestGameState.vipExpiry).toISOString() : null,
      login_streak: guestGameState.loginStreak || 1,
      last_login_date: guestGameState.lastLoginDate || new Date().toDateString(),
      daily_rewards_claimed: guestGameState.dailyRewardsClaimed || false,
      battle_pass_level: guestGameState.battlePassLevel || 1,
      battle_pass_xp: guestGameState.battlePassXP || 0,
      battle_pass_season: guestGameState.battlePassSeason || 1,
      battle_pass_premium: guestGameState.battlePassPremium || false,
      battle_pass_rewards_claimed: guestGameState.battlePassRewardsClaimed || [],
      pity_counter: guestGameState.pityCounter || 0,
      guaranteed_legendary_counter: guestGameState.guaranteedLegendaryCounter || 0,
      banner_pulls: guestGameState.bannerPulls || {},
      grimoire_slots: guestGameState.grimoireSlots || 50,
      max_grimoire_slots: 50, // Upgrade from guest limit
      unlocked_cosmetics: guestGameState.unlockedCosmetics || [],
      equipped_cosmetics: guestGameState.equippedCosmetics || {
        circleTheme: 'default',
        particleEffect: 'default',
        uiTheme: 'default',
        summonAnimation: 'default'
      },
      active_quests: guestGameState.activeQuests || [],
      completed_quests: guestGameState.completedQuests || [],
      quest_progress: guestGameState.questProgress || {},
      last_quest_refresh: guestGameState.lastQuestRefresh || '',
      quest_stats: guestGameState.questStats || {
        totalCompleted: 0,
        dailyCompleted: 0,
        weeklyCompleted: 0,
        storyCompleted: 0
      }
    }

    // Insert game state
    const { error: gameStateError } = await supabaseClient
      .from('game_states')
      .insert(dbGameState)

    if (gameStateError) {
      console.error('Error inserting game state:', gameStateError)
      return new Response(JSON.stringify({ error: 'Failed to migrate game state' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Migrate entities
    const entityInserts = guestEntities.map(entity => ({
      user_id: user.id,
      entity_id: entity.id,
      name: entity.name,
      type: entity.type,
      rarity: entity.rarity,
      personality: entity.personality,
      sigil: entity.sigil,
      aura: entity.aura,
      power: entity.power,
      domain: entity.domain,
      manifestation_text: entity.manifestationText,
      level: entity.level || 1,
      experience: entity.experience || 0,
      abilities: entity.abilities || [],
      collected_at: new Date(entity.collectedAt || Date.now()).toISOString(),
      is_shiny: entity.isShiny || false,
      dialogue: entity.dialogue || [],
      mood: entity.mood || 'neutral',
      loyalty: entity.loyalty || 50
    }))

    if (entityInserts.length > 0) {
      const { error: entitiesError } = await supabaseClient
        .from('entities')
        .insert(entityInserts)

      if (entitiesError) {
        console.error('Error inserting entities:', entitiesError)
        // Don't fail the migration if entities fail, just log it
      }
    }

    // Give bonus rewards for upgrading
    await supabaseClient.rpc('update_currency', {
      user_uuid: user.id,
      currency_type: 'crystals',
      amount: 100,
      operation: 'add'
    })

    await supabaseClient.rpc('update_currency', {
      user_uuid: user.id,
      currency_type: 'essence',
      amount: 500,
      operation: 'add'
    })

    return new Response(JSON.stringify({ 
      success: true,
      migratedEntities: entityInserts.length,
      bonusRewards: {
        crystals: 100,
        essence: 500
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in guest-migration function:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})