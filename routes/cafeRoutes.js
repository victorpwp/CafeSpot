const express = require('express');
const router = express.Router();
const Cafe = require('../models/Cafe');

// Adăugare cafenea
router.post('/', async (req, res) => {
    try {
        const nouaCafenea = new Cafe(req.body);
        await nouaCafenea.save();
        res.status(201).json({ mesaj: "Cafenea adăugată cu succes!", date: nouaCafenea });
    } catch (err) {
        res.status(400).json({ eroare: "Nu am putut salva cafeneaua", detalii: err.message });
    }
});

// Preluare toate cafenelele
router.get('/', async (req, res) => {
    try {
        const toateCafenelele = await Cafe.find(); 
        res.json(toateCafenelele);
    } catch (err) {
        res.status(500).json({ eroare: "Eroare la preluarea cafenelelor" });
    }
});

// Preluare o singură cafenea după ID (UC6)
router.get('/:id', async (req, res) => {
    try {
        const cafenea = await Cafe.findById(req.params.id);
        if (!cafenea) return res.status(404).json({ mesaj: "Cafeneaua nu a fost găsită" });
        res.json(cafenea);
    } catch (err) {
        res.status(500).json({ eroare: "ID invalid" });
    }
});

// Actualizare cafenea (UC8)
router.put('/:id', async (req, res) => {
    try {
        const cafeneaActualizata = await Cafe.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ mesaj: "Cafenea actualizată!", date: cafeneaActualizata });
    } catch (err) {
        res.status(400).json({ eroare: "Eroare la actualizare", detalii: err.message });
    }
});

// Ștergere cafenea (UC9)
router.delete('/:id', async (req, res) => {
    try {
        await Cafe.findByIdAndDelete(req.params.id);
        res.json({ mesaj: "Cafenea ștearsă cu succes!" });
    } catch (err) {
        res.status(500).json({ eroare: "Nu am putut șterge cafeneaua" });
    }
});

// Adăugare recenzie (UC10)
router.post('/:id/recenzii', async (req, res) => {
    try {
        const cafe = await Cafe.findById(req.params.id);
        if (!cafe) return res.status(404).json({ mesaj: "Cafeneaua nu există" });

        const nouaRecenzie = {
            rating: req.body.rating,
            comentariu: req.body.comentariu,
            utilizator: req.body.utilizator || "Anonim"
        };

        cafe.recenzii.push(nouaRecenzie);
        await cafe.save();

        res.status(201).json({ mesaj: "Recenzie adăugată!", recenzii: cafe.recenzii });
    } catch (err) {
        res.status(400).json({ eroare: "Eroare la salvarea recenziei" });
    }
});

module.exports = router;