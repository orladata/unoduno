import requests

proxy_url = "http://brd-customer-hl_50cfa19c-zone-unodunoproxy:voo5cpt5qjsn@brd.superproxy.io:33335"
proxies = {
    "http": proxy_url,
    "https": proxy_url
}

print("Testando IP da Bright Data...")
try:
    res = requests.get("https://lumtest.com/myip.json", proxies=proxies, timeout=10)
    print("SUCESSO! IP do Proxy:", res.json().get('ip'))
except Exception as e:
    print("ERRO no IP:", e)

print("\nTestando acesso ao YouTube...")
try:
    res = requests.get("https://www.youtube.com", proxies=proxies, timeout=10)
    print("SUCESSO! Status YouTube:", res.status_code)
except Exception as e:
    print("ERRO no YouTube:", e)
