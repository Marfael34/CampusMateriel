const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');

// Clé secrète JWT (à mettre dans .env)
const JWT_SECRET = process.env.JWT_SECRET || 'campus_secret_key_2026';

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Recherche de l'utilisateur par email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect." });
    }

    // Vérification du mot de passe (comparaison avec le hash en base)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect." });
    }

    // Génération du Token JWT (valide 24h)
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, nom: user.nom },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: "Connexion réussie",
      token,
      user: {
        _id: user._id,
        nom: user.nom,
        email: user.email,
        prenom: user.prenom,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Erreur login :", err);
    res.status(500).json({ error: "Erreur serveur lors de la connexion." });
  }
});

module.exports = router;