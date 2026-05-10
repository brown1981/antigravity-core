export interface LLMProvider {
  /**
   * Identifies the provider based on the model ID prefix.
   */
  canHandle(modelId: string): boolean;

  /**
   * Processes the chat request and returns a complete HTTP Response (JSON or Stream).
   */
  handleRequest(
    model: string,
    messages: any[],
    imageData: { mimeType: string; base64Data: string } | null,
    customInstructions: string | undefined,
    keys: {
      openaiKey?: string;
      anthropicKey?: string;
      geminiKey?: string;
      searchKey?: string;
    },
    requestId: string
  ): Promise<Response>;
}
