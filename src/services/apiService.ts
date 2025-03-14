
// Serviço de API para armazenar e recuperar dados de pescarias
// Simula um banco de dados usando localStorage

import { FishingTripData } from "@/components/ExpenseSplitter";

// Simulando uma API de backend com localStorage
// Em uma implementação real, isso usaria chamadas fetch para um servidor
export const apiService = {
  // Listar todas as pescarias
  getAllTrips: async (): Promise<{ id: string; lastUpdated: number; participants: number }[]> => {
    try {
      const trips: { id: string; lastUpdated: number; participants: number }[] = [];
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
      const tripData = localStorage.getItem(`fishing-trip-${tripId}`);
      if (tripData) {
        return JSON.parse(tripData) as FishingTripData;
      }
      return null;
    } catch (error) {
      console.error("Erro ao buscar pescaria:", error);
      throw new Error("Falha ao buscar dados da pescaria");
    }
  },

  // Salvar uma pescaria
  saveTrip: async (tripId: string, data: FishingTripData): Promise<void> => {
    try {
      // Adiciona timestamp atual
      data.lastUpdated = Date.now();
      localStorage.setItem(`fishing-trip-${tripId}`, JSON.stringify(data));
      
      // Em um backend real, isso seria uma chamada de API
      console.log(`Pescaria ${tripId} salva no "banco de dados"`);
      
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
      const data = await apiService.fetchTrip(tripId);
      if (data && data.lastUpdated > lastSyncTime) {
        return { hasUpdates: true, data };
      }
      return { hasUpdates: false };
    } catch (error) {
      console.error("Erro ao verificar atualizações:", error);
      return { hasUpdates: false };
    }
  }
};
