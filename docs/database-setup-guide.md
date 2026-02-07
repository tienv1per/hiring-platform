# Phase 3: Database Setup Guide

## Prerequisites

1. **Create a Neon DB Account**
   - Go to https://neon.tech
   - Sign up for a free account
   - Create a new project

2. **Get Your Database Connection String**
   - After creating a project, Neon will provide a connection string
   - Format: `postgresql://username:password@host.region.neon.tech/dbname?sslmode=require`

---

## Step 1: Configure Environment Variables

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your Neon DB credentials:
   ```bash
   DATABASE_URL=postgresql://your-username:your-password@your-host.region.neon.tech/neondb?sslmode=require
   ```

---

## Step 2: Run Database Migrations

### Option A: Using psql (Command Line)

1. Install PostgreSQL client if not already installed:
   ```bash
   # macOS
   brew install postgresql
   
   # Ubuntu/Debian
   sudo apt-get install postgresql-client
   ```

2. Run the schema migration:
   ```bash
   psql "postgresql://your-username:your-password@your-host.region.neon.tech/neondb?sslmode=require" -f docs/database-schema.sql
   ```

### Option B: Using Neon Console (Web UI)

1. Go to your Neon project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Copy the entire contents of `docs/database-schema.sql`
4. Paste into the SQL Editor
5. Click "Run" to execute the schema

### Option C: Using Migration Script (Recommended)

We'll create a Node.js migration script for easier execution.

---

## Database Schema Overview

**Tables Created:**
- ✅ `users` - User accounts (job seekers & recruiters)
- ✅ `skills` - Skills taxonomy
- ✅ `user_skills` - User-skill relationships
- ✅ `companies` - Company profiles
- ✅ `jobs` - Job postings with markdown support
- ✅ `applications` - Job applications
- ✅ `subscriptions` - Reserved for future features

**ENUM Types:**
- `user_role`: jobseeker, recruiter
- `job_type`: full-time, part-time, contract, internship
- `work_location`: remote, onsite, hybrid
- `application_status`: pending, viewed, shortlisted, interviewed, offered, rejected
- `job_status`: active, inactive, closed

**Indexes Created:** 8 indexes for optimized queries

**Triggers:** Automatic `updated_at` timestamp updates

---

## Step 3: Verify Database Setup

After running the migration, verify the tables were created:

```sql
-- List all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check ENUM types
SELECT typname 
FROM pg_type 
WHERE typtype = 'e';

-- Verify indexes
SELECT indexname 
FROM pg_indexes 
WHERE schemaname = 'public';
```

Expected output:
- 7 tables
- 5 ENUM types
- 8 indexes

---

## Troubleshooting

### Issue: "permission denied to create extension"

**Solution:** The `uuid-ossp` extension should be available by default in Neon. If not, contact Neon support or remove the extension line and use `gen_random_uuid()` instead.

### Issue: "syntax error near CREATE TYPE"

**Solution:** Ensure you're running the entire script at once, not line by line.

### Issue: Connection timeout

**Solution:** Check your connection string and ensure you have internet connectivity.

---

## Next Steps

After successful database setup:
1. ✅ Test connection from backend services
2. ✅ Seed initial data (optional)
3. ✅ Start building backend microservices (Phase 4)
