#!/bin/bash
# Script para verificar caminhos de mídia após deploy

echo "================================"
echo "Verificação de Caminhos de Mídia"
echo "================================"
echo ""

DOMAIN="https://rh360.pt/wildlog"

echo "Testando URLs de mídia..."
echo ""

# Testar banner
echo "1. Testando vídeo banner:"
curl -I "$DOMAIN/media/banner.mp4" 2>/dev/null | head -1

echo ""
echo "2. Testando logo WM:"
curl -I "$DOMAIN/media/logoWM.png" 2>/dev/null | head -1

echo ""
echo "3. Testando logo text:"
curl -I "$DOMAIN/media/logoText.jpg" 2>/dev/null | head -1

echo ""
echo "4. Testando logo text WM:"
curl -I "$DOMAIN/media/logoTextWM.png" 2>/dev/null | head -1

echo ""
echo "5. Testando logo:"
curl -I "$DOMAIN/media/logo.jpg" 2>/dev/null | head -1

echo ""
echo "================================"
echo "Se todas as respostas forem '200 OK'"
echo "significa que os caminhos estão corretos!"
echo "================================"

