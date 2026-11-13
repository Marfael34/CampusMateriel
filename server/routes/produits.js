const express = require('express');
const router = express.Router();
const { Produit } = require('../models');

router.get('/', async (req, res) => {
  try {
    const produits = await Produit.find({});
    res.status(200).json(produits);
  } catch (err) {
    console.error("❌ Erreur route produits :", err);
    res.status(500).json({ error: "Erreur serveur lors de la récupération des produits." });
  }
});

module.exports = router;