
import { useEffect } from "react";
import { apiService } from "@/services/apiService";
import { FishingTripData } from "@/types/fishingTrip";

const SYNC_INTERVAL = 10000; // Verificar a cada 10 segundos

export function useSyncData(
  currentTripId: string,
  lastSyncTime: number,
  setLastSyncTime: (time: number) => void, 
  setParticipants: (participants: any[]) => void, 
  setExpenses: (expenses: any[]) => void
) {
  // Removed useToast hook
  
  // Poll for updates regularly from the backend
  useEffect(() => {
    if (!currentTripId) return;

    const checkForUpdates = async () => {
      try {
        const { hasUpdates, data } = await apiService.checkForUpdates(currentTripId, lastSyncTime);
        
        if (hasUpdates && data) {
          console.log(`Found newer data when polling: `, data);
          setParticipants(data.participants);
          setExpenses(data.expenses);
          setLastSyncTime(data.lastUpdated);
          
          // Removed toast notification
        }
      } catch (error) {
        console.error("Error checking for updates:", error);
      }
    };

    const pollInterval = setInterval(checkForUpdates, SYNC_INTERVAL);
    return () => clearInterval(pollInterval);
  }, [currentTripId, lastSyncTime, setParticipants, setExpenses, setLastSyncTime]);

  const saveData = async (
    currentTripId: string, 
    participants: any[], 
    expenses: any[], 
    isSaving: boolean,
    setIsSaving: (value: boolean) => void, 
    setLastDataUpdate: (value: number) => void
  ) => {
    if (!currentTripId || isSaving) return;
    
    setIsSaving(true);
    console.log(`Saving trip data, participants: ${participants.length}, expenses: ${expenses.length}`);
    
    const dataToSave: FishingTripData = {
      participants,
      expenses,
      lastUpdated: Date.now()
    };
    
    try {
      await apiService.saveTrip(currentTripId, dataToSave);
      setLastDataUpdate(dataToSave.lastUpdated);
      
      // Removed toast notification for successful save
    } catch (error) {
      console.error("Error saving trip data:", error);
      // Removed error toast notification
    } finally {
      setIsSaving(false);
    }
  };

  return { saveData };
}
