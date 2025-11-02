import express from 'express';
import Task  from '../models/task.js';
import User from '../models/user.js';

const router = express.Router();

//get all tasks
router.get('/', async (req, res) => {
    try {
        const tasks = await Task.findAll({include: User});
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: 'Eroare la preluarea task-urilor' });
    }
    });

//POST a new task
router.post('/', async (req, res) => {
    try {
        const{title , description, status, dueDate, assignedUserId} = req.body;
        const newTask = await Task.create({title, description, status, dueDate, assignedUserId});
        res.status(201).json(newTask);
    }
    catch (error) {
        res.status(500).json({ error: 'Eroare la crearea task-ului' });
    }
});

//put alocare task unui utilizator de la manager la executor

router.put('/:id/assign', async (req, res) => {
    try {
        const task = await Task.findByPk(req.params.id);
        if (!task)
            return res.status(404).json({ error: 'Task-ul nu a fost gasit' });

        await task.update({ assigedTo,status: 'In Progress' });
        res.json({ message: 'Task-ul a fost alocat cu succes', task });
    } catch (error) {
        res.status(500).json({ error: 'Eroare la alocarea task-ului' });
    }
});

//put marcare task ca finalizat de catre executor

router.put('/:id/complete', async (req, res) => {
    try {
        const task = await Task.findByPk(req.params.id);
        if (!task)
            return res.status(404).json({ error: 'Task-ul nu a fost gasit' });
        await task.update({ status: 'Completed' });
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

        await task.update({ status: 'Closed' });
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