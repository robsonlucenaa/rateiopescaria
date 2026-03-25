
import { useState } from "react";
import { Expense } from "@/types/fishingTrip";
import { apiService } from "@/services/apiService";
import { ExpenseSchema } from "@/lib/validation";

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
    const amount = parseFloat(newExpenseAmount);
    
    const result = ExpenseSchema.safeParse({
      description: newExpenseDescription,
      amount: isNaN(amount) ? 0 : amount,
    });
    
    if (!result.success) {
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
      description: result.data.description,
      amount: result.data.amount,
      paidBy: newExpensePaidBy,
      paidByName: payer.name
    };

    const updatedExpenses = [...expenses, newExpense];
    setExpenses(updatedExpenses);

    setNewExpenseDescription("");
    setNewExpenseAmount("");
    
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
