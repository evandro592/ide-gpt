# Overview

This is a full-stack IDE web application with integrated ChatGPT capabilities, built using React, Express.js, and Drizzle ORM. The application provides a VSCode-like interface with file management, code editing, and AI-powered assistance for developers.

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

# Changelog

- June 23, 2025. Initial setup

# User Preferences

Preferred communication style: Simple, everyday language.