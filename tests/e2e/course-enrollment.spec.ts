import { test, expect } from '@playwright/test'

test.describe('Course Enrollment', () => {
  test.beforeEach(async ({ page, context }) => {
    // Set authentication cookie
    await context.addCookies([{
      name: 'next-auth.session-token',
      value: 'mock-student-session',
      domain: 'localhost',
      path: '/',
    }])
  })

  test('should display course catalog', async ({ page }) => {
    await page.goto('/courses')

    // Should see course cards
    await expect(page.locator('[data-testid="course-card"]').first()).toBeVisible()

    // Should see course titles
    await expect(page.locator('h3').first()).toBeVisible()
  })

  test('should view course details', async ({ page }) => {
    await page.goto('/courses')

    // Click on first course
    await page.locator('[data-testid="course-card"]').first().click()

    // Should navigate to course detail page
    await expect(page).toHaveURL(/\/courses\/.*/)

    // Should see course information
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('[data-testid="course-description"]')).toBeVisible()
    await expect(page.locator('[data-testid="course-curriculum"]')).toBeVisible()
  })

  test('should enroll in a free course', async ({ page }) => {
    await page.goto('/courses/test-free-course')

    // Click enroll button
    await page.click('button:has-text("Enroll Now")')

    // Should see success message
    await expect(page.locator('text=Successfully enrolled')).toBeVisible()

    // Should navigate to first lesson
    await expect(page).toHaveURL(/\/courses\/.*\/lessons\/.*/)
  })

  test('should redirect to payment for paid course', async ({ page }) => {
    await page.goto('/courses/test-paid-course')

    // Click enroll button
    await page.click('button:has-text("Enroll Now")')

    // Should redirect to Stripe checkout
    // In real tests, you would mock Stripe
    await page.waitForURL(/checkout\.stripe\.com/)
  })

  test('should track lesson progress', async ({ page }) => {
    await page.goto('/courses/test-course/lessons/test-lesson')

    // Wait for video player to load
    await page.waitForSelector('[data-testid="video-player"]')

    // Play video
    await page.click('[data-testid="video-play-button"]')

    // Wait for progress update (you would mock this in real tests)
    await page.waitForTimeout(2000)

    // Mark as complete
    await page.click('button:has-text("Mark as Complete")')

    // Should see completion message
    await expect(page.locator('text=Lesson completed')).toBeVisible()

    // Progress bar should update
    const progress = await page.locator('[data-testid="course-progress"]').getAttribute('aria-valuenow')
    expect(Number(progress)).toBeGreaterThan(0)
  })

  test('should take and submit quiz', async ({ page }) => {
    await page.goto('/courses/test-course/lessons/test-lesson/quiz')

    // Answer questions
    await page.click('[data-testid="answer-option-0"]')
    await page.click('button:has-text("Next")')

    await page.click('[data-testid="answer-option-1"]')
    await page.click('button:has-text("Next")')

    // Submit quiz
    await page.click('button:has-text("Submit Quiz")')

    // Should see results
    await expect(page.locator('[data-testid="quiz-score"]')).toBeVisible()
    await expect(page.locator('text=/Score:.*%/')).toBeVisible()

    // Should earn XP
    await expect(page.locator('text=/\\+\\d+ XP/')).toBeVisible()
  })

  test('should search and filter courses', async ({ page }) => {
    await page.goto('/courses')

    // Enter search query
    await page.fill('[data-testid="search-input"]', 'React')

    // Results should update
    await expect(page.locator('[data-testid="course-card"]').first()).toContainText('React')

    // Filter by category
    await page.selectOption('[data-testid="category-filter"]', 'web-development')

    // Results should be filtered
    await page.waitForSelector('[data-testid="course-card"]')
    const count = await page.locator('[data-testid="course-card"]').count()
    expect(count).toBeGreaterThan(0)
  })
})
