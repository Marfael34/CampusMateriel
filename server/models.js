const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  _id: Number,
  nom: String,
  prenom: String,
  email: String,
  password: String,
  role: String
}, { versionKey: false });

const produitSchema = new mongoose.Schema({
  _id: Number,
  nom: String,
  description: String,
  quantiteTotale: Number,
  disponibilite: Boolean
}, { versionKey: false });

const reservationSchema = new mongoose.Schema({
  _id: Number,
  dateDebut: Date,
  dateFin: Date,
  statut: String,
  user_id: Number,
  produits: [{
    _id: Number,
    nom: String,
    quantite: Number
  }]
}, { versionKey: false });

const panierSchema = new mongoose.Schema({
  _id: Number,
  user_id: Number,
  produits: [{
    _id: Number,
    nom: String,
    quantite: Number
  }]
}, { versionKey: false });

// Déclaration stricte pour forcer le lien avec la base existante
const User = mongoose.models.User || mongoose.model('User', userSchema, 'users');
const Produit = mongoose.models.Produit || mongoose.model('Produit', produitSchema, 'produits');
const Reservation = mongoose.models.Reservation || mongoose.model('Reservation', reservationSchema, 'reservations');
const Panier = mongoose.models.Panier || mongoose.model('Panier', panierSchema, 'paniers');

module.exports = { User, Produit, Reservation, Panier };