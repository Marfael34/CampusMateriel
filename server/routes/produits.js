const express = require('express');
const router = express.Router();
const { Produit, Reservation } = require('../models');
const verifyToken = require('../middleware/auth');

// Route pour récupérer les produits et leur stock disponible sur une période donnée
router.get('/disponibles', verifyToken, async (req, res) => {
  try {
    const { dateDebut, dateFin } = req.query;

    if (!dateDebut || !dateFin) {
      const produits = await Produit.find();
      return res.json(produits.map(p => ({ ...p.toObject(), quantiteDisponible: p.quantiteTotale })));
    }

    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);

    if (fin <= debut) {
      return res.status(400).json({ error: "La date de fin doit être après la date de début." });
    }

    // Récupérer les réservations en conflit (en_attente, validee, en_cours)
    const reservationsConflit = await Reservation.find({
      statut: { $in: ["en_attente", "validee", "en_cours"] },
      $and: [
        { dateDebut: { $lt: fin } },
        { dateFin: { $gt: debut } }
      ]
    });

    // Calculer les quantités réservées par produit sur cette période
    const quantitesReserveesMap = {};
    reservationsConflit.forEach(resa => {
      resa.produits.forEach(p => {
        quantitesReserveesMap[p._id] = (quantitesReserveesMap[p._id] || 0) + p.quantite;
      });
    });

    // Calculer le stock disponible réel en tenant compte de la base de données
    const produits = await Produit.find();
    const produitsAvecDispo = produits.map(prod => {
      const qteReservee = quantitesReserveesMap[prod._id] || 0;
      
      // Si le produit est désactivé en base (disponibilite: false), son stock dispo tombe à 0
      const quantiteDisponible = prod.disponibilite ? Math.max(0, prod.quantiteTotale - qteReservee) : 0;

      return {
        ...prod.toObject(),
        quantiteDisponible,
        // Le produit est dispo SEULEMENT s'il est actif en base ET qu'il reste du stock
        disponible: prod.disponibilite && quantiteDisponible > 0
      };
    });

    res.json(produitsAvecDispo);
  } catch (err) {
    console.error("❌ Erreur calcul disponibilités :", err);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// Route générale de secours
router.get('/', verifyToken, async (req, res) => {
  try {
    const produits = await Produit.find();
    res.json(produits);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur." });
  }
});

module.exports = router;