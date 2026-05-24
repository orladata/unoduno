# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: analysis.spec.ts >> Analysis Page >> should show error state for invalid URL parameter
- Location: e2e\analysis.spec.ts:14:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/inválid|erro/i)
Expected: visible
Error: strict mode violation: getByText(/inválid|erro/i) resolved to 2 elements:
    1) <p class="text-sm font-semibold text-white">URL inválida</p> aka getByText('URL inválida', { exact: true })
    2) <p class="text-sm">URL inválida — use um link válido do YouTube</p> aka getByText('URL inválida — use um link vá')

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText(/inválid|erro/i)

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - link "Voltar à página inicial" [ref=e4]:
        - /url: /
        - img [ref=e5]
        - text: Voltar
      - generic "Unoduno" [ref=e7]
      - status "Geração com IA ativa" [ref=e8]: IA ativa
    - main [ref=e10]:
      - alert [ref=e11]:
        - paragraph [ref=e12]: URL inválida
        - paragraph [ref=e13]: URL inválida — use um link válido do YouTube
        - link "Voltar e tentar novamente" [ref=e14]:
          - /url: /
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e20] [cursor=pointer]:
    - img [ref=e21]
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
  11 |     await expect(page.getByText(/analisando|processando|extraindo/i)).toBeVisible({ timeout: 10000 })
  12 |   })
  13 | 
  14 |   test("should show error state for invalid URL parameter", async ({ page }) => {
  15 |     // Navigate with invalid URL
  16 |     await page.goto("/analisar?url=invalid-url")
  17 | 
  18 |     // Should show error message
> 19 |     await expect(page.getByText(/inválid|erro/i)).toBeVisible({ timeout: 5000 })
     |                                                   ^ Error: expect(locator).toBeVisible() failed
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