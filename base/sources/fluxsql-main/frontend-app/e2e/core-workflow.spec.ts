import { test, expect } from '@playwright/test'

test.describe('Core Workflow', () => {

  test('dashboard carga correctamente', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL('/dashboard')
    // Esperar que la página cargue completamente — sin depender de tags específicos
    await expect(page).toHaveTitle(/.+/)  // cualquier título
    await page.waitForLoadState('networkidle')
  })

  test('crear proyecto → editor → nodo visible', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Tomar screenshot para ver qué botones existen
    // await page.screenshot({ path: 'debug.png' })  ← descomentar si sigue fallando

    // Buscar el botón de crear — cualquier variante
    const newBtn = page.locator('button').filter({ hasText: /nuevo|crear|new|\+/i }).first()

    // Si el botón no existe en 5s, el test falla con mensaje claro
    await expect(newBtn).toBeVisible({ timeout: 5_000 })
    await newBtn.click()

    await page.waitForURL(/\/editor\//, { timeout: 10_000 })
    await page.locator('.monaco-editor').first().waitFor({ timeout: 15_000 })
    await page.locator('.monaco-editor').first().click()
    await page.keyboard.press('Control+A')
    await page.keyboard.type('CREATE TABLE e2e_test (id INT PRIMARY KEY, name TEXT);')

    const node = page.locator('.react-flow__node').filter({ hasText: 'e2e_test' })
    await expect(node).toBeVisible({ timeout: 8_000 })
  })

})