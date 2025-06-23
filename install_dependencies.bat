@echo off
echo ========================================
echo   IDE Application - Instalação
echo ========================================
echo.
echo Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Node.js não encontrado!
    echo Por favor, instale Node.js 18+ de: https://nodejs.org
    pause
    exit /b 1
)

echo Node.js encontrado: 
node --version

echo.
echo Instalando dependências...
npm install

if errorlevel 1 (
    echo.
    echo ERRO: Falha na instalação das dependências!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Instalação concluída com sucesso!
echo ========================================
echo.
echo Para iniciar a aplicação, execute: start_app.bat
echo Ou execute: npm run dev:windows
echo.
pause
