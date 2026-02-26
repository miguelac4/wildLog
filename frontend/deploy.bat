@echo off
REM Script de Deploy para WildLog Frontend (Windows)
REM Uso: deploy.bat [rh360|wildlog]

setlocal enabledelayedexpansion

set DOMAIN=%1

if "%DOMAIN%"=="" (
    echo.
    echo ❌ Uso: deploy.bat [rh360^|wildlog]
    echo.
    echo Exemplos:
    echo   deploy.bat rh360    - Build para rh360.pt/wildlog
    echo   deploy.bat wildlog  - Build para wild-log.com
    echo.
    pause
    exit /b 1
)

echo.
echo 🚀 Deploy WildLog Frontend
echo 📍 Domínio: %DOMAIN%
echo.

REM ==================== BUILD ====================
echo 📦 Fazendo build...
echo.

if /i "%DOMAIN%"=="wildlog" (
    echo Building para wild-log.com (raiz)...
    call npm run build -- --mode production-root
    set BUILD_DIR=dist
    set REMOTE_DIR=.
    if errorlevel 1 (
        echo ❌ Erro no build
        pause
        exit /b 1
    )
    echo ✅ Build para wild-log.com completo
) else if /i "%DOMAIN%"=="rh360" (
    echo Building para rh360.pt/wildlog...
    call npm run build
    set BUILD_DIR=dist
    set REMOTE_DIR=wildlog
    if errorlevel 1 (
        echo ❌ Erro no build
        pause
        exit /b 1
    )
    echo ✅ Build para rh360.pt/wildlog completo
) else (
    echo ❌ Domínio inválido: %DOMAIN%
    echo    Use: rh360 ou wildlog
    pause
    exit /b 1
)

REM ==================== VALIDAÇÃO ====================
echo.
echo 🔍 Validando arquivos de build...
echo.

if not exist "%BUILD_DIR%\index.html" (
    echo ❌ Erro: index.html não encontrado em %BUILD_DIR%\
    pause
    exit /b 1
)

if not exist "%BUILD_DIR%\media" (
    echo ❌ Erro: pasta media\ não encontrada em %BUILD_DIR%\
    pause
    exit /b 1
)

echo ✅ Estrutura de build validada

REM ==================== INFORMAÇÕES FINAIS ====================
echo.
echo ✨ Build completo e pronto para deploy!
echo.
echo 📂 Arquivos em: .\%BUILD_DIR%\
echo.

if /i "%DOMAIN%"=="rh360" (
    echo 🌐 Destino: rh360.pt/wildlog
    echo.
    echo 📤 Próximas etapas:
    echo    1. Conectar via FTP a: ftp.rh360.pt
    echo    2. Navegar para pasta: public_html (ou www)
    echo    3. Criar pasta: wildlog
    echo    4. Upload do conteúdo de .\dist\ para wildlog\
    echo    5. Upload de .htaccess para raiz do domínio
) else (
    echo 🌐 Destino: wild-log.com
    echo.
    echo 📤 Próximas etapas:
    echo    1. Conectar via FTP a: ftp.wild-log.com
    echo    2. Fazer upload de .\dist\ para public_html\
    echo    3. Upload de .htaccess para public_html\
)

echo.
echo 💡 Dicas após deploy:
echo    - Limpe o cache do navegador ^(Ctrl+Shift+Del^)
echo    - Verifique o banner.mp4 na aba Network ^(F12^)
echo    - Teste os botões de navegação
echo.
pause

