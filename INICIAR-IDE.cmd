
@echo off
chcp 65001 > nul
color 0A
set STEP=1
title IDE Português - Iniciando...
echo.
echo ========================================
echo    IDE em Português - Versão 1.0
echo ========================================
echo.

echo PASSO %STEP%: Verificando diretório do projeto...

rem Verificar se estamos no diretório correto
if not exist "package.json" (
    color 0C
    echo ERRO: Execute este arquivo na pasta do projeto!
    echo Certifique-se de estar na pasta que contém package.json
    pause
    exit /b 1
)
color 0A
set /a STEP+=1
echo.
echo PASSO %STEP%: Verificando Node.js...

rem Verificar se Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo ERRO: Node.js não encontrado!
    echo Por favor, instale o Node.js em: https://nodejs.org
    pause
    exit /b 1
)
color 0A
set /a STEP+=1
echo.
echo PASSO %STEP%: Verificando dependências...

if not exist "node_modules" (
    echo Instalando dependências...
    npm install
    if %errorlevel% neq 0 (
        color 0C
        echo ERRO: Falha ao instalar dependências!
        pause
        exit /b 1
    )
    echo.
)
color 0A
set /a STEP+=1
echo.
echo PASSO %STEP%: Iniciando servidor...

echo Acesse: http://localhost:5000
echo.
echo Para parar o servidor, pressione Ctrl+C
echo.

rem Iniciar o servidor
npx tsx server/index.ts

color 0E
echo PASSO FINAL: Servidor finalizado. Pressione qualquer tecla para sair.
pause
