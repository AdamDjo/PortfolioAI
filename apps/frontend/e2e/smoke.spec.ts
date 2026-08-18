import { expect, test } from '@playwright/test'

test('homepage loads', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle('Adem — Senior Frontend Developer')
})
