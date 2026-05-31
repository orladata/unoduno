# Bright Data Quick Start

Setup automático de proxy residencial Bright Data em 3 passos.

## Passo 1: Obter Credenciais Bright Data

1. Acesse: https://www.brightdata.com/
2. Faça login ou crie uma conta
3. Vá para **Dashboard → Settings → API**
4. Copie:
   - **API Key** (aka "Authentication Token")
   - **Username** (seu username Bright Data)

## Passo 2: Executar Script de Setup

```bash
python scripts/bright_data_setup.py \
  --api-key YOUR_API_KEY \
  --username YOUR_USERNAME
```

Ou use variáveis de ambiente:

```bash
export BRIGHT_DATA_API_KEY=your_api_key
export BRIGHT_DATA_USERNAME=your_username
python scripts/bright_data_setup.py
```

## Passo 3: Adicionar Credenciais ao .env

O script cria um arquivo `BRIGHT_DATA_CREDENTIALS.env` com as credenciais. Copie o conteúdo para seu `.env.local` ou arquivo de variáveis de ambiente da aplicação.

## O que o Script Faz

1. **Testa conexão** com as credenciais fornecidas
2. **Lista zonas** existentes para não duplicar
3. **Cria zona residencial** `unoduno-youtube-zone` (se não existir)
4. **Salva credenciais** formatadas em `BRIGHT_DATA_CREDENTIALS.env`
5. **Gera script de teste** para validar o proxy

## Validar Proxy

```bash
python scripts/test_bright_data_proxy.py
```

Este script testa:
- Conexão com o proxy
- Download de vídeo YouTube via proxy
- Compatibilidade com yt-dlp

## Troubleshooting

### "Conexão falhou"
- Verifique se API Key e Username estão corretos
- Confirme que sua conta tem acesso a proxy residencial

### "Zona não foi criada"
- Pode ser que a zona já existe (script detecta e reutiliza)
- Verifique no dashboard Bright Data

### "yt-dlp falha com proxy"
- Confirme que zona está ativa no dashboard
- Tente testar proxy com `curl` primeiro
- Verifique se a porta (22225) está correta

## Documentação Completa

Para mais detalhes, veja: `BRIGHT_DATA_SETUP.md`
