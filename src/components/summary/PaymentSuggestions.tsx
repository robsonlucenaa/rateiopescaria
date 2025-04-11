
import React from "react";
import { ArrowRight } from "lucide-react";

interface PaymentSuggestion {
  from: string;
  to: string;
  amount: number;
}

interface PaymentSuggestionsProps {
  suggestions: PaymentSuggestion[];
  formatCurrency: (value: number) => string;
}

const PaymentSuggestions = ({ suggestions, formatCurrency }: PaymentSuggestionsProps) => {
  if (suggestions.length === 0) return null;

  return (
    <div className="bg-primary/10 p-6 rounded-xl shadow-sm border border-primary/20 mt-6">
      <h3 className="text-lg font-medium mb-4 flex items-center text-primary">
        <ArrowRight className="w-5 h-5 mr-2 text-primary" />
        Sugestão de pagamentos
      </h3>

      <div className="space-y-4">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className="p-3 rounded-lg bg-white border border-muted"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="font-medium">{suggestion.from}</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{suggestion.to}</span>
              </div>
              <span className="font-semibold text-foreground">
                {formatCurrency(suggestion.amount)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentSuggestions;
