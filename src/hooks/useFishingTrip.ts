import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useParams, useNavigate } from "react-router-dom";
import { apiService } from "@/services/apiService";
import { FishingTripData, Participant, Expense } from "@/types/fishingTrip";

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

const SYNC_INTERVAL = 10000; // Verificar a cada 10 segundos

export function useFishingTrip() {
  const { toast } = useToast();
  const { tripId } = useParams();
  const navigate = useNavigate();
  
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [newParticipantName, setNewParticipantName] = useState("");
  const [newParticipantPaid, setNewParticipantPaid] = useState("");
  const [newExpenseDescription, setNewExpenseDescription] = useState("");
  const [newExpenseAmount, setNewExpenseAmount] = useState("");
  const [newExpensePaidBy, setNewExpensePaidBy] = useState("");
  const [activeTab, setActiveTab] = useState<"participants" | "expenses" | "summary">("participants");
  const [totalAmount, setTotalAmount] = useState(0);
  const [amountPerPerson, setAmountPerPerson] = useState(0);
  const [currentTripId, setCurrentTripId] = useState<string>("");
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number>(Date.now());
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [lastDataUpdate, setLastDataUpdate] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
        setParticipants(tripData.participants || []);
        setExpenses(tripData.expenses || []);
        setLastSyncTime(tripData.lastUpdated || Date.now());
        setLastDataUpdate(tripData.lastUpdated || Date.now());
        
        if (isInitialLoad) {
          // Set the active tab based on data available
          if (tripData.participants.length > 0 && tripData.expenses.length > 0) {
            setActiveTab("summary");
          } else if (tripData.participants.length > 0) {
            setActiveTab("expenses");
          }
          setIsInitialLoad(false);
        }
        
        toast({
          title: "Dados carregados",
          description: `Pescaria #${id} carregada com sucesso!`,
        });
        
        console.log(`Loaded trip data for ID: ${id}`, tripData);
      } else {
        console.log(`No data found for trip ID: ${id}, creating new trip`);
        // If no data exists yet, create an empty trip
        const newTripData: FishingTripData = { 
          participants: [], 
          expenses: [], 
          lastUpdated: Date.now() 
        };
        await apiService.saveTrip(id, newTripData);
      }
    } catch (error) {
      console.error("Error loading trip data:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados da pescaria.",
        variant: "destructive",
      });
    }
  };

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
          
          toast({
            title: "Dados atualizados",
            description: "Novos dados da pescaria foram encontrados!",
          });
        }
      } catch (error) {
        console.error("Error checking for updates:", error);
      }
    };

    const pollInterval = setInterval(checkForUpdates, SYNC_INTERVAL);
    return () => clearInterval(pollInterval);
  }, [currentTripId, lastSyncTime, toast]);

  // Update share URL whenever currentTripId changes
  useEffect(() => {
    if (currentTripId) {
      const baseUrl = window.location.origin;
      setShareUrl(`${baseUrl}/trip/${currentTripId}`);
    }
  }, [currentTripId]);

  // Save data to backend whenever participants or expenses change
  useEffect(() => {
    const saveData = async () => {
      if (currentTripId && !isInitialLoad && (participants.length > 0 || expenses.length > 0)) {
        // Only save if we've made a change (not just loaded data)
        if (Date.now() - lastDataUpdate > 1000 && !isSaving) {
          setIsSaving(true);
          console.log(`Saving updated trip data, participants: ${participants.length}, expenses: ${expenses.length}`);
          
          const dataToSave: FishingTripData = {
            participants,
            expenses,
            lastUpdated: Date.now()
          };
          
          try {
            await apiService.saveTrip(currentTripId, dataToSave);
            setLastDataUpdate(dataToSave.lastUpdated);
          } catch (error) {
            console.error("Error saving trip data:", error);
            toast({
              title: "Erro ao salvar",
              description: "Não foi possível salvar os dados da pescaria.",
              variant: "destructive",
            });
          } finally {
            setIsSaving(false);
          }
        }
      }
    };
    
    saveData();
  }, [participants, expenses, currentTripId, isInitialLoad, lastDataUpdate, toast, isSaving]);

  // Calculate totals and update participant paid amounts
  useEffect(() => {
    // Calculate total expense
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    setTotalAmount(total);

    // Calculate amount per person
    const perPerson = participants.length > 0 ? total / participants.length : 0;
    setAmountPerPerson(perPerson);
    
    // Update participant paid amounts based on expenses
    if (participants.length > 0 && expenses.length > 0) {
      const updatedParticipants = participants.map(participant => {
        const participantExpenses = expenses.filter(expense => expense.paidBy === participant.id);
        const totalPaid = participantExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        return {
          ...participant,
          paid: totalPaid
        };
      });
      setParticipants(updatedParticipants);
    }
  }, [expenses, participants.length]);

  const addParticipant = () => {
    if (!newParticipantName.trim()) {
      toast({
        title: "Nome necessário",
        description: "Por favor, insira o nome do participante.",
        variant: "destructive",
      });
      return;
    }

    const newParticipant = {
      id: Date.now().toString(),
      name: newParticipantName,
      paid: 0,
    };

    setParticipants([...participants, newParticipant]);

    setNewParticipantName("");
    setNewParticipantPaid("");

    toast({
      title: "Participante adicionado",
      description: `${newParticipantName} foi adicionado à pescaria.`,
    });
  };

  const removeParticipant = (id: string) => {
    // Remove participant's expenses
    setExpenses(expenses.filter(expense => expense.paidBy !== id));
    // Remove participant
    setParticipants(participants.filter((p) => p.id !== id));
  };

  const addExpense = async () => {
    if (!newExpenseDescription.trim()) {
      toast({
        title: "Descrição necessária",
        description: "Por favor, descreva a despesa.",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(newExpenseAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Valor inválido",
        description: "Por favor, insira um valor válido maior que zero.",
        variant: "destructive",
      });
      return;
    }

    if (!newExpensePaidBy) {
      toast({
        title: "Participante necessário",
        description: "Por favor, selecione quem pagou esta despesa.",
        variant: "destructive",
      });
      return;
    }

    const payer = participants.find(p => p.id === newExpensePaidBy);
    if (!payer) {
      toast({
        title: "Participante inválido",
        description: "O participante selecionado não foi encontrado.",
        variant: "destructive",
      });
      return;
    }

    const newExpense = {
      id: Date.now().toString(),
      description: newExpenseDescription,
      amount,
      paidBy: newExpensePaidBy,
      paidByName: payer.name
    };

    const updatedExpenses = [...expenses, newExpense];
    setExpenses(updatedExpenses);

    setNewExpenseDescription("");
    setNewExpenseAmount("");
    // Keep the selected participant for the next expense for convenience

    toast({
      title: "Despesa adicionada",
      description: `${newExpenseDescription}: R$ ${amount.toFixed(2)} (Pago por ${payer.name})`,
    });
    
    // Force immediate save to backend
    setIsSaving(true);
    const dataToSave: FishingTripData = {
      participants,
      expenses: updatedExpenses,
      lastUpdated: Date.now()
    };
    
    try {
      await apiService.saveTrip(currentTripId, dataToSave);
      setLastDataUpdate(dataToSave.lastUpdated);
    } catch (error) {
      console.error("Error saving expense:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a despesa.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const removeExpense = async (id: string) => {
    const updatedExpenses = expenses.filter((e) => e.id !== id);
    setExpenses(updatedExpenses);
    
    // Force immediate save to backend
    setIsSaving(true);
    const dataToSave: FishingTripData = {
      participants,
      expenses: updatedExpenses,
      lastUpdated: Date.now()
    };
    
    try {
      await apiService.saveTrip(currentTripId, dataToSave);
      setLastDataUpdate(dataToSave.lastUpdated);
    } catch (error) {
      console.error("Error removing expense:", error);
      toast({
        title: "Erro ao remover",
        description: "Não foi possível remover a despesa.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast({
      title: "Link copiado!",
      description: "Link da pescaria copiado para a área de transferência.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const startNewTrip = () => {
    const newTripId = generateTripId();
    setCurrentTripId(newTripId);
    setParticipants([]);
    setExpenses([]);
    setActiveTab("participants");
    setIsInitialLoad(true);
    navigate(`/trip/${newTripId}`, { replace: true });
    
    toast({
      title: "Nova pescaria criada",
      description: `Pescaria #${newTripId} iniciada!`,
    });
  };

  // Function to manually force refresh data from backend
  const forceRefresh = async () => {
    setIsRefreshing(true);
    if (currentTripId) {
      try {
        await loadTripData(currentTripId);
        toast({
          title: "Dados atualizados",
          description: "Dados da pescaria sincronizados com sucesso!",
        });
      } catch (error) {
        console.error("Error refreshing data:", error);
        toast({
          title: "Erro ao atualizar",
          description: "Não foi possível atualizar os dados.",
          variant: "destructive",
        });
      } finally {
        setTimeout(() => setIsRefreshing(false), 1000);
      }
    }
  };

  // Format currency helper
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
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
    startNewTrip,
    forceRefresh,
    formatCurrency
  };
}
