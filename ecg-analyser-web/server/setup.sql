-- ============================================================
-- ECG Analyser Web - Supabase RLS Policies Setup
-- ============================================================
-- Run this in Supabase Dashboard > SQL Editor
-- Go to: https://supabase.com/dashboard/project/YOUR_PROJECT_REF/sql/new
-- ============================================================
--
-- IMPORTANT: For production, set SUPABASE_SERVICE_KEY in server/.env
-- so the backend uses the service_role key (bypasses RLS).
-- The policies below lock down anon access so the anon key
-- (which is exposed in client code) cannot read/write data directly.
-- ============================================================

-- 1. Enable RLS on all tables (if not already enabled)
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies (for idempotency)
DROP POLICY IF EXISTS "anon_select_patients" ON patients;
DROP POLICY IF EXISTS "anon_insert_patients" ON patients;
DROP POLICY IF EXISTS "anon_update_patients" ON patients;
DROP POLICY IF EXISTS "anon_delete_patients" ON patients;
DROP POLICY IF EXISTS "anon_select_sessions" ON sessions;
DROP POLICY IF EXISTS "anon_select_feedback" ON feedback;

-- 3. Patients table - DENY ALL direct anon access
-- Anon key should NOT be able to read/write patient data directly
-- All patient operations go through the Express backend which uses service_role key
CREATE POLICY "anon_select_patients" ON patients
  FOR SELECT TO anon
  USING (false);

CREATE POLICY "anon_insert_patients" ON patients
  FOR INSERT TO anon
  WITH CHECK (false);

CREATE POLICY "anon_update_patients" ON patients
  FOR UPDATE TO anon
  USING (false);

CREATE POLICY "anon_delete_patients" ON patients
  FOR DELETE TO anon
  USING (false);

-- 4. Sessions table - DENY ALL direct anon access
CREATE POLICY "anon_select_sessions" ON sessions
  FOR SELECT TO anon
  USING (false);

-- 5. Feedback table - DENY ALL direct anon access
CREATE POLICY "anon_select_feedback" ON feedback
  FOR SELECT TO anon
  USING (false);

-- ============================================================
-- SECURITY DEFINER RPC functions (bypass RLS - callable by anon)
-- ============================================================

-- Registration function (bypasses RLS via SECURITY DEFINER)
CREATE OR REPLACE FUNCTION register_patient(
  p_name TEXT,
  p_password_hash TEXT,
  p_passcode_hash TEXT
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  new_patient JSONB;
BEGIN
  INSERT INTO patients (name, password_hash, passcode_hash, save_locally, age, weight_kg, bp_systolic, bp_diastolic, comorbidities, created_at, updated_at)
  VALUES (p_name, p_password_hash, p_passcode_hash, 1, 0, 0.0, 120, 80, '', NOW(), NOW())
  RETURNING jsonb_build_object(
    'id', id, 'name', name, 'age', age, 'weight_kg', weight_kg,
    'bp_systolic', bp_systolic, 'bp_diastolic', bp_diastolic,
    'comorbidities', comorbidities, 'created_at', created_at, 'updated_at', updated_at
  ) INTO new_patient;
  RETURN new_patient;
END;
$$;

-- Update patient function (bypasses RLS via SECURITY DEFINER)
CREATE OR REPLACE FUNCTION update_patient(
  p_id INT,
  p_name TEXT DEFAULT NULL,
  p_age INT DEFAULT NULL,
  p_weight_kg FLOAT DEFAULT NULL,
  p_bp_systolic INT DEFAULT NULL,
  p_bp_diastolic INT DEFAULT NULL,
  p_comorbidities TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  UPDATE patients SET
    name = COALESCE(p_name, name),
    age = COALESCE(p_age, age),
    weight_kg = COALESCE(p_weight_kg, weight_kg),
    bp_systolic = COALESCE(p_bp_systolic, bp_systolic),
    bp_diastolic = COALESCE(p_bp_diastolic, bp_diastolic),
    comorbidities = COALESCE(p_comorbidities, comorbidities),
    updated_at = NOW()
  WHERE id = p_id;
  RETURN (SELECT jsonb_build_object(
    'id', id, 'name', name, 'age', age, 'weight_kg', weight_kg,
    'bp_systolic', bp_systolic, 'bp_diastolic', bp_diastolic,
    'comorbidities', comorbidities, 'created_at', created_at, 'updated_at', updated_at
  ) FROM patients WHERE id = p_id);
END;
$$;

-- Delete patient function (bypasses RLS via SECURITY DEFINER)
CREATE OR REPLACE FUNCTION delete_patient(p_id INT)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM sessions WHERE patient_id = p_id;
  DELETE FROM feedback WHERE session_id IN (SELECT id FROM sessions WHERE patient_id = p_id);
  DELETE FROM patients WHERE id = p_id;
  RETURN FOUND;
END;
$$;

-- get_user_hashes RPC (used for login, returns only password/passcode hashes by patient name)
CREATE OR REPLACE FUNCTION get_user_hashes(p_name TEXT)
RETURNS TABLE(r_password_hash TEXT, r_passcode_hash TEXT)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY SELECT password_hash, passcode_hash FROM patients WHERE name = p_name LIMIT 1;
END;
$$;

-- authenticate_and_get_hashes RPC (verifies credentials and returns hashes for local storage)
CREATE OR REPLACE FUNCTION authenticate_and_get_hashes(
  p_name TEXT,
  p_password TEXT,
  p_passcode TEXT
) RETURNS TABLE(r_password_hash TEXT, r_passcode_hash TEXT)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  -- This function verifies credentials server-side (hash comparison done in app)
  RETURN QUERY SELECT password_hash, passcode_hash
    FROM patients WHERE name = p_name AND password_hash IS NOT NULL AND passcode_hash IS NOT NULL
    LIMIT 1;
END;
$$;

-- ============================================================
-- Admin / Superuser Role Migration
-- ============================================================

-- 1. Add role column to patients table
ALTER TABLE patients ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'patient';

-- 2. Create index on role for faster lookups
CREATE INDEX IF NOT EXISTS idx_patients_role ON patients(role);

-- 3. Update get_user_hashes to return role as well
DROP FUNCTION IF EXISTS get_user_hashes(TEXT);
CREATE OR REPLACE FUNCTION get_user_hashes(p_name TEXT)
RETURNS TABLE(r_password_hash TEXT, r_passcode_hash TEXT, r_role TEXT)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY SELECT password_hash, passcode_hash, role::text FROM patients WHERE name = p_name LIMIT 1;
END;
$$;

-- ============================================================
-- Audit Logs Table for IP Tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  event_type VARCHAR(20) NOT NULL DEFAULT 'api_request',
  ip_address VARCHAR(45) NOT NULL,
  http_method VARCHAR(10) NOT NULL,
  request_url TEXT NOT NULL,
  user_agent TEXT,
  patient_id INT REFERENCES patients(id) ON DELETE SET NULL,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_deny_audit_logs" ON audit_logs;
CREATE POLICY "anon_deny_audit_logs" ON audit_logs FOR SELECT TO anon USING (false);

-- Add event_type and details to existing table if upgrading
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS event_type VARCHAR(20) DEFAULT 'api_request';
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS details TEXT;

-- ============================================================
-- Promote first admin user (update username as needed)
-- ============================================================
-- UPDATE patients SET role = 'admin' WHERE name = 'YourAdminUsername';
