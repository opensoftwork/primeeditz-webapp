import * as z from "zod";

export const sectionSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  color: z.string(),
});

export type SectionFormData = z.infer<typeof sectionSchema>;
