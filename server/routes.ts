import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProjectSchema, insertFileSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware para validação de JSON
  app.use('/api', (req, res, next) => {
    if (req.headers['content-type'] === 'application/json' && req.body === undefined) {
      return res.status(400).json({ error: 'JSON inválido' });
    }
    next();
  });

  // Rotas de projetos
  app.get('/api/projetos', async (req, res) => {
    try {
      const projetos = await storage.getProjects();
      res.json(projetos);
    } catch (error) {
      console.error("Erro ao buscar projetos:", error);
      res.status(500).json({ error: "Erro ao buscar projetos" });
    }
  });

  app.get('/api/projetos/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const projeto = await storage.getProject(id);
      
      if (!projeto) {
        return res.status(404).json({ error: "Projeto não encontrado" });
      }
      
      res.json(projeto);
    } catch (error) {
      console.error("Erro ao buscar projeto:", error);
      res.status(500).json({ error: "Erro ao buscar projeto" });
    }
  });

  app.post('/api/projetos', async (req, res) => {
    try {
      const dados = insertProjectSchema.parse(req.body);
      const projeto = await storage.createProject(dados);
      res.status(201).json(projeto);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Dados inválidos", details: error.errors });
      }
      console.error("Erro ao criar projeto:", error);
      res.status(500).json({ error: "Erro ao criar projeto" });
    }
  });

  app.put('/api/projetos/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const dados = insertProjectSchema.partial().parse(req.body);
      const projeto = await storage.updateProject(id, dados);
      
      if (!projeto) {
        return res.status(404).json({ error: "Projeto não encontrado" });
      }
      
      res.json(projeto);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Dados inválidos", details: error.errors });
      }
      console.error("Erro ao atualizar projeto:", error);
      res.status(500).json({ error: "Erro ao atualizar projeto" });
    }
  });

  app.delete('/api/projetos/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const sucesso = await storage.deleteProject(id);
      
      if (!sucesso) {
        return res.status(404).json({ error: "Projeto não encontrado" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Erro ao deletar projeto:", error);
      res.status(500).json({ error: "Erro ao deletar projeto" });
    }
  });

  // Rotas de arquivos
  app.get('/api/projetos/:projectId/arquivos', async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const arquivos = await storage.getFiles(projectId);
      res.json(arquivos);
    } catch (error) {
      console.error("Erro ao buscar arquivos:", error);
      res.status(500).json({ error: "Erro ao buscar arquivos" });
    }
  });

  app.get('/api/arquivos/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const arquivo = await storage.getFile(id);
      
      if (!arquivo) {
        return res.status(404).json({ error: "Arquivo não encontrado" });
      }
      
      res.json(arquivo);
    } catch (error) {
      console.error("Erro ao buscar arquivo:", error);
      res.status(500).json({ error: "Erro ao buscar arquivo" });
    }
  });

  app.post('/api/arquivos', async (req, res) => {
    try {
      const dados = insertFileSchema.parse(req.body);
      const arquivo = await storage.createFile(dados);
      res.status(201).json(arquivo);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Dados inválidos", details: error.errors });
      }
      console.error("Erro ao criar arquivo:", error);
      res.status(500).json({ error: "Erro ao criar arquivo" });
    }
  });

  app.put('/api/arquivos/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const dados = insertFileSchema.partial().parse(req.body);
      const arquivo = await storage.updateFile(id, dados);
      
      if (!arquivo) {
        return res.status(404).json({ error: "Arquivo não encontrado" });
      }
      
      res.json(arquivo);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Dados inválidos", details: error.errors });
      }
      console.error("Erro ao atualizar arquivo:", error);
      res.status(500).json({ error: "Erro ao atualizar arquivo" });
    }
  });

  app.delete('/api/arquivos/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const sucesso = await storage.deleteFile(id);
      
      if (!sucesso) {
        return res.status(404).json({ error: "Arquivo não encontrado" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Erro ao deletar arquivo:", error);
      res.status(500).json({ error: "Erro ao deletar arquivo" });
    }
  });

  // Rotas de IA
  app.post('/api/chat', async (req, res) => {
    try {
      const { assistenteIA } = await import("./ai");
      const request = req.body;
      const resposta = await assistenteIA.processarMensagem(request);
      res.json(resposta);
    } catch (error) {
      console.error("Erro no chat IA:", error);
      res.status(500).json({ error: "Erro no assistente IA" });
    }
  });

  app.post('/api/analisar-codigo', async (req, res) => {
    try {
      const { assistenteIA } = await import("./ai");
      const { codigo, linguagem } = req.body;
      const analise = await assistenteIA.analisarCodigo(codigo, linguagem);
      res.json({ analise });
    } catch (error) {
      console.error("Erro na análise de código:", error);
      res.status(500).json({ error: "Erro na análise de código" });
    }
  });

  app.post('/api/gerar-codigo', async (req, res) => {
    try {
      const { assistenteIA } = await import("./ai");
      const { descricao, linguagem } = req.body;
      const codigo = await assistenteIA.gerarCodigo(descricao, linguagem);
      res.json({ codigo });
    } catch (error) {
      console.error("Erro na geração de código:", error);
      res.status(500).json({ error: "Erro na geração de código" });
    }
  });

  // Rota para verificar status da aplicação
  app.get('/api/status', (req, res) => {
    res.json({
      status: 'funcionando',
      database: 'conectado',
      ia: process.env.OPENAI_API_KEY ? 'configurado' : 'não configurado',
      timestamp: new Date().toISOString()
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}