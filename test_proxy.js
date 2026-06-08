const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');

const proxy = 'http://brd-customer-hl_50cfa19c-zone-unodunoproxy:voo5cpt5qjsn@brd.superproxy.io:33335';
const agent = new HttpsProxyAgent(proxy);

async function test() {
  try {
    console.log("Testando proxy na Bright Data...");
    // Primeiro testamos o IP (que deve retornar um IP europeu/portugues)
    const res1 = await axios.get('https://lumtest.com/myip.json', { httpsAgent: agent });
    console.log("SUCESSO: Seu IP via Proxy é:", res1.data.ip);
    
    // Depois testamos o YouTube
    console.log("Testando acesso ao YouTube...");
    const res2 = await axios.get('https://www.youtube.com', { httpsAgent: agent });
    console.log("SUCESSO: YouTube acessado! Status:", res2.status);
    
  } catch (error) {
    if (error.response && error.response.status === 407) {
      console.error("ERRO 407: Autenticação falhou ou IP bloqueado (ip_forbidden).");
    } else {
      console.error("ERRO:", error.message);
    }
  }
}

test();
