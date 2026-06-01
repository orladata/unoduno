#!/usr/bin/env python3
"""
Bright Data Zone Auto-Setup Script (Corrigido)
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
import base64
from datetime import datetime


class BrightDataSetup:
    """Gerencia setup automático de zona Bright Data via API"""
    
    API_BASE = "https://api.brightdata.com/api"
    
    def __init__(self, api_key: str, username: str):
        self.api_key = api_key
        self.username = username
        # Bright Data usa Basic Auth com email:api_key
        auth_string = f"{username}:{api_key}"
        auth_bytes = auth_string.encode('utf-8')
        auth_b64 = base64.b64encode(auth_bytes).decode('utf-8')
        self.headers = {
            "Authorization": f"Basic {auth_b64}",
            "Content-Type": "application/json"
        }
    
    def test_connection(self) -> bool:
        """Testa se as credenciais funcionam"""
        print("[Bright Data] Testando conexão com API...")
        try:
            response = requests.get(
                f"{self.API_BASE}/zone/list",
                headers=self.headers,
                timeout=10
            )
            if response.status_code == 200:
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
                f"{self.API_BASE}/zone/list",
                headers=self.headers,
                timeout=10
            )
            if response.status_code == 200:
                zones = response.json() or []
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
                print(f"[Bright Data] ✅ Zona '{zone_name}' já existe (ID: {zone.get('zone_id')})")
                return zone
        
        # Criar zona
        zone_data = {
            "name": zone_name,
            "zone_type": 3,  # 3 = Residential
            "short_description": "YouTube audio extraction with Bright Data residential proxy",
            "status": "active"
        }
        
        try:
            response = requests.post(
                f"{self.API_BASE}/zone/create",
                headers=self.headers,
                json=zone_data,
                timeout=30
            )
            
            if response.status_code in [200, 201]:
                result = response.json()
                print(f"[Bright Data] ✅ Zona criada com sucesso!")
                print(f"[Bright Data] Zone ID: {result.get('zone_id')}")
                print(f"[Bright Data] Zone Password: {result.get('password', 'N/A')[:20]}...")
                return result
            else:
                print(f"[Bright Data] ❌ Erro ao criar zona: {response.status_code}")
                print(f"[Bright Data] Resposta: {response.text}")
                return None
        except Exception as e:
            print(f"[Bright Data] ❌ Erro ao criar zona: {str(e)}")
            return None
    
    def get_zone_credentials(self) -> dict:
        """Retorna credenciais formatadas para .env"""
        return {
            "BRIGHT_DATA_API_KEY": self.api_key,
            "BRIGHT_DATA_USERNAME": self.username,
            "BRIGHT_DATA_ZONE": "unoduno-youtube-zone",
            "BRIGHT_DATA_PROXY_PORT": "22225"
        }
    
    def save_credentials(self, credentials: dict):
        """Salva credenciais em arquivo"""
        filename = "BRIGHT_DATA_CREDENTIALS.env"
        try:
            with open(filename, 'w') as f:
                f.write("# Bright Data Credentials (gerado em setup)\n")
                f.write(f"# {datetime.now().isoformat()}\n\n")
                for key, value in credentials.items():
                    f.write(f"{key}={value}\n")
            print(f"[Bright Data] ✅ Credenciais salvas em: {filename}")
            return True
        except Exception as e:
            print(f"[Bright Data] ❌ Erro ao salvar credenciais: {str(e)}")
            return False


def main():
    parser = argparse.ArgumentParser(description='Bright Data Zone Auto-Setup')
    parser.add_argument('--api-key', required=False, help='Bright Data API Key')
    parser.add_argument('--username', required=False, help='Bright Data Username')
    args = parser.parse_args()
    
    # Tentar obter credenciais de variáveis de ambiente
    api_key = args.api_key or os.getenv('BRIGHT_DATA_API_KEY')
    username = args.username or os.getenv('BRIGHT_DATA_USERNAME')
    
    if not api_key or not username:
        print("❌ Erro: Forneça API_KEY e USERNAME via argumentos ou variáveis de ambiente")
        print("Uso: python scripts/bright_data_setup.py --api-key YOUR_KEY --username YOUR_USERNAME")
        sys.exit(1)
    
    print("=" * 60)
    print("Bright Data Zone Auto-Setup para YouTube Audio Extraction")
    print("=" * 60)
    
    # Inicializar setup
    setup = BrightDataSetup(api_key, username)
    
    # Testar conexão
    if not setup.test_connection():
        print("❌ Não consegui conectar com as credenciais fornecidas!")
        sys.exit(1)
    
    # Criar/validar zona
    zone = setup.create_zone()
    if not zone:
        print("❌ Não consegui criar/validar a zona!")
        sys.exit(1)
    
    # Obter e salvar credenciais
    credentials = setup.get_zone_credentials()
    
    print("\nCredenciais para .env:")
    print("=" * 60)
    for key, value in credentials.items():
        if key == "BRIGHT_DATA_API_KEY":
            print(f"{key}={value[:20]}...")
        else:
            print(f"{key}={value}")
    
    # Salvar em arquivo
    setup.save_credentials(credentials)
    
    print("\n✅ Setup concluído com sucesso!")
    print("Próximo passo: Deploy do Modal Worker")


if __name__ == "__main__":
    main()
