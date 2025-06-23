// src/controllers/generateFromIdea.ts
import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { AIGenerationSchema } from "../schemas/aiGeneration.schema";
import { parseAIResult } from "../utils/parseAIResult";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export const generateFromIdea = async (req: Request, res: Response): Promise<void> => {
  const { title, description } = req.body;
  const userId = (req as any).user?.id;

  if (!title || !description) {
    res.status(400).json({ message: "Title and description required." });
    return;
  }

  const idea = await prisma.idea.create({
    data: { title, description, userId },
  });

  const today = new Date().toISOString().split("T")[0];

  const prompt = `
You are an expert software product architect AI.
Your task is to help users break down their software idea into a complete technical plan based on the following:

- Title: ${title}
- Description: ${description}
- Today: ${today}

Respond with **only a valid JSON object**, no explanation, no markdown, no code blocks. Follow the format below and ensure fields are correctly filled and complete:

{
  "summary": "...",
  "problemStatement": "...",
  "valueProposition": "...",
  "targetUsers": "...",
  "marketCategory": "...",
  "tags": ["...", "..."],
  "impactScore": 75,
  "inspirationSources": "...",

  "functionalities": [
    { "title": "...", "description": "...", "additionalInfo": "..." }
    // at least 7
  ],
  "addtionalFunctionalities": [
    { "title": "...", "description": "...", "additionalInfo" : "..." }
    // at least 5
  ],
  "techStacks": [
    { "category": "Frontend", "framework": "...", "description": "...", "additionalInfo": "..." },
    { "category": "Backend", "framework": "...", "description": "...", "additionalInfo": "..." }
    // multiple, cover Frontend, Backend, Database, Auth, AI, etc.
  ],
  "milestones": [
    {
      "title": "...",
      "startTime": "${today}T00:00:00Z",
      "endTime": "${today}T03:00:00Z",
      "finishTime": "${today}T03:00:00Z",
      "checkpoints": ["...", "..."]
    }
    // at least 5 milestones
  ],
  "enhancements": ["...", "..."],

  "referenceMaterials": [
    {
      "title": "...",
      "type": "article | repo | video | dataset",
      "url": "https://...",
      "notes": "..."
    }
    // at least 3
  ],
  "documents": [
    {
      "title": "...",
      "type": "README | ERD | Flowchart | API Spec | API Key | ...",
      "content": "What should be included in this document"
    }
    // at least 3
  ],
  "tasks": [
    { "title": "...", "description": "..." }
    // at least 10
  ]
}
`;

  let content = "";
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    content = response.text();
  } catch (err) {
    console.error("Gemini error:", err);
    res.status(500).json({ message: "Failed to get response from Gemini API." });
    return;
  }

  let parsed;
  try {
    parsed = parseAIResult(content);
  } catch (err) {
    res.status(400).json({ message: "Failed to parse AI response." });
    return;
  }

  const validated = AIGenerationSchema.safeParse(parsed);
  if (!validated.success) {
    console.error("Zod error:", validated.error.flatten());
    res.status(422).json({ message: "AI response format invalid", errors: validated.error.flatten() });
    return;
  }

  const data = validated.data;

  await prisma.idea.update({
    where: { id: idea.id },
    data: {
      aiNotes: data.summary,
      aiGeneratedAt: new Date(),
      problemStatement: data.problemStatement,
      valueProposition: data.valueProposition,
      targetUsers: data.targetUsers,
      marketCategory: data.marketCategory,
      tags: data.tags,
      impactScore: data.impactScore,
      inspirationSources: data.inspirationSources,

      functionalities: { create: data.functionalities },
      addtionalFunctionalities: { create: data.addtionalFunctionalities ?? [] },
      techStacks: { create: data.techStacks },
      milestones: {
        create: data.milestones.map((m) => ({
          title: m.title,
          startTime: new Date(m.startTime),
          endTime: new Date(m.endTime),
          finishTime: m.finishTime ? new Date(m.finishTime) : null,
          checkpoints: { create: m.checkpoints.map((c) => ({ name: c })) },
        })),
      },
      enhancements: {
        create: data.enhancements?.map((e) => ({ content: e })) ?? [],
      },
      referenceMaterials: {
        create: data.referenceMaterials?.map((r) => ({
          title: r.title,
          type: r.type,
          url: r.url,
          notes: r.notes,
        })) ?? [],
      },
      documents: {
        create: data.documents?.map((d) => ({
          title: d.title,
          type: d.type,
          content: d.content,
        })) ?? [],
      },
      tasks: {
        create: data.tasks?.map((t) => ({
          title: t.title,
          description: t.description,
        })) ?? [],
      },
    },
  });

  res.json({ message: "AI generation complete", ideaId: idea.id });
};
