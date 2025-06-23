import { useRef, useEffect, useState } from "react";
import { Editor } from "@monaco-editor/react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/translations";
import { localStorage } from "@/lib/localStorage";

interface OpenTab {
  path: string;
  name: string;
  content: string;
  language: string;
  modified: boolean;
}

interface CodeEditorProps {
  tabs: OpenTab[];
  activeTabIndex: number;
  onTabChange: (index: number) => void;
  onTabClose: (index: number) => void;
  onContentChange: (content: string) => void;
  theme?: string;
  fontSize?: number;
}

export function CodeEditor({
  tabs,
  activeTabIndex,
  onTabChange,
  onTabClose,
  onContentChange,
  theme = "dark",
  fontSize = 14,
}: CodeEditorProps) {
  const editorRef = useRef<any>(null);
  const [editorReady, setEditorReady] = useState(false);
  const [language, setLanguage] = useState("pt");
  const { t } = useTranslation(language);

  const activeTab = activeTabIndex >= 0 ? tabs[activeTabIndex] : null;

  // Carregar idioma das configurações
  useEffect(() => {
    const savedSettings = localStorage.getSettings();
    if (savedSettings?.language) {
      setLanguage(savedSettings.language);
    }
  }, []);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    setEditorReady(true);

    // Configure Monaco editor
    monaco.editor.defineTheme('vs-dark-custom', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#1E1E1E',
        'editor.foreground': '#CCCCCC',
        'editorLineNumber.foreground': '#858585',
        'editorLineNumber.activeForeground': '#CCCCCC',
        'editor.selectionBackground': '#264F78',
        'editor.selectionHighlightBackground': '#264F7850',
        'editorCursor.foreground': '#AEAFAD',
      }
    });

    monaco.editor.setTheme('vs-dark-custom');

    // Set editor options
    editor.updateOptions({
      fontSize: fontSize,
      fontFamily: 'Fira Code, Monaco, Consolas, monospace',
      ligatures: true,
      wordWrap: 'on',
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
      insertSpaces: true,
    });
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      onContentChange(value);
    }
  };

  // Update editor content when active tab changes
  useEffect(() => {
    if (editorRef.current && activeTab) {
      const currentValue = editorRef.current.getValue();
      if (currentValue !== activeTab.content) {
        editorRef.current.setValue(activeTab.content);
      }
    }
  }, [activeTab?.path]);

  // Update editor language when active tab changes
  useEffect(() => {
    if (editorRef.current && activeTab) {
      const model = editorRef.current.getModel();
      if (model) {
        // Get Monaco instance
        const monaco = window.monaco;
        if (monaco) {
          monaco.editor.setModelLanguage(model, activeTab.language);
        }
      }
    }
  }, [activeTab?.language]);

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const baseClass = "h-4 w-4 mr-2";
    
    switch (ext) {
      case 'js':
      case 'jsx':
        return <div className={cn(baseClass, "text-yellow-400 font-bold text-xs flex items-center justify-center")}>JS</div>;
      case 'ts':
      case 'tsx':
        return <div className={cn(baseClass, "text-blue-400 font-bold text-xs flex items-center justify-center")}>TS</div>;
      case 'css':
        return <div className={cn(baseClass, "text-blue-400 font-bold text-xs flex items-center justify-center")}>CSS</div>;
      case 'html':
        return <div className={cn(baseClass, "text-orange-400 font-bold text-xs flex items-center justify-center")}>HTML</div>;
      case 'json':
        return <div className={cn(baseClass, "text-yellow-500 font-bold text-xs flex items-center justify-center")}>JSON</div>;
      default:
        return <div className={cn(baseClass, "text-vs-text-muted font-bold text-xs flex items-center justify-center")}>•</div>;
    }
  };

  if (tabs.length === 0) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="bg-vs-panel border-b border-vs-border h-10"></div>
        <div className="flex-1 flex items-center justify-center bg-vs-bg">
          <div className="text-center text-vs-text-muted">
            <div className="text-2xl mb-2">👋</div>
            <h3 className="text-lg font-medium mb-2">{t("welcome")}</h3>
            <p>{t("openFileToStart")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Editor Tabs */}
      <div className="bg-vs-panel border-b border-vs-border">
        <div className="flex overflow-x-auto">
          {tabs.map((tab, index) => (
            <div
              key={tab.path}
              className={cn(
                "flex items-center px-4 py-2 text-sm border-r border-vs-border cursor-pointer min-w-0",
                index === activeTabIndex 
                  ? "bg-vs-bg border-b-2 border-b-vs-accent tab-active" 
                  : "hover:bg-vs-surface"
              )}
              onClick={() => onTabChange(index)}
            >
              {getFileIcon(tab.name)}
              <span className="truncate max-w-32">
                {tab.name}
                {tab.modified && <span className="text-vs-accent ml-1">•</span>}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 h-4 w-4 p-0 hover:bg-vs-surface rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  onTabClose(index);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 relative">
        {activeTab ? (
          <Editor
            height="100%"
            language={activeTab.language}
            value={activeTab.content}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            options={{
              theme: 'vs-dark-custom',
              fontSize: fontSize,
              fontFamily: 'Fira Code, Monaco, Consolas, monospace',
              ligatures: true,
              wordWrap: 'on',
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              insertSpaces: true,
              lineNumbers: 'on',
              glyphMargin: false,
              folding: true,
              lineDecorationsWidth: 0,
              lineNumbersMinChars: 3,
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-vs-bg">
            <div className="text-vs-text-muted">{t("noFileSelected")}</div>
          </div>
        )}
      </div>

      {/* Editor Status Bar */}
      {activeTab && (
        <div className="bg-vs-accent text-white px-4 py-1 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="capitalize">{activeTab.language}</span>
            <span>UTF-8</span>
            <span>LF</span>
            <span>Ln 1, Col 1</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-300 rounded-full"></div>
            <span>{t("ready")}</span>
          </div>
        </div>
      )}
    </div>
  );
}
