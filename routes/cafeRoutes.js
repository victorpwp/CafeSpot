const express = require('express');
const router = express.Router();
const Cafe = require('../models/Cafe');
const { autentifica, cereAdmin } = require('../middleware/authMiddleware');

function ratingMediu(cafe) {
    const recenziiAprobate = (cafe.recenzii || []).filter((recenzie) => recenzie.aprobata !== false);
    if (recenziiAprobate.length === 0) return 0;

    const suma = recenziiAprobate.reduce((total, recenzie) => total + Number(recenzie.rating || 0), 0);
    return Number((suma / recenziiAprobate.length).toFixed(1));
}

function cafePublic(cafe) {
    const obiect = cafe.toObject();
    obiect.recenzii = (obiect.recenzii || []).filter((recenzie) => recenzie.aprobata !== false);
    obiect.ratingMediu = ratingMediu(cafe);
    return obiect;
}

// UC7 adaugare cafenea
router.post('/', autentifica, cereAdmin, async (req, res) => {
    try {
        const nouaCafenea = new Cafe(req.body);
        await nouaCafenea.save();
        res.status(201).json({ mesaj: 'Cafenea adaugata cu succes!', date: cafePublic(nouaCafenea) });
    } catch (err) {
        res.status(400).json({ eroare: 'Nu am putut salva cafeneaua', detalii: err.message });
    }
});

// UC3 preluare si cautare cafenele
router.get('/', async (req, res) => {
    try {
        const { search } = req.query;
        const filtru = search
            ? {
                $or: [
                    { nume: { $regex: search, $options: 'i' } },
                    { adresa: { $regex: search, $options: 'i' } }
                ]
            }
            : {};

        const toateCafenelele = await Cafe.find(filtru);
        res.json(toateCafenelele.map(cafePublic));
    } catch (err) {
        res.status(500).json({ eroare: 'Eroare la preluarea cafenelelor' });
    }
});

// UC10 listare recenzii pentru moderare
router.get('/admin/recenzii', autentifica, cereAdmin, async (req, res) => {
    try {
        const cafenele = await Cafe.find();
        const recenzii = [];

        cafenele.forEach((cafe) => {
            cafe.recenzii.forEach((recenzie) => {
                recenzii.push({
                    cafeId: cafe._id,
                    cafeNume: cafe.nume,
                    recenzieId: recenzie._id,
                    utilizator: recenzie.utilizator,
                    rating: recenzie.rating,
                    comentariu: recenzie.comentariu,
                    aprobata: recenzie.aprobata !== false,
                    data: recenzie.data
                });
            });
        });

        res.json(recenzii.sort((a, b) => new Date(b.data) - new Date(a.data)));
    } catch (err) {
        res.status(500).json({ eroare: 'Eroare la preluarea recenziilor.' });
    }
});

// UC5 preluare o singura cafenea dupa ID
router.get('/:id', async (req, res) => {
    try {
        const cafenea = await Cafe.findById(req.params.id);
        if (!cafenea) return res.status(404).json({ mesaj: 'Cafeneaua nu a fost gasita' });
        res.json(cafePublic(cafenea));
    } catch (err) {
        res.status(500).json({ eroare: 'ID invalid' });
    }
});

// UC8 actualizare cafenea
router.put('/:id', autentifica, cereAdmin, async (req, res) => {
    try {
        const cafeneaActualizata = await Cafe.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!cafeneaActualizata) return res.status(404).json({ mesaj: 'Cafeneaua nu a fost gasita.' });
        res.json({ mesaj: 'Cafenea actualizata!', date: cafePublic(cafeneaActualizata) });
    } catch (err) {
        res.status(400).json({ eroare: 'Eroare la actualizare', detalii: err.message });
    }
});

// UC9 stergere cafenea
router.delete('/:id', autentifica, cereAdmin, async (req, res) => {
    try {
        await Cafe.findByIdAndDelete(req.params.id);
        res.json({ mesaj: 'Cafenea stearsa cu succes!' });
    } catch (err) {
        res.status(500).json({ eroare: 'Nu am putut sterge cafeneaua' });
    }
});

// UC4 adaugare recenzie
router.post('/:id/recenzii', autentifica, async (req, res) => {
    try {
        const cafe = await Cafe.findById(req.params.id);
        if (!cafe) return res.status(404).json({ mesaj: 'Cafeneaua nu exista' });

        const rating = Number(req.body.rating);
        if (!rating || rating < 1 || rating > 5 || !req.body.comentariu) {
            return res.status(400).json({ mesaj: 'Alege un rating intre 1 si 5 si scrie un comentariu.' });
        }

        const nouaRecenzie = {
            rating,
            comentariu: req.body.comentariu,
            utilizator: req.user.nume,
            userId: req.user.id,
            aprobata: true
        };

        cafe.recenzii.push(nouaRecenzie);
        await cafe.save();

        res.status(201).json({ mesaj: 'Recenzie adaugata!', recenzii: cafePublic(cafe).recenzii });
    } catch (err) {
        res.status(400).json({ eroare: 'Eroare la salvarea recenziei' });
    }
});

// UC10 aprobare recenzie
router.patch('/:cafeId/recenzii/:recenzieId/aproba', autentifica, cereAdmin, async (req, res) => {
    try {
        const cafe = await Cafe.findById(req.params.cafeId);
        if (!cafe) return res.status(404).json({ mesaj: 'Cafeneaua nu exista.' });

        const recenzie = cafe.recenzii.id(req.params.recenzieId);
        if (!recenzie) return res.status(404).json({ mesaj: 'Recenzia nu exista.' });

        recenzie.aprobata = true;
        await cafe.save();

        res.json({ mesaj: 'Recenzie aprobata.' });
    } catch (err) {
        res.status(400).json({ eroare: 'Eroare la aprobarea recenziei.' });
    }
});

// UC10 editare recenzie
router.put('/:cafeId/recenzii/:recenzieId', autentifica, cereAdmin, async (req, res) => {
    try {
        const cafe = await Cafe.findById(req.params.cafeId);
        if (!cafe) return res.status(404).json({ mesaj: 'Cafeneaua nu exista.' });

        const recenzie = cafe.recenzii.id(req.params.recenzieId);
        if (!recenzie) return res.status(404).json({ mesaj: 'Recenzia nu exista.' });

        const rating = Number(req.body.rating);
        if (!rating || rating < 1 || rating > 5 || !req.body.comentariu) {
            return res.status(400).json({ mesaj: 'Ratingul si comentariul sunt obligatorii.' });
        }

        recenzie.rating = rating;
        recenzie.comentariu = req.body.comentariu;
        recenzie.aprobata = req.body.aprobata !== false;
        await cafe.save();

        res.json({ mesaj: 'Recenzie actualizata.' });
    } catch (err) {
        res.status(400).json({ eroare: 'Eroare la editarea recenziei.' });
    }
});

// UC10 stergere recenzie
router.delete('/:cafeId/recenzii/:recenzieId', autentifica, cereAdmin, async (req, res) => {
    try {
        const cafe = await Cafe.findById(req.params.cafeId);
        if (!cafe) return res.status(404).json({ mesaj: 'Cafeneaua nu exista.' });

        const recenzie = cafe.recenzii.id(req.params.recenzieId);
        if (!recenzie) return res.status(404).json({ mesaj: 'Recenzia nu exista.' });

        recenzie.deleteOne();
        await cafe.save();

        res.json({ mesaj: 'Recenzie stearsa.' });
    } catch (err) {
        res.status(400).json({ eroare: 'Eroare la stergerea recenziei.' });
    }
});

module.exports = router;
