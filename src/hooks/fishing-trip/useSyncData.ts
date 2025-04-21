import { useEffect } from "react";
import { apiService } from "@/services/apiService";
import { FishingTripData, Participant, Expense } from "@/types/fishingTrip";
import { useToast } from "@/components/ui/use-toast";

const SYNC_INTERVAL = 10000; // Verificar a cada 10 segundos

export function useSyncData(
  currentTripId: string,
  lastSyncTime: number,
  setLastSyncTime: (time: number) => void, 
  setParticipants: (participants: Participant[]) => void, 
  setExpenses: (expenses: Expense[]) => void
) {
  const { toast } = useToast();
  
  // Poll for updates regularly from the backend
  useEffect(() => {
    if (!currentTripId) return;

    const checkForUpdates = async () => {
      try {
        const { hasUpdates, data } = await apiService.checkForUpdates(currentTripId, lastSyncTime);
        
        if (hasUpdates && data) {
          console.log(`Found newer data when polling: `, data);
          
          // Process expenses to update participant paid amounts
          const updatedParticipants = updateParticipantPaidAmounts(data.participants, data.expenses);
          
          setParticipants(updatedParticipants);
          setExpenses(data.expenses);
          setLastSyncTime(data.lastUpdated);
          
          toast({
            title: "Dados atualizados",
            description: "Os dados da pescaria foram atualizados.",
          });
        }
      } catch (error) {
        console.error("Error checking for updates:", error);
      }
    };

    const pollInterval = setInterval(checkForUpdates, SYNC_INTERVAL);
    return () => clearInterval(pollInterval);
  }, [currentTripId, lastSyncTime, setParticipants, setExpenses, setLastSyncTime, toast]);

  // Helper function to update participant paid amounts based on expenses
  const updateParticipantPaidAmounts = (participants: Participant[], expenses: Expense[]): Participant[] => {
    const paidAmounts = new Map<string, number>();
    
    // Initialize with zero
    participants.forEach(p => {
      paidAmounts.set(p.id, 0);
    });
    
    // Sum up expenses by participant
    expenses.forEach(expense => {
      const currentPaid = paidAmounts.get(expense.paidBy) || 0;
      paidAmounts.set(expense.paidBy, currentPaid + expense.amount);
    });
    
    // Update participant paid amounts
    return participants.map(participant => ({
      ...participant,
      paid: paidAmounts.get(participant.id) || 0
    }));
  };

  const saveData = async (
    currentTripId: string, 
    participants: Participant[], 
    expenses: Expense[], 
    isSaving: boolean,
    setIsSaving: (value: boolean) => void, 
    setLastDataUpdate: (value: number) => void
  ) => {
    if (!currentTripId || isSaving) return;
    
    setIsSaving(true);
    console.log(`Saving trip data, participants: ${participants.length}, expenses: ${expenses.length}`);
    
    // Update participant paid amounts before saving
    const updatedParticipants = updateParticipantPaidAmounts(participants, expenses);
    
    const dataToSave: FishingTripData = {
      participants: updatedParticipants,
      expenses,
      lastUpdated: Date.now()
    };
    
    try {
      await apiService.saveTrip(currentTripId, dataToSave);
      setLastDataUpdate(dataToSave.lastUpdated);
      
      // Removed toast notification
    } catch (error) {
      console.error("Error saving trip data:", error);
      // Removed toast notification
    } finally {
      setIsSaving(false);
    }
  };

  return { saveData };
}
