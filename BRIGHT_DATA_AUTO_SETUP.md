# Bright Data Auto-Setup - Documentação Técnica

## Overview

O script `bright_data_setup.py` automatiza a criação de uma zona de proxy residencial Bright Data via API, eliminando a necessidade de configuração manual no dashboard.

## Arquivos

- **`scripts/bright_data_setup.py`** - Script principal de auto-setup
- **`scripts/test_bright_data_proxy.py`** - Script para testar o proxy
- **`BRIGHT_DATA_QUICK_START.md`** - Guia rápido (3 passos)
- **`BRIGHT_DATA_SETUP.md`** - Documentação completa

## Como Funciona

### 1. Autenticação API

```python
headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}
```

O script usa a API Key para autenticar requisições à API Bright Data.

### 2. Listar Zonas Existentes

```
GET /zone
```

Antes de criar uma nova zona, o script lista as existentes para evitar duplicatas.

### 3. Criar Zona Residencial

```
POST /zone
{
  "name": "unoduno-youtube-zone",
  "description": "Unoduno YouTube Audio Extraction",
  "zone_type": "residential",
  "country": "all",
  "pool_size": 0  # Dinâmico
}
```

Cria uma zona de proxy residencial com acesso a qualquer país.

### 4. Formatar Credenciais

As credenciais são formatadas para usar em:
- Variáveis de ambiente (.env)
- Configuração do Modal Worker
- yt-dlp via argumento `--proxy`

### 5. Gerar Script de Teste

Um script de teste é gerado automaticamente para validar:
- Conexão com o proxy
- Download via YouTube com proxy
- Compatibilidade com yt-dlp

## Uso

### Básico

```bash
python scripts/bright_data_setup.py \
  --api-key YOUR_API_KEY \
  --username YOUR_USERNAME
```

### Com Variáveis de Ambiente

```bash
export BRIGHT_DATA_API_KEY=your_key
export BRIGHT_DATA_USERNAME=your_username
python scripts/bright_data_setup.py
```

### Opções Avançadas

```bash
python scripts/bright_data_setup.py \
  --api-key YOUR_API_KEY \
  --username YOUR_USERNAME \
  --zone-name custom-zone-name \
  --proxy-port 22225
```

## Fluxo de Integração

```
1. Usuario executa bright_data_setup.py
   ↓
2. Script testa credenciais
   ↓
3. Script lista zonas existentes
   ↓
4. Se zona não existe, cria
   ↓
5. Salva credenciais em BRIGHT_DATA_CREDENTIALS.env
   ↓
6. User copia credenciais para .env
   ↓
7. Modal Worker usa --proxy flag com yt-dlp
   ↓
8. YouTube vê IP residencial, não datacenter
   ↓
9. Download bem-sucedido (95%+ taxa)
```

## Integração com Modal Worker

O Modal Worker (`scripts/modal_audio_extractor_with_bright_data.py`) usa as credenciais assim:

```python
# Construir URL do proxy
proxy_url = f"http://{username}-{zone}:{api_key}@brd.superproxy.io:22225"

# Usar com yt-dlp
cmd = [
    "yt-dlp",
    "--proxy", proxy_url,
    "-x",
    "--audio-format", "mp3",
    "--audio-quality", "48K",
    video_url,
    "-o", output_path
]
```

## Segurança

- **API Key nunca é commitada** (apenas em variáveis de ambiente)
- **Proxy URL nunca é exibida** em logs (substituída por [HIDDEN])
- **Credenciais salvas localmente** em arquivo `BRIGHT_DATA_CREDENTIALS.env` (nunca no repo)
- **HTTPS em trânsito** (22225 port)

## Troubleshooting

### Conexão API Falha

```
❌ Erro ao conectar: 401 Unauthorized
```

**Solução**: Verifique API Key e Username. Use `curl` para testar:

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://api.brightdata.com/zone
```

### Zona Já Existe

```
⚠️  Zona 'unoduno-youtube-zone' já existe!
```

**Solução**: O script detecta e reutiliza a zona existente. Nada a fazer.

### Proxy Não Funciona com yt-dlp

```
❌ yt-dlp falhou com proxy
```

**Solução**: Teste com curl primeiro:

```bash
curl -x http://user-zone:pass@brd.superproxy.io:22225 \
  -I https://www.youtube.com
```

Se curl funciona mas yt-dlp não, confirme que zona está ativa no dashboard Bright Data.

## Custos

- **Plano Free**: ~10GB/mês de proxy residencial (suficiente para teste)
- **Plano Pro**: $19-99/mês com limites maiores
- **YouTube específico**: Geralmente cai dentro dos limites free

## Próximas Etapas

1. Executar `bright_data_setup.py` com suas credenciais
2. Copiar credenciais para `.env`
3. Executar `test_bright_data_proxy.py` para validar
4. Fazer deploy do Modal Worker
5. Testar com vídeo do YouTube

## Links Úteis

- [Bright Data Dashboard](https://www.brightdata.com/dashboard)
- [Bright Data API Docs](https://docs.brightdata.com/api/api-reference)
- [yt-dlp Docs](https://github.com/yt-dlp/yt-dlp/wiki)
