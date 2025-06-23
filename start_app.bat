@echo off
echo ========================================
echo   IDE Application - Servidor Local
echo ========================================
echo.

REM Verificar se Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Node.js nao encontrado!
    echo Por favor, instale Node.js de: https://nodejs.org
    pause
    exit /b 1
)

REM Verificar se dependências estão instaladas
if not exist "node_modules" (
    echo.
    echo Dependencias nao encontradas. Instalando...
    npm install
    if %errorlevel% neq 0 (
        echo.
        echo ERRO: Falha ao instalar dependencias!
        pause
        exit /b 1
    )
)

echo Iniciando servidor de desenvolvimento...
echo Acesse: http://localhost:5000
echo.
echo Para parar o servidor, pressione Ctrl+C
echo ========================================
echo.

REM Usar comando Windows correto
set NODE_ENV=development
npx tsx server/index.ts
