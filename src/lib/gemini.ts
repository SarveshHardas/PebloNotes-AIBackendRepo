import { GoogleGenerativeAI, GenerationConfig, SafetySetting } from "@google/generative-ai";

export const GEMINI_CONFIG = {
  defaultModel: "gemini-2.5-flash", 
  
  defaultGenerationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 2048,
  } as GenerationConfig,

  safetySettings: [] as SafetySetting[],
};

let genAIClient: GoogleGenerativeAI | null = null;

export function getGeminiClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error(
      "[AI SDK Initialization Error]: GEMINI_API_KEY is not configured in the environment variables. " +
      "Please establish this token to enable generative functionalities."
    );
  }

  if (!genAIClient) {
    genAIClient = new GoogleGenerativeAI(apiKey);
  }

  return genAIClient;
}

export interface AIServiceOptions {
  modelName?: string;
  temperature?: number;
  maxOutputTokens?: number;
  systemInstruction?: string;
  responseMimeType?: string;
}

/**
 * Centralized Server-Side Core Helper to execute basic Generative text operations.
 * Provides error masking and consistent structures to avoid messy boilerplate across route handlers.
 * 
 * @param prompt - The dynamic main context sent to the prompt runtime.
 * @param options - Extensible parameters covering temperatures, system rules, and models.
 * @returns Resolves strictly to the generated text output.
 */
export async function generateText(
  prompt: string,
  options: AIServiceOptions = {}
): Promise<string> {
  try {
    const client = getGeminiClient();
    const modelName = options.modelName || GEMINI_CONFIG.defaultModel;

    const model = client.getGenerativeModel({
      model: modelName,
      systemInstruction: options.systemInstruction,
      safetySettings: GEMINI_CONFIG.safetySettings,
    });

    const generationConfig: GenerationConfig = {
      ...GEMINI_CONFIG.defaultGenerationConfig,
      temperature: options.temperature ?? GEMINI_CONFIG.defaultGenerationConfig.temperature,
      maxOutputTokens: options.maxOutputTokens ?? GEMINI_CONFIG.defaultGenerationConfig.maxOutputTokens,
      responseMimeType: options.responseMimeType,
    };

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
    });

    const response = result.response;
    const text = response.text();

    if (!text) {
      throw new Error("Inference succeeded but returned an empty content payload.");
    }

    return text;
  } catch (error: any) {
    console.error("[GEMINI_AI_INFRASTRUCTURE_EXCEPTION]:", {
      message: error?.message || "Unknown Gemini API exception encountered",
      promptSnippet: prompt.substring(0, 60) + "...",
      timestamp: new Date().toISOString(),
    });

    throw new Error(
      `AI Processing Fault: ${
        error instanceof Error ? error.message : "Generative system failed to compile result."
      }`
    );
  }
}
