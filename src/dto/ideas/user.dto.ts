import { z } from "zod";

export const AddUserToIdeaDto = z.object({
  ideaId: z.string().uuid(),
  email: z.string().email(),
});

export type AddUserToIdeaInput = z.infer<typeof AddUserToIdeaDto>;

export const RemoveUserFromIdeaDto = z.object({
  ideaId: z.string().uuid(),
  email: z.string().email(),
});

export type RemoveUserFromIdeaInput = z.infer<typeof RemoveUserFromIdeaDto>;