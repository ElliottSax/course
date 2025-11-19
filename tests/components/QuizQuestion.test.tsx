/**
 * Unit tests for QuizQuestion component
 */

import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../utils/test-helpers'

// Mock QuizQuestion component
interface QuizQuestionProps {
  question: {
    id: string
    type: 'multiple_choice' | 'true_false'
    question: string
    options: string[]
    points: number
  }
  selectedAnswer?: string
  onAnswerSelect: (answer: string) => void
  showFeedback?: boolean
  isCorrect?: boolean
}

function QuizQuestion({
  question,
  selectedAnswer,
  onAnswerSelect,
  showFeedback = false,
  isCorrect = false,
}: QuizQuestionProps) {
  return (
    <div data-testid="quiz-question">
      <h3>{question.question}</h3>
      <p data-testid="question-points">{question.points} point{question.points !== 1 ? 's' : ''}</p>

      <div role="radiogroup" aria-label={question.question}>
        {question.options.map((option, index) => (
          <label key={index} data-testid={`option-${index}`}>
            <input
              type="radio"
              name={question.id}
              value={option}
              checked={selectedAnswer === option}
              onChange={() => onAnswerSelect(option)}
              disabled={showFeedback}
            />
            {option}
          </label>
        ))}
      </div>

      {showFeedback && (
        <div data-testid="feedback" className={isCorrect ? 'correct' : 'incorrect'}>
          {isCorrect ? '✅ Correct!' : '❌ Incorrect'}
        </div>
      )}
    </div>
  )
}

describe('QuizQuestion', () => {
  const mockQuestion = {
    id: 'q1',
    type: 'multiple_choice' as const,
    question: 'What is 2 + 2?',
    options: ['3', '4', '5', '6'],
    points: 1,
  }

  it('renders question text and options', () => {
    const handleAnswerSelect = jest.fn()
    renderWithProviders(
      <QuizQuestion question={mockQuestion} onAnswerSelect={handleAnswerSelect} />
    )

    expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('6')).toBeInTheDocument()
  })

  it('displays points correctly', () => {
    const handleAnswerSelect = jest.fn()
    renderWithProviders(
      <QuizQuestion question={mockQuestion} onAnswerSelect={handleAnswerSelect} />
    )

    expect(screen.getByTestId('question-points')).toHaveTextContent('1 point')
  })

  it('handles answer selection', () => {
    const handleAnswerSelect = jest.fn()
    renderWithProviders(
      <QuizQuestion question={mockQuestion} onAnswerSelect={handleAnswerSelect} />
    )

    const option = screen.getByLabelText('4')
    fireEvent.click(option)

    expect(handleAnswerSelect).toHaveBeenCalledWith('4')
  })

  it('shows selected answer', () => {
    const handleAnswerSelect = jest.fn()
    renderWithProviders(
      <QuizQuestion
        question={mockQuestion}
        selectedAnswer="4"
        onAnswerSelect={handleAnswerSelect}
      />
    )

    const radioInput = screen.getByLabelText('4') as HTMLInputElement
    expect(radioInput.checked).toBe(true)
  })

  it('shows correct feedback when answer is correct', () => {
    const handleAnswerSelect = jest.fn()
    renderWithProviders(
      <QuizQuestion
        question={mockQuestion}
        selectedAnswer="4"
        onAnswerSelect={handleAnswerSelect}
        showFeedback
        isCorrect
      />
    )

    const feedback = screen.getByTestId('feedback')
    expect(feedback).toHaveTextContent('✅ Correct!')
    expect(feedback).toHaveClass('correct')
  })

  it('shows incorrect feedback when answer is wrong', () => {
    const handleAnswerSelect = jest.fn()
    renderWithProviders(
      <QuizQuestion
        question={mockQuestion}
        selectedAnswer="3"
        onAnswerSelect={handleAnswerSelect}
        showFeedback
        isCorrect={false}
      />
    )

    const feedback = screen.getByTestId('feedback')
    expect(feedback).toHaveTextContent('❌ Incorrect')
    expect(feedback).toHaveClass('incorrect')
  })

  it('disables options when feedback is shown', () => {
    const handleAnswerSelect = jest.fn()
    renderWithProviders(
      <QuizQuestion
        question={mockQuestion}
        selectedAnswer="4"
        onAnswerSelect={handleAnswerSelect}
        showFeedback
        isCorrect
      />
    )

    const radioInputs = screen.getAllByRole('radio')
    radioInputs.forEach((input) => {
      expect(input).toBeDisabled()
    })
  })

  it('renders true/false questions correctly', () => {
    const trueFalseQuestion = {
      id: 'q2',
      type: 'true_false' as const,
      question: 'React uses a virtual DOM',
      options: ['True', 'False'],
      points: 1,
    }

    const handleAnswerSelect = jest.fn()
    renderWithProviders(
      <QuizQuestion question={trueFalseQuestion} onAnswerSelect={handleAnswerSelect} />
    )

    expect(screen.getByText('React uses a virtual DOM')).toBeInTheDocument()
    expect(screen.getByText('True')).toBeInTheDocument()
    expect(screen.getByText('False')).toBeInTheDocument()
  })

  it('uses proper ARIA attributes for accessibility', () => {
    const handleAnswerSelect = jest.fn()
    renderWithProviders(
      <QuizQuestion question={mockQuestion} onAnswerSelect={handleAnswerSelect} />
    )

    const radioGroup = screen.getByRole('radiogroup')
    expect(radioGroup).toHaveAttribute('aria-label', 'What is 2 + 2?')
  })
})
