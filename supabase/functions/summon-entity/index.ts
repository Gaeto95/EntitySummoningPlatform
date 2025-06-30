import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface SummonRequest {
  runes: string[]
  temperature: number
  maxTokens: number
  memory: number
  powerBoost: number
  streak: number
  weatherBonus: number
}

interface Entity {
  id: string
  name: string
  type: 'demon' | 'divine' | 'ancient'
  rarity: 'common' | 'rare' | 'legendary' | 'mythic'
  personality: string
  sigil: string
  aura: string
  power: number
  domain: string
  manifestationText: string
  level: number
  experience: number
  abilities: string[]
  collectedAt: number
  isShiny: boolean
  dialogue: string[]
  mood: 'content' | 'angry' | 'pleased' | 'neutral'
  loyalty: number
}

const demonNames = [
  'Xhuralith', 'Vex\'thara', 'Zephyron', 'Maltheus', 'Nyxara',
  'Korvain', 'Belzeth', 'Thraxxus', 'Voidara', 'Grimlock'
]

const divineNames = [
  'Celestine', 'Aurelia', 'Seraphiel', 'Luminara', 'Astridel',
  'Etheresia', 'Gloriana', 'Sanctus', 'Benedixia', 'Radianta'
]

const ancientNames = [
  'Yog\'thala', 'Cthulhara', 'Nyarlatep', 'Azathoria', 'Shub\'nira',
  'Hasturix', 'Dagoneth', 'Yoggothic', 'Carcosian', 'Rl\'yehic'
]

const personalities = [
  'Wrathful and demanding', 'Cunning and manipulative', 'Wise but cryptic',
  'Chaotic and unpredictable', 'Ancient and weary', 'Proud and regal'
]

const sigils = ['⚡', '👁', '🔥', '💀', '⚔', '🐉', '👑', '🌙', '⭐', '💎']
const auras = [
  'Crimson flames dancing around', 'Golden light emanating from', 'Shadow tendrils writhing about',
  'Electric energy crackling through', 'Icy mist swirling around', 'Purple void pulsing within'
]

const domains = [
  'War and Conflict', 'Death and Decay', 'Knowledge and Secrets', 'Chaos and Madness',
  'Fire and Destruction', 'Shadows and Illusion', 'Time and Fate', 'Dreams and Nightmares'
]

const abilities = [
  'Soul Drain', 'Mind Control', 'Elemental Mastery', 'Time Manipulation',
  'Dimensional Rift', 'Energy Absorption', 'Illusion Weaving', 'Prophecy'
]

const manifestationTexts = {
  demon: {
    common: [
      "I emerge from shadow. What trivial matter brings you before me?",
      "The flames delivered me. Speak quickly, mortal.",
      "Your ritual was... adequate. State your purpose."
    ],
    rare: [
      "I am summoned from the burning depths! Your runes show promise, mortal.",
      "The flames of the underworld have delivered me to your circle."
    ],
    legendary: [
      "Behold! I rise from the deepest pits of the infernal realm! Your ritual has impressed even the dark lords.",
      "From the obsidian towers of the underworld I come! Your mastery grows."
    ],
    mythic: [
      "MORTAL! You have achieved what few dare attempt - summoning one of the Primordial Flames! Your soul blazes with power that rivals the ancient ones!"
    ]
  },
  divine: {
    common: [
      "I descend with blessing. How may I guide you?",
      "The heavens heard your call. What wisdom do you seek?",
      "Light has brought me to you. Speak your need."
    ],
    rare: [
      "I descend from the celestial realms, drawn by your pure intent and growing wisdom.",
      "The heavens have taken notice of your dedication."
    ],
    legendary: [
      "From the highest spheres of celestial glory I descend! Your soul shines with divine light.",
      "Behold the glory of the eternal realm made manifest!"
    ],
    mythic: [
      "BLESSED CHILD! You have achieved communion with the Source itself! I am the First Light, the Word that spoke creation into being!"
    ]
  },
  ancient: {
    common: [
      "I stir from eons of sleep. Why do you wake me?",
      "Time means nothing to me. Speak quickly.",
      "From before your kind, I come. What is it?"
    ],
    rare: [
      "From eons before your kind drew breath, I stir... Your ritual shows understanding.",
      "The stars align as they did in ages past..."
    ],
    legendary: [
      "I am the whisper that existed before the first word was spoken! Your mind has touched cosmic truth.",
      "Before your ancestors crawled from the primordial seas, I was!"
    ],
    mythic: [
      "CHILD OF THE VOID! You have gazed into the Abyss and emerged transformed! I am the Dreamer whose dreams shape reality!"
    ]
  }
}

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function determineRarity(powerLevel: number, streak: number, weatherBonus: number): Entity['rarity'] {
  let rareChance = 0.15
  let legendaryChance = 0.03
  let mythicChance = 0.005
  
  if (powerLevel > 80) {
    rareChance += 0.1
    legendaryChance += 0.02
    mythicChance += 0.005
  }
  
  const streakBonus = Math.min(0.1, streak * 0.01)
  rareChance += streakBonus
  legendaryChance += streakBonus * 0.5
  mythicChance += streakBonus * 0.2
  
  rareChance += weatherBonus * 0.01
  legendaryChance += weatherBonus * 0.005
  mythicChance += weatherBonus * 0.002
  
  const roll = Math.random()
  
  if (roll < mythicChance) return 'mythic'
  if (roll < legendaryChance) return 'legendary'
  if (roll < rareChance) return 'rare'
  return 'common'
}

function generateEntity(request: SummonRequest): Entity {
  const { runes, temperature, maxTokens, memory, powerBoost, streak, weatherBonus } = request
  
  // Determine entity type based on runes
  let type: 'demon' | 'divine' | 'ancient' = 'demon'
  
  const runeInfluence = { demon: 0, divine: 0, ancient: 0 }

  runes.forEach(rune => {
    switch (rune) {
      case 'rage':
      case 'war':
      case 'fire':
      case 'death':
        runeInfluence.demon += 2
        break
      case 'truth':
      case 'submission':
        runeInfluence.divine += 2
        runeInfluence.demon += 1
        break
      case 'chaos':
      case 'void':
        runeInfluence.ancient += 2
        runeInfluence.demon += 1
        break
    }
  })

  const randomFactor = temperature * 3
  runeInfluence.demon += Math.random() * randomFactor
  runeInfluence.divine += Math.random() * randomFactor
  runeInfluence.ancient += Math.random() * randomFactor

  if (runeInfluence.divine > runeInfluence.demon && runeInfluence.divine > runeInfluence.ancient) {
    type = 'divine'
  } else if (runeInfluence.ancient > runeInfluence.demon && runeInfluence.ancient > runeInfluence.divine) {
    type = 'ancient'
  }

  // Calculate power level
  const basePower = Math.floor(Math.random() * 40) + 30
  const temperatureBonus = Math.floor(temperature * 30)
  const runeBonus = runes.length * 5
  const tokenBonus = Math.floor((maxTokens / 2000) * 10)
  const memoryBonus = Math.floor((memory / 100) * 10)
  const sacrificeBonus = Math.floor(powerBoost)
  const streakBonus = Math.min(20, streak * 2)
  const weatherPowerBonus = Math.floor(weatherBonus * 0.5)
  
  const power = Math.min(100, basePower + temperatureBonus + runeBonus + tokenBonus + memoryBonus + sacrificeBonus + streakBonus + weatherPowerBonus)

  const rarity = determineRarity(power, streak, weatherBonus)
  
  const shinyChance = rarity === 'mythic' ? 0.1 : rarity === 'legendary' ? 0.05 : rarity === 'rare' ? 0.02 : 0.01
  const isShiny = Math.random() < shinyChance

  let name: string
  switch (type) {
    case 'divine':
      name = getRandomElement(divineNames)
      break
    case 'ancient':
      name = getRandomElement(ancientNames)
      break
    default:
      name = getRandomElement(demonNames)
  }

  if (rarity === 'legendary') name = `Lord ${name}`
  if (rarity === 'mythic') name = `Primordial ${name}`
  if (isShiny) name = `✨ ${name}`

  const personality = getRandomElement(personalities)
  const sigil = getRandomElement(sigils)
  const aura = getRandomElement(auras)
  const domain = getRandomElement(domains)
  
  const texts = manifestationTexts[type][rarity]
  const manifestationText = getRandomElement(texts || manifestationTexts[type].common)
  
  const numAbilities = rarity === 'mythic' ? 4 : rarity === 'legendary' ? 3 : rarity === 'rare' ? 2 : 1
  const entityAbilities = []
  for (let i = 0; i < numAbilities; i++) {
    const ability = getRandomElement(abilities.filter(a => !entityAbilities.includes(a)))
    entityAbilities.push(ability)
  }

  const dialogue = [
    "Greetings, summoner...",
    "What would you have of me?",
    "The ritual binds us both...",
    "I sense great potential in you...",
    "Our fates are now intertwined..."
  ]

  return {
    id: `entity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    type,
    rarity,
    personality,
    sigil,
    aura,
    power,
    domain,
    manifestationText,
    level: 1,
    experience: 0,
    abilities: entityAbilities,
    collectedAt: Date.now(),
    isShiny,
    dialogue,
    mood: 'neutral',
    loyalty: 50
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

    const request: SummonRequest = await req.json()

    // Validate energy consumption
    const { data: gameState, error: gameStateError } = await supabaseClient
      .from('game_states')
      .select('current_energy, max_energy')
      .eq('user_id', user.id)
      .single()

    if (gameStateError || !gameState) {
      return new Response(JSON.stringify({ error: 'Game state not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (gameState.current_energy < 1) {
      return new Response(JSON.stringify({ error: 'Insufficient energy' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Generate entity
    const entity = generateEntity(request)

    // Update game state (consume energy, increment summons)
    const { error: updateError } = await supabaseClient
      .from('game_states')
      .update({
        current_energy: gameState.current_energy - 1,
        total_summons: supabaseClient.rpc('increment_total_summons'),
        current_streak: supabaseClient.rpc('increment_current_streak'),
        best_streak: supabaseClient.rpc('update_best_streak')
      })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Error updating game state:', updateError)
      return new Response(JSON.stringify({ error: 'Failed to update game state' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Log energy transaction
    await supabaseClient
      .from('energy_transactions')
      .insert({
        user_id: user.id,
        transaction_type: 'consume',
        amount: -1,
        energy_before: gameState.current_energy,
        energy_after: gameState.current_energy - 1,
        source: 'summon'
      })

    return new Response(JSON.stringify({ entity }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in summon-entity function:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})