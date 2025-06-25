import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
import admin from "../lib/firebase-admin";

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error("Missing JWT_SECRET");

export const registerUser = async (email: string, password: string, name?: string) => {
  if (!email || !password) throw new Error("Email and password are required");

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("Email already registered");

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash: hashed,
      authProvider: "local"
    }
  });

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
  return { user, token };
};

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) throw new Error("Invalid credentials");

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) throw new Error("Invalid credentials");

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
  return { user, token };
};

export const firebaseLogin = async (idToken: string) => {
  const decoded = await admin.auth().verifyIdToken(idToken);
  const { uid, email, name, picture } = decoded;

  let user = await prisma.user.findUnique({ where: { firebaseUid: uid } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: email!,
        name,
        image: picture,
        firebaseUid: uid,
        authProvider: "firebase"
      }
    });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
  return { user, token };
};
