import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, getUserEntities, addEntity, removeEntity } from '../lib/supabase';
import { Entity } from '../types/game';

export const useEntities = (user: User | null) => {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert database row to Entity
  const convertDbToEntity = (dbRow: any): Entity => {
    return {
      id: dbRow.entity_id,
      name: dbRow.name,
      type: dbRow.type,
      rarity: dbRow.rarity,
      personality: dbRow.personality,
      sigil: dbRow.sigil,
      aura: dbRow.aura,
      power: dbRow.power,
      domain: dbRow.domain,
      manifestationText: dbRow.manifestation_text,
      level: dbRow.level,
      experience: dbRow.experience,
      abilities: dbRow.abilities,
      collectedAt: new Date(dbRow.collected_at).getTime(),
      isShiny: dbRow.is_shiny,
      dialogue: dbRow.dialogue,
      mood: dbRow.mood,
      loyalty: dbRow.loyalty,
      skinId: dbRow.skin_id,
      particleEffect: dbRow.particle_effect,
      summonAnimation: dbRow.summon_animation
    };
  };

  // Load entities from database
  useEffect(() => {
    if (!user) {
      setEntities([]);
      setLoading(false);
      return;
    }

    const loadEntities = async () => {
      try {
        setLoading(true);
        const { data, error } = await getUserEntities(user.id);
        
        if (error) {
          console.error('Error loading entities:', error);
          setError(error.message);
        } else if (data) {
          setEntities(data.map(convertDbToEntity));
        }
      } catch (err: any) {
        console.error('Error loading entities:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadEntities();
  }, [user]);

  // Add new entity
  const collectEntity = async (entity: Entity) => {
    if (!user) return;

    try {
      const { data, error } = await addEntity(user.id, entity);
      
      if (error) {
        console.error('Error adding entity:', error);
        setError(error.message);
      } else if (data) {
        const newEntity = convertDbToEntity(data);
        setEntities(prev => [newEntity, ...prev]);
        setError(null);
      }
    } catch (err: any) {
      console.error('Error adding entity:', err);
      setError(err.message);
    }
  };

  // Remove entity
  const sacrificeEntity = async (entityId: string) => {
    if (!user) return;

    try {
      // Find the entity in local state first
      const entity = entities.find(e => e.id === entityId);
      if (!entity) return;

      // Find the database ID
      const { data: dbEntities } = await supabase
        .from('entities')
        .select('id, entity_id')
        .eq('user_id', user.id)
        .eq('entity_id', entityId);

      if (!dbEntities || dbEntities.length === 0) return;

      const { error } = await removeEntity(dbEntities[0].id);
      
      if (error) {
        console.error('Error removing entity:', error);
        setError(error.message);
      } else {
        setEntities(prev => prev.filter(e => e.id !== entityId));
        setError(null);
      }
    } catch (err: any) {
      console.error('Error removing entity:', err);
      setError(err.message);
    }
  };

  // Real-time subscription for entity changes
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('entity_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'entities',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.new) {
            const newEntity = convertDbToEntity(payload.new);
            setEntities(prev => [newEntity, ...prev]);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'entities',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.old) {
            setEntities(prev => prev.filter(e => e.id !== payload.old.entity_id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return {
    entities,
    collectEntity,
    sacrificeEntity,
    loading,
    error
  };
};