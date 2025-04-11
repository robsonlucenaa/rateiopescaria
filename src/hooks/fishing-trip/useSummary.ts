
import { useEffect, useState } from "react";

export function useSummary(participants: any[], expenses: any[]) {
  const [totalAmount, setTotalAmount] = useState(0);
  const [amountPerPerson, setAmountPerPerson] = useState(0);

  // Calculate totals and update participant paid amounts
  useEffect(() => {
    // Calculate total expense
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    setTotalAmount(total);

    // Calculate amount per person
    const perPerson = participants.length > 0 ? total / participants.length : 0;
    setAmountPerPerson(perPerson);
  }, [expenses, participants.length]);

  // Format currency helper
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return {
    totalAmount,
    amountPerPerson,
    formatCurrency
  };
}
