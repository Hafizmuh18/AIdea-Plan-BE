import { z } from "zod";

export const AIGenerationSchema = z.object({
  summary: z.string(),
  problemStatement: z.string().optional(),
  valueProposition: z.string().optional(),
  targetUsers: z.string().optional(),
  marketCategory: z.string().optional(),
  tags: z.array(z.string()).optional(),
  impactScore: z.number().min(0).max(100).optional(),
  inspirationSources: z.string().optional(),

  functionalities: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      additionalInfo: z.string().optional(),
    })
  ),

  addtionalFunctionalities: z
    .array(
      z.object({
        title: z.string(),
        description: z.string(),
        additionalInfo: z.string().optional(),
      })
    )
    .optional(),

  techStacks: z.array(
    z.object({
      category: z.string(),
      framework: z.string(),
      description: z.string(),
      additionalInfo: z.string().optional(),
    })
  ),

  milestones: z.array(
    z.object({
      title: z.string(),
      startTime: z.string().datetime({ offset: true }),
      endTime: z.string().datetime({ offset: true }),
      finishTime: z.string().datetime({ offset: true }).optional(),
      checkpoints: z.array(z.string()),
    })
  ),

  enhancements: z.array(z.string()).optional(),

  referenceMaterials: z
    .array(
      z.object({
        title: z.string(),
        type: z.string(),
        url: z.string().url(),
        notes: z.string().optional(),
      })
    )
    .optional(),

  documents: z
    .array(
      z.object({
        title: z.string(),
        type: z.string(),
        content: z.string().optional(),
      })
    )
    .optional(),

  tasks: z
    .array(
      z.object({
        title: z.string(),
        description: z.string().optional(),
      })
    )
    .optional(),
});
