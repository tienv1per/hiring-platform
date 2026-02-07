#!/bin/bash

echo "🔍 Job Portal - Login Flow Test"
echo "================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Check Auth Service
echo -e "\n${YELLOW}1. Checking Auth Service...${NC}"
AUTH_HEALTH=$(curl -s http://localhost:8001/health 2>/dev/null)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Auth service is running${NC}"
    echo "$AUTH_HEALTH"
else
    echo -e "${RED}❌ Auth service not running on port 8001${NC}"
    echo "Start it with: cd backend/auth-service && go run main.go"
    exit 1
fi

# 2. Register Test User
echo -e "\n${YELLOW}2. Registering test user (test@example.com)...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:8001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123",
    "role": "jobseeker"
  }' 2>/dev/null)

if echo "$REGISTER_RESPONSE" | grep -q "User registered successfully\|already exists"; then
    echo -e "${GREEN}✅ User ready${NC}"
else
    echo -e "${RED}Registration response:${NC}"
    echo "$REGISTER_RESPONSE"
fi

# 3. Test Login
echo -e "\n${YELLOW}3. Testing login with test@example.com...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }' 2>/dev/null)

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
    echo -e "${GREEN}✅ Login successful! Token received${NC}"
    echo "$LOGIN_RESPONSE" | head -n 10
else
    echo -e "${RED}❌ Login failed${NC}"
    echo "$LOGIN_RESPONSE"
    exit 1
fi

# 4. Check Frontend
echo -e "\n${YELLOW}4. Checking Frontend...${NC}"
FRONTEND_RESPONSE=$(curl -s http://localhost:3000 2>/dev/null)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend is running on port 3000${NC}"
else
    echo -e "${RED}❌ Frontend not running${NC}"
    echo "Start it with: cd frontend && npm run dev"
fi

# Summary
echo -e "\n${GREEN}================================${NC}"
echo -e "${GREEN}✅ Backend login flow is working!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "You can now log in at: http://localhost:3000/login"
echo ""
echo "Credentials:"
echo "  Email: test@example.com"
echo "  Password: test123"
echo ""
