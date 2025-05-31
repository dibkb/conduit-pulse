import { z } from "zod";

export const LinkedInPerson = z.object({
  full_name: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  title: z.string(),
  email: z.string(),
  linkedin_url: z.string(),
  company_name: z.string(),
  company_domain: z.string(),
  company_description: z.string(),
});
