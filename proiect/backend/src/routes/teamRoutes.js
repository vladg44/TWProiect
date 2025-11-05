import express from 'express';
import Team from '../models/team.js';
import User from '../models/user.js';

const router = express.Router();

// GET /api/teams - Ia toate echipele
router.get('/', async (req, res) => {
    try {
        const teams = await Team.findAll();
        res.json(teams);
    } catch (err) {
        res.status(500).json({ error: 'Eroare la preluarea echipelor' });
    }
});

// POST /api/teams - Creeaza o echipa noua
router.post('/', async (req, res) => {
    try {
        const { name } = req.body;
        const newTeam = await Team.create({ name });
        res.status(201).json(newTeam);
    } catch (err) {
        res.status(500).json({ error: 'Eroare la crearea echipei' });
    }
});

// GET /api/teams/:id/users - Ia toti utilizatorii dintr-o echipa
router.get('/:id/users', async (req, res) => {
    try {
        const users = await User.findAll({ where: { teamId: req.params.id } });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Eroare la preluarea utilizatorilor echipei' });
    }
});

// PUT /api/teams/:id - Actualizeaza o echipa
router.put('/:id', async (req, res) => {

    try {
        const team = await Team.findByPk(req.params.id);
        if (!team)
            return res.status(404).json({ error: 'Echipa nu a fost gasita' });
        await team.update(req.body);
        res.json(team);

    }
    catch (error) {
        res.status(500).json({ error: 'Eroare la actualizarea echipei' });
    }
    
});

// DELETE /api/teams/:id - Sterge o echipa
router.delete('/:id', async (req, res) => {
    try {
        const team = await Team.findByPk(req.params.id);
        if (!team)
            return res.status(404).json({ error: 'Echipa nu a fost gasita' });
        await team.destroy();
        res.json({ message: 'Echipa a fost stearsa cu succes' });
    } catch (error) {
        res.status(500).json({ error: 'Eroare la stergerea echipei' });
    }
});

export default router;