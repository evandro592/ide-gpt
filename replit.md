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
