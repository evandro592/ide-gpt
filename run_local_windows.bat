@echo off
title IDE Application - Servidor Local Windows

echo ========================================
echo   IDE APPLICATION - SERVIDOR LOCAL
echo ========================================
echo.
echo Verificando sistema...

:: Verificar Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js não encontrado!
    echo.
    echo Por favor, instale Node.js 18+ de: https://nodejs.org
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js encontrado: 
node --version

:: Verificar se dependências estão instaladas
if not exist "node_modules" (
    echo.
    echo ⚠️  Dependências não encontradas. Instalando...
    call install_dependencies.bat
)

echo.
echo ========================================
echo   INICIANDO SERVIDOR LOCAL
echo ========================================
echo.
echo 🚀 Servidor será iniciado em: http://localhost:5000
echo 📝 Interface em português disponível
echo 💬 Chat IA integrado (requer chave OpenAI)
echo 💾 Mensagens salvas localmente no seu PC
echo.
echo ⏹️  Para parar: Ctrl+C
echo 🌐 Para acessar: http://localhost:5000
echo.
echo ========================================

:: Aguardar 3 segundos e abrir navegador
timeout /t 3 /nobreak >nul
start http://localhost:5000

:: Iniciar servidor Windows
set NODE_ENV=development
npx tsx server/index.ts