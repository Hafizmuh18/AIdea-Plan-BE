import { Request, Response } from "express";
import { registerUser, loginUser, firebaseLogin } from "../services/auth.service";
import { serializeUser } from "../utils/serializeUser";

export const register = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  try {
    const result = await registerUser(email, password, name);
    res.status(201).json(result);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const { user, token } = await loginUser(email, password);
    res.json({
      token,
      user: serializeUser(user, "manual"),
    });
  } catch (e: any) {
    res.status(401).json({ message: e.message });
  }
};

export const firebaseAuth = async (req: Request, res: Response) => {
  const { token } = req.body;
  try {
    const { user, token: jwt } = await firebaseLogin(token);
    res.json({
      token: jwt,
      user: serializeUser(user, "google"),
    });
  } catch (e: any) {
    res.status(401).json({ message: e.message });
  }
};
