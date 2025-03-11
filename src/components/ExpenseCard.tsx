
import React from "react";
import { X, DollarSign } from "lucide-react";
import { Expense } from "./ExpenseSplitter";

interface ExpenseCardProps {
  expense: Expense;
  onRemove: (id: string) => void;
  formatCurrency: (value: number) => string;
}

const ExpenseCard = ({
  expense,
  onRemove,
  formatCurrency,
}: ExpenseCardProps) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-border/50 transition-all hover:shadow-md group animate-scale-in">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-medium text-foreground">{expense.description}</h3>
        </div>
        <div className="flex items-center">
          <button
            onClick={() => onRemove(expense.id)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 button-effect"
          >
            <X className="w-4 h-4" />
          </button>
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
      </div>
    </div>
  );
};

export default ExpenseCard;
