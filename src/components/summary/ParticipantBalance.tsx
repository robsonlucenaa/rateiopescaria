
import React from "react";

interface ParticipantWithBalance {
  id: string;
  name: string;
  paid: number;
  balance: number;
  status: "positive" | "negative";
}

interface ParticipantBalanceProps {
  participant: ParticipantWithBalance;
  amountPerPerson: number;
  formatCurrency: (value: number) => string;
}

const ParticipantBalance = ({ 
  participant, 
  amountPerPerson, 
  formatCurrency 
}: ParticipantBalanceProps) => {
  return (
    <div
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
  );
};

export default ParticipantBalance;
