
// Serviço de API para armazenar e recuperar dados de pescarias
// Usando Supabase para persistência de dados

import { FishingTripData } from "@/types/fishingTrip";
import { getAllTrips } from "./api/tripListing";
import { fetchTrip } from "./api/tripFetch";
import { saveTrip } from "./api/tripSave";
import { checkForUpdates } from "./api/tripUpdate";
import { deleteTrip } from "./api/tripDelete";
import { STORAGE_PREFIX } from "./api/core";

// API usando Supabase para persistência
export const apiService = {
  // Re-exported functions
  getAllTrips,
  fetchTrip,
  saveTrip,
  checkForUpdates,
  deleteTrip,
  
  // Constants for backwards compatibility
  STORAGE_PREFIX
};
