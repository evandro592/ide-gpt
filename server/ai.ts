import OpenAI from "openai";
import { storage } from "./storage";
import path from "path";
import fs from "fs/promises";

let openai: OpenAI | null = null;

if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export interface AIRequest {
  mensagem: string;
  projetoId?: number;
  arquivoId?: number;
  codigoSelecionado?: string;
  linguagem?: string;
}

export interface AIResponse {
  resposta: string;
  codigoGerado?: string;
  arquivosModificados?: {
    id: number;
    nome: string;
    novoConteudo: string;
  }[];
  acoes?: string[];
}

export class AssistenteIA {
  async processarMensagem(request: AIRequest): Promise<AIResponse> {
    if (!openai) {
      return {
        resposta: "Assistente IA não está configurado. Por favor, configure a chave OPENAI_API_KEY.",
      };
    }

    try {
      // Coletar contexto do projeto se fornecido
      let contexto = "";
      
      if (request.projetoId) {
        const projeto = await storage.getProject(request.projetoId);
        if (projeto) {
          contexto += `\n## Projeto Atual: ${projeto.name}\n`;
          contexto += `Descrição: ${projeto.description || 'Sem descrição'}\n`;
          contexto += `Linguagem: ${projeto.language}\n`;
          
          // Buscar arquivos do projeto
          const arquivos = await storage.getFiles(request.projetoId);
          if (arquivos.length > 0) {
            contexto += "\n## Estrutura do Projeto:\n";
            for (const arquivo of arquivos) {
              contexto += `- ${arquivo.name} (${arquivo.type})\n`;
              if (arquivo.content && arquivo.content.length < 2000) {
                contexto += `  Conteúdo:\n\`\`\`${arquivo.language || 'text'}\n${arquivo.content}\n\`\`\`\n`;
              }
            }
          }
        }
      }

      if (request.arquivoId) {
        const arquivo = await storage.getFile(request.arquivoId);
        if (arquivo) {
          contexto += `\n## Arquivo Atual: ${arquivo.name}\n`;
          contexto += `\`\`\`${arquivo.language || 'text'}\n${arquivo.content || ''}\n\`\`\`\n`;
        }
      }

      if (request.codigoSelecionado) {
        contexto += `\n## Código Selecionado:\n`;
        contexto += `\`\`\`${request.linguagem || 'text'}\n${request.codigoSelecionado}\n\`\`\`\n`;
      }

      const prompt = this.construirPrompt(request.mensagem, contexto);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // o modelo mais recente do OpenAI lançado em 13 de maio de 2024
        messages: [
          {
            role: "system",
            content: `Você é um assistente de programação especializado em desenvolvimento web. 
            Você pode analisar, gerar e modificar código. Sempre responda em português brasileiro.
            
            Quando solicitado para modificar código:
            1. Analise o código existente
            2. Implemente as mudanças necessárias
            3. Explique o que foi alterado
            4. Forneça o código completo modificado
            
            Responda sempre em JSON no formato:
            {
              "resposta": "sua explicação em português",
              "codigoGerado": "código gerado ou modificado (se aplicável)",
              "arquivosModificados": [
                {
                  "nome": "nome do arquivo",
                  "novoConteudo": "conteúdo completo do arquivo"
                }
              ],
              "acoes": ["lista de ações realizadas"]
            }`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const resultado = JSON.parse(response.choices[0].message.content || '{}');
      
      // Se há arquivos para modificar, atualizá-los no banco
      if (resultado.arquivosModificados && request.projetoId) {
        for (const arquivoMod of resultado.arquivosModificados) {
          const arquivoExistente = await storage.getFileByPath(request.projetoId, arquivoMod.nome);
          if (arquivoExistente) {
            await storage.updateFile(arquivoExistente.id, {
              content: arquivoMod.novoConteudo,
              size: arquivoMod.novoConteudo.length
            });
          }
        }
      }

      return resultado;
    } catch (error) {
      console.error("Erro no assistente IA:", error);
      return {
        resposta: `Erro no processamento: ${error.message}`,
      };
    }
  }

  private construirPrompt(mensagem: string, contexto: string): string {
    let prompt = `Como assistente de programação, preciso ajudar com: ${mensagem}\n`;
    
    if (contexto) {
      prompt += `\nContexto do projeto:${contexto}\n`;
    }
    
    prompt += `\nPor favor, analise a solicitação e forneça uma resposta detalhada em português brasileiro.
    Se for necessário modificar código, inclua o código completo modificado.`;
    
    return prompt;
  }

  async analisarCodigo(codigo: string, linguagem: string): Promise<string> {
    if (!openai) {
      return "Assistente IA não configurado";
    }

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Você é um especialista em análise de código. Analise o código fornecido e identifique possíveis melhorias, bugs, e problemas de performance. Responda em português brasileiro."
          },
          {
            role: "user",
            content: `Analise este código ${linguagem}:\n\n\`\`\`${linguagem}\n${codigo}\n\`\`\``
          }
        ],
      });

      return response.choices[0].message.content || "Não foi possível analisar o código";
    } catch (error) {
      return `Erro na análise: ${error.message}`;
    }
  }

  async gerarCodigo(descricao: string, linguagem: string): Promise<string> {
    if (!openai) {
      return "// Assistente IA não configurado";
    }

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Você é um especialista em programação ${linguagem}. Gere código limpo, bem comentado e seguindo as melhores práticas. Responda apenas com o código, sem explicações adicionais.`
          },
          {
            role: "user",
            content: `Gere código ${linguagem} para: ${descricao}`
          }
        ],
      });

      return response.choices[0].message.content || `// Não foi possível gerar código para: ${descricao}`;
    } catch (error) {
      return `// Erro na geração: ${error.message}`;
    }
  }
}

export const assistenteIA = new AssistenteIA();