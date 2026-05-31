#!/usr/bin/env python3
"""
Bright Data Zone Auto-Setup Script
Cria zona de proxy residencial automaticamente via API Bright Data

Uso:
    python scripts/bright_data_setup.py --api-key YOUR_API_KEY --username YOUR_USERNAME

Saída:
    - Cria zona 'unoduno-youtube-zone' com acesso residencial
    - Retorna credenciais formatadas para .env
"""

import os
import sys
import json
import argparse
import requests
from datetime import datetime


class BrightDataSetup:
    """Gerencia setup automático de zona Bright Data via API"""
    
    BASE_URL = "https://api.brightdata.com/zone"
    
    def __init__(self, api_key: str, username: str):
        self.api_key = api_key
        self.username = username
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
    
    def test_connection(self) -> bool:
        """Testa se as credenciais funcionam"""
        print("[Bright Data] Testando conexão com API...")
        try:
            response = requests.get(
                self.BASE_URL,
                headers=self.headers,
                timeout=10
            )
            if response.status_code in [200, 401]:  # 401 é acesso negado válido
                print("[Bright Data] ✅ Conexão bem-sucedida!")
                return True
            else:
                print(f"[Bright Data] ❌ Erro na conexão: {response.status_code}")
                print(f"[Bright Data] Resposta: {response.text}")
                return False
        except Exception as e:
            print(f"[Bright Data] ❌ Erro ao conectar: {str(e)}")
            return False
    
    def list_zones(self) -> list:
        """Lista todas as zonas existentes"""
        print("[Bright Data] Listando zonas existentes...")
        try:
            response = requests.get(
                self.BASE_URL,
                headers=self.headers,
                timeout=10
            )
            if response.status_code == 200:
                zones = response.json()
                print(f"[Bright Data] ✅ {len(zones)} zona(s) encontrada(s)")
                return zones
            else:
                print(f"[Bright Data] Erro ao listar zonas: {response.status_code}")
                return []
        except Exception as e:
            print(f"[Bright Data] Erro: {str(e)}")
            return []
    
    def create_zone(self, zone_name: str = "unoduno-youtube-zone") -> dict:
        """Cria nova zona de proxy residencial para YouTube"""
        print(f"[Bright Data] Criando zona: {zone_name}")
        
        # Verificar se zona já existe
        existing_zones = self.list_zones()
        for zone in existing_zones:
            if zone.get('name') == zone_name:
                print(f"[Bright Data] ⚠️  Zona '{zone_name}' já existe!")
                print(f"[Bright Data] Zone ID: {zone.get('zone_id')}")
                print(f"[Bright Data] Password: {zone.get('password')}")
                return zone
        
        # Criar nova zona
        payload = {
            "name": zone_name,
            "description": "Unoduno YouTube Audio Extraction - Residential Proxies",
            "zone_type": "residential",  # Tipo de proxy: residential
            "country": "all",  # Todos os países
            "asn": "",
            "state": "",
            "city": "",
            "isp": "",
            "carrier": "",
            "route": "",
            "pool_size": 0,  # 0 = usar pool dinâmico
            "vip": False,
            "enable_custom_whitelist": False,
        }
        
        try:
            response = requests.post(
                self.BASE_URL,
                headers=self.headers,
                json=payload,
                timeout=15
            )
            
            if response.status_code in [200, 201]:
                zone_data = response.json()
                print(f"[Bright Data] ✅ Zona criada com sucesso!")
                print(f"[Bright Data] Zone ID: {zone_data.get('zone_id')}")
                print(f"[Bright Data] Zone Name: {zone_data.get('name')}")
                print(f"[Bright Data] Password: {zone_data.get('password')}")
                return zone_data
            else:
                print(f"[Bright Data] ❌ Erro ao criar zona: {response.status_code}")
                print(f"[Bright Data] Resposta: {response.text}")
                return {}
        except Exception as e:
            print(f"[Bright Data] ❌ Erro: {str(e)}")
            return {}
    
    def format_env_vars(self, zone_data: dict, proxy_port: int = 22225) -> str:
        """Formata credenciais para usar em .env"""
        zone_id = zone_data.get('zone_id')
        zone_name = zone_data.get('name')
        password = zone_data.get('password')
        
        if not all([zone_id, zone_name, password]):
            return ""
        
        env_text = f"""
# Bright Data Proxy Configuration
# Gerado em: {datetime.now().isoformat()}

# Chave API Bright Data
BRIGHT_DATA_API_KEY={self.api_key}

# Username Bright Data (seu username)
BRIGHT_DATA_USERNAME={self.username}

# Nome da zona criada
BRIGHT_DATA_ZONE={zone_name}

# Porta do proxy (22225 = HTTPS)
BRIGHT_DATA_PROXY_PORT={proxy_port}

# Informações adicionais (não necessárias no .env)
# Zone ID: {zone_id}
# Zone Password: {password}
# Proxy URL: http://{self.username}:{self.api_key}@brd.superproxy.io:{proxy_port}
"""
        return env_text.strip()
    
    def generate_setup_script(self, zone_data: dict) -> str:
        """Gera script de teste para validar o proxy"""
        zone_name = zone_data.get('name', 'unoduno-youtube-zone')
        
        script = f'''#!/usr/bin/env python3
"""
Script de teste para validar proxy Bright Data
"""

import subprocess
import os

# Configurações
BRIGHT_DATA_USERNAME = "{self.username}"
BRIGHT_DATA_API_KEY = "{self.api_key}"
BRIGHT_DATA_ZONE = "{zone_name}"
PROXY_PORT = 22225

# Construir URL do proxy
PROXY_URL = f"http://{{BRIGHT_DATA_USERNAME}}:{{BRIGHT_DATA_API_KEY}}@brd.superproxy.io:{{PROXY_PORT}}"

# Testar proxy com curl
print("Testando proxy Bright Data...")
print(f"Proxy URL: {{PROXY_URL[:40]}}...")

result = subprocess.run([
    "curl",
    "-x", PROXY_URL,
    "https://www.youtube.com",
    "-I",
    "-L",
    "-w", "\\nStatus: %{{http_code}}\\n",
], capture_output=True, text=True, timeout=10)

print(result.stdout)
if result.stderr:
    print("Erros:", result.stderr)

# Testar com yt-dlp
print("\\nTestando yt-dlp com proxy...")
test_url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"  # YouTube Rick Roll

result = subprocess.run([
    "yt-dlp",
    "--proxy", PROXY_URL,
    "-x",
    "--audio-format", "mp3",
    "--audio-quality", "48",
    test_url,
    "-o", "/tmp/test_audio.mp3",
], capture_output=True, text=True, timeout=30)

if result.returncode == 0:
    print("✅ yt-dlp funcionou com proxy!")
else:
    print("❌ yt-dlp falhou:")
    print(result.stderr)
'''
        return script


def main():
    parser = argparse.ArgumentParser(
        description="Cria zona Bright Data para YouTube audio extraction"
    )
    parser.add_argument(
        "--api-key",
        help="API Key Bright Data (ou use env var BRIGHT_DATA_API_KEY)",
        default=os.getenv("BRIGHT_DATA_API_KEY")
    )
    parser.add_argument(
        "--username",
        help="Username Bright Data (ou use env var BRIGHT_DATA_USERNAME)",
        default=os.getenv("BRIGHT_DATA_USERNAME")
    )
    parser.add_argument(
        "--zone-name",
        help="Nome da zona a criar (padrão: unoduno-youtube-zone)",
        default="unoduno-youtube-zone"
    )
    parser.add_argument(
        "--proxy-port",
        type=int,
        help="Porta do proxy (padrão: 22225)",
        default=22225
    )
    
    args = parser.parse_args()
    
    # Validar argumentos
    if not args.api_key or not args.username:
        print("❌ Erro: API Key e Username são obrigatórios!")
        print("\nUse:")
        print("  python scripts/bright_data_setup.py --api-key YOUR_KEY --username YOUR_USER")
        print("\nOu configure variáveis de ambiente:")
        print("  export BRIGHT_DATA_API_KEY=your_key")
        print("  export BRIGHT_DATA_USERNAME=your_username")
        print("  python scripts/bright_data_setup.py")
        sys.exit(1)
    
    # Criar instância do setup
    setup = BrightDataSetup(args.api_key, args.username)
    
    print("=" * 60)
    print("Bright Data Zone Auto-Setup para YouTube Audio Extraction")
    print("=" * 60)
    
    # Testar conexão
    if not setup.test_connection():
        print("\n❌ Não consegui conectar com as credenciais fornecidas!")
        sys.exit(1)
    
    # Criar zona
    zone_data = setup.create_zone(args.zone_name)
    
    if not zone_data:
        print("\n❌ Falha ao criar zona!")
        sys.exit(1)
    
    # Exibir credenciais formatadas
    print("\n" + "=" * 60)
    print("Credenciais para .env:")
    print("=" * 60)
    env_vars = setup.format_env_vars(zone_data, args.proxy_port)
    print(env_vars)
    
    # Salvar em arquivo
    env_file = "BRIGHT_DATA_CREDENTIALS.env"
    with open(env_file, "w") as f:
        f.write(env_vars)
    print(f"\n✅ Credenciais salvas em: {env_file}")
    
    # Gerar script de teste
    print("\n" + "=" * 60)
    print("Script de teste gerado!")
    print("=" * 60)
    
    test_script = setup.generate_setup_script(zone_data)
    test_script_file = "scripts/test_bright_data_proxy.py"
    with open(test_script_file, "w") as f:
        f.write(test_script)
    print(f"✅ Teste script salvo em: {test_script_file}")
    print(f"\nPara testar o proxy, execute:")
    print(f"  python {test_script_file}")
    
    print("\n" + "=" * 60)
    print("Próximos passos:")
    print("=" * 60)
    print("1. Copie as credenciais acima para seu arquivo .env")
    print("2. Execute o script de teste para validar o proxy")
    print("3. Deploy o Modal Worker com as credenciais configuradas")
    print("\nDocumentação:")
    print("  - Setup: BRIGHT_DATA_SETUP.md")
    print("  - Modal Worker: scripts/modal_audio_extractor_with_bright_data.py")


if __name__ == "__main__":
    main()
