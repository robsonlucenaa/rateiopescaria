
// Core API utilities and shared functionality

import { supabase } from "@/integrations/supabase/client";

// Função de log para depuração
export const logDebug = (message: string, data?: any) => {
  console.log(`[ApiService] ${message}`, data || '');
};

// Prefixo atualizado para corresponder ao nome da tabela no Supabase
export const STORAGE_PREFIX = "fishing_trips";

// Get the current authenticated user's ID
export const getCurrentUserId = async (): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");
  return user.id;
};
