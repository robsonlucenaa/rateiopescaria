import { useEffect } from "react";
import { useTripData } from "./fishing-trip/useTripData";
import { useSyncData } from "./fishing-trip/useSyncData";
import { useParticipants } from "./fishing-trip/useParticipants"; 
import { useExpenses } from "./fishing-trip/useExpenses";
import { useSummary } from "./fishing-trip/useSummary";
import { useShareLink } from "./fishing-trip/useShareLink";
import { useTabNavigation } from "./fishing-trip/useTabNavigation";
import { FishingTripData } from "@/types/fishingTrip";
import { useToast } from "@/components/ui/use-toast";

export function useFishingTrip() {
  // Remove useToast hook since we're removing all toasts
  const { toast } = useToast();
  
  // Combine all our smaller hooks
  const {
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
    startNewTrip
  } = useTripData();

  const {
    participants,
    setParticipants,
    newParticipantName,
    setNewParticipantName,
    newParticipantPaid,
    setNewParticipantPaid,
    addParticipant: _addParticipant,
    removeParticipant: _removeParticipant
  } = useParticipants();

  const {
    expenses,
    setExpenses,
    newExpenseDescription,
    setNewExpenseDescription,
    newExpenseAmount,
    setNewExpenseAmount,
    newExpensePaidBy,
    setNewExpensePaidBy,
    addExpense: _addExpense,
    removeExpense: _removeExpense
  } = useExpenses();

  const { saveData } = useSyncData(currentTripId, lastSyncTime, setLastSyncTime, setParticipants, setExpenses);
  const { totalAmount, amountPerPerson, formatCurrency } = useSummary(participants, expenses);
  const { shareUrl, copied, copyShareLink } = useShareLink(currentTripId);
  const { activeTab, setActiveTab, updateActiveTabBasedOnData } = useTabNavigation();

  // Load initial data and set active tab based on data
  useEffect(() => {
    const initializeData = async () => {
      if (currentTripId && isInitialLoad) {
        try {
          const tripData = await loadTripData(currentTripId);
          if (tripData) {
            setParticipants(tripData.participants || []);
            setExpenses(tripData.expenses || []);
            updateActiveTabBasedOnData(
              tripData.participants || [], 
              tripData.expenses || [], 
              isInitialLoad
            );
            setIsInitialLoad(false);
          }
        } catch (error) {
          console.error("Falha ao carregar dados iniciais:", error);
          // Removed toast notification
          toast({
            title: "Erro ao carregar",
            description: "Não foi possível carregar os dados da pescaria.",
            variant: "destructive",
          });
        }
      }
    };
    
    initializeData();
  }, [currentTripId, isInitialLoad]);

  // Save data to backend when participants or expenses change
  useEffect(() => {
    const handleSaveData = async () => {
      if (currentTripId && !isInitialLoad && 
          (participants.length > 0 || expenses.length > 0) && 
          Date.now() - lastDataUpdate > 1000) {
        await saveData(
          currentTripId, 
          participants, 
          expenses, 
          isSaving, 
          setIsSaving, 
          setLastDataUpdate
        );
      }
    };
    
    // Use debounce para não salvar a cada pequena alteração
    const timeoutId = setTimeout(() => {
      handleSaveData();
    }, 1500);  // Aguarde 1.5s após a última alteração
    
    return () => clearTimeout(timeoutId);
  }, [participants, expenses, currentTripId, isInitialLoad, lastDataUpdate]);

  // Wrapper functions to encapsulate internal implementation
  const addParticipant = () => _addParticipant();
  
  const removeParticipant = (id: string) => {
    _removeParticipant(id, expenses, setExpenses);
  };

  const addExpense = async () => {
    await _addExpense(participants, currentTripId, setIsSaving, setLastDataUpdate);
  };

  const removeExpense = async (id: string) => {
    await _removeExpense(id, participants, currentTripId, setIsSaving, setLastDataUpdate);
  };

  const handleStartNewTrip = () => {
    const newTripData = startNewTrip();
    setParticipants(newTripData.participants);
    setExpenses(newTripData.expenses);
    setActiveTab("participants");
  };

  return {
    participants,
    expenses,
    newParticipantName,
    setNewParticipantName,
    newParticipantPaid,
    newExpenseDescription,
    setNewExpenseDescription,
    newExpenseAmount,
    setNewExpenseAmount,
    newExpensePaidBy,
    setNewExpensePaidBy,
    activeTab,
    setActiveTab,
    totalAmount,
    amountPerPerson,
    currentTripId,
    shareUrl,
    copied,
    isRefreshing,
    isSaving,
    addParticipant,
    removeParticipant,
    addExpense,
    removeExpense,
    copyShareLink,
    startNewTrip: handleStartNewTrip,
    forceRefresh,
    formatCurrency
  };
}
