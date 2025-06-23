@echo off
echo ========================================
echo   IDE Application - Build Produção
echo ========================================
echo.
echo Compilando aplicação para produção...
echo.

npm run build

if errorlevel 1 (
    echo.
    echo ERRO: Falha na compilação!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Build concluído com sucesso!
echo ========================================
echo.
echo Arquivos gerados em: ./dist/
echo Para executar em produção: npm run start:windows
echo.
pause
