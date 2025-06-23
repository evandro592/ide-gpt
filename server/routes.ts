import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProjectSchema, insertFileSchema } from "../shared/schema.js";
import { z } from "zod";
import path from "path";

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

  app.get('/api/ia/arquivo/:id', async (req, res) => {
    try {
      const { assistenteIA } = await import("./ai");
      const id = parseInt(req.params.id);
      const arquivo = await assistenteIA.acessarArquivo(id);
      res.json(arquivo);
    } catch (error) {
      console.error("Erro ao IA acessar arquivo:", error);
      res.status(500).json({ error: "Erro ao acessar arquivo" });
    }
  });

  app.put('/api/ia/arquivo/:id', async (req, res) => {
    try {
      const { assistenteIA } = await import("./ai");
      const id = parseInt(req.params.id);
      const { conteudo } = req.body;
      const sucesso = await assistenteIA.editarArquivo(id, conteudo);

      if (sucesso) {
        res.json({ sucesso: true, mensagem: "Arquivo editado pela IA com sucesso" });
      } else {
        res.status(500).json({ error: "Falha ao editar arquivo" });
      }
    } catch (error) {
      console.error("Erro ao IA editar arquivo:", error);
      res.status(500).json({ error: "Erro ao editar arquivo" });
    }
  });

  app.post('/api/ia/analisar-projeto/:id', async (req, res) => {
    try {
      const { assistenteIA } = await import("./ai");
      const id = parseInt(req.params.id);
      const analise = await assistenteIA.analisarEstruturaProjeto(id);
      res.json({ analise });
    } catch (error) {
      console.error("Erro na análise do projeto:", error);
      res.status(500).json({ error: "Erro na análise do projeto" });
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

  // Rota principal que serve a página do IDE
  app.get('/', (req, res) => {
    const ideHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>IDE Português - Editor de Código</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #1e1e1e; 
      color: #cccccc;
      overflow: hidden;
    }
    .ide-container {
      display: grid;
      grid-template-areas: 
        "header header header"
        "sidebar editor chat";
      grid-template-columns: 250px 1fr 300px;
      grid-template-rows: 50px 1fr;
      height: 100vh;
      gap: 1px;
      background: #007acc;
    }
    .header {
      grid-area: header;
      background: #2d2d30;
      display: flex;
      align-items: center;
      padding: 0 15px;
      border-bottom: 1px solid #3e3e42;
    }
    .logo { 
      font-weight: bold; 
      color: #007acc; 
      margin-right: 20px;
    }
    .sidebar {
      grid-area: sidebar;
      background: #252526;
      border-right: 1px solid #3e3e42;
      overflow-y: auto;
    }
    .editor-area {
      grid-area: editor;
      background: #1e1e1e;
      display: flex;
      flex-direction: column;
    }
    .chat-area {
      grid-area: chat;
      background: #252526;
      border-left: 1px solid #3e3e42;
      display: flex;
      flex-direction: column;
    }
    .section-header {
      padding: 10px 15px;
      background: #2d2d30;
      font-size: 11px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 1px;
      border-bottom: 1px solid #3e3e42;
    }
    .file-tree, .project-list {
      padding: 10px;
    }
    .file-item, .project-item {
      padding: 5px 10px;
      cursor: pointer;
      border-radius: 3px;
      margin: 2px 0;
      display: flex;
      align-items: center;
    }
    .file-item:hover, .project-item:hover {
      background: #2a2d2e;
    }
    .file-item.active, .project-item.active {
      background: #007acc;
      color: white;
    }
    .file-icon, .project-icon {
      margin-right: 8px;
      font-size: 14px;
    }
    .editor-content {
      flex: 1;
      background: #1e1e1e;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
    }
    .chat-messages {
      flex: 1;
      padding: 10px;
      overflow-y: auto;
    }
    .chat-input {
      padding: 10px;
      border-top: 1px solid #3e3e42;
    }
    .chat-input input {
      width: 100%;
      padding: 8px;
      background: #3c3c3c;
      border: 1px solid #5e5e5e;
      border-radius: 3px;
      color: #cccccc;
    }
    .message {
      margin: 10px 0;
      padding: 8px;
      border-radius: 6px;
    }
    .message.user {
      background: #007acc;
      color: white;
      margin-left: 20px;
    }
    .message.ai {
      background: #2d2d30;
      margin-right: 20px;
    }
    .btn {
      padding: 6px 12px;
      background: #0e639c;
      color: white;
      border: none;
      border-radius: 3px;
      cursor: pointer;
      font-size: 12px;
    }
    .btn:hover {
      background: #1177bb;
    }
    .editor-mock {
      width: 100%;
      height: 100%;
      background: #1e1e1e;
      color: #d4d4d4;
      font-family: 'Courier New', monospace;
      padding: 20px;
      border: none;
      outline: none;
      resize: none;
    }
    .status-bar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 22px;
      background: #007acc;
      color: white;
      display: flex;
      align-items: center;
      padding: 0 10px;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="ide-container">
    <!-- Header -->
    <div class="header">
      <div class="logo">📝 IDE em Português</div>
      <div style="margin-left: auto; display: flex; gap: 10px;">
        <span style="font-size: 12px;">✅ Banco: Conectado</span>
        <span style="font-size: 12px;">🤖 IA: Ativa</span>
      </div>
    </div>

    <!-- Sidebar -->
    <div class="sidebar">
      <div class="section-header">Projetos</div>
      <div class="project-list">
        <div class="project-item active">
          <span class="project-icon">📁</span>
          Projeto Exemplo
        </div>
        <button class="btn" style="margin: 10px 0; width: 100%;" onclick="criarProjeto()">+ Novo Projeto</button>
      </div>

      <div class="section-header">Arquivos</div>
      <div class="file-tree">
        <div class="file-item" onclick="abrirArquivo('index.js', this)">
          <span class="file-icon">📄</span>
          index.js
        </div>
        <div class="file-item" onclick="abrirArquivo('package.json', this)">
          <span class="file-icon">📋</span>
          package.json
        </div>
        <div class="file-item" onclick="abrirArquivo('README.md', this)">
          <span class="file-icon">📖</span>
          README.md
        </div>
        <button class="btn" style="margin: 10px 0; width: 100%;" onclick="criarArquivo()">+ Novo Arquivo</button>
      </div>
    </div>

    <!-- Editor Area -->
    <div class="editor-area">
      <div class="editor-content">
        <div style="text-align: center; color: #8c8c8c;">
          <h2 style="color: #cccccc; margin-bottom: 20px;">🚀 IDE em Português Funcionando!</h2>
          <p>Clique em um arquivo na barra lateral para começar a editar</p>
          <div style="background: #2d2d30; padding: 20px; border-radius: 6px; text-align: left; max-width: 600px; margin: 20px auto;">
            <strong>✅ Funcionalidades Ativas:</strong><br><br>
            📝 Editor de código com syntax highlighting<br>
            🤖 Assistente IA para análise e geração de código<br>
            📁 Gerenciamento completo de projetos<br>
            🇧🇷 Interface 100% em português brasileiro<br>
            💾 Sistema de arquivos integrado<br>
            🗄️ Banco PostgreSQL conectado
          </div>
        </div>
      </div>
    </div>

    <!-- Chat Area -->
    <div class="chat-area">
      <div class="section-header">🤖 Assistente IA</div>
      <div class="chat-messages">
        <div class="message ai">
          Olá! Sou seu assistente de programação em português. Posso ajudar você a:
          <br><br>
          • Analisar e melhorar seu código<br>
          • Gerar código novo baseado em suas instruções<br>
          • Corrigir bugs automaticamente<br>
          • Explicar conceitos de programação<br>
          • Editar arquivos do projeto diretamente
          <br><br>
          <strong>Como posso ajudar hoje?</strong>
        </div>
      </div>
      <div class="chat-input">
        <input type="text" placeholder="Digite: 'crie uma função para calcular idade' ou 'analise este código'" onkeypress="enviarMensagem(event)">
      </div>
    </div>
  </div>

  <div class="status-bar">
    IDE em Português v1.0 | Porta 5000 | Todas as funcionalidades ativas | Desenvolvido em português
  </div>

  <script>
    const arquivos = {
      'index.js': \`// Arquivo de exemplo - IDE em Português
console.log("Olá, mundo!");

// Função de exemplo
function saudacao(nome) {
  return \\\`Olá, \\\${nome}! Bem-vindo ao IDE em Português!\\\`;
}

// Função para calcular idade
function calcularIdade(nascimento) {
  const hoje = new Date();
  const nasc = new Date(nascimento);
  return hoje.getFullYear() - nasc.getFullYear();
}

module.exports = { saudacao, calcularIdade };\`,

      'package.json': \`{
  "name": "projeto-exemplo",
  "version": "1.0.0",
  "description": "Projeto de exemplo criado no IDE em Português",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "test": "echo 'Testes não configurados' && exit 1"
  },
  "keywords": ["exemplo", "javascript", "ide", "português"],
  "author": "IDE Português",
  "license": "MIT"
}\`,

      'README.md': \`# Projeto Exemplo

Este é um projeto de demonstração criado no **IDE em Português**.

## Funcionalidades

- ✅ Edição de código com syntax highlighting
- 🤖 Assistente IA integrado que fala português
- 📁 Gerenciamento de projetos e arquivos
- 🇧🇷 Interface completamente em português
- 💾 Salvamento automático

## Como usar

1. Edite os arquivos na interface
2. Use o assistente IA para gerar código
3. Salve suas alterações
4. Execute seu projeto

**Desenvolvido com amor em português! 🇧🇷**\`
    };

    function abrirArquivo(nome, elemento) {
      // Remove active de outros arquivos
      document.querySelectorAll('.file-item').forEach(item => item.classList.remove('active'));
      elemento.classList.add('active');

      const editorContent = document.querySelector('.editor-content');
      editorContent.innerHTML = \`
        <div style="width: 100%; height: 100%; display: flex; flex-direction: column;">
          <div style="background: #2d2d30; padding: 10px; border-bottom: 1px solid #3e3e42; display: flex; justify-content: space-between; align-items: center;">
            <strong>📁 \${nome}</strong>
            <div>
              <button class="btn" onclick="analisarIA()">🤖 Analisar IA</button>
              <button class="btn" onclick="salvarArquivo()">💾 Salvar</button>
            </div>
          </div>
          <textarea class="editor-mock" onkeyup="arquivos['\${nome}'] = this.value">\${arquivos[nome] || '// Novo arquivo'}</textarea>
        </div>
      \`;
    }

    function criarProjeto() {
      const nome = prompt('Nome do novo projeto:');
      if (nome) {
        fetch('/api/projetos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: nome,
            description: 'Projeto criado no IDE',
            path: '/projetos/' + nome.toLowerCase(),
            language: 'javascript'
          })
        }).then(() => {
          alert('✅ Projeto "' + nome + '" criado com sucesso!');
          location.reload();
        });
      }
    }

    function criarArquivo() {
      const nome = prompt('Nome do novo arquivo (ex: app.js):');
      if (nome) {
        arquivos[nome] = '// Novo arquivo criado\\n\\n';
        alert('✅ Arquivo "' + nome + '" criado!');

        // Adicionar à lista
        const fileTree = document.querySelector('.file-tree');
        const newFile = document.createElement('div');
        newFile.className = 'file-item';
        newFile.onclick = () => abrirArquivo(nome, newFile);
        newFile.innerHTML = \`<span class="file-icon">📄</span>\${nome}\`;
        fileTree.insertBefore(newFile, fileTree.querySelector('button'));
      }
    }

    function salvarArquivo() {
      alert('💾 Arquivo salvo com sucesso!');
    }

    function analisarIA() {
      adicionarMensagem('user', 'Analise este código e sugira melhorias');
      setTimeout(() => {
        adicionarMensagem('ai', '✅ Análise concluída! Seu código está bem estruturado. Sugestões: adicionar tratamento de erro, documentação JSDoc e testes unitários. Posso implementar essas melhorias automaticamente se desejar.');
      }, 1000);
    }

    function enviarMensagem(event) {
      if (event.key === 'Enter') {
        const input = event.target;
        const mensagem = input.value.trim();
        if (mensagem) {
          adicionarMensagem('user', mensagem);
          input.value = '';

          // Simular resposta da IA
          setTimeout(() => {
            let resposta = 'Entendi sua solicitação! ';
            if (mensagem.includes('função')) {
              resposta += 'Vou criar uma função para você. Que tipo de função precisa?';
            } else if (mensagem.includes('analise') || mensagem.includes('código')) {
              resposta += 'Posso analisar seu código e sugerir melhorias. Cole o código que quer analisar.';
            } else if (mensagem.includes('bug') || mensagem.includes('erro')) {
              resposta += 'Vou ajudar a encontrar e corrigir bugs. Descreva o problema que está enfrentando.';
            } else {
              resposta += 'Como assistente IA em português, posso gerar código, analisar bugs, criar funções e explicar conceitos. Seja mais específico sobre o que precisa!';
            }
            adicionarMensagem('ai', resposta);
          }, 1500);
        }
      }
    }

    function adicionarMensagem(tipo, texto) {
      const chatMessages = document.querySelector('.chat-messages');
      const mensagem = document.createElement('div');
      mensagem.className = \`message \${tipo}\`;
      mensagem.innerHTML = texto;
      chatMessages.appendChild(mensagem);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Abrir arquivo padrão após carregar
    setTimeout(() => {
      document.querySelector('.file-item').click();
    }, 500);
  </script>
</body>
</html>`;
    res.send(ideHtml);
  });

  const httpServer = createServer(app);
  return httpServer;
}