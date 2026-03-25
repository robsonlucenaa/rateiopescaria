
// Serviço para verificar atualizações de uma pescaria

import { supabase } from "@/integrations/supabase/client";
import { FishingTripData } from "@/types/fishingTrip";
import { logDebug, STORAGE_PREFIX } from "./core";

export const checkForUpdates = async (tripId: string, lastSyncTime: number): Promise<{hasUpdates: boolean, data?: FishingTripData}> => {
  try {
    if (!tripId) {
      logDebug("ID de pescaria inválido na função checkForUpdates.");
      return { hasUpdates: false };
    }
    
    const normalizedId = tripId.replace(STORAGE_PREFIX, "");
    
    const { data, error } = await supabase
      .from('fishing_trips')
      .select('data, last_updated')
      .eq('id', normalizedId)
      .single();
    
    if (error || !data) {
      return { hasUpdates: false };
    }
    
    const tripData = data.data as unknown as FishingTripData;
    const dbLastUpdated = new Date(data.last_updated).getTime();
    
    if (dbLastUpdated > lastSyncTime) {
      logDebug(`Atualizações encontradas para ${normalizedId}`);
      return { hasUpdates: true, data: tripData };
    }
    
    return { hasUpdates: false };
  } catch (error) {
    console.error("Erro ao verificar atualizações:", error);
    return { hasUpdates: false };
  }
};
