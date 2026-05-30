#!/bin/bash

# Script para fazer deploy no Vercel
# Uso: VERCEL_TOKEN="seu_token_aqui" ./deploy.sh

if [ -z "$VERCEL_TOKEN" ]; then
    echo "Erro: VERCEL_TOKEN não foi definido"
    echo "Uso: VERCEL_TOKEN='seu_token' ./deploy.sh"
    exit 1
fi

cd "$(dirname "$0")"

echo "Starting Vercel deployment..."
echo "Project: orladata/unoduno"
echo "Branch: ai-tool-research"
echo ""

# Deploy usando vercel CLI
vercel deploy --prod --token "$VERCEL_TOKEN" --scope team_aIzC2rNSI32ygrTczJdmZJFu

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment bem-sucedido!"
    echo ""
    echo "Acesse seu projeto em:"
    echo "  Dashboard: https://vercel.com/dashboard"
    echo "  Project: https://vercel.com/sonarycorporation-5932s-projects/unoduno"
else
    echo ""
    echo "❌ Deployment falhou"
    exit 1
fi
