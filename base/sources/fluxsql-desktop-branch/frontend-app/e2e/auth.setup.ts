import { test as setup } from '@playwright/test'
import path from 'path'
import fs from 'fs'

const EMAIL = process.env.TEST_USER_EMAIL ?? 'test@dbcanvas.dev'
const PASS  = process.env.TEST_USER_PASS  ?? 'TestPass123!'

const AUTH_DIR = path.join(__dirname, '../.playwright')
const AUTH_FILE = path.join(AUTH_DIR, 'auth.json')

setup('authenticate', async ({ page }) => {
  // Ensure .playwright directory exists
  if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true })
  }

  await page.goto('/login')
  await page.fill('input[type="email"]', EMAIL)
  await page.fill('input[type="password"]', PASS)
  await page.click('button[type="submit"]')
  await page.waitForURL('/dashboard', { timeout: 10_000 })

  await page.context().storageState({ path: AUTH_FILE })
})
