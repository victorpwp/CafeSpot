const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'TEXT_SECRET_PENTRU_TOKEN';

async function autentifica(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ mesaj: 'Trebuie sa fii autentificat.' });

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) return res.status(401).json({ mesaj: 'Utilizatorul nu mai exista.' });

        req.user = {
            id: user._id.toString(),
            nume: user.nume,
            rol: user.rol
        };

        next();
    } catch (err) {
        res.status(401).json({ mesaj: 'Sesiunea a expirat sau token-ul este invalid.' });
    }
}

function cereAdmin(req, res, next) {
    if (!req.user || req.user.rol !== 'admin') {
        return res.status(403).json({ mesaj: 'Ai nevoie de rol de administrator.' });
    }

    next();
}

module.exports = {
    JWT_SECRET,
    autentifica,
    cereAdmin
};
