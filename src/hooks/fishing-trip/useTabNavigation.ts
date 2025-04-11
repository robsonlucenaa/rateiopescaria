
import { useState, useEffect } from "react";

export function useTabNavigation() {
  const [activeTab, setActiveTab] = useState<"participants" | "expenses" | "summary">("participants");

  const updateActiveTabBasedOnData = (participants: any[], expenses: any[], isInitialLoad: boolean) => {
    if (isInitialLoad && participants.length > 0 && expenses.length > 0) {
      setActiveTab("summary");
    } else if (isInitialLoad && participants.length > 0) {
      setActiveTab("expenses");
    }
  };

  return {
    activeTab,
    setActiveTab,
    updateActiveTabBasedOnData
  };
}
