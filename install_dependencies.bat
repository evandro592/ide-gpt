@echo off
setlocal enabledelayedexpansion

echo ========================================
echo   IDE Application - Instalacao
echo ========================================
echo.

REM Verificar Node.js
echo Verificando Node.js...
call node --version >nul 2>&1
if !errorlevel! neq 0 (
    echo ERRO: Node.js nao encontrado!
    echo Por favor, instale Node.js 18+ de: https://nodejs.org
    echo.
    pause
    exit /b 1
)

echo Node.js encontrado:
call node --version

REM Verificar npm
echo.
echo Verificando npm...
call npm --version >nul 2>&1
if !errorlevel! neq 0 (
    echo ERRO: npm nao encontrado!
    echo.
    pause
    exit /b 1
)

echo npm encontrado:
call npm --version

REM Verificar se está na pasta correta
if not exist "package.json" (
    echo.
    echo ERRO: package.json nao encontrado!
    echo Execute este script na pasta raiz do projeto
    echo.
    pause
    exit /b 1
)

echo.
echo Instalando dependencias...
echo Isso pode demorar alguns minutos...
echo.

call npm install

if !errorlevel! neq 0 (
    echo.
    echo ERRO: Falha na instalacao das dependencias!
    echo Tente executar como Administrador
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Instalacao concluida com sucesso!
echo ========================================
echo.
echo Para iniciar a aplicacao:
echo   1. Execute: start_app.bat
echo   2. Acesse: http://localhost:5000
echo.
pause
