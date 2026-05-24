# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: analysis.spec.ts >> Analysis Page >> should display video metadata
- Location: e2e\analysis.spec.ts:38:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/dQw4w9WgXcQ|youtube/i)
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByText(/dQw4w9WgXcQ|youtube/i)

```

```yaml
- banner:
  - link "Voltar à página inicial":
    - /url: /
    - text: Voltar
  - text: Unoduno
  - status "Geração com IA ativa": IA ativa
- main:
  - alert:
    - paragraph: Erro ao processar vídeo
    - paragraph: Não autorizado. Por favor, faça login.
    - button "Tentar novamente"
- region "Notifications alt+T"
- alert
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
> 42 |     await expect(page.getByText(/dQw4w9WgXcQ|youtube/i)).toBeVisible({ timeout: 10000 })
     |                                                          ^ Error: expect(locator).toBeVisible() failed
  43 |   })
  44 | })
  45 | 
```