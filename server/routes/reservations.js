const express = require('express');
const router = express.Router();
const { Reservation } = require('../models');
const verifyToken = require('../middleware/auth');

// Route POST pour créer une réservation (sécurisée par JWT)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { dateDebut, dateFin, produits } = req.body;

    if (!dateDebut || !dateFin || !produits || produits.length === 0) {
      return res.status(400).json({ error: "Données de réservation incomplètes." });
    }

    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);

    if (fin <= debut) {
      return res.status(400).json({ error: "La date de fin doit être après la date de début." });
    }

    const idsProduitsDemandes = produits.map(p => p._id);

    // 🔍 Vérification des conflits avec les réservations existantes (en attente, validées ou en cours)
    const conflit = await Reservation.findOne({
      statut: { $in: ["en_attente", "validee", "en_cours"] },
      "produits._id": { $in: idsProduitsDemandes },
      $and: [
        { dateDebut: { $lt: fin } },
        { dateFin: { $gt: debut } }
      ]
    });

    if (conflit) {
      return res.status(400).json({ error: "Conflit : Matériel déjà réservé ou en attente sur cette période." });
    }

    // 📝 Création et enregistrement de la nouvelle réservation
    const nouvelleReservation = new Reservation({
      // Auto-incrémentation simple de l'ID ou gestion Mongoose (ici on prend un timestamp ou ID unique)
      _id: Date.now(), 
      user_id: req.user.userId, // Récupéré depuis le middleware JWT
      dateDebut: debut,
      dateFin: fin,
      produits,
      statut: 'en_attente'
    });

    await nouvelleReservation.save();

    res.status(201).json({ 
      message: "Réservation enregistrée avec succès !", 
      reservation: nouvelleReservation 
    });

  } catch (err) {
    console.error("❌ Erreur lors de la création de la réservation :", err);
    res.status(500).json({ error: "Erreur serveur lors de la réservation." });
  }
});

module.exports = router;