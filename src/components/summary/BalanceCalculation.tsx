
import React from "react";
import { Calculator } from "lucide-react";
import ParticipantBalance from "./ParticipantBalance";

interface ParticipantWithBalance {
  id: string;
  name: string;
  paid: number;
  balance: number;
  status: "positive" | "negative";
}

interface BalanceCalculationProps {
  participants: ParticipantWithBalance[];
  amountPerPerson: number;
  formatCurrency: (value: number) => string;
}

const BalanceCalculation = ({ 
  participants, 
  amountPerPerson, 
  formatCurrency 
}: BalanceCalculationProps) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-border/50 mt-6">
      <h3 className="text-lg font-medium mb-4 flex items-center">
        <Calculator className="w-5 h-5 mr-2 text-primary" />
        Acerto de contas
      </h3>

      <div className="space-y-4">
        {participants.map((participant) => (
          <ParticipantBalance
            key={participant.id}
            participant={participant}
            amountPerPerson={amountPerPerson}
            formatCurrency={formatCurrency}
          />
        ))}
      </div>
    </div>
  );
};

export default BalanceCalculation;
