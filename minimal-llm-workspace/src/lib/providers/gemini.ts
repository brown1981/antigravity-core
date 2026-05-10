import { NextResponse } from "next/server";
import { LLMProvider } from "./index";

export class GeminiProvider implements LLMProvider {
  canHandle(modelId: string): boolean {
    return modelId.startsWith("gemini");
  }

  async handleRequest(
    model: string,
    messages: any[],
    imageData: { mimeType: string; base64Data: string } | null,
    customInstructions: string | undefined,
    keys: { geminiKey?: string },
    requestId: string
  ): Promise<Response> {
    console.log(`[API:${requestId}] Routing to Gemini...`);
    
    if (!keys.geminiKey) {
      return NextResponse.json({ error: "Google API Key is required" }, { status: 401 });
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    
    const geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: { "x-goog-api-key": keys.geminiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        ...(customInstructions ? { systemInstruction: { parts: [{ text: customInstructions }] } } : {}),
        contents: messages.map((m: any, idx: number) => {
          const isLastMessage = idx === messages.length - 1;
          const parts = [];
          if (isLastMessage && imageData) {
            parts.push({ inline_data: { mime_type: imageData.mimeType, data: imageData.base64Data } });
          }
          const textContent = (m.content || "").replace(/data:image\/[^;]+;base64,[^ \n]+/, "").trim();
          parts.push({ text: textContent });
          return { role: m.role === "assistant" ? "model" : "user", parts };
        }),
        generationConfig: { temperature: 0.7, maxOutputTokens: 4096 }
      }),
    });

    const data = await geminiResponse.json();
    console.log(`[API:${requestId}] Gemini Status: ${geminiResponse.status}`);
    
    if (!geminiResponse.ok) {
      throw new Error(data.error?.message || `Gemini Error ${geminiResponse.status}`);
    }

    const assistantText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!assistantText) {
      throw new Error("No response generated from Gemini");
    }

    return NextResponse.json({
      id: `gemini-${Date.now()}`,
      role: "assistant",
      content: assistantText,
      createdAt: new Date().toISOString()
    });
  }
}
