import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const apiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR;
if (!apiKey) {
  throw new Error("OPENAI_API_KEY is not set in environment variables");
}

const openai = new OpenAI({
  apiKey: apiKey as string
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
      ? `Você é um assistente de programação IA em português. Ajude com análise de código, debugging e sugestões. Sempre forneça respostas práticas e aplicáveis. Contexto: ${context}`
      : "Você é um assistente de programação IA em português. Ajude com análise de código, debugging e sugestões. Seja conciso e prático.";

    const response = await openai.chat.completions.create({
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemMessage + "\n\nQuando fornecer código, sempre inclua dentro de blocos ```codigo``` para que possa ser aplicado automaticamente no editor."
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 1200,
      temperature: 0.7,
    });

    const content = response.choices[0].message.content || "Desculpe, não consegui processar sua solicitação.";
    
    // Extrair snippet de código se houver
    const codeBlockRegex = /```(?:[\w]*\n)?([\s\S]*?)\n```/g;
    const codeMatch = codeBlockRegex.exec(content);
    const codeSnippet = codeMatch ? codeMatch[1].trim() : null;

    return {
      message: content,
      codeSnippet: codeSnippet,
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
