import { CourseCard } from '@/components/courses/course-card'

async function getCourses() {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'

  try {
    const response = await fetch(`${baseUrl}/api/courses`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error('Failed to fetch courses')
    }

    const data = await response.json()
    return data.courses
  } catch (error) {
    console.error('Error fetching courses:', error)
    return []
  }
}

export default async function CoursesPage() {
  const courses = await getCourses()

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Browse Courses</h1>
        <p className="text-muted-foreground text-lg">
          Discover your next learning adventure
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold mb-2">No courses yet</h2>
          <p className="text-muted-foreground">
            Check back soon for new courses!
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course: any) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  )
}
