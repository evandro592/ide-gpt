@echo off
setlocal enabledelayedexpansion
title IDE Application - Quick Start

echo ========================================
echo   IDE APPLICATION - QUICK START
echo ========================================
echo.

REM Ir para a pasta do script
cd /d "%~dp0"

REM Verificar Node.js rapidamente
call node --version >nul 2>&1
if !errorlevel! neq 0 (
    echo ERRO: Node.js nao instalado!
    echo Baixe em: https://nodejs.org
    pause
    exit /b 1
)

REM Instalar dependências se necessário
if not exist "node_modules" (
    echo Instalando dependencias...
    call npm install --silent
)

REM Abrir navegador
start http://localhost:5000

REM Iniciar servidor
echo.
echo Iniciando IDE Application...
echo Acesse: http://localhost:5000
echo.
set NODE_ENV=development
call npm run dev