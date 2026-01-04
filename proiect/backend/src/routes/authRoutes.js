import express from 'express';
import User from '../models/user.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email și parola sunt necesare.' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Email sau parola incorectă.' });
    }

    // Notă: parola este stocată simplu în acest proiect (fără hashing).
    if (user.password !== password) {
      return res.status(401).json({ error: 'Email sau parola incorectă.' });
    }

    // Returnăm date minim necesare clientului
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        managerId: user.managerId || null,
      }
    });

  } catch (error) {
    console.error('Eroare la login:', error);
    res.status(500).json({ error: 'Eroare la autentificare.' });
  }
});

export default router;
