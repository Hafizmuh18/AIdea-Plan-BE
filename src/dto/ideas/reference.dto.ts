import { z } from "zod";

export const ReferenceDto = z.object({
    ideaId : z.string().uuid(),
    title : z.string(),
    url : z.string().url().optional(),
    type : z.string(),
    notes : z.string().optional()
})