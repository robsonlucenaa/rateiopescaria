
import React from "react";
import { User, DollarSign } from "lucide-react";

interface TabNavigationProps {
  activeTab: "participants" | "expenses" | "summary";
  setActiveTab: (tab: "participants" | "expenses" | "summary") => void;
  disableExpensesTab: boolean;
  disableSummaryTab: boolean;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ 
  activeTab, 
  setActiveTab, 
  disableExpensesTab,
  disableSummaryTab
}) => {
  const getTabButtonClass = (tab: "participants" | "expenses" | "summary") => {
    return `flex items-center justify-center py-3 px-4 rounded-t-xl text-sm font-medium button-effect ${
      activeTab === tab
        ? "bg-white text-primary border-b-2 border-primary"
        : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
    }`;
  };

  return (
    <div className="flex justify-between mb-6">
      <button
        className={getTabButtonClass("participants")}
        onClick={() => setActiveTab("participants")}
      >
        <User className="w-4 h-4 mr-2" />
        Participantes
      </button>
      <button
        className={getTabButtonClass("expenses")}
        onClick={() => setActiveTab("expenses")}
        disabled={disableExpensesTab}
      >
        <DollarSign className="w-4 h-4 mr-2" />
        Despesas
      </button>
      <button
        className={getTabButtonClass("summary")}
        onClick={() => setActiveTab("summary")}
        disabled={disableSummaryTab}
      >
        <DollarSign className="w-4 h-4 mr-2" />
        Resumo
      </button>
    </div>
  );
};

export default TabNavigation;
