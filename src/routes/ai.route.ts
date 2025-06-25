import { Router } from "express";
import { generateFromIdea } from "../controllers/ai.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/generate", authMiddleware, generateFromIdea);

export default router;
