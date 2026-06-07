import jwt from 'jsonwebtoken';
import { logAuditEvent, getReqMeta } from '../utils/audit.js';

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

export function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      const meta = getReqMeta(req);
      logAuditEvent({
        eventType: 'admin_access_denied',
        ...meta,
        patientId: req.user?.id,
        details: `User '${req.user?.name || 'unknown'}' (role: ${req.user?.role || 'none'}) denied access to ${meta.method} ${meta.url}`,
      });
      return res.status(403).json({ error: 'Access denied: Insufficient permissions' });
    }
    next();
  };
}
