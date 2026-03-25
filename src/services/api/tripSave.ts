
// Serviço para salvar dados de uma pescaria

import { supabase } from "@/integrations/supabase/client";
import { FishingTripData } from "@/types/fishingTrip";
import { logDebug, STORAGE_PREFIX, getCurrentUserId } from "./core";

// Salvar uma pescaria
export const saveTrip = async (tripId: string, data: FishingTripData): Promise<void> => {
  try {
    if (!tripId) {
      throw new Error("ID da pescaria é necessário para salvar");
    }
    
    const userId = await getCurrentUserId();
    const normalizedId = tripId.replace(STORAGE_PREFIX, "");
    
    if (!data.participants) data.participants = [];
    if (!data.expenses) data.expenses = [];
    data.lastUpdated = Date.now();
    
    logDebug(`Salvando pescaria ${normalizedId} no Supabase:`, {
      participants: data.participants.length,
      expenses: data.expenses.length,
    });
    
    const { error: upsertError } = await supabase
      .from('fishing_trips')
      .upsert({
        id: normalizedId,
        user_id: userId,
        data: data as any,
        last_updated: new Date().toISOString()
      });
    
    if (upsertError) {
      if (import.meta.env.DEV) console.error(`Erro ao salvar pescaria:`, upsertError);
      throw new Error('Falha ao salvar dados da pescaria.');
    }
    
    logDebug(`Pescaria ${normalizedId} salva com sucesso`);
  } catch (error) {
    if (import.meta.env.DEV) console.error('Erro ao salvar pescaria:', error);
    throw error;
  }
};
