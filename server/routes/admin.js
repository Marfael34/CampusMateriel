const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Reservation = require('../models/Reservation');

// Middleware de vérification du rôle administrateur
const verifyAdmin = async (req, res, next) => {
  try {
    const dbUser = await User.findById(req.user.id || req.user._id);
    if (!dbUser || !dbUser.role || !dbUser.role.includes('admin')) {
      return res.status(403).json({ error: "Accès refusé. Réservé aux administrateurs." });
    }
    req.adminUser = dbUser;
    next();
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur lors de la vérification du rôle administrateur." });
  }
};

// 1. Récupérer toutes les réservations avec les informations des utilisateurs associés
router.get('/reservations', verifyAdmin, async (resquest, response) => {
  try {
    const reservations = await Reservation.find().sort({ dateDebut: -1 });
    const users = await User.find();
    const userMap = {};
    users.forEach(u => { userMap[u._id.toString()] = u; });

    const reservationsAvecUser = reservations.map(resa => {
      const resaObj = resa.toObject();
      resaObj.user = userMap[resa.user_id?.toString()] || { nom: 'Inconnu', prenom: '', email: '' };
      return resaObj;
    });

    response.json(reservationsAvecUser);
  } catch (err) {
    response.status(500).json({ error: "Erreur lors de la récupération des réservations administrateur." });
  }
});

// 2. Modifier le statut d'une réservation (valider, refuser, terminer)
router.put('/reservations/:id/statut', verifyAdmin, async (resquest, response) => {
  try {
    const { statut } = resquest.body;
    const resa = await Reservation.findOneAndUpdate(
      { _id: resquest.params.id },
      { statut },
      { new: true }
    );
    if (!resa) return response.status(404).json({ error: "Réservation introuvable." });
    response.json({ message: "Statut mis à jour avec succès", resa });
  } catch (err) {
    response.status(500).json({ error: "Erreur lors de la mise à jour du statut." });
  }
});

module.exports = router;