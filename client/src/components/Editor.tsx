import { Editor as MonacoEditor } from '@monaco-editor/react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Save, Bot, Play } from 'lucide-react';
import type { File } from '@shared/schema';

interface EditorProps {
  arquivo?: File | null;
  onSave?: (conteudo: string) => void;
  onAnalyzeCode?: (codigo: string, linguagem: string) => void;
  onRunCode?: () => void;
}

export function Editor({ arquivo, onSave, onAnalyzeCode, onRunCode }: EditorProps) {
  const [conteudo, setConteudo] = useState('');
  const [alterado, setAlterado] = useState(false);
  const editorRef = useRef(null);

  useEffect(() => {
    if (arquivo?.content) {
      setConteudo(arquivo.content);
      setAlterado(false);
    }
  }, [arquivo]);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;

    // Configurar tema escuro personalizado
    editor.defineTheme('ide-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: '', foreground: 'D4D4D4', background: '1E1E1E' },
        { token: 'comment', foreground: '6A9955' },
        { token: 'keyword', foreground: '569CD6' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'function', foreground: 'DCDCAA' },
      ],
      colors: {
        'editor.background': '#1E1E1E',
        'editor.foreground': '#D4D4D4',
        'editorLineNumber.foreground': '#858585',
        'editor.selectionBackground': '#264F78',
        'editor.inactiveSelectionBackground': '#3A3D41',
        'editorCursor.foreground': '#AEAFAD',
      }
    });

    editor.setTheme('ide-dark');
  };

  const handleChange = (valor: string | undefined) => {
    setConteudo(valor || '');
    setAlterado(true);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(conteudo);
      setAlterado(false);
    }
  };

  const handleAnalyze = () => {
    if (onAnalyzeCode && arquivo) {
      const codigoSelecionado = editorRef.current?.getSelection()
        ? editorRef.current?.getModel()?.getValueInRange(editorRef.current?.getSelection())
        : conteudo;

      onAnalyzeCode(codigoSelecionado || conteudo, arquivo.language || 'javascript');
    }
  };

  const getLinguagem = () => {
    if (!arquivo) return 'plaintext';

    const extensao = arquivo.name.split('.').pop();
    const mapeamento: Record<string, string> = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'json': 'json',
      'md': 'markdown',
      'xml': 'xml',
      'sql': 'sql',
      'php': 'php',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'go': 'go',
      'rs': 'rust',
      'rb': 'ruby',
      'kt': 'kotlin',
      'swift': 'swift',
      'dart': 'dart',
    };

    return mapeamento[extensao || ''] || 'plaintext';
  };

  if (!arquivo) {
    return (
      <div className="flex items-center justify-center h-full bg-background text-muted-foreground">
        <div className="text-center">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-lg font-medium mb-2">Nenhum arquivo selecionado</h3>
          <p className="text-sm">Selecione um arquivo na barra lateral para começar a editá-lo</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Barra de ferramentas */}
      <div className="flex items-center justify-between p-3 border-b bg-card">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">{arquivo.name}</h3>
          {alterado && (
            <span className="w-2 h-2 bg-orange-500 rounded-full" title="Arquivo modificado" />
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAnalyze}
            title="Analisar código com IA"
          >
            <Bot className="w-4 h-4" />
            Analisar IA
          </Button>

          {onRunCode && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRunCode}
              title="Executar código"
            >
              <Play className="w-4 h-4" />
              Executar
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            disabled={!alterado}
            title="Salvar arquivo (Ctrl+S)"
          >
            <Save className="w-4 h-4" />
            Salvar
          </Button>
        </div>
      </div>

      {/* Editor Monaco */}
      <div className="flex-1">
        <MonacoEditor
          height="100%"
          language={getLinguagem()}
          value={conteudo}
          onChange={handleChange}
          onMount={handleEditorDidMount}
          options={{
            theme: 'ide-dark',
            fontSize: 14,
            fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            minimap: { enabled: true },
            bracketPairColorization: { enabled: true },
            guides: {
              bracketPairs: true,
              indentation: true,
            },
            suggest: {
              showKeywords: true,
              showSnippets: true,
            },
            quickSuggestions: true,
            wordWrap: 'on',
            tabSize: 2,
            insertSpaces: true,
          }}
        />
      </div>
    </div>
  );
}