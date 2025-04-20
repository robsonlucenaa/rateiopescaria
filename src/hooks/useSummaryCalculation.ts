
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
    // First, calculate how much each participant has paid through expenses
    const paidAmounts = new Map<string, number>();
    
    // Initialize with zero for all participants
    participants.forEach(p => {
      paidAmounts.set(p.id, 0);
    });
    
    // Add up expenses paid by each participant
    expenses.forEach(expense => {
      const currentPaid = paidAmounts.get(expense.paidBy) || 0;
      paidAmounts.set(expense.paidBy, currentPaid + expense.amount);
    });
    
    // Calculate balance for each participant
    return participants.map((participant) => {
      // Get actual amount paid from expenses
      const paidAmount = paidAmounts.get(participant.id) || 0;
      
      // Update the participant's paid amount to reflect what was actually paid
      const updatedParticipant = {
        ...participant,
        paid: paidAmount
      };
      
      // Balance = what they paid minus what they should have paid
      const balance = paidAmount - amountPerPerson;
      
      return {
        ...updatedParticipant,
        balance,
        status: balance >= 0 ? "positive" : "negative",
      } as ParticipantWithBalance;
    });
  }, [participants, expenses, amountPerPerson]);

  // Sort participants by balance (negative first)
  const sortedParticipants = useMemo(() => {
    return [...participantBalances].sort((a, b) => a.balance - b.balance);
  }, [participantBalances]);

  // Generate payment suggestions based on the algorithm
  const paymentSuggestions = useMemo(() => {
    const suggestions: PaymentSuggestion[] = [];
    
    // Separate debtors (negative balance) and creditors (positive balance)
    const debtors = sortedParticipants
      .filter(p => p.balance < 0)
      .map(p => ({ 
        name: p.name, 
        remainingDebt: Math.abs(p.balance) // How much they still need to pay
      }));
    
    const creditors = sortedParticipants
      .filter(p => p.balance > 0)
      .map(p => ({ 
        name: p.name, 
        remainingCredit: p.balance // How much they still need to receive
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

      // Move to next person if their balance is settled (nearly zero)
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
