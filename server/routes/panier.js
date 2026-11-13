const express = require('express');
const router = express.Router();
const { Panier } = require('../models');
const verifyToken = require('../middleware/auth');

// GET : Récupérer le panier de l'utilisateur connecté
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = Number(req.user.userId || req.user.id || req.user._id);
    let panier = await Panier.findOne({ user_id: userId });
    
    if (!panier) {
      return res.json({ user_id: userId, produits: [] });
    }
    
    res.json(panier);
  } catch (err) {
    console.error("❌ Erreur récupération panier :", err);
    res.status(500).json({ error: "Erreur serveur lors de la récupération du panier." });
  }
});

// POST : Sauvegarder ou mettre à jour le panier complet
router.post('/', verifyToken, async (req, res) => {
  try {
    const userId = Number(req.user.userId || req.user.id || req.user._id);
    const { produits } = req.body;

    let panier = await Panier.findOne({ user_id: userId });

    if (panier) {
      panier.produits = produits || [];
      await panier.save();
    } else {
      const dernierPanier = await Panier.findOne().sort({ _id: -1 });
      const nouveauId = dernierPanier && typeof dernierPanier._id === 'number' ? dernierPanier._id + 1 : 1;

      panier = new Panier({
        _id: nouveauId,
        user_id: userId,
        produits: produits || []
      });
      await panier.save();
    }

    res.json({ message: "Panier synchronisé avec succès", panier });
  } catch (err) {
    console.error("❌ Erreur sauvegarde panier :", err);
    res.status(500).json({ error: "Erreur serveur lors de la sauvegarde du panier : " + err.message });
  }
});

// DELETE : Vider le panier
router.delete('/', verifyToken, async (req, res) => {
  try {
    const userId = Number(req.user.userId || req.user.id || req.user._id);
    await Panier.findOneAndDelete({ user_id: userId });
    res.json({ message: "Panier vidé avec succès." });
  } catch (err) {
    console.error("❌ Erreur suppression panier :", err);
    res.status(500).json({ error: "Erreur serveur lors du nettoyage du panier." });
  }
});

module.exports = router;