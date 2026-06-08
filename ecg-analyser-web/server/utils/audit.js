import { supabase } from '../index.js';

function isPrivateIP(ip) {
  if (!ip) return true;
  const s = ip.replace('::ffff:', '');
  const parts = s.split('.').map(Number);
  if (parts.length !== 4) return false;
  if (parts[0] === 10) return true;
  if (parts[0] === 127) return true;
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  if (parts[0] === 192 && parts[1] === 168) return true;
  if (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) return true; // CGNAT
  return false;
}

export async function logAuditEvent({ eventType, patientId, details, ip, userAgent, method, url }) {
  try {
    await supabase.from('audit_logs').insert({
      event_type: eventType,
      ip_address: ip || 'unknown',
      http_method: method || 'NONE',
      request_url: url || 'unknown',
      user_agent: userAgent || null,
      patient_id: patientId || null,
      details: details || null,
    });
  } catch (err) {
    console.error('[AUDIT-ERR]', err.message, err.code || '');
  }
}

export function resolveClientIp(req) {
  let ip = req.ip;

  if (!ip || isPrivateIP(ip)) {
    const cf = req.headers['cf-connecting-ip'];
    if (cf) {
      ip = cf;
    } else {
      const forwarded = req.headers['x-forwarded-for'];
      if (forwarded) {
        ip = forwarded.split(',')[0].trim();
      }
    }
  }

  if (!ip || ip === req.socket?.remoteAddress) {
    ip = req.socket?.remoteAddress;
  }

  if (typeof ip === 'string' && ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }

  return ip || 'unknown';
}

export function getReqMeta(req) {
  return {
    ip: resolveClientIp(req),
    userAgent: req.headers['user-agent'],
    method: req.method,
    url: req.originalUrl,
  };
}
