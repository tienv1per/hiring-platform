-- Migration: Add Color Column to Skills Table
-- Allows each skill to have a custom color for Notion-style tags

-- Step 1: Add color column with default 'gray'
ALTER TABLE skills 
ADD COLUMN IF NOT EXISTS color VARCHAR(20) DEFAULT 'gray';

-- Step 2: Update existing skills with random attractive colors
UPDATE skills 
SET color = (
  ARRAY['gray', 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 
        'teal', 'indigo', 'lime', 'rose', 'amber']
)[floor(random() * 13 + 1)::int]
WHERE color IS NULL OR color = 'gray';

-- Step 3: Add check constraint to ensure valid colors
ALTER TABLE skills
ADD CONSTRAINT skills_color_check 
CHECK (color IN ('gray', 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink',
                 'teal', 'indigo', 'lime', 'rose', 'amber'));

-- Verify the migration
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'skills' AND column_name = 'color'
  ) THEN
    RAISE NOTICE '✅ Color column added successfully';
  ELSE
    RAISE EXCEPTION '❌ Migration failed: color column not found';
  END IF;
END $$;

-- Show color distribution
SELECT color, COUNT(*) as count 
FROM skills 
GROUP BY color 
ORDER BY count DESC;
