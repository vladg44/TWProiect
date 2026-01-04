import express from 'express';
import Task from '../models/task.js';
import User from '../models/user.js';
import { getUser, isManager, isManagerOrAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Aplicam `getUser` pentru TOATE rutele din acest fisier.
// Acum, fiecare cerere catre /api/tasks/... trebuie sa aiba header-ul X-User-ID.
router.use(getUser);


// --- Grupat pentru calea '/' ---
router.route('/')
    // Doar managerii si adminii pot vedea TOATE taskurile
    .get(isManagerOrAdmin, async (req, res) => {
        try {
            const tasks = await Task.findAll({ include: { model: User, as: 'assignedUser' } });
            res.json(tasks);
        } catch (error) {
            res.status(500).json({ error: 'Eroare la preluarea task-urilor' });
        }
    })
    // Doar managerii pot crea un task nou
    .post(isManager, async (req, res) => {
        try {
            const { title, description, dueDate, assignedUserId } = req.body;
            // Fortam statusul 'OPEN' la creare, conform cerintelor
            const newTask = await Task.create({ title, description, status: 'OPEN', dueDate, assignedUserId });
            res.status(201).json(newTask);
        }
        catch (error) {
            res.status(500).json({ error: 'Eroare la crearea task-ului' });
        }
    });


// --- Rutele unice raman neschimbate ---

//put alocare task unui utilizator - doar managerii
router.put('/:id/assign', isManager, async (req, res) => {
    try {
        const task = await Task.findByPk(req.params.id);
        if (!task)
            return res.status(404).json({ error: 'Task-ul nu a fost gasit' });

        const { assignedUserId } = req.body;
        if (!assignedUserId) {
            return res.status(400).json({ error: 'ID-ul utilizatorului este necesar' });
        }

        await task.update({ assignedUserId: assignedUserId, status: 'PENDING' });
        res.json({ message: 'Task-ul a fost alocat cu succes', task });
    } catch (error) {
        res.status(500).json({ error: 'Eroare la alocarea task-ului' });
    }
});

//put marcare task ca finalizat - verificam daca e task-ul lui
router.put('/:id/complete', async (req, res) => {
    try {
        const task = await Task.findByPk(req.params.id);
        if (!task)
            return res.status(404).json({ error: 'Task-ul nu a fost gasit' });
        
        // Verificare suplimentara: doar userul asignat poate completa task-ul
        if (task.assignedUserId !== req.user.id) {
            return res.status(403).json({ error: 'Nu puteti completa un task care nu va este alocat.'});
        }
        
        await task.update({ status: 'COMPLETED' });
        res.json({ message: 'Task-ul a fost marcat ca finalizat cu succes', task });
    }
    catch (error) {
        res.status(500).json({ error: 'Eroare la marcarea task-ului ca finalizat' });
    }
});

//put inchidere task manager - doar managerii
router.put('/:id/close', isManager, async (req, res) => {
    try {
        const task = await Task.findByPk(req.params.id);
        if (!task)
            return res.status(404).json({ error: 'Task-ul nu a fost gasit' });

        await task.update({ status: 'CLOSED' });
        res.json({ message: 'Task-ul a fost inchis cu succes', task });
    } catch (error) {
        res.status(500).json({ error: 'Eroare la inchiderea task-ului' });
    }
});

//vezi taskurile unui utilizator
router.get('/user/:userId', async (req, res) => {
    try {
        const requestedUserId = parseInt(req.params.userId, 10);

        // Verificare: Un user normal (executant) isi poate vedea doar taskurile proprii.
        if (req.user.role !== 'manager' && req.user.id !== requestedUserId) {
             return res.status(403).json({ error: 'Nu aveti permisiunea de a vizualiza task-urile altui utilizator.' });
        }

        const tasks = await Task.findAll({ where: { assignedUserId: req.params.userId } });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: 'Eroare la preluarea task-urilor utilizatorului' });
    }
});

export default router;