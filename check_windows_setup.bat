@echo off
echo ========================================
echo   VERIFICACAO SISTEMA WINDOWS
echo ========================================
echo.

echo 1. Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Node.js instalado: 
    node --version
) else (
    echo ✗ Node.js NAO encontrado!
    echo   Baixe em: https://nodejs.org
    goto :error
)

echo.
echo 2. Verificando npm...
npm --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ npm instalado: 
    npm --version
) else (
    echo ✗ npm NAO encontrado!
    goto :error
)

echo.
echo 3. Verificando pasta do projeto...
if exist "package.json" (
    echo ✓ package.json encontrado
) else (
    echo ✗ package.json NAO encontrado!
    echo   Execute este arquivo na pasta raiz do projeto
    goto :error
)

if exist "server\index.ts" (
    echo ✓ server\index.ts encontrado
) else (
    echo ✗ server\index.ts NAO encontrado!
    goto :error
)

echo.
echo 4. Verificando dependencias...
if exist "node_modules" (
    echo ✓ node_modules existe
) else (
    echo ! node_modules nao encontrado
    echo   Execute: install_dependencies.bat
)

echo.
echo 5. Verificando porta 5000...
netstat -an | find ":5000" >nul 2>&1
if %errorlevel% equ 0 (
    echo ! Porta 5000 em uso
    echo   Pare outros servicos ou use porta diferente
) else (
    echo ✓ Porta 5000 disponivel
)

echo.
echo ========================================
echo   SISTEMA PRONTO PARA EXECUCAO
echo ========================================
echo.
echo Para iniciar a aplicacao:
echo   1. Execute: install_dependencies.bat (se necessario)
echo   2. Execute: start_app.bat
echo   3. Acesse: http://localhost:5000
echo.
goto :end

:error
echo.
echo ========================================
echo   ERRO NA CONFIGURACAO
echo ========================================
echo.
echo Corrija os problemas acima antes de continuar.

:end
pause