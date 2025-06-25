import { describe } from "node:test";
import { z } from "zod";

export const UpdateIdeaDto = z.object({
    title: z.string(),
    description: z.string(),
    summary: z.string(),
    problemStatement: z.string().optional(),
    valueProposition: z.string().optional(),
    targetUsers: z.string().optional(),
    marketCategory: z.string().optional(),
    tags: z.array(z.string()).optional(),
    status: z.string(),
    impactScore: z.number().min(0).max(100).optional(),
    inspirationSources: z.string().optional(),
});

// export type AddUserToIdeaInput = z.infer<typeof AddUserToIdeaDto>;