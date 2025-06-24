import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from "./routes/auth.route";
import { authMiddleware } from './middlewares/auth.middleware';
import prisma from './lib/prisma';
import aiRoutes from "./routes/ai.route";
import ideaRoute from "./routes/idea.route";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json());

// Routes
app.get('/', (_, res) => {
    res.send('Welcome to AIdeaPlan API!');
});
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/ideas", authMiddleware, ideaRoute);


app.get('/api/me', authMiddleware, async (req, res) => {
    const userId = req.user?.id;

    if (!userId) {
        res.status(401).json({ message: "User ID not found in token payload" });
        return;
    }

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

    res.json({ user });
});


app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});