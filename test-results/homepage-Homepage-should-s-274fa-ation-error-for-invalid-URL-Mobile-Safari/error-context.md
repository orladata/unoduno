# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: homepage.spec.ts >> Homepage >> should show validation error for invalid URL
- Location: e2e\homepage.spec.ts:21:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/inválida/i)
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText(/inválida/i)

```

```yaml
- main:
  - link "Unoduno — início":
    - /url: "#inicio"
    - text: unoduno
  - button "Abrir menu"
  - region "Hero":
    - text: 12.458 roteiros gerados esta semana
    - heading "Onde o viral se torna seu." [level=1]
    - paragraph: Cole qualquer URL do YouTube e deixe nossos agentes neurais criarem o roteiro perfeito para o mercado brasileiro — com ganchos virais e precisão de retenção.
    - form "Analisar vídeo do YouTube":
      - text: URL do YouTube
      - img
      - textbox "URL do YouTube":
        - /placeholder: Cole o link de um vídeo viral gringo...
      - button "Analisar":
        - img
        - text: Analisar
    - text: "Sem ideias? Teste um viral real:"
    - button "🔥 Ver vídeos em alta hoje"
    - paragraph: Cole uma URL do YouTube
  - region "Funcionalidades":
    - paragraph: A Vantagem Injusta
    - heading "Tudo que você precisa para dominar o feed." [level=2]
    - article "Neural Translation":
      - heading "Neural Translation" [level=3]
      - paragraph: Adapta linguagem americana para o sotaque, gírias e referências culturais do Brasil — de forma completamente natural.
    - article "Pattern Recognition":
      - heading "Pattern Recognition" [level=3]
      - paragraph: Identifica os gatilhos de retenção que fazem o vídeo original performar e os replica no roteiro.
    - article "Hook Engineering":
      - heading "Hook Engineering" [level=3]
      - paragraph: Introduções virais nos primeiros 3 segundos para maximizar CTR e watch-time.
    - article "Multi-Platform Export":
      - heading "Multi-Platform Export" [level=3]
      - paragraph: YouTube, Instagram Reels, TikTok e podcasts — com formatação ideal para cada plataforma.
  - region "Prova social":
    - list "Estatisticas":
      - listitem "Mais de 12.400 roteiros gerados": 12.400+ roteiros gerados
      - listitem "3.2 vezes mais views em média": 3.2x aumento médio de views
      - listitem "47 segundos de tempo médio de geração": 47 seg tempo médio de geração
      - listitem "98 por cento de taxa de satisfação": 98% taxa de satisfação
    - paragraph: "*Dados agregados de Mai/2026"
    - paragraph: Depoimentos
    - heading "Quem usa, não volta para o processo antigo." [level=2]
    - figure "Carla Mendes Criadora de conteúdo — 38k inscritos":
      - img "5 estrelas"
      - blockquote:
        - paragraph: “Passei de 2k para 38k inscritos em 3 meses usando só o Unoduno. Os hooks gerados são absurdamente bons.”
      - paragraph: Carla Mendes
      - paragraph: Criadora de conteúdo — 38k inscritos
    - figure "Bruno Alves YouTuber de finanças — 91k inscritos":
      - img "5 estrelas"
      - blockquote:
        - paragraph: “Era tradutor manual por horas. Hoje colo a URL, pego o roteiro e gravo. Simples assim.”
      - paragraph: Bruno Alves
      - paragraph: YouTuber de finanças — 91k inscritos
    - figure "Tati Ramos Influenciadora lifestyle — 204k inscritos":
      - img "5 estrelas"
      - blockquote:
        - paragraph: “A adaptação cultural é o que diferencia. Não é tradução — é naturalização. Meu público nunca percebe que o conteúdo veio do inglês.”
      - paragraph: Tati Ramos
      - paragraph: Influenciadora lifestyle — 204k inscritos
    - figure "Carla Mendes Criadora de conteúdo — 38k inscritos":
      - img "5 estrelas"
      - blockquote:
        - paragraph: “Passei de 2k para 38k inscritos em 3 meses usando só o Unoduno. Os hooks gerados são absurdamente bons.”
      - paragraph: Carla Mendes
      - paragraph: Criadora de conteúdo — 38k inscritos
    - figure "Bruno Alves YouTuber de finanças — 91k inscritos":
      - img "5 estrelas"
      - blockquote:
        - paragraph: “Era tradutor manual por horas. Hoje colo a URL, pego o roteiro e gravo. Simples assim.”
      - paragraph: Bruno Alves
      - paragraph: YouTuber de finanças — 91k inscritos
    - figure "Tati Ramos Influenciadora lifestyle — 204k inscritos":
      - img "5 estrelas"
      - blockquote:
        - paragraph: “A adaptação cultural é o que diferencia. Não é tradução — é naturalização. Meu público nunca percebe que o conteúdo veio do inglês.”
      - paragraph: Tati Ramos
      - paragraph: Influenciadora lifestyle — 204k inscritos
    - figure "Carla Mendes Criadora de conteúdo — 38k inscritos":
      - img "5 estrelas"
      - blockquote:
        - paragraph: “Passei de 2k para 38k inscritos em 3 meses usando só o Unoduno. Os hooks gerados são absurdamente bons.”
      - paragraph: Carla Mendes
      - paragraph: Criadora de conteúdo — 38k inscritos
    - figure "Bruno Alves YouTuber de finanças — 91k inscritos":
      - img "5 estrelas"
      - blockquote:
        - paragraph: “Era tradutor manual por horas. Hoje colo a URL, pego o roteiro e gravo. Simples assim.”
      - paragraph: Bruno Alves
      - paragraph: YouTuber de finanças — 91k inscritos
    - figure "Tati Ramos Influenciadora lifestyle — 204k inscritos":
      - img "5 estrelas"
      - blockquote:
        - paragraph: “A adaptação cultural é o que diferencia. Não é tradução — é naturalização. Meu público nunca percebe que o conteúdo veio do inglês.”
      - paragraph: Tati Ramos
      - paragraph: Influenciadora lifestyle — 204k inscritos
    - figure "Carla Mendes Criadora de conteúdo — 38k inscritos":
      - img "5 estrelas"
      - blockquote:
        - paragraph: “Passei de 2k para 38k inscritos em 3 meses usando só o Unoduno. Os hooks gerados são absurdamente bons.”
      - paragraph: Carla Mendes
      - paragraph: Criadora de conteúdo — 38k inscritos
    - figure "Bruno Alves YouTuber de finanças — 91k inscritos":
      - img "5 estrelas"
      - blockquote:
        - paragraph: “Era tradutor manual por horas. Hoje colo a URL, pego o roteiro e gravo. Simples assim.”
      - paragraph: Bruno Alves
      - paragraph: YouTuber de finanças — 91k inscritos
    - figure "Tati Ramos Influenciadora lifestyle — 204k inscritos":
      - img "5 estrelas"
      - blockquote:
        - paragraph: “A adaptação cultural é o que diferencia. Não é tradução — é naturalização. Meu público nunca percebe que o conteúdo veio do inglês.”
      - paragraph: Tati Ramos
      - paragraph: Influenciadora lifestyle — 204k inscritos
  - region "Como funciona":
    - paragraph: A Mágica
    - heading "De URL a roteiro em segundos." [level=2]
    - region "De URL a roteiro em segundos.":
      - paragraph: INPUT
      - paragraph: $ unoduno analyze youtube.com/watch?v=dQw4w9WgXcQ
      - paragraph: "Capturing transcript: \"The 5 mistakes KILLING your YouTube channel\""
      - text: OUTPUT pt-BR
  - region "Perguntas frequentes":
    - paragraph: FAQ
    - heading "Perguntas frequentes" [level=2]
    - button "Como funciona a tradução neural?"
    - button "Posso usar com vídeos de qualquer canal?"
    - button "O conteúdo gerado é único?"
    - button "Quais plataformas são suportadas para export?"
    - button "Posso cancelar a qualquer momento?"
    - button "Tem suporte em português?"
  - region "Preços":
    - paragraph: Escalabilidade Ilimitada
    - heading "Planos feitos para criadores. Do primeiro viral ao império." [level=2]
    - paragraph: Experimente de graça. Escolha o plano ideal para a sua necessidade e desbloqueie o arsenal de inteligência artificial completo da Unoduno.
    - heading "Iniciante (Free)" [level=3]
    - paragraph: Excelente para testar o poder do motor neural Unoduno.
    - text: R$ 0 /mês
    - paragraph: Acesso imediato
    - list:
      - listitem: 1 Análise Completa gratuita
      - listitem: Acesso ao Avaliador Neural
      - listitem: Acesso à Máquina de Cortes
      - listitem: Sem exportação de PDF
    - button "Começar de Graça"
    - text: Mais Vendido
    - heading "Criador Pro" [level=3]
    - paragraph: A máquina de retenção para criadores de conteúdo sérios.
    - text: R$ 47 /mês
    - paragraph: Cancele quando quiser
    - list:
      - listitem: Análises ilimitadas (Motor Rápido)
      - listitem: Gerador de Ganchos Ilimitado
      - listitem: Acesso ao Avaliador Neural
      - listitem: Exportação em PDF Profissional
      - listitem: Acesso antecipado a novas IAs
    - button "Assinar Criador Pro"
    - heading "Agência Premium" [level=3]
    - paragraph: Poder computacional máximo para equipes e canais dark.
    - text: R$ 197 /mês
    - paragraph: Cancele quando quiser
    - list:
      - listitem: Tudo do plano Criador
      - listitem: Acesso ao Motor Premium 3.1 Pro
      - listitem: Máquina de Cortes Long-form
      - listitem: Análise avançada para até 5 marcas
      - listitem: Gerente de conta dedicado 24/7
    - button "Assinar Agência"
    - paragraph: Pagamentos 100% seguros processados via Stripe. Cancele sua assinatura a qualquer momento.
  - link "unoduno":
    - /url: "#inicio"
  - navigation "Links sociais":
    - link "Instagram":
      - /url: "#"
    - link "YouTube":
      - /url: "#"
    - link "Twitter / X":
      - /url: "#"
  - paragraph: © 2026 Unoduno — Todos os direitos reservados
  - link "Termos de Uso":
    - /url: /termos
  - link "Privacidade":
    - /url: /privacidade
  - link "oi@unoduno.com":
    - /url: mailto:oi@unoduno.com
- region "Notifications alt+T"
- alert
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test"
  2  | 
  3  | test.describe("Homepage", () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto("/")
  6  |   })
  7  | 
  8  |   test("should display the hero section with correct content", async ({ page }) => {
  9  |     // Check main heading
  10 |     await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
  11 |     
  12 |     // Check YouTube URL input exists
  13 |     const urlInput = page.getByRole("textbox", { name: /url do youtube/i })
  14 |     await expect(urlInput).toBeVisible()
  15 |     
  16 |     // Check analyze button exists
  17 |     const analyzeButton = page.getByRole("button", { name: /analisar/i })
  18 |     await expect(analyzeButton).toBeVisible()
  19 |   })
  20 | 
  21 |   test("should show validation error for invalid URL", async ({ page }) => {
  22 |     const urlInput = page.getByRole("textbox", { name: /url do youtube/i })
  23 |     const analyzeButton = page.getByRole("button", { name: /analisar/i })
  24 | 
  25 |     // Enter invalid URL
  26 |     await urlInput.fill("https://google.com")
  27 |     await analyzeButton.click()
  28 | 
  29 |     // Should show error message
> 30 |     await expect(page.getByText(/inválida/i)).toBeVisible({ timeout: 5000 })
     |                                               ^ Error: expect(locator).toBeVisible() failed
  31 |   })
  32 | 
  33 |   test("should accept valid YouTube URL and redirect", async ({ page }) => {
  34 |     const urlInput = page.getByRole("textbox", { name: /url do youtube/i })
  35 |     const analyzeButton = page.getByRole("button", { name: /analisar/i })
  36 | 
  37 |     // Enter valid YouTube URL
  38 |     await urlInput.fill("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
  39 |     await analyzeButton.click()
  40 | 
  41 |     // Should redirect to /analisar page
  42 |     await expect(page).toHaveURL(/\/analisar\?url=/, { timeout: 10000 })
  43 |   })
  44 | 
  45 |   test("should have accessible navigation", async ({ page }) => {
  46 |     // Check footer links
  47 |     await expect(page.getByRole("link", { name: /termos/i }).first()).toBeVisible()
  48 |     await expect(page.getByRole("link", { name: /privacidade/i }).first()).toBeVisible()
  49 |   })
  50 | 
  51 |   test("should be mobile responsive", async ({ page }) => {
  52 |     // Set mobile viewport
  53 |     await page.setViewportSize({ width: 375, height: 667 })
  54 |     
  55 |     // Check that main elements are still visible
  56 |     await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
  57 |     await expect(page.getByRole("textbox", { name: /url do youtube/i })).toBeVisible()
  58 |   })
  59 | })
  60 | 
```