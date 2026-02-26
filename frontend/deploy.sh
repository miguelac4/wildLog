#!/bin/bash

# Script de Deploy para WildLog Frontend
# Uso: ./deploy.sh [rh360|wildlog] [ftp_user] [ftp_pass] [ftp_host]

DOMAIN=$1
FTP_USER=$2
FTP_PASS=$3
FTP_HOST=$4

if [ -z "$DOMAIN" ]; then
    echo "❌ Uso: ./deploy.sh [rh360|wildlog] [ftp_user] [ftp_pass] [ftp_host]"
    echo ""
    echo "Exemplos:"
    echo "  ./deploy.sh rh360 user pass ftp.rh360.pt"
    echo "  ./deploy.sh wildlog user pass ftp.wild-log.com"
    exit 1
fi

echo "🚀 Deploy WildLog Frontend"
echo "📍 Domínio: $DOMAIN"
echo ""

# ==================== BUILD ====================
echo "📦 Fazendo build..."

if [ "$DOMAIN" = "wildlog" ]; then
    npm run build -- --mode production-root
    BUILD_DIR="dist"
    REMOTE_DIR="."
    echo "✅ Build para wild-log.com (raiz) completo"
elif [ "$DOMAIN" = "rh360" ]; then
    npm run build
    BUILD_DIR="dist"
    REMOTE_DIR="wildlog"
    echo "✅ Build para rh360.pt/wildlog completo"
else
    echo "❌ Domínio inválido: $DOMAIN"
    echo "   Use: rh360 ou wildlog"
    exit 1
fi

# ==================== VALIDAÇÃO ====================
echo ""
echo "🔍 Validando arquivos de build..."

if [ ! -f "$BUILD_DIR/index.html" ]; then
    echo "❌ Erro: index.html não encontrado em $BUILD_DIR/"
    exit 1
fi

if [ ! -d "$BUILD_DIR/media" ]; then
    echo "❌ Erro: pasta media/ não encontrada em $BUILD_DIR/"
    exit 1
fi

echo "✅ Estrutura de build validada"

# ==================== UPLOAD FTP ====================
if [ -z "$FTP_USER" ] || [ -z "$FTP_PASS" ] || [ -z "$FTP_HOST" ]; then
    echo ""
    echo "⚠️  Credenciais FTP não fornecidas"
    echo "   Para upload automático, use:"
    echo "   ./deploy.sh $DOMAIN ftp_user ftp_password ftp.example.com"
    echo ""
    echo "📂 Arquivos prontos em: ./$BUILD_DIR/"
    echo "   Upload manualmente para: $REMOTE_DIR"
    exit 0
fi

echo ""
echo "📤 Fazendo upload via FTP..."

# Criar arquivo de script FTP
FTP_SCRIPT="/tmp/wildlog_deploy_$DOMAIN.ftp"
cat > "$FTP_SCRIPT" << EOF
open $FTP_HOST
$FTP_USER
$FTP_PASS
bin
cd $REMOTE_DIR
EOF

# Adicionar comandos de upload
if [ "$DOMAIN" = "wildlog" ]; then
    cat >> "$FTP_SCRIPT" << EOF
delete index.html
delete .htaccess
mput $BUILD_DIR/*
quit
EOF
else
    cat >> "$FTP_SCRIPT" << EOF
delete index.html
delete .htaccess
mput $BUILD_DIR/*
quit
EOF
fi

# Executar FTP
ftp -n < "$FTP_SCRIPT"

if [ $? -eq 0 ]; then
    echo "✅ Upload FTP completo"
else
    echo "❌ Erro no upload FTP"
    exit 1
fi

# Limpar
rm -f "$FTP_SCRIPT"

# ==================== FINALIZAÇÃO ====================
echo ""
echo "✨ Deploy completo!"
echo ""

if [ "$DOMAIN" = "wildlog" ]; then
    echo "🌐 Acesse: https://wild-log.com"
else
    echo "🌐 Acesse: https://rh360.pt/wildlog"
fi

echo ""
echo "💡 Dicas:"
echo "   - Limpe o cache do navegador (Ctrl+Shift+Delete)"
echo "   - Verifique o banner.mp4 em Network tab"
echo "   - Teste os botões de navegação"

