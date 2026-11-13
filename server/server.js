const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
// 127.0.0.1 force l'IPv4 pour garantir le lien avec ton conteneur MongoDB sous WSL
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus_materiel';

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());

// Logger pratique pour surveiller l'activité dans ton terminal WSL
app.use((req, res, next) => {
  console.log(`📥 [${req.method}] ${req.url}`);
  next();
});

// --- IMPORT ET MONTAGE DES ROUTES ---
const produitsRoutes = require('./routes/produits');
const reservationsRoutes = require('./routes/reservations');

app.use('/api/produits', produitsRoutes);
app.use('/api/reservations', reservationsRoutes);

app.get('/', (req, res) => {
  res.json({ message: "API Campus Matériel opérationnelle 🚀" });
});

// --- DÉMARRAGE ---
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connecté à MongoDB (campus_materiel)');
    app.listen(PORT, () => {
      console.log(`🚀 Serveur backend actif sur http://localhost:${PORT}`);
    });
  })
  .catch(err => console.error('❌ Erreur de connexion MongoDB :', err));