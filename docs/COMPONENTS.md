# Component Library Documentation

Complete reference for all UI components in the Course Platform.

## Table of Contents

- [Design System](#design-system)
- [Base Components (shadcn/ui)](#base-components-shadcnui)
- [Course Components](#course-components)
- [Quiz Components](#quiz-components)
- [Gamification Components](#gamification-components)
- [AI Components](#ai-components)
- [Video Components](#video-components)
- [Forum Components](#forum-components)
- [Layout Components](#layout-components)
- [Animation Patterns](#animation-patterns)
- [Accessibility Guidelines](#accessibility-guidelines)

---

## Design System

### Colors

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        // Primary brand colors
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
        // Semantic colors
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      }
    }
  }
}
```

### Typography

```css
/* Font Scale */
.text-xs    { font-size: 0.75rem; }   /* 12px */
.text-sm    { font-size: 0.875rem; }  /* 14px */
.text-base  { font-size: 1rem; }      /* 16px */
.text-lg    { font-size: 1.125rem; }  /* 18px */
.text-xl    { font-size: 1.25rem; }   /* 20px */
.text-2xl   { font-size: 1.5rem; }    /* 24px */
.text-3xl   { font-size: 1.875rem; }  /* 30px */
.text-4xl   { font-size: 2.25rem; }   /* 36px */
```

### Spacing

```typescript
// Use consistent spacing scale
const spacing = {
  xs: '0.25rem',  // 4px
  sm: '0.5rem',   // 8px
  md: '1rem',     // 16px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
  '2xl': '3rem',  // 48px
}
```

---

## Base Components (shadcn/ui)

### Button

Standard button component with multiple variants.

**Import:**
```typescript
import { Button } from '@/components/ui/button'
```

**Usage:**
```tsx
// Default
<Button>Click me</Button>

// Variants
<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>

// States
<Button disabled>Disabled</Button>
<Button loading>Loading...</Button>

// With icons
<Button>
  <PlusIcon className="mr-2 h-4 w-4" />
  Add Course
</Button>
```

**Props:**
```typescript
interface ButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  disabled?: boolean
  loading?: boolean
  asChild?: boolean
  children: React.ReactNode
}
```

---

### Dialog

Modal dialog component.

**Import:**
```typescript
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
```

**Usage:**
```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Are you sure?</DialogTitle>
      <DialogDescription>
        This action cannot be undone.
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-4">
      {/* Dialog content */}
    </div>
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

### Form Components

**Input:**
```tsx
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    placeholder="you@example.com"
    required
  />
</div>
```

**Textarea:**
```tsx
import { Textarea } from '@/components/ui/textarea'

<Textarea
  placeholder="Course description..."
  rows={5}
/>
```

**Select:**
```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select category" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="web-dev">Web Development</SelectItem>
    <SelectItem value="mobile">Mobile Development</SelectItem>
    <SelectItem value="data-science">Data Science</SelectItem>
  </SelectContent>
</Select>
```

---

### Toast

Notification component.

**Import:**
```typescript
import { useToast } from '@/components/ui/use-toast'
```

**Usage:**
```tsx
function MyComponent() {
  const { toast } = useToast()

  const handleSuccess = () => {
    toast({
      title: "Success!",
      description: "Your course has been published.",
    })
  }

  const handleError = () => {
    toast({
      title: "Error",
      description: "Failed to save changes.",
      variant: "destructive",
    })
  }

  return <Button onClick={handleSuccess}>Save</Button>
}
```

---

## Course Components

### CourseCard

Displays a course in a card format with hover animations.

**Location:** `components/course/course-card.tsx`

**Usage:**
```tsx
import { CourseCard } from '@/components/course'

<CourseCard
  course={{
    id: 'course_123',
    title: 'Introduction to Web Development',
    description: 'Learn HTML, CSS, and JavaScript',
    thumbnail_url: 'https://...',
    price: 9900,
    instructor: {
      name: 'Jane Smith',
      avatar_url: 'https://...'
    },
    stats: {
      student_count: 1250,
      rating: 4.8,
      lesson_count: 42
    }
  }}
  onEnroll={(courseId) => handleEnroll(courseId)}
/>
```

**Implementation:**
```tsx
'use client'

import { motion } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { Star, Users, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CourseCardProps {
  course: {
    id: string
    title: string
    description: string
    thumbnail_url: string
    price: number
    instructor: {
      name: string
      avatar_url: string
    }
    stats: {
      student_count: number
      rating: number
      lesson_count: number
    }
  }
  onEnroll?: (courseId: string) => void
}

export function CourseCard({ course, onEnroll }: CourseCardProps) {
  return (
    <Link href={`/courses/${course.id}`}>
      <motion.div
        whileHover={{ y: -8, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="group relative rounded-xl overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
      >
        {/* Thumbnail */}
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={course.thumbnail_url}
            alt={course.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          {/* Price Badge */}
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur rounded-full text-sm font-bold">
              ${(course.price / 100).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Instructor */}
          <div className="flex items-center gap-2">
            <Image
              src={course.instructor.avatar_url}
              alt={course.instructor.name}
              width={24}
              height={24}
              className="rounded-full"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {course.instructor.name}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2">
            {course.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {course.description}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{course.stats.rating}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{course.stats.student_count.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{course.stats.lesson_count} lessons</span>
            </div>
          </div>

          {/* CTA */}
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              className="w-full"
              onClick={(e) => {
                e.preventDefault()
                onEnroll?.(course.id)
              }}
            >
              Enroll Now
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </Link>
  )
}
```

---

### CourseList

Grid layout for displaying multiple courses.

**Usage:**
```tsx
import { CourseList } from '@/components/course'

<CourseList
  courses={courses}
  loading={isLoading}
  onLoadMore={() => fetchMore()}
/>
```

**Implementation:**
```tsx
export function CourseList({ courses, loading, onLoadMore }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <CourseCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      {onLoadMore && (
        <div className="flex justify-center">
          <Button onClick={onLoadMore} variant="outline">
            Load More
          </Button>
        </div>
      )}
    </div>
  )
}
```

---

### ProgressBar

Visual progress indicator for course completion.

**Usage:**
```tsx
import { ProgressBar } from '@/components/course'

<ProgressBar progress={65} showLabel />
```

**Implementation:**
```tsx
'use client'

import { motion } from 'motion/react'

interface ProgressBarProps {
  progress: number // 0-100
  showLabel?: boolean
  className?: string
}

export function ProgressBar({ progress, showLabel, className }: ProgressBarProps) {
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        {showLabel && (
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Progress
          </span>
        )}
        <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
          {progress}%
        </span>
      </div>

      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
        />
      </div>
    </div>
  )
}
```

---

## Quiz Components

### QuizBuilder

Component for instructors to create quizzes.

**Location:** `components/quiz/quiz-builder.tsx`

**Usage:**
```tsx
import { QuizBuilder } from '@/components/quiz'

<QuizBuilder
  lessonId="lesson_123"
  initialData={quiz}
  onSave={(quiz) => saveQuiz(quiz)}
/>
```

**Key Features:**
- Drag-and-drop question reordering
- Multiple question types (MCQ, True/False, Short Answer)
- Rich text editor for questions
- Image/video support in questions
- Points and difficulty assignment
- Timer configuration

---

### QuizTaker

Component for students to take quizzes.

**Usage:**
```tsx
import { QuizTaker } from '@/components/quiz'

<QuizTaker
  quiz={quiz}
  onSubmit={(answers) => submitQuiz(answers)}
  showTimer={true}
/>
```

**Implementation:**
```tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

interface QuizTakerProps {
  quiz: Quiz
  onSubmit: (answers: Record<string, string>) => Promise<void>
  showTimer?: boolean
}

export function QuizTaker({ quiz, onSubmit, showTimer }: QuizTakerProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeRemaining, setTimeRemaining] = useState(quiz.time_limit * 60)

  useEffect(() => {
    if (!showTimer || !quiz.time_limit) return

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleSubmit = async () => {
    await onSubmit(answers)
  }

  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{quiz.title}</h2>
          {showTimer && quiz.time_limit && (
            <Timer seconds={timeRemaining} />
          )}
        </div>
        <Progress value={progress} />
      </div>

      {/* Question */}
      <QuestionDisplay
        question={quiz.questions[currentQuestion]}
        value={answers[quiz.questions[currentQuestion].id]}
        onChange={(value) => setAnswers({
          ...answers,
          [quiz.questions[currentQuestion].id]: value
        })}
      />

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestion(prev => prev - 1)}
          disabled={currentQuestion === 0}
        >
          Previous
        </Button>

        {currentQuestion === quiz.questions.length - 1 ? (
          <Button onClick={handleSubmit}>
            Submit Quiz
          </Button>
        ) : (
          <Button onClick={() => setCurrentQuestion(prev => prev + 1)}>
            Next
          </Button>
        )}
      </div>
    </div>
  )
}
```

---

## Gamification Components

### XPNotification

Animated notification when user earns XP.

**Usage:**
```tsx
import { XPNotification } from '@/components/gamification'

{showXP && <XPNotification amount={50} />}
```

**Implementation:**
```tsx
'use client'

import { motion } from 'motion/react'

export function XPNotification({ amount }: { amount: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 0, scale: 0.5 }}
      animate={{
        opacity: [0, 1, 1, 0],
        y: [-50, -100],
        scale: [0.5, 1.2, 1, 0.8]
      }}
      transition={{ duration: 2 }}
      className="fixed top-20 right-4 z-50 pointer-events-none"
    >
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full shadow-lg font-bold text-lg">
        +{amount} XP
      </div>
    </motion.div>
  )
}
```

---

### BadgeUnlock

Animated badge unlock modal.

**Usage:**
```tsx
import { BadgeUnlock } from '@/components/gamification'

<BadgeUnlock
  badge={{
    id: 'first_lesson',
    name: 'Getting Started',
    description: 'Complete your first lesson',
    icon: '🎯'
  }}
  onClose={() => setShowBadge(false)}
/>
```

**Implementation:**
```tsx
'use client'

import { motion } from 'motion/react'
import { Dialog, DialogContent } from '@/components/ui/dialog'

export function BadgeUnlock({ badge, onClose }) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="text-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 20
          }}
          className="space-y-4"
        >
          <motion.div
            animate={{
              boxShadow: [
                '0 0 0 0 rgba(255, 215, 0, 0)',
                '0 0 0 20px rgba(255, 215, 0, 0)',
              ]
            }}
            transition={{ duration: 1, repeat: Infinity }}
            className="text-8xl"
          >
            {badge.icon}
          </motion.div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Badge Unlocked!</h2>
            <p className="text-xl font-semibold text-primary-600">
              {badge.name}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              {badge.description}
            </p>
          </div>

          <Button onClick={onClose}>Awesome!</Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
```

---

### Leaderboard

Display rankings with animations.

**Usage:**
```tsx
import { Leaderboard } from '@/components/gamification'

<Leaderboard
  scope="course"
  courseId="course_123"
  timeframe="month"
/>
```

**Implementation:**
```tsx
'use client'

import { motion } from 'motion/react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Trophy } from 'lucide-react'

export function Leaderboard({ scope, courseId, timeframe }) {
  const { data: leaders, isLoading } = useLeaderboard({ scope, courseId, timeframe })

  if (isLoading) return <LeaderboardSkeleton />

  return (
    <div className="space-y-2">
      {leaders.map((user, index) => (
        <motion.div
          key={user.id}
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: index * 0.05 }}
          className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border hover:shadow-md transition-shadow"
        >
          {/* Rank */}
          <div className="flex items-center justify-center w-8">
            {index < 3 ? (
              <span className="text-2xl">
                {['🥇', '🥈', '🥉'][index]}
              </span>
            ) : (
              <span className="text-lg font-bold text-gray-400">
                #{index + 1}
              </span>
            )}
          </div>

          {/* Avatar */}
          <Avatar>
            <AvatarImage src={user.avatar_url} />
            <AvatarFallback>{user.name[0]}</AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="flex-1">
            <p className="font-semibold">{user.name}</p>
            <p className="text-sm text-gray-500">
              Level {user.level} • {user.total_xp.toLocaleString()} XP
            </p>
          </div>

          {/* Badge count */}
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Trophy className="h-4 w-4" />
            <span>{user.badges_count}</span>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
```

---

## AI Components

### AIChatWidget

Floating AI assistant widget.

**Location:** `components/ai/chat-widget.tsx`

**Usage:**
```tsx
import { AIChatWidget } from '@/components/ai'

<AIChatWidget courseId="course_123" />
```

**Key Features:**
- Floating button that expands to chat
- Conversation history
- Source citations from course content
- Typing indicators
- Message bubbles with markdown support
- Minimize/maximize animations

---

## Video Components

### VideoPlayer

HLS video player with custom controls.

**Usage:**
```tsx
import { VideoPlayer } from '@/components/video'

<VideoPlayer
  src="https://cdn.example.com/videos/lesson_123/master.m3u8"
  poster="https://cdn.example.com/thumbnails/lesson_123.jpg"
  onProgress={(time) => saveProgress(time)}
  onComplete={() => markComplete()}
  startTime={savedProgress}
/>
```

**Features:**
- HLS adaptive streaming
- Custom controls (play, pause, volume, fullscreen)
- Quality selector
- Playback speed control
- Keyboard shortcuts
- Progress tracking
- Resume from last position

---

## Animation Patterns

### Fade In On Scroll

```tsx
import { motion } from 'motion/react'

<motion.div
  initial={{ opacity: 0, y: 50 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: '-100px' }}
  transition={{ duration: 0.6 }}
>
  {children}
</motion.div>
```

### Stagger Children

```tsx
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

<motion.div variants={container} initial="hidden" animate="show">
  {items.map(item => (
    <motion.div key={item.id} variants={item}>
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

### Hover Scale

```tsx
<motion.div
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  transition={{ type: 'spring', stiffness: 400 }}
>
  {children}
</motion.div>
```

---

## Accessibility Guidelines

### Keyboard Navigation

All interactive components must support keyboard navigation:

- **Tab**: Move focus forward
- **Shift + Tab**: Move focus backward
- **Enter/Space**: Activate buttons
- **Escape**: Close dialogs/modals
- **Arrow keys**: Navigate lists/menus

### ARIA Labels

```tsx
// Button with icon only
<button aria-label="Close dialog">
  <XIcon />
</button>

// Loading state
<button disabled aria-busy="true">
  <span className="sr-only">Loading...</span>
  <Spinner />
</button>

// Navigation
<nav aria-label="Course modules">
  <ul role="list">
    {modules.map(module => (
      <li key={module.id}>
        <a href={`#${module.id}`}>{module.title}</a>
      </li>
    ))}
  </ul>
</nav>
```

### Color Contrast

Maintain WCAG AA compliance (4.5:1 ratio for normal text):

```css
/* Good - 15:1 ratio */
.text-primary {
  color: #1a1a1a; /* on white background */
}

/* Bad - 2:1 ratio */
.text-gray {
  color: #cccccc; /* on white background */
}
```

### Focus Indicators

```css
/* Custom focus ring */
.focus-visible:focus {
  outline: 2px solid theme('colors.primary.500');
  outline-offset: 2px;
}
```

---

## Component Checklist

When creating new components, ensure:

- [ ] TypeScript types defined
- [ ] Props documented
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Dark mode support
- [ ] Keyboard navigation
- [ ] ARIA labels where needed
- [ ] Loading states
- [ ] Error states
- [ ] Animations (where appropriate)
- [ ] Tests written
- [ ] Storybook story (if applicable)

---

*Last Updated: November 19, 2025*
