#!/bin/bash

# Stop all services (backend + frontend)
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🛑 Stopping all services...${NC}"

# Stop backend
./stop-backend.sh

# Stop frontend
if [ -f "logs/frontend.pid" ]; then
    pid=$(cat logs/frontend.pid)
    if kill -0 "$pid" 2>/dev/null; then
        kill "$pid"
        echo -e "${GREEN}✓${NC} Stopped frontend (PID: ${pid})"
        rm logs/frontend.pid
    fi
fi

echo ""
echo -e "${GREEN}✅ All services stopped${NC}"
