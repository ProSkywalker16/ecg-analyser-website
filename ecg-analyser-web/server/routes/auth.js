import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { supabase } from '../index.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';
import { logAuditEvent, getReqMeta } from '../utils/audit.js';

const ALLOWED_COLS = 'id, name, age, weight_kg, bp_systolic, bp_diastolic, comorbidities, role, created_at, updated_at';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]).{8,}$/;

const router = Router();

function sanitizeAuthError(err) {
  if (process.env.NODE_ENV === 'production') {
    return 'Authentication service error';
  }
  return err.message || 'Authentication service error';
}

router.post('/login', async (req, res) => {
  try {
    const { name, password, passcode } = req.body;
    if (!name || !password || !passcode) {
      return res.status(400).json({ error: 'Name, password, and passcode are required' });
    }

    const { data: hashData, error: hashError } = await supabase
      .rpc('get_user_hashes', { p_name: name.trim() });

    if (hashError) {
      console.error('[LOGIN] get_user_hashes RPC error:', hashError);
      return res.status(500).json({ error: sanitizeAuthError(hashError) });
    }
    if (!hashData || hashData.length === 0) {
      const meta = getReqMeta(req);
      logAuditEvent({ eventType: 'login_failed', details: `No user found: ${name}`, ip: meta.ip, userAgent: meta.userAgent, method: meta.method, url: meta.url });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { r_password_hash: storedPwHash, r_passcode_hash: storedPcHash, r_role: userRole } = hashData[0];
    if (!storedPwHash || !storedPcHash) {
      const meta = getReqMeta(req);
      logAuditEvent({ eventType: 'login_failed', details: `Missing hashes for: ${name}`, ip: meta.ip, userAgent: meta.userAgent, method: meta.method, url: meta.url });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const pwOk = bcrypt.compareSync(password, storedPwHash);
    const pcOk = bcrypt.compareSync(passcode, storedPcHash);
    if (!pwOk || !pcOk) {
      await new Promise(r => setTimeout(r, 500 + Math.random() * 500));
      const meta = getReqMeta(req);
      logAuditEvent({ eventType: 'login_failed', details: `Wrong password/passcode for: ${name}`, ip: meta.ip, userAgent: meta.userAgent, method: meta.method, url: meta.url });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { data: users, error: userError } = await supabase
      .from('patients')
      .select(ALLOWED_COLS)
      .eq('name', name.trim());

    if (userError) {
      console.error('[LOGIN-DEBUG] Profile fetch error:', userError);
      return res.status(500).json({ error: 'Authentication service error' });
    }
    if (!users || users.length === 0) {
      const meta = getReqMeta(req);
      logAuditEvent({ eventType: 'login_failed', details: `Profile fetch empty for: ${name}`, ip: meta.ip, userAgent: meta.userAgent, method: meta.method, url: meta.url });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    const token = generateToken({ id: user.id, name: user.name, role: user.role || 'patient' });

    const meta = getReqMeta(req);
    logAuditEvent({ eventType: 'login_success', patientId: user.id, details: user.name, ip: meta.ip, userAgent: meta.userAgent, method: meta.method, url: meta.url });

    res.json({ token, user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Authentication service error' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { name, password, passcode } = req.body;
    if (!name || !password || !passcode) {
      return res.status(400).json({ error: 'Name, password, and passcode are required' });
    }
    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters with uppercase, lowercase, digit, and special character',
      });
    }

    const { data: existing } = await supabase
      .from('patients')
      .select('id')
      .eq('name', name.trim());

    if (existing && existing.length > 0) {
      return res.status(409).json({ error: 'A user with this name already exists' });
    }

    const passwordHash = bcrypt.hashSync(password, 12);
    const passcodeHash = bcrypt.hashSync(passcode, 12);
    const now = new Date().toISOString();

    const { data: maxRow } = await supabase
      .from('patients')
      .select('id')
      .order('id', { ascending: false })
      .limit(1);

    const nextId = (maxRow && maxRow.length > 0 ? maxRow[0].id : 0) + 1;

    const { data: newUser, error } = await supabase
      .from('patients')
      .insert({
        id: nextId,
        name: name.trim(),
        age: 0,
        weight_kg: 0,
        bp_systolic: 120,
        bp_diastolic: 80,
        comorbidities: '',
        password_hash: passwordHash,
        passcode_hash: passcodeHash,
        role: 'patient',
        created_at: now,
        updated_at: now,
      })
      .select(ALLOWED_COLS)
      .single();

    if (error) {
      console.error('[REGISTER] Insert error:', error);
      return res.status(500).json({ error: 'Registration failed' });
    }

    const token = generateToken({ id: newUser.id, name: newUser.name, role: newUser.role || 'patient' });

    const meta = getReqMeta(req);
    logAuditEvent({ eventType: 'register', patientId: newUser.id, details: newUser.name, ip: meta.ip, userAgent: meta.userAgent, method: meta.method, url: meta.url });

    res.status(201).json({ token, user: newUser });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/logout', authenticateToken, (req, res) => {
  const meta = getReqMeta(req);
  logAuditEvent({ eventType: 'logout', patientId: req.user.id, details: req.user.name, ip: meta.ip, userAgent: meta.userAgent, method: meta.method, url: meta.url });
  res.json({ message: 'Logged out' });
});

export default router;
