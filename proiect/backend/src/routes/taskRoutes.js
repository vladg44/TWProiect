import express from 'express';
import Task from '../models/task.js';
import User from '../models/user.js';

const router = express.Router();

// --- Grupat pentru calea '/' ---
router.route('/')
    .get(async (req, res) => {
        try {
            const tasks = await Task.findAll({ include: { model: User, as: 'assignedUser' } });
            res.json(tasks);
        } catch (error) {
            res.status(500).json({ error: 'Eroare la preluarea task-urilor' });
        }
    })
    .post(async (req, res) => {
        try {
            const { title, description, status, dueDate, assignedUserId } = req.body;
            const newTask = await Task.create({ title, description, status, dueDate, assignedUserId });
            res.status(201).json(newTask);
        }
        catch (error) {
            res.status(500).json({ error: 'Eroare la crearea task-ului' });
        }
    });


// --- Rutele unice raman neschimbate ---

//put alocare task unui utilizator
router.put('/:id/assign', async (req, res) => {
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

//put marcare task ca finalizat
router.put('/:id/complete', async (req, res) => {
    try {
        const task = await Task.findByPk(req.params.id);
        if (!task)
            return res.status(404).json({ error: 'Task-ul nu a fost gasit' });
        
        await task.update({ status: 'COMPLETED' });
        res.json({ message: 'Task-ul a fost marcat ca finalizat cu succes', task });
    }
    catch (error) {
        res.status(500).json({ error: 'Eroare la marcarea task-ului ca finalizat' });
    }
});

//put inchidere task manager
router.put('/:id/close', async (req, res) => {
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
        const tasks = await Task.findAll({ where: { assignedUserId: req.params.userId } });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: 'Eroare la preluarea task-urilor utilizatorului' });
    }
});

export default router;