
import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { User, DollarSign, Plus, X, Share2, Copy, Check } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import ParticipantCard from "./ParticipantCard";
import ExpenseCard from "./ExpenseCard";
import SummaryCard from "./SummaryCard";

export interface Participant {
  id: string;
  name: string;
  paid: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string; // ID of the participant who paid
  paidByName: string; // Name of the participant who paid
}

export interface FishingTripData {
  participants: Participant[];
  expenses: Expense[];
  lastUpdated: number; // timestamp for tracking updates
}

// Função para gerar ID aleatório para pescaria
const generateTripId = () => {
  return Math.random().toString(36).substring(2, 10);
};

const STORAGE_PREFIX = "fishing-trip-";
const SYNC_INTERVAL = 2000; // Check every 2 seconds

const ExpenseSplitter = () => {
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

  // Function to get all trips from localStorage
  const getAllTrips = (): Record<string, FishingTripData> => {
    const trips: Record<string, FishingTripData> = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_PREFIX)) {
          const tripId = key.replace(STORAGE_PREFIX, "");
          const data = localStorage.getItem(key);
          if (data) {
            try {
              const parsedData = JSON.parse(data) as FishingTripData;
              trips[tripId] = parsedData;
            } catch (e) {
              console.error(`Error parsing trip data for ${tripId}:`, e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error getting all trips:", error);
    }
    return trips;
  };

  // Set up the trip ID and load data
  useEffect(() => {
    if (tripId) {
      setCurrentTripId(tripId);
      loadTripData(tripId);
      console.log(`Loading trip data for ID: ${tripId}`);
    } else {
      const newTripId = generateTripId();
      setCurrentTripId(newTripId);
      navigate(`/trip/${newTripId}`, { replace: true });
      console.log(`Created new trip with ID: ${newTripId}`);
    }
  }, [tripId, navigate]);

  // Function to get trip data from localStorage
  const getTripData = (id: string): FishingTripData | null => {
    try {
      const data = localStorage.getItem(`${STORAGE_PREFIX}${id}`);
      if (data) {
        const parsedData = JSON.parse(data);
        console.log(`Retrieved data for trip ${id}:`, parsedData);
        return parsedData;
      }
      console.log(`No data found for trip ${id}`);
      return null;
    } catch (error) {
      console.error(`Error reading data for trip ${id}:`, error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados da pescaria.",
        variant: "destructive",
      });
      return null;
    }
  };

  // Function to save data to localStorage and notify other windows
  const saveTripData = (id: string, data: FishingTripData) => {
    try {
      // Add a timestamp to track updates
      data.lastUpdated = Date.now();
      
      // Save to localStorage
      localStorage.setItem(`${STORAGE_PREFIX}${id}`, JSON.stringify(data));
      console.log(`Saved data for trip ${id}:`, data);
      
      // Update lastDataUpdate time
      setLastDataUpdate(data.lastUpdated);
      
      // Create a custom event to notify other tabs/windows
      const event = new CustomEvent('fishing-trip-updated', { 
        detail: { tripId: id, timestamp: data.lastUpdated }
      });
      window.dispatchEvent(event);
      
      // Also dispatch a storage event to help with cross-tab communication
      // This is a hack because StorageEvent can't be manually created in all browsers
      localStorage.setItem('last-update', `${id}-${data.lastUpdated}`);
      localStorage.removeItem('last-update');
    } catch (error) {
      console.error(`Error saving data for trip ${id}:`, error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar os dados da pescaria.",
        variant: "destructive",
      });
    }
  };

  // Function to load trip data
  const loadTripData = (id: string) => {
    console.log(`Attempting to load trip data for ID: ${id}`);
    const tripData = getTripData(id);
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
      saveTripData(id, { participants: [], expenses: [], lastUpdated: Date.now() });
    }
  };

  // Listen for custom events from other windows/tabs
  useEffect(() => {
    const handleCustomEvent = (event: CustomEvent<{ tripId: string, timestamp: number }>) => {
      const { tripId: updatedTripId, timestamp } = event.detail;
      console.log(`Received custom event for trip ${updatedTripId}, timestamp: ${timestamp}`);
      
      if (updatedTripId === currentTripId && timestamp > lastSyncTime) {
        console.log(`Loading updated data from custom event`);
        loadTripData(currentTripId);
      }
    };

    // Add event listener for custom event
    window.addEventListener('fishing-trip-updated', handleCustomEvent as EventListener);
    
    // Listen for storage events (when localStorage changes in another tab/window)
    const handleStorageChange = (event: StorageEvent) => {
      console.log('Storage event:', event);
      
      // Check if it's our storage prefix or the last-update hack
      if (event.key && (
          event.key.startsWith(STORAGE_PREFIX) || 
          event.key === 'last-update'
      )) {
        // If it's the last-update hack, extract the tripId
        if (event.key === 'last-update' && event.newValue) {
          const [updatedTripId, timestamp] = event.newValue.split('-');
          if (updatedTripId === currentTripId) {
            console.log(`Loading updated data from storage event (last-update)`);
            loadTripData(currentTripId);
          }
        }
        // If it's our specific trip
        else if (event.key === `${STORAGE_PREFIX}${currentTripId}` && event.newValue) {
          try {
            const newData = JSON.parse(event.newValue);
            if (newData.lastUpdated > lastSyncTime) {
              console.log(`Loading updated data from storage event`);
              setParticipants(newData.participants);
              setExpenses(newData.expenses);
              setLastSyncTime(newData.lastUpdated);
              
              toast({
                title: "Dados atualizados",
                description: "Os dados da pescaria foram atualizados!",
              });
            }
          } catch (error) {
            console.error("Error parsing storage event data:", error);
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('fishing-trip-updated', handleCustomEvent as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [currentTripId, lastSyncTime, toast]);

  // Poll for updates regularly
  useEffect(() => {
    if (!currentTripId) return;

    const checkForUpdates = () => {
      const tripData = getTripData(currentTripId);
      if (tripData && tripData.lastUpdated > lastSyncTime) {
        console.log(`Found newer data when polling: `, tripData);
        setParticipants(tripData.participants);
        setExpenses(tripData.expenses);
        setLastSyncTime(tripData.lastUpdated);
        
        toast({
          title: "Dados atualizados",
          description: "Novos dados da pescaria foram encontrados!",
        });
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

  // Save data to localStorage whenever participants or expenses change
  useEffect(() => {
    if (currentTripId && !isInitialLoad && (participants.length > 0 || expenses.length > 0)) {
      // Only save if we've made a change (not just loaded data)
      if (Date.now() - lastDataUpdate > 1000) {
        console.log(`Saving updated trip data, participants: ${participants.length}, expenses: ${expenses.length}`);
        const dataToSave: FishingTripData = {
          participants,
          expenses,
          lastUpdated: Date.now()
        };
        saveTripData(currentTripId, dataToSave);
      }
    }
  }, [participants, expenses, currentTripId, isInitialLoad, lastDataUpdate]);

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

  const addExpense = () => {
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
    
    // Force immediate save to localStorage
    const dataToSave: FishingTripData = {
      participants,
      expenses: updatedExpenses,
      lastUpdated: Date.now()
    };
    saveTripData(currentTripId, dataToSave);
  };

  const removeExpense = (id: string) => {
    const updatedExpenses = expenses.filter((e) => e.id !== id);
    setExpenses(updatedExpenses);
    
    // Force immediate save to localStorage
    const dataToSave: FishingTripData = {
      participants,
      expenses: updatedExpenses,
      lastUpdated: Date.now()
    };
    saveTripData(currentTripId, dataToSave);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getTabButtonClass = (tab: "participants" | "expenses" | "summary") => {
    return `flex items-center justify-center py-3 px-4 rounded-t-xl text-sm font-medium button-effect ${
      activeTab === tab
        ? "bg-white text-primary border-b-2 border-primary"
        : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
    }`;
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

  // Function to manually force refresh data from localStorage
  const forceRefresh = () => {
    setIsRefreshing(true);
    if (currentTripId) {
      loadTripData(currentTripId);
      toast({
        title: "Dados atualizados",
        description: "Dados da pescaria sincronizados com sucesso!",
      });
    }
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Function to list all saved trips
  const getAllSavedTrips = () => {
    const trips = getAllTrips();
    return Object.entries(trips).map(([id, data]) => ({
      id,
      participantCount: data.participants.length,
      expenseCount: data.expenses.length,
      total: data.expenses.reduce((sum, expense) => sum + expense.amount, 0),
      lastUpdated: new Date(data.lastUpdated).toLocaleDateString('pt-BR')
    }));
  };

  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in">
      <div className="bg-primary/10 rounded-xl p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-medium text-primary">ID da Pescaria: {currentTripId}</h3>
          <p className="text-xs text-muted-foreground">Compartilhe este ID para outros participantes</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={forceRefresh}
            className={`flex items-center space-x-1 ${isRefreshing ? 'bg-primary/20' : 'bg-secondary'} px-3 py-1.5 rounded-lg text-sm button-effect`}
            title="Atualizar dados"
            disabled={isRefreshing}
          >
            <Share2 className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Atualizando...' : 'Atualizar'}</span>
          </button>
          <button
            onClick={copyShareLink}
            className="flex items-center space-x-1 bg-white px-3 py-1.5 rounded-lg text-sm button-effect"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            <span>Copiar Link</span>
          </button>
          <button
            onClick={startNewTrip}
            className="bg-primary text-white px-3 py-1.5 rounded-lg text-sm button-effect"
          >
            Nova Pescaria
          </button>
        </div>
      </div>

      <div className="flex justify-between mb-6">
        <button
          className={getTabButtonClass("participants")}
          onClick={() => setActiveTab("participants")}
        >
          <User className="w-4 h-4 mr-2" />
          Participantes
        </button>
        <button
          className={getTabButtonClass("expenses")}
          onClick={() => setActiveTab("expenses")}
          disabled={participants.length === 0}
        >
          <DollarSign className="w-4 h-4 mr-2" />
          Despesas
        </button>
        <button
          className={getTabButtonClass("summary")}
          onClick={() => setActiveTab("summary")}
          disabled={participants.length === 0 || expenses.length === 0}
        >
          <DollarSign className="w-4 h-4 mr-2" />
          Resumo
        </button>
      </div>

      <div className="glass-card rounded-2xl p-6 mb-8 min-h-[400px] animate-scale-in">
        {activeTab === "participants" && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-medium text-foreground/90">
              Quem participou da pescaria?
            </h2>
            
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Nome do participante"
                  value={newParticipantName}
                  onChange={(e) => setNewParticipantName(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl bg-background border input-effect focus:outline-none"
                  onKeyDown={(e) => e.key === "Enter" && addParticipant()}
                />
                <button
                  onClick={addParticipant}
                  className="p-3 bg-primary text-white rounded-xl button-effect"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              {participants.map((participant) => (
                <ParticipantCard
                  key={participant.id}
                  participant={participant}
                  onRemove={removeParticipant}
                  onPaidChange={() => {}}
                  formatCurrency={formatCurrency}
                  readOnly={true}
                />
              ))}
            </div>

            {participants.length > 0 && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setActiveTab("expenses")}
                  className="px-6 py-2.5 bg-primary text-white rounded-xl button-effect"
                >
                  Próximo: Despesas
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "expenses" && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-medium text-foreground/90">
              Adicione as despesas da pescaria
            </h2>
            
            <div className="flex flex-col space-y-4">
              <input
                type="text"
                placeholder="Descrição (Ex: Isca, Gasolina)"
                value={newExpenseDescription}
                onChange={(e) => setNewExpenseDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-background border input-effect focus:outline-none"
              />
              
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Valor"
                  value={newExpenseAmount}
                  onChange={(e) => setNewExpenseAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-background border input-effect focus:outline-none"
                  onKeyDown={(e) => e.key === "Enter" && addExpense()}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <select
                  value={newExpensePaidBy}
                  onChange={(e) => setNewExpensePaidBy(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-background border input-effect focus:outline-none"
                >
                  <option value="">Quem pagou esta despesa?</option>
                  {participants.map(participant => (
                    <option key={participant.id} value={participant.id}>
                      {participant.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={addExpense}
                  className="p-3 bg-primary text-white rounded-xl button-effect"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              {expenses.map((expense) => (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  onRemove={removeExpense}
                  formatCurrency={formatCurrency}
                />
              ))}
            </div>

            {expenses.length > 0 && (
              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setActiveTab("participants")}
                  className="px-6 py-2.5 bg-secondary text-secondary-foreground rounded-xl button-effect"
                >
                  Voltar: Participantes
                </button>
                <button
                  onClick={() => setActiveTab("summary")}
                  className="px-6 py-2.5 bg-primary text-white rounded-xl button-effect"
                >
                  Próximo: Resumo
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "summary" && (
          <SummaryCard
            participants={participants}
            expenses={expenses}
            totalAmount={totalAmount}
            amountPerPerson={amountPerPerson}
            formatCurrency={formatCurrency}
            onBack={() => setActiveTab("expenses")}
          />
        )}
      </div>
    </div>
  );
};

export default ExpenseSplitter;
