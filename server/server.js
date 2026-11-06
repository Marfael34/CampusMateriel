const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
// Utilise l'URI du fichier .env ou bascule sur une URL locale par défaut
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/campus-materiel';

// --- MIDDLEWARES ---
app.use(cors());
app.use(express.json());

// --- ROUTE DE TEST ---
app.get('/', (req, res) => {
  res.json({ message: "Bienvenue sur l'API de Campus Matériel 🚀" });
});

// --- CONNEXION BDD & LANCEMENT DU SERVEUR ---
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connecté à MongoDB avec succès');
    app.listen(PORT, () => {
      console.log(`🚀 Serveur en cours d'exécution sur le port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Erreur de connexion à MongoDB :', err);
  });