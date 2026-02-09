import * as z from "zod";

export const identitySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  tagline: z.string().optional(),
});

export const contactSchema = z.object({
  address: z.string().min(5, "Address must be at least 5 characters"),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
});

export const billingSchema = z.object({
  gstNumber: z.string().optional(),
  panNumber: z.string().optional(),
});

export const bankDetailsSchema = z.object({
  bankName: z.string().min(1, "Bank name is required"),
  accountHolder: z.string().min(1, "Account holder name is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  ifscCode: z.string().min(1, "IFSC code is required"),
  branch: z.string().optional(),
});

export const bankSchema = z.object({
  bankDetails: bankDetailsSchema,
});

export const companySchema = identitySchema
  .merge(contactSchema)
  .merge(billingSchema)
  .merge(bankSchema);

export type IdentityFormData = z.infer<typeof identitySchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
export type BillingFormData = z.infer<typeof billingSchema>;
export type BankFormData = z.infer<typeof bankSchema>;
export type CompanyFormData = z.infer<typeof companySchema>;
