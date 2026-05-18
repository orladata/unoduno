import { test, expect } from "@playwright/test"

test.describe("Homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test("should display the hero section with correct content", async ({ page }) => {
    // Check main heading
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
    
    // Check YouTube URL input exists
    const urlInput = page.getByPlaceholder(/cole.*youtube/i)
    await expect(urlInput).toBeVisible()
    
    // Check analyze button exists
    const analyzeButton = page.getByRole("button", { name: /analisar/i })
    await expect(analyzeButton).toBeVisible()
  })

  test("should show validation error for invalid URL", async ({ page }) => {
    const urlInput = page.getByPlaceholder(/cole.*youtube/i)
    const analyzeButton = page.getByRole("button", { name: /analisar/i })

    // Enter invalid URL
    await urlInput.fill("https://google.com")
    await analyzeButton.click()

    // Should show error message
    await expect(page.getByText(/url.*inválida/i)).toBeVisible({ timeout: 5000 })
  })

  test("should accept valid YouTube URL and redirect", async ({ page }) => {
    const urlInput = page.getByPlaceholder(/cole.*youtube/i)
    const analyzeButton = page.getByRole("button", { name: /analisar/i })

    // Enter valid YouTube URL
    await urlInput.fill("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
    await analyzeButton.click()

    // Should redirect to /analisar page
    await expect(page).toHaveURL(/\/analisar\?url=/, { timeout: 10000 })
  })

  test("should have accessible navigation", async ({ page }) => {
    // Check footer links
    await expect(page.getByRole("link", { name: /termos/i })).toBeVisible()
    await expect(page.getByRole("link", { name: /privacidade/i })).toBeVisible()
  })

  test("should be mobile responsive", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Check that main elements are still visible
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
    await expect(page.getByPlaceholder(/cole.*youtube/i)).toBeVisible()
  })
})
