import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SendMessageParams {
  content: string;
  context?: string;
}

interface AnalyzeCodeParams {
  code: string;
  language?: string;
}

interface GenerateCodeParams {
  prompt: string;
  language?: string;
}

export function useChat() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get chat messages
  const useChatMessages = () => {
    return useQuery({
      queryKey: ["/api/chat/messages"],
    });
  };

  // Send message
  const useSendMessage = () => {
    return useMutation({
      mutationFn: async ({ content, context }: SendMessageParams) => {
        const response = await apiRequest("POST", "/api/chat/send", { content, context });
        return response.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
      },
      onError: (error) => {
        toast({
          title: "Error sending message",
          description: (error as Error).message,
          variant: "destructive",
        });
      },
    });
  };

  // Clear chat history
  const useClearChat = () => {
    return useMutation({
      mutationFn: async () => {
        return apiRequest("DELETE", "/api/chat/clear");
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
        toast({
          title: "Chat cleared",
          description: "Chat history has been cleared.",
        });
      },
      onError: (error) => {
        toast({
          title: "Error clearing chat",
          description: (error as Error).message,
          variant: "destructive",
        });
      },
    });
  };

  // Analyze code
  const useAnalyzeCode = () => {
    return useMutation({
      mutationFn: async ({ code, language = "javascript" }: AnalyzeCodeParams) => {
        const response = await apiRequest("POST", "/api/ai/analyze", { code, language });
        return response.json();
      },
      onError: (error) => {
        toast({
          title: "Error analyzing code",
          description: (error as Error).message,
          variant: "destructive",
        });
      },
    });
  };

  // Generate code
  const useGenerateCode = () => {
    return useMutation({
      mutationFn: async ({ prompt, language = "javascript" }: GenerateCodeParams) => {
        const response = await apiRequest("POST", "/api/ai/generate", { prompt, language });
        return response.json();
      },
      onError: (error) => {
        toast({
          title: "Error generating code",
          description: (error as Error).message,
          variant: "destructive",
        });
      },
    });
  };

  // Explain code
  const useExplainCode = () => {
    return useMutation({
      mutationFn: async ({ code, language = "javascript" }: AnalyzeCodeParams) => {
        const response = await apiRequest("POST", "/api/ai/explain", { code, language });
        return response.json();
      },
      onError: (error) => {
        toast({
          title: "Error explaining code",
          description: (error as Error).message,
          variant: "destructive",
        });
      },
    });
  };

  return {
    useChatMessages,
    useSendMessage,
    useClearChat,
    useAnalyzeCode,
    useGenerateCode,
    useExplainCode,
  };
}
