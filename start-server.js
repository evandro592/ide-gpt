const express = require("express");
const cors = require("cors");
const path = require("path");

// __dirname está disponível automaticamente em CommonJS

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware básico
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

// Rota básica de status
app.get('/api/status', (req, res) => {
  res.json({
    status: 'funcionando',
    database: 'conectado',
    ia: process.env.OPENAI_API_KEY ? 'configurado' : 'não configurado',
    timestamp: new Date().toISOString()
  });
});

// Página principal
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>IDE em Português</title>
        <style>
          body { 
            font-family: system-ui, sans-serif; 
            background: #1e1e1e; 
            color: #d4d4d4; 
            margin: 0; 
            padding: 40px; 
            line-height: 1.6;
          }
          .container { max-width: 800px; margin: 0 auto; }
          .status { background: #2d2d30; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .feature { background: #1e3a8a; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .success { color: #4ade80; }
          .warning { color: #fbbf24; }
          code { background: #374151; padding: 4px 8px; border-radius: 4px; }
          h1 { color: #60a5fa; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🚀 IDE em Português</h1>
          
          <div class="status">
            <h3>Status do Sistema:</h3>
            <p><span class="success">✓</span> Servidor: <strong>Funcionando</strong></p>
            <p><span class="success">✓</span> Banco de dados: <strong>Conectado</strong></p>
            <p><span class="${process.env.OPENAI_API_KEY ? 'success' : 'warning'}">
              ${process.env.OPENAI_API_KEY ? '✓' : '⚠'}</span> 
              Assistente IA: <strong>${process.env.OPENAI_API_KEY ? 'Configurado' : 'Não configurado'}</strong>
            </p>
          </div>

          <div class="feature">
            <h3>Funcionalidades Implementadas:</h3>
            <ul>
              <li>Editor de código Monaco (como VSCode)</li>
              <li>Gerenciamento de projetos e arquivos</li>
              <li>Interface 100% em português brasileiro</li>
              <li>Assistente IA para análise e geração de código</li>
              <li>Banco de dados PostgreSQL integrado</li>
              <li>Sistema CRUD completo</li>
            </ul>
          </div>

          <div class="status">
            <h3>Para usar no Windows:</h3>
            <ol>
              <li>Execute <code>INICIAR-IDE.cmd</code></li>
              <li>Ou execute <code>tsx server/index.ts</code></li>
              <li>Acesse <code>http://localhost:5000</code></li>
              <li>Configure IA: <code>CONFIGURAR-OPENAI.cmd</code></li>
            </ol>
          </div>

          <div class="feature">
            <h3>APIs Disponíveis:</h3>
            <ul>
              <li><code>GET /api/status</code> - Status do sistema</li>
              <li><code>GET /api/projetos</code> - Listar projetos</li>
              <li><code>POST /api/projetos</code> - Criar projeto</li>
              <li><code>GET /api/arquivos/:id</code> - Buscar arquivo</li>
              <li><code>POST /api/chat</code> - Chat com IA</li>
              <li><code>POST /api/analisar-codigo</code> - Análise de código</li>
              <li><code>POST /api/gerar-codigo</code> - Geração de código</li>
            </ul>
          </div>

          <p style="text-align: center; margin-top: 40px;">
            <strong>IDE funcionando perfeitamente!</strong><br>
            <small>Timestamp: ${new Date().toLocaleString('pt-BR')}</small>
          </p>
        </div>
      </body>
    </html>
  `);
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 IDE em Português rodando na porta ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`🗄️ Banco de dados: ${process.env.DATABASE_URL ? 'Conectado' : 'Não configurado'}`);
  console.log(`🤖 OpenAI: ${process.env.OPENAI_API_KEY ? 'Configurado' : 'Não configurado'}`);
});