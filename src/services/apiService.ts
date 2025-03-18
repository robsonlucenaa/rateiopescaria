
// Serviço de API para armazenar e recuperar dados de pescarias
// Simula um banco de dados usando localStorage

import { FishingTripData } from "@/components/ExpenseSplitter";

// Função de log para depuração
const logDebug = (message: string, data?: any) => {
  console.log(`[ApiService] ${message}`, data || '');
};

// Simulando uma API de backend com localStorage
// Em uma implementação real, isso usaria chamadas fetch para um servidor
export const apiService = {
  // Listar todas as pescarias
  getAllTrips: async (): Promise<{ id: string; lastUpdated: number; participants: number }[]> => {
    try {
      const trips: { id: string; lastUpdated: number; participants: number }[] = [];
      logDebug(`Buscando todas as pescarias...`);
      
      // Percorre todos os itens no localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("fishing-trip-")) {
          const tripId = key.replace("fishing-trip-", "");
          const data = JSON.parse(localStorage.getItem(key) || "{}") as FishingTripData;
          
          trips.push({
            id: tripId,
            lastUpdated: data.lastUpdated || 0,
            participants: data.participants?.length || 0
          });
          
          logDebug(`Encontrada pescaria ${tripId} com ${data.participants?.length || 0} participantes`);
        }
      }
      
      // Ordena por data, mais recente primeiro
      return trips.sort((a, b) => b.lastUpdated - a.lastUpdated);
    } catch (error) {
      console.error("Erro ao listar pescarias:", error);
      return [];
    }
  },

  // Buscar uma pescaria por ID
  fetchTrip: async (tripId: string): Promise<FishingTripData | null> => {
    try {
      // Normaliza o ID para evitar problemas
      const normalizedId = tripId.replace("fishing-trip-", "");
      const storageKey = `fishing-trip-${normalizedId}`;
      
      logDebug(`Buscando pescaria com ID: ${normalizedId}, chave de armazenamento: ${storageKey}`);
      
      const tripData = localStorage.getItem(storageKey);
      if (tripData) {
        const parsedData = JSON.parse(tripData) as FishingTripData;
        logDebug(`Pescaria ${normalizedId} encontrada:`, parsedData);
        return parsedData;
      }
      
      logDebug(`Pescaria ${normalizedId} não encontrada`);
      return null;
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
      
      // Normalize o ID da pescaria (remova o prefixo se já existir)
      const normalizedId = tripId.replace("fishing-trip-", "");
      const storageKey = `fishing-trip-${normalizedId}`;
      
      // Verificar se temos participantes e despesas
      if (!data.participants) data.participants = [];
      if (!data.expenses) data.expenses = [];
      
      // Adiciona timestamp atual
      data.lastUpdated = Date.now();
      
      // Salva no localStorage com a chave normalizada
      localStorage.setItem(storageKey, JSON.stringify(data));
      
      logDebug(`Pescaria ${normalizedId} salva:`, {
        key: storageKey,
        participants: data.participants.length,
        expenses: data.expenses.length,
        lastUpdated: new Date(data.lastUpdated).toISOString()
      });
      
      // Verifica se os dados foram realmente salvos
      const verificacao = localStorage.getItem(storageKey);
      logDebug(`Verificação após salvar:`, verificacao ? "Dados presentes" : "ERRO: Dados ausentes");
      
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
      // Normaliza o ID para garantir consistência
      const normalizedId = tripId.replace("fishing-trip-", "");
      
      logDebug(`Verificando atualizações para ${normalizedId}, último sync: ${new Date(lastSyncTime).toISOString()}`);
      
      const data = await apiService.fetchTrip(normalizedId);
      if (data && data.lastUpdated > lastSyncTime) {
        logDebug(`Atualizações encontradas para ${normalizedId}, timestamp: ${new Date(data.lastUpdated).toISOString()}`);
        return { hasUpdates: true, data };
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
      // Normaliza o ID
      const normalizedId = tripId.replace("fishing-trip-", "");
      const storageKey = `fishing-trip-${normalizedId}`;
      
      localStorage.removeItem(storageKey);
      logDebug(`Pescaria ${normalizedId} excluída`);
      
      // Simula latência de rede
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return;
    } catch (error) {
      console.error("Erro ao excluir pescaria:", error);
      throw new Error("Falha ao excluir dados da pescaria");
    }
  }
};
