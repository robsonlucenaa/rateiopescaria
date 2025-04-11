
// Serviço para buscar dados de uma pescaria específica

import { supabase } from "@/integrations/supabase/client";
import { FishingTripData } from "@/types/fishingTrip";
import { logDebug, STORAGE_PREFIX } from "./core";

// Buscar uma pescaria por ID
export const fetchTrip = async (tripId: string): Promise<FishingTripData | null> => {
  try {
    if (!tripId) {
      logDebug("ID de pescaria inválido na função fetchTrip.");
      return null;
    }
    
    // Normaliza o ID para garantir consistência
    const normalizedId = tripId.replace(STORAGE_PREFIX, "");
    
    logDebug(`Buscando pescaria com ID: ${normalizedId} do Supabase`);
    
    const { data, error } = await supabase
      .from('fishing_trips')
      .select('data')
      .eq('id', normalizedId)
      .single();
    
    if (error) {
      // Se o erro for "no rows returned", podemos criar uma nova pescaria
      if (error.code === 'PGRST116') {
        logDebug(`Pescaria ${normalizedId} não encontrada no banco de dados`);
        return null;
      }
      
      console.error(`Erro ao buscar pescaria ${normalizedId}:`, error);
      return null;
    }
    
    if (!data) {
      logDebug(`Pescaria ${normalizedId} não encontrada no banco de dados`);
      return null;
    }
    
    // Cast data to the correct type using as and type assertion
    const tripData = data.data as unknown as FishingTripData;
    
    logDebug(`Pescaria ${normalizedId} encontrada com sucesso:`, {
      participantes: tripData.participants?.length || 0,
      despesas: tripData.expenses?.length || 0,
      ultimaAtualizacao: new Date(tripData.lastUpdated).toISOString()
    });
    
    // Verifica a integridade dos dados
    if (!tripData.participants) tripData.participants = [];
    if (!tripData.expenses) tripData.expenses = [];
    
    return tripData;
  } catch (error) {
    console.error("Erro ao buscar pescaria:", error);
    throw new Error("Falha ao buscar dados da pescaria");
  }
};
