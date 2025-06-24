import { describe } from "node:test";
import { z } from "zod";

export const TechStackDto = z.object({
    ideaId: z.string().uuid(),
    category: z.string(),
    framework: z.string(),
    description: z.string(),
    additionalInfo: z.string().optional()
});

// export type AddUserToIdeaInput = z.infer<typeof AddUserToIdeaDto>;