import { Router } from "express";
import {
  getUserIdea,
  getIdeaById,
  updateIdea,
  deleteIdea,
  addUserToIdea,
  removeUserFromIdea,
  addFunctionality,
  updateFunctionality,
  removeFunctionality,
  addAdditionalFunctionality,
  updateAdditionalFunctionality,
  removeAdditionalFunctionality,
  addTechStack,
  updateTechStack,
  removeTechStack,
  addMilestone,
  updateMilestone,
  removeMilestone,
  addCheckpoint,
  updateCheckpoint,
  removeCheckpoint,
  addReference,
  updateReference,
  removeReference,
  addDocument,
  updateDocument,
  removeDocument,
  addTask,
  updateTask,
  removeTask,
} from "../controllers/idea.controller";

const router = Router();

// IDEA
router.get("/", getUserIdea);
router.get("/:id", getIdeaById);
router.put("/:id", updateIdea);
router.delete("/:id", deleteIdea);

// COLLABORATOR
router.post("/add-user", addUserToIdea);
router.post("/remove-user", removeUserFromIdea);

// FUNCTIONALITY
router.post("/functionality", addFunctionality);
router.put("/functionality/:id", updateFunctionality);
router.delete("/functionality/:id", removeFunctionality);

// ADDITIONAL FUNCTIONALITY
router.post("/additional-functionality", addAdditionalFunctionality);
router.put("/additional-functionality/:id", updateAdditionalFunctionality);
router.delete("/additional-functionality/:id", removeAdditionalFunctionality);

// TECH STACK
router.post("/tech-stack", addTechStack);
router.put("/tech-stack/:id", updateTechStack);
router.delete("/tech-stack/:id", removeTechStack);

// MILESTONE & CHECKPOINT
router.post("/milestone", addMilestone);
router.put("/milestone/:id", updateMilestone);
router.delete("/milestone/:id", removeMilestone);

router.post("/checkpoint", addCheckpoint);
router.put("/checkpoint/:id", updateCheckpoint);
router.delete("/checkpoint/:id", removeCheckpoint);

// REFERENCE MATERIAL
router.post("/reference", addReference);
router.put("/reference/:id", updateReference);
router.delete("/reference/:id", removeReference);

// DOCUMENT
router.post("/document", addDocument);
router.put("/document/:id", updateDocument);
router.delete("/document/:id", removeDocument);

// TASK
router.post("/task", addTask);
router.put("/task/:id", updateTask);
router.delete("/task/:id", removeTask);

export default router;
