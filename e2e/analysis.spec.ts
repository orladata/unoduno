import { test, expect } from "@playwright/test"

test.describe("Analysis Page", () => {
  const validYouTubeUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  
  test("should display loading state when starting analysis", async ({ page }) => {
    // Navigate directly to analysis page with URL param
    await page.goto(`/analisar?url=${encodeURIComponent(validYouTubeUrl)}`)

    // Should show progress indicators
    await expect(page.getByText(/analisando|processando|extraindo/i)).toBeVisible({ timeout: 10000 })
  })

  test("should show error state for invalid URL parameter", async ({ page }) => {
    // Navigate with invalid URL
    await page.goto("/analisar?url=invalid-url")

    // Should show error message
    await expect(page.getByText(/inválid|erro/i)).toBeVisible({ timeout: 5000 })
  })

  test("should show error state for missing URL parameter", async ({ page }) => {
    // Navigate without URL param
    await page.goto("/analisar")

    // Should show error or redirect
    await expect(page.getByText(/url.*necessári|inválid|erro/i)).toBeVisible({ timeout: 5000 })
  })

  test("should have back to home link", async ({ page }) => {
    await page.goto(`/analisar?url=${encodeURIComponent(validYouTubeUrl)}`)

    // Check for navigation back to home
    const homeLink = page.getByRole("link", { name: /unoduno|início|voltar/i })
    await expect(homeLink).toBeVisible({ timeout: 5000 })
  })

  test("should display video metadata", async ({ page }) => {
    await page.goto(`/analisar?url=${encodeURIComponent(validYouTubeUrl)}`)

    // Should show video ID or URL reference
    await expect(page.getByText(/dQw4w9WgXcQ|youtube/i)).toBeVisible({ timeout: 10000 })
  })
})
