import { z } from "zod";

export const LinkedInPerson = z.object({
  full_name: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  title: z.string().optional(),
  email: z.string().optional(),
  linkedin_url: z.string().optional(),
  company_name: z.string().optional(),
  company_domain: z.string().optional(),
  company_description: z.string().optional(),
});
