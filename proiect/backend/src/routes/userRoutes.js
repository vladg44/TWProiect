import express from 'express';
import User from '../models/user.js';

const router = express.Router();

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Eroare la preluarea utilizatorilor' });

  }
});

//POST a new user
router.post('/', async (req, res) => {
  try {
    const {name, email,password,role,managerId} = req.body;
    const newUser = await User.create({ name, email, password, role, managerId });
    res.status(201).json(newUser);
    } catch (error) {
    res.status(500).json({ error: 'Eroare la crearea utilizatorului' });
    }
});


// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) 
        return res.status(404).json({ error: 'Utilizatorul nu a fost gasit' });
        res.json(user);
    
    } catch (error) {
    res.status(500).json({ error: 'Eroare la cautarea utilizatorului' });
    }
});

//PUT -Actualizeaza user
router.put('/:id', async (req, res) => {
    try{
        const user = await User.findByPk(req.params.id);
        if(!user)
            return res.status(404).json({ error: 'Utilizatorul nu a fost gasit' });
        await user.update(req.body);
        res.json(user);

    }
    catch(error){
        res.status(500).json({ error: 'Eroare la actualizarea utilizatorului' });
    }
});

//DELETE - sterge user
router.delete('/:id', async (req, res) => {
    try{
        const user = await User.findByPk(req.params.id);
        if(!user)
            return res.status(404).json({ error: 'Utilizatorul nu a fost gasit' });
        await user.destroy();
        res.json({ message: 'Utilizatorul a fost sters cu succes' });
    }
    catch(error){
        res.status(500).json({ error: 'Eroare la stergerea utilizatorului' });
    }
});

export default router;