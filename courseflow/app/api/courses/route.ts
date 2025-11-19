import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { courses, users } from '@/lib/db/schema'
import { requireAuth, requireRole } from '@/lib/auth'
import { z } from 'zod'
import { eq, desc, and } from 'drizzle-orm'

const createCourseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
  price: z.number().int().min(0).max(1000000), // Max $10,000
  category: z.string().optional(),
  tags: z.array(z.string()).max(10).optional(),
})

// GET /api/courses - List all published courses
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where conditions
    const whereConditions = category
      ? and(eq(courses.status, 'published'), eq(courses.category, category))
      : eq(courses.status, 'published')

    const coursesList = await db
      .select({
        id: courses.id,
        title: courses.title,
        description: courses.description,
        price: courses.price,
        category: courses.category,
        tags: courses.tags,
        thumbnailUrl: courses.thumbnailUrl,
        createdAt: courses.createdAt,
        instructor: {
          id: users.id,
          email: users.email,
        },
      })
      .from(courses)
      .leftJoin(users, eq(courses.instructorId, users.id))
      .where(whereConditions)
      .orderBy(desc(courses.createdAt))
      .limit(limit)
      .offset(offset)

    return NextResponse.json({ courses: coursesList })
  } catch (error) {
    console.error('Get courses error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    )
  }
}

// POST /api/courses - Create a new course (instructors only)
export async function POST(request: Request) {
  try {
    const user = await requireRole(['instructor', 'admin'])

    const body = await request.json()
    const { title, description, price, category, tags } = createCourseSchema.parse(body)

    const [course] = await db
      .insert(courses)
      .values({
        instructorId: user.id,
        title,
        description,
        price,
        category,
        tags,
        status: 'draft',
      })
      .returning()

    return NextResponse.json({ course }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    if ((error as Error).message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'You must be logged in' },
        { status: 401 }
      )
    }

    if ((error as Error).message === 'Forbidden: Insufficient permissions') {
      return NextResponse.json(
        { error: 'Only instructors can create courses' },
        { status: 403 }
      )
    }

    console.error('Create course error:', error)
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    )
  }
}
