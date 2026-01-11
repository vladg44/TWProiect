import express from 'express';
import User from '../models/user.js';
import { getUser, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(getUser);

router.route('/')
  .get(async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: { exclude: ['password'] }
      });
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: 'Eroare la preluarea utilizatorilor' });
    }
  })
  .post(isAdmin, async (req, res) => {
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

router.route('/:id')
  .get(async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id, {
        attributes: { exclude: ['password'] }
      });
      if (!user)
        return res.status(404).json({ error: 'Utilizatorul nu a fost gasit' });
      res.json(user);

    } catch (error) {
      res.status(500).json({ error: 'Eroare la cautarea utilizatorului' });
    }
  })
  .put(isAdmin, async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user)
        return res.status(440).json({ error: 'Utilizatorul nu a fost gasit' });

      // Asiguram ca parola nu este trimisa goala accidental
      if (req.body.password === '' || req.body.password === null) {
        delete req.body.password;
      }
      
      await user.update(req.body);
      res.json(user);

    }
    catch (error) {
      res.status(500).json({ error: 'Eroare la actualizarea utilizatorului' });
    }
  })
  .delete(isAdmin, async (req, res) => {
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

// Ruta pentru manageri sa vada echipa lor
router.get('/team', async (req, res) => {
  try {
    // Verificam daca userul este manager
    if (req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Doar managerii pot accesa aceasta ruta.' });
    }

    const teamMembers = await User.findAll({
      where: { managerId: req.user.id },
      attributes: { exclude: ['password'] }
    });

    res.json(teamMembers);
  } catch (error) {
    res.status(500).json({ error: 'Eroare la preluarea membrilor echipei' });
  }
});

export default router;