
import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Send, 
  Bot, 
  User, 
  Code, 
  Sparkles, 
  AlertCircle, 
  Copy, 
  Check,
  Trash2,
  RefreshCw,
  Settings,
  Zap,
  FileText,
  Download,
  Plus,
  MessageSquare
} from 'lucide-react';
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
  status?: 'enviando' | 'sucesso' | 'erro';
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
      conteudo: 'Olá! Sou seu assistente de programação em português. Posso ajudar você a:\n\n• **Analisar e melhorar** seu código\n• **Gerar código novo** baseado em suas instruções\n• **Corrigir bugs** automaticamente\n• **Explicar conceitos** de programação\n• **Editar arquivos** do projeto diretamente\n• **Sugerir melhorias** no código\n\n**Como posso ajudar hoje?** 🚀',
      timestamp: new Date(),
      status: 'sucesso'
    }
  ]);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [digitando, setDigitando] = useState(false);
  const [copiado, setCopiado] = useState<string | null>(null);
  const [expandido, setExpandido] = useState(true);
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll automático para o final
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [mensagens, digitando]);

  // Focar no input quando componente carrega
  useEffect(() => {
    if (inputRef.current && expandido) {
      inputRef.current.focus();
    }
  }, [expandido]);

  // Enviar mensagem para IA
  const enviarMensagemMutation = useMutation({
    mutationFn: (dados: any) => apiRequest('/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        ...dados,
        acessarPastas: true
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
        status: 'sucesso'
      };

      setMensagens(prev => 
        prev.map(msg => 
          msg.status === 'enviando' ? { ...msg, status: 'sucesso' } : msg
        ).concat(novaMensagemIA)
      );

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
        setTimeout(() => window.location.reload(), 1000);
      }
    },
    onError: (error) => {
      setDigitando(false);
      setMensagens(prev => 
        prev.map(msg => 
          msg.status === 'enviando' ? { ...msg, status: 'erro' } : msg
        )
      );

      const mensagemErro: Mensagem = {
        id: Date.now().toString(),
        tipo: 'ia',
        conteudo: `❌ **Erro:** ${error.message || 'Falha na comunicação com a IA'}`,
        timestamp: new Date(),
        status: 'erro'
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
      status: 'enviando'
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

  const copiarCodigo = async (codigo: string, id: string) => {
    try {
      await navigator.clipboard.writeText(codigo);
      setCopiado(id);
      setTimeout(() => setCopiado(null), 2000);
    } catch (error) {
      console.error('Erro ao copiar:', error);
    }
  };

  const aplicarCodigo = (codigo: string) => {
    if (onCodeGenerated) {
      onCodeGenerated(codigo);
    }
  };

  const limparChat = () => {
    setMensagens([mensagens[0]]); // Manter apenas mensagem de boas-vindas
  };

  const reenviarMensagem = (mensagem: Mensagem) => {
    if (mensagem.tipo === 'usuario') {
      setNovaMensagem(mensagem.conteudo);
      inputRef.current?.focus();
    }
  };

  const sugestoes = [
    { 
      texto: 'Analise este código e sugira melhorias', 
      icon: <Code className="w-3 h-3" />,
      categoria: 'análise'
    },
    { 
      texto: 'Crie uma função React funcional', 
      icon: <Plus className="w-3 h-3" />,
      categoria: 'geração'
    },
    { 
      texto: 'Como posso otimizar este código?', 
      icon: <Zap className="w-3 h-3" />,
      categoria: 'otimização'
    },
    { 
      texto: 'Encontre bugs no meu código', 
      icon: <AlertCircle className="w-3 h-3" />,
      categoria: 'debug'
    },
    { 
      texto: 'Adicione comentários explicativos', 
      icon: <FileText className="w-3 h-3" />,
      categoria: 'documentação'
    },
    { 
      texto: 'Refatore este código para TypeScript', 
      icon: <RefreshCw className="w-3 h-3" />,
      categoria: 'refatoração'
    },
  ];

  const handleSugestao = (sugestao: string) => {
    setNovaMensagem(sugestao);
    inputRef.current?.focus();
  };

  return (
    <div className={`flex flex-col h-full bg-card transition-all duration-300 ${expandido ? 'w-full' : 'w-12'}`}>
      {/* Cabeçalho melhorado */}
      <div className="p-4 border-b bg-gradient-to-r from-primary/10 to-purple-500/10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Bot className="w-5 h-5 text-primary" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>
            {expandido && (
              <>
                <h3 className="font-semibold">Assistente IA</h3>
                <Sparkles className="w-4 h-4 text-yellow-500" />
              </>
            )}
          </div>
          
          {expandido && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={limparChat}
                className="h-6 w-6 p-0"
                title="Limpar chat"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpandido(false)}
                className="h-6 w-6 p-0"
                title="Minimizar"
              >
                <MessageSquare className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>

        {expandido && projetoAtivo && (
          <div className="text-xs text-muted-foreground bg-background/50 p-2 rounded">
            <div className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              <span className="font-medium">Projeto:</span> {projetoAtivo.name}
            </div>
            {arquivoAtivo && (
              <div className="flex items-center gap-1 mt-1">
                <Code className="w-3 h-3" />
                <span className="font-medium">Arquivo:</span> {arquivoAtivo.name}
              </div>
            )}
          </div>
        )}
      </div>

      {!expandido && (
        <div className="flex-1 flex items-center justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpandido(true)}
            className="h-8 w-8 p-0"
            title="Expandir chat"
          >
            <MessageSquare className="w-4 h-4" />
          </Button>
        </div>
      )}

      {expandido && (
        <>
          {/* Chat melhorado */}
          <div 
            ref={chatRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
          >
            {mensagens.map((mensagem) => (
              <div
                key={mensagem.id}
                className={`flex gap-3 ${
                  mensagem.tipo === 'usuario' ? 'flex-row-reverse' : ''
                }`}
              >
                {/* Avatar melhorado */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center relative ${
                  mensagem.tipo === 'usuario' 
                    ? 'bg-gradient-to-r from-primary to-blue-600 text-primary-foreground' 
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                }`}>
                  {mensagem.tipo === 'usuario' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                  
                  {/* Indicador de status */}
                  {mensagem.status === 'enviando' && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full flex items-center justify-center">
                      <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                    </div>
                  )}
                  {mensagem.status === 'erro' && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-2 h-2 text-white" />
                    </div>
                  )}
                </div>

                {/* Mensagem melhorada */}
                <div className={`flex-1 max-w-[85%] ${
                  mensagem.tipo === 'usuario' ? 'text-right' : ''
                }`}>
                  <div className={`rounded-lg p-3 relative group ${
                    mensagem.tipo === 'usuario'
                      ? 'bg-gradient-to-r from-primary to-blue-600 text-primary-foreground ml-auto'
                      : 'bg-muted border'
                  }`}>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {mensagem.conteudo}
                    </div>

                    {/* Botões de ação */}
                    <div className={`absolute top-2 ${mensagem.tipo === 'usuario' ? 'left-2' : 'right-2'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copiarCodigo(mensagem.conteudo, mensagem.id)}
                          className="h-5 w-5 p-0"
                          title="Copiar"
                        >
                          {copiado === mensagem.id ? (
                            <Check className="w-3 h-3 text-green-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                        {mensagem.status === 'erro' && mensagem.tipo === 'usuario' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => reenviarMensagem(mensagem)}
                            className="h-5 w-5 p-0"
                            title="Reenviar"
                          >
                            <RefreshCw className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Código gerado melhorado */}
                    {mensagem.codigo && (
                      <div className="mt-3 p-3 bg-background/90 rounded border">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1">
                            <Code className="w-4 h-4 text-green-500" />
                            <span className="text-xs font-medium text-green-600">Código Gerado</span>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copiarCodigo(mensagem.codigo!, `code-${mensagem.id}`)}
                              className="h-6 w-6 p-0"
                              title="Copiar código"
                            >
                              {copiado === `code-${mensagem.id}` ? (
                                <Check className="w-3 h-3 text-green-500" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => aplicarCodigo(mensagem.codigo!)}
                              className="h-6 w-6 p-0"
                              title="Aplicar código"
                            >
                              <Download className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <pre className="text-xs overflow-x-auto bg-black/50 p-2 rounded">
                          <code className="text-green-400">{mensagem.codigo}</code>
                        </pre>
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    {mensagem.timestamp.toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                    {mensagem.status === 'enviando' && (
                      <span className="text-yellow-600">• Enviando...</span>
                    )}
                    {mensagem.status === 'erro' && (
                      <span className="text-red-600">• Erro</span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Indicador de digitação melhorado */}
            {digitando && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-muted rounded-lg p-3 border">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="text-xs text-muted-foreground">IA está pensando...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sugestões rápidas melhoradas */}
          {mensagens.length === 1 && (
            <div className="px-4 pb-2 border-t bg-background/50">
              <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Sugestões rápidas:
              </div>
              <div className="grid grid-cols-2 gap-1">
                {sugestoes.slice(0, 4).map((sugestao, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="text-xs h-8 justify-start px-2"
                    onClick={() => handleSugestao(sugestao.texto)}
                  >
                    {sugestao.icon}
                    <span className="truncate ml-1">{sugestao.texto}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Campo de entrada melhorado */}
          <div className="p-4 border-t bg-background/50">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
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
                  className="pr-10"
                />
                {novaMensagem && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setNovaMensagem('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
              <Button
                onClick={handleEnviarMensagem}
                disabled={!novaMensagem.trim() || enviarMensagemMutation.isPending}
                size="sm"
                className="px-3"
              >
                {enviarMensagemMutation.isPending ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>

            <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
              <span>Enter para enviar • Shift+Enter para nova linha</span>
              {codigoSelecionado && (
                <span className="flex items-center gap-1 text-green-600">
                  <Code className="w-3 h-3" />
                  Código selecionado detectado
                </span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
