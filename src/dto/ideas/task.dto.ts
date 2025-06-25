import { z } from "zod";

export const TaskDto = z.object({
    ideaId : z.string().uuid(),
    title : z.string(),
    description : z.string().optional(),
    dueDate : z.string().datetime({ offset: true }).optional()
})