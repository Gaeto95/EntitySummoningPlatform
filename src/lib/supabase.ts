import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          username: string | null
          display_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
          last_seen: string
          is_online: boolean
          preferences: any
        }
        Insert: {
          id?: string
          user_id: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          last_seen?: string
          is_online?: boolean
          preferences?: any
        }
        Update: {
          id?: string
          user_id?: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          last_seen?: string
          is_online?: boolean
          preferences?: any
        }
      }
      game_states: {
        Row: {
          id: string
          user_id: string
          total_summons: number
          total_sacrifices: number
          total_essence: number
          current_streak: number
          best_streak: number
          prestige_level: number
          unlocked_features: string[]
          last_play_date: string
          playtime: number
          current_energy: number
          max_energy: number
          last_energy_update: string
          energy_regen_rate: number
          essence_crystals: number
          vip_level: number
          vip_expiry: string | null
          login_streak: number
          last_login_date: string
          daily_rewards_claimed: boolean
          battle_pass_level: number
          battle_pass_xp: number
          battle_pass_season: number
          battle_pass_premium: boolean
          battle_pass_rewards_claimed: number[]
          pity_counter: number
          guaranteed_legendary_counter: number
          banner_pulls: any
          grimoire_slots: number
          max_grimoire_slots: number
          unlocked_cosmetics: string[]
          equipped_cosmetics: any
          active_quests: string[]
          completed_quests: string[]
          quest_progress: any
          last_quest_refresh: string
          quest_stats: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          total_summons?: number
          total_sacrifices?: number
          total_essence?: number
          current_streak?: number
          best_streak?: number
          prestige_level?: number
          unlocked_features?: string[]
          last_play_date?: string
          playtime?: number
          current_energy?: number
          max_energy?: number
          last_energy_update?: string
          energy_regen_rate?: number
          essence_crystals?: number
          vip_level?: number
          vip_expiry?: string | null
          login_streak?: number
          last_login_date?: string
          daily_rewards_claimed?: boolean
          battle_pass_level?: number
          battle_pass_xp?: number
          battle_pass_season?: number
          battle_pass_premium?: boolean
          battle_pass_rewards_claimed?: number[]
          pity_counter?: number
          guaranteed_legendary_counter?: number
          banner_pulls?: any
          grimoire_slots?: number
          max_grimoire_slots?: number
          unlocked_cosmetics?: string[]
          equipped_cosmetics?: any
          active_quests?: string[]
          completed_quests?: string[]
          quest_progress?: any
          last_quest_refresh?: string
          quest_stats?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          total_summons?: number
          total_sacrifices?: number
          total_essence?: number
          current_streak?: number
          best_streak?: number
          prestige_level?: number
          unlocked_features?: string[]
          last_play_date?: string
          playtime?: number
          current_energy?: number
          max_energy?: number
          last_energy_update?: string
          energy_regen_rate?: number
          essence_crystals?: number
          vip_level?: number
          vip_expiry?: string | null
          login_streak?: number
          last_login_date?: string
          daily_rewards_claimed?: boolean
          battle_pass_level?: number
          battle_pass_xp?: number
          battle_pass_season?: number
          battle_pass_premium?: boolean
          battle_pass_rewards_claimed?: number[]
          pity_counter?: number
          guaranteed_legendary_counter?: number
          banner_pulls?: any
          grimoire_slots?: number
          max_grimoire_slots?: number
          unlocked_cosmetics?: string[]
          equipped_cosmetics?: any
          active_quests?: string[]
          completed_quests?: string[]
          quest_progress?: any
          last_quest_refresh?: string
          quest_stats?: any
          created_at?: string
          updated_at?: string
        }
      }
      entities: {
        Row: {
          id: string
          user_id: string
          entity_id: string
          name: string
          type: 'demon' | 'divine' | 'ancient'
          rarity: 'common' | 'rare' | 'legendary' | 'mythic'
          personality: string
          sigil: string
          aura: string
          power: number
          domain: string
          manifestation_text: string
          level: number
          experience: number
          abilities: string[]
          collected_at: string
          is_shiny: boolean
          dialogue: string[]
          mood: 'content' | 'angry' | 'pleased' | 'neutral'
          loyalty: number
          skin_id: string | null
          particle_effect: string | null
          summon_animation: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          entity_id: string
          name: string
          type: 'demon' | 'divine' | 'ancient'
          rarity: 'common' | 'rare' | 'legendary' | 'mythic'
          personality: string
          sigil: string
          aura: string
          power: number
          domain: string
          manifestation_text: string
          level?: number
          experience?: number
          abilities?: string[]
          collected_at?: string
          is_shiny?: boolean
          dialogue?: string[]
          mood?: 'content' | 'angry' | 'pleased' | 'neutral'
          loyalty?: number
          skin_id?: string | null
          particle_effect?: string | null
          summon_animation?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          entity_id?: string
          name?: string
          type?: 'demon' | 'divine' | 'ancient'
          rarity?: 'common' | 'rare' | 'legendary' | 'mythic'
          personality?: string
          sigil?: string
          aura?: string
          power?: number
          domain?: string
          manifestation_text?: string
          level?: number
          experience?: number
          abilities?: string[]
          collected_at?: string
          is_shiny?: boolean
          dialogue?: string[]
          mood?: 'content' | 'angry' | 'pleased' | 'neutral'
          loyalty?: number
          skin_id?: string | null
          particle_effect?: string | null
          summon_animation?: string | null
          created_at?: string
        }
      }
    }
  }
}

// Auth helpers
export const signUp = async (email: string, password: string, username: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        display_name: username
      }
    }
  })
  return { data, error }
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

// Game state helpers
export const getGameState = async (userId: string) => {
  const { data, error } = await supabase
    .from('game_states')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  return { data, error }
}

export const updateGameState = async (userId: string, updates: any) => {
  const { data, error } = await supabase
    .from('game_states')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single()
  
  return { data, error }
}

// Entity helpers
export const getUserEntities = async (userId: string) => {
  const { data, error } = await supabase
    .from('entities')
    .select('*')
    .eq('user_id', userId)
    .order('collected_at', { ascending: false })
  
  return { data, error }
}

export const addEntity = async (userId: string, entity: any) => {
  const { data, error } = await supabase
    .from('entities')
    .insert({
      user_id: userId,
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
      level: entity.level,
      experience: entity.experience,
      abilities: entity.abilities,
      is_shiny: entity.isShiny,
      dialogue: entity.dialogue,
      mood: entity.mood,
      loyalty: entity.loyalty
    })
    .select()
    .single()
  
  return { data, error }
}

export const removeEntity = async (entityId: string) => {
  const { error } = await supabase
    .from('entities')
    .delete()
    .eq('id', entityId)
  
  return { error }
}

// Edge function helpers
export const callEdgeFunction = async (functionName: string, payload: any) => {
  const { data, error } = await supabase.functions.invoke(functionName, {
    body: payload
  })
  
  return { data, error }
}