# Bright Data Quick Start - Zona Auto-Setup

## 3 Passos Rápidos

### 1️⃣ Instalar Dependências
```bash
pip install requests
```

### 2️⃣ Executar Script de Auto-Setup
```bash
# Opção A: Com argumentos
python scripts/bright_data_setup.py \
  --api-key "YOUR_API_KEY" \
  --username "YOUR_USERNAME"

# Opção B: Com variáveis de ambiente
export BRIGHT_DATA_API_KEY="YOUR_API_KEY"
export BRIGHT_DATA_USERNAME="YOUR_USERNAME"
python scripts/bright_data_setup.py
```

### 3️⃣ Copiar Credenciais para .env
O script gera um arquivo `BRIGHT_DATA_CREDENTIALS.env` com:
```bash
BRIGHT_DATA_API_KEY=...
BRIGHT_DATA_USERNAME=...
BRIGHT_DATA_ZONE=unoduno-youtube-zone
BRIGHT_DATA_PROXY_PORT=22225
```

Copie essas variáveis para seu `.env` do projeto.

## Onde Conseguir API Key e Username?

1. Acesse https://www.brightdata.com/ e faça login
2. Vá para **Settings** → **API** → **Authentication**
3. Copie:
   - **Username**: Ex. `brd-customer-123456`
   - **API Key**: Ex. `abcd1234-efgh5678-ijkl9012`

## O Que o Script Faz?

- ✅ Testa conexão com API Bright Data
- ✅ Cria zona `unoduno-youtube-zone` com proxy residencial
- ✅ Formata credenciais para .env
- ✅ Gera script de teste (`scripts/test_bright_data_proxy.py`)
- ✅ Valida que o proxy funciona com YouTube

## Próximo Passo

Depois de configurar, deploy o Modal Worker:

```bash
modal deploy scripts/modal_audio_extractor_with_bright_data.py
```

## Troubleshooting

**"Erro 401: Unauthorized"**
- Verifique API Key e Username (copie exatamente do dashboard)
- Certifique-se que a conta Bright Data é válida

**"Zona já existe"**
- O script detecta se a zona já foi criada
- Pode usar a zona existente sem problemas

**"Proxy não funciona"**
- Execute: `python scripts/test_bright_data_proxy.py`
- Verifique se credenciais estão corretas em .env
- Contato Bright Data support: https://support.brightdata.com/

## Documentação Completa

Ver: `BRIGHT_DATA_SETUP.md` para setup manual e troubleshooting avançado.
