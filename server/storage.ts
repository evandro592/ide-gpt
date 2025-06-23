import { 
  users, files, chatMessages, projectSettings,
  type User, type InsertUser, 
  type File, type InsertFile,
  type ChatMessage, type InsertChatMessage,
  type ProjectSettings, type InsertProjectSettings
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // File operations
  getFile(id: number): Promise<File | undefined>;
  getFileByPath(path: string): Promise<File | undefined>;
  getFilesByParentId(parentId: number | null): Promise<File[]>;
  createFile(file: InsertFile): Promise<File>;
  updateFile(id: number, updates: Partial<InsertFile>): Promise<File | undefined>;
  deleteFile(id: number): Promise<boolean>;
  getFileTree(): Promise<File[]>;

  // Chat operations
  getChatMessages(): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  clearChatHistory(): Promise<boolean>;

  // Settings operations
  getProjectSettings(): Promise<ProjectSettings | undefined>;
  updateProjectSettings(settings: InsertProjectSettings): Promise<ProjectSettings>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private files: Map<number, File>;
  private chatMessages: Map<number, ChatMessage>;
  private projectSettings: ProjectSettings | undefined;
  private currentUserId: number;
  private currentFileId: number;
  private currentChatId: number;

  constructor() {
    this.users = new Map();
    this.files = new Map();
    this.chatMessages = new Map();
    this.currentUserId = 1;
    this.currentFileId = 1;
    this.currentChatId = 1;
    this.initializeDefaultProject();
  }

  private initializeDefaultProject() {
    // Create default project structure
    const rootDir: File = {
      id: this.currentFileId++,
      name: "my-react-project",
      path: "/",
      content: null,
      isDirectory: true,
      parentId: null,
      size: 0,
      lastModified: new Date().toISOString(),
    };
    this.files.set(rootDir.id, rootDir);

    const srcDir: File = {
      id: this.currentFileId++,
      name: "src",
      path: "/src",
      content: null,
      isDirectory: true,
      parentId: rootDir.id,
      size: 0,
      lastModified: new Date().toISOString(),
    };
    this.files.set(srcDir.id, srcDir);

    const componentsDir: File = {
      id: this.currentFileId++,
      name: "components",
      path: "/src/components",
      content: null,
      isDirectory: true,
      parentId: srcDir.id,
      size: 0,
      lastModified: new Date().toISOString(),
    };
    this.files.set(componentsDir.id, componentsDir);

    const editorDir: File = {
      id: this.currentFileId++,
      name: "editor",
      path: "/src/components/editor",
      content: null,
      isDirectory: true,
      parentId: componentsDir.id,
      size: 0,
      lastModified: new Date().toISOString(),
    };
    this.files.set(editorDir.id, editorDir);

    // Sample files
    const codeEditorFile: File = {
      id: this.currentFileId++,
      name: "CodeEditor.jsx",
      path: "/src/components/editor/CodeEditor.jsx",
      content: `import React, { useState, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';

const CodeEditor = ({ file, onChange }) => {
  const [content, setContent] = useState('');

  useEffect(() => {
    // TODO: Load file content from file system
    if (file) {
      loadFileContent(file).then(setContent);
    }
  }, [file]);

  return (
    <MonacoEditor
      height="100%"
      defaultLanguage="javascript"
      value={content}
      onChange={onChange}
      theme="vs-dark"
    />
  );
};

export default CodeEditor;`,
      isDirectory: false,
      parentId: editorDir.id,
      size: 623,
      lastModified: new Date().toISOString(),
    };
    this.files.set(codeEditorFile.id, codeEditorFile);

    // Initialize default settings
    this.projectSettings = {
      id: 1,
      theme: "dark",
      fontSize: 14,
      autoSave: true,
      language: "pt",
      settings: {
        editor: {
          wordWrap: "on",
          minimap: { enabled: true },
          lineNumbers: "on",
        },
      },
    };
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // File operations
  async getFile(id: number): Promise<File | undefined> {
    return this.files.get(id);
  }

  async getFileByPath(path: string): Promise<File | undefined> {
    return Array.from(this.files.values()).find(file => file.path === path);
  }

  async getFilesByParentId(parentId: number | null): Promise<File[]> {
    return Array.from(this.files.values()).filter(file => file.parentId === parentId);
  }

  async createFile(insertFile: InsertFile): Promise<File> {
    const id = this.currentFileId++;
    const file: File = { 
      ...insertFile,
      content: insertFile.content || null,
      size: insertFile.size || 0,
      isDirectory: insertFile.isDirectory || false,
      parentId: insertFile.parentId || null,
      id, 
      lastModified: new Date().toISOString() 
    };
    this.files.set(id, file);
    return file;
  }

  async updateFile(id: number, updates: Partial<InsertFile>): Promise<File | undefined> {
    const file = this.files.get(id);
    if (!file) return undefined;

    const updatedFile: File = { 
      ...file, 
      ...updates, 
      lastModified: new Date().toISOString() 
    };
    this.files.set(id, updatedFile);
    return updatedFile;
  }

  async deleteFile(id: number): Promise<boolean> {
    return this.files.delete(id);
  }

  async getFileTree(): Promise<File[]> {
    return Array.from(this.files.values()).sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });
  }

  // Chat operations
  async getChatMessages(): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values()).sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentChatId++;
    const message: ChatMessage = { 
      ...insertMessage,
      metadata: insertMessage.metadata || null,
      id, 
      timestamp: new Date().toISOString() 
    };
    this.chatMessages.set(id, message);
    return message;
  }

  async clearChatHistory(): Promise<boolean> {
    this.chatMessages.clear();
    return true;
  }

  // Settings operations
  async getProjectSettings(): Promise<ProjectSettings | undefined> {
    return this.projectSettings;
  }

  async updateProjectSettings(settings: InsertProjectSettings): Promise<ProjectSettings> {
    this.projectSettings = { 
      id: this.projectSettings?.id || 1,
      theme: settings.theme || this.projectSettings?.theme || "dark",
      fontSize: settings.fontSize || this.projectSettings?.fontSize || 14,
      autoSave: settings.autoSave !== undefined ? settings.autoSave : this.projectSettings?.autoSave || true,
      language: settings.language || this.projectSettings?.language || "pt",
      settings: settings.settings || this.projectSettings?.settings || {}
    };
    return this.projectSettings;
  }
}

export const storage = new MemStorage();
