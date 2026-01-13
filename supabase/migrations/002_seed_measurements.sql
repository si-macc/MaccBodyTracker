-- MeasureMe Default Measurements Seed Data
-- Run this after 001_create_tables.sql

-- Clear existing default measurements (optional - comment out if you want to keep existing)
-- DELETE FROM measurements WHERE is_default = true;

-- Insert default measurements
INSERT INTO measurements (name, unit_metric, unit_imperial, category, sort_order, is_default, is_calculated)
VALUES
  -- Body measurements
  ('Weight', 'kg', 'lbs', 'Body', 1, true, false),
  ('Height', 'cm', 'in', 'Body', 2, true, false),
  ('Body Fat', '%', '%', 'Body', 3, true, false),
  
  -- Upper Body
  ('Chest', 'cm', 'in', 'Upper Body', 10, true, false),
  ('Shoulders', 'cm', 'in', 'Upper Body', 11, true, false),
  ('Neck', 'cm', 'in', 'Upper Body', 12, true, false),
  
  -- Core
  ('Waist', 'cm', 'in', 'Core', 20, true, false),
  ('Hips', 'cm', 'in', 'Core', 21, true, false),
  
  -- Arms
  ('Bicep (Left)', 'cm', 'in', 'Arms', 30, true, false),
  ('Bicep (Right)', 'cm', 'in', 'Arms', 31, true, false),
  
  -- Legs
  ('Thigh (Left)', 'cm', 'in', 'Legs', 40, true, false),
  ('Thigh (Right)', 'cm', 'in', 'Legs', 41, true, false),
  ('Calf (Left)', 'cm', 'in', 'Legs', 42, true, false),
  ('Calf (Right)', 'cm', 'in', 'Legs', 43, true, false),
  
  -- Jackson-Pollock 3-Site Skinfold measurements
  ('Chest Skinfold', 'mm', 'mm', 'JP3 Skinfold', 50, true, false),
  ('Abdomen Skinfold', 'mm', 'mm', 'JP3 Skinfold', 51, true, false),
  ('Thigh Skinfold', 'mm', 'mm', 'JP3 Skinfold', 52, true, false),
  
  -- Jackson-Pollock calculated body fat
  ('JP3 Body Fat %', '%', '%', 'JP3 Calculated', 53, true, true)

ON CONFLICT DO NOTHING;
