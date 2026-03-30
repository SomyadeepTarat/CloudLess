#!/bin/bash
# CloudLess Integration Setup Script

set -e  # Exit on error

echo "🚀 CloudLess Integration Setup"
echo "================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠️  Node.js not found. Please install Node.js 16+${NC}"
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${YELLOW}⚠️  Python 3 not found. Please install Python 3.8+${NC}"
    exit 1
fi

echo -e "${BLUE}1. Installing server dependencies...${NC}"
cd server
npm install
cd ..

echo -e "${BLUE}2. Installing client dependencies...${NC}"
cd client
npm install
cd ..

echo -e "${BLUE}3. Setting up Python worker environment...${NC}"
cd worker
python3 -m venv venv || virtualenv venv
source venv/bin/activate || . venv/Scripts/activate
pip install requests psutil
cd ..

echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "📋 Next steps:"
echo ""
echo "Option 1: Run all services with Docker Compose"
echo "  docker-compose up"
echo ""
echo "Option 2: Run services separately in different terminals:"
echo ""
echo "  Terminal 1 (Server):"
echo "    cd server && npm start"
echo ""
echo "  Terminal 2 (Client):"
echo "    cd client && npm start"
echo ""
echo "  Terminal 3 (Worker):"
echo "    cd worker"
echo "    source venv/bin/activate  # or . venv/Scripts/activate on Windows"
echo "    python worker.py"
echo ""
echo "The application will be available at: http://localhost:3000"
