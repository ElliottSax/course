import { createClient as createBrowserClient } from './supabase/client'
import { createClient as createServerClient } from './supabase/server'
import { db } from './db'
import { users } from './db/schema'
import { eq } from 'drizzle-orm'

// Client-side auth functions
export async function signUp(email: string, password: string) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) throw error

  // Create user profile in our database
  if (data.user) {
    await db.insert(users).values({
      id: data.user.id,
      email: data.user.email!,
      role: 'student',
    })
  }

  return data
}

export async function signIn(email: string, password: string) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error

  return data
}

export async function signOut() {
  const supabase = createBrowserClient()

  const { error } = await supabase.auth.signOut()

  if (error) throw error
}

export async function resetPassword(email: string) {
  const supabase = createBrowserClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  })

  if (error) throw error
}

export async function updatePassword(newPassword: string) {
  const supabase = createBrowserClient()

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) throw error
}

// Server-side auth functions
export async function getUser() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get user profile from our database
  const [userProfile] = await db
    .select()
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1)

  return userProfile || null
}

export async function requireAuth() {
  const user = await getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  return user
}

export async function requireRole(allowedRoles: string[]) {
  const user = await requireAuth()

  if (!allowedRoles.includes(user.role)) {
    throw new Error('Forbidden: Insufficient permissions')
  }

  return user
}
