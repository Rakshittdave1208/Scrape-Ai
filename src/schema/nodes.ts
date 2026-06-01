import { z } from "zod";
import { TaskParamType } from "@/types/task";

export const taskParamSchema = z.object({
  name: z.string().min(1),
  type: z.nativeEnum(TaskParamType),
  helperText: z.string().optional(),
  placeholder: z.string().optional(),
  inputType: z.enum(["text", "url", "number"]).optional(),
  required: z.boolean().default(false),
  hideHandle: z.boolean().default(false),
});

export const createCustomNodeSchema = z.object({
  name: z.string().min(3).max(50).regex(/^[A-Z0-9_]+$/, "Name must be uppercase with underscores (e.g., MY_NODE)"),
  label: z.string().min(3).max(50),
  icon: z.string().default("HelpCircle"),
  category: z.string().default("Custom Nodes"),
  description: z.string().max(200).optional(),
  
  inputs: z.array(taskParamSchema).default([]),
  outputs: z.array(taskParamSchema).default([]),
  
  runtime: z.enum(["node", "python", "api"]),
  code: z.string().optional(),
  config: z.string().optional(), // For API nodes, stores JSON config
});

export type CreateCustomNodeSchemaType = z.infer<typeof createCustomNodeSchema>;
