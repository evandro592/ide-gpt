
@echo off
chcp 65001 > nul
title IDE Português - Versão Local
echo.
echo ========================================
echo    IDE em Português - Versão Local
echo    (Funciona sem banco de dados)
echo ========================================
echo.

rem Verificar se estamos no diretório correto
if not exist "package.json" (
    echo ERRO: Execute este arquivo na pasta do projeto!
    echo Certifique-se de estar na pasta que contém package.json
    pause
    exit /b 1
)

rem Verificar se Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Node.js não encontrado!
    echo Por favor, instale o Node.js em: https://nodejs.org
    pause
    exit /b 1
)

echo Verificando dependências...
if not exist "node_modules" (
    echo Instalando dependências...
    npm install
    if %errorlevel% neq 0 (
        echo ERRO: Falha ao instalar dependências!
        pause
        exit /b 1
    )
    echo.
)

echo.
echo Iniciando servidor local...
echo Acesse: http://localhost:5000
echo.
echo Para parar o servidor, pressione Ctrl+C
echo.

rem Iniciar o servidor local
npx tsx server/local-server.ts

pause
