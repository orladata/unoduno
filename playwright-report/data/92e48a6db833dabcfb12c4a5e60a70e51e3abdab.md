# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: analysis.spec.ts >> Analysis Page >> should display loading state when starting analysis
- Location: e2e\analysis.spec.ts:6:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/analisando|processando|extraindo/i)
Expected: visible
Error: strict mode violation: getByText(/analisando|processando|extraindo/i) resolved to 2 elements:
    1) <span class="text-xs font-medium">Extraindo transcrição do vídeo</span> aka getByText('Extraindo transcrição do vídeo')
    2) <span class="text-xs font-medium">Analisando padrões virais</span> aka getByText('Analisando padrões virais')

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByText(/analisando|processando|extraindo/i)

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - link "Voltar à página inicial" [ref=e4] [cursor=pointer]:
        - /url: /
        - img [ref=e5]
        - text: Voltar
      - generic "Unoduno" [ref=e7]
      - status "Geração com IA ativa" [ref=e8]: IA ativa
    - main [ref=e10]:
      - status "Gerando roteiro" [ref=e11]:
        - img [ref=e15]
        - generic [ref=e24]:
          - heading "Gerando roteiro adaptado..." [level=2] [ref=e25]
          - paragraph [ref=e28]: Escrevendo seu roteiro (0s)
        - list "Etapas do processo" [ref=e30]:
          - listitem [ref=e31]:
            - img [ref=e33]
            - generic [ref=e35]: Extraindo transcrição do vídeo
          - listitem [ref=e36]:
            - img [ref=e38]
            - generic [ref=e40]: Analisando padrões virais
          - listitem [ref=e41]:
            - img [ref=e43]
            - generic [ref=e52]: Adaptando para o mercado BR
          - listitem [ref=e53]:
            - generic [ref=e55]: Roteiro pronto
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e61] [cursor=pointer]:
    - img [ref=e62]
  - alert [ref=e65]
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test"
  2  | 
  3  | test.describe("Analysis Page", () => {
  4  |   const validYouTubeUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  5  |   
  6  |   test("should display loading state when starting analysis", async ({ page }) => {
  7  |     // Navigate directly to analysis page with URL param
  8  |     await page.goto(`/analisar?url=${encodeURIComponent(validYouTubeUrl)}`)
  9  | 
  10 |     // Should show progress indicators
> 11 |     await expect(page.getByText(/analisando|processando|extraindo/i)).toBeVisible({ timeout: 10000 })
     |                                                                       ^ Error: expect(locator).toBeVisible() failed
  12 |   })
  13 | 
  14 |   test("should show error state for invalid URL parameter", async ({ page }) => {
  15 |     // Navigate with invalid URL
  16 |     await page.goto("/analisar?url=invalid-url")
  17 | 
  18 |     // Should show error message
  19 |     await expect(page.getByText(/inválid|erro/i)).toBeVisible({ timeout: 5000 })
  20 |   })
  21 | 
  22 |   test("should show error state for missing URL parameter", async ({ page }) => {
  23 |     // Navigate without URL param
  24 |     await page.goto("/analisar")
  25 | 
  26 |     // Should show error or redirect
  27 |     await expect(page.getByText(/url.*necessári|inválid|erro/i)).toBeVisible({ timeout: 5000 })
  28 |   })
  29 | 
  30 |   test("should have back to home link", async ({ page }) => {
  31 |     await page.goto(`/analisar?url=${encodeURIComponent(validYouTubeUrl)}`)
  32 | 
  33 |     // Check for navigation back to home
  34 |     const homeLink = page.getByRole("link", { name: /unoduno|início|voltar/i })
  35 |     await expect(homeLink).toBeVisible({ timeout: 5000 })
  36 |   })
  37 | 
  38 |   test("should display video metadata", async ({ page }) => {
  39 |     await page.goto(`/analisar?url=${encodeURIComponent(validYouTubeUrl)}`)
  40 | 
  41 |     // Should show video ID or URL reference
  42 |     await expect(page.getByText(/dQw4w9WgXcQ|youtube/i)).toBeVisible({ timeout: 10000 })
  43 |   })
  44 | })
  45 | 
```