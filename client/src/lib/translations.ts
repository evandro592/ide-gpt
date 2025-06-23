// Traduções para português
export const translations = {
  pt: {
    // Cabeçalho
    appName: "CodeStudio Pro",
    openProject: "Abrir Projeto",
    saveAll: "Salvar Tudo",
    scripts: "Scripts",
    settings: "Configurações",
    
    // Explorador de arquivos
    explorer: "Explorador",
    loadingFiles: "Carregando arquivos do projeto...",
    failedToLoadFiles: "Falha ao carregar arquivos do projeto",
    
    // Editor
    welcome: "Bem-vindo ao CodeStudio Pro",
    openFileToStart: "Abra um arquivo do explorador para começar a editar",
    noFileSelected: "Nenhum arquivo selecionado",
    ready: "Pronto",
    
    // Chat
    aiAssistant: "Assistente IA",
    aiAssistantReady: "Assistente IA Pronto",
    aiAssistantDescription: "Posso ajudar você a analisar código, sugerir melhorias, gerar documentação e responder perguntas sobre seu projeto.",
    analyzeCurrentFile: "Analisar Arquivo Atual",
    askAboutCode: "Pergunte sobre seu código...",
    analyzeFile: "Analisar Arquivo",
    debug: "Depurar",
    generate: "Gerar",
    connected: "Conectado",
    loadingChatHistory: "Carregando histórico do chat...",
    justNow: "Agora mesmo",
    minutesAgo: "minutos atrás",
    hoursAgo: "horas atrás",
    
    // Configurações
    theme: "Tema",
    dark: "Escuro",
    light: "Claro",
    highContrast: "Alto Contraste",
    fontSize: "Tamanho da Fonte",
    language: "Idioma",
    portuguese: "Português",
    english: "Inglês",
    autoSave: "Salvamento Automático",
    
    // Scripts
    generateWindowsScripts: "Gerar Scripts do Windows",
    installDependencies: "Instalar Dependências",
    startApp: "Iniciar Aplicação", 
    buildApp: "Compilar Aplicação",
    generateScript: "Gerar",
    
    // Mensagens
    fileSaved: "Arquivo salvo",
    fileSavedDescription: "foi salvo com sucesso.",
    errorSavingFile: "Erro ao salvar arquivo",
    settingsUpdated: "Configurações atualizadas",
    settingsUpdatedDescription: "Suas preferências foram salvas.",
    chatCleared: "Chat limpo",
    chatClearedDescription: "Histórico do chat foi limpo.",
    errorSendingMessage: "Erro ao enviar mensagem",
    noFileSelectedTitle: "Nenhum arquivo selecionado", 
    noFileSelectedDescription: "Por favor, abra um arquivo para analisar.",
    errorOpeningFile: "Erro ao abrir arquivo",
    
    // Status
    devServerRunning: "Servidor Dev: Executando",
    memory: "Memória",
    
    // Atalhos
    saveShortcut: "Ctrl+S para salvar",
    saveAllShortcut: "Ctrl+Shift+S para salvar tudo",
    closeTabShortcut: "Ctrl+W para fechar aba"
  },
  
  en: {
    // Header
    appName: "CodeStudio Pro",
    openProject: "Open Project",
    saveAll: "Save All",
    scripts: "Scripts",
    settings: "Settings",
    
    // File explorer
    explorer: "Explorer",
    loadingFiles: "Loading project files...",
    failedToLoadFiles: "Failed to load project files",
    
    // Editor
    welcome: "Welcome to CodeStudio Pro",
    openFileToStart: "Open a file from the explorer to start editing",
    noFileSelected: "No file selected",
    ready: "Ready",
    
    // Chat
    aiAssistant: "AI Assistant",
    aiAssistantReady: "AI Assistant Ready",
    aiAssistantDescription: "I can help you analyze code, suggest improvements, generate documentation, and answer questions about your project.",
    analyzeCurrentFile: "Analyze Current File",
    askAboutCode: "Ask about your code...",
    analyzeFile: "Analyze File",
    debug: "Debug",
    generate: "Generate",
    connected: "Connected",
    loadingChatHistory: "Loading chat history...",
    justNow: "Just now",
    minutesAgo: "minutes ago",
    hoursAgo: "hours ago",
    
    // Settings
    theme: "Theme",
    dark: "Dark",
    light: "Light",
    highContrast: "High Contrast",
    language: "Language",
    portuguese: "Portuguese",
    english: "English",
    fontSize: "Font Size",
    autoSave: "Auto Save",
    
    // Scripts
    generateWindowsScripts: "Generate Windows Scripts",
    installDependencies: "Install Dependencies",
    startApp: "Start Application",
    buildApp: "Build Application", 
    generateScript: "Generate",
    
    // Messages
    fileSaved: "File saved",
    fileSavedDescription: "has been saved successfully.",
    errorSavingFile: "Error saving file",
    settingsUpdated: "Settings updated",
    settingsUpdatedDescription: "Your preferences have been saved.",
    chatCleared: "Chat cleared",
    chatClearedDescription: "Chat history has been cleared.",
    errorSendingMessage: "Error sending message",
    noFileSelectedTitle: "No file selected",
    noFileSelectedDescription: "Please open a file to analyze.", 
    errorOpeningFile: "Error opening file",
    
    // Status
    devServerRunning: "Dev Server: Running",
    memory: "Memory",
    
    // Shortcuts
    saveShortcut: "Ctrl+S to save",
    saveAllShortcut: "Ctrl+Shift+S to save all",
    closeTabShortcut: "Ctrl+W to close tab"
  }
};

export const useTranslation = (language: string = 'pt') => {
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language as keyof typeof translations] || translations.pt;
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };
  
  return { t };
};