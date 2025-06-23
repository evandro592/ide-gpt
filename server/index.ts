import express from "express";
import { registerRoutes } from "./routes";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logs das requisições
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Servir arquivos estáticos sempre
const publicPath = path.join(process.cwd(), 'dist/public');
app.use(express.static(publicPath));

// Servir index.html para rotas SPA
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    next();
  } else {
    res.sendFile(path.join(publicPath, 'index.html'));
  }
});

// Registrar rotas da API
registerRoutes(app).then(server => {
  // Iniciar servidor
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 IDE em Português rodando na porta ${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}`);
    console.log(`🗄️ Banco de dados: ${process.env.DATABASE_URL ? 'Conectado' : 'Não configurado'}`);
    console.log(`🤖 OpenAI: ${process.env.OPENAI_API_KEY ? 'Configurado' : 'Não configurado'}`);
  });
}).catch(error => {
  console.error('Erro ao inicializar servidor:', error);
  process.exit(1);
});

