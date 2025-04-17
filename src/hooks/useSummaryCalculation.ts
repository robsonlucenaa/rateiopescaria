
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

  // Generate payment suggestions based on algorithm provided
  const paymentSuggestions = useMemo(() => {
    const suggestions: PaymentSuggestion[] = [];
    
    // Deep copy the participants to avoid mutating original data
    const debtors = sortedParticipants
      .filter(p => p.balance < 0)
      .map(p => ({ ...p, remainingDebt: Math.abs(p.balance) }));
    
    const creditors = sortedParticipants
      .filter(p => p.balance > 0)
      .map(p => ({ ...p, remainingCredit: p.balance }));
    
    let i = 0, j = 0;
    // Continue until we've processed all debtors or creditors
    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      
      // Find the minimum amount that can be transferred
      const transferAmount = Math.min(debtor.remainingDebt, creditor.remainingCredit);
      
      // Only create suggestion if there's an actual amount to pay
      if (transferAmount > 0.01) {
        // Round to 2 decimal places to avoid floating point issues
        const roundedAmount = Math.round(transferAmount * 100) / 100;
        
        suggestions.push({
          from: debtor.name,
          to: creditor.name,
          amount: roundedAmount
        });
        
        // Update the remaining amounts
        debtor.remainingDebt -= transferAmount;
        creditor.remainingCredit -= transferAmount;
      }
      
      // Move to next person if their balance is nearly zero
      if (debtor.remainingDebt < 0.01) {
        i++;
      }
      if (creditor.remainingCredit < 0.01) {
        j++;
      }
    }

    return suggestions;
  }, [sortedParticipants]);

  return {
    participantBalances,
    sortedParticipants,
    paymentSuggestions
  };
}
