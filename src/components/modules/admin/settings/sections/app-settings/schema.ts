import * as z from "zod";

export const appSettingsSchema = z.object({
  quotation: z.object({
    defaultTaxRate: z
      .number()
      .min(0, "Tax rate cannot be negative")
      .max(100, "Tax rate cannot exceed 100%"),
    defaultValidityDays: z.number().min(1, "Validity must be at least 1 day"),
    defaultTerms: z.string().optional(),
    codePrefix: z.string().optional(),
  }),
  notifications: z.object({
    adminEmails: z.array(z.string().email("Invalid email address")),
    enableEmailNotifications: z.boolean(),
  }),
});

export type AppSettingsFormData = z.infer<typeof appSettingsSchema>;
