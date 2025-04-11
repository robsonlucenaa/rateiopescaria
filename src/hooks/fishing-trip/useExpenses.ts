import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Expense } from "@/types/fishingTrip";
import { apiService } from "@/services/apiService";

export function useExpenses() {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [newExpenseDescription, setNewExpenseDescription] = useState("");
  const [newExpenseAmount, setNewExpenseAmount] = useState("");
  const [newExpensePaidBy, setNewExpensePaidBy] = useState("");

  const addExpense = async (
    participants: any[], 
    currentTripId: string,
    setIsSaving: (value: boolean) => void,
    setLastDataUpdate: (value: number) => void
  ) => {
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
    const dataToSave = {
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

  const removeExpense = async (
    id: string, 
    participants: any[],
    currentTripId: string,
    setIsSaving: (value: boolean) => void,
    setLastDataUpdate: (value: number) => void
  ) => {
    const updatedExpenses = expenses.filter((e) => e.id !== id);
    setExpenses(updatedExpenses);
    
    // Force immediate save to backend
    setIsSaving(true);
    const dataToSave = {
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
  
  return {
    expenses,
    setExpenses,
    newExpenseDescription,
    setNewExpenseDescription,
    newExpenseAmount,
    setNewExpenseAmount,
    newExpensePaidBy,
    setNewExpensePaidBy,
    addExpense,
    removeExpense
  };
}
