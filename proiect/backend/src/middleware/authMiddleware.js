import User from '../models/user.js';

// Middleware principal pentru a prelua utilizatorul pe baza unui header.

// Pentru simplitate, vom presupune ca ID-ul user-ului vine intr-un header `X-User-ID`.
export const getUser = async (req, res, next) => {
    const userId = req.headers['x-user-id'];
    if (!userId) {
        return res.status(401).json({ error: 'Autentificare necesara (lipseste header-ul X-User-ID)' });
    }

    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(401).json({ error: 'Utilizator invalid' });
        }
        req.user = user; // Ataseaza user-ul la obiectul `req` pentru a fi folosit mai tarziu
        next(); // Continua catre urmatoarea functie (middleware sau ruta finala)
    } catch (error) {
        res.status(500).json({ error: 'Eroare la autentificare' });
    }
};

// Middleware pentru a verifica daca utilizatorul este manager sau admin
export const isManagerOrAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'manager' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({ error: 'Acces interzis. Doar managerii sau administratorii pot efectua aceasta actiune.' });
    }
};

// Middleware pentru a verifica daca utilizatorul este manager
export const isManager = (req, res, next) => {
    if (req.user && req.user.role === 'manager') {
        next();
    } else {
        res.status(403).json({ error: 'Acces interzis. Doar managerii pot efectua aceasta actiune.' });
    }
};

// Middleware pentru a verifica daca utilizatorul este admin
export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Acces interzis. Doar administratorii pot efectua aceasta actiune.' });
    }
};
