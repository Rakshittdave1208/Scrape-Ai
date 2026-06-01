import { z } from "zod";

export const createArchitectureSchema = z.object({
  name: z.string().min(1, "Name is required").max(60, "Name must be 60 characters or fewer"),
  description: z
    .string()
    .max(120, "Description must be 120 characters or fewer")
    .optional()
    .nullable()
    .or(z.literal("")),
});

export type CreateArchitectureSchemaType = z.infer<typeof createArchitectureSchema>;
