
import React from "react";

interface PerPersonAmountProps {
  amountPerPerson: number;
  participantsCount: number;
  formatCurrency: (value: number) => string;
}

const PerPersonAmount = ({ 
  amountPerPerson, 
  participantsCount, 
  formatCurrency 
}: PerPersonAmountProps) => {
  return (
    <div className="bg-secondary/50 p-4 rounded-xl">
      <h3 className="text-sm text-muted-foreground mb-2">Valor por pessoa:</h3>
      <p className="text-3xl font-semibold text-foreground">
        {formatCurrency(amountPerPerson)}
      </p>
      <p className="text-sm text-muted-foreground mt-1">
        Dividido entre {participantsCount} participante{participantsCount !== 1 ? "s" : ""}
      </p>
    </div>
  );
};

export default PerPersonAmount;
