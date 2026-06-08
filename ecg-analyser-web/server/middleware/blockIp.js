import { supabase } from '../index.js';

const cache = {
  blocked: new Set(),
  lastFetch: 0,
  ttl: 30000,
};

async function refreshCache() {
  try {
    const { data } = await supabase.from('blocked_ips').select('ip_address');
    cache.blocked = new Set((data || []).map(r => r.ip_address));
    cache.lastFetch = Date.now();
  } catch (err) {
    console.error('[IP-BLOCK] Cache refresh error:', err.message);
  }
}

export async function blockIpMiddleware(req, res, next) {
  if (Date.now() - cache.lastFetch > cache.ttl) {
    await refreshCache();
  }

  let ip = req.ip;
  if (typeof ip === 'string' && ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }

  if (ip && cache.blocked.has(ip)) {
    return res.status(403).json({ error: 'Your IP address has been blocked by the administrator.' });
  }

  next();
}
