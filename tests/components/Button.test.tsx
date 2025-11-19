/**
 * Unit tests for Button component
 */

import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../utils/test-helpers'

// Mock Button component (in real implementation, this would be from shadcn/ui)
interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'default' | 'destructive' | 'outline' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

function Button({
  children,
  onClick,
  variant = 'default',
  size = 'default',
  disabled = false,
  type = 'button',
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      data-size={size}
      className={`btn btn-${variant} btn-${size}`}
    >
      {children}
    </button>
  )
}

describe('Button', () => {
  it('renders children correctly', () => {
    renderWithProviders(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    renderWithProviders(<Button onClick={handleClick}>Click me</Button>)

    const button = screen.getByText('Click me')
    fireEvent.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('can be disabled', () => {
    const handleClick = jest.fn()
    renderWithProviders(
      <Button onClick={handleClick} disabled>
        Click me
      </Button>
    )

    const button = screen.getByText('Click me')
    expect(button).toBeDisabled()

    fireEvent.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('applies variant classes correctly', () => {
    renderWithProviders(<Button variant="destructive">Delete</Button>)

    const button = screen.getByText('Delete')
    expect(button).toHaveAttribute('data-variant', 'destructive')
    expect(button).toHaveClass('btn-destructive')
  })

  it('applies size classes correctly', () => {
    renderWithProviders(<Button size="lg">Large Button</Button>)

    const button = screen.getByText('Large Button')
    expect(button).toHaveAttribute('data-size', 'lg')
    expect(button).toHaveClass('btn-lg')
  })

  it('supports different button types', () => {
    renderWithProviders(<Button type="submit">Submit</Button>)

    const button = screen.getByText('Submit')
    expect(button).toHaveAttribute('type', 'submit')
  })

  it('renders with default variant when not specified', () => {
    renderWithProviders(<Button>Default</Button>)

    const button = screen.getByText('Default')
    expect(button).toHaveAttribute('data-variant', 'default')
  })

  it('renders with default size when not specified', () => {
    renderWithProviders(<Button>Default Size</Button>)

    const button = screen.getByText('Default Size')
    expect(button).toHaveAttribute('data-size', 'default')
  })
})
