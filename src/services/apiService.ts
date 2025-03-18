
// Serviço de API para armazenar e recuperar dados de pescarias
// Simula um banco de dados usando localStorage

import { FishingTripData } from "@/components/ExpenseSplitter";

// Função de log para depuração
const logDebug = (message: string, data?: any) => {
  console.log(`[ApiService] ${message}`, data || '');
};

// Prefixo padrão para chaves de armazenamento
const STORAGE_PREFIX = "fishing-trip-";

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
        if (key && key.startsWith(STORAGE_PREFIX)) {
          const tripId = key.replace(STORAGE_PREFIX, "");
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
      if (!tripId) {
        logDebug("ID de pescaria inválido na função fetchTrip.");
        return null;
      }
      
      // Normaliza o ID para garantir consistência
      const normalizedId = tripId.replace(STORAGE_PREFIX, "");
      const storageKey = `${STORAGE_PREFIX}${normalizedId}`;
      
      logDebug(`Buscando pescaria com ID: ${normalizedId}, chave de armazenamento: ${storageKey}`);
      
      const tripData = localStorage.getItem(storageKey);
      if (tripData) {
        try {
          const parsedData = JSON.parse(tripData) as FishingTripData;
          logDebug(`Pescaria ${normalizedId} encontrada com sucesso:`, {
            participantes: parsedData.participants?.length || 0,
            despesas: parsedData.expenses?.length || 0,
            ultimaAtualizacao: new Date(parsedData.lastUpdated).toISOString()
          });
          
          // Verifica a integridade dos dados
          if (!parsedData.participants) parsedData.participants = [];
          if (!parsedData.expenses) parsedData.expenses = [];
          
          return parsedData;
        } catch (parseError) {
          console.error(`Erro ao analisar dados da pescaria ${normalizedId}:`, parseError);
          return null;
        }
      }
      
      logDebug(`Pescaria ${normalizedId} não encontrada no armazenamento local`);
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
      
      // Normaliza o ID da pescaria (remova o prefixo se já existir)
      const normalizedId = tripId.replace(STORAGE_PREFIX, "");
      const storageKey = `${STORAGE_PREFIX}${normalizedId}`;
      
      // Verificar se temos participantes e despesas
      if (!data.participants) data.participants = [];
      if (!data.expenses) data.expenses = [];
      
      // Adiciona timestamp atual
      data.lastUpdated = Date.now();
      
      // Salva no localStorage com a chave normalizada
      localStorage.setItem(storageKey, JSON.stringify(data));
      
      logDebug(`Pescaria ${normalizedId} salva com sucesso:`, {
        key: storageKey,
        participants: data.participants.length,
        expenses: data.expenses.length,
        lastUpdated: new Date(data.lastUpdated).toISOString()
      });
      
      // Verifica se os dados foram realmente salvos
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        try {
          const parsedSaved = JSON.parse(savedData) as FishingTripData;
          logDebug(`Verificação após salvar: dados salvos corretamente com ${parsedSaved.participants.length} participantes e ${parsedSaved.expenses.length} despesas.`);
        } catch (parseError) {
          console.error("Erro na verificação após salvar:", parseError);
        }
      } else {
        console.error(`ERRO CRÍTICO: Dados da pescaria ${normalizedId} não puderam ser verificados após salvar.`);
      }
      
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
      if (!tripId) {
        logDebug("ID de pescaria inválido na função deleteTrip.");
        return;
      }
      
      // Normaliza o ID
      const normalizedId = tripId.replace(STORAGE_PREFIX, "");
      const storageKey = `${STORAGE_PREFIX}${normalizedId}`;
      
      localStorage.removeItem(storageKey);
      logDebug(`Pescaria ${normalizedId} excluída com sucesso`);
      
      // Simula latência de rede
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return;
    } catch (error) {
      console.error("Erro ao excluir pescaria:", error);
      throw new Error("Falha ao excluir dados da pescaria");
    }
  }
};
