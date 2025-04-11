
import React from "react";
import { Expense } from "@/types/fishingTrip";

interface ExpensesSummaryProps {
  expenses: Expense[];
  totalAmount: number;
  formatCurrency: (value: number) => string;
}

const ExpensesSummary = ({ expenses, totalAmount, formatCurrency }: ExpensesSummaryProps) => {
  return (
    <div className="bg-secondary/50 p-4 rounded-xl">
      <h3 className="text-sm text-muted-foreground mb-2">Total de despesas:</h3>
      <p className="text-3xl font-semibold text-foreground">
        {formatCurrency(totalAmount)}
      </p>
      <div className="mt-4 space-y-2">
        {expenses.map((expense) => (
          <div key={expense.id} className="flex justify-between items-center">
            <span className="text-sm">{expense.description}</span>
            <div className="text-right">
              <span className="text-sm font-medium">
                {formatCurrency(expense.amount)}
              </span>
              <div className="text-xs text-muted-foreground">
                Pago por: {expense.paidByName}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpensesSummary;
