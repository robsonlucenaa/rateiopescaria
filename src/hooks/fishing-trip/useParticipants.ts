
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Participant } from "@/types/fishingTrip";

export function useParticipants() {
  const { toast } = useToast();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [newParticipantName, setNewParticipantName] = useState("");
  const [newParticipantPaid, setNewParticipantPaid] = useState("");

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

  const removeParticipant = (id: string, expenses: any[], setExpenses: (expenses: any[]) => void) => {
    // Remove participant's expenses
    setExpenses(expenses.filter(expense => expense.paidBy !== id));
    // Remove participant
    setParticipants(participants.filter((p) => p.id !== id));
  };

  return {
    participants,
    setParticipants,
    newParticipantName,
    setNewParticipantName,
    newParticipantPaid,
    setNewParticipantPaid,
    addParticipant,
    removeParticipant
  };
}
