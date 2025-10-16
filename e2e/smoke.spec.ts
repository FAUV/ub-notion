
import { test, expect } from '@playwright/test'

test('home renders and navigation works', async ({ page }) => {
  await page.goto('http://localhost:5173/')
  await expect(page.getByText('Estado del portafolio')).toBeVisible()
  await page.getByRole('link', { name: 'Tareas' }).click()
  await expect(page.getByRole('heading', { name: 'Tareas' })).toBeVisible()
})
