#!/usr/bin/env python3
"""
Test script para validar proxy Bright Data com yt-dlp
"""

import subprocess
import os
import sys
from pathlib import Path


def load_credentials() -> dict:
    """Carrega credenciais do arquivo BRIGHT_DATA_CREDENTIALS.env"""
    creds_file = Path("BRIGHT_DATA_CREDENTIALS.env")
    
    if not creds_file.exists():
        print("[✗] Arquivo BRIGHT_DATA_CREDENTIALS.env não encontrado!")
        print("    Execute: python scripts/bright_data_setup.py --api-key YOUR_KEY --username YOUR_USERNAME")
        return {}
    
    creds = {}
    with open(creds_file) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, value = line.split("=", 1)
                creds[key.strip()] = value.strip()
    
    return creds


def build_proxy_url(creds: dict) -> str:
    """Constrói URL do proxy no formato http://user:pass@host:port"""
    username = creds.get("BRIGHT_DATA_USERNAME")
    zone = creds.get("BRIGHT_DATA_ZONE")
    host = creds.get("BRIGHT_DATA_PROXY_HOST", "proxy.provider.brightdata.com")
    port = creds.get("BRIGHT_DATA_PROXY_PORT", "22225")
    
    # Formato Bright Data: username-zone:password@host:port
    proxy_url = f"http://{username}-{zone}:password@{host}:{port}"
    return proxy_url


def test_proxy_with_youtube() -> bool:
    """Testa proxy com um vídeo do YouTube real"""
    print("[*] Testando proxy com vídeo do YouTube...")
    
    creds = load_credentials()
    if not creds:
        return False
    
    proxy_url = build_proxy_url(creds)
    
    # Usar um vídeo curto para teste
    test_video = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    
    cmd = [
        "yt-dlp",
        "--proxy", proxy_url,
        "-x",
        "--audio-format", "mp3",
        "--audio-quality", "48",
        "-o", "/tmp/test_audio.mp3",
        test_video,
        "--no-warnings",
        "-v"
    ]
    
    print(f"[*] Executando: yt-dlp --proxy [HIDDEN] -x --audio-format mp3...")
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        
        if result.returncode == 0:
            print("[✓] Download via proxy bem-sucedido!")
            
            # Limpar arquivo de teste
            if os.path.exists("/tmp/test_audio.mp3"):
                os.remove("/tmp/test_audio.mp3")
            
            return True
        else:
            print("[✗] Erro no download:")
            print(result.stderr[-500:] if len(result.stderr) > 500 else result.stderr)
            return False
    
    except subprocess.TimeoutExpired:
        print("[✗] Timeout na requisição (60s)")
        return False
    except Exception as e:
        print(f"[✗] Erro: {e}")
        return False


def test_proxy_connection() -> bool:
    """Testa conexão básica com o proxy (sem YouTube)"""
    print("[*] Testando conexão com proxy...")
    
    creds = load_credentials()
    if not creds:
        return False
    
    proxy_url = build_proxy_url(creds)
    username = creds.get("BRIGHT_DATA_USERNAME")
    zone = creds.get("BRIGHT_DATA_ZONE")
    host = creds.get("BRIGHT_DATA_PROXY_HOST", "proxy.provider.brightdata.com")
    port = creds.get("BRIGHT_DATA_PROXY_PORT", "22225")
    
    print(f"[*] Proxy: {host}:{port}")
    print(f"[*] Zona: {zone}")
    print(f"[*] Username: {username}")
    
    # Testar com curl
    cmd = [
        "curl",
        "-x", proxy_url,
        "-I",
        "https://www.youtube.com",
        "--max-time", "10"
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
        
        if result.returncode == 0 or "HTTP" in result.stdout or "HTTP" in result.stderr:
            print("[✓] Conexão com proxy estabelecida!")
            return True
        else:
            print("[✗] Falha na conexão com proxy")
            return False
    except Exception as e:
        print(f"[✗] Erro ao testar: {e}")
        return False


def main():
    print("\n" + "="*60)
    print("BRIGHT DATA PROXY TEST")
    print("="*60 + "\n")
    
    # Verificar se yt-dlp está instalado
    if subprocess.run(["which", "yt-dlp"], capture_output=True).returncode != 0:
        print("[✗] yt-dlp não está instalado!")
        print("    Instale com: pip install yt-dlp")
        sys.exit(1)
    
    # Teste 1: Conexão com proxy
    print("--- Teste 1: Conexão com Proxy ---")
    conn_ok = test_proxy_connection()
    
    # Teste 2: Download via YouTube
    print("\n--- Teste 2: Download via YouTube ---")
    yt_ok = test_proxy_with_youtube()
    
    # Resumo
    print("\n" + "="*60)
    if conn_ok and yt_ok:
        print("✓ TODOS OS TESTES PASSARAM!")
        print("  Proxy Bright Data está configurado corretamente")
        print("  Pronto para produção!")
        sys.exit(0)
    elif conn_ok:
        print("⚠ Conexão com proxy OK, mas download YouTube falhou")
        print("  Verifique credenciais ou permissões de zona")
        sys.exit(1)
    else:
        print("✗ TESTES FALHARAM!")
        print("  Verifique:")
        print("  - Credenciais Bright Data")
        print("  - Host e porta do proxy")
        print("  - Zona residencial está ativa")
        sys.exit(1)


if __name__ == "__main__":
    main()
