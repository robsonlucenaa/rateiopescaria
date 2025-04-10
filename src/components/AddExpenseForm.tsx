
import React from "react";
import { Plus } from "lucide-react";
import { Participant } from "@/types/fishingTrip";

interface AddExpenseFormProps {
  newExpenseDescription: string;
  setNewExpenseDescription: (description: string) => void;
  newExpenseAmount: string;
  setNewExpenseAmount: (amount: string) => void;
  newExpensePaidBy: string;
  setNewExpensePaidBy: (paidBy: string) => void;
  participants: Participant[];
  addExpense: () => void;
}

const AddExpenseForm: React.FC<AddExpenseFormProps> = ({
  newExpenseDescription,
  setNewExpenseDescription,
  newExpenseAmount,
  setNewExpenseAmount,
  newExpensePaidBy,
  setNewExpensePaidBy,
  participants,
  addExpense
}) => {
  return (
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
  );
};

export default AddExpenseForm;
