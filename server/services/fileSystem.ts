import fs from 'fs/promises';
import path from 'path';
import { File } from '@shared/schema';

export interface FileSystemNode {
  name: string;
  path: string;
  isDirectory: boolean;
  size?: number;
  lastModified?: string;
  children?: FileSystemNode[];
}

export async function readProjectDirectory(projectPath: string = process.cwd()): Promise<FileSystemNode[]> {
  try {
    const entries = await fs.readdir(projectPath, { withFileTypes: true });
    const nodes: FileSystemNode[] = [];

    for (const entry of entries) {
      // Skip hidden files and node_modules
      if (entry.name.startsWith('.') || entry.name === 'node_modules') {
        continue;
      }

      const fullPath = path.join(projectPath, entry.name);
      const relativePath = path.relative(process.cwd(), fullPath);
      
      const node: FileSystemNode = {
        name: entry.name,
        path: '/' + relativePath.replace(/\\/g, '/'),
        isDirectory: entry.isDirectory(),
      };

      if (entry.isDirectory()) {
        try {
          node.children = await readProjectDirectory(fullPath);
        } catch (error) {
          // If we can't read the directory, skip it
          console.warn(`Cannot read directory ${fullPath}:`, error);
          continue;
        }
      } else {
        try {
          const stats = await fs.stat(fullPath);
          node.size = stats.size;
          node.lastModified = stats.mtime.toISOString();
        } catch (error) {
          console.warn(`Cannot stat file ${fullPath}:`, error);
        }
      }

      nodes.push(node);
    }

    return nodes.sort((a, b) => {
      // Directories first, then files
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });
  } catch (error) {
    throw new Error(`Failed to read directory ${projectPath}: ${(error as Error).message}`);
  }
}

export async function readFileContent(filePath: string): Promise<string> {
  try {
    const fullPath = path.resolve(process.cwd(), filePath.startsWith('/') ? filePath.slice(1) : filePath);
    const content = await fs.readFile(fullPath, 'utf-8');
    return content;
  } catch (error) {
    throw new Error(`Failed to read file ${filePath}: ${(error as Error).message}`);
  }
}

export async function writeFileContent(filePath: string, content: string): Promise<void> {
  try {
    const fullPath = path.resolve(process.cwd(), filePath.startsWith('/') ? filePath.slice(1) : filePath);
    const dir = path.dirname(fullPath);
    
    // Ensure directory exists
    await fs.mkdir(dir, { recursive: true });
    
    await fs.writeFile(fullPath, content, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to write file ${filePath}: ${(error as Error).message}`);
  }
}

export async function createDirectory(dirPath: string): Promise<void> {
  try {
    const fullPath = path.resolve(process.cwd(), dirPath.startsWith('/') ? dirPath.slice(1) : dirPath);
    await fs.mkdir(fullPath, { recursive: true });
  } catch (error) {
    throw new Error(`Failed to create directory ${dirPath}: ${(error as Error).message}`);
  }
}

export async function deleteFileOrDirectory(filePath: string): Promise<void> {
  try {
    const fullPath = path.resolve(process.cwd(), filePath.startsWith('/') ? filePath.slice(1) : filePath);
    const stats = await fs.stat(fullPath);
    
    if (stats.isDirectory()) {
      await fs.rmdir(fullPath, { recursive: true });
    } else {
      await fs.unlink(fullPath);
    }
  } catch (error) {
    throw new Error(`Failed to delete ${filePath}: ${(error as Error).message}`);
  }
}

export function getFileLanguage(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  const languageMap: Record<string, string> = {
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.py': 'python',
    '.java': 'java',
    '.cpp': 'cpp',
    '.c': 'c',
    '.cs': 'csharp',
    '.php': 'php',
    '.rb': 'ruby',
    '.go': 'go',
    '.rs': 'rust',
    '.html': 'html',
    '.css': 'css',
    '.scss': 'scss',
    '.json': 'json',
    '.xml': 'xml',
    '.yaml': 'yaml',
    '.yml': 'yaml',
    '.md': 'markdown',
    '.sql': 'sql',
    '.sh': 'shell',
    '.bat': 'batch',
  };
  
  return languageMap[ext] || 'plaintext';
}
