import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { supabase } from '../index.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { logAuditEvent, getReqMeta } from '../utils/audit.js';

function generatePassword(length = 12) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  const bytes = crypto.randomBytes(length);
  return Array.from(bytes, b => chars[b % chars.length]).join('');
}

function generatePasscode(length = 6) {
  const chars = '0123456789';
  const bytes = crypto.randomBytes(length);
  return Array.from(bytes, b => chars[b % chars.length]).join('');
}

const router = Router();
router.use(authenticateToken);
router.use(requireRole(['admin']));

router.get('/stats', async (req, res) => {
  try {
    const { count: patientCount } = await supabase.from('patients').select('*', { count: 'exact', head: true });
    const { count: sessionCount } = await supabase.from('sessions').select('*', { count: 'exact', head: true });
    const { data: conditionData } = await supabase.from('sessions').select('prediction');

    const predictions = (conditionData || []).reduce((acc, curr) => {
      const pred = curr.prediction || 'Unknown';
      acc[pred] = (acc[pred] || 0) + 1;
      return acc;
    }, {});

    res.json({
      totalPatients: patientCount,
      totalSessions: sessionCount,
      conditionsBreakdown: predictions
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve stats' });
  }
});

router.get('/patients', async (req, res) => {
  try {
    const { search, page, pageSize } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const size = Math.min(200, Math.max(1, parseInt(pageSize) || 50));
    const offset = (pageNum - 1) * size;

    let query = supabase
      .from('patients')
      .select('id, name, age, weight_kg, bp_systolic, bp_diastolic, comorbidities, created_at, role', { count: 'exact' });

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data, error, count } = await query
      .order('name', { ascending: true })
      .range(offset, offset + size - 1);

    if (error) throw error;
    res.json({ data: data || [], total: count, page: pageNum, pageSize: size });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

router.get('/patients/:id/sessions', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('id, started_at, duration_s, prediction, confidence, csv_url, report_url')
      .eq('patient_id', req.params.id)
      .order('started_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

router.put('/patients/:id', async (req, res) => {
  try {
    const { age, weight_kg, bp_systolic, bp_diastolic, comorbidities } = req.body;
    const updates = {};
    const now = new Date().toISOString();

    if (age !== undefined) updates.age = age;
    if (weight_kg !== undefined) updates.weight_kg = weight_kg;
    if (bp_systolic !== undefined) updates.bp_systolic = bp_systolic;
    if (bp_diastolic !== undefined) updates.bp_diastolic = bp_diastolic;
    if (comorbidities !== undefined) updates.comorbidities = comorbidities.trim();

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.updated_at = now;

    const { data, error } = await supabase
      .from('patients')
      .update(updates)
      .eq('id', req.params.id)
      .select('id, name, age, weight_kg, bp_systolic, bp_diastolic, comorbidities, created_at, role')
      .single();

    if (error) throw error;

    const meta = getReqMeta(req);
    logAuditEvent({
      eventType: 'patient_updated',
      ...meta,
      patientId: parseInt(req.params.id),
      details: `Admin updated patient '${data.name}' (id: ${data.id}) fields: ${Object.keys(updates).join(', ')}`,
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update patient' });
  }
});

router.post('/patients', async (req, res) => {
  try {
    const { name, age, weight_kg, bp_systolic, bp_diastolic, comorbidities } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Patient name is required' });
    }

    const { data: existing } = await supabase
      .from('patients')
      .select('id')
      .eq('name', name.trim());

    if (existing && existing.length > 0) {
      return res.status(409).json({ error: 'A patient with this name already exists' });
    }

    const rawPassword = generatePassword();
    const rawPasscode = generatePasscode();
    const passwordHash = bcrypt.hashSync(rawPassword, 12);
    const passcodeHash = bcrypt.hashSync(rawPasscode, 12);
    const now = new Date().toISOString();

    const { data: maxRow } = await supabase
      .from('patients')
      .select('id')
      .order('id', { ascending: false })
      .limit(1);

    const nextId = (maxRow && maxRow.length > 0 ? maxRow[0].id : 0) + 1;

    const { data, error } = await supabase
      .from('patients')
      .insert({
        id: nextId,
        name: name.trim(),
        age: age || 0,
        weight_kg: weight_kg || 0,
        bp_systolic: bp_systolic || 120,
        bp_diastolic: bp_diastolic || 80,
        comorbidities: comorbidities || '',
        password_hash: passwordHash,
        passcode_hash: passcodeHash,
        role: 'patient',
        created_at: now,
        updated_at: now,
      })
      .select('id, name, age, weight_kg, bp_systolic, bp_diastolic, comorbidities, created_at, role')
      .single();

    if (error) throw error;

    const meta = getReqMeta(req);
    logAuditEvent({
      eventType: 'patient_created',
      ...meta,
      patientId: data.id,
      details: `Admin created patient '${data.name}' (id: ${data.id})`,
    });

    res.status(201).json({ ...data, _credentials: { password: rawPassword, passcode: rawPasscode } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create patient' });
  }
});

router.delete('/patients/:id', async (req, res) => {
  try {
    const { data: sessionIds } = await supabase
      .from('sessions')
      .select('id')
      .eq('patient_id', req.params.id);

    if (sessionIds && sessionIds.length > 0) {
      const ids = sessionIds.map(s => s.id);
      await supabase.from('feedback').delete().in('session_id', ids);
      await supabase.from('sessions').delete().in('id', ids);
    }

    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    const meta = getReqMeta(req);
    logAuditEvent({
      eventType: 'patient_deleted',
      ...meta,
      patientId: parseInt(req.params.id),
      details: `Admin deleted patient (id: ${req.params.id}) with ${sessionIds?.length || 0} sessions`,
    });

    res.json({ message: 'Patient deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete patient' });
  }
});

router.post('/sessions/:id/verify', async (req, res) => {
  try {
    const { validatedPrediction, notes } = req.body;

    const { error: sessErr } = await supabase
      .from('sessions')
      .update({ prediction: validatedPrediction, updated_at: new Date().toISOString() })
      .eq('id', req.params.id);

    if (sessErr) throw sessErr;

    const { error: feedbackErr } = await supabase
      .from('feedback')
      .insert({
        session_id: req.params.id,
        notes: notes,
        reviewed_by: req.user.name,
        created_at: new Date().toISOString()
      });

    if (feedbackErr) throw feedbackErr;

    const meta = getReqMeta(req);
    logAuditEvent({
      eventType: 'session_verified',
      ...meta,
      details: `Admin verified session ${req.params.id}: prediction set to '${validatedPrediction}'`,
    });

    res.json({ message: 'Session verified successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

router.get('/logs', async (req, res) => {
  try {
    const { search, page, pageSize, eventType } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const size = Math.min(200, Math.max(1, parseInt(pageSize) || 50));
    const offset = (pageNum - 1) * size;

    let query = supabase
      .from('audit_logs')
      .select('id, event_type, ip_address, http_method, request_url, user_agent, created_at, patient_id, details, patients(name)', { count: 'exact' });

    if (search) {
      query = query.or(`ip_address.ilike.%${search}%,patients.name.ilike.%${search}%,request_url.ilike.%${search}%,details.ilike.%${search}%`);
    }

    if (eventType) {
      query = query.eq('event_type', eventType);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + size - 1);

    if (error) throw error;
    res.json({ data: data || [], total: count, page: pageNum, pageSize: size });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve logs' });
  }
});

router.delete('/logs', async (req, res) => {
  try {
    const { error } = await supabase
      .from('audit_logs')
      .delete()
      .neq('id', 0);

    if (error) throw error;

    const meta = getReqMeta(req);
    logAuditEvent({
      eventType: 'logs_cleared',
      ...meta,
      details: 'All audit logs cleared by admin',
    });

    res.json({ message: 'All audit logs cleared' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear logs' });
  }
});

router.get('/logs/export', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('id, event_type, ip_address, http_method, request_url, user_agent, created_at, patient_id, details, patients(name)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const header = 'ID,Timestamp,Event Type,IP Address,Method,URL,Details,User Agent,Patient Name\n';
    const rows = (data || []).map(row => {
      const ts = row.created_at ? new Date(row.created_at).toISOString() : '';
      const ua = (row.user_agent || '').replace(/"/g, '""');
      const name = (row.patients?.name || 'Anonymous').replace(/"/g, '""');
      const det = (row.details || '').replace(/"/g, '""');
      return `${row.id},"${ts}","${row.event_type || 'api_request'}","${row.ip_address || ''}","${row.http_method || ''}","${row.request_url || ''}","${det}","${ua}","${name}"`;
    }).join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${Date.now()}.csv"`);
    res.send(header + rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to export logs' });
  }
});

export default router;
