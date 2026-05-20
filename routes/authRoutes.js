const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Cafe = require('../models/Cafe');
const { JWT_SECRET, autentifica } = require('../middleware/authMiddleware');

function cafeCuRating(cafe) {
    const obiect = cafe.toObject();
    const recenzii = (obiect.recenzii || []).filter((recenzie) => recenzie.aprobata !== false);
    const suma = recenzii.reduce((total, recenzie) => total + Number(recenzie.rating || 0), 0);

    obiect.recenzii = recenzii;
    obiect.ratingMediu = recenzii.length ? Number((suma / recenzii.length).toFixed(1)) : 0;

    return obiect;
}

// UC1 inregistrare
router.post('/register', async (req, res) => {
    try {
        const { nume, email, parola } = req.body;

        if (!nume || !email || !parola) {
            return res.status(400).json({ mesaj: 'Completeaza numele, emailul si parola.' });
        }

        const userExistent = await User.findOne({ email });
        if (userExistent) return res.status(400).json({ mesaj: 'Email-ul este deja folosit!' });

        const salt = await bcrypt.genSalt(10);
        const parolaCriptata = await bcrypt.hash(parola, salt);

        const userNou = new User({
            nume,
            email,
            parola: parolaCriptata
        });

        await userNou.save();
        res.status(201).json({ mesaj: 'Cont creat cu succes!' });
    } catch (err) {
        console.error('Eroare la inregistrare:', err);
        res.status(500).json({ eroare: 'Eroare la inregistrare: ' + err.message });
    }
});

// UC2 login
router.post('/login', async (req, res) => {
    try {
        const { email, parola } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ mesaj: 'Email-ul sau parola sunt gresite!' });

        const parolaValida = await bcrypt.compare(parola, user.parola);
        if (!parolaValida) return res.status(400).json({ mesaj: 'Email-ul sau parola sunt gresite!' });

        const token = jwt.sign(
            { id: user._id, rol: user.rol },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            mesaj: 'Te-ai logat cu succes!',
            token,
            user: { nume: user.nume, rol: user.rol }
        });
    } catch (err) {
        console.error('Eroare la login:', err);
        res.status(500).json({ eroare: 'Eroare la login: ' + err.message });
    }
});

// UC6 salvare la favorite
router.post('/favorite', autentifica, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ mesaj: 'Utilizatorul nu exista!' });

        const { cafeId } = req.body;
        if (user.favorite.includes(cafeId)) {
            return res.status(400).json({ mesaj: 'Cafeneaua este deja in lista ta de favorite!' });
        }

        user.favorite.push(cafeId);
        await user.save();

        res.json({ mesaj: 'Cafenea salvata la favorite cu succes!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ eroare: 'Eroare interna la salvarea favoritei.' });
    }
});

// UC6 listare favorite
router.get('/favorite', autentifica, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ mesaj: 'Utilizatorul nu a fost gasit!' });

        const cafeneleFavorite = await Cafe.find({ _id: { $in: user.favorite } });
        res.json(cafeneleFavorite.map(cafeCuRating));
    } catch (err) {
        console.error(err);
        res.status(500).json({ eroare: 'Eroare la preluarea listei de favorite.' });
    }
});

// Eliminare cafenea din favorite
router.delete('/favorite/:cafeId', autentifica, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user.id, {
            $pull: { favorite: req.params.cafeId }
        });

        res.json({ mesaj: 'Cafeneaua a fost eliminata de la favorite!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ eroare: 'Eroare la eliminarea de la favorite.' });
    }
});

module.exports = router;
