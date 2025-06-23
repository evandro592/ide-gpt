// Armazenamento local das mensagens de chat
interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  metadata?: any;
}

const CHAT_STORAGE_KEY = "ide_chat_messages";
const SETTINGS_STORAGE_KEY = "ide_settings";

export const localStorage = {
  // Mensagens de chat
  getChatMessages(): ChatMessage[] {
    try {
      const stored = window.localStorage.getItem(CHAT_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Erro ao carregar mensagens do localStorage:", error);
      return [];
    }
  },

  saveChatMessage(message: ChatMessage): void {
    try {
      const messages = this.getChatMessages();
      messages.push(message);
      window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error("Erro ao salvar mensagem no localStorage:", error);
    }
  },

  clearChatMessages(): void {
    try {
      window.localStorage.removeItem(CHAT_STORAGE_KEY);
    } catch (error) {
      console.error("Erro ao limpar mensagens do localStorage:", error);
    }
  },

  // Configurações
  getSettings(): any {
    try {
      const stored = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error("Erro ao carregar configurações do localStorage:", error);
      return null;
    }
  },

  saveSettings(settings: any): void {
    try {
      window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("Erro ao salvar configurações no localStorage:", error);
    }
  }
};