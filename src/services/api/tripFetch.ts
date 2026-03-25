
// Serviço para buscar dados de uma pescaria específica

import { supabase } from "@/integrations/supabase/client";
import { FishingTripData } from "@/types/fishingTrip";
import { logDebug, STORAGE_PREFIX } from "./core";

// Buscar uma pescaria por ID (RLS already filters by user)
export const fetchTrip = async (tripId: string): Promise<FishingTripData | null> => {
  try {
    if (!tripId) {
      logDebug("ID de pescaria inválido na função fetchTrip.");
      return null;
    }
    
    const normalizedId = tripId.replace(STORAGE_PREFIX, "");
    logDebug(`Buscando pescaria com ID: ${normalizedId}`);
    
    const { data, error } = await supabase
      .from('fishing_trips')
      .select('data')
      .eq('id', normalizedId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        logDebug(`Pescaria ${normalizedId} não encontrada`);
        return null;
      }
      if (import.meta.env.DEV) console.error('Erro ao buscar pescaria:', error);
      return null;
    }
    
    if (!data) return null;
    
    const tripData = data.data as unknown as FishingTripData;
    
    logDebug(`Pescaria ${normalizedId} encontrada:`, {
      participantes: tripData.participants?.length || 0,
      despesas: tripData.expenses?.length || 0,
    });
    
    if (!tripData.participants) tripData.participants = [];
    if (!tripData.expenses) tripData.expenses = [];
    
    return tripData;
  } catch (error) {
    if (import.meta.env.DEV) console.error('Erro ao buscar pescaria:', error);
    throw new Error('Falha ao buscar dados da pescaria');
  }
};
