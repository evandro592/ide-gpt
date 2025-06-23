import { useState, useEffect } from "react";
import { ResizableLayout } from "@/components/ResizableLayout";
import { FileTree } from "@/components/FileTree";
import { CodeEditor } from "@/components/CodeEditor";
import { ChatPanel } from "@/components/ChatPanel";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Code, FolderOpen, Save, Settings, Terminal, Globe } from "lucide-react";
import { useTranslation } from "@/lib/translations";
import { localStorage } from "@/lib/localStorage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface FileContent {
  content: string;
  language: string;
  path: string;
}

interface OpenTab {
  path: string;
  name: string;
  content: string;
  language: string;
  modified: boolean;
}

export default function IDE() {
  const [openTabs, setOpenTabs] = useState<OpenTab[]>([]);
  const [activeTabIndex, setActiveTabIndex] = useState<number>(-1);
  const [theme, setTheme] = useState("dark");
  const [fontSize, setFontSize] = useState(14);
  const [language, setLanguage] = useState("pt");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation(language);

  // Load project settings
  const { data: settings } = useQuery({
    queryKey: ["/api/settings"],
  });

  // Save file mutation
  const saveFileMutation = useMutation({
    mutationFn: async ({ path, content }: { path: string; content: string }) => {
      return apiRequest("POST", "/api/files/save", { path, content });
    },
    onSuccess: (_, variables) => {
      // Update tab to mark as not modified
      setOpenTabs(tabs => 
        tabs.map(tab => 
          tab.path === variables.path 
            ? { ...tab, modified: false }
            : tab
        )
      );
      toast({
        title: t("fileSaved"),
        description: `${variables.path} ${t("fileSavedDescription")}`,
      });
    },
    onError: (error) => {
      toast({
        title: t("errorSavingFile"),
        description: (error as Error).message,
        variant: "destructive",
      });
    },
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: any) => {
      return apiRequest("POST", "/api/settings", newSettings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: t("settingsUpdated"),
        description: t("settingsUpdatedDescription"),
      });
    },
  });

  // Load settings on mount
  useEffect(() => {
    if (settings) {
      setTheme(settings.theme || "dark");
      setFontSize(settings.fontSize || 14);
      setLanguage(settings.language || "pt");
    }
    
    // Carregar configurações do localStorage
    const localSettings = localStorage.getSettings();
    if (localSettings) {
      setTheme(localSettings.theme || "dark");
      setFontSize(localSettings.fontSize || 14);
      setLanguage(localSettings.language || "pt");
    }
  }, [settings]);

  const handleFileOpen = async (filePath: string, fileName: string) => {
    // Check if file is already open
    const existingTabIndex = openTabs.findIndex(tab => tab.path === filePath);
    if (existingTabIndex !== -1) {
      setActiveTabIndex(existingTabIndex);
      return;
    }

    try {
      const response = await fetch(`/api/files/content?path=${encodeURIComponent(filePath)}`);
      if (!response.ok) throw new Error("Failed to load file");

      const fileData: FileContent = await response.json();
      
      const newTab: OpenTab = {
        path: filePath,
        name: fileName,
        content: fileData.content,
        language: fileData.language,
        modified: false,
      };

      setOpenTabs(tabs => [...tabs, newTab]);
      setActiveTabIndex(openTabs.length);
    } catch (error) {
      toast({
        title: t("errorOpeningFile"),
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleFileClose = (index: number) => {
    if (openTabs[index]?.modified) {
      // TODO: Show confirmation dialog for unsaved changes
    }
    
    setOpenTabs(tabs => tabs.filter((_, i) => i !== index));
    
    if (activeTabIndex === index) {
      setActiveTabIndex(index > 0 ? index - 1 : 0);
    } else if (activeTabIndex > index) {
      setActiveTabIndex(activeTabIndex - 1);
    }
  };

  const handleContentChange = (content: string) => {
    if (activeTabIndex >= 0 && openTabs[activeTabIndex]) {
      setOpenTabs(tabs =>
        tabs.map((tab, index) =>
          index === activeTabIndex
            ? { ...tab, content, modified: tab.content !== content }
            : tab
        )
      );
    }
  };

  const handleCodeEdit = (code: string) => {
    if (activeTabIndex >= 0 && openTabs[activeTabIndex]) {
      setOpenTabs(tabs =>
        tabs.map((tab, index) =>
          index === activeTabIndex
            ? { ...tab, content: code, modified: true }
            : tab
        )
      );
      toast({
        title: t("codeApplied"),
        description: t("codeApplied"),
      });
    }
  };

  const handleSave = () => {
    if (activeTabIndex >= 0 && openTabs[activeTabIndex]) {
      const activeTab = openTabs[activeTabIndex];
      saveFileMutation.mutate({
        path: activeTab.path,
        content: activeTab.content,
      });
    }
  };

  const handleSaveAll = () => {
    openTabs
      .filter(tab => tab.modified)
      .forEach(tab => {
        saveFileMutation.mutate({
          path: tab.path,
          content: tab.content,
        });
      });
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    const newSettings = {
      theme: newTheme,
      fontSize,
      language,
      autoSave: settings?.autoSave ?? true,
    };
    updateSettingsMutation.mutate(newSettings);
    localStorage.saveSettings(newSettings);
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    const newSettings = {
      theme,
      fontSize,
      language: newLanguage,
      autoSave: settings?.autoSave ?? true,
    };
    updateSettingsMutation.mutate(newSettings);
    localStorage.saveSettings(newSettings);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            if (e.shiftKey) {
              handleSaveAll();
            } else {
              handleSave();
            }
            break;
          case 'w':
            e.preventDefault();
            if (activeTabIndex >= 0) {
              handleFileClose(activeTabIndex);
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTabIndex, openTabs]);

  const activeTab = activeTabIndex >= 0 ? openTabs[activeTabIndex] : null;

  return (
    <div className="flex flex-col h-screen bg-vs-bg text-vs-text font-interface">
      {/* Header */}
      <header className="bg-vs-panel border-b border-vs-border px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Code className="text-vs-accent h-5 w-5" />
            <h1 className="text-lg font-semibold">{t("appName")}</h1>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Button
              variant="ghost"
              size="sm"
              className="text-vs-text hover:bg-vs-surface"
            >
              <FolderOpen className="h-4 w-4 mr-1" />
              {t("openProject")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSaveAll}
              className="text-vs-text hover:bg-vs-surface"
            >
              <Save className="h-4 w-4 mr-1" />
              {t("saveAll")}
            </Button>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-vs-text-muted">{t("theme")}:</span>
            <Select value={theme} onValueChange={handleThemeChange}>
              <SelectTrigger className="w-24 h-8 bg-vs-surface border-vs-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dark">{t("dark")}</SelectItem>
                <SelectItem value="light">{t("light")}</SelectItem>
                <SelectItem value="high-contrast">{t("highContrast")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-vs-text-muted">{t("language")}:</span>
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-24 h-8 bg-vs-surface border-vs-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pt">{t("portuguese")}</SelectItem>
                <SelectItem value="en">{t("english")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-vs-text hover:bg-vs-surface"
              >
                <Terminal className="h-4 w-4 mr-1" />
                {t("scripts")}
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-vs-surface border-vs-border">
              <DialogHeader>
                <DialogTitle className="text-vs-text">{t("generateWindowsScripts")}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Terminal className="text-green-400 h-4 w-4" />
                  <span className="flex-1 text-vs-text">install_dependencies.bat</span>
                  <Button size="sm" className="bg-vs-accent hover:bg-vs-accent-hover">
                    {t("generateScript")}
                  </Button>
                </div>
                <div className="flex items-center space-x-3">
                  <Terminal className="text-green-400 h-4 w-4" />
                  <span className="flex-1 text-vs-text">start_app.bat</span>
                  <Button size="sm" className="bg-vs-accent hover:bg-vs-accent-hover">
                    {t("generateScript")}
                  </Button>
                </div>
                <div className="flex items-center space-x-3">
                  <Terminal className="text-green-400 h-4 w-4" />
                  <span className="flex-1 text-vs-text">build_app.bat</span>
                  <Button size="sm" className="bg-vs-accent hover:bg-vs-accent-hover">
                    {t("generateScript")}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant="ghost"
            size="sm"
            className="text-vs-text hover:bg-vs-surface"
            title={t("settings")}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <ResizableLayout
        leftPanel={<FileTree onFileOpen={handleFileOpen} />}
        centerPanel={
          <CodeEditor
            tabs={openTabs}
            activeTabIndex={activeTabIndex}
            onTabChange={setActiveTabIndex}
            onTabClose={handleFileClose}
            onContentChange={handleContentChange}
            theme={theme}
            fontSize={fontSize}
          />
        }
        rightPanel={<ChatPanel activeFile={activeTab} onCodeEdit={handleCodeEdit} />}
      />

      {/* Footer Status Bar */}
      <footer className="bg-vs-accent text-white px-4 py-1 text-xs flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span>main</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>0↑ 0↓</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-yellow-300">⚠</span>
            <span>0</span>
            <span className="text-red-300 ml-2">✖</span>
            <span>0</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span>Node.js v20.0.0</span>
          <span>{t("devServerRunning")}</span>
          <span>{t("memory")}: 245MB</span>
        </div>
      </footer>
    </div>
  );
}
