#!/bin/bash

# process_batch.sh - Autonomous Task Execution Loop
# This script picks pending tasks, assigns agents, and updates the dashboard.

PROJECT_ROOT="/Users/ooshirokazuki/.gemini/antigravity/scratch/engawa-project"
BATCH_DIR="$PROJECT_ROOT/batch_tasks"
COMPLETED_DIR="$PROJECT_ROOT/batch_tasks/completed"
SCRIPT_DIR="$PROJECT_ROOT/scripts"
NODE_BIN="/Users/ooshirokazuki/.nvm/versions/node/v24.14.1/bin/node"

mkdir -p "$COMPLETED_DIR"

# 1. Detect pending tasks
TASKS=$(ls "$BATCH_DIR"/*.md 2>/dev/null | grep -v "README.md")

if [ -z "$TASKS" ]; then
    echo "📭 No tasks in queue."
    exit 0
fi

for TASK_FILE in $TASKS; do
    FILENAME=$(basename "$TASK_FILE")
    
    # 2. Assign Agent (Determined by filename prefix, e.g., cmo_task.md)
    AGENT="cmo" # Default to CMO for demo
    if [[ "$FILENAME" == ceo* ]]; then AGENT="ceo"; fi
    if [[ "$FILENAME" == cfo* ]]; then AGENT="cfo"; fi
    if [[ "$FILENAME" == cto* ]]; then AGENT="cto"; fi
    if [[ "$FILENAME" == coo* ]]; then AGENT="coo"; fi

    echo "⚡️ Executing $FILENAME with $AGENT agent..."

    # 3. Update Dashboard & Execute with Brain
    $NODE_BIN "$SCRIPT_DIR/agent_brain.js" "$AGENT"
    
    # 4. Simulate Work/IO (Archive Task)
    mv "$TASK_FILE" "$COMPLETED_DIR/"
    
    echo "✅ $FILENAME processed successfully with $AGENT brain."
done

echo "🏁 All tasks in current queue completed."
