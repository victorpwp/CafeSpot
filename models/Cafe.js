const mongoose = require('mongoose');

const CafeSchema = new mongoose.Schema({
    nume: { type: String, required: true },
    adresa: { type: String, required: true },
    latitudine: { type: Number, required: true },
    longitudine: { type: Number, required: true },
    descriere: String,
    orar: String,


    recenzii: [
        {
            utilizator: { type: String, default: "Anonim" },
            rating: { type: Number, required: true },
            comentariu: { type: String, required: true },
            data: { type: Date, default: Date.now }
        }
    ]

});

module.exports = mongoose.model('Cafe', CafeSchema);