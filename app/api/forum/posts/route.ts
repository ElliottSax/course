import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { db } from '@/lib/db'
import { forum_posts } from '@/db/schema'
import { authOptions } from '@/lib/auth'
import { desc } from 'drizzle-orm'

// GET /api/forum/posts - List forum posts
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '20')

    const posts = await db.query.forum_posts.findMany({
      where: category ? { category } : undefined,
      with: {
        author: {
          columns: {
            id: true,
            name: true,
            avatar_url: true,
          },
        },
      },
      orderBy: [desc(forum_posts.created_at)],
      limit,
    })

    return NextResponse.json({ posts })
  } catch (error) {
    console.error('Error fetching forum posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

// POST /api/forum/posts - Create forum post
const createPostSchema = z.object({
  course_id: z.string().optional(),
  title: z.string().min(5).max(200),
  content: z.string().min(10).max(10000),
  category: z.enum(['question', 'discussion', 'announcement']),
  tags: z.array(z.string()).max(5).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const result = createPostSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.errors },
        { status: 400 }
      )
    }

    const { title, content, category, tags, course_id } = result.data

    const [post] = await db
      .insert(forum_posts)
      .values({
        author_id: session.user.id,
        course_id,
        title,
        content,
        category,
        tags: tags || [],
      })
      .returning()

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('Error creating forum post:', error)
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}
