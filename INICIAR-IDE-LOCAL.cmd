@echo off
title IDE Português - Versão Local
echo.
echo ========================================
echo    IDE em Português - Versão Local
echo    (Funciona sem banco de dados)
echo ========================================
echo.
echo Iniciando servidor local...
echo.

rem Verificar se Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Node.js não encontrado!
    echo Por favor, instale o Node.js em: https://nodejs.org
    pause
    exit /b 1
)

rem Instalar dependências se necessário
if not exist "node_modules" (
    echo Instalando dependências...
    npm install
    echo.
)

rem Iniciar o servidor local
echo Servidor local iniciando na porta 5000...
echo.
echo Acesse: http://localhost:5000
echo.
echo Para parar o servidor, pressione Ctrl+C
echo.

npx tsx server/local-server.ts