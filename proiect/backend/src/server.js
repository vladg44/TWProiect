import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from "../config/db.js";
import User from './models/user.js';
import Task from './models/task.js';
import Team from './models/team.js';
import setupAssociations from './models/associations.js';
import userRoutes from './routes/userRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());

// Enable CORS for frontend (adjust origin as needed)
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','X-User-ID']
}));

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Conexiune la baza de date reușită!");

    setupAssociations();
    console.log("🤝 Asociatiile au fost configurate!");

    await sequelize.sync({ alter: true });
    console.log("📦 Modelele au fost sincronizate cu baza de date!");

    // test route
    app.get("/", (req, res) => {
      res.send("Serverul funcționează! 🚀");
    });

    app.listen(PORT, () => {
      console.log(`🌍 Serverul rulează pe http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("❌ Eroare la pornirea serverului:", error);
  }
};
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

startServer();
