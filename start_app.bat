@echo off
setlocal enabledelayedexpansion

echo ========================================
echo   IDE Application - Servidor Local
echo ========================================
echo.

REM Verificar se Node.js está instalado
call node --version >nul 2>&1
if !errorlevel! neq 0 (
    echo ERRO: Node.js nao encontrado!
    echo Por favor, instale Node.js de: https://nodejs.org
    echo.
    pause
    exit /b 1
)

echo Node.js encontrado:
call node --version

REM Verificar se package.json existe
if not exist "package.json" (
    echo ERRO: package.json nao encontrado!
    echo Execute este script na pasta raiz do projeto
    echo.
    pause
    exit /b 1
)

REM Verificar se dependências estão instaladas
if not exist "node_modules" (
    echo.
    echo Dependencias nao encontradas. Instalando...
    call npm install
    if !errorlevel! neq 0 (
        echo.
        echo ERRO: Falha ao instalar dependencias!
        pause
        exit /b 1
    )
)

echo.
echo Iniciando servidor de desenvolvimento...
echo URL: http://localhost:5000
echo.
echo Para parar o servidor, pressione Ctrl+C
echo ========================================
echo.

REM Configurar ambiente e iniciar servidor
set NODE_ENV=development
call npm run dev

REM Se chegou aqui, o servidor parou
echo.
echo Servidor encerrado.
pause
