-- ============================================
-- Table: progress_photos
-- Stores progress photos with measurement snapshots
-- ============================================
CREATE TABLE IF NOT EXISTS progress_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_path TEXT NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  measurement_snapshot JSONB DEFAULT '[]'::jsonb,
  taken_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for ordering by date
CREATE INDEX IF NOT EXISTS idx_progress_photos_taken_at ON progress_photos(taken_at);

-- Disable RLS (single user app, consistent with other tables)
ALTER TABLE progress_photos DISABLE ROW LEVEL SECURITY;

-- Reuse existing trigger function for auto-updating updated_at
DROP TRIGGER IF EXISTS update_progress_photos_updated_at ON progress_photos;
CREATE TRIGGER update_progress_photos_updated_at
  BEFORE UPDATE ON progress_photos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
