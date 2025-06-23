import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = process.env.CORS_ORIGIN?.split(',').map(o => o.trim());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || !allowedOrigins || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  }
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Log de requisições
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Dados em memória para desenvolvimento local
let projetos = [
  {
    id: 1,
    name: "Projeto Exemplo",
    description: "Projeto de demonstração",
    path: "/projetos/exemplo",
    language: "javascript",
    createdAt: new Date().toISOString()
  }
];

let arquivos = [
  {
    id: 1,
    name: "index.js",
    path: "/projetos/exemplo/index.js",
    content: `// Arquivo de exemplo - IDE em Português
console.log("Olá, mundo!");

// Função de exemplo
function saudacao(nome) {
  return \`Olá, \${nome}! Bem-vindo ao IDE em Português!\`;
}

// Função para calcular idade
function calcularIdade(nascimento) {
  const hoje = new Date();
  const nasc = new Date(nascimento);
  return hoje.getFullYear() - nasc.getFullYear();
}

module.exports = { saudacao, calcularIdade };`,
    projectId: 1,
    type: "file",
    language: "javascript"
  },
  {
    id: 2,
    name: "package.json",
    path: "/projetos/exemplo/package.json",
    content: `{
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
}`,
    projectId: 1,
    type: "file",
    language: "json"
  },
  {
    id: 3,
    name: "README.md",
    path: "/projetos/exemplo/README.md",
    content: `# Projeto Exemplo

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

**Desenvolvido com amor em português! 🇧🇷**`,
    projectId: 1,
    type: "file",
    language: "markdown"
  }
];

// Rotas da API
app.get('/api/status', (req, res) => {
  res.json({
    status: 'funcionando',
    database: 'local (memória)',
    ia: process.env.OPENAI_API_KEY ? 'configurado' : 'não configurado',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/projetos', (req, res) => {
  res.json(projetos);
});

app.get('/api/projetos/:id', (req, res) => {
  const projeto = projetos.find(p => p.id == req.params.id);
  if (!projeto) {
    return res.status(404).json({ error: "Projeto não encontrado" });
  }
  res.json(projeto);
});

app.post('/api/projetos', (req, res) => {
  const novoProjeto = {
    id: projetos.length + 1,
    ...req.body,
    createdAt: new Date().toISOString()
  };
  projetos.push(novoProjeto);
  res.status(201).json(novoProjeto);
});

app.get('/api/projetos/:projectId/arquivos', (req, res) => {
  const projectId = parseInt(req.params.projectId);
  const arquivosProjeto = arquivos.filter(a => a.projectId === projectId);
  res.json(arquivosProjeto);
});

app.get('/api/arquivos/:id', (req, res) => {
  const arquivo = arquivos.find(a => a.id == req.params.id);
  if (!arquivo) {
    return res.status(404).json({ error: "Arquivo não encontrado" });
  }
  res.json(arquivo);
});

app.post('/api/arquivos', (req, res) => {
  const novoArquivo = {
    id: arquivos.length + 1,
    ...req.body,
    createdAt: new Date().toISOString()
  };
  arquivos.push(novoArquivo);
  res.status(201).json(novoArquivo);
});

app.put('/api/arquivos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = arquivos.findIndex(a => a.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Arquivo não encontrado" });
  }
  
  arquivos[index] = { ...arquivos[index], ...req.body, updatedAt: new Date().toISOString() };
  res.json(arquivos[index]);
});

// Chat IA
app.post('/api/chat', async (req, res) => {
  try {
    const { mensagem } = req.body;
    
    if (!process.env.OPENAI_API_KEY) {
      return res.json({
        resposta: "Assistente IA não configurado. Configure a chave OPENAI_API_KEY para usar esta funcionalidade."
      });
    }

    // Importar OpenAI dinamicamente
    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Você é um assistente de programação especializado. Responda sempre em português brasileiro."
        },
        {
          role: "user",
          content: mensagem
        }
      ],
      temperature: 0.7,
    });

    res.json({
      resposta: response.choices[0].message.content || "Não consegui processar sua solicitação."
    });
  } catch (error) {
    console.error("Erro no chat IA:", error);
    res.json({
      resposta: `Erro no assistente IA: ${error.message}`
    });
  }
});

// Página principal do IDE
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
        <span style="font-size: 12px;">✅ Local: Funcionando</span>
        <span style="font-size: 12px;">🤖 IA: ${process.env.OPENAI_API_KEY ? 'Ativa' : 'Não configurada'}</span>
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
      <div class="file-tree" id="file-tree">
        <!-- Arquivos serão carregados dinamicamente -->
      </div>
    </div>
    
    <!-- Editor Area -->
    <div class="editor-area">
      <div class="editor-content">
        <div style="text-align: center; color: #8c8c8c;">
          <h2 style="color: #cccccc; margin-bottom: 20px;">🚀 IDE em Português - Versão Local</h2>
          <p>Clique em um arquivo na barra lateral para começar a editar</p>
          <div style="background: #2d2d30; padding: 20px; border-radius: 6px; text-align: left; max-width: 600px; margin: 20px auto;">
            <strong>✅ Funcionalidades Ativas:</strong><br><br>
            📝 Editor de código funcional<br>
            🤖 Assistente IA (${process.env.OPENAI_API_KEY ? 'configurado' : 'configure OPENAI_API_KEY'})<br>
            📁 Gerenciamento de projetos em memória<br>
            🇧🇷 Interface 100% em português brasileiro<br>
            💾 Sistema de arquivos local<br>
            🖥️ Funcionando no seu Windows
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
          • Sugerir melhorias no código
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
    IDE em Português v1.0 (Local) | Porta 5000 | Funcionando no Windows | Desenvolvido em português
  </div>
  
  <script>
    let arquivosCarregados = {};
    let arquivoAtivo = null;
    
    // Carregar arquivos do projeto
    fetch('/api/projetos/1/arquivos')
      .then(response => response.json())
      .then(arquivos => {
        const fileTree = document.getElementById('file-tree');
        arquivos.forEach(arquivo => {
          arquivosCarregados[arquivo.name] = arquivo;
          
          const fileItem = document.createElement('div');
          fileItem.className = 'file-item';
          fileItem.onclick = () => abrirArquivo(arquivo.name, fileItem);
          
          const icon = arquivo.language === 'javascript' ? '📄' :
                      arquivo.language === 'json' ? '📋' :
                      arquivo.language === 'markdown' ? '📖' : '📄';
          
          fileItem.innerHTML = \`<span class="file-icon">\${icon}</span>\${arquivo.name}\`;
          fileTree.appendChild(fileItem);
        });
        
        // Botão novo arquivo
        const btnNovoArquivo = document.createElement('button');
        btnNovoArquivo.className = 'btn';
        btnNovoArquivo.style.cssText = 'margin: 10px 0; width: 100%;';
        btnNovoArquivo.textContent = '+ Novo Arquivo';
        btnNovoArquivo.onclick = criarArquivo;
        fileTree.appendChild(btnNovoArquivo);
      });
    
    function abrirArquivo(nome, elemento) {
      document.querySelectorAll('.file-item').forEach(item => item.classList.remove('active'));
      elemento.classList.add('active');
      arquivoAtivo = nome;
      
      const arquivo = arquivosCarregados[nome];
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
          <textarea class="editor-mock" id="editor-\${nome}" onkeyup="arquivosCarregados['\${nome}'].content = this.value">\${arquivo.content}</textarea>
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
        fetch('/api/arquivos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: nome,
            path: '/projetos/exemplo/' + nome,
            content: '// Novo arquivo criado\\n\\n',
            projectId: 1,
            type: 'file',
            language: nome.endsWith('.js') ? 'javascript' : 'text'
          })
        }).then(response => response.json())
        .then(arquivo => {
          alert('✅ Arquivo "' + nome + '" criado!');
          location.reload();
        });
      }
    }
    
    function salvarArquivo() {
      if (arquivoAtivo) {
        const arquivo = arquivosCarregados[arquivoAtivo];
        fetch(\`/api/arquivos/\${arquivo.id}\`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: arquivo.content
          })
        }).then(() => {
          alert('💾 Arquivo salvo com sucesso!');
        });
      }
    }
    
    function analisarIA() {
      if (arquivoAtivo) {
        const conteudo = arquivosCarregados[arquivoAtivo].content;
        adicionarMensagem('user', 'Analise este código: ' + conteudo.substring(0, 100) + '...');
        
        fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mensagem: 'Analise este código e sugira melhorias: ' + conteudo
          })
        })
        .then(response => response.json())
        .then(data => {
          adicionarMensagem('ai', data.resposta);
        });
      }
    }
    
    function enviarMensagem(event) {
      if (event.key === 'Enter') {
        const input = event.target;
        const mensagem = input.value.trim();
        if (mensagem) {
          adicionarMensagem('user', mensagem);
          input.value = '';
          
          fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mensagem })
          })
          .then(response => response.json())
          .then(data => {
            adicionarMensagem('ai', data.resposta);
          });
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
  </script>
</body>
</html>`;
  res.send(ideHtml);
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 IDE em Português (Local) rodando na porta ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`💾 Dados: Armazenados em memória (local)`);
  console.log(`🤖 OpenAI: ${process.env.OPENAI_API_KEY ? 'Configurado' : 'Não configurado'}`);
  console.log(`🖥️ Funcionando no Windows desktop`);
});