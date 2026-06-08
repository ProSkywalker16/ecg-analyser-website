import { supabase } from '../index.js';
import { resolveClientIp } from '../utils/audit.js';

let blockedSet = null;
let lastFetch = 0;
const CACHE_TTL = 60000;

async function ensureCache() {
  if (blockedSet && Date.now() - lastFetch < CACHE_TTL) return;
  try {
    const { data } = await supabase.from('blocked_ips').select('ip_address');
    blockedSet = new Set((data || []).map(r => r.ip_address));
    lastFetch = Date.now();
  } catch (err) {
    console.error('[IP-BLOCK] Cache refresh error:', err.message);
  }
}

export function addToBlockCache(ip) {
  if (!blockedSet) blockedSet = new Set();
  blockedSet.add(ip);
  lastFetch = Date.now();
}

export function removeFromBlockCache(ip) {
  if (blockedSet) blockedSet.delete(ip);
  lastFetch = Date.now();
}

export async function blockIpMiddleware(req, res, next) {
  const ip = resolveClientIp(req);

  if (!ip || ip === 'unknown') {
    return next();
  }

  await ensureCache();

  if (blockedSet && blockedSet.has(ip)) {
    return res.status(403).json({ error: 'User has been blocked by admin, contact admin.' });
  }

  next();
}
