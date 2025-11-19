import { faker } from '@faker-js/faker'

export const mockUser = (overrides = {}) => ({
  id: faker.string.uuid(),
  email: faker.internet.email(),
  role: 'student' as const,
  stripeCustomerId: null,
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  ...overrides,
})

export const mockCourse = (overrides = {}) => ({
  id: faker.string.uuid(),
  instructorId: faker.string.uuid(),
  title: faker.lorem.words(3),
  description: faker.lorem.paragraph(),
  price: faker.number.int({ min: 1000, max: 50000 }), // in cents
  category: faker.helpers.arrayElement(['programming', 'design', 'business', 'marketing']),
  tags: faker.helpers.arrayElements(['javascript', 'react', 'nextjs', 'typescript'], 2),
  status: 'published' as const,
  thumbnailUrl: faker.image.url(),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  ...overrides,
})

export const mockLesson = (overrides = {}) => ({
  id: faker.string.uuid(),
  courseId: faker.string.uuid(),
  title: faker.lorem.words(4),
  content: faker.lorem.paragraphs(3),
  videoUrl: faker.internet.url(),
  thumbnailUrl: faker.image.url(),
  duration: faker.number.int({ min: 300, max: 3600 }), // 5-60 minutes
  order: faker.number.int({ min: 0, max: 20 }),
  quiz: null,
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  ...overrides,
})

export const mockEnrollment = (overrides = {}) => ({
  id: faker.string.uuid(),
  userId: faker.string.uuid(),
  courseId: faker.string.uuid(),
  status: 'active' as const,
  enrolledAt: faker.date.past(),
  completedAt: null,
  ...overrides,
})

export const mockProgress = (overrides = {}) => ({
  id: faker.string.uuid(),
  userId: faker.string.uuid(),
  lessonId: faker.string.uuid(),
  completed: false,
  timeWatched: faker.number.int({ min: 0, max: 3600 }),
  lastPosition: faker.number.int({ min: 0, max: 3600 }),
  updatedAt: faker.date.recent(),
  ...overrides,
})

export const mockGamification = (overrides = {}) => ({
  id: faker.string.uuid(),
  userId: faker.string.uuid(),
  xp: faker.number.int({ min: 0, max: 10000 }),
  level: faker.number.int({ min: 1, max: 50 }),
  streakDays: faker.number.int({ min: 0, max: 365 }),
  lastActive: faker.date.recent(),
  badges: [],
  ...overrides,
})
