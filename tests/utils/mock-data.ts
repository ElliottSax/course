/**
 * Mock Data for Testing
 * Centralized mock data that can be reused across tests
 */

export const mockUsers = {
  student: {
    id: 'student-123',
    email: 'student@example.com',
    name: 'Alice Student',
    role: 'student' as const,
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    bio: 'Aspiring web developer',
    created_at: new Date('2025-01-01'),
    updated_at: new Date('2025-01-01'),
  },
  instructor: {
    id: 'instructor-456',
    email: 'instructor@example.com',
    name: 'Bob Instructor',
    role: 'instructor' as const,
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
    bio: 'Expert React developer with 10+ years experience',
    created_at: new Date('2024-12-01'),
    updated_at: new Date('2024-12-01'),
  },
  admin: {
    id: 'admin-789',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin' as const,
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    bio: 'Platform administrator',
    created_at: new Date('2024-11-01'),
    updated_at: new Date('2024-11-01'),
  },
}

export const mockCourses = [
  {
    id: 'course-1',
    instructor_id: 'instructor-456',
    title: 'Introduction to React',
    description: 'Learn React from scratch with hands-on projects',
    thumbnail_url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
    price: 9900,
    category: 'web-development',
    is_published: true,
    created_at: new Date('2025-01-01'),
    updated_at: new Date('2025-01-01'),
  },
  {
    id: 'course-2',
    instructor_id: 'instructor-456',
    title: 'Advanced TypeScript',
    description: 'Master TypeScript with real-world examples',
    thumbnail_url: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800',
    price: 14900,
    category: 'programming',
    is_published: true,
    created_at: new Date('2025-01-05'),
    updated_at: new Date('2025-01-05'),
  },
  {
    id: 'course-3',
    instructor_id: 'instructor-456',
    title: 'Free JavaScript Course',
    description: 'Learn JavaScript fundamentals - completely free!',
    thumbnail_url: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800',
    price: 0,
    category: 'programming',
    is_published: true,
    created_at: new Date('2025-01-10'),
    updated_at: new Date('2025-01-10'),
  },
]

export const mockLessons = [
  {
    id: 'lesson-1',
    course_id: 'course-1',
    title: 'Introduction to React',
    content: '<h1>Welcome to React</h1><p>Learn the basics of React...</p>',
    video_url: 'https://example.com/videos/react-intro.m3u8',
    duration: 600,
    order: 1,
    is_free_preview: true,
    created_at: new Date('2025-01-01'),
  },
  {
    id: 'lesson-2',
    course_id: 'course-1',
    title: 'React Components',
    content: '<h1>Understanding Components</h1><p>Build your first component...</p>',
    video_url: 'https://example.com/videos/react-components.m3u8',
    duration: 900,
    order: 2,
    is_free_preview: false,
    created_at: new Date('2025-01-01'),
  },
  {
    id: 'lesson-3',
    course_id: 'course-1',
    title: 'React Hooks',
    content: '<h1>React Hooks Deep Dive</h1><p>Master useState and useEffect...</p>',
    video_url: 'https://example.com/videos/react-hooks.m3u8',
    duration: 1200,
    order: 3,
    is_free_preview: false,
    created_at: new Date('2025-01-01'),
  },
]

export const mockQuizzes = [
  {
    id: 'quiz-1',
    lesson_id: 'lesson-1',
    title: 'React Basics Quiz',
    time_limit: 600,
    passing_score: 70,
    questions: [
      {
        id: 'q1',
        type: 'multiple_choice' as const,
        question: 'What is React?',
        options: [
          'A JavaScript library for building UIs',
          'A database',
          'A CSS framework',
          'A server framework',
        ],
        correct_answer: 'A JavaScript library for building UIs',
        explanation: 'React is a JavaScript library developed by Facebook for building user interfaces.',
        points: 1,
      },
      {
        id: 'q2',
        type: 'multiple_choice' as const,
        question: 'What are React components?',
        options: [
          'Reusable pieces of UI',
          'Database tables',
          'CSS classes',
          'API endpoints',
        ],
        correct_answer: 'Reusable pieces of UI',
        explanation: 'React components are reusable pieces of code that return React elements.',
        points: 1,
      },
      {
        id: 'q3',
        type: 'true_false' as const,
        question: 'React uses a virtual DOM',
        options: ['True', 'False'],
        correct_answer: 'True',
        explanation: 'React uses a virtual DOM to efficiently update the actual DOM.',
        points: 1,
      },
    ],
    created_at: new Date('2025-01-01'),
  },
]

export const mockEnrollments = [
  {
    id: 'enrollment-1',
    student_id: 'student-123',
    course_id: 'course-1',
    enrolled_at: new Date('2025-01-15'),
    completed_at: null,
    progress: 33,
  },
  {
    id: 'enrollment-2',
    student_id: 'student-123',
    course_id: 'course-3',
    enrolled_at: new Date('2025-01-12'),
    completed_at: new Date('2025-01-18'),
    progress: 100,
  },
]

export const mockLessonProgress = [
  {
    id: 'progress-1',
    student_id: 'student-123',
    lesson_id: 'lesson-1',
    completed: true,
    watch_time: 600,
    last_position: 600,
    completed_at: new Date('2025-01-15'),
    updated_at: new Date('2025-01-15'),
  },
  {
    id: 'progress-2',
    student_id: 'student-123',
    lesson_id: 'lesson-2',
    completed: false,
    watch_time: 300,
    last_position: 300,
    completed_at: null,
    updated_at: new Date('2025-01-16'),
  },
]

export const mockXPTransactions = [
  {
    id: 'xp-1',
    user_id: 'student-123',
    amount: 50,
    action: 'COMPLETE_LESSON' as const,
    metadata: { lesson_id: 'lesson-1' },
    created_at: new Date('2025-01-15'),
  },
  {
    id: 'xp-2',
    user_id: 'student-123',
    amount: 100,
    action: 'COMPLETE_QUIZ' as const,
    metadata: { quiz_id: 'quiz-1', score: 100 },
    created_at: new Date('2025-01-15'),
  },
  {
    id: 'xp-3',
    user_id: 'student-123',
    amount: 25,
    action: 'DAILY_STREAK' as const,
    metadata: { streak: 7 },
    created_at: new Date('2025-01-16'),
  },
]

export const mockBadges = [
  {
    id: 'badge-1',
    user_id: 'student-123',
    badge_id: 'first_lesson',
    unlocked_at: new Date('2025-01-15'),
  },
  {
    id: 'badge-2',
    user_id: 'student-123',
    badge_id: 'perfect_week',
    unlocked_at: new Date('2025-01-16'),
  },
]

export const mockForumPosts = [
  {
    id: 'post-1',
    course_id: 'course-1',
    author_id: 'student-123',
    title: 'How do I use useState?',
    content: 'I\'m having trouble understanding when to use useState...',
    category: 'question' as const,
    tags: ['react', 'hooks', 'beginner'],
    upvotes: 5,
    is_answered: true,
    best_answer_id: 'reply-1',
    created_at: new Date('2025-01-15'),
    updated_at: new Date('2025-01-15'),
  },
]

export const mockForumReplies = [
  {
    id: 'reply-1',
    post_id: 'post-1',
    author_id: 'instructor-456',
    content: 'useState is a Hook that lets you add state to functional components...',
    upvotes: 8,
    is_best_answer: true,
    created_at: new Date('2025-01-15'),
    updated_at: new Date('2025-01-15'),
  },
]

export const mockQuizAttempts = [
  {
    id: 'attempt-1',
    quiz_id: 'quiz-1',
    student_id: 'student-123',
    score: 100,
    passed: true,
    answers: {
      q1: 'A JavaScript library for building UIs',
      q2: 'Reusable pieces of UI',
      q3: 'True',
    },
    submitted_at: new Date('2025-01-15'),
  },
]

/**
 * Badge definitions (not stored in DB, defined in code)
 */
export const BADGE_DEFINITIONS = {
  first_lesson: {
    id: 'first_lesson',
    name: 'First Steps',
    description: 'Complete your first lesson',
    icon: '🎯',
    xp_reward: 10,
  },
  perfect_week: {
    id: 'perfect_week',
    name: 'Perfect Week',
    description: 'Complete lessons 7 days in a row',
    icon: '🔥',
    xp_reward: 50,
  },
  course_complete: {
    id: 'course_complete',
    name: 'Course Master',
    description: 'Complete your first course',
    icon: '🏆',
    xp_reward: 200,
  },
  quiz_ace: {
    id: 'quiz_ace',
    name: 'Quiz Ace',
    description: 'Score 100% on a quiz',
    icon: '⭐',
    xp_reward: 25,
  },
}
