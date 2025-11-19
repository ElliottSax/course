import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { db } from '@/lib/db'
import { courses } from '@/db/schema'
import { authOptions } from '@/lib/auth'
import { eq, desc, and, ilike, or } from 'drizzle-orm'

// GET /api/courses - List all published courses
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '12')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = db.query.courses.findMany({
      where: and(
        eq(courses.is_published, true),
        category ? eq(courses.category, category) : undefined,
        search
          ? or(
              ilike(courses.title, `%${search}%`),
              ilike(courses.description, `%${search}%`)
            )
          : undefined
      ),
      with: {
        instructor: {
          columns: {
            id: true,
            name: true,
            avatar_url: true,
          },
        },
      },
      orderBy: [desc(courses.created_at)],
      limit,
      offset,
    })

    const coursesList = await query

    return NextResponse.json({
      courses: coursesList,
      pagination: {
        limit,
        offset,
        total: coursesList.length,
      },
    })
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    )
  }
}

// POST /api/courses - Create a new course (instructors only)
const createCourseSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(5000),
  thumbnail_url: z.string().url().optional(),
  price: z.number().int().min(0).max(1000000),
  category: z.string().min(1),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is instructor or admin
    if (session.user.role !== 'instructor' && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const result = createCourseSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.errors },
        { status: 400 }
      )
    }

    const { title, description, thumbnail_url, price, category } = result.data

    const [course] = await db
      .insert(courses)
      .values({
        instructor_id: session.user.id,
        title,
        description,
        thumbnail_url,
        price,
        category,
        is_published: false,
      })
      .returning()

    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    console.error('Error creating course:', error)
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    )
  }
}
