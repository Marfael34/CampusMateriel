const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'campus_secret_key_2026';

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer TOKEN

  if (!token) {
    return res.status(403).json({ error: "Accès refusé. Token manquant." });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({ error: "Token invalide ou expiré." });
    }
    req.user = user; // Injecte les infos décodées dans la requête
    next();
  });
}

module.exports = verifyToken;