#!/bin/bash

# PostgreSQL Full-Text Search Migration Script
# Run this script to add FTS capabilities to the skills table

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 PostgreSQL Full-Text Search Migration${NC}"
echo "=========================================="

# Load environment variables
if [ -f ../../.env ]; then
    export $(cat ../../.env | grep -v '^#' | xargs)
    echo -e "${GREEN}✓${NC} Environment variables loaded"
else
    echo -e "${RED}✗${NC} .env file not found"
    echo "Using default connection settings..."
fi

# Database connection details
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-job_portal}"
DB_USER="${DB_USER:-postgres}"
DB_PASS="${DB_PASSWORD:-password}"

# Connection string
CONN_STRING="${DATABASE_URL}"

echo ""
echo "Connection string: ${CONN_STRING}"
echo "Database: ${DB_NAME}"
echo "Host: ${DB_HOST}:${DB_PORT}"
echo "User: ${DB_USER}"
echo ""

# Check if PostgreSQL is accessible
echo -e "${YELLOW}Checking database connection...${NC}"
if psql "${CONN_STRING}" -c '\q' 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Database connection successful"
else
    echo -e "${RED}✗${NC} Cannot connect to database"
    echo ""
    echo "Please ensure PostgreSQL is running and credentials are correct."
    echo "You can manually run the migration with:"
    echo "  psql ${CONN_STRING} -f 006_add_skills_fts.sql"
    exit 1
fi

# Run migration
echo ""
echo -e "${YELLOW}Running migration...${NC}"
if psql "${CONN_STRING}" -f 006_add_skills_fts.sql; then
    echo ""
    echo -e "${GREEN}✅ Migration completed successfully!${NC}"
    echo ""
    
    # Test the migration
    echo -e "${YELLOW}Testing full-text search...${NC}"
    TEST_QUERY="SELECT COUNT(*) as indexed_skills FROM skills WHERE search_vector IS NOT NULL;"
    RESULT=$(psql "${CONN_STRING}" -t -c "${TEST_QUERY}")
    echo -e "${GREEN}✓${NC} Indexed ${RESULT} skills"
    
    echo ""
    echo "Next steps:"
    echo "1. Restart the user service to use the new search implementation"
    echo "2. Test the search at: http://localhost:8002/api/skills?q=java"
    echo ""
else
    echo ""
    echo -e "${RED}✗${NC} Migration failed"
    echo ""
    echo "To rollback, run:"
    echo "  ./run_migration.sh rollback"
    exit 1
fi
