
// Tipos para os dados da pescaria

export interface Participant {
  id: string;
  name: string;
  paid: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string; // ID of the participant who paid
  paidByName: string; // Name of the participant who paid
}

export interface FishingTripData {
  participants: Participant[];
  expenses: Expense[];
  lastUpdated: number; // timestamp for tracking updates
}
