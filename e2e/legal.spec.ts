import { test, expect } from "@playwright/test"

test.describe("Legal Pages", () => {
  test("should display Terms of Service page", async ({ page }) => {
    await page.goto("/termos")

    // Check page title
    await expect(page.getByRole("heading", { name: /termos/i })).toBeVisible()
    
    // Check for key sections
    await expect(page.getByText(/serviço|uso|aceitação/i)).toBeVisible()
    
    // Check back link
    await expect(page.getByRole("link", { name: /voltar|início/i })).toBeVisible()
  })

  test("should display Privacy Policy page", async ({ page }) => {
    await page.goto("/privacidade")

    // Check page title
    await expect(page.getByRole("heading", { name: /privacidade|política/i })).toBeVisible()
    
    // Check for key sections
    await expect(page.getByText(/dados|informações|coleta/i)).toBeVisible()
    
    // Check back link
    await expect(page.getByRole("link", { name: /voltar|início/i })).toBeVisible()
  })

  test("should navigate from homepage to terms", async ({ page }) => {
    await page.goto("/")
    
    // Click terms link in footer
    await page.getByRole("link", { name: /termos/i }).click()
    
    // Should be on terms page
    await expect(page).toHaveURL("/termos")
    await expect(page.getByRole("heading", { name: /termos/i })).toBeVisible()
  })

  test("should navigate from homepage to privacy", async ({ page }) => {
    await page.goto("/")
    
    // Click privacy link in footer
    await page.getByRole("link", { name: /privacidade/i }).click()
    
    // Should be on privacy page
    await expect(page).toHaveURL("/privacidade")
    await expect(page.getByRole("heading", { name: /privacidade|política/i })).toBeVisible()
  })
})
