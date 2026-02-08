#!/bin/bash

# Script to start all backend services concurrently
# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the script's directory (absolute path)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOGS_DIR="${SCRIPT_DIR}/logs"

echo -e "${BLUE}🚀 Starting Job Portal Backend Services${NC}"
echo "========================================"

# Load environment variables
if [ -f "${SCRIPT_DIR}/.env" ]; then
    export $(cat "${SCRIPT_DIR}/.env" | grep -v '^#' | xargs)
    echo -e "${GREEN}✓${NC} Environment variables loaded"
else
    echo -e "${RED}✗${NC} .env file not found"
    exit 1
fi

# Create logs directory if it doesn't exist
mkdir -p "${LOGS_DIR}"

# Function to start a service
start_service() {
    local service_name=$1
    local service_dir=$2
    local port=$3
    
    echo -e "${YELLOW}Starting ${service_name} on port ${port}...${NC}"
    
    cd "${SCRIPT_DIR}/${service_dir}" || exit 1
    go run main.go > "${LOGS_DIR}/${service_name}.log" 2>&1 &
    local pid=$!
    echo "$pid" > "${LOGS_DIR}/${service_name}.pid"
    
    echo -e "${GREEN}✓${NC} ${service_name} started (PID: ${pid})"
    cd "${SCRIPT_DIR}"
}

# Start all services
echo ""
echo -e "${BLUE}Starting services...${NC}"

start_service "auth-service" "backend/auth-service" "${AUTH_SERVICE_PORT:-8001}"
start_service "user-service" "backend/user-service" "${USER_SERVICE_PORT:-8002}"
start_service "job-service" "backend/job-service" "${JOB_SERVICE_PORT:-8003}"
start_service "utility-service" "backend/utility-service" "${UTILITY_SERVICE_PORT:-8004}"

echo ""
echo -e "${GREEN}✅ All backend services started successfully!${NC}"
echo ""

# Start monitoring services if enabled
if [ "${ENABLE_MONITORING:-false}" = "true" ]; then
    echo -e "${BLUE}📊 Starting Monitoring Stack (Prometheus, Grafana, Loki)...${NC}"
    cd "${SCRIPT_DIR}/docker" && docker-compose -f docker-compose.monitoring.yml up -d 2>/dev/null
    cd "${SCRIPT_DIR}"
    echo -e "${GREEN}✓${NC} Monitoring stack started"
    echo ""
    echo "Monitoring URLs:"
    echo "  - Prometheus: http://localhost:9090"
    echo "  - Grafana:    http://localhost:3001 (admin/admin)"
    echo "  - Loki:       http://localhost:3100"
else
    echo -e "${YELLOW}ℹ${NC}  Monitoring disabled (set ENABLE_MONITORING=true in .env to enable)"
fi

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

