@echo off
title IDE Application - Debug Windows
echo ========================================
echo   DEBUG - IDE Application Windows
echo ========================================
echo.

echo Verificando Node.js...
node --version
if %errorlevel% neq 0 (
    echo ERRO: Node.js nao encontrado!
    pause
    exit /b 1
)

echo.
echo Verificando npm...
npm --version
if %errorlevel% neq 0 (
    echo ERRO: npm nao encontrado!
    pause
    exit /b 1
)

echo.
echo Verificando tsx...
npx tsx --version
if %errorlevel% neq 0 (
    echo ERRO: tsx nao encontrado! Instalando...
    npm install -g tsx
)

echo.
echo Verificando arquivo servidor...
if not exist "server\index.ts" (
    echo ERRO: Arquivo server\index.ts nao encontrado!
    echo Certifique-se de estar na pasta correta do projeto
    pause
    exit /b 1
)

echo.
echo Verificando dependencias...
if not exist "node_modules" (
    echo Instalando dependencias...
    npm install
)

echo.
echo ========================================
echo   INICIANDO SERVIDOR DEBUG
echo ========================================
echo.
echo Configuracoes:
echo - NODE_ENV: development
echo - Host: localhost
echo - Porta: 5000
echo - URL: http://localhost:5000
echo.

set NODE_ENV=development
set DEBUG=*
npx tsx server/index.ts

echo.
echo ========================================
echo Servidor parou. Pressione qualquer tecla...
pause