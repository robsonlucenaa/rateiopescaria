
import React from "react";
import { Participant, Expense } from "@/types/fishingTrip";
import ExpenseCard from "./ExpenseCard";
import AddExpenseForm from "./AddExpenseForm";

interface ExpensesTabProps {
  expenses: Expense[];
  participants: Participant[];
  newExpenseDescription: string;
  setNewExpenseDescription: (description: string) => void;
  newExpenseAmount: string;
  setNewExpenseAmount: (amount: string) => void;
  newExpensePaidBy: string;
  setNewExpensePaidBy: (paidBy: string) => void;
  allParticipantsShare: boolean;
  setAllParticipantsShare: (value: boolean) => void;
  newExpenseParticipantIds: string[];
  setNewExpenseParticipantIds: (ids: string[]) => void;
  addExpense: () => void;
  removeExpense: (id: string) => void;
  updateExpense: (expense: Expense) => void;
  formatCurrency: (value: number) => string;
  onBack: () => void;
  onNext: () => void;
}

const ExpensesTab: React.FC<ExpensesTabProps> = ({
  expenses,
  participants,
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
  updateExpense,
  formatCurrency,
  onBack,
  onNext
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-medium text-foreground/90">
        Adicione as despesas da pescaria
      </h2>
      
      <AddExpenseForm 
        newExpenseDescription={newExpenseDescription}
        setNewExpenseDescription={setNewExpenseDescription}
        newExpenseAmount={newExpenseAmount}
        setNewExpenseAmount={setNewExpenseAmount}
        newExpensePaidBy={newExpensePaidBy}
        setNewExpensePaidBy={setNewExpensePaidBy}
        allParticipantsShare={allParticipantsShare}
        setAllParticipantsShare={setAllParticipantsShare}
        participantIds={newExpenseParticipantIds}
        setParticipantIds={setNewExpenseParticipantIds}
        participants={participants}
        addExpense={addExpense}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        {expenses.map((expense) => (
          <ExpenseCard
            key={expense.id}
            expense={expense}
            participants={participants}
            onRemove={removeExpense}
            onUpdate={updateExpense}
            formatCurrency={formatCurrency}
          />
        ))}
      </div>

      {expenses.length > 0 && (
        <div className="mt-6 flex justify-between">
          <button
            onClick={onBack}
            className="px-6 py-2.5 bg-secondary text-secondary-foreground rounded-xl button-effect"
          >
            Voltar: Participantes
          </button>
          <button
            onClick={onNext}
            className="px-6 py-2.5 bg-primary text-white rounded-xl button-effect"
          >
            Próximo: Resumo
          </button>
        </div>
      )}
    </div>
  );
};

export default ExpensesTab;
