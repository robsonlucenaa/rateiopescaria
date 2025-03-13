
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
const SYNC_INTERVAL = 5000; // 5 seconds

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
  const [lastSyncTime, setLastSyncTime] = useState<number>(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Inicializar currentTripId baseado no tripId da URL ou gerar um novo
  useEffect(() => {
    if (tripId) {
      setCurrentTripId(tripId);
      // Load trip data immediately when accessing via shared link
      loadTripData(tripId);
    } else {
      const newTripId = generateTripId();
      setCurrentTripId(newTripId);
      navigate(`/trip/${newTripId}`, { replace: true });
    }
  }, [tripId, navigate]);

  // Function to get all trips from storage
  const getAllTrips = (): Record<string, FishingTripData> => {
    try {
      const allTrips: Record<string, FishingTripData> = {};
      
      // Iterate through localStorage to find all fishing trips
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_PREFIX)) {
          const tripId = key.replace(STORAGE_PREFIX, "");
          const data = localStorage.getItem(key);
          if (data) {
            allTrips[tripId] = JSON.parse(data);
          }
        }
      }
      
      return allTrips;
    } catch (error) {
      console.error("Error getting all trips:", error);
      return {};
    }
  };

  // Function to get data from localStorage
  const getTripData = (id: string): FishingTripData | null => {
    try {
      const data = localStorage.getItem(`${STORAGE_PREFIX}${id}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error reading data from localStorage:", error);
      return null;
    }
  };

  // Function to save data to localStorage
  const saveTripData = (id: string, data: FishingTripData) => {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${id}`, JSON.stringify(data));
      
      // Use the Storage event to notify other tabs/windows of the change
      const event = new StorageEvent('storage', {
        key: `${STORAGE_PREFIX}${id}`,
        newValue: JSON.stringify(data),
        url: window.location.href
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error("Error saving data to localStorage:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar os dados da pescaria.",
        variant: "destructive",
      });
    }
  };

  // Function to load trip data
  const loadTripData = (id: string) => {
    const tripData = getTripData(id);
    if (tripData) {
      setParticipants(tripData.participants || []);
      setExpenses(tripData.expenses || []);
      setLastSyncTime(tripData.lastUpdated);
      
      if (isInitialLoad) {
        // Set the active tab based on data available
        if (tripData.participants.length > 0 && tripData.expenses.length > 0) {
          setActiveTab("summary");
        } else if (tripData.participants.length > 0) {
          setActiveTab("expenses");
        }
        setIsInitialLoad(false);
      }
      
      // Show toast on successful load
      toast({
        title: "Dados carregados",
        description: `Pescaria #${id} carregada com sucesso!`,
      });
    }
  };

  // Listen for storage events (when another tab updates the data)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key && event.key === `${STORAGE_PREFIX}${currentTripId}` && event.newValue) {
        try {
          const newData: FishingTripData = JSON.parse(event.newValue);
          if (newData.lastUpdated > lastSyncTime) {
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
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentTripId, lastSyncTime, toast]);

  // Regular polling for updates
  useEffect(() => {
    if (!currentTripId) return;

    const pollInterval = setInterval(() => {
      const tripData = getTripData(currentTripId);
      if (tripData && tripData.lastUpdated > lastSyncTime) {
        setParticipants(tripData.participants);
        setExpenses(tripData.expenses);
        setLastSyncTime(tripData.lastUpdated);
      }
    }, SYNC_INTERVAL);

    return () => clearInterval(pollInterval);
  }, [currentTripId, lastSyncTime]);

  // Update share URL whenever currentTripId changes
  useEffect(() => {
    if (currentTripId) {
      const baseUrl = window.location.origin;
      setShareUrl(`${baseUrl}/trip/${currentTripId}`);
    }
  }, [currentTripId]);

  // Salvar dados no localStorage sempre que participants ou expenses mudarem
  useEffect(() => {
    if (currentTripId && !isInitialLoad && (participants.length > 0 || expenses.length > 0)) {
      const dataToSave: FishingTripData = {
        participants,
        expenses,
        lastUpdated: Date.now()
      };
      saveTripData(currentTripId, dataToSave);
      setLastSyncTime(dataToSave.lastUpdated);
    }
  }, [participants, expenses, currentTripId, isInitialLoad]);

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

    setExpenses([...expenses, newExpense]);

    setNewExpenseDescription("");
    setNewExpenseAmount("");
    // Keep the selected participant for the next expense for convenience

    toast({
      title: "Despesa adicionada",
      description: `${newExpenseDescription}: R$ ${amount.toFixed(2)} (Pago por ${payer.name})`,
    });
  };

  const removeExpense = (id: string) => {
    setExpenses(expenses.filter((e) => e.id !== id));
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

  // Function to list all saved trips
  const getAllSavedTrips = () => {
    return Object.entries(getAllTrips()).map(([id, data]) => ({
      id,
      participantCount: data.participants.length,
      expenseCount: data.expenses.length,
      total: data.expenses.reduce((sum, expense) => sum + expense.amount, 0),
      lastUpdated: new Date(data.lastUpdated).toLocaleDateString('pt-BR')
    }));
  };

  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in">
      <div className="bg-primary/10 rounded-xl p-4 mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-primary">ID da Pescaria: {currentTripId}</h3>
          <p className="text-xs text-muted-foreground">Compartilhe este ID para outros participantes</p>
        </div>
        <div className="flex space-x-2">
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
