import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate input
    const { email, password } = signUpSchema.parse(body)

    const supabase = await createClient()

    // Create auth user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // Create user profile in our database
    if (data.user) {
      await db.insert(users).values({
        id: data.user.id,
        email: data.user.email!,
        role: 'student',
      })
    }

    return NextResponse.json(
      {
        message: 'Sign up successful. Please check your email for verification.',
        user: data.user
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Sign up error:', error)
    return NextResponse.json(
      { error: 'An error occurred during sign up' },
      { status: 500 }
    )
  }
}
