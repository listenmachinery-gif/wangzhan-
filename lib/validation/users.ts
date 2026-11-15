import { z } from "zod";
import { ROLES } from "@/lib/auth/permissions";

export const userUpdateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  isActive: z.boolean(),
  roles: z.array(z.enum(ROLES)).min(1).max(ROLES.length).refine((roles) => new Set(roles).size === roles.length, "Roles must be unique."),
  updatedAt: z.string().datetime(),
}).strict();
