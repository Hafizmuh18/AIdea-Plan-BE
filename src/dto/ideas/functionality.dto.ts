import { describe } from "node:test";
import { z } from "zod";

export const FunctionalityDto = z.object({
    ideaId: z.string().uuid(),
    title: z.string(),
    description: z.string(),
    additionalInfo: z.string().optional()
});

export const AdditionalFunctionalityDto = z.object({
    ideaId: z.string().uuid(),
    title: z.string(),
    description: z.string(),
    additionalInfo: z.string().optional()
});

// export type AddUserToIdeaInput = z.infer<typeof AddUserToIdeaDto>;