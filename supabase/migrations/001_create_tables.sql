-- MeasureMe Database Schema
-- Run this SQL in your Supabase SQL Editor to set up the database

-- ============================================
-- Table: measurements
-- Stores the types of measurements being tracked
-- ============================================
CREATE TABLE IF NOT EXISTS measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  unit_metric VARCHAR(20) NOT NULL,
  unit_imperial VARCHAR(20) NOT NULL,
  category VARCHAR(50),
  sort_order INTEGER DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  is_calculated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Table: measurement_entries
-- Stores individual measurement data points
-- ============================================
CREATE TABLE IF NOT EXISTS measurement_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  measurement_id UUID REFERENCES measurements(id) ON DELETE CASCADE,
  value DECIMAL(10, 2) NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_entries_measurement_id ON measurement_entries(measurement_id);
CREATE INDEX IF NOT EXISTS idx_entries_recorded_at ON measurement_entries(recorded_at);

-- ============================================
-- Table: settings
-- Stores app settings (single row table)
-- ============================================
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  unit_system VARCHAR(10) DEFAULT 'metric' CHECK (unit_system IN ('metric', 'imperial')),
  theme VARCHAR(10) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
  user_age INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings row
INSERT INTO settings (id, unit_system, theme)
VALUES (1, 'metric', 'system')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Disable RLS (Single user app without auth)
-- ============================================
ALTER TABLE measurements DISABLE ROW LEVEL SECURITY;
ALTER TABLE measurement_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;

-- ============================================
-- Function: Update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for auto-updating updated_at
DROP TRIGGER IF EXISTS update_measurements_updated_at ON measurements;
CREATE TRIGGER update_measurements_updated_at
  BEFORE UPDATE ON measurements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_measurement_entries_updated_at ON measurement_entries;
CREATE TRIGGER update_measurement_entries_updated_at
  BEFORE UPDATE ON measurement_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
