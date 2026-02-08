import * as z from "zod";

export const companySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  tagline: z.string().optional(),
  address: z.string().min(5, "Address must be at least 5 characters"),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  gstNumber: z.string().optional(),
  panNumber: z.string().optional(),
  bankDetails: z.object({
    bankName: z.string(),
    accountHolder: z.string(),
    accountNumber: z.string(),
    ifscCode: z.string(),
    branch: z.string().optional(),
  }),
});

export type CompanyFormData = z.infer<typeof companySchema>;
