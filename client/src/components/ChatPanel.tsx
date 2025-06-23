import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, Bot, User, History, Settings, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { localStorage } from "@/lib/localStorage";
import { useTranslation } from "@/lib/translations";

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  metadata?: any;
}

interface ActiveFile {
  path: string;
  name: string;
  content: string;
  language: string;
}

interface ChatPanelProps {
  activeFile?: ActiveFile | null;
}

interface ChatResponse {
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
  response: {
    message: string;
    suggestions?: string[];
    codeSnippet?: string;
  };
}

export function ChatPanel({ activeFile }: ChatPanelProps) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const [language, setLanguage] = useState("pt");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation(language);

  // Carregar mensagens do localStorage na inicialização
  useEffect(() => {
    const savedMessages = localStorage.getChatMessages();
    setLocalMessages(savedMessages);
    
    // Carregar configurações de idioma
    const savedSettings = localStorage.getSettings();
    if (savedSettings?.language) {
      setLanguage(savedSettings.language);
    }
  }, []);

  // Load chat messages (mantido para compatibilidade, mas usamos localStorage)
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["/api/chat/messages"],
    enabled: false, // Desabilitado pois usamos localStorage
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, context }: { content: string; context?: string }) => {
      const response = await apiRequest("POST", "/api/chat/send", { content, context });
      return response.json() as Promise<ChatResponse>;
    },
    onMutate: () => {
      setIsTyping(true);
      
      // Salvar mensagem do usuário no localStorage imediatamente
      const userMessage: ChatMessage = {
        id: Date.now(),
        role: "user",
        content: message,
        timestamp: new Date().toISOString(),
        metadata: null
      };
      
      localStorage.saveChatMessage(userMessage);
      setLocalMessages(prev => [...prev, userMessage]);
    },
    onSuccess: (data) => {
      // Salvar resposta da IA no localStorage
      const assistantMessage: ChatMessage = {
        id: Date.now() + 1,
        role: "assistant", 
        content: data.response.message,
        timestamp: new Date().toISOString(),
        metadata: {
          suggestions: data.response.suggestions,
          codeSnippet: data.response.codeSnippet
        }
      };
      
      localStorage.saveChatMessage(assistantMessage);
      setLocalMessages(prev => [...prev, assistantMessage]);
      setMessage("");
      setIsTyping(false);
    },
    onError: (error) => {
      setIsTyping(false);
      toast({
        title: t("errorSendingMessage"),
        description: (error as Error).message,
        variant: "destructive",
      });
    },
  });

  // Clear chat mutation
  const clearChatMutation = useMutation({
    mutationFn: async () => {
      localStorage.clearChatMessages();
      setLocalMessages([]);
      return Promise.resolve();
    },
    onSuccess: () => {
      toast({
        title: t("chatCleared"),
        description: t("chatClearedDescription"),
      });
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [localMessages, isTyping]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const context = activeFile 
      ? `Current file: ${activeFile.name} (${activeFile.language})\nContent: ${activeFile.content.slice(0, 1000)}...`
      : undefined;

    sendMessageMutation.mutate({
      content: message.trim(),
      context,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAnalyzeFile = () => {
    if (!activeFile) {
      toast({
        title: t("noFileSelected"),
        description: t("noFileSelectedDescription"),
        variant: "destructive",
      });
      return;
    }

    const analysisMessage = language === 'pt' 
      ? `Por favor, analise o arquivo ${activeFile.language} "${activeFile.name}" e forneça sugestões de melhoria.`
      : `Please analyze the ${activeFile.language} file "${activeFile.name}" and provide suggestions for improvement.`;
    
    setMessage(analysisMessage);
    sendMessageMutation.mutate({
      content: analysisMessage,
      context: `File: ${activeFile.name} (${activeFile.language})\nContent:\n${activeFile.content}`,
    });
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return t("justNow");
    if (diffMins < 60) return `${diffMins} ${t("minutesAgo")}`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} ${t("hoursAgo")}`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-3 border-b border-vs-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="h-4 w-4 text-vs-accent" />
            <h2 className="text-sm font-medium">{t("aiAssistant")}</h2>
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          </div>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-vs-panel"
              onClick={() => clearChatMutation.mutate()}
            >
              <History className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-vs-panel"
            >
              <Settings className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-3" ref={scrollAreaRef}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-vs-text-muted">{t("loadingChatHistory")}</div>
          </div>
        ) : localMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Bot className="h-12 w-12 text-vs-accent mb-4" />
            <h3 className="text-lg font-medium mb-2">{t("aiAssistantReady")}</h3>
            <p className="text-sm text-vs-text-muted mb-4">
              {t("aiAssistantDescription")}
            </p>
            {activeFile && (
              <Button
                onClick={handleAnalyzeFile}
                className="bg-vs-accent hover:bg-vs-accent-hover"
              >
                {t("analyzeCurrentFile")}
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {localMessages.map((msg: ChatMessage) => (
              <div
                key={msg.id}
                className={cn(
                  "chat-message flex items-start space-x-2",
                  msg.role === "user" && "flex-row-reverse space-x-reverse"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                    msg.role === "user" 
                      ? "bg-green-500" 
                      : "bg-vs-accent"
                  )}
                >
                  {msg.role === "user" ? (
                    <User className="h-4 w-4 text-white" />
                  ) : (
                    <Bot className="h-4 w-4 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className={cn(
                      "rounded-lg p-3 max-w-full",
                      msg.role === "user"
                        ? "bg-vs-accent text-white"
                        : "bg-vs-panel"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {msg.content}
                    </p>
                    
                    {/* Show code snippets if available */}
                    {msg.metadata?.codeSnippet && (
                      <div className="mt-3 bg-vs-bg rounded p-2 font-mono text-xs overflow-x-auto">
                        <pre className="text-vs-text">{msg.metadata.codeSnippet}</pre>
                      </div>
                    )}
                    
                    {/* Show suggestions if available */}
                    {msg.metadata?.suggestions && msg.metadata.suggestions.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {msg.metadata.suggestions.map((suggestion: string, index: number) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className="w-1 h-1 bg-vs-accent rounded-full"></div>
                            <span className="text-xs text-vs-text-muted">{suggestion}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div
                    className={cn(
                      "text-xs text-vs-text-muted mt-1",
                      msg.role === "user" && "text-right"
                    )}
                  >
                    {formatTimestamp(msg.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="chat-message flex items-start space-x-2">
                <div className="w-8 h-8 bg-vs-accent rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="bg-vs-panel rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-vs-text-muted rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-vs-text-muted rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-vs-text-muted rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Chat Input */}
      <div className="p-3 border-t border-vs-border">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t("askAboutCode")}
              className="w-full bg-vs-panel border-vs-border focus:border-vs-accent focus:ring-vs-accent pr-8"
              disabled={sendMessageMutation.isPending}
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-vs-text-muted hover:text-vs-accent"
            >
              <Paperclip className="h-3 w-3" />
            </Button>
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || sendMessageMutation.isPending}
            className="bg-vs-accent hover:bg-vs-accent-hover"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center justify-between mt-2 text-xs text-vs-text-muted">
          <div className="flex space-x-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs hover:text-vs-accent p-1"
              onClick={handleAnalyzeFile}
              disabled={!activeFile}
            >
              <Bot className="h-3 w-3 mr-1" />
              {t("analyzeFile")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs hover:text-vs-accent p-1"
            >
              <Settings className="h-3 w-3 mr-1" />
              {t("debug")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs hover:text-vs-accent p-1"
            >
              ✨ {t("generate")}
            </Button>
          </div>
          <div className="text-green-400 flex items-center">
            <div className="w-1 h-1 bg-green-400 rounded-full mr-1"></div>
            {t("connected")}
          </div>
        </div>
      </div>
    </div>
  );
}
