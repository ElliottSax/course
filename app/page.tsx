import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative flex flex-1 items-center justify-center overflow-hidden bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container px-4 py-24 text-center">
          <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
            Learn Anything,{' '}
            <span className="gradient-text">Anywhere</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Next-generation online learning platform with AI-powered tutoring,
            interactive courses, and gamification that keeps you motivated.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" asChild>
              <Link href="/courses">Explore Courses</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Get Started Free</Link>
            </Button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute left-0 top-0 h-full w-full overflow-hidden opacity-50">
          <div className="absolute -left-4 top-0 h-72 w-72 rounded-full bg-purple-300 blur-3xl dark:bg-purple-900" />
          <div className="absolute -right-4 bottom-0 h-72 w-72 rounded-full bg-blue-300 blur-3xl dark:bg-blue-900" />
        </div>
      </section>
    </div>
  )
}
