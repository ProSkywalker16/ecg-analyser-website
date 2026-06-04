import jwt from 'jsonwebtoken';

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('[FATAL] JWT_SECRET environment variable is not set.');
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return secret;
}

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, getJwtSecret(), (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

export function generateToken(payload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '24h' });
}
