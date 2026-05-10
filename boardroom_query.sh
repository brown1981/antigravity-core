#!/bin/bash
PROJECT_ROOT="/Users/ooshirokazuki2/.gemini/antigravity/scratch"
cd "$PROJECT_ROOT" || exit 1
source .env 2>/dev/null

QUERY=${1:-"Antigravity v3.5 プロトコル：1.5兆パラメータ艦隊を起動せよ。Macリソースを完全解放し、知能をクラウドへ移行した今、我々が次に目指すべき『絶対的な勝利』へのロードマップを提示せよ。"}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTPUT_DIR="./archives/ghost_fleet_$TIMESTAMP"
mkdir -p "$OUTPUT_DIR"
rm -f ./archives/ghost_audit_latest
ln -s "$OUTPUT_DIR" ./archives/ghost_audit_latest
LOG_FILE="$OUTPUT_DIR/boardroom.log"

echo "🌪️ ANTIGRAVITY GHOST-FLEET DEPLOYING (FIXED)..." | tee -a "$LOG_FILE"

ROLES=("Kikou" "Shinbou" "Hyoujin" "Zero" "Librarian")
PRIMARY_MODELS=(
  "nvidia/nemotron-3-super-120b-a12b:free"
  "llama-3.3-70b-versatile"
  "openai/gpt-oss-120b:free"
  "inclusionai/ling-2.6-1t:free"
  "tencent/hy3-preview:free"
)
STABLE_BACKUP="llama-3.3-70b-versatile"

for i in "${!ROLES[@]}"; do
    ROLE=${ROLES[$i]}
    MODEL=${PRIMARY_MODELS[$i]}
    
    # Mac互換の小文字変換
    ROLE_LOWER=$(echo "$ROLE" | tr '[:upper:]' '[:lower:]')
    
    echo "👥 Calling $ROLE ($MODEL)..."
    PERSONALITY=$(cat "./agents/${ROLE_LOWER}.txt" 2>/dev/null | tr '\n' ' ')
    FULL_PROMPT="${PERSONALITY}\n\n【問い】\n${QUERY}"

    if [[ "$MODEL" == *"versatile"* ]]; then
        # Groq (Stable)
        JSON_PAYLOAD=$(jq -n --arg m "$MODEL" --arg c "$FULL_PROMPT" '{model: $m, messages: [{role: "user", content: $c}]}')
        RESPONSE=$(curl -s -X POST "https://api.groq.com/openai/v1/chat/completions" \
          -H "Authorization: Bearer $GROQ_API_KEY" -H "Content-Type: application/json" \
          -d "$JSON_PAYLOAD")
    else
        # OpenRouter (Monster)
        JSON_PAYLOAD=$(jq -n --arg m "$MODEL" --arg c "$FULL_PROMPT" '{model: $m, messages: [{role: "user", content: $c}]}')
        RESPONSE=$(curl -s -X POST "https://openrouter.ai/api/v1/chat/completions" \
          -H "Authorization: Bearer $OPENROUTER_API_KEY" -H "Content-Type: application/json" \
          -d "$JSON_PAYLOAD")
    fi

    CONTENT=$(echo "$RESPONSE" | jq -r '.choices[0].message.content // empty')

    if [ -z "$CONTENT" ] || [ "$CONTENT" == "null" ]; then
        echo "⚠️ $ROLE ($MODEL) failed. Switching to Stable Backup ($STABLE_BACKUP)..." | tee -a "$LOG_FILE"
        JSON_PAYLOAD=$(jq -n --arg m "$STABLE_BACKUP" --arg c "$FULL_PROMPT" '{model: $m, messages: [{role: "user", content: $c}]}')
        RESPONSE=$(curl -s -X POST "https://api.groq.com/openai/v1/chat/completions" \
          -H "Authorization: Bearer $GROQ_API_KEY" -H "Content-Type: application/json" \
          -d "$JSON_PAYLOAD")
        CONTENT=$(echo "$RESPONSE" | jq -r '.choices[0].message.content // empty')
        USED_MODEL="$STABLE_BACKUP (Fallback)"
    else
        USED_MODEL="$MODEL"
    fi

    echo -e "\n### [$ROLE] の回答 ($USED_MODEL):\n" >> "$LOG_FILE"
    echo "$CONTENT" >> "$LOG_FILE"
    echo "✅ $ROLE responded."
done

echo "-----------------------------------" | tee -a "$LOG_FILE"
cat "$LOG_FILE"
