# IDE Application - Windows Setup

## Requisitos do Sistema

- **Node.js 18+** - [Download aqui](https://nodejs.org)
- **Windows 10/11**
- **Navegador moderno** (Chrome, Firefox, Edge)

## Instalação Rápida

### ⚡ Método Mais Simples
1. **Baixe/Clone este projeto**
2. **Duplo-clique**: `quick_start_windows.bat`
3. **Acesse**: http://localhost:5000

### 🔧 Método Detalhado
1. **Baixe/Clone este projeto**
2. **Verifique o sistema**: `check_windows_setup.bat`
3. **Execute**: `install_dependencies.bat`
4. **Inicie a aplicação**: `start_app.bat`
5. **Acesse**: http://localhost:5000

### ❗ Solução de Problemas
Se os scripts não funcionarem:
- **Execute como Administrador** (clique direito → Executar como administrador)
- Execute `start_windows_debug.bat` para diagnóstico detalhado
- Verifique se Node.js 18+ está instalado em https://nodejs.org
- Certifique-se de estar na pasta correta do projeto

## Scripts Disponíveis

### 🚀 Scripts de Execução
- `quick_start_windows.bat` - **Início rápido** (recomendado)
- `check_windows_setup.bat` - Verifica configuração do sistema
- `install_dependencies.bat` - Instala dependências 
- `start_app.bat` - Inicia servidor de desenvolvimento
- `start_windows_debug.bat` - Versão debug com diagnósticos
- `build_app.bat` - Compila para produção

### 📝 Comandos NPM Alternativos
```cmd
# Desenvolvimento
npm run dev:windows

# Produção
npm run build
npm run start:windows
```

## Configuração de API

1. **OpenAI API Key** - Configure no arquivo `.env` ou use a interface
2. **Banco de Dados** - PostgreSQL (opcional, usa memória por padrão)

## Estrutura do Projeto

```
├── client/          # Frontend React
├── server/          # Backend Express  
├── shared/          # Tipos compartilhados
├── start_app.bat    # Iniciar aplicação
├── install_dependencies.bat
└── build_app.bat
```

## Solução de Problemas

### Porta 5000 em uso
```cmd
# Verificar o que está usando a porta
netstat -ano | findstr :5000

# Parar processo na porta (substitua PID)
taskkill /PID [PID_NUMBER] /F

# Ou usar porta diferente
set PORT=3000
npx tsx server/index.ts
```

### Erro de permissões
- Execute os .bat como **Administrador**
- Verifique se Node.js está no PATH

### Firewall/Antivírus
- Adicione exceção para Node.js
- Permita tráfego na porta 5000

## Acesso Local

- **Interface**: http://localhost:5000
- **API**: http://localhost:5000/api
- **Configurações**: Interface > ⚙️ (ícone de engrenagem)

## Funcionalidades

✅ **Editor de Código** - Monaco Editor (VS Code)  
✅ **Chat IA** - Integração OpenAI em português  
✅ **Gerenciador de Arquivos** - Navegação em árvore  
✅ **Aplicação de Código** - IA aplica código diretamente  
✅ **Armazenamento Local** - Mensagens salvas no computador  
✅ **Tema Escuro** - Interface VS Code  
✅ **Multi-idioma** - Português/Inglês  

## Suporte

Para problemas, verifique:
1. Node.js versão 18+
2. Todas as dependências instaladas
3. Porta 5000 disponível
4. Permissões de arquivo