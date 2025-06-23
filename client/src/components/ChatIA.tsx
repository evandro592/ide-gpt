import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Bot, User, Code, Sparkles, AlertCircle } from 'lucide-react';
import type { Project, File } from '@shared/schema';

interface ChatIAProps {
  projetoAtivo?: Project | null;
  arquivoAtivo?: File | null;
  codigoSelecionado?: string;
  onCodeGenerated?: (codigo: string) => void;
  onFileModified?: (arquivo: File, novoConteudo: string) => void;
}

interface Mensagem {
  id: string;
  tipo: 'usuario' | 'ia';
  conteudo: string;
  codigo?: string;
  timestamp: Date;
}

export function ChatIA({ 
  projetoAtivo, 
  arquivoAtivo, 
  codigoSelecionado,
  onCodeGenerated,
  onFileModified 
}: ChatIAProps) {
  const [mensagens, setMensagens] = useState<Mensagem[]>([
    {
      id: '1',
      tipo: 'ia',
      conteudo: 'Olá! Sou seu assistente de programação em português. Posso ajudar você a:\n\n• Analisar e melhorar seu código\n• Gerar código novo\n• Corrigir bugs e problemas\n• Explicar conceitos de programação\n• Editar arquivos do seu projeto\n\nComo posso ajudar hoje?',
      timestamp: new Date(),
    }
  ]);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [digitando, setDigitando] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  // Scroll automático para o final
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [mensagens, digitando]);

  // Enviar mensagem para IA
  const enviarMensagemMutation = useMutation({
    mutationFn: (dados: any) => apiRequest('/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        ...dados,
        acessarPastas: true // Sempre permitir acesso às pastas
      }),
    }),
    onSuccess: (resposta) => {
      setDigitando(false);

      const novaMensagemIA: Mensagem = {
        id: Date.now().toString(),
        tipo: 'ia',
        conteudo: resposta.resposta || 'Desculpe, não consegui processar sua solicitação.',
        codigo: resposta.codigoGerado,
        timestamp: new Date(),
      };

      setMensagens(prev => [...prev, novaMensagemIA]);

      // Se código foi gerado, notificar componente pai
      if (resposta.codigoGerado && onCodeGenerated) {
        onCodeGenerated(resposta.codigoGerado);
      }

      // Se arquivos foram modificados, notificar componente pai
      if (resposta.arquivosModificados && onFileModified) {
        resposta.arquivosModificados.forEach((arquivo: any) => {
          if (arquivoAtivo && arquivo.nome === arquivoAtivo.name) {
            onFileModified(arquivoAtivo, arquivo.novoConteudo);
          }
        });
      }

      // Se novos arquivos foram criados, mostrar notificação
      if (resposta.arquivosCriados && resposta.arquivosCriados.length > 0) {
        const arquivosCriados = resposta.arquivosCriados.map((a: any) => a.nome).join(', ');
        console.log(`✅ Arquivos criados: ${arquivosCriados}`);
        // Atualizar a interface para mostrar os novos arquivos
        window.location.reload(); // Forçar reload para mostrar novos arquivos
      }
    },
    onError: (error) => {
      setDigitando(false);
      const mensagemErro: Mensagem = {
        id: Date.now().toString(),
        tipo: 'ia',
        conteudo: `Erro: ${error.message}`,
        timestamp: new Date(),
      };
      setMensagens(prev => [...prev, mensagemErro]);
    },
  });

  const handleEnviarMensagem = () => {
    if (!novaMensagem.trim()) return;

    // Adicionar mensagem do usuário
    const mensagemUsuario: Mensagem = {
      id: Date.now().toString(),
      tipo: 'usuario',
      conteudo: novaMensagem,
      timestamp: new Date(),
    };

    setMensagens(prev => [...prev, mensagemUsuario]);
    setDigitando(true);

    // Preparar dados para enviar à IA
    const dados = {
      mensagem: novaMensagem,
      projetoId: projetoAtivo?.id,
      arquivoId: arquivoAtivo?.id,
      codigoSelecionado,
      linguagem: arquivoAtivo?.language || 'javascript',
    };

    enviarMensagemMutation.mutate(dados);
    setNovaMensagem('');
  };

  const sugestoes = [
    'Analise este código e sugira melhorias',
    'Gere um exemplo de função React',
    'Como posso otimizar este código?',
    'Crie testes para esta função',
    'Refatore este código para TypeScript',
    'Adicione comentários explicativos',
  ];

  const handleSugestao = (sugestao: string) => {
    setNovaMensagem(sugestao);
  };

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Cabeçalho */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-2">
          <Bot className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Assistente IA</h3>
          <Sparkles className="w-4 h-4 text-yellow-500" />
        </div>

        {projetoAtivo && (
          <div className="text-sm text-muted-foreground">
            Projeto: {projetoAtivo.name}
            {arquivoAtivo && ` • ${arquivoAtivo.name}`}
          </div>
        )}
      </div>

      {/* Chat */}
      <div 
        ref={chatRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {mensagens.map((mensagem) => (
          <div
            key={mensagem.id}
            className={`flex gap-3 ${
              mensagem.tipo === 'usuario' ? 'flex-row-reverse' : ''
            }`}
          >
            {/* Avatar */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              mensagem.tipo === 'usuario' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted'
            }`}>
              {mensagem.tipo === 'usuario' ? (
                <User className="w-4 h-4" />
              ) : (
                <Bot className="w-4 h-4" />
              )}
            </div>

            {/* Mensagem */}
            <div className={`flex-1 max-w-[80%] ${
              mensagem.tipo === 'usuario' ? 'text-right' : ''
            }`}>
              <div className={`rounded-lg p-3 ${
                mensagem.tipo === 'usuario'
                  ? 'bg-primary text-primary-foreground ml-auto'
                  : 'bg-muted'
              }`}>
                <div className="whitespace-pre-wrap text-sm">
                  {mensagem.conteudo}
                </div>

                {/* Código gerado */}
                {mensagem.codigo && (
                  <div className="mt-3 p-3 bg-background rounded border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1">
                        <Code className="w-4 h-4" />
                        <span className="text-xs font-medium">Código Gerado</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onCodeGenerated?.(mensagem.codigo!)}
                      >
                        Usar Código
                      </Button>
                    </div>
                    <pre className="text-xs overflow-x-auto">
                      <code>{mensagem.codigo}</code>
                    </pre>
                  </div>
                )}
              </div>

              <div className="text-xs text-muted-foreground mt-1">
                {mensagem.timestamp.toLocaleTimeString('pt-BR')}
              </div>
            </div>
          </div>
        ))}

        {/* Indicador de digitação */}
        {digitando && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-muted rounded-lg p-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sugestões rápidas */}
      {mensagens.length === 1 && (
        <div className="px-4 pb-2">
          <div className="text-xs text-muted-foreground mb-2">Sugestões:</div>
          <div className="flex flex-wrap gap-1">
            {sugestoes.slice(0, 3).map((sugestao, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className="text-xs h-6"
                onClick={() => handleSugestao(sugestao)}
              >
                {sugestao}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Campo de entrada */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="Digite sua pergunta ou solicite ajuda com código..."
            value={novaMensagem}
            onChange={(e) => setNovaMensagem(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleEnviarMensagem();
              }
            }}
            disabled={enviarMensagemMutation.isPending}
          />
          <Button
            onClick={handleEnviarMensagem}
            disabled={!novaMensagem.trim() || enviarMensagemMutation.isPending}
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
          <span>Pressione Enter para enviar</span>
          {codigoSelecionado && (
            <span className="flex items-center gap-1">
              <Code className="w-3 h-3" />
              Código selecionado detectado
            </span>
          )}
        </div>
      </div>
    </div>
  );
}