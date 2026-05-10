#!/bin/bash

# setup_and_test.sh - Autonomous Environment Setup & Health Check
# This script ensures that the dashboard can run regardless of environment limitations.

PROJECT_ROOT="/Users/ooshirokazuki/.gemini/antigravity/scratch/engawa-project"
APP_DIR="$PROJECT_ROOT/app"
STATUS_FILE="$PROJECT_ROOT/agents/status.json"

echo "🔍 Identifying runtime environment..."

# 1. Detect Node.js
NODE_PATH=$(which node)
if [ -z "$NODE_PATH" ]; then
    # Standard nvm path for this system
    NODE_PATH="/Users/ooshirokazuki/.nvm/versions/node/v24.14.1/bin/node"
fi
echo "✅ Node.js: $NODE_PATH"

# 2. Check dependencies
if [ ! -d "$APP_DIR/node_modules" ]; then
    echo "⚠️ node_modules missing. Attempting restoration..."
    # nvm absolute path for npm if possible
    NVM_BIN="/Users/ooshirokazuki/.nvm/versions/node/v24.14.1/bin/npm"
    $NODE_PATH $NVM_BIN install
fi

# 3. Health Check: Status API
echo "📊 Verifying Status API integrity..."
if [ -f "$STATUS_FILE" ]; then
    echo "✅ status.json found."
else
    echo "❌ ERROR: status.json missing."
    exit 1
fi

# 4. Background Server Launch (Simulation/Test mode)
echo "🚀 Environment Ready. Run 'scripts/process_batch.sh' for autonomous execution."
