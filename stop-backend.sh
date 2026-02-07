#!/bin/bash

# Script to stop all backend services
# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🛑 Stopping Job Portal Backend Services${NC}"
echo "========================================="

# Function to stop a service
stop_service() {
    local service_name=$1
    local pid_file="logs/${service_name}.pid"
    
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

echo ""
echo -e "${GREEN}✅ All services stopped${NC}"
