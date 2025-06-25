import { z } from "zod";

export const EnhancementDto = z.object({
    ideaId : z.string().uuid(),
    content : z.string()
})