import { supabase } from '../index.js';

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

export function getReqMeta(req) {
  return {
    ip: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
    userAgent: req.headers['user-agent'],
    method: req.method,
    url: req.originalUrl,
  };
}
