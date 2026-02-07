#!/bin/bash

# Script to start all backend services concurrently
# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Job Portal Backend Services${NC}"
echo "========================================"

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo -e "${GREEN}✓${NC} Environment variables loaded"
else
    echo -e "${RED}✗${NC} .env file not found"
    exit 1
fi

# Function to start a service
start_service() {
    local service_name=$1
    local service_dir=$2
    local port=$3
    
    echo -e "${YELLOW}Starting ${service_name} on port ${port}...${NC}"
    
    cd "$service_dir" || exit 1
    go run main.go > "../logs/${service_name}.log" 2>&1 &
    local pid=$!
    echo "$pid" > "../logs/${service_name}.pid"
    
    echo -e "${GREEN}✓${NC} ${service_name} started (PID: ${pid})"
    cd - > /dev/null
}

# Create logs directory if it doesn't exist
mkdir -p logs

# Start all services
echo ""
echo -e "${BLUE}Starting services...${NC}"

start_service "auth-service" "backend/auth-service" "${AUTH_SERVICE_PORT:-8001}"
start_service "user-service" "backend/user-service" "${USER_SERVICE_PORT:-8002}"
start_service "job-service" "backend/job-service" "${JOB_SERVICE_PORT:-8003}"
start_service "utility-service" "backend/utility-service" "${UTILITY_SERVICE_PORT:-8004}"

echo ""
echo -e "${GREEN}✅ All services started successfully!${NC}"
echo ""
echo "Service Status:"
echo "  - Auth Service:    http://localhost:${AUTH_SERVICE_PORT:-8001}"
echo "  - User Service:    http://localhost:${USER_SERVICE_PORT:-8002}"
echo "  - Job Service:     http://localhost:${JOB_SERVICE_PORT:-8003}"
echo "  - Utility Service: http://localhost:${UTILITY_SERVICE_PORT:-8004}"
echo ""
echo "Logs are available in: ./logs/"
echo ""
echo -e "${YELLOW}To stop all services, run:${NC} ./stop-backend.sh"
echo -e "${YELLOW}To view logs:${NC} tail -f logs/<service-name>.log"
