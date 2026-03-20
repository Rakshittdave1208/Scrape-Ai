import { z } from "zod";

export const credentialTypeSchema = z.enum([
  "API_KEY",
  "USERNAME_PASSWORD",
  "COOKIE",
  "CUSTOM_HEADER",
]);

const baseCredentialSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name is too long"),
  type: credentialTypeSchema,
  description: z
    .string()
    .max(160, "Description is too long")
    .optional()
    .or(z.literal("")),
  apiKey: z.string().max(5000, "API key is too long").optional().or(z.literal("")),
  username: z.string().max(255, "Username is too long").optional().or(z.literal("")),
  password: z.string().max(5000, "Password is too long").optional().or(z.literal("")),
  cookieValue: z.string().max(5000, "Cookie value is too long").optional().or(z.literal("")),
  customHeaders: z.string().max(5000, "Custom headers are too long").optional().or(z.literal("")),
});

function validateCredentialByType(
  value: z.infer<typeof baseCredentialSchema>,
  ctx: z.RefinementCtx
) {
  if (value.type === "API_KEY" && !value.apiKey?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["apiKey"],
      message: "API key is required",
    });
  }

  if (value.type === "USERNAME_PASSWORD") {
    if (!value.username?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["username"],
        message: "Username is required",
      });
    }

    if (!value.password?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message: "Password is required",
      });
    }
  }

  if (value.type === "COOKIE" && !value.cookieValue?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["cookieValue"],
      message: "Cookie value is required",
    });
  }

  if (value.type === "CUSTOM_HEADER" && !value.customHeaders?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["customHeaders"],
      message: "Custom headers value is required",
    });
  }
}

export const createCredentialSchema = baseCredentialSchema.superRefine(validateCredentialByType);

export const updateCredentialSchema = baseCredentialSchema
  .extend({
    id: z.string().min(1, "Credential id is required"),
  })
  .superRefine(validateCredentialByType);

export type CredentialType = z.infer<typeof credentialTypeSchema>;
export type CreateCredentialSchemaType = z.infer<typeof createCredentialSchema>;
export type UpdateCredentialSchemaType = z.infer<typeof updateCredentialSchema>;
