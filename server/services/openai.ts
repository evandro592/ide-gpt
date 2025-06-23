import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface CodeAnalysisResult {
  suggestions: string[];
  improvements: string[];
  issues: string[];
  rating: number;
}

export interface ChatResponse {
  message: string;
  suggestions?: string[];
  codeSnippet?: string;
}

export async function analyzeCode(code: string, language: string = "javascript"): Promise<CodeAnalysisResult> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a senior software engineer providing code analysis. Analyze the ${language} code and provide structured feedback. Respond with JSON in this format: { "suggestions": ["suggestion1", "suggestion2"], "improvements": ["improvement1", "improvement2"], "issues": ["issue1", "issue2"], "rating": number_from_1_to_10 }`
        },
        {
          role: "user",
          content: `Please analyze this ${language} code:\n\n${code}`
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      suggestions: result.suggestions || [],
      improvements: result.improvements || [],
      issues: result.issues || [],
      rating: Math.max(1, Math.min(10, result.rating || 5))
    };
  } catch (error) {
    throw new Error("Failed to analyze code: " + (error as Error).message);
  }
}

export async function chatWithAI(message: string, context?: string): Promise<ChatResponse> {
  try {
    const systemMessage = context 
      ? `You are an AI coding assistant. Help with code analysis, debugging, and suggestions. Current context: ${context}`
      : "You are an AI coding assistant. Help with code analysis, debugging, and suggestions.";

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemMessage
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 1000,
    });

    return {
      message: response.choices[0].message.content || "I apologize, but I couldn't process your request.",
    };
  } catch (error) {
    throw new Error("Failed to chat with AI: " + (error as Error).message);
  }
}

export async function generateCode(prompt: string, language: string = "javascript"): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a code generation expert. Generate clean, well-documented ${language} code based on the user's requirements.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    throw new Error("Failed to generate code: " + (error as Error).message);
  }
}

export async function explainCode(code: string, language: string = "javascript"): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a code documentation expert. Explain what the provided ${language} code does in clear, simple terms.`
        },
        {
          role: "user",
          content: `Please explain this ${language} code:\n\n${code}`
        }
      ],
      max_tokens: 1000,
    });

    return response.choices[0].message.content || "Unable to explain the code.";
  } catch (error) {
    throw new Error("Failed to explain code: " + (error as Error).message);
  }
}
