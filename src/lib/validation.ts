import { z } from "zod";

export const ParticipantNameSchema = z
  .string()
  .trim()
  .min(1, "Nome é obrigatório")
  .max(100, "Nome deve ter no máximo 100 caracteres");

export const ExpenseSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "Descrição é obrigatória")
    .max(200, "Descrição deve ter no máximo 200 caracteres"),
  amount: z
    .number()
    .positive("Valor deve ser positivo")
    .max(1_000_000, "Valor máximo é R$ 1.000.000"),
});

export const TripIdSchema = z
  .string()
  .regex(/^[A-Z0-9]{4}$/, "ID da pescaria deve ter 4 caracteres alfanuméricos");
