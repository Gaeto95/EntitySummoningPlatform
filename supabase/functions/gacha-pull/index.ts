import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface GachaPullRequest {
  bannerId: string
  pullCount: number
}

interface SummonBanner {
  id: string
  name: string
  cost: number
  currency: 'essence' | 'crystals'
  guaranteedLegendaryAt: number
  rateUpMultiplier: number
  featuredEntities: string[]
}

const CURRENT_BANNERS: SummonBanner[] = [
  {
    id: 'infernal_lords',
    name: 'Infernal Lords Banner',
    cost: 50,
    currency: 'crystals',
    guaranteedLegendaryAt: 10,
    rateUpMultiplier: 2.0,
    featuredEntities: ['Xhuralith', 'Maltheus', 'Belzeth']
  },
  {
    id: 'celestial_court',
    name: 'Celestial Court Banner',
    cost: 50,
    currency: 'crystals',
    guaranteedLegendaryAt: 10,
    rateUpMultiplier: 2.0,
    featuredEntities: ['Celestine', 'Aurelia', 'Seraphiel']
  },
  {
    id: 'ancient_awakening',
    name: 'Ancient Awakening Banner',
    cost: 75,
    currency: 'crystals',
    guaranteedLegendaryAt: 8,
    rateUpMultiplier: 1.5,
    featuredEntities: ['Yog\'thala', 'Cthulhara', 'Azathoria']
  }
]

function calculatePullCost(banner: SummonBanner, pullCount: number): number {
  const baseCost = banner.cost * pullCount
  let discount = 0
  
  switch (pullCount) {
    case 10: discount = 0.1; break
    case 50: discount = 0.2; break
    case 100: discount = 0.3; break
  }
  
  return Math.floor(baseCost * (1 - discount))
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

    const { bannerId, pullCount }: GachaPullRequest = await req.json()

    // Find banner
    const banner = CURRENT_BANNERS.find(b => b.id === bannerId)
    if (!banner) {
      return new Response(JSON.stringify({ error: 'Banner not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Calculate cost
    const totalCost = calculatePullCost(banner, pullCount)

    // Get game state
    const { data: gameState, error: gameStateError } = await supabaseClient
      .from('game_states')
      .select('essence_crystals, total_essence, pity_counter, guaranteed_legendary_counter, banner_pulls')
      .eq('user_id', user.id)
      .single()

    if (gameStateError || !gameState) {
      return new Response(JSON.stringify({ error: 'Game state not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check if user can afford
    const canAfford = banner.currency === 'crystals' 
      ? gameState.essence_crystals >= totalCost
      : gameState.total_essence >= totalCost

    if (!canAfford) {
      return new Response(JSON.stringify({ error: 'Insufficient currency' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Generate entities (simplified for demo)
    const entities = []
    let newPityCounter = gameState.pity_counter
    let newGuaranteedCounter = gameState.guaranteed_legendary_counter
    
    for (let i = 0; i < pullCount; i++) {
      const pullNumber = (gameState.banner_pulls[bannerId] || 0) + i + 1
      let guaranteedRarity = null
      
      // Check for guaranteed pulls
      if (pullNumber % banner.guaranteedLegendaryAt === 0) {
        guaranteedRarity = 'legendary'
        newPityCounter = 0
      } else if (newPityCounter >= 50) {
        guaranteedRarity = 'legendary'
        newPityCounter = 0
      } else if (newGuaranteedCounter >= 100) {
        guaranteedRarity = 'mythic'
        newGuaranteedCounter = 0
      }

      // Generate entity (simplified)
      const entity = {
        id: `gacha_${Date.now()}_${i}`,
        name: `Gacha Entity ${i + 1}`,
        type: ['demon', 'divine', 'ancient'][Math.floor(Math.random() * 3)],
        rarity: guaranteedRarity || (['common', 'rare', 'legendary', 'mythic'][Math.floor(Math.random() * 4)]),
        power: Math.floor(Math.random() * 50) + 50,
        isShiny: Math.random() < 0.05
      }

      entities.push(entity)
      
      if (entity.rarity === 'legendary' || entity.rarity === 'mythic') {
        newPityCounter = 0
        if (entity.rarity === 'mythic') {
          newGuaranteedCounter = 0
        }
      } else {
        newPityCounter++
        newGuaranteedCounter++
      }
    }

    // Update game state
    const updatedBannerPulls = {
      ...gameState.banner_pulls,
      [bannerId]: (gameState.banner_pulls[bannerId] || 0) + pullCount
    }

    const { error: updateError } = await supabaseClient
      .from('game_states')
      .update({
        [banner.currency === 'crystals' ? 'essence_crystals' : 'total_essence']: 
          gameState[banner.currency === 'crystals' ? 'essence_crystals' : 'total_essence'] - totalCost,
        pity_counter: newPityCounter,
        guaranteed_legendary_counter: newGuaranteedCounter,
        banner_pulls: updatedBannerPulls
      })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Error updating game state:', updateError)
      return new Response(JSON.stringify({ error: 'Failed to update game state' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Log gacha history
    await supabaseClient
      .from('gacha_history')
      .insert({
        user_id: user.id,
        banner_id: bannerId,
        pull_count: pullCount,
        cost: totalCost,
        currency: banner.currency,
        entities_received: entities.map(e => e.id),
        pity_counter_before: gameState.pity_counter,
        pity_counter_after: newPityCounter
      })

    return new Response(JSON.stringify({ 
      entities,
      pityCounter: newPityCounter,
      guaranteedCounter: newGuaranteedCounter
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in gacha-pull function:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})