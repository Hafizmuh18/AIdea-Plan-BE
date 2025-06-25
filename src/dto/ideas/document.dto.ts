import { z } from "zod";

export const DocumentDto = z.object({
    ideaId : z.string().uuid(),
    title : z.string(),
    type : z.string(),
    content : z.string().optional(),
    url : z.string().url().optional()
})