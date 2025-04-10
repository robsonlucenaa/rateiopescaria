
// Core API utilities and shared functionality

import { supabase } from "@/integrations/supabase/client";

// Função de log para depuração
export const logDebug = (message: string, data?: any) => {
  console.log(`[ApiService] ${message}`, data || '');
};

// Prefixo padrão para chaves de armazenamento (mantido para compatibilidade)
export const STORAGE_PREFIX = "fishing-trip-";

// Função para simular latência de rede (para uma experiência de usuário mais suave)
export const simulateNetworkLatency = async (ms: number = 300): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
