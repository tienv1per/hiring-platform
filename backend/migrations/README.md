# Database Migrations

This directory contains SQL migration scripts for the Job Portal database.

## How to Run Migrations

### Method 1: Using psql (Recommended)

```bash
# Run a specific migration
psql -U postgres -d job_portal -f 006_add_skills_fts.sql

# Or with connection string
psql postgresql://postgres:password@localhost:5432/job_portal -f 006_add_skills_fts.sql
```

### Method 2: Using Docker

```bash
# If PostgreSQL is running in Docker
docker exec -i postgres_container psql -U postgres -d job_portal < 006_add_skills_fts.sql
```

### Method 3: From PostgreSQL Shell

```bash
# Connect to database
psql -U postgres -d job_portal

# Run migration
\i path/to/006_add_skills_fts.sql
```

## Migration List

| # | Name | Description |
|---|------|-------------|
| 001 | Initial Schema | Create users, skills, companies, jobs tables |
| 002 | Add Applications | Job application tracking |
| 003 | Add User Skills | Many-to-many relationship |
| 004 | Add Indexes | Performance optimization |
| 005 | Add Constraints | Data integrity |
| **006** | **Skills FTS** | **Full-text search for skills** ✨ |

## Rollback

To rollback a migration:

```bash
psql -U postgres -d job_portal -f 006_add_skills_fts_rollback.sql
```

## Verification

After running migration 006, verify it with:

```sql
-- Check if column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'skills' AND column_name = 'search_vector';

-- Check indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'skills';

-- Test search
SELECT to_tsvector('english', 'JavaScript Developer');
SELECT to_tsquery('english', 'java:*');

-- Test similarity (requires pg_trgm)
SELECT similarity('JavaScript', 'Javscript');
```

## Migration 006: Full-Text Search Details

**Features Added:**
- ✅ `search_vector` tsvector column for FTS
- ✅ Automatic trigger to update search vector
- ✅ GIN index for fast FTS queries
- ✅ Trigram index for fuzzy matching
- ✅ Regular index on name for prefix matching

**Search Capabilities:**
- **Exact matching**: "JavaScript" → "JavaScript"
- **Prefix matching**: "java" → "JavaScript", "Java"
- **Fuzzy matching**: "javscript" → "JavaScript" (typo tolerance)
- **Stemming**: "develop" → "developer", "developing", "development"
- **Ranking**: Results ordered by relevance

**Performance Impact:**
- GIN index size: ~10-30% of data size
- Search speed: O(log n) instead of O(n)
- Insert/Update: Slight overhead from trigger
