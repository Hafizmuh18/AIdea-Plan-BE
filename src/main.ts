import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from "./routes/auth.route";
import { authMiddleware } from './middlewares/auth.middleware';
import prisma from './lib/prisma';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // alamat Next.js FE
  credentials: true,
}));
app.use(express.json());

// Routes
app.get('/', (_, res) => {
  res.send('Welcome to AIdeaPlan API!');
});
app.use("/api/auth", authRoutes);

app.get('/api/me', authMiddleware, async (req, res) => {
  const userId = (req as any).user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      authProvider: true,
    }
  });

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.json({ user }); // ✅ cukup .json() tanpa return
});



app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
