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

  // Escutar eventos de análise do editor
  useEffect(() => {
    const handleChatMessage = (event: any) => {
      const { resposta, codigoGerado, arquivosModificados } = event.detail;
      
      const aiMessage: ChatMessage = {
        id: Date.now().toString(),
        content: resposta,
        type: 'ai',
        timestamp: new Date(),
        codeGenerated: codigoGerado,
        filesModified: arquivosModificados
      };

      setMessages(prev => [...prev, aiMessage]);
    };

    window.addEventListener('chatIAMessage', handleChatMessage);
    return () => window.removeEventListener('chatIAMessage', handleChatMessage);
  }, []);

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
      {/* Header - Altura fixa */}
      <div className="flex-shrink-0 p-2 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <h3 className="text-white font-semibold text-xs">🤖 Assistente IA</h3>
        </div>
        <div className="flex items-center mt-1 text-xs text-gray-400 flex-wrap gap-1">
          <span className="inline-flex items-center px-1 py-0.5 rounded bg-green-900 text-green-300 text-xs">
            ✅ OpenAI
          </span>
          {projectId && (
            <span className="inline-flex items-center px-1 py-0.5 rounded bg-blue-900 text-blue-300 text-xs">
              📁 P{projectId}
            </span>
          )}
        </div>
      </div>

      {/* Messages - Área rolável com altura calculada */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-2">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[95%] rounded-lg p-2 ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-100'
              }`}
            >
              <div className="whitespace-pre-wrap text-xs break-words">
                {message.type === 'ai' ? formatContent(message.content) : message.content}
              </div>

              {/* Código gerado */}
              {message.codeGenerated && (
                <div className="mt-2 p-2 bg-gray-800 rounded border-l-4 border-green-500">
                  <div className="text-xs text-green-400 mb-1">📄 Código Gerado:</div>
                  <pre className="text-xs text-green-300 overflow-x-auto">
                    <code>{message.codeGenerated}</code>
                  </pre>
                </div>
              )}

              {/* Arquivos modificados */}
              {message.filesModified && message.filesModified.length > 0 && (
                <div className="mt-2 p-2 bg-yellow-900 rounded border-l-4 border-yellow-500">
                  <div className="text-xs text-yellow-400 mb-1">
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
                <div className="mt-2 p-2 bg-green-900 rounded border-l-4 border-green-500">
                  <div className="text-xs text-green-400 mb-1">
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
                <div className="mt-2 p-2 bg-blue-900 rounded border-l-4 border-blue-500">
                  <div className="text-xs text-blue-400 mb-1">⚡ Ações realizadas:</div>
                  {message.actions.map((action, index) => (
                    <div key={index} className="text-xs text-blue-300">
                      • {action}
                    </div>
                  ))}
                </div>
              )}

              <div className="text-xs opacity-50 mt-1 flex items-center">
                <span>
                  {message.timestamp.toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                {message.type === 'ai' && (
                  <span className="ml-1 text-green-400 text-xs">🤖</span>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 text-gray-100 rounded-lg p-2">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                <span className="text-xs">
                  <span className="animate-pulse">Analisando</span>
                  <span className="animate-bounce">...</span>
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Sugestões rápidas - Compactas */}
      {messages.length === 1 && (
        <div className="flex-shrink-0 px-2 pb-1">
          <div className="text-xs text-gray-400 mb-1">💡 Sugestões:</div>
          <div className="grid grid-cols-1 gap-1">
            {quickSuggestions.slice(0, 2).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSendMessage(suggestion)}
                className="text-left text-xs p-1.5 bg-gray-800 hover:bg-gray-700 rounded border border-gray-600 transition-colors truncate"
                disabled={isLoading}
              >
                <span className="text-gray-300">{suggestion}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input - Fixo na parte inferior, sem overlap */}
      <div className="flex-shrink-0 p-2 border-t border-gray-700 bg-gray-800">
        <div className="flex space-x-2">
          <div className="flex-1">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite: 'crie uma função para calcular idade'"
              className="w-full bg-gray-700 text-white rounded px-2 py-1.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-400 border-0"
              rows={2}
              disabled={isLoading}
              style={{ maxHeight: '60px', minHeight: '36px' }}
            />
          </div>
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isLoading}
            className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all text-sm flex items-center justify-center min-w-[40px]"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
            ) : (
              '🚀'
            )}
          </button>
        </div>

        {/* Context info ultra compacto */}
        <div className="mt-1 flex items-center justify-between text-xs">
          <div className="text-gray-500 truncate text-xs">
            {selectedCode ? '📝' : '🔍'} {projectId ? `P${projectId}` : 'Projeto'}
          </div>
          <div className="text-gray-500 text-xs">
            GPT-4o
          </div>
        </div>
      </div>
    </div>
  );
}