# IDE Application - Windows Setup

## Requisitos do Sistema

- **Node.js 18+** - [Download aqui](https://nodejs.org)
- **Windows 10/11**
- **Navegador moderno** (Chrome, Firefox, Edge)

## Instalação Rápida

1. **Baixe/Clone este projeto**
2. **Execute como Administrador**: `install_dependencies.bat`
3. **Inicie a aplicação**: `start_app.bat`
4. **Acesse**: http://localhost:5000

## Scripts Disponíveis

### 🚀 Scripts de Execução
- `start_app.bat` - Inicia servidor de desenvolvimento
- `install_dependencies.bat` - Instala dependências 
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

# Ou usar porta diferente
set PORT=3000 && npm run dev:windows
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