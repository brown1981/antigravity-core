#!/bin/bash
# AI Corp OS: Web Deployment Script (Cloudflare Permanent Edition)

BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

echo "------------------------------------------------"
echo "      AI Corp OS : GLOBAL ACCESS LAUNCH"
echo "------------------------------------------------"

cd "$(dirname "$0")"

# Password setup
if [ -z "$APP_PASSWORD" ]; then
    echo "Please set your login password:"
    read -sp "Password: " PASSWORD
    echo ""
    export APP_PASSWORD=$PASSWORD
fi

# 1. Launch Streamlit
echo "Starting Boardroom System..."
nohup python3 -m streamlit run streamlit_app.py --server.port 8501 --server.address 127.0.0.1 --server.headless true > .server_log.txt 2>&1 &
APP_PID=$!

# 2. Launch Cloudflare Tunnel
echo "Establishing Persistent Cloudflare Tunnel..."
echo "Your Permanent URL: https://ai-corp.engawacycle.com"
echo "------------------------------------------------"

# Kill processes on exit
trap "echo 'Stopping AI Corp OS...'; kill $APP_PID; pkill cloudflared; exit" INT TERM

# Run Cloudflare Tunnel (Using the new config)
cloudflared tunnel --config cloudflared_config.yml run ai-corp

# Shutdown sequence (if tunnel exits)
kill $APP_PID
echo -e "\nSystem Stopped."
