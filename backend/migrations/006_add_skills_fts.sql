-- Migration: Add Full-Text Search to Skills Table
-- This migration adds tsvector column, trigger, and GIN index for efficient full-text search

-- Step 1: Add tsvector column for full-text search
ALTER TABLE skills 
ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Step 2: Create function to automatically update search vector
CREATE OR REPLACE FUNCTION skills_search_vector_update() 
RETURNS TRIGGER AS $$
BEGIN
  -- Convert skill name to tsvector for full-text search
  -- Using 'english' dictionary for stemming and stop words
  NEW.search_vector := to_tsvector('english', COALESCE(NEW.name, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Create trigger to auto-update search_vector on INSERT/UPDATE
DROP TRIGGER IF EXISTS skills_search_vector_trigger ON skills;
CREATE TRIGGER skills_search_vector_trigger
BEFORE INSERT OR UPDATE ON skills
FOR EACH ROW EXECUTE FUNCTION skills_search_vector_update();

-- Step 4: Populate search_vector for existing data
UPDATE skills SET search_vector = to_tsvector('english', name);

-- Step 5: Create GIN index for fast full-text search
-- GIN (Generalized Inverted Index) is optimized for full-text search
CREATE INDEX IF NOT EXISTS skills_search_idx ON skills USING GIN(search_vector);

-- Step 6: Create additional trigram index for fuzzy/similarity search
-- This requires pg_trgm extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS skills_name_trgm_idx ON skills USING GIN(name gin_trgm_ops);

-- Step 7: Create index on name for prefix matching
CREATE INDEX IF NOT EXISTS skills_name_idx ON skills(name);

-- Verify the migration
DO $$
BEGIN
  -- Check if column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'skills' AND column_name = 'search_vector'
  ) THEN
    RAISE NOTICE '✅ Migration successful: search_vector column added';
  ELSE
    RAISE EXCEPTION '❌ Migration failed: search_vector column not found';
  END IF;
  
  -- Check if indexes exist
  IF EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'skills' AND indexname = 'skills_search_idx'
  ) THEN
    RAISE NOTICE '✅ GIN index created successfully';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'skills' AND indexname = 'skills_name_trgm_idx'
  ) THEN
    RAISE NOTICE '✅ Trigram index created successfully';
  END IF;
END $$;
