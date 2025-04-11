
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

  // Generate payment suggestions
  const paymentSuggestions = useMemo(() => {
    // Deep copy the participants with balances
    const debtors = sortedParticipants
      .filter(p => p.balance < 0)
      .map(p => ({ ...p, remainingDebt: Math.abs(p.balance) }));
    
    const creditors = sortedParticipants
      .filter(p => p.balance > 0)
      .map(p => ({ ...p, remainingCredit: p.balance }));
    
    const suggestions: PaymentSuggestion[] = [];

    // For each debtor, find creditors to pay
    debtors.forEach(debtor => {
      let remainingDebt = debtor.remainingDebt;
      
      // While this person still has debt and there are creditors to pay
      creditors.forEach(creditor => {
        if (remainingDebt > 0 && creditor.remainingCredit > 0) {
          // Calculate payment amount (minimum of remaining debt and credit)
          const paymentAmount = Math.min(remainingDebt, creditor.remainingCredit);
          
          if (paymentAmount > 0) {
            // Add suggestion
            suggestions.push({
              from: debtor.name,
              to: creditor.name,
              amount: paymentAmount
            });
            
            // Update remaining amounts
            remainingDebt -= paymentAmount;
            creditor.remainingCredit -= paymentAmount;
          }
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
