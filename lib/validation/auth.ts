import { z } from "zod";

export const loginInputSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(12).max(256),
});

export type LoginInput = z.infer<typeof loginInputSchema>;
