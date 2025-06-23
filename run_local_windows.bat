@echo off
setlocal enabledelayedexpansion
title IDE Application - Servidor Local Windows

echo ========================================
echo   IDE APPLICATION - SERVIDOR LOCAL
echo ========================================
echo.

REM Verificar Node.js
echo Verificando sistema...
call node --version >nul 2>&1
if !errorlevel! neq 0 (
    echo Node.js nao encontrado!
    echo.
    echo Por favor, instale Node.js 18+ de: https://nodejs.org
    echo.
    pause
    exit /b 1
)

echo Node.js encontrado:
call node --version

REM Verificar se dependências estão instaladas
if not exist "node_modules" (
    echo.
    echo Dependencias nao encontradas. Instalando...
    call npm install
    if !errorlevel! neq 0 (
        echo Falha na instalacao. Execute install_dependencies.bat
        pause
        exit /b 1
    )
)

echo.
echo ========================================
echo   INICIANDO SERVIDOR LOCAL
echo ========================================
echo.
echo Servidor sera iniciado em: http://localhost:5000
echo Interface em portugues disponivel
echo Chat IA integrado (requer chave OpenAI)
echo Mensagens salvas localmente no seu PC
echo.
echo Para parar: Ctrl+C
echo Para acessar: http://localhost:5000
echo.
echo ========================================

REM Aguardar e abrir navegador
timeout /t 3 /nobreak >nul 2>&1
start http://localhost:5000

REM Iniciar servidor
set NODE_ENV=development
call npm run dev