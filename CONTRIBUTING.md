# Contributing to Course Platform

First off, thank you for considering contributing to Course Platform! It's people like you that make this platform exceptional for learners worldwide.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)
- [Common Tasks](#common-tasks)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

### Our Standards

- **Be respectful** - Treat everyone with respect and kindness
- **Be collaborative** - Work together to achieve the best outcomes
- **Be inclusive** - Welcome diverse perspectives and experiences
- **Be constructive** - Provide helpful feedback and suggestions
- **Be professional** - Maintain professionalism in all interactions

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher
- **npm** 9.x or higher (or yarn/pnpm)
- **Git** 2.x or higher
- **PostgreSQL** 14.x or higher (or Supabase account)
- **FFmpeg** 5.x or higher (for video processing)

### Fork and Clone

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:

```bash
git clone https://github.com/YOUR_USERNAME/course-platform.git
cd course-platform
```

3. **Add upstream remote**:

```bash
git remote add upstream https://github.com/original/course-platform.git
```

### Install Dependencies

```bash
npm install
```

### Set Up Environment

1. Copy the example environment file:

```bash
cp .env.example .env.local
```

2. Fill in your environment variables (see README.md for details)

3. Run database migrations:

```bash
npm run db:push
```

4. Seed the database (optional):

```bash
npm run db:seed
```

### Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Development Workflow

### 1. Create a Feature Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

**Branch naming conventions:**
- `feature/` - New features (e.g., `feature/ai-quiz-generator`)
- `fix/` - Bug fixes (e.g., `fix/video-playback-issue`)
- `docs/` - Documentation changes (e.g., `docs/api-reference`)
- `refactor/` - Code refactoring (e.g., `refactor/video-processing`)
- `test/` - Adding tests (e.g., `test/quiz-system`)
- `chore/` - Maintenance tasks (e.g., `chore/update-dependencies`)

### 2. Make Your Changes

- Write clean, readable code
- Follow the coding standards (see below)
- Add tests for new functionality
- Update documentation as needed

### 3. Test Your Changes

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Run type checking
npm run type-check

# Run tests
npm run test

# Run E2E tests
npm run test:e2e
```

### 4. Commit Your Changes

Follow our [commit message guidelines](#commit-message-guidelines):

```bash
git add .
git commit -m "feat: add AI quiz generation feature"
```

### 5. Keep Your Branch Updated

```bash
git fetch upstream
git rebase upstream/main
```

### 6. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 7. Create a Pull Request

Go to GitHub and create a pull request from your fork to the main repository.

## Coding Standards

### TypeScript

We use **TypeScript** for type safety. All code must be properly typed.

**Good:**
```typescript
interface User {
  id: string
  email: string
  name: string
}

async function getUser(userId: string): Promise<User> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId)
  })

  if (!user) {
    throw new Error('User not found')
  }

  return user
}
```

**Bad:**
```typescript
async function getUser(userId: any) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId)
  })
  return user
}
```

### React Components

**Prefer functional components with hooks:**

```typescript
'use client'

import { useState, useEffect } from 'react'

interface CourseCardProps {
  course: Course
  onEnroll?: (courseId: string) => void
}

export function CourseCard({ course, onEnroll }: CourseCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleEnroll = async () => {
    setIsLoading(true)
    try {
      await onEnroll?.(course.id)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="course-card">
      <h3>{course.title}</h3>
      <button onClick={handleEnroll} disabled={isLoading}>
        {isLoading ? 'Enrolling...' : 'Enroll Now'}
      </button>
    </div>
  )
}
```

### File Organization

- **One component per file**
- **Export component at the bottom** of the file
- **Group related imports** together
- **Use barrel exports** (index.ts) for cleaner imports

```typescript
// components/course/index.ts
export { CourseCard } from './course-card'
export { CourseList } from './course-list'
export { CourseDetail } from './course-detail'
```

### Naming Conventions

- **Components**: PascalCase (e.g., `CourseCard`, `QuizBuilder`)
- **Files**: kebab-case (e.g., `course-card.tsx`, `quiz-builder.tsx`)
- **Functions**: camelCase (e.g., `getUserById`, `calculateScore`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_FILE_SIZE`, `API_ENDPOINT`)
- **Types/Interfaces**: PascalCase (e.g., `User`, `CourseData`)

### CSS/Tailwind

Use **Tailwind CSS** utility classes:

```tsx
// Good
<div className="flex items-center gap-4 p-4 rounded-lg bg-white dark:bg-gray-800">
  <h3 className="text-lg font-semibold">{title}</h3>
</div>

// Bad - Don't create custom CSS unless absolutely necessary
<div className="custom-card">
  <h3 className="custom-title">{title}</h3>
</div>
```

**For complex shared styles**, use `@apply` in CSS:

```css
/* components/course/course-card.css */
.course-card {
  @apply rounded-lg bg-white dark:bg-gray-800 shadow-lg p-6;
  @apply hover:shadow-xl transition-shadow duration-300;
}
```

### Error Handling

Always handle errors gracefully:

```typescript
// Good
async function enrollInCourse(courseId: string) {
  try {
    const response = await fetch(`/api/courses/${courseId}/enroll`, {
      method: 'POST'
    })

    if (!response.ok) {
      throw new Error('Failed to enroll in course')
    }

    return await response.json()
  } catch (error) {
    console.error('Enrollment error:', error)
    toast.error('Failed to enroll. Please try again.')
    throw error
  }
}

// Bad
async function enrollInCourse(courseId: string) {
  const response = await fetch(`/api/courses/${courseId}/enroll`, {
    method: 'POST'
  })
  return await response.json()
}
```

### Accessibility

All components must be accessible:

```tsx
// Good
<button
  onClick={handleClick}
  aria-label="Enroll in course"
  disabled={isLoading}
>
  {isLoading ? (
    <>
      <span className="sr-only">Loading...</span>
      <Spinner />
    </>
  ) : (
    'Enroll Now'
  )}
</button>

// Bad
<div onClick={handleClick}>
  Enroll Now
</div>
```

**Key accessibility requirements:**
- Use semantic HTML (`<button>`, `<nav>`, `<main>`, etc.)
- Provide `aria-label` for icon-only buttons
- Ensure keyboard navigation works
- Maintain color contrast ratios (WCAG AA)
- Add alt text to images

## Testing Guidelines

### Unit Tests

Use **Jest** and **React Testing Library**:

```typescript
// components/course/__tests__/course-card.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { CourseCard } from '../course-card'

describe('CourseCard', () => {
  const mockCourse = {
    id: '1',
    title: 'Test Course',
    description: 'Test Description',
    price: 99
  }

  it('renders course information correctly', () => {
    render(<CourseCard course={mockCourse} />)

    expect(screen.getByText('Test Course')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
    expect(screen.getByText('$99')).toBeInTheDocument()
  })

  it('calls onEnroll when button is clicked', async () => {
    const onEnroll = jest.fn()
    render(<CourseCard course={mockCourse} onEnroll={onEnroll} />)

    const button = screen.getByRole('button', { name: /enroll/i })
    fireEvent.click(button)

    expect(onEnroll).toHaveBeenCalledWith(mockCourse.id)
  })
})
```

### Integration Tests

Test API routes and database interactions:

```typescript
// app/api/courses/__tests__/route.test.ts
import { POST } from '../route'

describe('POST /api/courses', () => {
  it('creates a new course', async () => {
    const request = new Request('http://localhost/api/courses', {
      method: 'POST',
      body: JSON.stringify({
        title: 'New Course',
        description: 'Description',
        price: 99
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.title).toBe('New Course')
  })
})
```

### E2E Tests

Use **Playwright** for end-to-end testing:

```typescript
// tests/e2e/course-enrollment.spec.ts
import { test, expect } from '@playwright/test'

test('student can enroll in a course', async ({ page }) => {
  await page.goto('/courses/test-course-id')

  await page.click('button:has-text("Enroll Now")')

  await expect(page).toHaveURL(/.*payment/)

  // Fill payment form
  await page.fill('[name="cardNumber"]', '4242424242424242')
  await page.click('button:has-text("Pay")')

  await expect(page).toHaveURL(/.*courses\/test-course-id/)
  await expect(page.locator('text=Enrolled')).toBeVisible()
})
```

## Commit Message Guidelines

We follow the **Conventional Commits** specification:

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(quiz): add AI quiz generation from lesson content

Implement OpenAI integration to automatically generate quiz questions
from lesson content. Supports multiple difficulty levels.

Closes #123

---

fix(video): resolve HLS playback issue on Safari

Safari was not properly loading HLS streams. Updated Video.js
configuration to use native HLS support on Safari.

Fixes #456

---

docs(api): add endpoint documentation for courses API

Add comprehensive documentation for all course-related endpoints
including request/response examples.
```

## Pull Request Process

### Before Submitting

1. ✅ **Tests pass**: `npm run test`
2. ✅ **Linting passes**: `npm run lint`
3. ✅ **Type checking passes**: `npm run type-check`
4. ✅ **Build succeeds**: `npm run build`
5. ✅ **Documentation updated** (if applicable)

### PR Title

Use the same format as commit messages:

```
feat(quiz): add AI quiz generation
fix(video): resolve Safari playback issue
```

### PR Description Template

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots of UI changes

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added and passing
```

### Review Process

1. **Automated checks** run (tests, linting, build)
2. **Code review** by maintainers (usually within 48 hours)
3. **Address feedback** if requested
4. **Approval** from at least one maintainer
5. **Merge** to main branch

## Project Structure

```
course-platform/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes (login, signup)
│   ├── (dashboard)/       # Student dashboard routes
│   ├── (instructor)/      # Instructor dashboard routes
│   ├── api/               # API routes
│   └── courses/           # Course viewing routes
├── components/            # React components
│   ├── ui/               # shadcn/ui base components
│   ├── course/           # Course components
│   ├── quiz/             # Quiz components
│   ├── gamification/     # XP, badges, leaderboards
│   └── ai/               # AI chat widget
├── lib/                   # Utilities and helpers
│   ├── db/               # Database utilities
│   ├── ai/               # AI helpers (RAG, quiz gen)
│   ├── video/            # Video processing
│   ├── stripe/           # Payment utilities
│   └── utils.ts          # General utilities
├── db/                    # Database
│   ├── schema/           # Drizzle schema definitions
│   └── migrations/       # SQL migrations
├── public/               # Static files
├── tests/                # Test files
│   ├── unit/            # Unit tests
│   ├── integration/     # Integration tests
│   └── e2e/             # End-to-end tests
└── docs/                 # Documentation
```

## Common Tasks

### Adding a New Component

1. Create the component file:

```bash
touch components/course/course-preview.tsx
```

2. Implement the component:

```tsx
// components/course/course-preview.tsx
interface CoursePreviewProps {
  course: Course
}

export function CoursePreview({ course }: CoursePreviewProps) {
  return (
    <div>
      {/* Implementation */}
    </div>
  )
}
```

3. Export from barrel file:

```typescript
// components/course/index.ts
export { CoursePreview } from './course-preview'
```

4. Add tests:

```bash
touch components/course/__tests__/course-preview.test.tsx
```

### Adding a New API Endpoint

1. Create the route file:

```bash
mkdir -p app/api/quizzes
touch app/api/quizzes/route.ts
```

2. Implement handlers:

```typescript
// app/api/quizzes/route.ts
import { NextRequest } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  const quizzes = await db.query.quizzes.findMany()
  return Response.json(quizzes)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const quiz = await db.insert(quizzes).values(body).returning()
  return Response.json(quiz, { status: 201 })
}
```

3. Add tests:

```bash
touch app/api/quizzes/__tests__/route.test.ts
```

### Adding a Database Table

1. Define schema:

```typescript
// db/schema/quizzes.ts
import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'

export const quizzes = pgTable('quizzes', {
  id: uuid('id').primaryKey().defaultRandom(),
  lesson_id: uuid('lesson_id').references(() => lessons.id).notNull(),
  title: text('title').notNull(),
  created_at: timestamp('created_at').notNull().defaultNow()
})
```

2. Generate migration:

```bash
npm run db:generate
```

3. Apply migration:

```bash
npm run db:push
```

### Running Database Migrations

```bash
# Generate migration from schema changes
npm run db:generate

# Apply migrations to database
npm run db:push

# View current database state
npm run db:studio
```

## Getting Help

- **Documentation**: Check the [docs/](./docs/) folder
- **Issues**: Search [existing issues](https://github.com/yourusername/course-platform/issues)
- **Discussions**: Join [GitHub Discussions](https://github.com/yourusername/course-platform/discussions)
- **Discord**: Join our [Discord community](https://discord.gg/courseplatform)

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project website (coming soon)

Thank you for contributing to Course Platform! 🎉

---

*Last Updated: November 19, 2025*
