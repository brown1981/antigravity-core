#!/bin/bash
source .env
echo "Testing Groq API with Llama 3.3 70B..."
curl -v -X POST "https://api.groq.com/openai/v1/chat/completions" \
  -H "Authorization: Bearer $GROQ_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama-3.3-70b-versatile",
    "messages": [{"role": "user", "content": "Hello, this is a test from Antigravity."}]
  }' 2>&1 | tee api_test_log.txt
