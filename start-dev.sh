#!/bin/bash
# Start all CloudLess services for local development
# This script starts server, client, and worker in separate terminal windows (macOS/Linux)

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}CloudLess Local Development${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Check if all dependencies are installed
echo -e "${YELLOW}Checking dependencies...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not found${NC}"
    exit 1
fi

if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All dependencies found${NC}"
echo ""

# Function to start service
start_service() {
    local service_name=$1
    local service_dir=$2
    local command=$3
    
    echo -e "${BLUE}Starting ${service_name}...${NC}"
    
    # Use different approach based on OS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS - use open -a Terminal
        osascript <<EOF
tell app "Terminal"
    do script "cd '$ROOT_DIR/$service_dir' && $command"
end tell
EOF
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux - use gnome-terminal or xterm
        if command -v gnome-terminal &> /dev/null; then
            gnome-terminal -- bash -c "cd '$ROOT_DIR/$service_dir' && $command; read -p 'Press enter to close...'"
        elif command -v xterm &> /dev/null; then
            xterm -e "cd '$ROOT_DIR/$service_dir' && $command; read -p 'Press enter to close...'" &
        fi
    fi
}

# Start the services
start_service "Server" "server" "PORT=5001 npm start"
sleep 3

start_service "Client" "client" "REACT_APP_API_URL=http://localhost:5001 REACT_APP_WS_URL=ws://localhost:5001 npm start"
sleep 3

# For worker, we need to activate venv
WORKER_CMD="source venv/bin/activate && export SERVER_URL=http://localhost:5001 && python worker.py"
start_service "Worker" "worker" "$WORKER_CMD"

echo ""
echo -e "${GREEN}✅ All services started!${NC}"
echo ""
echo "📱 Access the application at: ${BLUE}http://localhost:3000${NC}"
echo ""
echo "Services:"
echo "  Client:  http://localhost:3000"
echo "  Server:  http://localhost:5001"
echo "  WebSocket: ws://localhost:5001"
echo ""
echo "Press Ctrl+C to stop"
