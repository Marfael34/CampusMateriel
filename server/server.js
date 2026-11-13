const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'cle_secrete_campus_materiel';

// Connexion MongoDB
mongoose.connect('mongodb://localhost:27017/campus_materiel')
  .then(() => console.log("Connexion MongoDB réussie"))
  .catch(err => console.error("Erreur de connexion MongoDB :", err));

// --- SCHÉMAS ET MODÈLES PROPRES ---

const userSchema = new mongoose.Schema({
  _id: Number,
  nom: String,
  prenom: String,
  email: { type: String, unique: true },
  password: String,
  tel: String,
  role: { type: [String], default: ['user'] }
}, { versionKey: false });
const User = mongoose.model('User', userSchema);

const produitSchema = new mongoose.Schema({
  _id: Number,
  nom: String,
  description: String,
  quantiteTotale: Number,
  disponibilite: Boolean
}, { versionKey: false });
const Produit = mongoose.model('Produit', produitSchema);

// Sous-schéma strict pour éviter que Mongoose n'injecte des ObjectIds dans le tableau
const produitResaSchema = new mongoose.Schema({
  _id: Number,
  nom: String,
  quantite: Number
}, { _id: false, versionKey: false });

const reservationSchema = new mongoose.Schema({
  _id: Number,
  user_id: Number,
  dateDebut: Date,
  dateFin: Date,
  produits: [produitResaSchema],
  statut: { type: String, default: 'en_attente' }
}, { versionKey: false });
const Reservation = mongoose.model('Reservation', reservationSchema);

const panierSchema = new mongoose.Schema({
  user_id: Number,
  produits: [produitResaSchema]
}, { versionKey: false });
const Panier = mongoose.model('Panier', panierSchema);

// --- MIDDLEWARES D'AUTHENTIFICATION ---

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: "Token d'authentification manquant." });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Token invalide ou expiré." });
    req.user = user;
    next();
  });
};

const verifyAdmin = async (req, res, next) => {
  try {
    const userId = Number(req.user.id || req.user._id);
    const dbUser = await User.findOne({ _id: userId });
    
    if (!dbUser || !dbUser.role || !dbUser.role.includes('admin')) {
      return res.status(403).json({ error: "Accès refusé. Réservé aux administrateurs." });
    }
    req.adminUser = dbUser;
    next();
  } catch (err) {
    console.error("Erreur verifyAdmin :", err);
    res.status(500).json({ error: "Erreur serveur lors de la vérification du rôle administrateur." });
  }
};

// --- ROUTES AUTHENTIFICATION ---

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Email ou mot de passe incorrect." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Email ou mot de passe incorrect." });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { _id: user._id, nom: user.nom, prenom: user.prenom, email: user.email, role: user.role } });
  } catch (err) {
    console.error("Erreur login :", err);
    res.status(500).json({ error: "Erreur serveur lors de la connexion." });
  }
});

// --- ROUTES PRODUITS ---

app.get('/api/produits/disponibles', verifyToken, async (req, res) => {
  try {
    const { dateDebut, dateFin } = req.query;
    const produits = await Produit.find();

    let reservations = [];
    if (dateDebut && dateFin) {
      const start = new Date(dateDebut);
      const end = new Date(dateFin);

      reservations = await Reservation.find({
        statut: { $in: ['validee', 'en_cours', 'en_attente'] },
        dateDebut: { $lt: end },
        dateFin: { $gt: start }
      });
    }

    const quantitesReservees = {};
    reservations.forEach(resa => {
      if (resa.produits && Array.isArray(resa.produits)) {
        resa.produits.forEach(item => {
          if (item && item._id != null) {
            const pId = item._id.toString();
            quantitesReservees[pId] = (quantitesReservees[pId] || 0) + (Number(item.quantite) || 0);
          }
        });
      }
    });

    const produitsDispos = produits.map(p => {
      const pId = p._id != null ? p._id.toString() : '';
      const reserve = quantitesReservees[pId] || 0;
      const quantiteDisponible = Math.max(0, (p.quantiteTotale || 0) - reserve);
      const dispoFinale = (p.disponibilite === true) && (quantiteDisponible > 0);

      return {
        _id: p._id,
        nom: p.nom || 'Produit sans nom',
        description: p.description || '',
        quantiteTotale: p.quantiteTotale || 0,
        quantiteDisponible: quantiteDisponible,
        disponibilite: dispoFinale
      };
    });

    res.json(produitsDispos);
  } catch (err) {
    console.error("Erreur récupération produits :", err);
    res.status(500).json({ error: "Erreur récupération produits." });
  }
});

// --- ROUTES PANIER ---

app.get('/api/panier', verifyToken, async (req, res) => {
  try {
    const userId = Number(req.user.id || req.user._id);
    let panier = await Panier.findOne({ user_id: userId });
    if (!panier) panier = { produits: [] };
    res.json(panier);
  } catch (err) {
    res.status(500).json({ error: "Erreur récupération panier." });
  }
});

app.post('/api/panier', verifyToken, async (req, res) => {
  try {
    const { produits } = req.body;
    const userId = Number(req.user.id || req.user._id);
    
    const formattedProduits = (produits || []).map(p => ({
      _id: parseInt(p._id),
      nom: String(p.nom).substring(0, 100),
      quantite: parseInt(p.quantite) || 1
    }));

    let panier = await Panier.findOne({ user_id: userId });
    if (panier) {
      panier.produits = formattedProduits;
      await panier.save();
    } else {
      panier = new Panier({ user_id: userId, produits: formattedProduits });
      await panier.save();
    }
    res.json(panier);
  } catch (err) {
    res.status(500).json({ error: "Erreur mise à jour panier." });
  }
});

app.delete('/api/panier', verifyToken, async (req, res) => {
  try {
    const userId = Number(req.user.id || req.user._id);
    await Panier.findOneAndUpdate({ user_id: userId }, { produits: [] });
    res.json({ message: "Panier vidé." });
  } catch (err) {
    res.status(500).json({ error: "Erreur suppression panier." });
  }
});

// --- ROUTES RÉSERVATIONS UTILISATEUR ---

app.get('/api/reservations', verifyToken, async (req, res) => {
  try {
    const userId = Number(req.user.id || req.user._id);
    const reservations = await Reservation.find({ user_id: userId }).sort({ dateDebut: -1 });
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ error: "Erreur récupération réservations." });
  }
});

app.post('/api/reservations', verifyToken, async (req, res) => {
  try {
    const { dateDebut, dateFin, produits } = req.body;
    const userId = parseInt(req.user.id || req.user._id);

    // 1. Validation stricte de la date ($expr: { $gt: ['$dateFin', '$dateDebut'] })
    const dDebut = new Date(dateDebut);
    const dFin = new Date(dateFin);
    if (dFin <= dDebut) {
      return res.status(400).json({ error: "La date de fin doit être strictement supérieure à la date de début." });
    }

    // 2. Formatage strict des produits pour respecter 'additionalProperties: false' et types 'int'
    const formattedProduits = (produits || []).map(p => ({
      _id: parseInt(p._id),
      nom: String(p.nom).trim().padEnd(2, ' ').substring(0, 100), // Assure minLength: 2 et maxLength: 100
      quantite: parseInt(p.quantite) || 1
    }));

    if (formattedProduits.length === 0) {
      return res.status(400).json({ error: "Le panier est vide." });
    }

    // 3. Auto-incrément manuel pour garantir un _id 'int'
    const lastResa = await Reservation.findOne().sort({ _id: -1 }).lean();
    const newId = (lastResa && lastResa._id) ? parseInt(lastResa._id) + 1 : 1;

    // 4. L'objet Parfait (sans __v, sans sous-ObjectIds, exactement ce que veut ta BDD)
    const rawReservation = {
      _id: newId,
      dateDebut: dDebut,
      dateFin: dFin,
      statut: 'en_attente',
      user_id: userId,
      produits: formattedProduits
    };

    // 5. INSERTION DIRECTE (Bypass de la validation magique de Mongoose)
    await mongoose.connection.collection('reservations').insertOne(rawReservation);

    res.status(201).json(rawReservation);
  } catch (err) {
    console.error("Erreur création réservation :", err);
    res.status(500).json({ error: "Erreur création réservation: " + err.message });
  }
});

// --- ROUTES ADMINISTRATEUR ---

app.get('/api/admin/reservations', verifyToken, verifyAdmin, async (req, res) => {
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

    res.json(reservationsAvecUser);
  } catch (err) {
    console.error("Erreur admin reservations :", err);
    res.status(500).json({ error: "Erreur lors de la récupération des réservations administrateur." });
  }
});

app.put('/api/admin/reservations/:id/statut', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { statut } = req.body;
    const rawId = parseInt(req.params.id);

    if (isNaN(rawId)) return res.status(400).json({ error: "Identifiant invalide." });

    const resa = await Reservation.findOneAndUpdate(
      { _id: rawId },
      { statut },
      { new: true } // Ne pose pas de souci de validation car c'est un $set ciblé sur 'statut'
    );

    if (!resa) return res.status(404).json({ error: "Réservation introuvable." });
    res.json({ message: "Statut mis à jour avec succès", resa });
  } catch (err) {
    console.error("Erreur update statut :", err);
    res.status(500).json({ error: "Erreur lors de la mise à jour du statut." });
  }
});

// --- LANCEMENT DU SERVEUR ---

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});