-- Rollback: Remove pgvector extension and embedding column
-- Run this if you need to undo the pgvector migration

-- Step 1: Drop the vector index
DROP INDEX IF EXISTS jobs_title_embedding_idx;

-- Step 2: Drop the embedding column
ALTER TABLE jobs DROP COLUMN IF EXISTS title_embedding;

-- Step 3: Drop the pgvector extension
-- Note: Only drop if no other tables are using vector columns
DROP EXTENSION IF EXISTS vector;

-- Verification
DO $$
BEGIN
    -- Verify extension is removed
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
        RAISE NOTICE '✅ pgvector extension removed successfully';
    ELSE
        RAISE WARNING '⚠️ pgvector extension still exists (may be used by other tables)';
    END IF;

    -- Verify column is removed
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'jobs' AND column_name = 'title_embedding'
    ) THEN
        RAISE NOTICE '✅ title_embedding column removed successfully';
    ELSE
        RAISE EXCEPTION '❌ title_embedding column still exists';
    END IF;

    -- Verify index is removed
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'jobs_title_embedding_idx'
    ) THEN
        RAISE NOTICE '✅ Vector index removed successfully';
    ELSE
        RAISE EXCEPTION '❌ Vector index still exists';
    END IF;
END $$;
