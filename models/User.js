const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    nume: { type: String, required: true },
    email: { type: String, required: true, unique: true }, 
    parola: { type: String, required: true },
    rol: { type: String, default: 'utilizator' },
    favorite: [{ type: String }]
});

module.exports = mongoose.model('User', UserSchema);