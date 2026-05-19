const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Cafe = require('../models/Cafe');

//UC1 inregistrare
router.post('/register', async (req, res) => {
    try {
        const { nume, email, parola } = req.body;

        let userExistent = await User.findOne({ email });
        if (userExistent) return res.status(400).json({ mesaj: "Email-ul este deja folosit!" });

        const salt = await bcrypt.genSalt(10);
        const parolaCriptata = await bcrypt.hash(parola, salt);

        const userNou = new User({
            nume,
            email,
            parola: parolaCriptata
        });

        await userNou.save();
        res.status(201).json({ mesaj: "Cont creat cu succes!" });
    } catch (err) {
        // AICI AM MODIFICAT: Afișăm eroarea exactă în consolă și o trimitem la frontend
        console.error("❌ Eroare detaliată la înregistrare:", err);
        res.status(500).json({ eroare: "Eroare la înregistrare: " + err.message });
    }
});

//UC2 login
router.post('/login', async (req, res) => {
    try {
        const { email, parola } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ mesaj: "Email-ul sau parola sunt greșite!" });

        const parolaValida = await bcrypt.compare(parola, user.parola);
        if (!parolaValida) return res.status(400).json({ mesaj: "Email-ul sau parola sunt greșite!" });

        const token = jwt.sign(
            { id: user._id, rol: user.rol }, 
            "TEXT_SECRET_PENTRU_TOKEN", 
            { expiresIn: '24h' }
        );

        res.json({
            mesaj: "Te-ai logat cu succes!",
            token,
            user: { nume: user.nume, rol: user.rol }
        });
    } catch (err) {
        // AICI AM MODIFICAT: La fel, prindem eroarea exactă
        console.error("❌ Eroare detaliată la login:", err);
        res.status(500).json({ eroare: "Eroare la login: " + err.message });
    }
});

//UC6 salvare la favorite
router.post('/favorite', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ mesaj: "Nu sunteti autentificat!" });

        const token = authHeader.split(" ")[1];
        
        const decoded = jwt.verify(token, "TEXT_SECRET_PENTRU_TOKEN");
        const user = await User.findById(decoded.id);

        if (!user) return res.status(404).json({ mesaj: "Utilizatorul nu există!" });

        const { cafeId } = req.body;

        if (user.favorite.includes(cafeId)) {
            return res.status(400).json({ mesaj: "Cafeneaua este deja în lista ta de favorite!" });
        }

        user.favorite.push(cafeId);
        await user.save();

        res.json({ mesaj: "Cafenea salvată la favorite cu succes!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ eroare: "Eroare internă. Token invalid sau expirat." });
    }
});

//UC6 - favorite.html page
router.get('/favorite', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ mesaj: "Nu ești autentificat!" });

        const token = authHeader.split(" ")[1];
        
        const decoded = jwt.verify(token, "TEXT_SECRET_PENTRU_TOKEN");
        const user = await User.findById(decoded.id);

        if (!user) return res.status(404).json({ mesaj: "Utilizatorul nu a fost găsit!" });

        const cafeneleFavorite = await Cafe.find({ _id: { $in: user.favorite } });

        res.json(cafeneleFavorite);
    } catch (err) {
        console.error(err);
        res.status(500).json({ eroare: "Eroare la preluarea listei de favorite." });
    }
});

//eliminare cafenea din favorite
router.delete('/favorite/:cafeId', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ mesaj: "Nu ești autentificat!" });

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, "TEXT_SECRET_PENTRU_TOKEN");

        await User.findByIdAndUpdate(decoded.id, {
            $pull: { favorite: req.params.cafeId }
        });

        res.json({ mesaj: "Cafeneaua a fost eliminată de la favorite!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ eroare: "Eroare la eliminarea de la favorite." });
    }
});

module.exports = router;