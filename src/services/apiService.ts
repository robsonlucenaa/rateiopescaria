
// Simple API service to store and retrieve fishing trip data
// This simulates a backend service using localStorage

import { FishingTripData } from "@/components/ExpenseSplitter";

// Simulating a backend API with localStorage
// In a real implementation, this would use fetch calls to a backend server
export const apiService = {
  // Fetch a trip by ID
  fetchTrip: async (tripId: string): Promise<FishingTripData | null> => {
    try {
      const tripData = localStorage.getItem(`fishing-trip-${tripId}`);
      if (tripData) {
        return JSON.parse(tripData) as FishingTripData;
      }
      return null;
    } catch (error) {
      console.error("Error fetching trip:", error);
      throw new Error("Failed to fetch trip data");
    }
  },

  // Save a trip
  saveTrip: async (tripId: string, data: FishingTripData): Promise<void> => {
    try {
      // Add current timestamp
      data.lastUpdated = Date.now();
      localStorage.setItem(`fishing-trip-${tripId}`, JSON.stringify(data));
      
      // In a real backend, this would be an API call
      console.log(`Trip ${tripId} saved to "backend"`);
      
      // Simulate network latency
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return;
    } catch (error) {
      console.error("Error saving trip:", error);
      throw new Error("Failed to save trip data");
    }
  },
  
  // Check if there's a newer version of trip data
  checkForUpdates: async (tripId: string, lastSyncTime: number): Promise<{hasUpdates: boolean, data?: FishingTripData}> => {
    try {
      const data = await apiService.fetchTrip(tripId);
      if (data && data.lastUpdated > lastSyncTime) {
        return { hasUpdates: true, data };
      }
      return { hasUpdates: false };
    } catch (error) {
      console.error("Error checking for updates:", error);
      return { hasUpdates: false };
    }
  }
};
