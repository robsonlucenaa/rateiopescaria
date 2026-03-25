
// Serviço para listar pescarias (RLS filters by user automatically)

import { supabase } from "@/integrations/supabase/client";
import { FishingTripData } from "@/types/fishingTrip";
import { logDebug } from "./core";

export const getAllTrips = async (): Promise<{ id: string; lastUpdated: number; participants: number }[]> => {
  try {
    logDebug(`Buscando pescarias do usuário...`);
    
    const { data, error } = await supabase
      .from('fishing_trips')
      .select('*')
      .order('last_updated', { ascending: false });
    
    if (error) {
      console.error("Erro ao buscar pescarias:", error);
      return [];
    }
    
    if (!data || data.length === 0) {
      logDebug('Nenhuma pescaria encontrada.');
      return [];
    }
    
    const trips = data.map(trip => {
      const tripData = trip.data as unknown as FishingTripData;
      return {
        id: trip.id,
        lastUpdated: tripData.lastUpdated || new Date(trip.last_updated).getTime(),
        participants: tripData.participants?.length || 0
      };
    });
    
    logDebug(`Encontradas ${trips.length} pescarias`);
    return trips;
  } catch (error) {
    console.error("Erro ao listar pescarias:", error);
    return [];
  }
};
