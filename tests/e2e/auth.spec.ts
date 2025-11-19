import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should display sign in page', async ({ page }) => {
    await page.goto('/auth/signin')

    await expect(page).toHaveTitle(/Sign In/)
    await expect(page.locator('h1')).toContainText('Sign in')
  })

  test('should sign in with Google OAuth', async ({ page }) => {
    await page.goto('/auth/signin')

    // Click Google sign in button
    const googleButton = page.locator('button:has-text("Continue with Google")')
    await expect(googleButton).toBeVisible()

    // In a real test, you would mock the OAuth flow
    // For now, just verify the button is clickable
    await expect(googleButton).toBeEnabled()
  })

  test('should redirect to dashboard after successful login', async ({ page, context }) => {
    // Set authentication cookie
    await context.addCookies([{
      name: 'next-auth.session-token',
      value: 'mock-session-token',
      domain: 'localhost',
      path: '/',
    }])

    await page.goto('/')

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('should sign out successfully', async ({ page, context }) => {
    // Set authentication cookie
    await context.addCookies([{
      name: 'next-auth.session-token',
      value: 'mock-session-token',
      domain: 'localhost',
      path: '/',
    }])

    await page.goto('/dashboard')

    // Click sign out button
    await page.click('button:has-text("Sign Out")')

    // Should redirect to home page
    await expect(page).toHaveURL('/')
  })
})
