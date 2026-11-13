const express = require('express');
const router = express.Router();
const { Reservation } = require('../models');
const verifyToken = require('../middleware/auth'); // Import du middleware de sécurité JWT

// La route est maintenant protégée par verifyToken
router.post('/', verifyToken, async (req, res) => {
  try {
    // Le user_id est récupéré directement et de façon sécurisée du JWT décodé
    const user_id = req.user.id; 
    const { dateDebut, dateFin, produits } = req.body;
    
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);

    if (fin <= debut) {
      return res.status(400).json({ error: "La date de fin doit être après la date de début." });
    }

    const idsProduitsDemandes = produits.map(p => p._id);

    // Vérification des chevauchements dans les réservations validées/en cours
    const conflit = await Reservation.findOne({
      statut: { $in: ["validee", "en_cours"] },
      "produits._id": { $in: idsProduitsDemandes },
      $and: [
        { dateDebut: { $lt: fin } },
        { dateFin: { $gt: debut } }
      ]
    });

    if (conflit) {
      return res.status(400).json({ error: "Conflit : Matériel déjà réservé sur cette période." });
    }

    // Auto-incrémentation manuelle de l'ID (adapté pour tes _id en Number)
    const derniereResa = await Reservation.findOne().sort({ _id: -1 });
    const nouvelId = derniereResa ? derniereResa._id + 1 : 1;

    const nouvelleReservation = new Reservation({
      _id: nouvelId,
      dateDebut: debut,
      dateFin: fin,
      statut: "en_attente",
      user_id: Number(user_id), // Issu du token JWT
      produits: produits.map(p => ({
        _id: Number(p._id),
        nom: p.nom,
        quantite: Number(p.quantite)
      }))
    });

    await nouvelleReservation.save();
    res.status(201).json({ message: "Réservation créée !", reservation: nouvelleReservation });
  } catch (err) {
    console.error("❌ Erreur réservation :", err);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

module.exports = router;