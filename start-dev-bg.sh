#!/bin/bash
# Start all CloudLess services in the background for local development
# This version avoids osascript and is compatible with IDE terminals.

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$ROOT_DIR/logs"
mkdir -p "$LOG_DIR"

if [ -f "$ROOT_DIR/.env" ]; then
    set -a
    source "$ROOT_DIR/.env"
    set +a
fi

API_URL="${REACT_APP_API_URL:-http://localhost:5001}"
WS_URL="${REACT_APP_WS_URL:-ws://localhost:5001}"
SERVER_URL_VALUE="${SERVER_URL:-http://localhost:5001}"
START_LOCAL_SERVER="${START_LOCAL_SERVER:-}"
START_LOCAL_WORKER="${START_LOCAL_WORKER:-}"

is_local_url() {
    case "$1" in
        http://localhost:*|http://127.0.0.1:*|ws://localhost:*|ws://127.0.0.1:*)
            return 0
            ;;
        *)
            return 1
            ;;
    esac
}

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}CloudLess Background Development${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Check dependencies
echo -e "${YELLOW}Checking dependencies...${NC}"
if ! command -v node &> /dev/null || ! command -v npm &> /dev/null || ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Missing dependencies. Please run ./setup.sh first.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ All dependencies found${NC}"

if [ -n "$API_URL" ]; then
    echo -e "${BLUE}Frontend API:${NC} $API_URL"
fi
if [ -n "$SERVER_URL_VALUE" ]; then
    echo -e "${BLUE}Worker Server:${NC} $SERVER_URL_VALUE"
fi

# Check for existing processes
echo -e "${YELLOW}Checking for port conflicts...${NC}"
for port in 3000 5001; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${RED}⚠️  Port $port is already in use.${NC}"
        echo -e "${YELLOW}You might want to run: kill \$(lsof -t -i:$port)${NC}"
        # We'll continue anyway, but the service might fail
    fi
done

# Variable to store PIDs
SERVER_PID=""
CLIENT_PID=""
WORKER_PID=""

# Cleanup function
cleanup() {
    echo ""
    echo -e "${YELLOW}Stopping services...${NC}"
    [ -n "$SERVER_PID" ] && kill $SERVER_PID 2>/dev/null
    [ -n "$CLIENT_PID" ] && kill $CLIENT_PID 2>/dev/null
    [ -n "$WORKER_PID" ] && kill $WORKER_PID 2>/dev/null
    echo -e "${GREEN}✅ All services stopped.${NC}"
    exit
}

# Trap Ctrl+C
trap cleanup SIGINT SIGTERM

echo -e "${BLUE}Starting Server...${NC}"
if [ "$START_LOCAL_SERVER" = "true" ] || { [ -z "$START_LOCAL_SERVER" ] && is_local_url "$API_URL"; }; then
    cd "$ROOT_DIR/server"
    PORT=5001 npm start > "$LOG_DIR/server.log" 2>&1 &
    SERVER_PID=$!
    echo -e "  PID: $SERVER_PID, Logs: logs/server.log"
    sleep 2
else
    echo -e "  ${YELLOW}Skipping local server. Using remote backend: $API_URL${NC}"
fi

echo -e "${BLUE}Starting Client...${NC}"
cd "$ROOT_DIR/client"
REACT_APP_API_URL="$API_URL" REACT_APP_WS_URL="$WS_URL" npm start > "$LOG_DIR/client.log" 2>&1 &
CLIENT_PID=$!
echo -e "  PID: $CLIENT_PID, Logs: logs/client.log"

sleep 2

echo -e "${BLUE}Starting Worker...${NC}"
if [ "$START_LOCAL_WORKER" = "true" ] || { [ -z "$START_LOCAL_WORKER" ] && is_local_url "$SERVER_URL_VALUE"; }; then
    cd "$ROOT_DIR/worker"
    source venv/bin/activate
    export SERVER_URL="$SERVER_URL_VALUE"
    python3 worker.py > "$LOG_DIR/worker.log" 2>&1 &
    WORKER_PID=$!
    echo -e "  PID: $WORKER_PID, Logs: logs/worker.log"
else
    echo -e "  ${YELLOW}Skipping local worker. Using remote/shared workers via: $SERVER_URL_VALUE${NC}"
fi

echo ""
echo -e "${GREEN}🚀 All services are running in the background!${NC}"
echo "📱 Access the application at: ${BLUE}http://localhost:3000${NC}"
echo ""
echo "To view logs in real-time, use:"
echo "  tail -f logs/server.log   # For server"
echo "  tail -f logs/client.log   # For client"
echo "  tail -f logs/worker.log   # For worker"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services.${NC}"

# Keep script running to maintain the trap
while true; do
    sleep 1
done
