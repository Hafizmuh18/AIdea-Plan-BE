import { title } from "node:process";
import { z } from "zod";

export const MilestoneDto = z.object({
    ideaId: z.string().uuid(),
    title: z.string(),
    startTime: z.string().datetime({ offset: true }),
    endTime: z.string().datetime({ offset: true }),
    finishTime: z.string().datetime({ offset: true }).optional(),
});

export const CheckpointDto = z.object({
    milestoneId : z.string().uuid(),
    name: z.string()
})