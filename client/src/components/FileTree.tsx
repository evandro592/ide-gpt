import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, File, Folder, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/translations";
import { localStorage } from "@/lib/localStorage";

interface FileSystemNode {
  name: string;
  path: string;
  isDirectory: boolean;
  size?: number;
  lastModified?: string;
  children?: FileSystemNode[];
}

interface FileTreeProps {
  onFileOpen: (filePath: string, fileName: string) => void;
}

interface TreeNodeProps {
  node: FileSystemNode;
  onFileOpen: (filePath: string, fileName: string) => void;
  level: number;
  selectedPath?: string;
  onSelect: (path: string) => void;
}

function TreeNode({ node, onFileOpen, level, selectedPath, onSelect }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level === 0);

  const handleClick = () => {
    onSelect(node.path);
    
    if (node.isDirectory) {
      setIsExpanded(!isExpanded);
    } else {
      onFileOpen(node.path, node.name);
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const iconClass = "h-4 w-4 mr-2";
    
    switch (ext) {
      case 'js':
      case 'jsx':
        return <div className={cn(iconClass, "text-yellow-400")}>JS</div>;
      case 'ts':
      case 'tsx':
        return <div className={cn(iconClass, "text-blue-400")}>TS</div>;
      case 'css':
        return <div className={cn(iconClass, "text-blue-400")}>CSS</div>;
      case 'html':
        return <div className={cn(iconClass, "text-orange-400")}>HTML</div>;
      case 'json':
        return <div className={cn(iconClass, "text-yellow-500")}>JSON</div>;
      case 'md':
        return <div className={cn(iconClass, "text-gray-400")}>MD</div>;
      case 'bat':
        return <div className={cn(iconClass, "text-green-400")}>BAT</div>;
      default:
        return <File className={cn(iconClass, "text-vs-text-muted")} />;
    }
  };

  return (
    <div>
      <div
        className={cn(
          "flex items-center py-1 px-2 rounded cursor-pointer tree-item transition-all duration-150",
          selectedPath === node.path && "bg-vs-accent bg-opacity-20",
          "hover:bg-vs-panel"
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleClick}
      >
        {node.isDirectory ? (
          <>
            {isExpanded ? (
              <ChevronDown className="h-3 w-3 mr-2 text-vs-text-muted flex-shrink-0" />
            ) : (
              <ChevronRight className="h-3 w-3 mr-2 text-vs-text-muted flex-shrink-0" />
            )}
            {isExpanded ? (
              <FolderOpen className="h-4 w-4 mr-2 text-vs-accent flex-shrink-0" />
            ) : (
              <Folder className="h-4 w-4 mr-2 text-yellow-500 flex-shrink-0" />
            )}
          </>
        ) : (
          <>
            <div className="w-3 mr-2 flex-shrink-0"></div>
            {getFileIcon(node.name)}
          </>
        )}
        <span className="text-sm truncate">{node.name}</span>
      </div>
      
      {node.isDirectory && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              onFileOpen={onFileOpen}
              level={level + 1}
              selectedPath={selectedPath}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileTree({ onFileOpen }: FileTreeProps) {
  const [selectedPath, setSelectedPath] = useState<string>("");
  const [language, setLanguage] = useState("pt");
  const { t } = useTranslation(language);

  // Carregar idioma das configurações
  React.useEffect(() => {
    const savedSettings = localStorage.getSettings();
    if (savedSettings?.language) {
      setLanguage(savedSettings.language);
    }
  }, []);

  const { data: fileTree, error, isLoading } = useQuery({
    queryKey: ["/api/files/tree"],
  });

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-3 border-b border-vs-border">
          <h2 className="text-sm font-medium uppercase tracking-wide text-vs-text-muted">
            {t("explorer")}
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-vs-text-muted">{t("loadingFiles")}</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-3 border-b border-vs-border">
          <h2 className="text-sm font-medium uppercase tracking-wide text-vs-text-muted">
            {t("explorer")}
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-red-400">{t("failedToLoadFiles")}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* File Explorer Header */}
      <div className="p-3 border-b border-vs-border">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium uppercase tracking-wide text-vs-text-muted">
            {t("explorer")}
          </h2>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-vs-panel"
            >
              <File className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-vs-panel"
            >
              <Folder className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {fileTree?.map((node: FileSystemNode) => (
            <TreeNode
              key={node.path}
              node={node}
              onFileOpen={onFileOpen}
              level={0}
              selectedPath={selectedPath}
              onSelect={setSelectedPath}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
