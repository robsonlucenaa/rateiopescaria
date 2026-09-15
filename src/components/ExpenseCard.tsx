
import React, { useState } from "react";
import { X, DollarSign, Pencil, Users } from "lucide-react";
import { Expense, Participant } from "@/types/fishingTrip";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ExpenseCardProps {
  expense: Expense;
  participants: Participant[];
  onRemove: (id: string) => void;
  onUpdate: (expense: Expense) => void;
  formatCurrency: (value: number) => string;
}

const ExpenseCard = ({
  expense,
  participants,
  onRemove,
  onUpdate,
  formatCurrency,
}: ExpenseCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(expense.description);
  const [amount, setAmount] = useState(String(expense.amount));
  const [paidBy, setPaidBy] = useState(expense.paidBy);
  const [allShare, setAllShare] = useState(!expense.participantIds);
  const [participantIds, setParticipantIds] = useState(expense.participantIds ?? []);

  const sharingParticipants = expense.participantIds
    ? participants.filter((participant) => expense.participantIds?.includes(participant.id))
    : participants;

  const openEditor = () => {
    setDescription(expense.description);
    setAmount(String(expense.amount));
    setPaidBy(expense.paidBy);
    setAllShare(!expense.participantIds);
    setParticipantIds(expense.participantIds ?? []);
    setIsEditing(true);
  };

  const saveChanges = () => {
    const parsedAmount = Number(amount);
    if (!description.trim() || parsedAmount <= 0 || !paidBy || (!allShare && participantIds.length === 0)) return;
    onUpdate({
      ...expense,
      description: description.trim(),
      amount: parsedAmount,
      paidBy,
      participantIds: allShare ? undefined : participantIds,
    });
    setIsEditing(false);
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-border/50 transition-all hover:shadow-md group animate-scale-in">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-medium text-foreground">{expense.description}</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button type="button" variant="ghost" size="icon" onClick={openEditor} aria-label={`Editar ${expense.description}`} className="h-8 w-8">
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onRemove(expense.id)}
            aria-label={`Excluir ${expense.description}`}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className="mt-3 space-y-2">
        <div>
          <div className="text-sm text-muted-foreground mb-1">Valor:</div>
          <div className="font-medium text-foreground">
            {formatCurrency(expense.amount)}
          </div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground mb-1">Pago por:</div>
          <div className="font-medium text-foreground">
            {expense.paidByName}
          </div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1.5">
            <Users className="h-4 w-4" /> Participam do rateio:
          </div>
          <div className="font-medium text-foreground">
            {!expense.participantIds ? "Todos" : sharingParticipants.map((participant) => participant.name).join(", ")}
          </div>
        </div>
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar despesa</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <input value={description} onChange={(event) => setDescription(event.target.value)} aria-label="Descrição" className="w-full px-4 py-3 rounded-lg bg-background border input-effect focus:outline-none" />
            <input type="number" value={amount} onChange={(event) => setAmount(event.target.value)} aria-label="Valor" className="w-full px-4 py-3 rounded-lg bg-background border input-effect focus:outline-none" />
            <select value={paidBy} onChange={(event) => setPaidBy(event.target.value)} aria-label="Quem pagou" className="w-full px-4 py-3 rounded-lg bg-background border input-effect focus:outline-none">
              {participants.map((participant) => <option key={participant.id} value={participant.id}>{participant.name}</option>)}
            </select>
            <fieldset className="rounded-lg border p-4 space-y-3">
              <legend className="px-1 text-sm font-medium">Quem participa deste rateio?</legend>
              <div className="flex items-center gap-2">
                <Checkbox id={`edit-all-${expense.id}`} checked={allShare} onCheckedChange={(checked) => setAllShare(checked === true)} />
                <Label htmlFor={`edit-all-${expense.id}`}>Todos os participantes</Label>
              </div>
              {!allShare && participants.map((participant) => (
                <div key={participant.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`edit-${expense.id}-${participant.id}`}
                    checked={participantIds.includes(participant.id)}
                    onCheckedChange={(checked) => setParticipantIds(checked === true ? [...participantIds, participant.id] : participantIds.filter((id) => id !== participant.id))}
                  />
                  <Label htmlFor={`edit-${expense.id}-${participant.id}`}>{participant.name}</Label>
                </div>
              ))}
            </fieldset>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setIsEditing(false)}>Cancelar</Button>
            <Button type="button" onClick={saveChanges} disabled={!allShare && participantIds.length === 0}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExpenseCard;
