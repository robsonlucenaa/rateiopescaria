
// Core API utilities and shared functionality

// Função de log para depuração
export const logDebug = (message: string, data?: any) => {
  if (import.meta.env.DEV) {
    console.log(`[ApiService] ${message}`, data || '');
  }
};

// Prefixo atualizado para corresponder ao nome da tabela no Supabase
export const STORAGE_PREFIX = "fishing_trips";
