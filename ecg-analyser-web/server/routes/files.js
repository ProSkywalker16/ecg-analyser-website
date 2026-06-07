import { Router } from 'express';
import { supabase } from '../index.js';
import { authenticateToken } from '../middleware/auth.js';
import { processCsvSession } from '../utils/processCsv.js';

const router = Router();

router.use(authenticateToken);

router.get('/list', async (req, res) => {
  try {
    const { data: sessions, error } = await supabase
      .from('sessions')
      .select('id, started_at, duration_s, prediction, confidence, csv_url, report_url')
      .eq('patient_id', req.user.id)
      .order('started_at', { ascending: false });

    if (error) {
      if (error.code === '42501') return res.status(500).json({ error: 'Permission denied. See server/setup.sql or set SUPABASE_SERVICE_KEY.', hint: 'Run setup.sql in Supabase SQL Editor' });
      throw error;
    }

    const files = [];
    for (const session of sessions || []) {
      if (session.csv_url) {
        files.push({
          id: `csv-${session.id}`,
          sessionId: session.id,
          type: 'csv',
          name: session.csv_url.split('/').pop(),
          url: session.csv_url,
          startedAt: session.started_at,
          prediction: session.prediction,
          confidence: session.confidence,
        });
      }
      if (session.report_url) {
        files.push({
          id: `report-${session.id}`,
          sessionId: session.id,
          type: 'pdf',
          name: session.report_url.split('/').pop(),
          url: session.report_url,
          startedAt: session.started_at,
          prediction: session.prediction,
          confidence: session.confidence,
        });
      }
    }

    res.json(files);
  } catch (error) {
    console.error('List files error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/csv/:sessionId/processed', async (req, res) => {
  try {
    const { data: sessions, error: sessError } = await supabase
      .from('sessions')
      .select('id, csv_url, prediction, confidence, started_at')
      .eq('id', req.params.sessionId)
      .eq('patient_id', req.user.id);

    if (sessError) {
      console.error('[CSV] Session fetch error:', sessError);
      return res.status(500).json({ error: 'Failed to fetch session data' });
    }
    if (!sessions || sessions.length === 0) return res.status(404).json({ error: 'Session not found' });

    const data = await processCsvSession(supabase, req.params.sessionId);
    res.json(data);
  } catch (error) {
    console.error('CSV process error:', error);
    res.status(500).json({ error: error.message || 'Failed to process ECG data' });
  }
});

router.get('/sessions', async (req, res) => {
  try {
    const { data: sessions, error } = await supabase
      .from('sessions')
      .select('id, patient_id, started_at, duration_s, prediction, confidence, csv_url, report_url')
      .eq('patient_id', req.user.id)
      .order('started_at', { ascending: false });

    if (error) {
      if (error.code === '42501') return res.status(500).json({ error: 'Permission denied. See server/setup.sql or set SUPABASE_SERVICE_KEY.', hint: 'Run setup.sql in Supabase SQL Editor' });
      throw error;
    }
    res.json(sessions || []);
  } catch (error) {
    console.error('List sessions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
