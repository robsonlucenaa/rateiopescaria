
// Core API utilities and shared functionality

import { supabase } from "@/integrations/supabase/client";

// Função de log para depuração
export const logDebug = (message: string, data?: any) => {
  console.log(`[ApiService] ${message}`, data || '');
};

// Prefixo atualizado para corresponder ao nome da tabela no Supabase
export const STORAGE_PREFIX = "fishing_trips";

// Função para simular latência de rede (para uma experiência de usuário mais suave)
export const simulateNetworkLatency = async (ms: number = 300): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

