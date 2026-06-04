import { Router } from 'express';
import { supabase } from '../index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/me', async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('patients')
      .select('id, name, age, weight_kg, bp_systolic, bp_diastolic, comorbidities, created_at, updated_at')
      .eq('id', req.user.id)
      .single();

    if (error) {
      console.error('[PATIENTS] Get error:', error);
      return res.status(500).json({ error: 'Failed to fetch profile' });
    }
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/me', async (req, res) => {
  try {
    const { name, age, weight_kg, bp_systolic, bp_diastolic, comorbidities } = req.body;
    const updates = {};
    const now = new Date().toISOString();

    if (name !== undefined) updates.name = name.trim();
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
      .eq('id', req.user.id)
      .select('id, name, age, weight_kg, bp_systolic, bp_diastolic, comorbidities, created_at, updated_at')
      .single();

    if (error) {
      console.error('[PATIENTS] Update error:', error);
      return res.status(500).json({ error: 'Failed to update profile' });
    }

    res.json(data);
  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/me', async (req, res) => {
  try {
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', req.user.id);

    if (error) {
      console.error('[PATIENTS] Delete error:', error);
      return res.status(500).json({ error: 'Failed to delete account' });
    }
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete patient error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
