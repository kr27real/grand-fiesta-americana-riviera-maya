const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'gfa_secret_key_ultra_luxury_2026';

function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'Acceso denegado: Token no proporcionado.' });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

  try {
    const decodificado = jwt.verify(token, JWT_SECRET);
    req.usuario = decodificado;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token inválido o expirado. Inicia sesión nuevamente.' });
  }
}

module.exports = { verificarToken, JWT_SECRET };