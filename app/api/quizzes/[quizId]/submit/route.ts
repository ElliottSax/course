import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { db } from '@/lib/db'
import { quiz_attempts, xp_transactions } from '@/db/schema'
import { authOptions } from '@/lib/auth'
import { eq } from 'drizzle-orm'

// POST /api/quizzes/:quizId/submit - Submit quiz attempt
const submitQuizSchema = z.object({
  answers: z.record(z.string()), // { questionId: answer }
})

export async function POST(
  req: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const result = submitQuizSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.errors },
        { status: 400 }
      )
    }

    const { answers } = result.data

    // Get quiz with questions
    const quiz = await db.query.quizzes.findFirst({
      where: eq(db.schema.quizzes.id, params.quizId),
    })

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
    }

    // Calculate score
    let correctAnswers = 0
    const questions = quiz.questions as any[]

    questions.forEach((question: any) => {
      if (answers[question.id] === question.correct_answer) {
        correctAnswers++
      }
    })

    const score = Math.round((correctAnswers / questions.length) * 100)
    const passed = score >= quiz.passing_score

    // Save attempt
    const [attempt] = await db
      .insert(quiz_attempts)
      .values({
        quiz_id: params.quizId,
        student_id: session.user.id,
        score,
        passed,
        answers,
      })
      .returning()

    // Award XP based on performance
    let xpAmount = 0
    if (passed) {
      if (score === 100) {
        xpAmount = 100 // Perfect score
      } else {
        xpAmount = 50 // Passed
      }

      await db.insert(xp_transactions).values({
        user_id: session.user.id,
        amount: xpAmount,
        action: score === 100 ? 'PERFECT_QUIZ' : 'COMPLETE_QUIZ',
        metadata: { quiz_id: params.quizId, score },
      })
    }

    return NextResponse.json({
      attempt,
      xp_earned: xpAmount,
      correct_answers: correctAnswers,
      total_questions: questions.length,
    })
  } catch (error) {
    console.error('Error submitting quiz:', error)
    return NextResponse.json(
      { error: 'Failed to submit quiz' },
      { status: 500 }
    )
  }
}
