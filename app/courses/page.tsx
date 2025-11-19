import { Suspense } from 'react'
import { CourseGrid } from '@/components/course/course-grid'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

async function getCourses(searchParams: any) {
  // In a real app, this would fetch from the API
  // For now, return empty array - will be populated when database is set up
  return []
}

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: { search?: string; category?: string }
}) {
  const courses = await getCourses(searchParams)

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="mb-4 text-4xl font-bold">Explore Courses</h1>
        <p className="text-lg text-muted-foreground">
          Discover courses that will help you learn new skills and advance your career
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            className="pl-10"
            defaultValue={searchParams.search}
          />
        </div>
        <Button>Search</Button>
      </div>

      {/* Category Filters */}
      <div className="mb-8 flex flex-wrap gap-2">
        {['All', 'Web Development', 'Programming', 'Design', 'Business'].map((category) => (
          <Button
            key={category}
            variant={!searchParams.category && category === 'All' ? 'default' : 'outline'}
            size="sm"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Course Grid */}
      <Suspense fallback={<div>Loading courses...</div>}>
        <CourseGrid courses={courses} />
      </Suspense>
    </div>
  )
}
