import { supabase } from '../index.js';
import { resolveClientIp } from '../utils/audit.js';

export async function blockIpMiddleware(req, res, next) {
  const ip = resolveClientIp(req);

  if (!ip || ip === 'unknown') {
    return next();
  }

  try {
    const { data } = await supabase
      .from('blocked_ips')
      .select('id')
      .eq('ip_address', ip)
      .maybeSingle();

    if (data) {
      return res.status(403).json({ error: 'User has been blocked by admin, contact admin.' });
    }
  } catch (err) {
    console.error('[IP-BLOCK] Query error:', err.message);
  }

  next();
}
