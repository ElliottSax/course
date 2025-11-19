'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface QuizQuestionProps {
  question: {
    id: string
    type: 'multiple_choice' | 'true_false'
    question: string
    options: string[]
    correct_answer: string
    explanation: string
    points: number
  }
  questionNumber: number
  totalQuestions: number
  onAnswer: (answer: string, isCorrect: boolean) => void
  disabled?: boolean
}

export function QuizQuestion({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  disabled = false,
}: QuizQuestionProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)

  const handleSubmit = () => {
    if (!selectedAnswer) return

    const isCorrect = selectedAnswer === question.correct_answer
    setShowFeedback(true)

    // Delay before calling onAnswer to show feedback
    setTimeout(() => {
      onAnswer(selectedAnswer, isCorrect)
      setSelectedAnswer(null)
      setShowFeedback(false)
    }, 2000)
  }

  return (
    <Card className="p-6">
      {/* Question Header */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Question {questionNumber} of {totalQuestions}
          </span>
          <span>{question.points} point{question.points !== 1 ? 's' : ''}</span>
        </div>
        <h3 className="text-xl font-semibold">{question.question}</h3>
      </div>

      {/* Options */}
      <div className="mb-6 space-y-3">
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === option
          const isCorrect = option === question.correct_answer
          const showCorrect = showFeedback && isCorrect
          const showIncorrect = showFeedback && isSelected && !isCorrect

          return (
            <button
              key={index}
              onClick={() => !showFeedback && !disabled && setSelectedAnswer(option)}
              disabled={showFeedback || disabled}
              className={cn(
                'w-full rounded-lg border-2 p-4 text-left transition-all',
                'hover:border-primary hover:bg-primary/5',
                isSelected && !showFeedback && 'border-primary bg-primary/10',
                showCorrect && 'border-green-500 bg-green-50 dark:bg-green-900/20',
                showIncorrect && 'border-red-500 bg-red-50 dark:bg-red-900/20',
                (showFeedback || disabled) && 'cursor-not-allowed'
              )}
            >
              <div className="flex items-center justify-between">
                <span className={cn(
                  'font-medium',
                  showCorrect && 'text-green-700 dark:text-green-400',
                  showIncorrect && 'text-red-700 dark:text-red-400'
                )}>
                  {option}
                </span>
                {showCorrect && (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                )}
                {showIncorrect && (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Explanation */}
      {showFeedback && (
        <div
          className={cn(
            'mb-4 rounded-lg p-4',
            selectedAnswer === question.correct_answer
              ? 'bg-green-50 dark:bg-green-900/20'
              : 'bg-red-50 dark:bg-red-900/20'
          )}
        >
          <p className="text-sm font-medium">
            {selectedAnswer === question.correct_answer ? '✅ Correct!' : '❌ Incorrect'}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{question.explanation}</p>
        </div>
      )}

      {/* Submit Button */}
      {!showFeedback && (
        <Button
          onClick={handleSubmit}
          disabled={!selectedAnswer || disabled}
          className="w-full"
        >
          Submit Answer
        </Button>
      )}
    </Card>
  )
}
