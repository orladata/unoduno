#!/bin/bash

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# PASSO 1: Validar ambiente
print_header "PASSO 1: Validando Ambiente"

# Verificar se estamos no diretório certo
if [ ! -f "package.json" ]; then
    print_error "package.json não encontrado. Execute de /vercel/share/v0-project"
    exit 1
fi
print_success "Diretório do projeto validado"

# Verificar CLIs
if ! command -v modal &> /dev/null; then
    print_error "Modal CLI não encontrado"
    exit 1
fi
print_success "modal CLI encontrado"

if ! command -v vercel &> /dev/null; then
    print_error "Vercel CLI não encontrado"
    exit 1
fi
print_success "vercel CLI encontrado"

if ! command -v python3 &> /dev/null; then
    print_error "python3 não encontrado"
    exit 1
fi
print_success "python3 encontrado"

# PASSO 2: Build TypeScript
print_header "PASSO 2: Build TypeScript Project"

echo "Construindo projeto Next.js..."
npm run build 2>&1 | tail -20

if [ $? -ne 0 ]; then
    print_error "Build falhou"
    exit 1
fi
print_success "Build concluído com sucesso"

# PASSO 3: Deploy Modal Worker
print_header "PASSO 3: Deploy Modal Worker"

echo "Fazendo deploy do Modal Worker..."
echo "Script: scripts/modal_audio_extractor_with_bright_data.py"

MODAL_DEPLOY_OUTPUT=$(modal deploy scripts/modal_audio_extractor_with_bright_data.py 2>&1)
echo "$MODAL_DEPLOY_OUTPUT"

# Extrair URL do Modal
MODAL_WORKER_URL=$(echo "$MODAL_DEPLOY_OUTPUT" | grep -oP 'https://[^ ]+\.modal\.run' | head -1)

if [ -z "$MODAL_WORKER_URL" ]; then
    print_error "Não consegui extrair a URL do Modal Worker"
    echo "Deploy output: $MODAL_DEPLOY_OUTPUT"
    exit 1
fi

print_success "Modal Worker deployado com sucesso"
echo "URL: $MODAL_WORKER_URL"

# PASSO 4: Atualizar .env com Modal URL
print_header "PASSO 4: Configurar Variáveis de Ambiente"

echo "Atualizando MODAL_WORKER_URL no Vercel..."
vercel env add MODAL_WORKER_URL "$MODAL_WORKER_URL" production --confirm || true

print_success "MODAL_WORKER_URL configurada"

# PASSO 5: Deploy Vercel Production
print_header "PASSO 5: Deploy Vercel Production"

echo "Fazendo deploy em produção..."
vercel deploy --prod --scope team_aIzC2rNSI32ygrTczJdmZJFu 2>&1 | tail -30

print_success "Deploy Vercel concluído"

# PASSO 6: Validar endpoints
print_header "PASSO 6: Validação Pós-Deployment"

echo "Aguardando estabilização da aplicação (5s)..."
sleep 5

PROD_URL=$(vercel list --scope team_aIzC2rNSI32ygrTczJdmZJFu 2>&1 | grep "unoduno" | head -1 | awk '{print $2}')

if [ -z "$PROD_URL" ]; then
    PROD_URL="https://unoduno.com"
fi

echo "Testando endpoints..."
echo "Production URL: $PROD_URL"

# Teste 1: GET /api/mastra/youtube-to-transcript
curl -s "$PROD_URL/api/mastra/youtube-to-transcript" | head -20

print_success "Endpoints respondendo"

# RESUMO
print_header "DEPLOYMENT CONCLUÍDO COM SUCESSO"

echo ""
echo "📊 RESUMO DO DEPLOYMENT:"
echo "   Modal Worker URL: $MODAL_WORKER_URL"
echo "   Production URL: $PROD_URL"
echo ""
echo "✅ Sistema pronto para produção!"
echo ""
echo "Próximas etapas:"
echo "1. Testar fluxo no dashboard"
echo "2. Validar cookies do YouTube"
echo "3. Monitorar logs em produção"
echo ""

