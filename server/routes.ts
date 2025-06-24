import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeCode, chatWithAI, generateCode, explainCode } from "./services/openai";
import { readProjectDirectory, readFileContent, writeFileContent, createDirectory, deleteFileOrDirectory, getFileLanguage } from "./services/fileSystem";
import { getAllScriptTemplates } from "./services/scriptGenerator";
import { insertFileSchema, insertChatMessageSchema, insertProjectSettingsSchema } from "@shared/schema";
import fs from 'fs/promises';

export async function registerRoutes(app: Express): Promise<Server> {
  // File system routes
  app.get("/api/files/tree", async (req, res) => {
    try {
      const tree = await readProjectDirectory();
      res.json(tree);
    } catch (error) {
      res.status(500).json({ message: "Failed to read project directory", error: (error as Error).message });
    }
  });

  app.get("/api/files/content", async (req, res) => {
    try {
      const { path } = req.query;
      if (!path || typeof path !== 'string') {
        return res.status(400).json({ message: "File path is required" });
      }

      const content = await readFileContent(path);
      const language = getFileLanguage(path);

      res.json({ content, language, path });
    } catch (error) {
      res.status(500).json({ message: "Failed to read file", error: (error as Error).message });
    }
  });

  app.post("/api/files/save", async (req, res) => {
    try {
      const { path, content } = req.body;
      if (!path || typeof path !== 'string' || typeof content !== 'string') {
        return res.status(400).json({ message: "Path and content are required" });
      }

      await writeFileContent(path, content);
      res.json({ message: "File saved successfully", path });
    } catch (error) {
      res.status(500).json({ message: "Failed to save file", error: (error as Error).message });
    }
  });

  app.post("/api/files/create", async (req, res) => {
    try {
      const { path, isDirectory = false, content = "" } = req.body;
      if (!path || typeof path !== 'string') {
        return res.status(400).json({ message: "Path is required" });
      }

      if (isDirectory) {
        await createDirectory(path);
      } else {
        await writeFileContent(path, content);
      }

      res.json({ message: `${isDirectory ? 'Directory' : 'File'} created successfully`, path });
    } catch (error) {
      res.status(500).json({ message: "Failed to create file/directory", error: (error as Error).message });
    }
  });

  app.delete("/api/files", async (req, res) => {
    try {
      const { path } = req.query;
      if (!path || typeof path !== 'string') {
        return res.status(400).json({ message: "File path is required" });
      }

      await deleteFileOrDirectory(path);
      res.json({ message: "File/directory deleted successfully", path });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete file/directory", error: (error as Error).message });
    }
  });

  // Chat routes
  app.get("/api/chat/messages", async (req, res) => {
    try {
      const messages = await storage.getChatMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to get chat messages", error: (error as Error).message });
    }
  });

  app.post("/api/chat/send", async (req, res) => {
    try {
      const { content, context } = req.body;
      if (!content || typeof content !== 'string') {
        return res.status(400).json({ message: "Message content is required" });
      }

      // Save user message
      const userMessage = await storage.createChatMessage({
        role: "user",
        content,
        metadata: context ? { context } : null,
      });

      // Get AI response
      const aiResponse = await chatWithAI(content, context);

      // Save AI response
      const assistantMessage = await storage.createChatMessage({
        role: "assistant",
        content: aiResponse.message,
        metadata: {
          suggestions: aiResponse.suggestions,
          codeSnippet: aiResponse.codeSnippet,
        },
      });

      res.json({
        userMessage,
        assistantMessage,
        response: aiResponse,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to send chat message", error: (error as Error).message });
    }
  });

  app.delete("/api/chat/clear", async (req, res) => {
    try {
      await storage.clearChatHistory();
      res.json({ message: "Chat history cleared successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear chat history", error: (error as Error).message });
    }
  });

  // AI code analysis routes
  app.post("/api/ai/analyze", async (req, res) => {
    try {
      const { code, language = "javascript" } = req.body;
      if (!code || typeof code !== 'string') {
        return res.status(400).json({ message: "Code is required" });
      }

      const analysis = await analyzeCode(code, language);
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ message: "Failed to analyze code", error: (error as Error).message });
    }
  });

  app.post("/api/ai/generate", async (req, res) => {
    try {
      const { prompt, language = "javascript" } = req.body;
      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ message: "Prompt is required" });
      }

      const generatedCode = await generateCode(prompt, language);
      res.json({ code: generatedCode, language });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate code", error: (error as Error).message });
    }
  });

  app.post("/api/ai/explain", async (req, res) => {
    try {
      const { code, language = "javascript" } = req.body;
      if (!code || typeof code !== 'string') {
        return res.status(400).json({ message: "Code is required" });
      }

      const explanation = await explainCode(code, language);
      res.json({ explanation });
    } catch (error) {
      res.status(500).json({ message: "Failed to explain code", error: (error as Error).message });
    }
  });

  // Script generation routes
  app.get("/api/scripts/templates", async (req, res) => {
    try {
      const templates = getAllScriptTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to get script templates", error: (error as Error).message });
    }
  });

  app.post("/api/scripts/generate", async (req, res) => {
    try {
      const { scriptName } = req.body;
      if (!scriptName || typeof scriptName !== 'string') {
        return res.status(400).json({ message: "Script name is required" });
      }

      const templates = getAllScriptTemplates();
      const template = templates.find(t => t.name === scriptName);

      if (!template) {
        return res.status(404).json({ message: "Script template not found" });
      }

      // Write the script file
      await fs.writeFile(template.name, template.content, 'utf-8');

      res.json({ 
        message: "Script generated successfully", 
        name: template.name,
        path: `./${template.name}`
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate script", error: (error as Error).message });
    }
  });

  // Settings routes
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getProjectSettings();
      res.json(settings || { theme: "dark", fontSize: 14, autoSave: true, settings: {} });
    } catch (error) {
      res.status(500).json({ message: "Failed to get settings", error: (error as Error).message });
    }
  });

  app.post("/api/settings", async (req, res) => {
    try {
      const validatedSettings = insertProjectSettingsSchema.parse(req.body);
      const settings = await storage.updateProjectSettings(validatedSettings);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to update settings", error: (error as Error).message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
