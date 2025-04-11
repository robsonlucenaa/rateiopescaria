
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { apiService } from "@/services/apiService";
import { FishingTripData } from "@/types/fishingTrip";

// Função para gerar ID aleatório para pescaria (apenas 4 caracteres alfanuméricos)
const generateTripId = () => {
  // Gera um ID de 4 caracteres alfanuméricos
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export function useTripData() {
  const { toast } = useToast();
  const { tripId } = useParams();
  const navigate = useNavigate();
  
  const [currentTripId, setCurrentTripId] = useState<string>("");
  const [lastSyncTime, setLastSyncTime] = useState<number>(Date.now());
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [lastDataUpdate, setLastDataUpdate] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Configurar o ID da viagem e carregar dados
  useEffect(() => {
    if (tripId) {
      setCurrentTripId(tripId);
      loadTripData(tripId);
      console.log(`Carregando dados da pescaria ID: ${tripId}`);
    } else {
      const newTripId = generateTripId();
      setCurrentTripId(newTripId);
      navigate(`/trip/${newTripId}`, { replace: true });
      console.log(`Nova pescaria criada com ID: ${newTripId}`);
    }
  }, [tripId, navigate]);

  // Function to load trip data from backend
  const loadTripData = async (id: string) => {
    console.log(`Attempting to load trip data for ID: ${id}`);
    try {
      const tripData = await apiService.fetchTrip(id);
      
      if (tripData) {
        setLastSyncTime(tripData.lastUpdated || Date.now());
        setLastDataUpdate(tripData.lastUpdated || Date.now());
        
        toast({
          title: "Dados carregados",
          description: `Pescaria #${id} carregada com sucesso!`,
        });
        
        console.log(`Loaded trip data for ID: ${id}`, tripData);
        return tripData;
      } else {
        console.log(`No data found for trip ID: ${id}, creating new trip`);
        // If no data exists yet, create an empty trip
        const newTripData: FishingTripData = { 
          participants: [], 
          expenses: [], 
          lastUpdated: Date.now() 
        };
        await apiService.saveTrip(id, newTripData);
        return newTripData;
      }
    } catch (error) {
      console.error("Error loading trip data:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados da pescaria.",
        variant: "destructive",
      });
      return null;
    }
  };

  // Function to manually force refresh data from backend
  const forceRefresh = async () => {
    setIsRefreshing(true);
    if (currentTripId) {
      try {
        const tripData = await loadTripData(currentTripId);
        toast({
          title: "Dados atualizados",
          description: "Dados da pescaria sincronizados com sucesso!",
        });
        return tripData;
      } catch (error) {
        console.error("Error refreshing data:", error);
        toast({
          title: "Erro ao atualizar",
          description: "Não foi possível atualizar os dados.",
          variant: "destructive",
        });
        return null;
      } finally {
        setTimeout(() => setIsRefreshing(false), 1000);
      }
    }
    return null;
  };
  
  const startNewTrip = () => {
    const newTripId = generateTripId();
    setCurrentTripId(newTripId);
    setIsInitialLoad(true);
    navigate(`/trip/${newTripId}`, { replace: true });
    
    toast({
      title: "Nova pescaria criada",
      description: `Pescaria #${newTripId} iniciada!`,
    });
    
    return {
      participants: [],
      expenses: [],
      lastUpdated: Date.now()
    };
  };
  
  return {
    currentTripId,
    lastSyncTime,
    setLastSyncTime,
    isInitialLoad,
    setIsInitialLoad,
    lastDataUpdate,
    setLastDataUpdate,
    isSaving,
    setIsSaving,
    isRefreshing,
    loadTripData,
    forceRefresh,
    startNewTrip,
    generateTripId
  };
}
