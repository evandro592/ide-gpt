@echo off
setlocal enabledelayedexpansion

echo ========================================
echo   IDE Application - Build Producao
echo ========================================
echo.

REM Verificar Node.js
call node --version >nul 2>&1
if !errorlevel! neq 0 (
    echo ERRO: Node.js nao encontrado!
    pause
    exit /b 1
)

REM Verificar se dependências estão instaladas
if not exist "node_modules" (
    echo ERRO: Dependencias nao instaladas!
    echo Execute install_dependencies.bat primeiro
    echo.
    pause
    exit /b 1
)

echo Compilando aplicacao para producao...
echo.

call npm run build

if !errorlevel! neq 0 (
    echo.
    echo ERRO: Falha na compilacao!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Build concluido com sucesso!
echo ========================================
echo.
echo Arquivos gerados em: ./dist/
echo.
echo Para executar em producao:
echo   set NODE_ENV=production
echo   node dist/index.js
echo.
pause
