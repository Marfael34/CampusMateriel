const express = require('express');
const router = express.Router();
const { Reservation, Produit } = require('../models');
const verifyToken = require('../middleware/auth');

// Route GET : Récupérer toutes les réservations de l'utilisateur connecté
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = Number(req.user.userId || req.user.id || req.user._id);
    const reservations = await Reservation.find({ user_id: userId }).sort({ dateDebut: -1 });
    res.json(reservations);
  } catch (err) {
    console.error("❌ Erreur récupération des réservations :", err);
    res.status(500).json({ error: "Erreur serveur lors de la récupération des réservations." });
  }
});

// Route POST : Créer une réservation globale (Panier / Multi-produits)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { dateDebut, dateFin, produits } = req.body;

    if (!dateDebut || !dateFin || !produits || !Array.isArray(produits) || produits.length === 0) {
      return res.status(400).json({ error: "Votre panier est vide ou les dates sont incomplètes." });
    }

    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);

    if (fin <= debut) {
      return res.status(400).json({ error: "La date de fin doit être après la date de début." });
    }

    // 1. Récupérer toutes les réservations en conflit sur cette période
    const reservationsConflit = await Reservation.find({
      statut: { $in: ["en_attente", "validee", "en_cours"] },
      $and: [
        { dateDebut: { $lt: fin } },
        { dateFin: { $gt: debut } }
      ]
    });

    // 2. Calculer les quantités déjà réservées par produit sur cette période
    const quantitesReserveesMap = {};
    reservationsConflit.forEach(resa => {
      resa.produits.forEach(p => {
        const prodIdStr = p._id.toString();
        quantitesReserveesMap[prodIdStr] = (quantitesReserveesMap[prodIdStr] || 0) + p.quantite;
      });
    });

    // 3. Valider chaque produit du panier
    const produitsFinal = [];

    for (const item of produits) {
      const produitDb = await Produit.findOne({ _id: item._id });
      
      if (!produitDb || !produitDb.disponibilite) {
        return res.status(400).json({ 
          error: `Le produit "${item.nom || 'Inconnu'}" n'est plus disponible ou a été désactivé.` 
        });
      }

      const qteReservee = quantitesReserveesMap[item._id.toString()] || 0;
      const quantiteDisponible = Math.max(0, produitDb.quantiteTotale - qteReservee);

      if (item.quantite > quantiteDisponible) {
        return res.status(400).json({ 
          error: `Stock insuffisant pour "${produitDb.nom}". Demandé : ${item.quantite}, Disponible : ${quantiteDisponible} sur cette période.` 
        });
      }

      produitsFinal.push({
        _id: produitDb._id,
        nom: produitDb.nom,
        quantite: item.quantite
      });
    }

    // 4. Auto-incrément propre de l'_id basé sur les réservations existantes
    const derniereReservation = await Reservation.findOne().sort({ _id: -1 });
    const nouveauId = derniereReservation && typeof derniereReservation._id === 'number' ? derniereReservation._id + 1 : 1;

    const userIdParsed = Number(req.user.userId || req.user.id || req.user._id);

    // 5. Enregistrement de la réservation
    const nouvelleReservation = new Reservation({
      _id: nouveauId,
      user_id: isNaN(userIdParsed) ? 1 : userIdParsed,
      dateDebut: debut,
      dateFin: fin,
      produits: produitsFinal,
      statut: 'en_attente'
    });

    await nouvelleReservation.save();

    res.status(201).json({ 
      message: "Réservation du panier enregistrée avec succès !", 
      reservation: nouvelleReservation 
    });

  } catch (err) {
    console.error("❌ Erreur serveur lors de la création de la réservation :", err);
    res.status(500).json({ error: "Erreur serveur lors de la création de la réservation : " + err.message });
  }
});

module.exports = router;