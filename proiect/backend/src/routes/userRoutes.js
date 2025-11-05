import express from 'express';
import User from '../models/user.js';

const router = express.Router();

// --- Grupat pentru calea '/' ---
router.route('/')
  .get(async (req, res) => {
    try {
      const users = await User.findAll();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: 'Eroare la preluarea utilizatorilor' });
    }
  })
  .post(async (req, res) => {
    try {
      const { name, email, password, role, managerId } = req.body;

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'Email-ul este deja folosit.' });
      }

      const newUser = await User.create({ name, email, password, role, managerId });
      res.status(201).json({
        message: 'Utilizator creat cu succes!',
        user: newUser
      });

    } catch (error) {
      console.error('Eroare la crearea utilizatorului:', error);
      res.status(500).json({ error: 'Eroare la crearea utilizatorului.' });
    }
  });

// --- Grupat pentru calea '/:id' ---
router.route('/:id')
  .get(async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user)
        return res.status(404).json({ error: 'Utilizatorul nu a fost gasit' });
      res.json(user);

    } catch (error) {
      res.status(500).json({ error: 'Eroare la cautarea utilizatorului' });
    }
  })
  .put(async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user)
        return res.status(404).json({ error: 'Utilizatorul nu a fost gasit' });
      await user.update(req.body);
      res.json(user);

    }
    catch (error) {
      res.status(500).json({ error: 'Eroare la actualizarea utilizatorului' });
    }
  })
  .delete(async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user)
        return res.status(404).json({ error: 'Utilizatorul nu a fost gasit' });
      await user.destroy();
      res.json({ message: 'Utilizatorul a fost sters cu succes' });
    }
    catch (error) {
      res.status(500).json({ error: 'Eroare la stergerea utilizatorului' });
    }
  });

export default router;