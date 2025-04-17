
import { useMemo } from "react";
import { Participant, Expense } from "@/types/fishingTrip";

interface ParticipantWithBalance extends Participant {
  balance: number;
  status: "positive" | "negative";
}

interface PaymentSuggestion {
  from: string;
  to: string;
  amount: number;
}

export function useSummaryCalculation(participants: Participant[], expenses: Expense[], amountPerPerson: number) {
  const participantBalances = useMemo(() => {
    return participants.map((participant) => {
      const balance = participant.paid - amountPerPerson;
      return {
        ...participant,
        balance,
        status: balance >= 0 ? "positive" : "negative",
      } as ParticipantWithBalance;
    });
  }, [participants, amountPerPerson]);

  // Sort by balance (negative first)
  const sortedParticipants = useMemo(() => {
    return [...participantBalances].sort((a, b) => a.balance - b.balance);
  }, [participantBalances]);

  // Generate payment suggestions for equal split
  const paymentSuggestions = useMemo(() => {
    const suggestions: PaymentSuggestion[] = [];
    
    // Find participants who paid more than their share (creditors)
    const creditors = sortedParticipants.filter(p => p.balance > 0);
    // Find participants who need to pay (debtors)
    const debtors = sortedParticipants.filter(p => p.balance < 0);

    // For each debtor, calculate how much they need to pay to each creditor
    debtors.forEach(debtor => {
      creditors.forEach(creditor => {
        // Calculate how much this debtor should pay to this creditor
        const debtAmount = Math.abs(debtor.balance / creditors.length);
        
        // Only create suggestion if there's an actual amount to pay
        if (debtAmount > 0) {
          suggestions.push({
            from: debtor.name,
            to: creditor.name,
            // Round to 2 decimal places to avoid floating point issues
            amount: Math.round(debtAmount * 100) / 100
          });
        }
      });
    });

    return suggestions;
  }, [sortedParticipants]);

  return {
    participantBalances,
    sortedParticipants,
    paymentSuggestions
  };
}
