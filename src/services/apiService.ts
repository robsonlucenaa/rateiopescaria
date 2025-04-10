
// Serviço de API para armazenar e recuperar dados de pescarias
// Usando Supabase para persistência de dados

import { FishingTripData } from "@/components/ExpenseSplitter";
import { supabase } from "@/integrations/supabase/client";

// Função de log para depuração
const logDebug = (message: string, data?: any) => {
  console.log(`[ApiService] ${message}`, data || '');
};

// Prefixo padrão para chaves de armazenamento (mantido para compatibilidade)
const STORAGE_PREFIX = "fishing-trip-";

// API usando Supabase para persistência
export const apiService = {
  // Listar todas as pescarias
  getAllTrips: async (): Promise<{ id: string; lastUpdated: number; participants: number }[]> => {
    try {
      logDebug(`Buscando todas as pescarias do Supabase...`);
      
      const { data, error } = await supabase
        .from('fishing_trips')
        .select('*')
        .order('last_updated', { ascending: false });
      
      if (error) {
        console.error("Erro ao buscar pescarias:", error);
        return [];
      }
      
      if (!data || data.length === 0) {
        logDebug('Nenhuma pescaria encontrada no banco de dados.');
        return [];
      }
      
      const trips = data.map(trip => {
        const tripData = trip.data as FishingTripData;
        return {
          id: trip.id,
          lastUpdated: tripData.lastUpdated || trip.last_updated.getTime(),
          participants: tripData.participants?.length || 0
        };
      });
      
      logDebug(`Encontradas ${trips.length} pescarias`);
      return trips;
    } catch (error) {
      console.error("Erro ao listar pescarias:", error);
      return [];
    }
  },

  // Buscar uma pescaria por ID
  fetchTrip: async (tripId: string): Promise<FishingTripData | null> => {
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
      
      const tripData = data.data as FishingTripData;
      
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
  },

  // Salvar uma pescaria
  saveTrip: async (tripId: string, data: FishingTripData): Promise<void> => {
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
      
      // Tenta atualizar primeiro, se não existir, insere
      const { error: upsertError } = await supabase
        .from('fishing_trips')
        .upsert({
          id: normalizedId,
          data: data,
          last_updated: new Date()
        })
        .select();
      
      if (upsertError) {
        console.error(`Erro ao salvar pescaria ${normalizedId}:`, upsertError);
        throw new Error("Falha ao salvar dados da pescaria no banco de dados");
      }
      
      logDebug(`Pescaria ${normalizedId} salva com sucesso no Supabase`);
      
      // Simula latência de rede
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return;
    } catch (error) {
      console.error("Erro ao salvar pescaria:", error);
      throw new Error("Falha ao salvar dados da pescaria");
    }
  },
  
  // Verificar se há uma versão mais recente dos dados da pescaria
  checkForUpdates: async (tripId: string, lastSyncTime: number): Promise<{hasUpdates: boolean, data?: FishingTripData}> => {
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
      
      const tripData = data.data as FishingTripData;
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
  },
  
  // Excluir uma pescaria
  deleteTrip: async (tripId: string): Promise<void> => {
    try {
      if (!tripId) {
        logDebug("ID de pescaria inválido na função deleteTrip.");
        return;
      }
      
      // Normaliza o ID
      const normalizedId = tripId.replace(STORAGE_PREFIX, "");
      
      logDebug(`Excluindo pescaria ${normalizedId} do Supabase`);
      
      const { error } = await supabase
        .from('fishing_trips')
        .delete()
        .eq('id', normalizedId);
      
      if (error) {
        console.error(`Erro ao excluir pescaria ${normalizedId}:`, error);
        throw new Error("Falha ao excluir dados da pescaria do banco de dados");
      }
      
      logDebug(`Pescaria ${normalizedId} excluída com sucesso do Supabase`);
      
      // Simula latência de rede
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return;
    } catch (error) {
      console.error("Erro ao excluir pescaria:", error);
      throw new Error("Falha ao excluir dados da pescaria");
    }
  }
};
