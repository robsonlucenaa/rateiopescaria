
// Serviço para verificar atualizações de uma pescaria

import { supabase } from "@/integrations/supabase/client";
import { FishingTripData } from "@/components/ExpenseSplitter";
import { logDebug, STORAGE_PREFIX } from "./core";

// Verificar se há uma versão mais recente dos dados da pescaria
export const checkForUpdates = async (tripId: string, lastSyncTime: number): Promise<{hasUpdates: boolean, data?: FishingTripData}> => {
  try {
    if (!tripId) {
      logDebug("ID de pescaria inválido na função checkForUpdates.");
      return { hasUpdates: false };
    }
    
    // Normaliza o ID para garantir consistência
    const normalizedId = tripId.replace(STORAGE_PREFIX, "");
    
    logDebug(`Verificando atualizações para ${normalizedId} no Supabase, último sync: ${new Date(lastSyncTime).toISOString()}`);
    
    const { data, error } = await supabase
      .from('fishing_trips')
      .select('data, last_updated')
      .eq('id', normalizedId)
      .single();
    
    if (error || !data) {
      logDebug(`Sem atualizações para ${normalizedId} (não encontrado ou erro)`);
      return { hasUpdates: false };
    }
    
    // Cast data to the correct type using as and type assertion
    const tripData = data.data as unknown as FishingTripData;
    const dbLastUpdated = new Date(data.last_updated).getTime();
    
    if (dbLastUpdated > lastSyncTime) {
      logDebug(`Atualizações encontradas para ${normalizedId}, timestamp: ${new Date(dbLastUpdated).toISOString()}`);
      return { hasUpdates: true, data: tripData };
    }
    
    logDebug(`Sem atualizações para ${normalizedId}`);
    return { hasUpdates: false };
  } catch (error) {
    console.error("Erro ao verificar atualizações:", error);
    return { hasUpdates: false };
  }
};
