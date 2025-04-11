
import React from "react";
import { ArrowLeft } from "lucide-react";
import { Participant, Expense } from "@/types/fishingTrip";
import ExpensesSummary from "./ExpensesSummary";
import PerPersonAmount from "./PerPersonAmount";
import BalanceCalculation from "./BalanceCalculation";
import PaymentSuggestions from "./PaymentSuggestions";
import { useSummaryCalculation } from "@/hooks/useSummaryCalculation";

interface SummaryCardProps {
  participants: Participant[];
  expenses: Expense[];
  totalAmount: number;
  amountPerPerson: number;
  formatCurrency: (value: number) => string;
  onBack: () => void;
}

const SummaryCard = ({
  participants,
  expenses,
  totalAmount,
  amountPerPerson,
  formatCurrency,
  onBack,
}: SummaryCardProps) => {
  const { sortedParticipants, paymentSuggestions } = useSummaryCalculation(
    participants, 
    expenses, 
    amountPerPerson
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-medium text-foreground/90">
        Resumo da Pescaria
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ExpensesSummary 
          expenses={expenses}
          totalAmount={totalAmount}
          formatCurrency={formatCurrency}
        />
        
        <PerPersonAmount
          amountPerPerson={amountPerPerson}
          participantsCount={participants.length}
          formatCurrency={formatCurrency}
        />
      </div>

      <BalanceCalculation 
        participants={sortedParticipants}
        amountPerPerson={amountPerPerson}
        formatCurrency={formatCurrency}
      />

      <PaymentSuggestions 
        suggestions={paymentSuggestions}
        formatCurrency={formatCurrency}
      />

      <div className="mt-6">
        <button
          onClick={onBack}
          className="px-6 py-2.5 bg-secondary text-secondary-foreground rounded-xl button-effect flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Despesas
        </button>
      </div>
    </div>
  );
};

export default SummaryCard;
