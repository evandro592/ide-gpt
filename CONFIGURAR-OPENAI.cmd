@echo off
title IDE Português - Configurar OpenAI
echo.
echo ========================================
echo   Configuração do Assistente de IA
echo ========================================
echo.
echo Para usar o assistente de IA, você precisa de uma chave da OpenAI.
echo.
echo 1. Acesse: https://platform.openai.com/api-keys
echo 2. Faça login ou crie uma conta
echo 3. Clique em "Create new secret key"
echo 4. Copie a chave gerada
echo.
set /p openai_key="Cole sua chave OpenAI aqui: "

if "%openai_key%"=="" (
    echo.
    echo Nenhuma chave fornecida. Saindo...
    pause
    exit /b 1
)

rem Criar arquivo .env se não existir
echo OPENAI_API_KEY=%openai_key% > .env
echo DATABASE_URL=%DATABASE_URL% >> .env

echo.
echo ✓ Chave OpenAI configurada com sucesso!
echo.
echo O assistente de IA agora está ativo e pode:
echo - Analisar e melhorar seu código
echo - Gerar código novo
echo - Corrigir bugs automaticamente
echo - Editar arquivos do projeto
echo - Fornecer explicações detalhadas
echo.
echo Reinicie o IDE para aplicar as configurações.
echo.
pause