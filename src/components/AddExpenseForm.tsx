
import React from "react";
import { Plus } from "lucide-react";
import { Participant } from "@/types/fishingTrip";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface AddExpenseFormProps {
  newExpenseDescription: string;
  setNewExpenseDescription: (description: string) => void;
  newExpenseAmount: string;
  setNewExpenseAmount: (amount: string) => void;
  newExpensePaidBy: string;
  setNewExpensePaidBy: (paidBy: string) => void;
  allParticipantsShare: boolean;
  setAllParticipantsShare: (value: boolean) => void;
  participantIds: string[];
  setParticipantIds: (ids: string[]) => void;
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
  allParticipantsShare,
  setAllParticipantsShare,
  participantIds,
  setParticipantIds,
  participants,
  addExpense
}) => {
  const toggleParticipant = (id: string, checked: boolean) => {
    setParticipantIds(checked ? [...participantIds, id] : participantIds.filter((item) => item !== id));
  };

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

      <fieldset className="rounded-lg border bg-background p-4 space-y-3">
        <legend className="px-1 text-sm font-medium">Quem participa deste rateio?</legend>
        <div className="flex items-center gap-2">
          <Checkbox
            id="all-expense-participants"
            checked={allParticipantsShare}
            onCheckedChange={(checked) => setAllParticipantsShare(checked === true)}
          />
          <Label htmlFor="all-expense-participants">Todos os participantes</Label>
        </div>
        {!allParticipantsShare && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t pt-3">
            {participants.map((participant) => (
              <div key={participant.id} className="flex items-center gap-2">
                <Checkbox
                  id={`expense-participant-${participant.id}`}
                  checked={participantIds.includes(participant.id)}
                  onCheckedChange={(checked) => toggleParticipant(participant.id, checked === true)}
                />
                <Label htmlFor={`expense-participant-${participant.id}`}>{participant.name}</Label>
              </div>
            ))}
          </div>
        )}
      </fieldset>
      
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
        <Button
          type="button"
          size="icon"
          onClick={addExpense}
          aria-label="Adicionar despesa"
          disabled={!allParticipantsShare && participantIds.length === 0}
          className="h-12 w-12 shrink-0"
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default AddExpenseForm;
