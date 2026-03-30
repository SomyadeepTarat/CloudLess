#!/bin/bash
# CloudLess Integration Verification Checklist
# Run this script to verify all components are properly integrated

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}CloudLess Integration Checker${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Track pass/fail
PASSED=0
FAILED=0

test_port() {
    local port=$1
    local service=$2
    
    if curl -s http://localhost:$port > /dev/null 2>&1; then
        echo -e "${GREEN}✅${NC} $service is running on port $port"
        ((PASSED++))
    else
        echo -e "${RED}❌${NC} $service is NOT running on port $port"
        ((FAILED++))
    fi
}

test_endpoint() {
    local url=$1
    local name=$2
    
    if curl -s "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅${NC} Endpoint $name is responding"
        ((PASSED++))
    else
        echo -e "${RED}❌${NC} Endpoint $name is NOT responding"
        ((FAILED++))
    fi
}

test_file() {
    local filepath=$1
    local name=$2
    
    if [ -f "$filepath" ]; then
        echo -e "${GREEN}✅${NC} $name exists"
        ((PASSED++))
    else
        echo -e "${RED}❌${NC} $name is MISSING"
        ((FAILED++))
    fi
}

echo -e "${YELLOW}Checking Services...${NC}"
test_port 3000 "Client (React)"
test_port 5001 "Server (Node.js)"
echo ""

echo -e "${YELLOW}Checking Server Endpoints...${NC}"
test_endpoint "http://localhost:5001" "Server Root"
test_endpoint "http://localhost:5001/jobs/all" "Jobs Endpoint"
test_endpoint "http://localhost:5001/nodes/nodes/all" "Nodes Endpoint"
echo ""

echo -e "${YELLOW}Checking Client Files...${NC}"
test_file "client/src/services/api.js" "API Service"
test_file "client/src/services/socket.js" "Socket Service"
test_file "client/src/context/AppContext.jsx" "App Context"
test_file "client/src/components/Auth.jsx" "Auth Component"
echo ""

echo -e "${YELLOW}Checking Server Dependencies...${NC}"
if [ -d "server/node_modules" ]; then
    echo -e "${GREEN}✅${NC} Server dependencies installed"
    ((PASSED++))
else
    echo -e "${RED}❌${NC} Server dependencies NOT installed"
    ((FAILED++))
fi
echo ""

echo -e "${YELLOW}Checking Worker Setup...${NC}"
if [ -d "worker/venv" ] || [ -d "worker/.venv" ]; then
    echo -e "${GREEN}✅${NC} Worker virtual environment exists"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️${NC} Worker virtual environment not found"
    ((FAILED++))
fi

test_file "worker/requirements.txt" "Worker Requirements"
test_file "worker/executor.py" "Worker Executor"
test_file "worker/utils.py" "Worker Utils"
echo ""

echo -e "${YELLOW}Checking Configuration Files...${NC}"
test_file ".env" "Environment Configuration"
test_file "docker-compose.yml" "Docker Compose Config"
test_file "INTEGRATION.md" "Integration Documentation"
echo ""

echo -e "${YELLOW}Checking Docker Images...${NC}"
if command -v docker &> /dev/null; then
    if docker images | grep -q cloudless; then
        echo -e "${GREEN}✅${NC} CloudLess Docker images found"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠️${NC} CloudLess Docker images not built yet"
        echo "   Run: docker-compose build"
        ((FAILED++))
    fi
else
    echo -e "${YELLOW}⚠️${NC} Docker not installed (optional)"
fi
echo ""

echo "================================"
echo -e "${BLUE}Integration Check Results${NC}"
echo "================================"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! System is ready to use.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Open http://localhost:3000 in your browser"
    echo "2. Login with any username"
    echo "3. Submit a test job"
    exit 0
else
    echo -e "${RED}❌ Some checks failed. Please fix the issues above.${NC}"
    echo ""
    echo "Common fixes:"
    echo "1. Run setup: ./setup.sh"
    echo "2. Check services: docker-compose ps"
    echo "3. View logs: docker-compose logs -f [service]"
    exit 1
fi
