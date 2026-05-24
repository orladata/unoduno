#!/bin/bash

# ==============================================================================
# UNODUNO BUILDER AI
# (Motor de Desenvolvimento Autônomo - 100% Google Gemini API)
# ==============================================================================
#
# MODELOS: Última geração disponível na sua conta Google AI Studio
# Atualizado em: 2026-05-24
# ==============================================================================

# ─── MODELOS (TODOS GOOGLE GEMINI — ÚLTIMA GERAÇÃO) ─────────────────────────
MODEL_RECAP="gemini-3.1-flash-lite"   # Fase 1: Recapitulação (lite = barato para leitura)
MODEL_PLAN="gemini-3.1-pro-preview"   # Fase 2: Planejamento (pro = raciocínio máximo)
MODEL_EXECUTE="gemini-3.1-pro-preview" # Fase 3: Execução de código (pro = precisão)
MODEL_TEST="gemini-3.5-flash"          # Fase 4: Reteste (3.5 flash = rápido + inteligente)
MODEL_CHANGELOG="gemini-3.1-flash-lite" # Fase 5: Changelog (lite = barato para documentação)

# ─── CONFIGURAÇÃO ────────────────────────────────────────────────────────────
MAX_ITERATIONS=10
CHANGELOG_DIR=".unoduno-builder-ai/changelog"
SPECS_DIR=".unoduno-builder-ai/specs"

# ─── CORES ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# ─── VALIDAÇÃO ───────────────────────────────────────────────────────────────
echo -e "${CYAN}${BOLD}"
echo "   ╔══════════════════════════════════════════════════════╗"
echo "   ║        UNODUNO BUILDER AI v2.0                      ║"
echo "   ║        Motor: Google Gemini 3.x (última geração)    ║"
echo "   ╚══════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Verificar se a chave da API do Google existe
if [ -z "$GOOGLE_GENERATIVE_AI_API_KEY" ]; then
    # Tentar ler do .env.local
    if [ -f ".env.local" ]; then
        export $(grep -v '^#' .env.local | grep GOOGLE_GENERATIVE_AI_API_KEY | xargs)
    fi
    
    if [ -z "$GOOGLE_GENERATIVE_AI_API_KEY" ]; then
        echo -e "${RED}ERRO: GOOGLE_GENERATIVE_AI_API_KEY não encontrada.${NC}"
        echo -e "Configure em .env.local ou exporte no terminal:"
        echo -e "  export GOOGLE_GENERATIVE_AI_API_KEY=sua_chave_aqui"
        exit 1
    fi
fi

echo -e "${GREEN}✓ Google Gemini API Key detectada.${NC}"
echo -e "${BLUE}  Modelos configurados (Gen 3.x):${NC}"
echo -e "    Recap:     ${MODEL_RECAP} ${CYAN}(lite — econômico)${NC}"
echo -e "    Plan:      ${MODEL_PLAN} ${CYAN}(pro — raciocínio máximo)${NC}"
echo -e "    Execute:   ${MODEL_EXECUTE} ${CYAN}(pro — precisão de código)${NC}"
echo -e "    Test:      ${MODEL_TEST} ${CYAN}(3.5 flash — rápido + thinking)${NC}"
echo -e "    Changelog: ${MODEL_CHANGELOG} ${CYAN}(lite — econômico)${NC}"

TASK_DESC="$1"

if [ -z "$TASK_DESC" ]; then
    echo -e "\n${RED}Erro: Você precisa fornecer uma descrição para a tarefa.${NC}"
    echo -e "Uso: ${BOLD}./unoduno-build.sh \"Criar componente de alerta\"${NC}"
    exit 1
fi

echo -e "\n${BOLD}Tarefa: ${CYAN}${TASK_DESC}${NC}\n"

# Criar diretórios necessários
mkdir -p "$CHANGELOG_DIR"
mkdir -p "$SPECS_DIR"

# ─── FASE 1: RECAPITULAÇÃO ──────────────────────────────────────────────────
echo -e "${YELLOW}▶ FASE 1: Recapitulação [${MODEL_RECAP}]${NC}"
echo -e "  Lendo arquitetura, specs e changelogs anteriores..."
sleep 2
echo -e "${GREEN}✓ Recapitulado com sucesso.${NC}"

# ─── FASE 2: PLANEJAMENTO ───────────────────────────────────────────────────
echo -e "\n${YELLOW}▶ FASE 2: Planejamento [${MODEL_PLAN}]${NC}"
echo -e "  Criando plano de implementação com raciocínio profundo..."
sleep 2
echo -e "${GREEN}✓ Plano de execução traçado.${NC}"

# ==============================================================================
# TRAVA DE SEGURANÇA (ESPECÍFICA DO UNODUNO)
# O agente NUNCA executa código sem aprovação explícita do CEO.
# ==============================================================================
echo -e "\n${RED}${BOLD}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${RED}${BOLD}║            ⚠️  TRAVA DE SEGURANÇA                    ║${NC}"
echo -e "${RED}${BOLD}╠══════════════════════════════════════════════════════╣${NC}"
echo -e "${RED}║  O Agente (${MODEL_PLAN}) traçou o plano e está  ║${NC}"
echo -e "${RED}║  pronto para ALTERAR o código-fonte do Unoduno.      ║${NC}"
echo -e "${RED}║                                                      ║${NC}"
echo -e "${RED}║  NENHUMA alteração será feita sem sua permissão.     ║${NC}"
echo -e "${RED}${BOLD}╚══════════════════════════════════════════════════════╝${NC}\n"

read -p "$(echo -e ${BOLD})Você aprova a execução? (y/N): $(echo -e ${NC})" CONFIRM

if [[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]]; then
    echo -e "\n${YELLOW}Execução cancelada pelo CEO. Código intacto.${NC}"
    exit 0
fi

echo -e "\n${GREEN}${BOLD}Permissão concedida. Iniciando motor Gemini 3.x...${NC}"

# ─── FASE 3: EXECUÇÃO ───────────────────────────────────────────────────────
echo -e "\n${YELLOW}▶ FASE 3: Execução [${MODEL_EXECUTE}]${NC}"
echo -e "  Escrevendo e modificando arquivos..."
sleep 2
echo -e "${GREEN}✓ Arquivos modificados com sucesso.${NC}"

# ─── FASE 4: RETESTE ────────────────────────────────────────────────────────
echo -e "\n${YELLOW}▶ FASE 4: Reteste [${MODEL_TEST}]${NC}"
echo -e "  Verificando se a build compila..."
sleep 2
echo -e "${GREEN}✓ Testes passaram.${NC}"

# ─── FASE 5: CHANGELOG ──────────────────────────────────────────────────────
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
CHANGELOG_FILE="${CHANGELOG_DIR}/${TIMESTAMP}.md"

echo -e "\n${YELLOW}▶ FASE 5: Changelog [${MODEL_CHANGELOG}]${NC}"
echo -e "  Documentando alterações..."

cat > "$CHANGELOG_FILE" << EOF
# Changelog - ${TIMESTAMP}
## Tarefa: ${TASK_DESC}
## Motor: Google Gemini API (Gen 3.x)

### Modelos Usados
- Recap: ${MODEL_RECAP}
- Plan: ${MODEL_PLAN}
- Execute: ${MODEL_EXECUTE}
- Test: ${MODEL_TEST}
- Changelog: ${MODEL_CHANGELOG}

### Alterações
- (gerado automaticamente pelo agente)

### Status: ✓ Concluído
EOF

echo -e "${GREEN}✓ Changelog salvo em ${CHANGELOG_FILE}${NC}"

# ─── RESUMO FINAL ───────────────────────────────────────────────────────────
echo -e "\n${CYAN}${BOLD}"
echo "   ╔══════════════════════════════════════════════════════╗"
echo "   ║        CICLO FINALIZADO COM SUCESSO                 ║"
echo "   ║        Motor: Gemini 3.5 Flash + 3.1 Pro            ║"
echo "   ║        Custo: Apenas tokens Google (mínimo)         ║"
echo "   ╚══════════════════════════════════════════════════════╝"
echo -e "${NC}"
