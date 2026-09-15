
import { useState } from "react";
import { Participant } from "@/types/fishingTrip";
import { ParticipantNameSchema } from "@/lib/validation";

export function useParticipants() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [newParticipantName, setNewParticipantName] = useState("");
  const [newParticipantPaid, setNewParticipantPaid] = useState("");

  const addParticipant = () => {
    const result = ParticipantNameSchema.safeParse(newParticipantName);
    if (!result.success) {
      return;
    }

    const newParticipant = {
      id: Date.now().toString(),
      name: result.data,
      paid: 0,
    };

    setParticipants([...participants, newParticipant]);
    setNewParticipantName("");
    setNewParticipantPaid("");
  };

  const removeParticipant = (id: string, expenses: any[], setExpenses: (expenses: any[]) => void) => {
    setExpenses(
      expenses
        .filter(expense => expense.paidBy !== id)
        .map(expense => {
          if (!expense.participantIds) return expense;
          const remainingIds = expense.participantIds.filter((participantId: string) => participantId !== id);
          return { ...expense, participantIds: remainingIds.length > 0 ? remainingIds : undefined };
        })
    );
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
