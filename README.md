# IDE em Português

Um IDE completo desenvolvido em português com assistente de IA integrado para desenvolvimento web.

## Características

- **Interface 100% em português** - Todas as mensagens, menus e funcionalidades
- **Assistente de IA integrado** - Análise, geração e correção de código automaticamente
- **Editor Monaco** - Experiência similar ao VSCode com syntax highlighting
- **Gerenciamento de projetos** - Crie, edite e organize seus projetos
- **Banco de dados PostgreSQL** - Armazenamento seguro de projetos e arquivos
- **Suporte a múltiplas linguagens** - JavaScript, TypeScript, Python, HTML, CSS e mais

## Como usar no Windows

### Instalação rápida:

1. **Instalar Node.js**: Baixe em https://nodejs.org
2. **Baixar o projeto**: Clone ou baixe este repositório
3. **Instalar dependências**: Execute `npm install` no terminal
4. **Configurar IA** (opcional): Execute `CONFIGURAR-OPENAI.cmd`
5. **Definir origem do CORS** (opcional): ajuste a variável `CORS_ORIGIN` com a URL que poderá acessar a API
6. **Iniciar IDE**: Execute `INICIAR-IDE.cmd`

### Iniciando manualmente:

```bash
# Instalar dependências
npm install

# Definir origem do CORS (opcional)
export CORS_ORIGIN=http://localhost:3000

# Iniciar o servidor
tsx server/index.ts
```

O IDE estará disponível em: http://localhost:5000

## Funcionalidades do Assistente de IA

Com uma chave OpenAI configurada, você pode:

- **Analisar código**: "Analise este código e sugira melhorias"
- **Gerar código**: "Crie uma função React para um formulário de login"
- **Corrigir bugs**: "Encontre e corrija os problemas neste código"
- **Refatorar**: "Converta este JavaScript para TypeScript"
- **Explicar**: "Explique como esta função funciona"
- **Documentar**: "Adicione comentários explicativos a este código"

## Estrutura do Projeto

```
├── client/           # Interface React
├── server/           # Servidor Express
├── shared/           # Tipos e esquemas compartilhados
├── INICIAR-IDE.cmd   # Script para Windows
├── CONFIGURAR-OPENAI.cmd # Configuração da IA
└── README.md
```

## Tecnologias

- **Frontend**: React, TypeScript, Tailwind CSS, Monaco Editor
- **Backend**: Node.js, Express, PostgreSQL, Drizzle ORM
- **IA**: OpenAI GPT-4o para assistência de código
- **Banco**: PostgreSQL com Neon Database

## Desenvolvido para desenvolvedores brasileiros

Este IDE foi criado especificamente para a comunidade de desenvolvedores que preferem trabalhar em português, oferecendo uma experiência completa de desenvolvimento sem barreiras de idioma.