import React, { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  id: string;
  content: string;
  type: 'user' | 'ai';
  timestamp: Date;
  codeGenerated?: string;
  filesModified?: Array<{
    nome: string;
    novoConteudo: string;
  }>;
  filesCreated?: Array<{
    nome: string;
    caminho: string;
    conteudo: string;
  }>;
  actions?: string[];
}

interface ChatIAProps {
  projectId?: number;
  fileId?: number;
  selectedCode?: string;
  language?: string;
}

export default function ChatIA({ projectId, fileId, selectedCode, language }: ChatIAProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: `Olá! Sou seu assistente de programação avançado em português. 

🚀 **Capacidades Completas:**
• Analisar toda a estrutura do seu projeto
• Modificar arquivos existentes automaticamente
• Criar novos arquivos e pastas
• Gerar código completo e funcional
• Refatorar código em múltiplos arquivos
• Corrigir bugs automaticamente
• Implementar funcionalidades completas
• Otimizar performance do código
• Adicionar documentação e comentários

**Exemplos do que posso fazer:**
📝 "Crie um sistema de login completo"
🔧 "Refatore este código para usar TypeScript"
🐛 "Encontre e corrija todos os bugs do projeto"
📁 "Analise a estrutura e sugira melhorias"
⚡ "Otimize a performance desta função"

**Como posso transformar seu projeto hoje?**`,
      type: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sugestões rápidas
  const quickSuggestions = [
    "Analise este código: // Arquivo de exemplo - IDE em Português...",
    "Crie uma função para calcular idade",
    "Adicione comentários explicativos ao código",
    "Refatore para usar async/await",
    "Encontre e corrija possíveis bugs",
    "Otimize a performance desta função"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputValue;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: textToSend,
      type: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ia/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mensagem: textToSend,
          projetoId: projectId,
          arquivoId: fileId,
          codigoSelecionado: selectedCode,
          linguagem: language,
          acessarPastas: true
        }),
      });

      const data = await response.json();

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: data.resposta || 'Desculpe, ocorreu um erro ao processar sua mensagem.',
        type: 'ai',
        timestamp: new Date(),
        codeGenerated: data.codigoGerado,
        filesModified: data.arquivosModificados,
        filesCreated: data.arquivosCriados,
        actions: data.acoes
      };

      setMessages(prev => [...prev, aiMessage]);

      // Mostrar notificação se arquivos foram modificados
      if (data.arquivosModificados?.length > 0 || data.arquivosCriados?.length > 0) {
        setTimeout(() => {
          const totalFiles = (data.arquivosModificados?.length || 0) + (data.arquivosCriados?.length || 0);
          alert(`✅ IA aplicou mudanças!\n${totalFiles} arquivo(s) foram atualizados/criados automaticamente.`);
        }, 1000);
      }

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: '❌ Erro ao conectar com o assistente. Verifique se a chave OPENAI_API_KEY está configurada corretamente.',
        type: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatContent = (content: string) => {
    // Destacar código com ```
    const codeRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = content.split(codeRegex);

    return parts.map((part, index) => {
      if (index % 3 === 2) { // É código
        return (
          <pre key={index} className="bg-gray-800 p-3 rounded mt-2 mb-2 overflow-x-auto">
            <code className="text-green-400 text-xs">{part}</code>
          </pre>
        );
      } else if (index % 3 === 1) {
        return null; // Linguagem do código
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 border-l border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <h3 className="text-white font-semibold">🤖 Assistente IA Avançado</h3>
        </div>
        <div className="flex items-center mt-2 text-xs text-gray-400">
          <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-900 text-green-300">
            ✅ OpenAI Configurado
          </span>
          {projectId && (
            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full bg-blue-900 text-blue-300">
              📁 Projeto {projectId}
            </span>
          )}
          {fileId && (
            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full bg-purple-900 text-purple-300">
              📄 Arquivo {fileId}
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[90%] rounded-lg p-4 ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-100'
              }`}
            >
              <div className="whitespace-pre-wrap text-sm">
                {message.type === 'ai' ? formatContent(message.content) : message.content}
              </div>

              {/* Código gerado */}
              {message.codeGenerated && (
                <div className="mt-3 p-3 bg-gray-800 rounded border-l-4 border-green-500">
                  <div className="text-xs text-green-400 mb-2">📄 Código Gerado:</div>
                  <pre className="text-xs text-green-300 overflow-x-auto">
                    <code>{message.codeGenerated}</code>
                  </pre>
                </div>
              )}

              {/* Arquivos modificados */}
              {message.filesModified && message.filesModified.length > 0 && (
                <div className="mt-3 p-3 bg-yellow-900 rounded border-l-4 border-yellow-500">
                  <div className="text-xs text-yellow-400 mb-2">
                    🔧 {message.filesModified.length} arquivo(s) modificado(s):
                  </div>
                  {message.filesModified.map((file, index) => (
                    <div key={index} className="text-xs text-yellow-300">
                      📝 {file.nome}
                    </div>
                  ))}
                </div>
              )}

              {/* Arquivos criados */}
              {message.filesCreated && message.filesCreated.length > 0 && (
                <div className="mt-3 p-3 bg-green-900 rounded border-l-4 border-green-500">
                  <div className="text-xs text-green-400 mb-2">
                    ✨ {message.filesCreated.length} arquivo(s) criado(s):
                  </div>
                  {message.filesCreated.map((file, index) => (
                    <div key={index} className="text-xs text-green-300">
                      📄 {file.nome} → {file.caminho}
                    </div>
                  ))}
                </div>
              )}

              {/* Ações realizadas */}
              {message.actions && message.actions.length > 0 && (
                <div className="mt-3 p-3 bg-blue-900 rounded border-l-4 border-blue-500">
                  <div className="text-xs text-blue-400 mb-2">⚡ Ações realizadas:</div>
                  {message.actions.map((action, index) => (
                    <div key={index} className="text-xs text-blue-300">
                      • {action}
                    </div>
                  ))}
                </div>
              )}

              <div className="text-xs opacity-70 mt-2 flex items-center">
                <span>
                  {message.timestamp.toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                {message.type === 'ai' && (
                  <span className="ml-2 text-green-400">🤖 GPT-4o</span>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 text-gray-100 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                <span className="text-sm">
                  <span className="animate-pulse">Assistente analisando projeto</span>
                  <span className="animate-bounce">...</span>
                </span>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Acessando arquivos • Processando código • Gerando resposta
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Sugestões rápidas */}
      {messages.length === 1 && (
        <div className="px-4 pb-2">
          <div className="text-xs text-gray-400 mb-2">💡 Sugestões rápidas:</div>
          <div className="grid grid-cols-1 gap-1">
            {quickSuggestions.slice(0, 3).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSendMessage(suggestion)}
                className="text-left text-xs p-2 bg-gray-800 hover:bg-gray-700 rounded border border-gray-600 transition-colors"
                disabled={isLoading}
              >
                <span className="text-gray-300">{suggestion}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-700 bg-gray-800">
        <div className="flex space-x-2">
          <div className="flex-1">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ex: 'Analise todo o projeto', 'Crie um sistema de login', 'Refatore este código'..."
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
              rows={2}
              disabled={isLoading}
            />
          </div>
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              '🚀'
            )}
          </button>
        </div>

        {/* Context info melhorado */}
        <div className="mt-3 flex items-center justify-between text-xs">
          <div className="text-gray-400">
            {selectedCode ? (
              <span className="text-yellow-400">📝 Código selecionado para análise</span>
            ) : (
              <span>🔍 IA tem acesso completo ao projeto</span>
            )}
          </div>
          <div className="text-gray-500">
            GPT-4o • Responde em português
          </div>
        </div>
      </div>
    </div>
  );
}