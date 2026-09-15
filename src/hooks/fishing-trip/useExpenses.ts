
import { useState } from "react";
import { Expense, Participant } from "@/types/fishingTrip";
import { apiService } from "@/services/apiService";
import { ExpenseSchema } from "@/lib/validation";

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [newExpenseDescription, setNewExpenseDescription] = useState("");
  const [newExpenseAmount, setNewExpenseAmount] = useState("");
  const [newExpensePaidBy, setNewExpensePaidBy] = useState("");
  const [allParticipantsShare, setAllParticipantsShare] = useState(true);
  const [newExpenseParticipantIds, setNewExpenseParticipantIds] = useState<string[]>([]);

  const addExpense = async (
    participants: Participant[], 
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

    if (!allParticipantsShare && newExpenseParticipantIds.length === 0) {
      return;
    }

    const payer = participants.find(p => p.id === newExpensePaidBy);
    if (!payer) {
      return;
    }

    const newExpense: Expense = {
      id: Date.now().toString(),
      description: result.data.description,
      amount: result.data.amount,
      paidBy: newExpensePaidBy,
      paidByName: payer.name,
      participantIds: allParticipantsShare ? undefined : newExpenseParticipantIds
    };

    const updatedExpenses = [...expenses, newExpense];
    setExpenses(updatedExpenses);

    setNewExpenseDescription("");
    setNewExpenseAmount("");
    setAllParticipantsShare(true);
    setNewExpenseParticipantIds([]);
    
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
      if (import.meta.env.DEV) console.error("Error saving expense:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const removeExpense = async (
    id: string, 
    participants: Participant[],
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
      if (import.meta.env.DEV) console.error("Error removing expense:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateExpense = async (
    updatedExpense: Expense,
    participants: Participant[],
    currentTripId: string,
    setIsSaving: (value: boolean) => void,
    setLastDataUpdate: (value: number) => void
  ) => {
    const result = ExpenseSchema.safeParse(updatedExpense);
    const payer = participants.find((participant) => participant.id === updatedExpense.paidBy);
    if (!result.success || !payer || updatedExpense.participantIds?.length === 0) return;

    const updatedExpenses = expenses.map((expense) =>
      expense.id === updatedExpense.id
        ? { ...updatedExpense, ...result.data, paidByName: payer.name }
        : expense
    );
    setExpenses(updatedExpenses);
    setIsSaving(true);
    const dataToSave = { participants, expenses: updatedExpenses, lastUpdated: Date.now() };

    try {
      await apiService.saveTrip(currentTripId, dataToSave);
      setLastDataUpdate(dataToSave.lastUpdated);
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error updating expense:", error);
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
    allParticipantsShare,
    setAllParticipantsShare,
    newExpenseParticipantIds,
    setNewExpenseParticipantIds,
    addExpense,
    removeExpense,
    updateExpense
  };
}
