const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

//Importăm rutele modularizate
const authRoutes = require('./routes/authRoutes');
const cafeRoutes = require('./routes/cafeRoutes');

const app = express();

app.use(express.json());

//Middleware pentru logare cereri
app.use((req, res, next) => {
    console.log(`Cerere primită: ${req.method} la adresa ${req.url}`);
    next();
});

app.use(express.static(path.join(__dirname, 'public')));

//Conectare la MongoDB
const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cafespot';

mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 5000 })
    .then(() => console.log('Conectare reușită la MongoDB'))
    .catch(err => console.error('Eroare de conectare:', err.message));

//Pagina principală
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use('/api', authRoutes);         //conectare auth
app.use('/api/cafenele', cafeRoutes); //conectare cafe

app.listen(5000, () => console.log('Server pornit pe http://localhost:5000'));