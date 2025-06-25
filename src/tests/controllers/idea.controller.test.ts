import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getUserIdea, addUserToIdea, deleteIdea, updateIdea, removeUserFromIdea } from "../../controllers/idea.controller";
import prisma from "../../lib/prisma";
import { AddUserToIdeaDto, RemoveUserFromIdeaDto } from "../../dto/ideas/user.dto";

describe("Idea Controller", () => {
  let mockReq: any;
  let mockRes: any;

  beforeEach(() => {
    mockReq = {
      params: {},
      body: {},
      user: { id: "user-123" }
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("test_owner_can_add_collaborator_successfully", async () => {
    const ideaId = "idea-1";
    const email = "collab@example.com";
    mockReq.body = { ideaId, email };
    mockReq.user = { id: "owner-1" };

    vi.spyOn(AddUserToIdeaDto, "safeParse").mockReturnValue({ success: true, data: { ideaId, email } } as any);
    vi.spyOn(prisma.idea, "findUnique").mockResolvedValueOnce({ id: ideaId, userId: "owner-1", user: {} } as any);
    vi.spyOn(prisma.user, "findUnique").mockResolvedValueOnce({ id: "collab-2", email } as any);
    const updateMock = vi.spyOn(prisma.idea, "update").mockResolvedValueOnce({
      id: ideaId,
      userId: "owner-1",
      status: "DRAFT",
      title: "Test Idea",
      description: "Test Description",
      problemStatement: null,
      valueProposition: null,
      targetUsers: null,
      marketCategory: null,
      functionalities: [],
      techStacks: [],
      collaborators: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      aiGeneratedAt: null,
      user: {},
    } as any);

    await addUserToIdea(mockReq, mockRes);

    expect(AddUserToIdeaDto.safeParse).toHaveBeenCalledWith({ ideaId, email });
    expect(prisma.idea.findUnique).toHaveBeenCalledWith({ where: { id: ideaId }, include: { user: true } });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email } });
    expect(updateMock).toHaveBeenCalledWith({
      where: { id: ideaId },
      data: { collaborators: { connect: { id: "collab-2" } } }
    });
    expect(mockRes.json).toHaveBeenCalledWith({ message: `User ${email} added as collaborator.` });
  });

  it("test_get_user_ideas_returns_owned_and_collaborated", async () => {
    mockReq.user = { id: "user-abc" };
    // Import the IdeaStatus enum from your model or Prisma client
    // import { IdeaStatus } from '../../src/models/idea.model'; // Uncomment and adjust path as needed

    const ideas = [
      {
        id: "idea-1",
        userId: "user-abc",
        status: "DRAFT" as any, // Replace 'as any' with 'as IdeaStatus' if IdeaStatus is imported
        title: "Idea 1",
        description: "Description 1",
        problemStatement: null,
        valueProposition: null,
        targetUsers: null,
        marketCategory: null,
        functionalities: [],
        techStacks: [],
        collaborators: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        aiGeneratedAt: null,
        user: {},
        tags: [],
        impactScore: 0,
        inspirationSources: "",
        aiNotes: null,
      },
      {
        id: "idea-2",
        userId: "other",
        status: "DRAFT" as any, // Replace 'as any' with 'as IdeaStatus' if IdeaStatus is imported
        title: "Idea 2",
        description: "Description 2",
        problemStatement: null,
        valueProposition: null,
        targetUsers: null,
        marketCategory: null,
        functionalities: [],
        techStacks: [],
        collaborators: [{ id: "user-abc" }],
        createdAt: new Date(),
        updatedAt: new Date(),
        aiGeneratedAt: null,
        user: {},
        tags: [],
        impactScore: 0,
        inspirationSources: "",
        aiNotes: null,
      }
    ];
    vi.spyOn(prisma.idea, "findMany").mockResolvedValueOnce(ideas);

    await getUserIdea(mockReq, mockRes);

    expect(prisma.idea.findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { userId: "user-abc" },
          { collaborators: { some: { id: "user-abc" } } }
        ]
      },
      include: { functionalities: true, techStacks: true }
    });
    expect(mockRes.json).toHaveBeenCalledWith(ideas);
  });

  it("test_owner_can_delete_idea", async () => {
    const ideaId = "idea-del";
    mockReq.params = { id: ideaId };
    mockReq.user = { id: "owner-xyz" };

    vi.spyOn(prisma.idea, "findUnique").mockResolvedValueOnce({ id: ideaId, userId: "owner-xyz" } as any);
    const deleteMock = vi.spyOn(prisma.idea, "delete").mockResolvedValueOnce({
        status: "draft",
        description: "",
        id: "",
        title: "",
        problemStatement: null,
        valueProposition: null,
        targetUsers: null,
        marketCategory: null,
        tags: [],
        impactScore: null,
        inspirationSources: null,
        userId: "",
        createdAt: new Date(),
        aiNotes: null,
        aiGeneratedAt: null
    });

    await deleteIdea(mockReq, mockRes);

    expect(prisma.idea.findUnique).toHaveBeenCalledWith({ where: { id: ideaId } });
    expect(deleteMock).toHaveBeenCalledWith({ where: { id: ideaId } });
    expect(mockRes.json).toHaveBeenCalledWith({ message: "Idea deleted" });
  });

  it("test_non_owner_cannot_update_idea", async () => {
    const ideaId = "idea-unauth";
    mockReq.params = { id: ideaId };
    mockReq.user = { id: "not-owner" };
    mockReq.body = { title: "Updated" };

    vi.spyOn(prisma.idea, "findUnique").mockResolvedValueOnce({
      id: ideaId,
      userId: "owner-abc",
      collaborators: [{ id: "collab-1" }]
    } as any);

    await updateIdea(mockReq, mockRes);

    expect(prisma.idea.findUnique).toHaveBeenCalledWith({
      where: { id: ideaId },
      include: { collaborators: { select: { id: true } } }
    });
    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ message: "Not authorized to update this idea." });
  });

  it("test_add_collaborator_invalid_email_rejected", async () => {
    const ideaId = "idea-err";
    const email = "not-an-email";
    mockReq.body = { ideaId, email };

    vi.spyOn(AddUserToIdeaDto, "safeParse").mockReturnValue({ success: false, error: { flatten: () => ({ fieldErrors: { email: ["Invalid email"] } }) } } as any);

    await addUserToIdea(mockReq, mockRes);

    expect(AddUserToIdeaDto.safeParse).toHaveBeenCalledWith({ ideaId, email });
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ errors: { fieldErrors: { email: ["Invalid email"] } } });
  });

  it("test_remove_nonexistent_user_from_idea_returns_404", async () => {
    const ideaId = "idea-404";
    const email = "ghost@example.com";
    mockReq.body = { ideaId, email };
    mockReq.user = { id: "owner-404" };

    vi.spyOn(RemoveUserFromIdeaDto, "safeParse").mockReturnValue({ success: true, data: { ideaId, email } } as any);
    vi.spyOn(prisma.idea, "findUnique").mockResolvedValueOnce({ id: ideaId, userId: "owner-404", user: {} } as any);
    vi.spyOn(prisma.user, "findUnique").mockResolvedValueOnce(null);

    await removeUserFromIdea(mockReq, mockRes);

    expect(RemoveUserFromIdeaDto.safeParse).toHaveBeenCalledWith({ ideaId, email });
    expect(prisma.idea.findUnique).toHaveBeenCalledWith({ where: { id: ideaId }, include: { user: true } });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email } });
    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ message: "User not found." });
  });
});



