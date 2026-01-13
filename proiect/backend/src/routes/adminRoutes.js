import express from 'express';
import User from '../models/user.js';
import Task from '../models/task.js'; // Corectie: Adauga importul lipsa
import sequelize from '../../config/db.js';
import { getUser, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Toate rutele de aici sunt protejate si accesibile doar adminilor
router.use(getUser, isAdmin);

// Endpoint pentru a prelua toti utilizatorii (manageri si executanti)
router.get('/users', async (req, res) => {
    try {
        const users = await User.findAll({ attributes: { exclude: ['password'] } });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Eroare la preluarea utilizatorilor.' });
    }
});

// Endpoint pentru a schimba rolul unui utilizator
router.put('/users/:id/role', async (req, res) => {
    const { newRole, newManagerId } = req.body;
    const userId = req.params.id;

    // Validari de baza
    if (!newRole || !['manager', 'executor'].includes(newRole)) {
        return res.status(400).json({ error: 'Noul rol este invalid.' });
    }
    if (newRole === 'executor' && !newManagerId) {
        return res.status(400).json({ error: 'Un executant nou trebuie sa aiba un manager.' });
    }

    const transaction = await sequelize.transaction();

    try {
        const userToUpdate = await User.findByPk(userId, { transaction });
        if (!userToUpdate) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Utilizatorul nu a fost gasit.' });
        }

        const currentRole = userToUpdate.role;

        // Promovare la manager
        if (currentRole === 'executor' && newRole === 'manager') {
            userToUpdate.role = 'manager';
            userToUpdate.managerId = null; // Managerii nu au manager
        } 
        // Retrogradare la executant
        else if (currentRole === 'manager' && newRole === 'executor') {
            // 1. Reasigneaza fostii subordonati la null
            await User.update(
                { managerId: null },
                { where: { managerId: userId }, transaction }
            );

            // 2. Actualizeaza rolul si noul manager al utilizatorului retrogradat
            userToUpdate.role = 'executor';
            userToUpdate.managerId = newManagerId;
        } else {
            // Daca nu e niciuna din cele de mai sus, e o stare invalida
            await transaction.rollback();
            return res.status(400).json({ error: `Schimbarea de la ${currentRole} la ${newRole} nu este permisa.` });
        }

        await userToUpdate.save({ transaction });
        await transaction.commit();

        res.json({ message: 'Rolul a fost actualizat cu succes.', user: userToUpdate });

    } catch (error) {
        await transaction.rollback();
        console.error("Eroare la schimbarea rolului:", error);
        res.status(500).json({ error: 'A aparut o eroare la schimbarea rolului.' });
    }
});

// Endpoint pentru a schimba managerul unui executant
router.put('/users/:id/manager', async (req, res) => {
    const { newManagerId } = req.body;
    const userId = req.params.id;

    try {
        const executor = await User.findByPk(userId);
        if (!executor || executor.role !== 'executor') {
            return res.status(404).json({ error: 'Executantul nu a fost gasit.' });
        }

        // Daca newManagerId este null, eliberam executantul
        if (newManagerId === null) {
            executor.managerId = null;
        } else {
            // Daca nu, validam noul manager
            const newManager = await User.findByPk(newManagerId);
            if (!newManager || newManager.role !== 'manager') {
                return res.status(404).json({ error: 'Noul manager selectat nu este valid.' });
            }
            executor.managerId = newManagerId;
        }
        
        await executor.save();
        res.json({ message: 'Managerul a fost actualizat cu succes.', user: executor });

    } catch (error) {
        console.error("Eroare la schimbarea managerului:", error);
        res.status(500).json({ error: 'A aparut o eroare la schimbarea managerului.' });
    }
});

// Endpoint pentru a modifica orice task
router.put('/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findByPk(req.params.id);
        if (!task) {
            return res.status(404).json({ error: 'Task-ul nu a fost gasit.' });
        }
        
        // Permitem actualizarea campurilor selectate
        const { title, description, status, assignedUserId, dueDate } = req.body;
        await task.update({ title, description, status, assignedUserId, dueDate });

        res.json({ message: 'Task actualizat cu succes.', task });
    } catch (error) {
        if (error.name === 'SequelizeValidationError') {
            const messages = error.errors.map(err => err.message);
            return res.status(400).json({ error: messages.join(', ') });
        }
        console.error("Eroare la actualizarea task-ului:", error);
        res.status(500).json({ error: 'A aparut o eroare la actualizarea task-ului.' });
    }
});

// Endpoint pentru a sterge un task
router.delete('/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findByPk(req.params.id);
        if (!task) {
            return res.status(404).json({ error: 'Task-ul nu a fost gasit.' });
        }
        await task.destroy();
        res.json({ message: 'Task-ul a fost sters cu succes.' });
    } catch (error) {
        console.error("Eroare la stergerea task-ului:", error);
        res.status(500).json({ error: 'A aparut o eroare la stergerea task-ului.' });
    }
});

export default router;
