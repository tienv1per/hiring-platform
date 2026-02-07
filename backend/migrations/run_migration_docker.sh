#!/bin/bash

# Run migration using Docker PostgreSQL client
# Works with Neon and other cloud PostgreSQL databases

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🚀 Running PostgreSQL FTS Migration (via Docker)${NC}"
echo "=============================================="

# Load environment variables
if [ -f ../../.env ]; then
    export $(cat ../../.env | grep -v '^#' | xargs)
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}✗${NC} DATABASE_URL environment variable not set"
    exit 1
fi

echo -e "${GREEN}✓${NC} Using DATABASE_URL from environment"
echo ""

# Run migration using Docker
echo -e "${YELLOW}Running migration...${NC}"
docker run --rm -i \
    -v "$(pwd):/sql" \
    postgres:15 \
    psql "$DATABASE_URL" -f /sql/006_add_skills_fts.sql

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Migration completed successfully!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Restart the user service"
    echo "2. Test search at: http://localhost:8002/api/skills?q=java"
else
    echo ""
    echo -e "${RED}✗${NC} Migration failed"
    exit 1
fi
