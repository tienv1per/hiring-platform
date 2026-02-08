#!/bin/bash

# Script to stop all backend services
# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Get the script's directory (absolute path)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOGS_DIR="${SCRIPT_DIR}/logs"

echo -e "${YELLOW}🛑 Stopping Job Portal Backend Services${NC}"
echo "========================================="

# Function to stop a service
stop_service() {
    local service_name=$1
    local pid_file="${LOGS_DIR}/${service_name}.pid"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            kill "$pid"
            echo -e "${GREEN}✓${NC} Stopped ${service_name} (PID: ${pid})"
            rm "$pid_file"
        else
            echo -e "${YELLOW}⚠${NC} ${service_name} is not running"
            rm "$pid_file"
        fi
    else
        echo -e "${YELLOW}⚠${NC} No PID file for ${service_name}"
    fi
}

# Stop all services
stop_service "auth-service"
stop_service "user-service"
stop_service "job-service"
stop_service "utility-service"

# Stop monitoring services if running
if docker ps --format '{{.Names}}' 2>/dev/null | grep -q "prometheus\|grafana\|loki\|promtail"; then
    echo ""
    echo -e "${YELLOW}📊 Stopping Monitoring Stack...${NC}"
    cd "${SCRIPT_DIR}/docker" && docker-compose -f docker-compose.monitoring.yml down 2>/dev/null
    cd "${SCRIPT_DIR}"
    echo -e "${GREEN}✓${NC} Monitoring stack stopped"
fi

echo ""
echo -e "${GREEN}✅ All services stopped${NC}"

