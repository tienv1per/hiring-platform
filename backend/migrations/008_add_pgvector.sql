-- Migration: Add pgvector extension and embedding column to jobs table
-- This enables semantic job search using vector similarity

-- Step 1: Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Step 2: Add embedding column to jobs table
-- Using 384 dimensions for sentence-transformers/all-MiniLM-L6-v2 model
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS title_embedding vector(384);

-- Step 3: Create index for fast similarity search
-- Using ivfflat for approximate nearest neighbor search
-- lists parameter: sqrt(total_rows) is a good starting point
-- For ~1000 jobs: sqrt(1000) ≈ 31, rounded to 100 for growth
CREATE INDEX IF NOT EXISTS jobs_title_embedding_idx 
ON jobs 
USING ivfflat (title_embedding vector_cosine_ops)
WITH (lists = 100);

-- Step 4: Add comment for documentation
COMMENT ON COLUMN jobs.title_embedding IS 
'384-dimensional embedding vector for semantic job search using sentence-transformers/all-MiniLM-L6-v2';

-- Verification queries
DO $$
BEGIN
    -- Verify extension is installed
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
        RAISE NOTICE '✅ pgvector extension installed successfully';
    ELSE
        RAISE EXCEPTION '❌ pgvector extension not found';
    END IF;

    -- Verify column exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'jobs' AND column_name = 'title_embedding'
    ) THEN
        RAISE NOTICE '✅ title_embedding column added successfully';
    ELSE
        RAISE EXCEPTION '❌ title_embedding column not found';
    END IF;

    -- Verify index exists
    IF EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'jobs_title_embedding_idx'
    ) THEN
        RAISE NOTICE '✅ Vector index created successfully';
    ELSE
        RAISE EXCEPTION '❌ Vector index not found';
    END IF;
END $$;

-- Show extension version
SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';
