
import React from "react";
import { ArrowLeft, Calculator } from "lucide-react";
import { Participant, Expense } from "./ExpenseSplitter";

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
  // Calculate the balances for each participant
  const participantBalances = participants.map((participant) => {
    const balance = participant.paid - amountPerPerson;
    return {
      ...participant,
      balance,
      status: balance >= 0 ? "positive" : "negative",
    };
  });

  // Sort by balance (negative first)
  const sortedParticipants = [...participantBalances].sort(
    (a, b) => a.balance - b.balance
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-medium text-foreground/90">
        Resumo da Pescaria
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-secondary/50 p-4 rounded-xl">
          <h3 className="text-sm text-muted-foreground mb-2">Total de despesas:</h3>
          <p className="text-3xl font-semibold text-foreground">
            {formatCurrency(totalAmount)}
          </p>
          <div className="mt-4 space-y-2">
            {expenses.map((expense) => (
              <div key={expense.id} className="flex justify-between items-center">
                <span className="text-sm">{expense.description}</span>
                <span className="text-sm font-medium">
                  {formatCurrency(expense.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-secondary/50 p-4 rounded-xl">
          <h3 className="text-sm text-muted-foreground mb-2">Valor por pessoa:</h3>
          <p className="text-3xl font-semibold text-foreground">
            {formatCurrency(amountPerPerson)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Dividido entre {participants.length} participante{participants.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-border/50 mt-6">
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <Calculator className="w-5 h-5 mr-2 text-primary" />
          Acerto de contas
        </h3>

        <div className="space-y-4">
          {sortedParticipants.map((participant) => (
            <div
              key={participant.id}
              className={`p-3 rounded-lg ${
                participant.balance >= 0
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{participant.name}</span>
                <span
                  className={`font-semibold ${
                    participant.balance >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {participant.balance >= 0
                    ? `Recebe ${formatCurrency(Math.abs(participant.balance))}`
                    : `Deve pagar ${formatCurrency(Math.abs(participant.balance))}`}
                </span>
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Pagou: {formatCurrency(participant.paid)} | Deveria pagar: {formatCurrency(amountPerPerson)}
              </div>
            </div>
          ))}
        </div>
      </div>

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
