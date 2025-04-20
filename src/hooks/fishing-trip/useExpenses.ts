
import { useState } from "react";
import { Expense } from "@/types/fishingTrip";
import { apiService } from "@/services/apiService";

export function useExpenses() {
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
      return;
    }

    const amount = parseFloat(newExpenseAmount);
    if (isNaN(amount) || amount <= 0) {
      return;
    }

    if (!newExpensePaidBy) {
      return;
    }

    const payer = participants.find(p => p.id === newExpensePaidBy);
    if (!payer) {
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
