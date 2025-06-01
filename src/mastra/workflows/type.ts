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

export const linkedInDummy: z.infer<typeof LinkedInPerson> = {
  full_name: undefined,
  first_name: undefined,
  last_name: undefined,
  title: undefined,
  email: undefined,
  linkedin_url: undefined,
  company_name: undefined,
  company_domain: undefined,
  company_description: undefined,
};
