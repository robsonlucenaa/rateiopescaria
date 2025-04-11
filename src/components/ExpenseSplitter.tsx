
import React from "react";
import { useFishingTrip } from "@/hooks/useFishingTrip";
import ParticipantsTab from "./ParticipantsTab";
import ExpensesTab from "./ExpensesTab";
import SummaryCard from "./SummaryCard";
import TabNavigation from "./TabNavigation";
import TripControlBar from "./TripControlBar";

// Re-exportando para manter compatibilidade com código existente
// Usando "export type" para resolver o erro TS1205
export type { FishingTripData, Participant, Expense } from "@/types/fishingTrip";

const ExpenseSplitter = () => {
  const {
    participants,
    expenses,
    newParticipantName,
    setNewParticipantName,
    newExpenseDescription,
    setNewExpenseDescription,
    newExpenseAmount,
    setNewExpenseAmount,
    newExpensePaidBy,
    setNewExpensePaidBy,
    activeTab,
    setActiveTab,
    totalAmount,
    amountPerPerson,
    currentTripId,
    shareUrl,
    copied,
    isRefreshing,
    isSaving,
    addParticipant,
    removeParticipant,
    addExpense,
    removeExpense,
    copyShareLink,
    startNewTrip,
    forceRefresh,
    formatCurrency
  } = useFishingTrip();

  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in">
      <TripControlBar 
        currentTripId={currentTripId}
        isRefreshing={isRefreshing}
        isSaving={isSaving}
        copied={copied}
        forceRefresh={forceRefresh}
        copyShareLink={copyShareLink}
        startNewTrip={startNewTrip}
      />

      <TabNavigation 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        disableExpensesTab={participants.length === 0}
        disableSummaryTab={participants.length === 0 || expenses.length === 0}
      />

      <div className="glass-card rounded-2xl p-6 mb-8 min-h-[400px] animate-scale-in">
        {activeTab === "participants" && (
          <ParticipantsTab 
            participants={participants}
            newParticipantName={newParticipantName}
            setNewParticipantName={setNewParticipantName}
            addParticipant={addParticipant}
            removeParticipant={removeParticipant}
            formatCurrency={formatCurrency}
            onNext={() => setActiveTab("expenses")}
          />
        )}

        {activeTab === "expenses" && (
          <ExpensesTab 
            expenses={expenses}
            participants={participants}
            newExpenseDescription={newExpenseDescription}
            setNewExpenseDescription={setNewExpenseDescription}
            newExpenseAmount={newExpenseAmount}
            setNewExpenseAmount={setNewExpenseAmount}
            newExpensePaidBy={newExpensePaidBy}
            setNewExpensePaidBy={setNewExpensePaidBy}
            addExpense={addExpense}
            removeExpense={removeExpense}
            formatCurrency={formatCurrency}
            onBack={() => setActiveTab("participants")}
            onNext={() => setActiveTab("summary")}
          />
        )}

        {activeTab === "summary" && (
          <SummaryCard
            participants={participants}
            expenses={expenses}
            totalAmount={totalAmount}
            amountPerPerson={amountPerPerson}
            formatCurrency={formatCurrency}
            onBack={() => setActiveTab("expenses")}
          />
        )}
      </div>
    </div>
  );
};

export default ExpenseSplitter;
