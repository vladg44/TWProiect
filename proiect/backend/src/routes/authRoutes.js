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

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, managerId } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email și parola sunt necesare.' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email-ul este deja folosit.' });
    }

    // Validate role if provided
    const allowedRoles = ['admin', 'manager', 'executor'];
    const chosenRole = allowedRoles.includes(role) ? role : 'executor';

    const newUser = await User.create({ name, email, password, role: chosenRole, managerId: managerId || null });
    res.status(201).json({
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        managerId: newUser.managerId || null,
      }
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
        const messages = error.errors.map(err => err.message);
        return res.status(400).json({ error: messages.join(', ') });
    }
    console.error('Eroare la register:', error);
    res.status(500).json({ error: 'Eroare la inregistrare.' });
  }
});

// GET /api/auth/managers - list managers (public)
router.get('/managers', async (req, res) => {
  try {
    const managers = await User.findAll({ where: { role: 'manager' }, attributes: ['id', 'name', 'email'] });
    res.json({ managers });
  } catch (error) {
    console.error('Eroare la listarea managerilor:', error);
    res.status(500).json({ error: 'Eroare la listarea managerilor.' });
  }
});

export default router;
