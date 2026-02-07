#!/bin/bash

# Development script - starts all services (backend + frontend)
# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🚀 Starting Full Job Portal Development Stack${NC}"
echo "=============================================="

# Start backend services
echo -e "${YELLOW}Starting backend services...${NC}"
./start-backend.sh

# Wait a bit for backend to initialize
sleep 2

# Start frontend
echo ""
echo -e "${YELLOW}Starting frontend...${NC}"
cd frontend
npm run dev > ../logs/frontend.log 2>&1 &
echo $! > ../logs/frontend.pid
echo -e "${GREEN}✓${NC} Frontend started (PID: $(cat ../logs/frontend.pid))"
cd ..

echo ""
echo -e "${GREEN}✅ Full stack started!${NC}"
echo ""
echo "Services:"
echo "  - Frontend:     http://localhost:3000"
echo "  - Auth Service: http://localhost:8001"
echo "  - User Service: http://localhost:8002"
echo "  - Job Service:  http://localhost:8003"
echo ""
echo -e "${YELLOW}To stop all:${NC} ./stop-all.sh"
