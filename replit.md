<<<<<<< HEAD
# IDE Application

## Overview
This is a full-stack web-based IDE (Integrated Development Environment) application built with React on the frontend and Express.js on the backend. The application provides a complete code editor experience with file management, AI-powered chat assistance, and real-time collaboration features.

**New Features (June 23, 2025):**
- Portuguese language support with complete UI translation
- Local storage for chat messages (saved on user's computer)
- Language selection (Portuguese/English) in settings
- Real-time language switching throughout the interface

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Tailwind CSS with Radix UI components (shadcn/ui)
- **Code Editor**: Monaco Editor (VS Code's editor)
- **State Management**: TanStack React Query for server state
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: OpenAI API for code analysis and chat
- **Session Management**: Connect-pg-simple for PostgreSQL sessions

## Key Components

### File System Management
- **Directory Tree**: Hierarchical file explorer with expand/collapse functionality
- **File Operations**: Create, read, update, delete files and directories
- **Code Editor**: Monaco editor with syntax highlighting for multiple languages
- **Tab Management**: Multiple file tabs with modified state tracking

### AI-Powered Features
- **Code Analysis**: Automated code review with suggestions and improvements
- **Chat Assistant**: AI-powered chat for code help and explanations
- **Code Generation**: Generate code snippets based on prompts
- **Language Detection**: Automatic programming language detection

### Database Schema
- **Users**: Authentication and user management
- **Files**: File storage with metadata (name, path, content, directory structure)
- **Chat Messages**: Conversation history with AI assistant
- **Project Settings**: User preferences (theme, font size, auto-save)

## Data Flow

1. **File Operations**: Client requests file content → Server reads from filesystem → Returns content to Monaco editor
2. **AI Interactions**: User sends message → Server processes with OpenAI API → Response stored in database and returned to client
3. **Real-time Updates**: File changes trigger automatic saves and UI updates
4. **Settings Management**: User preferences stored in database and synchronized across sessions

## External Dependencies

### Core Dependencies
- **@monaco-editor/react**: Code editor component
- **@neondatabase/serverless**: PostgreSQL database driver
- **drizzle-orm**: Type-safe SQL query builder
- **@tanstack/react-query**: Data fetching and caching
- **openai**: OpenAI API integration
- **express**: Web server framework

### UI Dependencies
- **@radix-ui/***: Headless UI components
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

## Deployment Strategy

### Development Environment
- **Command**: `npm run dev` (Linux/Mac) or `npm run dev:windows` (Windows)
- **Port**: 5000 (localhost for Windows local, 0.0.0.0 for production)
- **Hot Reload**: Vite HMR for frontend, tsx for backend
- **Database**: PostgreSQL (configured via DATABASE_URL) or in-memory storage
- **Windows Scripts**: `start_app.bat`, `install_dependencies.bat`, `build_app.bat`

### Production Build
- **Frontend**: Vite builds to `dist/public`
- **Backend**: esbuild bundles Node.js server to `dist/index.js`
- **Start Command**: `npm start` (Linux/Mac) or `npm run start:windows` (Windows)
- **Deployment Target**: Autoscale (Replit deployment) or Windows Local Server

### Windows Local Server Setup
- **Quick Start**: Execute `run_local_windows.bat`
- **Manual Setup**: Run `install_dependencies.bat` then `start_app.bat`
- **Local Access**: http://localhost:5000
- **Requirements**: Node.js 18+, Windows 10/11

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: OpenAI API key for AI features
- `NODE_ENV`: Environment (development/production)

## User Preferences

Preferred communication style: Simple, everyday language.
Interface language: Portuguese (with English fallback)
Data storage: Chat messages saved locally on user's computer (localStorage)
Configuration persistence: Settings saved both locally and on server

## Changelog

Changelog:
- June 23, 2025. Initial setup
- June 23, 2025. Added Portuguese language support and local storage for chat messages
  - Implemented complete UI translation system
  - Added language selector in header
  - Chat messages now saved locally on user's computer
  - Real-time language switching functionality
  - Settings persistence in localStorage
- June 23, 2025. Enhanced Windows local server support
  - Added Windows-specific npm scripts and robust .bat files
  - Fixed Windows batch file execution issues with proper error handling
  - Added quick_start_windows.bat for one-click setup
  - Enhanced scripts with setlocal enabledelayedexpansion for reliability
  - Added comprehensive troubleshooting and debug scripts
  - Localhost binding for Windows development with automatic browser opening
- June 23, 2025. Performance and UX optimizations
  - Implemented API response caching (30-second TTL for better performance)
  - Added auto-save functionality (every 30 seconds for modified files)
  - Enhanced keyboard shortcuts (Ctrl+S save, Ctrl+W close tab) with visual feedback
  - Auto-scroll to bottom in chat when new messages arrive
  - Added tooltips and accessibility improvements throughout interface
  - Debounced content changes in code editor to prevent performance issues
  - Optimized OpenAI API calls with better prompt engineering and temperature settings
  - Enhanced loading indicators and visual feedback for user actions
  - Improved code snippet extraction and application from AI responses
=======
# Visão Geral

Este é um IDE completo em português com capacidades de IA integradas, construído usando React, Express.js e Drizzle ORM. A aplicação fornece uma interface similar ao VSCode com gerenciamento de arquivos, edição de código e assistência de IA para desenvolvedores brasileiros.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern React features
- **Bundler**: Vite for fast development and optimized production builds
- **UI Library**: Radix UI components with shadcn/ui for accessible, customizable components
- **Styling**: Tailwind CSS with VSCode-inspired dark theme for familiar developer experience
- **State Management**: TanStack Query for efficient server state management and caching
- **Code Editor**: Monaco Editor providing VSCode-like editing experience with syntax highlighting and IntelliSense
- **Routing**: Wouter for lightweight client-side routing

## Backend Architecture
- **Runtime**: Node.js with Express.js server framework
- **Language**: TypeScript with ES modules for modern JavaScript features
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Session-based authentication infrastructure (ready for implementation)
- **File System**: Native Node.js fs operations with security validation to prevent unauthorized access
- **API**: RESTful endpoints for file operations and AI chat functionality

## Data Storage Solutions
- **Primary Database**: PostgreSQL hosted via Neon Database for scalable cloud storage
- **File Storage**: Local file system using isolated `projects` directory structure
- **Session Storage**: PostgreSQL with connect-pg-simple for persistent session management
- **Build Artifacts**: Local dist directory for compiled assets

# Key Components

## File System Management
- **Security Layer**: Path validation using security middleware to prevent directory traversal attacks
- **File Operations**: Complete CRUD operations for files and directories with proper error handling
- **Project Isolation**: Each project stored in separate subdirectory within `projects` folder
- **Input Validation**: Zod schemas for validating all file operation requests

## Code Editor Integration
- **Editor Engine**: Monaco Editor with dynamic import loading for performance optimization
- **Language Support**: Multi-language support including TypeScript, JavaScript, Python, and more
- **Developer Features**: Syntax highlighting, auto-completion, minimap, and error detection
- **Tab Management**: Multiple file tabs with unsaved changes tracking and visual indicators

## AI Integration
- **AI Provider**: OpenAI GPT models using official SDK for reliable API access
- **Core Features**: Code analysis, automated code generation, and interactive chat assistance
- **Context Awareness**: Includes current file content and selected code snippets in AI requests
- **Graceful Degradation**: Application remains functional without API key, with limited AI features

## Real-time Communication
- WebSocket or similar technology for real-time updates and collaboration features (infrastructure ready)

# Data Flow

1. **File Operations**: Client requests → Express middleware → Path validation → File system operations → Response
2. **Code Editing**: Monaco Editor → File content changes → Auto-save/manual save → Backend API → File system
3. **AI Assistance**: User input → Context gathering → OpenAI API → Response processing → UI display
4. **Authentication**: Login request → Session creation → PostgreSQL storage → Session validation middleware

# External Dependencies

## Core Dependencies
- **OpenAI SDK**: For AI chat and code generation capabilities
- **PostgreSQL**: Primary database for user data and sessions
- **Neon Database**: Cloud PostgreSQL hosting provider
- **Monaco Editor**: VSCode editor component for web

## Development Dependencies
- **Vite**: Build tool and development server
- **TypeScript**: Type checking and compilation
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives

# Deployment Strategy

## Development Environment
- **Frontend**: Vite dev server with hot module replacement
- **Backend**: Node.js Express server with TypeScript compilation
- **Database**: Neon Database connection for cloud PostgreSQL access

## Production Considerations
- **Frontend**: Static build output from Vite for CDN deployment
- **Backend**: Express server deployment with proper environment configuration
- **Database**: Production PostgreSQL instance with connection pooling
- **File Storage**: Persistent volume mounting for project files

# Histórico de Mudanças

- 23 de junho, 2025: Configuração inicial do projeto
- 23 de junho, 2025: IDE completo implementado em português com:
  - Interface totalmente em português
  - Editor Monaco integrado
  - Assistente de IA com OpenAI FUNCIONANDO
  - Gerenciamento de projetos e arquivos
  - Banco de dados PostgreSQL configurado
  - Scripts para Windows (.cmd) criados
  - Sistema completo de CRUD para projetos e arquivos
  - IA pode analisar, gerar e editar código automaticamente
  - Projeto exemplo incluído para testes

# Preferências do Usuário

Estilo de comunicação preferido: Linguagem simples e cotidiana em português.
Aplicação deve funcionar no desktop Windows do usuário.
Interface deve ser 100% em português brasileiro.
>>>>>>> 796ea9e3a6d38e397dfb71035ce80b292c042103
