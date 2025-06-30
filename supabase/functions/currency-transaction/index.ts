import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface CurrencyTransactionRequest {
  type: 'spend' | 'earn' | 'refill'
  currency: 'essence' | 'crystals'
  amount: number
  source: string
  itemId?: string
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

    const transaction: CurrencyTransactionRequest = await req.json()

    // Get current game state
    const { data: gameState, error: gameStateError } = await supabaseClient
      .from('game_states')
      .select('total_essence, essence_crystals, current_energy, max_energy')
      .eq('user_id', user.id)
      .single()

    if (gameStateError || !gameState) {
      return new Response(JSON.stringify({ error: 'Game state not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const currentAmount = transaction.currency === 'crystals' 
      ? gameState.essence_crystals 
      : gameState.total_essence

    // Validate transaction
    if (transaction.type === 'spend' && currentAmount < transaction.amount) {
      return new Response(JSON.stringify({ error: 'Insufficient currency' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Calculate new amount
    let newAmount = currentAmount
    switch (transaction.type) {
      case 'spend':
        newAmount = currentAmount - transaction.amount
        break
      case 'earn':
        newAmount = currentAmount + transaction.amount
        break
      case 'refill':
        // Special case for energy refill
        if (transaction.currency === 'crystals' && transaction.amount === 10) {
          newAmount = currentAmount - 10
          // Update energy to max
          await supabaseClient
            .from('game_states')
            .update({ current_energy: gameState.max_energy })
            .eq('user_id', user.id)
          
          // Log energy transaction
          await supabaseClient
            .from('energy_transactions')
            .insert({
              user_id: user.id,
              transaction_type: 'refill',
              amount: gameState.max_energy - gameState.current_energy,
              energy_before: gameState.current_energy,
              energy_after: gameState.max_energy,
              source: 'crystal_refill'
            })
        }
        break
    }

    // Update currency
    const updateField = transaction.currency === 'crystals' ? 'essence_crystals' : 'total_essence'
    const { error: updateError } = await supabaseClient
      .from('game_states')
      .update({ [updateField]: newAmount })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Error updating currency:', updateError)
      return new Response(JSON.stringify({ error: 'Failed to update currency' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ 
      success: true,
      newAmount,
      transaction
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in currency-transaction function:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})