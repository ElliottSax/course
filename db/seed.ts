import { db } from '@/lib/db'
import { users, courses, lessons, enrollments, quizzes, xp_transactions, user_badges } from './schema'

/**
 * Seed database with sample data for development
 * Run with: npm run db:seed
 */
async function seed() {
  console.log('🌱 Seeding database...')

  // Clear existing data (be careful in production!)
  console.log('Clearing existing data...')
  await db.delete(forum_replies)
  await db.delete(forum_posts)
  await db.delete(user_badges)
  await db.delete(xp_transactions)
  await db.delete(quiz_attempts)
  await db.delete(quizzes)
  await db.delete(lesson_progress)
  await db.delete(enrollments)
  await db.delete(lessons)
  await db.delete(courses)
  await db.delete(users)

  // ==========================================
  // Users
  // ==========================================
  console.log('Creating users...')

  const [instructor1, instructor2, student1, student2, admin] = await db.insert(users).values([
    {
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      role: 'instructor',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
      bio: 'Full-stack developer with 10+ years of experience. Passionate about teaching modern web development.',
    },
    {
      email: 'john.doe@example.com',
      name: 'John Doe',
      role: 'instructor',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
      bio: 'Expert in React and TypeScript. Former senior engineer at major tech companies.',
    },
    {
      email: 'alice@example.com',
      name: 'Alice Johnson',
      role: 'student',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
      bio: 'Aspiring web developer learning to code.',
    },
    {
      email: 'bob@example.com',
      name: 'Bob Wilson',
      role: 'student',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
      bio: 'Career changer switching from marketing to software development.',
    },
    {
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
      bio: 'Platform administrator',
    },
  ]).returning()

  console.log('✓ Created 5 users')

  // ==========================================
  // Courses
  // ==========================================
  console.log('Creating courses...')

  const [course1, course2, course3] = await db.insert(courses).values([
    {
      instructor_id: instructor1.id,
      title: 'Introduction to Web Development',
      description: 'Learn the fundamentals of HTML, CSS, and JavaScript. Perfect for beginners looking to start their web development journey.',
      thumbnail_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
      price: 9900, // $99.00
      category: 'web-development',
      is_published: true,
    },
    {
      instructor_id: instructor1.id,
      title: 'Advanced React Patterns',
      description: 'Master advanced React patterns including hooks, context, and performance optimization techniques.',
      thumbnail_url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
      price: 14900, // $149.00
      category: 'web-development',
      is_published: true,
    },
    {
      instructor_id: instructor2.id,
      title: 'TypeScript for Beginners',
      description: 'Learn TypeScript from scratch and add type safety to your JavaScript projects.',
      thumbnail_url: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800',
      price: 7900, // $79.00
      category: 'programming',
      is_published: true,
    },
  ]).returning()

  console.log('✓ Created 3 courses')

  // ==========================================
  // Lessons
  // ==========================================
  console.log('Creating lessons...')

  // Course 1 lessons
  const course1Lessons = await db.insert(lessons).values([
    {
      course_id: course1.id,
      title: 'Introduction to HTML',
      content: '<h1>Welcome to HTML</h1><p>HTML (HyperText Markup Language) is the standard markup language for creating web pages.</p>',
      order: 1,
      is_free_preview: true,
      duration: 600,
    },
    {
      course_id: course1.id,
      title: 'HTML Elements and Tags',
      content: '<h1>HTML Elements</h1><p>Learn about different HTML elements and how to use them effectively.</p>',
      order: 2,
      is_free_preview: true,
      duration: 900,
    },
    {
      course_id: course1.id,
      title: 'CSS Fundamentals',
      content: '<h1>Introduction to CSS</h1><p>CSS (Cascading Style Sheets) is used to style and layout web pages.</p>',
      order: 3,
      is_free_preview: false,
      duration: 1200,
    },
    {
      course_id: course1.id,
      title: 'CSS Flexbox',
      content: '<h1>CSS Flexbox</h1><p>Learn how to create flexible layouts with CSS Flexbox.</p>',
      order: 4,
      is_free_preview: false,
      duration: 1500,
    },
    {
      course_id: course1.id,
      title: 'JavaScript Basics',
      content: '<h1>Introduction to JavaScript</h1><p>JavaScript is a programming language that enables interactive web pages.</p>',
      order: 5,
      is_free_preview: false,
      duration: 1800,
    },
  ]).returning()

  // Course 2 lessons
  const course2Lessons = await db.insert(lessons).values([
    {
      course_id: course2.id,
      title: 'React Hooks Deep Dive',
      content: '<h1>React Hooks</h1><p>Master useState, useEffect, and custom hooks.</p>',
      order: 1,
      is_free_preview: true,
      duration: 2400,
    },
    {
      course_id: course2.id,
      title: 'Context API & State Management',
      content: '<h1>State Management</h1><p>Learn advanced state management with Context API.</p>',
      order: 2,
      is_free_preview: false,
      duration: 2100,
    },
  ]).returning()

  // Course 3 lessons
  const course3Lessons = await db.insert(lessons).values([
    {
      course_id: course3.id,
      title: 'TypeScript Basics',
      content: '<h1>TypeScript Introduction</h1><p>Learn the fundamentals of TypeScript.</p>',
      order: 1,
      is_free_preview: true,
      duration: 1200,
    },
  ]).returning()

  console.log('✓ Created 8 lessons')

  // ==========================================
  // Quizzes
  // ==========================================
  console.log('Creating quizzes...')

  await db.insert(quizzes).values([
    {
      lesson_id: course1Lessons[0].id,
      title: 'HTML Basics Quiz',
      time_limit: 600, // 10 minutes
      passing_score: 70,
      questions: [
        {
          id: 'q1',
          type: 'multiple_choice',
          question: 'What does HTML stand for?',
          options: [
            'Hyper Text Markup Language',
            'High Tech Modern Language',
            'Home Tool Markup Language',
            'Hyperlinks and Text Markup Language',
          ],
          correct_answer: 'Hyper Text Markup Language',
          explanation: 'HTML stands for Hyper Text Markup Language, which is used to structure web pages.',
          points: 1,
        },
        {
          id: 'q2',
          type: 'multiple_choice',
          question: 'Which tag is used for creating a paragraph?',
          options: ['<p>', '<para>', '<paragraph>', '<text>'],
          correct_answer: '<p>',
          explanation: 'The <p> tag is used to define a paragraph in HTML.',
          points: 1,
        },
        {
          id: 'q3',
          type: 'true_false',
          question: 'HTML is a programming language.',
          options: ['True', 'False'],
          correct_answer: 'False',
          explanation: 'HTML is a markup language, not a programming language.',
          points: 1,
        },
      ],
    },
  ])

  console.log('✓ Created 1 quiz')

  // ==========================================
  // Enrollments
  // ==========================================
  console.log('Creating enrollments...')

  await db.insert(enrollments).values([
    {
      student_id: student1.id,
      course_id: course1.id,
      progress: 60,
    },
    {
      student_id: student1.id,
      course_id: course2.id,
      progress: 20,
    },
    {
      student_id: student2.id,
      course_id: course1.id,
      progress: 100,
      completed_at: new Date('2025-11-01'),
    },
    {
      student_id: student2.id,
      course_id: course3.id,
      progress: 50,
    },
  ])

  console.log('✓ Created 4 enrollments')

  // ==========================================
  // XP Transactions
  // ==========================================
  console.log('Creating XP transactions...')

  await db.insert(xp_transactions).values([
    {
      user_id: student1.id,
      amount: 50,
      action: 'COMPLETE_LESSON',
      metadata: { lesson_id: course1Lessons[0].id },
    },
    {
      user_id: student1.id,
      amount: 100,
      action: 'COMPLETE_QUIZ',
      metadata: { quiz_id: 'quiz_1' },
    },
    {
      user_id: student1.id,
      amount: 25,
      action: 'DAILY_STREAK',
      metadata: { streak: 7 },
    },
    {
      user_id: student2.id,
      amount: 50,
      action: 'COMPLETE_LESSON',
      metadata: { lesson_id: course1Lessons[0].id },
    },
    {
      user_id: student2.id,
      amount: 200,
      action: 'COMPLETE_COURSE',
      metadata: { course_id: course1.id },
    },
  ])

  console.log('✓ Created 5 XP transactions')

  // ==========================================
  // Badges
  // ==========================================
  console.log('Creating user badges...')

  await db.insert(user_badges).values([
    {
      user_id: student1.id,
      badge_id: 'first_lesson',
    },
    {
      user_id: student1.id,
      badge_id: 'perfect_week',
    },
    {
      user_id: student2.id,
      badge_id: 'first_lesson',
    },
    {
      user_id: student2.id,
      badge_id: 'course_complete',
    },
  ])

  console.log('✓ Created 4 user badges')

  console.log('✅ Database seeded successfully!')
  console.log('\nTest accounts:')
  console.log('Instructor: jane.smith@example.com')
  console.log('Instructor: john.doe@example.com')
  console.log('Student: alice@example.com')
  console.log('Student: bob@example.com')
  console.log('Admin: admin@example.com')
}

seed()
  .catch((error) => {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  })
  .finally(() => {
    process.exit(0)
  })
