/**
 * Test Utilities and Helper Functions
 * Reusable utilities for testing across the application
 */

import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'

/**
 * Custom render function that wraps components with providers
 * Use this instead of @testing-library/react's render
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      // Add providers here as needed (Theme, Auth, etc.)
      <>{children}</>
    )
  }

  return render(ui, { wrapper: Wrapper, ...options })
}

/**
 * Wait for async operations to complete
 * Useful for API calls, animations, etc.
 */
export const waitFor = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Mock session data for authenticated tests
 */
export const mockSession = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    role: 'student' as const,
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
}

/**
 * Mock instructor session
 */
export const mockInstructorSession = {
  user: {
    id: 'test-instructor-id',
    email: 'instructor@example.com',
    name: 'Test Instructor',
    role: 'instructor' as const,
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
}

/**
 * Create a mock course for testing
 */
export function createMockCourse(overrides = {}) {
  return {
    id: 'test-course-id',
    title: 'Test Course',
    description: 'This is a test course description',
    thumbnail_url: 'https://example.com/thumbnail.jpg',
    price: 9900,
    category: 'web-development',
    is_published: true,
    instructor_id: 'test-instructor-id',
    created_at: new Date('2025-01-01'),
    updated_at: new Date('2025-01-01'),
    ...overrides,
  }
}

/**
 * Create a mock lesson for testing
 */
export function createMockLesson(overrides = {}) {
  return {
    id: 'test-lesson-id',
    course_id: 'test-course-id',
    title: 'Test Lesson',
    content: '<h1>Test Content</h1>',
    video_url: 'https://example.com/video.m3u8',
    duration: 600,
    order: 1,
    is_free_preview: false,
    created_at: new Date('2025-01-01'),
    ...overrides,
  }
}

/**
 * Create mock enrollment data
 */
export function createMockEnrollment(overrides = {}) {
  return {
    id: 'test-enrollment-id',
    student_id: 'test-student-id',
    course_id: 'test-course-id',
    enrolled_at: new Date('2025-01-01'),
    completed_at: null,
    progress: 0,
    ...overrides,
  }
}

/**
 * Create mock quiz data
 */
export function createMockQuiz(overrides = {}) {
  return {
    id: 'test-quiz-id',
    lesson_id: 'test-lesson-id',
    title: 'Test Quiz',
    time_limit: 600,
    passing_score: 70,
    questions: [
      {
        id: 'q1',
        type: 'multiple_choice',
        question: 'What is 2 + 2?',
        options: ['3', '4', '5', '6'],
        correct_answer: '4',
        explanation: 'Basic arithmetic',
        points: 1,
      },
    ],
    created_at: new Date('2025-01-01'),
    ...overrides,
  }
}

/**
 * Mock fetch responses
 */
export function mockFetch(data: any, ok = true) {
  return jest.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 400,
    json: async () => data,
  })
}

/**
 * Mock API error response
 */
export function mockApiError(message: string, status = 400) {
  return jest.fn().mockRejectedValue({
    response: {
      status,
      data: { error: message },
    },
  })
}

/**
 * Create mock user data
 */
export function createMockUser(overrides = {}) {
  return {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    role: 'student' as const,
    avatar_url: 'https://example.com/avatar.jpg',
    bio: 'Test user bio',
    created_at: new Date('2025-01-01'),
    updated_at: new Date('2025-01-01'),
    ...overrides,
  }
}

/**
 * Generate mock XP transaction
 */
export function createMockXPTransaction(overrides = {}) {
  return {
    id: 'test-xp-id',
    user_id: 'test-user-id',
    amount: 50,
    action: 'COMPLETE_LESSON' as const,
    metadata: {},
    created_at: new Date('2025-01-01'),
    ...overrides,
  }
}

/**
 * Generate mock badge
 */
export function createMockBadge(overrides = {}) {
  return {
    id: 'test-badge-id',
    user_id: 'test-user-id',
    badge_id: 'first_lesson',
    unlocked_at: new Date('2025-01-01'),
    ...overrides,
  }
}

/**
 * Suppress console errors during tests
 * Useful when testing error states
 */
export function suppressConsoleError(callback: () => void) {
  const originalError = console.error
  console.error = jest.fn()

  try {
    callback()
  } finally {
    console.error = originalError
  }
}

/**
 * Mock IntersectionObserver for components that use it
 */
export function mockIntersectionObserver() {
  global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    takeRecords() {
      return []
    }
    unobserve() {}
  } as any
}

/**
 * Mock window.matchMedia for responsive design tests
 */
export function mockMatchMedia(matches = false) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })
}
