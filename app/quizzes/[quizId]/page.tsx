'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { QuizQuestion } from '@/components/quiz/quiz-question'
import { QuizResults } from '@/components/quiz/quiz-results'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

export default function QuizPage({
  params,
}: {
  params: { quizId: string }
}) {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [startTime] = useState(Date.now())

  // Mock quiz data - in production, fetch from API
  const quiz = {
    id: params.quizId,
    title: 'React Fundamentals Quiz',
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
        type: 'true_false' as const,
        question: 'React uses a virtual DOM',
        options: ['True', 'False'],
        correct_answer: 'True',
        explanation: 'React uses a virtual DOM to efficiently update the actual DOM.',
        points: 1,
      },
    ],
  }

  const handleAnswer = (answer: string, isCorrect: boolean) => {
    const newAnswers = { ...answers, [quiz.questions[currentQuestion].id]: answer }
    setAnswers(newAnswers)

    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // Submit quiz
      submitQuiz(newAnswers)
    }
  }

  const submitQuiz = async (finalAnswers: Record<string, string>) => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000)

    try {
      const response = await fetch(`/api/quizzes/${params.quizId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: finalAnswers }),
      })

      const data = await response.json()

      setResults({
        score: data.correct_answers,
        totalQuestions: data.total_questions,
        passingScore: quiz.passing_score,
        timeSpent,
        xpEarned: data.xp_earned,
      })
      setShowResults(true)
    } catch (error) {
      console.error('Failed to submit quiz:', error)
    }
  }

  if (showResults && results) {
    return (
      <div className="container py-12">
        <QuizResults
          {...results}
          onRetry={() => {
            setCurrentQuestion(0)
            setAnswers({})
            setShowResults(false)
            setResults(null)
          }}
          onContinue={() => router.back()}
        />
      </div>
    )
  }

  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100

  return (
    <div className="container max-w-3xl py-12">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">{quiz.title}</h1>
        <p className="text-muted-foreground">
          Answer all questions correctly to pass (passing score: {quiz.passing_score}%)
        </p>
      </div>

      {/* Progress */}
      <Card className="mb-6 p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium">Progress</span>
          <span className="text-muted-foreground">
            Question {currentQuestion + 1} of {quiz.questions.length}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </Card>

      {/* Question */}
      <QuizQuestion
        question={quiz.questions[currentQuestion]}
        questionNumber={currentQuestion + 1}
        totalQuestions={quiz.questions.length}
        onAnswer={handleAnswer}
      />
    </div>
  )
}
