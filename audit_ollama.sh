#!/bin/bash

# ANTIGRAVITY: BOARDROOM_FINAL_BLITZ v1.0
# ---------------------------------------
# This script calls 6 specific models for the ultimate rethink of Antigravity.

OUTPUT_DIR="./archives/boardroom_rethink_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$OUTPUT_DIR"

echo "🌪️ ANTIGRAVITY BOARDROOM: ALL-NODE INVOCATION STARTING..."
echo "-----------------------------------"

# Role-Model Mapping
ROLES=("Kikou" "Shinbou" "Hyoujin" "Zero" "Librarian" "Antigravity")
MODELS=("gpt-oss:20b" "gemma4:31b" "mistral-small:22b" "phi4:latest" "qwen2.5:14b" "deepseek-v4-pro:cloud")
PROMPTS=(
"あなたは技術ノード『機巧』。高額クラウドも複雑な設定も避ける『第三の道』のための軽量な技術設計を提案せよ。"
"あなたは戦略ハブ『深謀』。6名のAIは重すぎるか？司令官との最小ノイズでの戦略的関係を再定義せよ。"
"あなたは統治ノード『氷刃』。15アプリの分離を捨て、スマートで統合された新しい統治規則を提案せよ。"
"あなたは論理ノード『零』。無駄を排した『Zero Waste』な最小限の知能構成（核）を計算し提示せよ。"
"あなたは記憶ノード『司書』。重いログを捨て、司令官に必要な時だけ情報を出すステルス型記憶管理を提案せよ。"
"あなたは総監督。指揮者ではなく『Ghost in the Shell』のような自律型支援の在り方を提案せよ。"
)

for i in "${!ROLES[@]}"; do
    ROLE=${ROLES[$i]}
    MODEL=${MODELS[$i]}
    PROMPT=${PROMPTS[$i]}
    
    echo "👥 Calling $ROLE ($MODEL)..."
    # Ollamaを通じて各モデルに問いかける
    echo "$PROMPT" | ollama run "$MODEL" > "$OUTPUT_DIR/${ROLE}_report.txt"
    echo "✅ $ROLE report saved."
    echo "-----------------------------------"
done

echo "🏁 ALL NODES RESPONDED. Results: $OUTPUT_DIR"
