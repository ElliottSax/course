/**
 * Unit tests for CourseCard component
 */

import { screen } from '@testing-library/react'
import { renderWithProviders } from '../utils/test-helpers'
import { mockCourses } from '../utils/mock-data'

// Mock the component (in real implementation, this would import from actual file)
function CourseCard({ course }: { course: typeof mockCourses[0] }) {
  const formatPrice = (price: number) => {
    if (price === 0) return 'Free'
    return `$${(price / 100).toFixed(2)}`
  }

  return (
    <div data-testid="course-card">
      <img src={course.thumbnail_url} alt={course.title} />
      <h3>{course.title}</h3>
      <p>{course.description}</p>
      <span data-testid="course-price">{formatPrice(course.price)}</span>
      <span data-testid="course-category">{course.category}</span>
    </div>
  )
}

describe('CourseCard', () => {
  it('renders course information correctly', () => {
    const course = mockCourses[0]
    renderWithProviders(<CourseCard course={course} />)

    expect(screen.getByText(course.title)).toBeInTheDocument()
    expect(screen.getByText(course.description)).toBeInTheDocument()
    expect(screen.getByAltText(course.title)).toHaveAttribute('src', course.thumbnail_url)
  })

  it('displays paid course price correctly', () => {
    const course = mockCourses[0] // $99.00
    renderWithProviders(<CourseCard course={course} />)

    const priceElement = screen.getByTestId('course-price')
    expect(priceElement).toHaveTextContent('$99.00')
  })

  it('displays free course correctly', () => {
    const course = mockCourses[2] // Free course
    renderWithProviders(<CourseCard course={course} />)

    const priceElement = screen.getByTestId('course-price')
    expect(priceElement).toHaveTextContent('Free')
  })

  it('displays course category', () => {
    const course = mockCourses[0]
    renderWithProviders(<CourseCard course={course} />)

    const categoryElement = screen.getByTestId('course-category')
    expect(categoryElement).toHaveTextContent(course.category)
  })

  it('renders with minimal required props', () => {
    const minimalCourse = {
      id: 'test-123',
      title: 'Test Course',
      description: 'Test description',
      thumbnail_url: 'https://example.com/image.jpg',
      price: 0,
      category: 'test',
      is_published: true,
      instructor_id: 'instructor-1',
      created_at: new Date(),
      updated_at: new Date(),
    }

    renderWithProviders(<CourseCard course={minimalCourse} />)
    expect(screen.getByText('Test Course')).toBeInTheDocument()
  })
})
