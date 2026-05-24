import { test, expect } from "@playwright/test"

test.describe("Legal Pages", () => {
  test("should display Terms of Service page", async ({ page }) => {
    await page.goto("/termos")

    // Check page title
    await expect(page.getByRole("heading", { name: /termos/i }).first()).toBeVisible()
    
    // Check for key sections
    await expect(page.getByText(/serviço|uso|aceitação/i).first()).toBeVisible()
    
    // Check back link
    await expect(page.getByRole("link", { name: /voltar|início/i }).first()).toBeVisible()
  })

  test("should display Privacy Policy page", async ({ page }) => {
    await page.goto("/privacidade")

    // Check page title
    await expect(page.getByRole("heading", { name: /privacidade|política/i }).first()).toBeVisible()
    
    // Check for key sections
    await expect(page.getByText(/dados|informações|coleta/i).first()).toBeVisible()
    
    // Check back link
    await expect(page.getByRole("link", { name: /voltar|início/i }).first()).toBeVisible()
  })

  test("should navigate from homepage to terms", async ({ page }) => {
    await page.goto("/")
    
    // Click terms link in footer
    await page.getByRole("link", { name: /termos/i }).first().click()
    
    // Should be on terms page
    await expect(page).toHaveURL("/termos")
    await expect(page.getByRole("heading", { name: /termos/i }).first()).toBeVisible()
  })

  test("should navigate from homepage to privacy", async ({ page }) => {
    await page.goto("/")
    
    // Click privacy link in footer
    await page.getByRole("link", { name: /privacidade/i }).first().click()
    
    // Should be on privacy page
    await expect(page).toHaveURL("/privacidade")
    await expect(page.getByRole("heading", { name: /privacidade|política/i }).first()).toBeVisible()
  })
})
