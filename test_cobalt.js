// Testando com fetch nativo do Node.js

async function testCobalt() {
  const url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"; // Rickroll test
  console.log("Testando Cobalt API para:", url);
  
  try {
    const res = await fetch('https://api.cobalt.tools/api/json', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: url,
        isAudioOnly: true,
        aFormat: "mp3"
      })
    });
    
    const text = await res.text();
    console.log("Status HTTP:", res.status);
    console.log("Resposta Cobalt:", text);
    
    if (res.ok) {
      const data = JSON.parse(text);
      if (data.url) {
        console.log("SUCESSO! URL Direta extraída:", data.url);
      }
    }
  } catch (e) {
    console.error("Erro no teste:", e);
  }
}

testCobalt();
