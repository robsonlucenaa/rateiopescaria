
// Serviço para excluir uma pescaria

import { supabase } from "@/integrations/supabase/client";
import { logDebug, STORAGE_PREFIX } from "./core";

export const deleteTrip = async (tripId: string): Promise<void> => {
  try {
    if (!tripId) {
      logDebug("ID de pescaria inválido na função deleteTrip.");
      return;
    }
    
    const normalizedId = tripId.replace(STORAGE_PREFIX, "");
    logDebug(`Excluindo pescaria ${normalizedId}`);
    
    const { error } = await supabase
      .from('fishing_trips')
      .delete()
      .eq('id', normalizedId);
    
    if (error) {
      console.error(`Erro ao excluir pescaria ${normalizedId}:`, error);
      throw new Error("Falha ao excluir dados da pescaria");
    }
    
    logDebug(`Pescaria ${normalizedId} excluída com sucesso`);
  } catch (error) {
    console.error("Erro ao excluir pescaria:", error);
    throw new Error("Falha ao excluir dados da pescaria");
  }
};
