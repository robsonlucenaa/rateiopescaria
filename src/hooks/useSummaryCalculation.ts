
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
  // Calculate initial balances
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

  // Sort participants by balance (negative first)
  const sortedParticipants = useMemo(() => {
    return [...participantBalances].sort((a, b) => a.balance - b.balance);
  }, [participantBalances]);

  // Generate payment suggestions based on algorithm provided
  const paymentSuggestions = useMemo(() => {
    const suggestions: PaymentSuggestion[] = [];
    
    // Separate debtors and creditors
    const debtors = sortedParticipants
      .filter(p => p.balance < 0)
      .map(p => ({ 
        name: p.name, 
        remainingDebt: Math.abs(p.balance)
      }));
    
    const creditors = sortedParticipants
      .filter(p => p.balance > 0)
      .map(p => ({ 
        name: p.name, 
        remainingCredit: p.balance 
      }));

    let debtorIndex = 0;
    let creditorIndex = 0;

    // Continue while there are still debtors and creditors to process
    while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
      const currentDebtor = debtors[debtorIndex];
      const currentCreditor = creditors[creditorIndex];

      // Calculate the transfer amount (minimum between debt and credit)
      const transferAmount = Math.min(
        currentDebtor.remainingDebt,
        currentCreditor.remainingCredit
      );

      // Only create a suggestion if there's a significant amount to transfer
      if (transferAmount > 0.01) {
        suggestions.push({
          from: currentDebtor.name,
          to: currentCreditor.name,
          amount: Math.round(transferAmount * 100) / 100 // Round to 2 decimal places
        });

        // Update remaining amounts
        currentDebtor.remainingDebt -= transferAmount;
        currentCreditor.remainingCredit -= transferAmount;
      }

      // Move to next person if their balance is settled
      if (currentDebtor.remainingDebt < 0.01) {
        debtorIndex++;
      }
      if (currentCreditor.remainingCredit < 0.01) {
        creditorIndex++;
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
