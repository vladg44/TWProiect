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

const corsOptions = {
  origin: 'https://proiectfilgamersh.netlify.app',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

const PORT = process.env.PORT || 3000;


app.use(express.json());

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
app.use('/users', userRoutes);
app.use('/tasks', taskRoutes);
app.use('/teams', teamRoutes);
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);

startServer();
