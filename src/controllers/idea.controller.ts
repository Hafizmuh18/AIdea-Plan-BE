import { Request, Response } from "express";
import prisma from "../lib/prisma";

const notFound = (res: Response, name = "Item") => {
    res.status(404).json({ message: `${name} not found.` });
};

export const getUserIdea = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;

    const ideas = await prisma.idea.findMany({
        where: {
            OR: [
                { userId },
                { collaborators: { some: { id: userId } } }
            ]
        },
        include: { functionalities: true }
    });

    res.json(ideas);
};

export const getIdeaById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    const idea = await prisma.idea.findUnique({
        where: { id },
        include: {
            functionalities: true,
            addtionalFunctionalities: true,
            techStacks: true,
            milestones: { include: { checkpoints: true } },
            enhancements: true,
            referenceMaterials: true,
            documents: true,
            tasks: true,
            collaborators: { select: { id: true } }
        },
    });

    if (!idea) {
        notFound(res, "Idea");
        return;
    }

    const isOwner = idea.userId === userId;
    const isCollaborator = idea.collaborators.some((c) => c.id === userId);

    if (!isOwner && !isCollaborator) {
        res.status(403).json({ message: "Not authorized to view this idea." });
        return;
    }

    res.json(idea);
};

export const updateIdea = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    const idea = await prisma.idea.findUnique({
        where: { id },
        include: { collaborators: { select: { id: true } } }
    });

    if (!idea) {
        notFound(res, "Idea");
        return;
    }

    const isOwner = idea.userId === userId;
    const isCollaborator = idea.collaborators.some((c) => c.id === userId);

    if (!isOwner && !isCollaborator) {
        res.status(403).json({ message: "Not authorized to update this idea." });
        return;
    }

    const updated = await prisma.idea.update({ where: { id }, data: req.body });
    res.json(updated);
};

export const deleteIdea = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    const idea = await prisma.idea.findUnique({ where: { id } });
    if (!idea) {
        notFound(res, "Idea");
        return;
    }

    if (idea.userId !== userId) {
        res.status(403).json({ message: "Only the owner can delete this idea." });
        return;
    }

    await prisma.idea.delete({ where: { id } });
    res.json({ message: "Idea deleted" });
};

export const addUserToIdea = async (req: Request, res: Response) => {
    const { ideaId, email } = req.body;

    const idea = await prisma.idea.findUnique({ where: { id: ideaId }, include: { user: true } });
    if (!idea) {
        notFound(res, "Idea");
        return;
    }

    const currentUserId = (req as any).user?.id;
    if (idea.userId !== currentUserId) {
        res.status(403).json({ message: "Only the owner can add collaborators." });
        return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        notFound(res, "User");
        return;
    }

    await prisma.idea.update({
        where: { id: ideaId },
        data: {
            collaborators: {
                connect: { id: user.id }
            }
        }
    });

    res.json({ message: `User ${email} added as collaborator.` });
};

export const removeUserFromIdea = async (req: Request, res: Response) => {
    const { ideaId, email } = req.body;

    const idea = await prisma.idea.findUnique({ where: { id: ideaId }, include: { user: true } });
    if (!idea) {
        notFound(res, "Idea");
        return;
    }

    const currentUserId = (req as any).user?.id;
    if (idea.userId !== currentUserId) {
        res.status(403).json({ message: "Only the owner can remove collaborators." });
        return; 
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        notFound(res, "User");
        return; 
    }

    await prisma.idea.update({
        where: { id: ideaId },
        data: {
            collaborators: {
                disconnect: { id: user.id }
            }
        }
    });

    res.json({ message: `User ${email} removed from collaborators.` });
};

export const addFunctionality = async (req: Request, res: Response) => {
  const { ideaId, title, description, additionalInfo } = req.body;
  const func = await prisma.functionality.create({ data: { ideaId, title, description, additionalInfo } });
  res.json(func);
};

export const updateFunctionality = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;
  const func = await prisma.functionality.update({ where: { id }, data });
  res.json(func);
};

export const removeFunctionality = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.functionality.delete({ where: { id } });
  res.json({ message: "Functionality deleted" });
};

export const addAdditionalFunctionality = async (req: Request, res: Response) => {
  const { ideaId, title, description, additionalInfo } = req.body;
  const add = await prisma.additionalFunctionality.create({ data: { ideaId, title, description, additionalInfo } });
  res.json(add);
};

export const updateAdditionalFunctionality = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;
  const updated = await prisma.additionalFunctionality.update({ where: { id }, data });
  res.json(updated);
};

export const removeAdditionalFunctionality = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.additionalFunctionality.delete({ where: { id } });
  res.json({ message: "Additional Functionality deleted" });
};

export const addTechStack = async (req: Request, res: Response) => {
  const { ideaId, category, framework, description, additionalInfo } = req.body;
  const stack = await prisma.techStack.create({ data: { ideaId, category, framework, description, additionalInfo } });
  res.json(stack);
};

export const updateTechStack = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;
  const updated = await prisma.techStack.update({ where: { id }, data });
  res.json(updated);
};

export const removeTechStack = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.techStack.delete({ where: { id } });
  res.json({ message: "Tech Stack deleted" });
};

export const addMilestone = async (req: Request, res: Response) => {
  const { ideaId, title, startTime, endTime, finishTime, checkpoints } = req.body;
  const milestone = await prisma.milestone.create({
    data: {
      ideaId,
      title,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      finishTime: finishTime ? new Date(finishTime) : null,
      checkpoints: {
        create: checkpoints.map((c: string) => ({ name: c }))
      }
    }
  });
  res.json(milestone);
};

export const updateMilestone = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, startTime, endTime, finishTime } = req.body;
  const updated = await prisma.milestone.update({
    where: { id },
    data: {
      title,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      finishTime: finishTime ? new Date(finishTime) : null,
    }
  });
  res.json(updated);
};

export const removeMilestone = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.milestone.delete({ where: { id } });
  res.json({ message: "Milestone deleted" });
};

export const addCheckpoint = async (req: Request, res: Response) => {
  const { milestoneId, name } = req.body;
  const checkpoint = await prisma.checkpoint.create({ data: { milestoneId, name } });
  res.json(checkpoint);
};

export const updateCheckpoint = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;
  const updated = await prisma.checkpoint.update({ where: { id }, data: { name } });
  res.json(updated);
};

export const removeCheckpoint = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.checkpoint.delete({ where: { id } });
  res.json({ message: "Checkpoint deleted" });
};

export const addReference = async (req: Request, res: Response) => {
  const { ideaId, title, type, url, notes } = req.body;
  const ref = await prisma.referenceMaterial.create({ data: { ideaId, title, type, url, notes } });
  res.json(ref);
};

export const updateReference = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;
  const updated = await prisma.referenceMaterial.update({ where: { id }, data });
  res.json(updated);
};

export const removeReference = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.referenceMaterial.delete({ where: { id } });
  res.json({ message: "Reference deleted" });
};

export const addDocument = async (req: Request, res: Response) => {
  const { ideaId, title, type, content, url } = req.body;
  const doc = await prisma.document.create({ data: { ideaId, title, type, content, url } });
  res.json(doc);
};

export const updateDocument = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;
  const updated = await prisma.document.update({ where: { id }, data });
  res.json(updated);
};

export const removeDocument = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.document.delete({ where: { id } });
  res.json({ message: "Document deleted" });
};

export const addTask = async (req: Request, res: Response) => {
  const { ideaId, title, description, status, dueDate } = req.body;
  const task = await prisma.task.create({ data: { ideaId, title, description, status, dueDate } });
  res.json(task);
};

export const updateTask = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;
  const updated = await prisma.task.update({ where: { id }, data });
  res.json(updated);
};

export const removeTask = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.task.delete({ where: { id } });
  res.json({ message: "Task deleted" });
};
