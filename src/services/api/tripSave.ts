
// Serviço para salvar dados de uma pescaria

import { supabase } from "@/integrations/supabase/client";
import { FishingTripData } from "@/types/fishingTrip";
import { logDebug, STORAGE_PREFIX, simulateNetworkLatency } from "./core";

// Salvar uma pescaria
export const saveTrip = async (tripId: string, data: FishingTripData): Promise<void> => {
  try {
    if (!tripId) {
      throw new Error("ID da pescaria é necessário para salvar");
    }
    
    // Normaliza o ID da pescaria (remova o prefixo se já existir)
    const normalizedId = tripId.replace(STORAGE_PREFIX, "");
    
    // Verificar se temos participantes e despesas
    if (!data.participants) data.participants = [];
    if (!data.expenses) data.expenses = [];
    
    // Adiciona timestamp atual
    data.lastUpdated = Date.now();
    
    logDebug(`Salvando pescaria ${normalizedId} no Supabase:`, {
      participants: data.participants.length,
      expenses: data.expenses.length,
      lastUpdated: new Date(data.lastUpdated).toISOString()
    });
    
    // Prepare um único objeto para o upsert
    const { error: upsertError } = await supabase
      .from('fishing_trips')
      .upsert({
        id: normalizedId,
        data: data as any,
        last_updated: new Date().toISOString() // Convert Date to string to match the expected type
      });
    
    if (upsertError) {
      console.error(`Erro ao salvar pescaria ${normalizedId}:`, upsertError);
      throw new Error("Falha ao salvar dados da pescaria no banco de dados");
    }
    
    logDebug(`Pescaria ${normalizedId} salva com sucesso no Supabase`);
    
    // Simula latência de rede
    await simulateNetworkLatency();
    
    return;
  } catch (error) {
    console.error("Erro ao salvar pescaria:", error);
    throw new Error("Falha ao salvar dados da pescaria");
  }
};
