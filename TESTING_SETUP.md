# Testing Setup & Configuration

**Complete testing infrastructure for CourseFlow platform**

---

## Table of Contents
1. [Jest Configuration](#jest-configuration)
2. [React Testing Library](#react-testing-library)
3. [Playwright E2E Tests](#playwright-e2e-tests)
4. [Test Utilities](#test-utilities)
5. [CI/CD Pipeline](#cicd-pipeline)

---

## Jest Configuration

### Install Dependencies

```bash
npm install -D jest @testing-library/react @testing-library/jest-dom \
  @testing-library/user-event jest-environment-jsdom \
  @types/jest ts-jest
```

### jest.config.js

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Test environment
  testEnvironment: 'jest-environment-jsdom',

  // Module paths
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/app/(.*)$': '<rootDir>/app/$1',
  },

  // Coverage
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!**/jest.config.js',
  ],

  coverageThresholds: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // Test match patterns
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],

  // Transform files
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react',
      },
    }],
  },

  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/e2e/',
  ],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
```

### jest.setup.js

```javascript
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'
process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123'

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}
```

---

## React Testing Library

### Component Testing Example

```typescript
// components/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies variant styles', () => {
    const { container } = render(<Button variant="destructive">Delete</Button>)
    expect(container.firstChild).toHaveClass('bg-destructive')
  })

  it('disables button when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByText('Disabled')).toBeDisabled()
  })
})
```

### Form Testing Example

```typescript
// app/(auth)/login/__tests__/LoginForm.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '../LoginForm'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
    }
  },
}))

// Mock auth functions
jest.mock('@/lib/auth', () => ({
  login: jest.fn(),
}))

describe('LoginForm', () => {
  it('renders login form', () => {
    render(<LoginForm />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
  })

  it('validates email format', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'invalid-email')
    await user.tab()

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
    })
  })

  it('submits form with valid credentials', async () => {
    const user = userEvent.setup()
    const { login } = require('@/lib/auth')
    login.mockResolvedValue({ success: true })

    render(<LoginForm />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'Password123')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith('test@example.com', 'Password123')
    })
  })

  it('displays error message on failed login', async () => {
    const user = userEvent.setup()
    const { login } = require('@/lib/auth')
    login.mockRejectedValue(new Error('Invalid credentials'))

    render(<LoginForm />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'wrong')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })
  })
})
```

### Hook Testing Example

```typescript
// lib/hooks/__tests__/useAuth.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { useAuth } from '@/lib/hooks/useAuth'

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
  },
}))

describe('useAuth Hook', () => {
  it('returns null user initially', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.user).toBeNull()
  })

  it('loads user from supabase', async () => {
    const { supabase } = require('@/lib/supabase')
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: '123', email: 'test@example.com' } },
    })

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.user).toEqual({
        id: '123',
        email: 'test@example.com',
      })
    })
  })
})
```

---

## Playwright E2E Tests

### Install Playwright

```bash
npm install -D @playwright/test
npx playwright install
```

### playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: [
    ['html'],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],

  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: 'http://localhost:3000',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile viewports
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Run your local dev server before starting the tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### E2E Test Examples

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('user can register', async ({ page }) => {
    await page.goto('/register')

    // Fill registration form
    await page.fill('input[name="email"]', 'newuser@example.com')
    await page.fill('input[name="password"]', 'SecurePass123!')
    await page.fill('input[name="confirmPassword"]', 'SecurePass123!')

    // Submit form
    await page.click('button[type="submit"]')

    // Wait for redirect to dashboard
    await expect(page).toHaveURL('/dashboard')

    // Verify welcome message
    await expect(page.locator('text=Welcome')).toBeVisible()
  })

  test('user can login', async ({ page }) => {
    await page.goto('/login')

    // Fill login form
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'Password123')

    // Submit form
    await page.click('button[type="submit"]')

    // Wait for redirect
    await expect(page).toHaveURL('/dashboard')
  })

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login')

    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    // Verify error message
    await expect(page.locator('text=/invalid.*credentials/i')).toBeVisible()
  })
})
```

```typescript
// e2e/course-enrollment.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Course Enrollment', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login')
    await page.fill('input[name="email"]', 'student@example.com')
    await page.fill('input[name="password"]', 'Password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test('user can browse courses', async ({ page }) => {
    await page.goto('/courses')

    // Wait for courses to load
    await expect(page.locator('[data-testid="course-card"]').first()).toBeVisible()

    // Verify course cards
    const courseCards = page.locator('[data-testid="course-card"]')
    await expect(courseCards).toHaveCount(await courseCards.count())
  })

  test('user can enroll in a course', async ({ page }) => {
    await page.goto('/courses')

    // Click first course
    await page.locator('[data-testid="course-card"]').first().click()

    // Click enroll button
    await page.click('button:has-text("Enroll Now")')

    // Fill payment information
    const stripeFrame = page.frameLocator('iframe[name*="stripe"]')
    await stripeFrame.locator('input[name="cardnumber"]').fill('4242424242424242')
    await stripeFrame.locator('input[name="exp-date"]').fill('12/25')
    await stripeFrame.locator('input[name="cvc"]').fill('123')
    await stripeFrame.locator('input[name="postal"]').fill('12345')

    // Submit payment
    await page.click('button:has-text("Complete Enrollment")')

    // Verify success
    await expect(page.locator('text=/enrolled.*successfully/i')).toBeVisible()

    // Should redirect to course
    await expect(page).toHaveURL(/\/courses\/[^/]+\/lessons/)
  })
})
```

```typescript
// e2e/video-player.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Video Player', () => {
  test.beforeEach(async ({ page }) => {
    // Login and navigate to a lesson
    await page.goto('/login')
    await page.fill('input[name="email"]', 'student@example.com')
    await page.fill('input[name="password"]', 'Password123')
    await page.click('button[type="submit"]')

    // Navigate to first lesson
    await page.goto('/courses/test-course-id/lessons/lesson-1')
  })

  test('video player loads and plays', async ({ page }) => {
    // Wait for video element
    const video = page.locator('video')
    await expect(video).toBeVisible()

    // Click play button
    await page.click('[data-testid="play-button"]')

    // Wait a bit for video to play
    await page.waitForTimeout(2000)

    // Verify video is playing
    const isPaused = await video.evaluate((v: HTMLVideoElement) => v.paused)
    expect(isPaused).toBe(false)
  })

  test('progress is saved automatically', async ({ page }) => {
    const video = page.locator('video')

    // Play video for a few seconds
    await page.click('[data-testid="play-button"]')
    await page.waitForTimeout(5000)

    // Verify progress save request was made
    const saveRequest = page.waitForRequest(req =>
      req.url().includes('/api/progress/save') && req.method() === 'POST'
    )

    // Wait for auto-save (30 seconds in implementation)
    await expect(saveRequest).resolves.toBeTruthy()
  })

  test('can toggle fullscreen', async ({ page }) => {
    await page.click('[data-testid="fullscreen-button"]')

    // Verify fullscreen
    const isFullscreen = await page.evaluate(() => !!document.fullscreenElement)
    expect(isFullscreen).toBe(true)
  })
})
```

---

## Test Utilities

### Test Helpers

```typescript
// lib/test-utils/index.tsx
import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }
```

### Mock Data Factories

```typescript
// lib/test-utils/factories.ts
import { faker } from '@faker-js/faker'

export const mockUser = (overrides = {}) => ({
  id: faker.string.uuid(),
  email: faker.internet.email(),
  role: 'student' as const,
  createdAt: faker.date.past().toISOString(),
  ...overrides,
})

export const mockCourse = (overrides = {}) => ({
  id: faker.string.uuid(),
  title: faker.lorem.words(3),
  description: faker.lorem.paragraph(),
  price: faker.number.int({ min: 1000, max: 50000 }), // in cents
  instructorId: faker.string.uuid(),
  status: 'published' as const,
  createdAt: faker.date.past().toISOString(),
  ...overrides,
})

export const mockLesson = (overrides = {}) => ({
  id: faker.string.uuid(),
  courseId: faker.string.uuid(),
  title: faker.lorem.words(4),
  content: faker.lorem.paragraphs(3),
  videoUrl: faker.internet.url(),
  duration: faker.number.int({ min: 300, max: 3600 }),
  order: faker.number.int({ min: 0, max: 20 }),
  ...overrides,
})

export const mockProgress = (overrides = {}) => ({
  id: faker.string.uuid(),
  userId: faker.string.uuid(),
  lessonId: faker.string.uuid(),
  completed: false,
  timeWatched: faker.number.int({ min: 0, max: 3600 }),
  lastPosition: faker.number.int({ min: 0, max: 3600 }),
  updatedAt: faker.date.recent().toISOString(),
  ...overrides,
})
```

### API Mocking with MSW

```bash
npm install -D msw
```

```typescript
// lib/test-utils/mocks/handlers.ts
import { http, HttpResponse } from 'msw'
import { mockUser, mockCourse } from '../factories'

export const handlers = [
  // Auth handlers
  http.post('/api/auth/login', async ({ request }) => {
    const { email, password } = await request.json()

    if (email === 'test@example.com' && password === 'Password123') {
      return HttpResponse.json({
        session: { access_token: 'mock-token' },
        user: mockUser({ email }),
      })
    }

    return HttpResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    )
  }),

  // Courses handlers
  http.get('/api/courses', () => {
    return HttpResponse.json({
      courses: [
        mockCourse(),
        mockCourse(),
        mockCourse(),
      ],
    })
  }),

  http.get('/api/courses/:id', ({ params }) => {
    return HttpResponse.json({
      course: mockCourse({ id: params.id }),
    })
  }),

  // Progress handlers
  http.post('/api/progress/save', async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({ success: true })
  }),
]
```

```typescript
// lib/test-utils/mocks/server.ts
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
```

```typescript
// jest.setup.js (add to existing file)
import { server } from './lib/test-utils/mocks/server'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  unit-tests:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run type check
        run: npm run type-check

      - name: Run unit tests
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          files: ./coverage/coverage-final.json
          flags: unittests

  e2e-tests:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps

      - name: Run database migrations
        run: npm run db:migrate
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test

      - name: Build application
        run: npm run build

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test

      - name: Upload Playwright Report
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",

    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",

    "db:generate": "drizzle-kit generate:pg",
    "db:migrate": "drizzle-kit push:pg",
    "db:studio": "drizzle-kit studio"
  }
}
```

---

## Test Coverage Goals

### Coverage Targets

- **Unit Tests**: 80% coverage
- **Integration Tests**: Key user flows covered
- **E2E Tests**: Critical paths covered

### What to Test

**High Priority:**
- Authentication flow
- Payment processing
- Video playback
- Progress saving
- Course enrollment

**Medium Priority:**
- Form validation
- Error handling
- Navigation
- Data fetching

**Low Priority:**
- UI animations
- Styling
- Non-critical features

---

## Running Tests

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests in UI mode
npm run test:e2e:ui

# Debug E2E tests
npm run test:e2e:debug
```

---

**Last Updated:** November 19, 2025
