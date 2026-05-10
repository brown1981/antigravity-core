#!/bin/bash
PROJECT_ROOT="/Users/ooshirokazuki2/.gemini/antigravity/scratch"
cd "$PROJECT_ROOT" || exit 1
if [ -f .env ]; then source .env; fi

QUERY="Antigravity v3.5 Step 1: Neural-Bridge (Python Gateway) の完全なソースコード。aiohttp, 指示キューイング, ./archives/bridge.log 出力を実装せよ。"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTPUT_DIR="./archives/bridge_$TIMESTAMP"
mkdir -p "$OUTPUT_DIR"
LOG_FILE="$OUTPUT_DIR/discussion_process.log"

ROLES=("Kikou" "Shinbou" "Hyoujin" "Zero" "Librarian")
MODELS=("llama-3.3-70b-versatile" "llama-3.3-70b-versatile" "llama-3.3-70b-versatile" "llama-3.1-8b-instant" "llama-3.3-70b-versatile")

ROUND_LOG=""
for i in "${!ROLES[@]}"; do
    ROLE=${ROLES[$i]}
    MODEL=${MODELS[$i]}
    ROLE_LOWER=$(echo "$ROLE" | tr '[:upper:]' '[:lower:]')
    PERSONALITY=$(cat "./agents/${ROLE_LOWER}.txt" 2>/dev/null || echo "Strategic AI")
    
    PROMPT="PERSONALITY: $PERSONALITY\n\nTASK: $QUERY\n\nCURRENT DEBATE: $ROUND_LOG\n\nProvide technical Python code."
    JSON_PAYLOAD=$(jq -n --arg m "$MODEL" --arg c "$PROMPT" '{model: $m, messages: [{role: "user", content: $c}]}')
    
    # -4 を追加してIPv4を強制
    RESPONSE=$(curl -4 -s -X POST "https://api.groq.com/openai/v1/chat/completions" \
      -H "Authorization: Bearer $GROQ_API_KEY" -H "Content-Type: application/json" \
      -d "$JSON_PAYLOAD")
    
    ANSWER=$(echo "$RESPONSE" | jq -r '.choices[0].message.content // empty')
    ROUND_LOG="$ROUND_LOG\n\n[$ROLE]: $ANSWER"
    echo "✅ $ROLE responded."
done

# 最終統合
echo "⚖️ Synthesizing Final Code..."
CHECK_PROMPT="あなたは総監督です。議論を統合し、最高品質の 'neural_bridge.py' コードブロックのみを出力せよ。最後に 'FINAL_CONSENSUS_REACHED' と書け。\n\n$ROUND_LOG"
JSON_PAYLOAD=$(jq -n --arg m "llama-3.3-70b-versatile" --arg c "$CHECK_PROMPT" '{model: $m, messages: [{role: "user", content: $c}]}')
FINAL_CODE=$(curl -4 -s -X POST "https://api.groq.com/openai/v1/chat/completions" \
  -H "Authorization: Bearer $GROQ_API_KEY" -H "Content-Type: application/json" \
  -d "$JSON_PAYLOAD" | jq -r '.choices[0].message.content')

echo "$ROUND_LOG" > "$LOG_FILE"
echo "$FINAL_CODE" > "$OUTPUT_DIR/neural_bridge.py"
echo "🏁 MISSION COMPLETE. Result: $OUTPUT_DIR/neural_bridge.py"
