-- Rollback Migration: Remove Full-Text Search from Skills Table

-- Drop indexes
DROP INDEX IF EXISTS skills_search_idx;
DROP INDEX IF EXISTS skills_name_trgm_idx;
DROP INDEX IF EXISTS skills_name_idx;

-- Drop trigger
DROP TRIGGER IF EXISTS skills_search_vector_trigger ON skills;

-- Drop function
DROP FUNCTION IF EXISTS skills_search_vector_update();

-- Drop column
ALTER TABLE skills DROP COLUMN IF EXISTS search_vector;

-- Note: We don't drop pg_trgm extension as it might be used elsewhere
-- If you need to drop it: DROP EXTENSION IF EXISTS pg_trgm;

RAISE NOTICE '✅ Rollback successful: Full-text search removed from skills table';
