
import OpenAI from "openai";
import { storage } from "./storage";
import path from "path";
import fs from "fs/promises";
import { glob } from "glob";

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
  acessarPastas?: boolean;
}

export interface AIResponse {
  resposta: string;
  codigoGerado?: string;
  arquivosModificados?: {
    id: number;
    nome: string;
    novoConteudo: string;
  }[];
  arquivosCriados?: {
    nome: string;
    caminho: string;
    conteudo: string;
  }[];
  acoes?: string[];
  estruturaProjeto?: any;
}

export class AssistenteIA {
  async processarMensagem(request: AIRequest): Promise<AIResponse> {
    if (!openai) {
      return {
        resposta: "Assistente IA não está configurado. Configure OPENAI_API_KEY para usar a funcionalidade completa.",
      };
    }

    try {
      // Coletar contexto completo do projeto
      let contexto = "";
      
      if (request.projetoId) {
        const projeto = await storage.getProject(request.projetoId);
        if (projeto) {
          contexto += `\n## Projeto Atual: ${projeto.name}\n`;
          contexto += `Descrição: ${projeto.description || 'Sem descrição'}\n`;
          contexto += `Linguagem: ${projeto.language}\n`;
          contexto += `Caminho: ${projeto.path}\n`;
          
          // Buscar TODOS os arquivos do projeto com estrutura completa
          const arquivos = await storage.getFiles(request.projetoId);
          if (arquivos.length > 0) {
            contexto += "\n## Estrutura Completa do Projeto:\n";
            
            // Organizar arquivos por pastas
            const estrutura = this.organizarEstruturaProjeto(arquivos);
            contexto += this.formatarEstrutura(estrutura);
            
            // Incluir conteúdo de todos os arquivos
            contexto += "\n## Conteúdo dos Arquivos:\n";
            for (const arquivo of arquivos) {
              contexto += `\n### ${arquivo.name} (${arquivo.language || arquivo.type})\n`;
              contexto += `Caminho: ${arquivo.path}\n`;
              if (arquivo.content) {
                contexto += `\`\`\`${arquivo.language || 'text'}\n${arquivo.content}\n\`\`\`\n`;
              } else {
                contexto += "*Arquivo vazio*\n";
              }
            }
          }
        }
      }

      // Incluir arquivo específico se selecionado
      if (request.arquivoId) {
        const arquivo = await storage.getFile(request.arquivoId);
        if (arquivo) {
          contexto += `\n## Arquivo Atual em Edição: ${arquivo.name}\n`;
          contexto += `Caminho: ${arquivo.path}\n`;
          contexto += `Linguagem: ${arquivo.language || arquivo.type}\n`;
          contexto += `\`\`\`${arquivo.language || 'text'}\n${arquivo.content || ''}\n\`\`\`\n`;
        }
      }

      // Incluir código selecionado
      if (request.codigoSelecionado) {
        contexto += `\n## Código Selecionado para Análise:\n`;
        contexto += `\`\`\`${request.linguagem || 'text'}\n${request.codigoSelecionado}\n\`\`\`\n`;
      }

      const prompt = this.construirPrompt(request.mensagem, contexto);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Você é um assistente de programação avançado com acesso COMPLETO ao sistema de arquivos e estrutura do projeto.

            Capacidades:
            - Analisar toda a estrutura do projeto
            - Modificar arquivos existentes
            - Criar novos arquivos e pastas
            - Refatorar código em múltiplos arquivos
            - Implementar funcionalidades completas
            - Corrigir bugs em todo o projeto
            - Otimizar performance
            - Adicionar documentação
            - Configurar ferramentas de desenvolvimento

            Você pode ver e editar TODOS os arquivos do projeto. Use essas informações para dar respostas precisas.

            SEMPRE responda em português brasileiro.
            
            Formato de resposta JSON:
            {
              "resposta": "explicação detalhada em português",
              "codigoGerado": "código principal gerado (se aplicável)",
              "arquivosModificados": [
                {
                  "nome": "nome do arquivo",
                  "novoConteudo": "conteúdo COMPLETO do arquivo modificado"
                }
              ],
              "arquivosCriados": [
                {
                  "nome": "nome do novo arquivo",
                  "caminho": "caminho/para/arquivo",
                  "conteudo": "conteúdo completo do novo arquivo"
                }
              ],
              "acoes": ["lista detalhada de ações realizadas"],
              "estruturaProjeto": "análise da estrutura se solicitado"
            }`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 4096,
      });

      const resultado = JSON.parse(response.choices[0].message.content || '{}');
      
      // Aplicar mudanças no banco de dados
      if (request.projetoId) {
        // Atualizar arquivos modificados
        if (resultado.arquivosModificados) {
          for (const arquivoMod of resultado.arquivosModificados) {
            const arquivoExistente = await storage.getFileByPath(request.projetoId, arquivoMod.nome);
            if (arquivoExistente) {
              await storage.updateFile(arquivoExistente.id, {
                content: arquivoMod.novoConteudo,
                size: arquivoMod.novoConteudo.length,
              });
            }
          }
        }

        // Criar novos arquivos
        if (resultado.arquivosCriados) {
          for (const novoArquivo of resultado.arquivosCriados) {
            await storage.createFile({
              name: novoArquivo.nome,
              path: novoArquivo.caminho,
              content: novoArquivo.conteudo,
              type: "file",
              language: this.detectarLinguagem(novoArquivo.nome),
              size: novoArquivo.conteudo.length,
              projectId: request.projetoId,
            });
          }
        }
      }

      return resultado;
    } catch (error) {
      console.error("Erro no assistente IA:", error);
      return {
        resposta: `Erro no processamento: ${error.message}. Verifique se a chave OPENAI_API_KEY está configurada.`,
      };
    }
  }

  private organizarEstruturaProjeto(arquivos: any[]): any {
    const estrutura: any = {};
    
    for (const arquivo of arquivos) {
      const partes = arquivo.path.split('/').filter(Boolean);
      let atual = estrutura;
      
      for (let i = 0; i < partes.length - 1; i++) {
        const pasta = partes[i];
        if (!atual[pasta]) {
          atual[pasta] = {};
        }
        atual = atual[pasta];
      }
      
      const nomeArquivo = partes[partes.length - 1] || arquivo.name;
      atual[nomeArquivo] = {
        tipo: 'arquivo',
        linguagem: arquivo.language,
        tamanho: arquivo.size,
        id: arquivo.id
      };
    }
    
    return estrutura;
  }

  private formatarEstrutura(estrutura: any, nivel = 0): string {
    let resultado = "";
    const indent = "  ".repeat(nivel);
    
    for (const [nome, item] of Object.entries(estrutura)) {
      if (item && typeof item === 'object' && item.tipo === 'arquivo') {
        resultado += `${indent}📄 ${nome} (${item.linguagem || 'texto'})\n`;
      } else {
        resultado += `${indent}📁 ${nome}/\n`;
        if (item && typeof item === 'object') {
          resultado += this.formatarEstrutura(item, nivel + 1);
        }
      }
    }
    
    return resultado;
  }

  private detectarLinguagem(nomeArquivo: string): string {
    const extensao = path.extname(nomeArquivo).toLowerCase();
    const mapeamento: { [key: string]: string } = {
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.py': 'python',
      '.html': 'html',
      '.css': 'css',
      '.scss': 'scss',
      '.json': 'json',
      '.md': 'markdown',
      '.yml': 'yaml',
      '.yaml': 'yaml',
      '.xml': 'xml',
      '.php': 'php',
      '.java': 'java',
      '.cpp': 'cpp',
      '.c': 'c',
      '.go': 'go',
      '.rs': 'rust',
      '.rb': 'ruby',
      '.sql': 'sql',
    };
    
    return mapeamento[extensao] || 'text';
  }

  private construirPrompt(mensagem: string, contexto: string): string {
    let prompt = `Como assistente de programação com acesso COMPLETO ao projeto, preciso ajudar com: ${mensagem}\n`;
    
    if (contexto) {
      prompt += `\nCONTEXTO COMPLETO DO PROJETO:${contexto}\n`;
    }
    
    prompt += `\nCom base no contexto completo acima, analise a solicitação e:
    1. Entenda o que precisa ser feito
    2. Identifique quais arquivos precisam ser modificados ou criados
    3. Implemente as mudanças necessárias
    4. Forneça explicações claras sobre as alterações
    5. Garanta que o código funcione corretamente no contexto do projeto
    
    Você tem acesso total ao projeto - use essas informações para dar a melhor resposta possível.`;
    
    return prompt;
  }

  async analisarCodigo(codigo: string, linguagem: string): Promise<string> {
    if (!openai) {
      return "Assistente IA não configurado. Configure OPENAI_API_KEY.";
    }

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Você é um especialista em análise de código. Analise o código fornecido e identifique possíveis melhorias, bugs, problemas de performance, e oportunidades de refatoração. Responda em português brasileiro com sugestões práticas."
          },
          {
            role: "user",
            content: `Analise este código ${linguagem} e forneça feedback detalhado:\n\n\`\`\`${linguagem}\n${codigo}\n\`\`\``
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
      return "// Assistente IA não configurado. Configure OPENAI_API_KEY.";
    }

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Você é um especialista em programação ${linguagem}. Gere código limpo, bem comentado, seguindo as melhores práticas e padrões modernos. Inclua comentários explicativos em português.`
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
