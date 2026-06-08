const fetch = require('node-fetch');

async function testApi() {
  console.log("Enviando requisição...");
  try {
    const res = await fetch("https://unoduno.com/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: "Analise: https://youtu.be/Pn3PAOV_QJM?si=lv3pp038ydEYj_6f" }]
      })
    });
    
    console.log("Status:", res.status);
    console.log("Headers:", res.headers.raw());
    
    const text = await res.text();
    console.log("Response Text Length:", text.length);
    console.log("Response Text Preview:", text.substring(0, 500));
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

testApi();
